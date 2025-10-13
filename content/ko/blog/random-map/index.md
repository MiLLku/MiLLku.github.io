---
title: 🗺️ Unity로 절차적 2D 타일맵 생성하기
summary:  C#을 활용하여 산소미포함, 래토피아와 같은 2D 기지 건설 시뮬레이터 게임을 위한 동굴 형태의 맵을 절차적으로 생성하는 시스템을 설계하고, 시드를 이용한 맵 복제와 특정 구조물 삽입 방법
date: 2025-10-12

image:
  filename: oni.jpg
  caption: '이미지 캡션: 산소미포함 스크린샷'

authors:
  - admin

tags:
  - Featured
  - Portfolio
  - Coding Stories
  - Hugo
  - Markdown
---

## 서론

'산소미포함'이나 '래토피아'와 같은 2D 기지 건설 시뮬레이션 게임의 핵심 재미 요소 중 하나는 매번 새로운 환경을 탐험하고 적응해나가는 과정입니다. 이러한 경험을 가능하게 하는 것이 바로 절차적 맵 생성 기술입니다. 정적으로 만들어진 맵은 몇 번 플레이하고 나면 예측 가능해지지만, 절차적으로 생성된 맵은 플레이할 때마다 새로운 구조와 자원 배치를 보여주어 리플레이 가치를 크게 높여줍니다.

이번 포스트에서는 Unity의 타일맵 시스템과 C# 스크립트를 활용하여, 자연스러운 동굴 형태의 2D 맵을 생성하고 자원을 배치하는 시스템을 어떻게 설계하고 구현하는지 단계별로 알아보겠습니다.

---

## 시스템의 핵심 구성 요소

우리가 만들 맵 생성 시스템은 크게 세 가지 스크립트로 구성됩니다.

1.  **`MapGenerator.cs`**: 펄린 노이즈(Perlin Noise)와 셀룰러 오토마타(Cellular Automata) 알고리즘을 사용해 전체적인 맵의 지형과 동굴 구조를 생성하는 핵심 로직입니다.
2.  **`TileResourceSO.cs`**: 흙, 돌, 철광석 등 맵을 구성하는 각 타일의 속성(채굴 시간, 드랍 아이템 등)을 정의하는 ScriptableObject입니다.
3.  **`TileMapController.cs`**: `MapGenerator`로부터 생성된 맵 데이터를 받아 실제 Unity 타일맵에 타일을 배치하고, 플레이어의 채굴과 같은 상호작용을 처리하는 중앙 관리자입니다.

이제 각 스크립트의 역할과 코드를 자세히 살펴보겠습니다.

---
### 1. `MapGenerator.cs`: 세상의 뼈대를 만드는 설계자

`MapGenerator`는 절차적 맵 생성의 첫 단계를 담당합니다. 아무것도 없는 공간에서 특정한 규칙에 따라 지형의 기본 형태를 만들어내는 역할을 하죠. 이 과정은 주로 두 가지 알고리즘을 통해 이루어집니다.

#### 1.1. 펄린 노이즈 (Perlin Noise)

펄린 노이즈는 자연스러운 형태의 무작위성을 만들어내는 데 널리 사용되는 알고리즘입니다. 완전한 무작위가 아닌, 연속성을 가진 부드러운 노이즈 값을 생성하여 구름, 산맥, 지형 등 다양한 자연물을 표현하는 데 효과적입니다.

우리 시스템에서는 펄린 노이즈를 사용해 맵의 어느 부분을 '벽'으로 채우고 어느 부분을 '빈 공간'으로 남길지 결정하는 초기 지형을 생성합니다.

```csharp
// MapGenerator.cs
private void GenerateInitialMap()
{
    // 매번 다른 맵을 생성하기 위한 랜덤 시드 오프셋
    float offsetX = Random.Range(0f, 9999f);
    float offsetY = Random.Range(0f, 9999f);

    for (int x = 0; x < width; x++)
    {
        for (int y = 0; y < height; y++)
        {
            float noiseValue = Mathf.PerlinNoise(
                (float)x / scale + offsetX,
                (float)y / scale + offsetY
            );

            // 노이즈 값이 특정 임계점(threshold)보다 크면 돌, 작으면 빈 공간으로 설정
            mapData[x, y] = (noiseValue > threshold) ? TileType.Stone : TileType.Empty;
        }
    }
}
```
 
#### 1.2. 셀룰러 오토마타 (Cellular Automata)

펄린 노이즈만으로 생성된 맵은 다소 거칠고 부자연스러운 점들이 많습니다. 셀룰러 오토마타는 각 타일이 주변 타일들의 상태에 따라 자신의 상태를 변화시키는 간단한 규칙을 반복 적용하여, 마치 살아있는 세포처럼 전체 구조가 점차 자연스러운 형태로 다듬어지도록 하는 알고리즘입니다.

