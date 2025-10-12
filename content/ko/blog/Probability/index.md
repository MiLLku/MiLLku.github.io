---
title: 🎲 Unity용 제네릭 확률 시스템 설계하기
summary: C# 제네릭을 활용하여 어떤 Enum 타입이든 대응할 수 있는 확장 가능하고 재사용 가능한 확률 및 뽑기 시스템을 만드는 방법을 알아봅니다.
date: 2025-07-24
authors:
  - admin
tags:
  - '추천'
  - '포토폴리오'
  - '코딩'
image:
  caption: 'Image credit: [**Unsplash**](https://unsplash.com)'
---

## 서론

게임 개발, 특히 RPG나 수집형 게임에서는 다양한 종류의 확률 기반 시스템이 필요합니다. 예를 들어 몬스터의 아이템 드랍, 카드 팩의 등급별 카드, 캐릭터의 특성 부여 등이 있죠. 이러한 시스템들을 각각 별개로 구현하는 것은 비효율적이며 유지보수를 어렵게 만듭니다.

이번 포스트에서는 C#의 제네릭(Generic)을 활용하여 **어떤 종류의 확률 테이블이든 손쉽게 생성하고 관리**할 수 있는 재사용 가능한 확률 시스템을 설계하고 구현하는 방법을 공유하고자 합니다.

## 시스템의 핵심 구성 요소

우리가 만들 시스템은 세 가지 핵심 스크립트로 구성됩니다.

1.  **`IProbabilityEntry.cs`**: 확률을 가질 수 있는 모든 항목의 **규격(Interface)**을 정의합니다.
2.  **`ProbabilitySet<T>`**: 특정 항목(`T`)에 대한 확률 집합을 관리하는 **핵심 로직**입니다. 실제 아이템 뽑기(Sampling)를 담당합니다.
3.  **`ProbabilityManager.cs`**: 게임 내 모든 확률 세트(`ProbabilitySet`)를 초기화하고, 어디서든 쉽게 접근할 수 있도록 돕는 **중앙 관리자(Singleton)**입니다.

이제 각 스크립트의 역할과 코드를 자세히 살펴보겠습니다.

---

### 1. `IProbabilityEntry<T>`: 확률 항목의 기본 틀

먼저, 확률 테이블에 들어갈 각 항목이 어떤 정보를 가져야 하는지 정의하는 인터페이스입니다. `T`는 `CardRankType`이나 `RewardType` 같은 Enum 타입을 의미합니다.

이렇게 인터페이스를 정의하면, 어떤 종류의 확률 아이템이든 일관된 구조를 갖게 되어 `ProbabilitySet`에서 쉽게 처리할 수 있습니다.

```csharp
public interface IProbabilityEntry<T> where T : Enum
{
    T Type { get; } // 아이템의 종류 (Enum)
    float BaseProbability { get; } // 기본 확률
    float PermanentBonus { get; } // 영구적으로 적용될 수 있는 보너스 확률
    bool IsDummy { get; } // 전체 확률의 합이 100%가 되지 않을 경우, 나머지 확률을 채워주는 역할
    bool IsUniqueOnce { get; } // 한 번 뽑히면 다시는 나오지 않아야 하는 아이템인지의 여부
}
```
### 2. `ProbabilityConfig<T, U>`: ScriptableObject를 활용한 설정 관리
다양한 확률 설정 파일들은 모두 비슷한 구조를 가집니다. 코드 중복을 피하고 일관성을 유지하기 위해, 모든 확률 설정 ScriptableObject가 상속받을 제네릭 기반 클래스를 만듭니다.

이 추상 클래스는 확률 데이터 리스트(entries)를 내장하고 있어, 자식 클래스에서는 어떤 데이터를 담을지만 정의하면 됩니다.
```csharp
public abstract class ProbabilityConfig<TEnum, TEntry> : ScriptableObject 
    where TEnum : Enum 
    where TEntry : IProbabilityEntry<TEnum>
{
    // [SerializeField]를 사용해 자식 클래스에서 인스펙터에 노출되도록 함
    [SerializeField]
    private List<TEntry> entries = new List<TEntry>();

    // ProbabilitySet이 설정 데이터에 접근할 수 있도록 public 프로퍼티를 제공
    public IReadOnlyList<TEntry> Entries => entries;
}
```

### 3. `ProbabilitySet<T>`: 확률 계산 및 아이템 뽑기 엔진

이 시스템의 심장입니다. 제네릭(TEnum)으로 구현되어 있어 카드 등급, 아이템 종류 등 어떤 Enum 타입이든 처리할 수 있는 확률 테이블 역할을 합니다.

