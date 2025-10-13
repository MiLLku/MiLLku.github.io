---
title: 🏛️ 좋은 구조의 UI 관리 시스템 설계하기
summary: 싱글턴(Singleton)과 퍼사드(Facade) 패턴을 활용하여 UIManager를 설계하고, 복잡하게 얽힌 UI들을 중앙에서 효율적으로 관리하는 방법에 대해 Unity C# 코드를 예시로 알아봅니다.
date: 2025-10-13
authors:
  - admin
tags:
  - Featured
  - Portfolio
  - Coding Stories
  - Hugo
  - Markdown
image:
  filename: ui.jpg
---

## 서론

게임 개발 프로젝트의 규모가 커질수록 UI(사용자 인터페이스)는 기하급수적으로 복잡해집니다. 상점 패널, 인벤토리, 퀘스트 창, 설정 팝업 등 수많은 UI 요소들이 서로를 호출하고 상태를 확인하기 시작하면 코드는 이른바 '스파게티'처럼 얽히게 됩니다. 이는 유지보수를 어렵게 만들고, 새로운 기능을 추가할 때 예상치 못한 버그를 발생시키는 주된 원인이 됩니다.

이러한 문제를 해결하기 위해, UI 관리 로직을 한 곳에 모아 중앙에서 통제하는 중앙 집중형 UI 관리 시스템을 도입할 수 있습니다. 이번 포스트에서는 싱글턴(Singleton) 디자인 패턴을 적용한 UIManager를 만들어, 복잡한 UI 시스템을 어떻게 체계적이고 확장 가능하게 설계할 수 있는지 알아보겠습니다.

### 핵심 디자인 패턴: 싱글턴과 퍼사드

우리가 만들 UIManager는 두 가지 핵심적인 디자인 패턴을 기반으로 합니다.

싱글턴 패턴 (Singleton Pattern): 클래스의 인스턴스가 단 하나만 존재하도록 보장하고, 이 인스턴스에 대한 전역적인 접근점을 제공합니다. UIManager는 게임 내에서 유일해야 하며, 게임 매니저, 플레이어, 퀘스트 시스템 등 어떤 객체에서든 UIManager.Instance와 같은 형태로 쉽게 접근할 수 있어야 하므로 싱글턴 패턴이 매우 적합합니다.

퍼사드 패턴 (Facade Pattern): 복잡한 서브시스템에 대한 통합된 인터페이스를 제공하는 패턴입니다. UIManager는 상점, 전투, 메뉴 등 복잡하게 얽힌 UI 서브시스템에 대한 '창구' 역할을 합니다. 다른 시스템들은 각 UI 패널의 내부 구조를 알 필요 없이, 그저 UIManager.Instance.ToggleShopPanel(true)와 같이 간단하고 명료한 명령을 내리기만 하면 됩니다.

#### 1.1.UIManager.cs 코드 분석
```csharp
public class UIManager : DestroySingleton<UIManager>
{
    [Title("제어가 잦은 UI 등록")] 
    [SerializeField] private GameObject inventoryPanel;
    [SerializeField] private GameObject shopPanel;
    [SerializeField] private GameObject menuPanel;
    // ... 기타 UI 패널들

    [HideInInspector] public bool isShopping = false;

    // ......
}
```
1. 중앙 집중식 UI 참조 관리

UIManager의 가장 기본적이면서도 중요한 역할은 모든 주요 UI 패널에 대한 참조를 직접 들고 있는 것입니다.

[SerializeField] 어트리뷰션을 사용해 inventoryPanel, shopPanel 등의 GameObject 변수를 선언하면, Unity 에디터의 인스펙터 창에서 각 변수에 실제 UI 오브젝트를 드래그 앤 드롭으로 연결할 수 있습니다.

[장점]

결합도 감소(Decoupling): ShopManager가 BattlePanel을 직접 참조하거나, PlayerController가 StatusWindow를 알아야 할 필요가 없어집니다. 모든 UI 관련 요청은 UIManager를 통해 이루어지므로, 각 시스템은 서로에게서 독립될 수 있습니다.

관리의 용이성: 어떤 UI가 사용되고 있는지 UIManager 스크립트 하나만 봐도 파악할 수 있으며, 참조가 누락되었을 때 찾기가 매우 쉽습니다.

2. 명확한 제어 인터페이스 제공 (퍼사드 패턴의 적용)

UIManager는 각 UI를 켜고 끄거나 특정 상태로 변경하는 간단하고 명확한 함수들을 외부에 제공합니다. 이것이 바로 퍼사드 패턴의 역할입니다.

```csharp
/// <summary>
/// ShopPanel을 토글
/// </summary>
/// <param name="isActive"></param>
public void ToggleShopPanel(bool isActive)
{
    shopPanel.SetActive(isActive);
}

/// <summary>
/// inventoryPanel에서 사용할 UI 토글
/// </summary>
/// <param name="isActive"></param>
public void ToggleForinventoryPanel(bool isActive)
{
    shopPanel.SetActive(isActive);
    menuPanel.SetActive(isActive);
}
```

외부 시스템은 shopPanel.SetActive(true)와 같은 구체적인 구현 코드를 알 필요가 없습니다. 대신 UIManager.Instance.ToggleShopPanel(true)라는 의미가 명확한 명령을 사용합니다. 만약 나중에 상점을 열 때 화려한 애니메이션 효과나 사운드를 추가하고 싶다면, 다른 시스템 코드는 전혀 건드리지 않고 ToggleShopPanel 함수 내부만 수정하면 됩니다.

3. UI와 밀접한 상태 관리

때로는 UI 자체가 하나의 중요한 상태가 되기도 합니다. 예를 들어, '상점 창'이 활성화되어 있을 때는 플레이어가 다른 UI를 클릭하거나 캐릭터를 움직일 수 없어야 합니다.

UIManager는 이러한 UI 관련 상태를 관리하기에 최적의 장소입니다.

```csharp
[HideInInspector] public bool isCardChoosing = false;

/// <summary>
/// CardChoicePanel의 상호작용 가능 여부 관리
/// </summary>
public void SetCardChoosingState(bool isChoosing)
{
    isCardChoosing = isChoosing;
}

public bool IsCardChoicePanelActive()
{
    return cardChoicePanel != null && cardChoicePanel.activeSelf;
}
```

InputManager나 PlayerController 같은 다른 시스템에서는 if (UIManager.Instance.isCardChoosing) 과 같은 조건문으로 현재 게임 상태를 쉽게 확인하고, 그에 맞는 로직(예: 입력 무시)을 처리할 수 있습니다. UI와 관련된 상태 정보가 UIManager에 모여있어 코드의 흐름을 추적하기 쉬워집니다.