예를 들어, "주변 8칸에 벽이 4개보다 많으면 나도 벽이 되고, 그렇지 않으면 빈 공간이 된다" 와 같은 규칙을 여러 번 반복하면, 외따로 떨어진 타일들은 사라지고 거대한 동굴과 같은 유기적인 구조가 형성됩니다.

```csharp
// MapGenerator.cs
private void SmoothMap()
{
    for (int x = 0; x < width; x++)
    {
        for (int y = 0; y < height; y++)
        {
            int neighbourWallTiles = GetSurroundingWallCount(x, y);

            if (neighbourWallTiles > wallCreationThreshold)
                mapData[x, y] = TileType.Stone;
            else if (neighbourWallTiles < wallCreationThreshold)
                mapData[x, y] = TileType.Empty;
        }
    }
}
```

### 2. TileResourceSO.cs: 타일에 생명을 불어넣는 데이터

맵의 구조가 완성되었다면, 이제 각 타일이 어떤 특징을 가질지 정의해야 합니다. TileResourceSO는 ScriptableObject를 활용하여 흙, 돌, 철광석, 구리 등 각 타일의 정보를 에셋 파일로 관리할 수 있게 해줍니다.

이렇게 데이터와 로직을 분리하면, 새로운 종류의 광물을 추가하거나 기존 광물의 채굴 시간을 변경하는 등의 작업을 코드를 수정하지 않고 Unity 에디터 내에서 손쉽게 처리할 수 있어 유지보수가 매우 용이해집니다.

보통 타일이 가지고 있을 정보는 타일의 내구도, 부술 시 드롭하는 아이템 등을 가질 것입니다.

```csharp
[CreateAssetMenu(fileName = "TileProperties", menuName = "Game/TileProperties")]
public class TileResourceSO : ResourceSO
{
    [Header("타일 속성")]
    public TileType typeEnum; // 빠른 조회를 위한 Enum
    public TileBase tileBase; // Unity Tilemap에 표시될 타일
    
    [Header("채굴 정보")]
    [Min(0.1f)] public float miningTime = 2f;
    public int minDrop = 1;
    public int maxDrop = 2;
    public GameObject breakEffectPrefab;
}

public class ResourceSO : ScriptableObject
{
    [SerializeField, HideInInspector] private string id = "";
    public string Id => id;

    [Header("분류 & 표시")]
    public ResourceType type;
    public string displayName;
    public Sprite icon;

    [Header("속성")]
    public List<string> tags = new();
}
```
### 3. TileMapController.cs: 맵과 플레이어를 연결하는 중재자

TileMapController는 생성된 맵 데이터를 실제 게임 월드에 구현하고, 플레이어와의 상호작용을 총괄하는 중요한 역할을 합니다.

맵 초기화: MapGenerator가 생성한 TileType 배열을 기반으로, 각 위치에 맞는 TileBase를 Unity의 Tilemap 컴포넌트에 설정하여 시각적으로 맵을 렌더링합니다.

```csharp
// TileMapController.cs
void InitializeMap()
{
    // MapGenerator를 통해 맵 데이터 생성 
    _tileGrid = new TileData[mapWidth, mapHeight];
    for (int x = 0; x < mapWidth; x++)
    {
        for (int y = 0; y < mapHeight; y++)
        {
            TileResourceSO resource = GetTileResourceForGeneration(x, y);
            if (resource != null)
            {
                _tileGrid[x, y] = new TileData(resource);
                tilemap.SetTile(new Vector3Int(x, y, 0), resource.tileBase);
            }
        }
    }
}
```

### 4. 심화편 : 더 다채로운 맵을 위한 기법들

지금까지 설명한 기본 시스템에 몇 가지 기법을 추가하면 훨씬 더 생동감 있고 깊이 있는 월드를 만들 수 있습니다.

#### 4.1. 다양한 타일 섞기 및 특정 지역(Biome) 생성

단순히 흙, 돌, 철광석만으로 이루어진 맵은 단조로울 수 있습니다. 깊이에 따라 다른 광물이 나타나게 하거나, 특정 지역은 용암으로 가득 찬 '화산 지대'로 만드는 등 변화를 줄 수 있습니다. 이는 여러 개의 펄린 노이즈를 중첩하거나 Y좌표(깊이)를 조건으로 활용하여 구현할 수 있습니다.