생성자에서 각 항목의 확률을 정수화하여 내부적으로 관리하고, 다양한 Sample 메소드를 통해 아이템 뽑기 기능을 제공합니다.

```csharp
public class ProbabilitySet<TEnum> where TEnum : Enum
{
    private const int RESOLUTION = 10000;

    private readonly Dictionary<TEnum, int> _originalProbabilities;
    private readonly TEnum _balancingKey;

    private readonly Dictionary<TEnum, bool> _uniqueFlags;
    private readonly HashSet<TEnum> _drawnUniques;

    // 설정 파일의 엔트리 리스트를 기반으로 확률 세트를 생성하고 초기화
    public ProbabilitySet(IReadOnlyList<IProbabilityEntry<TEnum>> entries)
    {
        _originalProbabilities = new Dictionary<TEnum, int>();
        _uniqueFlags = new Dictionary<TEnum, bool>();
        _drawnUniques = new HashSet<TEnum>();

        int sum = 0;
        bool balancingKeyFound = false;
        foreach (var entry in entries)
        {
            var type = entry.Type;
            int value = Mathf.RoundToInt((entry.BaseProbability + entry.PermanentBonus) * RESOLUTION);
            _originalProbabilities[type] = value;
            _uniqueFlags[type] = entry.IsUniqueOnce;
            sum += value;

            if (entry.IsDummy)
            {
                _balancingKey = type;
                balancingKeyFound = true;
            }
        }

        int leftover = RESOLUTION - sum;
        if (leftover != 0 && balancingKeyFound)
        {
            _originalProbabilities[_balancingKey] = Mathf.Max(0, _originalProbabilities.GetValueOrDefault(_balancingKey) + leftover);
        }
    }

    // 한 번만 등장하는(isUniqueOnce) 아이템들의 추첨 기록을 초기화
    public void ResetDrawnUniques()
    {
        _drawnUniques.Clear();
    }

    // 아이템 1개를 샘플링
    public TEnum Sample()
    {
        return SampleInternal();
    }

    // 중복을 허용하여 여러 개의 아이템을 샘플링. isUniqueOnce 아이템의 기록은 누적
    public List<TEnum> SampleMultiple(int count)
    {
        var results = new List<TEnum>();
        for (int i = 0; i < count; i++)
        {
            TEnum result = SampleInternal();
            if (result.Equals(default(TEnum))) 
            {
                break; // 더 이상 뽑을 아이템이 없을 경우 중단
            }
            results.Add(result);
        }
        return results;
    }

    // "이번 추첨 결과 내에서" 중복되지 않도록 여러 개의 아이템을 샘플링
    public List<TEnum> SampleMultipleUnique(int count)
    {
        var results = new List<TEnum>();
        var batchDrawnItems = new HashSet<TEnum>(); // 이번 배치 내에서의 중복 방지용 임시 기록

        for (int i = 0; i < count; i++)
        {
            var availableProbs = new Dictionary<TEnum, int>();
            foreach (var kvp in _originalProbabilities)
            {
                if (!_drawnUniques.Contains(kvp.Key) && !batchDrawnItems.Contains(kvp.Key))
                {
                    availableProbs.Add(kvp.Key, kvp.Value);
                }
            }

            int currentTotal = availableProbs.Values.Sum();
            if (currentTotal <= 0)
            {
                break;
            }

            TEnum result = SampleFromGivenProbabilities(availableProbs, currentTotal);
            if (result.Equals(default(TEnum)))
            {
                continue;
            }

            results.Add(result);
            batchDrawnItems.Add(result);

            if (_uniqueFlags.TryGetValue(result, out bool isUnique) && isUnique)
            {
                _drawnUniques.Add(result);
            }
        }
        return results;
    }
    

    // 일시적인 보너스 확률을 적용하여 아이템 1개를 샘플링. 원본 확률은 변경되지 않음
    public TEnum SampleWithBonus(IReadOnlyDictionary<TEnum, float> bonusMap)
    {
        // 1. 원본 확률을 변경하지 않기 위해 임시 복사본을 만듦
        var tempProbs = new Dictionary<TEnum, int>(_originalProbabilities);

        // 2. 보너스 맵에 있는 확률들을 임시 복사본에 적용
        if (bonusMap != null)
        {
            foreach(var kvp in bonusMap)
            {
                if (tempProbs.ContainsKey(kvp.Key))
                {
                    int bonusValue = Mathf.RoundToInt(kvp.Value * RESOLUTION);
                    tempProbs[kvp.Key] = Mathf.Max(0, tempProbs[kvp.Key] + bonusValue);
                }
            }
        }
        
        // 3. 이미 뽑힌 유니크 아이템을 제외한 최종 후보군을 만듦
        var availableProbs = new Dictionary<TEnum, int>();
        foreach (var kvp in tempProbs)
        {
            if (!_drawnUniques.Contains(kvp.Key))
            {
                availableProbs.Add(kvp.Key, kvp.Value);
            }
        }

        int currentTotal = availableProbs.Values.Sum();
        if (currentTotal <= 0)
        {
            return default;
        }
        
        // 4. 최종 후보군으로 실제 추첨을 진행
        TEnum result = SampleFromGivenProbabilities(availableProbs, currentTotal);

        // 5. 만약 뽑힌 아이템이 유니크라면, 영구 기록에 추가
        if (_uniqueFlags.TryGetValue(result, out bool isUnique) && isUnique)
        {
            _drawnUniques.Add(result);
        }
        
        return result;
    }

    // 단일 아이템 샘플링 내부 로직
    private TEnum SampleInternal()
    {
        var availableProbs = new Dictionary<TEnum, int>();
        foreach (var kvp in _originalProbabilities)
        {
            if (!_drawnUniques.Contains(kvp.Key))
            {
                availableProbs.Add(kvp.Key, kvp.Value);
            }
        }

        int currentTotal = availableProbs.Values.Sum();
        if (currentTotal <= 0)
        {
            return default;
        }
        
        TEnum result = SampleFromGivenProbabilities(availableProbs, currentTotal);

        if (_uniqueFlags.TryGetValue(result, out bool isUnique) && isUnique)
        {
            _drawnUniques.Add(result);
        }
        return result;
    }
    
    // 주어진 확률 테이블에서 실제 추첨을 진행하는 공통 메소드
    private TEnum SampleFromGivenProbabilities(Dictionary<TEnum, int> probs, int total)
    {
        while (true)
        {
            int randomPoint = UnityEngine.Random.Range(0, total);
            int accumulated = 0;
            foreach (var kvp in probs)
            {
                accumulated += kvp.Value;
                if (randomPoint < accumulated)
                {
                    if (kvp.Key.Equals(_balancingKey)) break;
                    return kvp.Key;
                }
            }
        }
    }
}
```

