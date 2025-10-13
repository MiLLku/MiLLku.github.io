---
title: 🎲 Designing a Generic Probability System for Unity
summary: Learn how to create an expandable and reusable probability and gacha system that can handle any Enum type using C# generics.
date: 2025-07-24
authors:
  - admin
tags:
  - Featured
  - Portfolio
  - Coding Stories
  - Unity
  - C#
image:
  filename: prob.jpg
---

## Introduction

In game development, especially in RPGs or collection-based games, various probability-based systems are necessary. For example, item drops from monsters, cards of different rarities from packs, and character trait assignments all rely on probability. Implementing each of these systems separately is inefficient and makes maintenance difficult.

In this post, I'll share how to design and implement a reusable probability system using C# Generics that allows you to easily create and manage any kind of probability table.

## Core Components of the System

The system we will build consists of three core scripts:

1.  **`IProbabilityEntry.cs`**: Defines the **interface** for any item that can have a probability.
2.  **`ProbabilitySet<T>`**: Manages the **core logic** for a set of probabilities for a specific item type (`T`). It handles the actual item sampling.
3.  **`ProbabilityManager.cs`**: A **central manager (Singleton)** that initializes all `ProbabilitySet` instances in the game and provides easy access to them from anywhere.

Let's take a closer look at the role and code of each script.

---

### 1. `IProbabilityEntry<T>`: The Basic Framework for Probability Entries

First, this interface defines what information each entry in the probability table must have. `T` represents an Enum type, such as `CardRankType` or `RewardType`.

By defining an interface like this, any kind of probability item will have a consistent structure, making it easy for the `ProbabilitySet` to process them.

```csharp
public interface IProbabilityEntry<T> where T : Enum
{
    T Type { get; } // The type of the item (Enum)
    float BaseProbability { get; } // The base probability
    float PermanentBonus { get; } // A bonus probability that can be applied permanently
    bool IsDummy { get; } // Fills the remaining probability if the total does not sum to 100%
    bool IsUniqueOnce { get; } // Whether the item should never be drawn again once selected
}
```

### 2. ProbabilityConfig<T, U>: Configuration Management with ScriptableObjects

Different probability configuration files all share a similar structure. To avoid code duplication and maintain consistency, we'll create a generic base class that all probability configuration ScriptableObjects will inherit from.

This abstract class contains a list of probability data (entries), so child classes only need to define what kind of data they will hold.

```csharp
public abstract class ProbabilityConfig<TEnum, TEntry> : ScriptableObject 
    where TEnum : Enum 
    where TEntry : IProbabilityEntry<TEnum>
{
    // Exposed in the inspector for child classes using [SerializeField]
    [SerializeField]
    private List<TEntry> entries = new List<TEntry>();

    // Provides a public property for ProbabilitySet to access the configuration data
    public IReadOnlyList<TEntry> Entries => entries;
}
```

### 3. ProbabilitySet<T>: The Probability Calculation and Item Sampling Engine

This is the heart of the system. Implemented with a generic type parameter (TEnum), it acts as a probability table that can handle any Enum type, such as card rarities or item types.

In its constructor, it converts each item's probability into an integer for internal management and provides various Sample methods for item drawing functionality.

```csharp
public class ProbabilitySet<TEnum> where TEnum : Enum
{
    private const int RESOLUTION = 10000;

    private readonly Dictionary<TEnum, int> _originalProbabilities;
    private readonly TEnum _balancingKey;

    private readonly Dictionary<TEnum, bool> _uniqueFlags;
    private readonly HashSet<TEnum> _drawnUniques;

    // Creates and initializes the probability set based on the entry list from a config file
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

    // Resets the draw history for unique-once items
    public void ResetDrawnUniques()
    {
        _drawnUniques.Clear();
    }

    // Samples a single item
    public TEnum Sample()
    {
        return SampleInternal();
    }

    // Samples multiple items with replacement, accumulating the history of unique-once items
    public List<TEnum> SampleMultiple(int count)
    {
        var results = new List<TEnum>();
        for (int i = 0; i < count; i++)
        {
            TEnum result = SampleInternal();
            if (result.Equals(default(TEnum))) 
            {
                break; // Stop if there are no more items to draw
            }
            results.Add(result);
        }
        return results;
    }

    // Samples multiple items without replacement "within this batch"
    public List<TEnum> SampleMultipleUnique(int count)
    {
        var results = new List<TEnum>();
        var batchDrawnItems = new HashSet<TEnum>(); // Temporary record to prevent duplicates within this batch

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
    
    // Samples one item with a temporary bonus probability; the original probabilities are not modified
    public TEnum SampleWithBonus(IReadOnlyDictionary<TEnum, float> bonusMap)
    {
        var tempProbs = new Dictionary<TEnum, int>(_originalProbabilities);

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
        
        TEnum result = SampleFromGivenProbabilities(availableProbs, currentTotal);

        if (_uniqueFlags.TryGetValue(result, out bool isUnique) && isUnique)
        {
            _drawnUniques.Add(result);
        }
        
        return result;
    }

    // Internal logic for single item sampling
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
    
    // Common method to perform the actual draw from a given probability table
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

### 4. ProbabilityManager: The Central Manager for All Probability Systems

Finally, this Singleton class manages all ProbabilitySet instances in the game from one place, providing easy access.

By linking each probability configuration file (ScriptableObject) in the Unity Editor, the ProbabilityManager will automatically initialize all probability sets when the game starts.

```csharp
public class ProbabilityManager : DestroySingleton<ProbabilityManager>
{
     [Title("CardpackType Base Probabilities")]
     [SerializeField] private CardpackBaseConfig cardpackBaseConfig;
    
     [Title("CardRankType Base Probabilities")]
     [SerializeField] private CardRankConfig cardRankConfig;

     [Title("Traits Base Probabilities")]
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
         CardRankProbs = new ProbabilitySet<CardRankType>(cardRankConfig.Entries);
         CardpackProbs = new ProbabilitySet<CardElementType>(cardpackBaseConfig.Entries);
         TraitProbs    = new ProbabilitySet<Traits>(traitsBaseConfig.Entries);
     }
}
```

## Conclusion
By creating a basic framework for a probability system using generics, you can infinitely extend the system without modifying the ProbabilitySet or ProbabilityManager code. Whenever a new type of probability table is needed, you just have to create a new configuration file implementing IProbabilityEntry and a new Enum type.

This design maximizes code reusability and significantly reduces maintenance costs, making it an excellent approach.