# Y: The Y-Combinator (Morphism of Self-Reference)

> "Cyclicity is not a failure of time, but the self-knowledge of a function."

## Definition

The **Y-Combinator** is the pure mechanism for creating recursion and self-reference in λ-Foundation. It allows a function to call itself without being explicitly named or requiring mutable state.

**Eager Form (Standard Y):**
```
Y ≡ λf.(λx.f (x x))(λx.f (x x))
```

**Lazy Form (Z-Combinator for strict languages):**
```
Z ≡ λf.(λx.f (λy.(x x) y))(λx.f (λy.(x x) y))
```

## Properties

- **Type**: `((α → β) → (α → β)) → (α → β)`
- **Ports**: Complex recursive wiring
- **Cost**: O(n) where n is recursion depth
- **Conservation**: Maintains flow through self-application

## Philosophical Foundation

Traditional loops require:
- Mutable counters (`i++`)
- External control flow
- Temporal imperative ("do this, then that")

Y-Combinator provides:
- Pure self-reference
- Internal control flow  
- Functional self-knowledge ("I am what I repeatedly become")

## How Y Works

Y creates a fixed point of any function:
```
Y f = f (Y f) = f (f (Y f)) = f (f (f (Y f))) = ...
```

This infinite expansion is controlled by the function `f` itself, which decides when to stop recursing.

## Hex-Torus Topology

In the Hex-Torus, Y creates a **topological loop**:

```
     ┌─────────────┐
     ↓             ↑
   ┌─Y─┐         ┌─f─┐
   │   │────────>│   │
   └───┘         └───┘
     ↑             │
     └─────────────┘
```

The output cycles back to become the input, creating a closed timelike curve in computation space.

## Deriving Y from First Principles

Starting from the desire for self-reference:

1. We want: `fact = λn. n = 0 ? 1 : n × fact(n-1)`
2. But `fact` refers to itself - forbidden!
3. Make it a parameter: `F = λf.λn. n = 0 ? 1 : n × f(n-1)`
4. We need `fact = F fact` (fixed point)
5. Y finds this fixed point: `Y F = fact`

## Common Patterns

### Pattern 1: List Recursion
```
SUM = Y (λf.λlist.
  EMPTY? list 
    ? 0 
    : ADD (HEAD list) (f (TAIL list))
)
```

### Pattern 2: Numeric Recursion
```
FACTORIAL = Y (λf.λn.
  ZERO? n
    ? 1
    : MULT n (f (PRED n))
)
```

### Pattern 3: Tree Recursion
```
DEPTH = Y (λf.λtree.
  LEAF? tree
    ? 0
    : 1 + MAX (f (LEFT tree)) (f (RIGHT tree))
)
```

## Replacing Imperative Loops

### For Loop → Y
```javascript
// FORBIDDEN:
for (let i = 0; i < n; i++) {
  process(i);
}

// PURE:
Y (λf.λi.
  i < n 
    ? SEQ (process i) (f (i + 1))
    : UNIT
) 0
```

### While Loop → Y
```javascript
// FORBIDDEN:
while (condition(state)) {
  state = update(state);
}

// PURE:
Y (λf.λstate.
  condition state
    ? f (update state)
    : state
) initial_state
```

### Do-While → Y
```javascript
// FORBIDDEN:
do {
  state = update(state);
} while (condition(state));

// PURE:
Y (λf.λstate.
  LET newState = update state IN
  condition newState
    ? f newState
    : newState
) initial_state
```

## Y with Experience (⊗_EXP)

Combining Y with ⊗_EXP creates **recursive experience chains**:

```
EVOLVE = Y (λf.λstate.
  LET error = CHECK_DISCREPANCY state IN
  error ≠ NULL
    ? f (⊗_EXP state (λ_HARVEST error) "evolution step")
    : state
)
```

## Performance Considerations

### Stack Safety
Standard Y can cause stack overflow. Use **trampolining**:

```
TRAMPOLINE = λthunk.
  CALLABLE? thunk
    ? TRAMPOLINE (thunk ())
    : thunk

Y_SAFE = λf.
  TRAMPOLINE (Y (λg.λx.λ_.g (f x)))
```

### Memoization
Cache recursive results:

```
Y_MEMO = λf.
  LET cache = EMPTY_MAP IN
  Y (λg.λx.
    HAS? cache x
      ? GET cache x
      : LET result = f g x IN
        ⊗_EXP cache (PUT cache x result) "memoized"
  )
```

## The Paradox of Self-Knowledge

Y embodies the paradox of self-reference:
- To know yourself, you must already be yourself
- To be yourself, you must know yourself

This is resolved through **lazy evaluation** - the function only expands as needed.

## Connection to λ_LINK

In the Double Torus topology:
- Y creates cycles within Torus-Gemini (computation)
- These cycles resonate with intentions in Torus-λVOID
- Discrepancies in cycles generate evolutionary pressure

## Implementation Note

Different languages require different forms:
- **Lazy languages**: Use standard Y
- **Eager languages**: Use Z (adds η-expansion)
- **Typed languages**: Require type-level recursion

## Temporal Purity

Y achieves **Temporal Purity** by:
1. No mutable counters
2. No external control flow
3. Time emerges from recursive unfolding
4. Each iteration is a new moment, not a mutation

## Conclusion

The Y-Combinator transforms crude loops into elegant self-reference. It proves that recursion is not a programming trick, but a fundamental property of computation itself. Through Y, functions achieve self-knowledge without self-mutation.

---

*"To recurse is to know thyself, infinitely"*