### 4. `ProbabilityManager` : 모든 확률 시스템의 중앙 관리자
마지막으로, 게임 내에 존재하는 모든 ProbabilitySet들을 한 곳에서 관리하고 쉽게 접근할 수 있도록 해주는 싱글톤(Singleton) 클래스입니다.

Unity 에디터에서 각 확률 설정 파일(ScriptableObject)를 연결해주면, 게임이 시작될 때 ProbabilityManager가 모든 확률 세트를 자동으로 초기화합니다.
```csharp
public class ProbabilityManager : DestroySingleton<ProbabilityManager>
{
     [Title("CardpackType 기본 확률 설정")]
     [SerializeField] private CardpackBaseConfig cardpackBaseConfig;
    
     [Title("CardRankType 기본 확률 설정")]
     [SerializeField] private CardRankConfig cardRankConfig;

     [Title("Traits 기본 확률 설정")]
     [SerializeField] private TraitsBaseConfig traitsBaseConfig;

    
     public ProbabilitySet<CardRankType> CardRankProbs { get; private set; }
     public ProbabilitySet<Traits> TraitProbs { get; private set; }
     public ProbabilitySet<CardElementType> CardpackProbs { get; private set; }

     private void Start()
     {
         InitializeProbabilitySets();
     }

     private void InitializeProbabilitySets()
     {
         CardRankProbs = new ProbabilitySet<CardRankType>   (cardRankConfig.Entries);
         CardpackProbs = new ProbabilitySet<CardElementType>(cardpackBaseConfig.Entries);
         TraitProbs    = new ProbabilitySet<Traits>         (traitsBaseConfig.Entries);
     }
}
```
## 결론
이렇게 제네릭을 활용하여 확률 시스템의 기본 틀을 만들어두면, 앞으로 어떤 종류의 확률 테이블이 필요하든 IProbabilityEntry를 구현하는 설정 파일과 Enum 타입만 새로 만들면 됩니다. ProbabilitySet이나 ProbabilityManager 코드를 전혀 수정할 필요 없이 시스템을 무한히 확장할 수 있습니다.

이러한 설계는 코드의 재사용성을 극대화하고, 유지보수 비용을 크게 절감시켜주는 좋은 방법입니다.