```csharp
// TileMapController.cs
TileResourceSO GetTileResourceForGeneration(int x, int y)
{
    // 최상단은 하늘
    if (y >= mapHeight - 5)
    {
        return null;
    }

    // 깊이에 따라 바이옴 결정
    // 예: y < 10 이면 용암 지대
    if (y < 10) 
    {
        // 용암 지대용 노이즈를 별도로 생성하여 현무암, 마그마 등을 배치
        float lavaNoise = Mathf.PerlinNoise(x * 0.2f, y * 0.2f);
        if (lavaNoise > 0.6f) return magmaResource; // 마그마 타일
        return basaltResource; // 현무암 타일
    }

    // 기본 지대 (흙, 돌, 철 등)
    float noise = Mathf.PerlinNoise(x * 0.1f, y * 0.1f);
    if (noise > 0.7f) return ironResource;
    if (noise > 0.5f) return stoneResource;
    return dirtResource;
}
```

이와 같은 방식으로 특정 깊이에는 석유가 존재한다거나, 빙하지대 등 다양한 바이옴을 생성할 수 있습니다.

#### 4.2. 푸아송 디스크 샘플링을 통한 자연스러운 오브젝트 배치

맵에 광맥이나 특수 식물, 적 스폰 위치 등을 배치할 때 완전히 무작위로 좌표를 찍으면 서로 뭉치거나 어색하게 분포되는 경우가 많습니다.

**푸아송 디스크 샘플링(Poisson Disk Sampling)**은 각 점들이 서로 최소한의 거리를 유지하도록 배치하는 알고리즘입니다. 이를 사용하면 자원이나 중요 오브젝트들이 맵 전체에 훨씬 자연스럽고 균일하게 분포되도록 만들 수 있습니다.

```csharp
// MapGenerator.cs
private void PlaceResources()
{
    // 구리 광석 배치
    // copperRadius 값에 따라 광맥 사이의 최소 거리가 보장됨
    var copperPoints = PoissonDiskSampling.GeneratePoints(copperRadius, new Vector2(width, height));
    foreach (var point in copperPoints)
    {
        int x = Mathf.FloorToInt(point.x);
        int y = Mathf.FloorToInt(point.y);

        // 해당 위치가 '벽(Stone)'일 경우에만 자원을 배치
        if (x >= 0 && x < width && y >= 0 && y < height && mapData[x, y] == TileType.Stone)
        {
            mapData[x, y] = TileType.Copper;
        }
    }
    
    // 다른 자원도 같은 방식으로 추가할 수 있음
    // var diamondPoints = PoissonDiskSampling.GeneratePoints(diamondRadius, new Vector2(width, height));
    // ~
}
```

이러한 다양한 기법들을 조합하여 다채로운 맵을 생성할 수 있습니다.

### 짤막한 정보 : 시드를 이용한 맵 복제 및 공유

절차적 생성의 핵심은 무작위성이지만, 때로는 이 무작위성을 제어하고 싶을 때가 있습니다. 마인크래프트를 하며 유명한 시드 맵을 플레이해보거나, 버그를 테스트하거나, 똑같은 맵에서 플레이하고 싶을 때 시드(Seed) 값을 사용합니다.

컴퓨터의 '무작위'는 사실 **유사 난수(Pseudo-random)**입니다. 이것은 '시드'라는 초기값을 기반으로 정해진 순서에 따라 난수를 생성합니다. 즉, 시드값이 같다면 생성되는 난수의 순서와 값은 항상 동일합니다. 이를 맵 생성에 적용하면, 동일한 시드로 항상 동일한 맵을 만들 수 있습니다.
```csharp
// MapGenerator.cs
[Header("펄린 노이즈 설정")]
public string seed;
public bool useRandomSeed;

public void GenerateMap()
{
    if (useRandomSeed || string.IsNullOrEmpty(seed))
    {
        seed = Time.time.ToString();
    }
    // 문자열 시드를 정수형으로 변환하여 Unity의 난수 생성기 상태를 초기화
    UnityEngine.Random.InitState(seed.GetHashCode());

    // 이제부터 호출되는 모든 Random.Range()는 위 시드에 의해 동일한 순서로 생성됨
    GenerateInitialMap();
}
```

숫자형 시드는 seed의 자료형을 int로 변경하여 사용할 수 있으며, 문자형 시드보다 보다 직관적으로 보일 수 있습니다.

```csharp
[Header("펄린 노이즈 설정")]
public int intSeed; // 자료형 변환
public bool useRandomSeed;

public void GenerateMap()
{
    if (useRandomSeed)
    {
        intSeed = (int)System.DateTime.Now.Ticks;
    }
    UnityEngine.Random.InitState(intSeed);
    GenerateInitialMap();
}
```

