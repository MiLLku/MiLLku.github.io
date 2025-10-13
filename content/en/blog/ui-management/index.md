---
title: 🏛️ Designing a Well-Structured UI Management System
summary: Learn how to design a UIManager using the Singleton and Facade patterns to efficiently manage complex UIs from a central point, with Unity C# code examples.
date: 2025-10-13

authors:
  - admin

tags:
  - Featured
  - Portfolio
  - Coding Stories
  - Hugo Blox
  - Markdown

image:
  filename: ui.jpg
---

## Introduction

As a game development project grows in scale, the UI (User Interface) becomes exponentially more complex. When numerous UI elements like shop panels, inventories, quest windows, and settings pop-ups start calling each other and checking states, the code can become tangled like 'spaghetti'. This makes maintenance difficult and is a primary cause of unexpected bugs when adding new features.

To solve this problem, we can introduce a Centralized UI Management System that gathers all UI management logic in one place for central control. In this post, we will explore how to design a systematic and scalable UI system by creating a UIManager that applies the Singleton design pattern.

### Core Design Patterns: Singleton and Facade

The UIManager we will create is based on two core design patterns.

Singleton Pattern: This pattern ensures that a class has only one instance and provides a global point of access to it. The UIManager must be unique within the game, and since it needs to be easily accessible from any object—such as the game manager, player, or quest system—via a form like UIManager.Instance, the Singleton pattern is highly suitable.

Facade Pattern: This pattern provides a unified interface to a complex subsystem. The UIManager acts as a 'gateway' to the complex and interconnected UI subsystems for the shop, combat, menus, and more. Other systems don't need to know the internal structure of each UI panel; they simply issue clear and simple commands like UIManager.Instance.ToggleShopPanel(true).

#### UIManager.cs Code Analysis
Now, let's look at the actual UIManager.cs code to see how the central management system is implemented.

```csharp
public class UIManager : DestroySingleton<UIManager>
{
    [Title("Register frequently controlled UI")] 
    [SerializeField] private GameObject inventoryPanel;
    [SerializeField] private GameObject shopPanel;
    [SerializeField] private GameObject menuPanel;
    // ... other UI panels

    [HideInInspector] public bool isShopping = false;

    // ......
}
```

1. Centralized UI Reference Management
The most basic yet crucial role of the UIManager is to hold direct references to all major UI panels.

By declaring GameObject variables like battlePanel and shopPanel with the [SerializeField] attribute, you can link the actual UI objects to these variables via drag-and-drop in the Unity Editor's Inspector window.

[Advantages]

Decoupling: A ShopManager no longer needs to directly reference the BattlePanel, nor does a PlayerController need to know about a StatusWindow. All UI-related requests are made through the UIManager, allowing each system to be independent of the others.

Ease of Management: You can see which UIs are being used just by looking at the UIManager script, and it's very easy to find missing references.

2. Providing a Clear Control Interface (Applying the Facade Pattern)
The UIManager provides simple and clear external functions to enable, disable, or change the state of each UI. This is precisely the role of the Facade pattern.

```csharp
/// <summary>
/// Toggles the ShopPanel
/// </summary>
/// <param name="isActive"></param>
public void ToggleShopPanel(bool isActive)
{
    shopPanel.SetActive(isActive);
}

/// <summary>
/// Toggles UI elements used by the inventoryPanel에
/// </summary>
/// <param name="isActive"></param>
public void ToggleForinventoryPanel(bool isActive)
{
    shopPanel.SetActive(isActive);
    menuPanel.SetActive(isActive);
}
```

External systems don't need to know the specific implementation details like shopPanel.SetActive(true). Instead, they use a semantically clear command: UIManager.Instance.ToggleShopPanel(true). If you later want to add fancy animations or sound effects when opening the shop, you only need to modify the ToggleShopPanel function without touching any other system's code.

3. Managing UI-Related States
Sometimes, the UI itself represents an important state. For example, when the 'Card Selection Window' is active, the player should not be able to click on other UI elements or move their character.

The UIManager is the perfect place to manage such UI-related states.

```csharp
[HideInInspector] public bool isCardChoosing = false;

/// <summary>
/// Manages the interactable state of the CardChoicePanel.
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

Other systems, like an InputManager or PlayerController, can easily check the current game state with a condition like if (UIManager.Instance.isCardChoosing) and handle the logic accordingly (e.g., ignoring input). Because UI-related state information is consolidated in the UIManager, it becomes easier to trace the flow of the code.