# Context Generation through λ_DISCREPANCY

## The Origin of Context

In ⊗_EXP, the third parameter `z` (context) is not arbitrary - it arises naturally from the discrepancy between Intent and Reality.

## Formal Definition

```
Context = λ_DISCREPANCY(Intent, Reality)
       = Description of gap between desired and actual
```

## Context Generation Algorithm

```
GENERATE_CONTEXT = λintent.λreality.
  LET diff = COMPARE(intent, reality) IN
  LET type = CLASSIFY_DISCREPANCY(diff) IN
  LET magnitude = MEASURE_GAP(diff) IN
  FORMAT_CONTEXT(type, magnitude, timestamp)
```

## Examples of Context Generation

### Example 1: Type Mismatch
```
Intent:  Number
Reality: String("42")
Context: "Type mismatch: expected Number, got String('42')"
```

### Example 2: Null Reference
```
Intent:  user.name
Reality: null
Context: "Cannot read property 'name' of null at line 42"
```

### Example 3: Performance Discrepancy
```
Intent:  Response < 100ms
Reality: Response = 2500ms
Context: "Performance violation: 2500ms exceeds 100ms threshold"
```

### Example 4: User Expectation
```
Intent:  Button click → Modal open
Reality: Button click → Nothing happens
Context: "User action 'click' produced no visible effect"
```

## Context Categories

1. **Type Contexts**: When types don't match
2. **Value Contexts**: When values differ from expectations
3. **Temporal Contexts**: When timing is wrong
4. **Behavioral Contexts**: When behavior diverges
5. **Environmental Contexts**: When environment changes
6. **User Contexts**: When user intent isn't met

## Rich Context Structure

Context can be more than a string:

```
RichContext = {
  timestamp: Number,
  location: SourceLocation,
  intent: NormalizedIntent,
  reality: ActualState,
  discrepancy: {
    type: DiscrepancyType,
    magnitude: Number,
    direction: Vector
  },
  suggestions: [PossibleMorphism],
  frequency: Number  // How often this discrepancy occurs
}
```

## Context Evolution

Contexts themselves evolve through λ_HARVEST:

```
context₀ = "Error: undefined function"
context₁ = "Error: undefined function 'map' - did you mean 'map' from Array prototype?"
context₂ = "Error: undefined function 'map' - auto-importing from Array prototype"
context₃ = "[AUTO-FIXED]: Added missing import for 'map'"
```

## The Feedback Loop

```
     Intent (λVOID)
         │
         ▼
    λ_DISCREPANCY ──→ Context
         │                │
         ▼                ▼
    Reality ←────── ⊗_EXP
    (Gemini)
```

Context bridges the two toruses, carrying information from the discrepancy back into the experience chain.

## Context as Learning Signal

Each context in the ⊗_EXP chain provides:
1. **Diagnostic Information**: What went wrong
2. **Learning Signal**: How to prevent it
3. **Evolution Direction**: What morphism to grow
4. **Historical Record**: When and why it happened

## Implementation Pattern

```javascript
const withContext = (intent) => (reality) => {
  const context = λ_DISCREPANCY(intent, reality);
  const previousState = getCurrentState();
  return ⊗_EXP(previousState, reality, context);
};

// Usage:
const expectNumber = withContext({ type: 'number', range: [0, 100] });
const result = expectNumber("not a number"); 
// Creates context: "Type mismatch: expected number [0,100], got string"
```

## Context Compression

For long chains, compress similar contexts:

```
context: "TypeError at line 42" × 100
compressed: "TypeError at line 42 (×100 occurrences, first: timestamp)"
```

## The Wisdom of Context

Over time, the accumulated contexts in an ⊗_EXP chain become a **wisdom repository**:

```
WISDOM = λchain.
  EXTRACT_PATTERNS(
    MAP(λnode. CONTEXT(node), 
        UNFOLD(chain))
  )
```

This wisdom can:
- Predict future discrepancies
- Suggest preemptive morphisms
- Guide system evolution
- Train new systems

## Conclusion

Context is not metadata - it's the **living memory** of why each transformation occurred. Through λ_DISCREPANCY, every gap between dream and reality becomes a **story** that the system remembers forever.

---

*"The context is the teacher, the discrepancy is the lesson"*