# Formal Proofs: ⊗_EXP Experience Morphism Invariants

**Related Theory**: [09-experience.md](../morphisms/09-experience.md)
**Implementation**: [`lambda-ts/src/core/experience.ts`](../../lambda-ts/src/core/experience.ts)

## Theorem 1: History Immutability

**Statement**: Once an experience is created, its complete history is immutable and always accessible.

**Formal Definition**:
```
∀ exp : Experience<T>, ∀ t : Time :
  history(exp, t) = history(exp, t+n) ∩ [0, t]
```

**Proof**:

1. By construction, `experience()` creates a closure that captures:
   ```typescript
   experience(prev, val, ctx) = λselector. selector(prev, val, ctx)
   ```

2. The closure has no mutable references - all parameters are captured by value

3. Projection functions only read, never modify:
   ```typescript
   PREVIOUS(exp) = exp((p, _, _) => p)
   VALUE(exp)    = exp((_, v, _) => v)
   CONTEXT(exp)  = exp((_, _, c) => c)
   ```

4. New experiences always construct new closures:
   ```typescript
   exp₂ = experience(exp₁, val₂, ctx₂)
   // exp₁ remains unchanged
   ```

5. Therefore, history is append-only and immutable. ∎

**Implementation Verification**:
```typescript
// Test in lambda-ts/src/core/experience.ts
const exp1 = experience(null, "a", "init");
const exp2 = experience(exp1, "b", "update");
// exp1 === PREVIOUS(exp2) ✓
// exp1's VALUE still "a" ✓
```

---

## Theorem 2: Complete History Accessibility

**Statement**: Given any experience, its complete history can be reconstructed.

**Formal Definition**:
```
∀ exp : Experience<T> :
  unfoldHistory(exp) = [(v₀, c₀), (v₁, c₁), ..., (vₙ, cₙ)]
  where exp = ⊗_EXP(...⊗_EXP(⊗_EXP(null, v₀, c₀), v₁, c₁)..., vₙ, cₙ)
```

**Proof**:

1. Base case: `exp = experience(null, v, c)`
   ```
   unfoldHistory(exp) = [(v, c)]
   ```

2. Inductive hypothesis: Assume true for experience of depth n
   ```
   unfoldHistory(expₙ) = [(v₀, c₀), ..., (vₙ, cₙ)]
   ```

3. Inductive step: For expₙ₊₁ = experience(expₙ, vₙ₊₁, cₙ₊₁)
   ```typescript
   unfoldHistory(expₙ₊₁) =
     unfoldHistory(PREVIOUS(expₙ₊₁)) ++ [(VALUE(expₙ₊₁), CONTEXT(expₙ₊₁))]
   = unfoldHistory(expₙ) ++ [(vₙ₊₁, cₙ₊₁)]
   = [(v₀, c₀), ..., (vₙ, cₙ), (vₙ₊₁, cₙ₊₁)]
   ```

4. By induction, true for all finite depths. ∎

**Implementation**:
```typescript
export const unfoldHistory = <T>(exp: Experience<T> | null): Array<{
  value: T;
  context: string;
}> => {
  if (exp === null) return [];

  const current = {
    value: VALUE(exp),
    context: CONTEXT(exp)
  };

  const previous = PREVIOUS(exp);
  return [...unfoldHistory(previous), current];
};
```

---

## Theorem 3: Depth Measurement

**Statement**: The depth function correctly counts the number of experiences in a chain.

**Formal Definition**:
```
depth : Experience<T> → ℕ
depth(null) = 0
depth(experience(prev, _, _)) = 1 + depth(prev)
```

**Proof**:

1. Base case: `depth(null) = 0` by definition

2. Inductive step:
   ```
   Let exp = experience(prev, val, ctx)
   depth(exp) = 1 + depth(prev)
   ```

3. By definition of PREVIOUS:
   ```
   PREVIOUS(exp) = prev
   Therefore: depth(exp) = 1 + depth(PREVIOUS(exp))
   ```

4. This matches the implementation exactly. ∎

**Property**:
```
length(unfoldHistory(exp)) = depth(exp)
```

---

## Theorem 4: Time Travel Correctness

**Statement**: Rewinding n steps gives the experience that existed n steps ago.

**Formal Definition**:
```
∀ exp : Experience<T>, ∀ n : ℕ where n ≤ depth(exp) :
  rewind(exp, n) = expₐₑₚₜₕ₍ₑₓₚ₎₋ₙ
```

**Proof**:

1. Base case: `rewind(exp, 0) = exp` ✓

2. Inductive step for n+1:
   ```
   rewind(exp, n+1) = rewind(PREVIOUS(exp), n)
   ```

3. By induction hypothesis, this equals the experience at depth(exp) - (n+1)

4. Implementation:
   ```typescript
   export const rewind = <T>(exp: Experience<T> | null, steps: number): Experience<T> | null => {
     if (steps <= 0 || exp === null) return exp;
     return rewind(PREVIOUS(exp), steps - 1);
   };
   ```

5. This matches the recursive definition. ∎

**Property**: For all valid n:
```
depth(rewind(exp, n)) = depth(exp) - n
```

---

## Theorem 5: Map Preservation

**Statement**: Mapping over experience preserves structure and history length.

**Formal Definition**:
```
∀ exp : Experience<T>, ∀ f : (T, String) → U :
  depth(mapExperience(exp, f)) = depth(exp)
  ∧
  ∀ i : [0, depth(exp)) :
    CONTEXT(at(mapExperience(exp, f), i)) = CONTEXT(at(exp, i))
```

**Proof**:

1. Base case: `mapExperience(null, f) = null` ✓

2. Inductive step:
   ```typescript
   mapExperience(exp, f) = experience(
     mapExperience(PREVIOUS(exp), f),
     f(VALUE(exp), CONTEXT(exp)),
     CONTEXT(exp)  // Context preserved!
   )
   ```

3. By induction:
   ```
   depth(mapExperience(exp, f))
     = 1 + depth(mapExperience(PREVIOUS(exp), f))
     = 1 + depth(PREVIOUS(exp))
     = depth(exp)
   ```

4. Context preservation follows directly from the implementation. ∎

---

## Theorem 6: Context Search Correctness

**Statement**: findByContext returns the first experience with matching context.

**Formal Definition**:
```
∀ exp : Experience<T>, ∀ ctx : String :
  findByContext(exp, ctx) =
    if CONTEXT(exp) = ctx then exp
    else findByContext(PREVIOUS(exp), ctx)
```

**Proof**: Direct from implementation - follows recursive search pattern. ∎

---

## Property-Based Testing

These theorems can be verified with QuickCheck-style property tests:

```typescript
// Property 1: History is immutable
property("history immutability", () => {
  const exp1 = experience(null, randomValue(), randomContext());
  const history1 = unfoldHistory(exp1);
  const exp2 = experience(exp1, randomValue(), randomContext());
  const history2 = unfoldHistory(exp2);

  return isPrefix(history1, history2);
});

// Property 2: Depth matches length
property("depth = length", () => {
  const exp = randomExperience();
  return depth(exp) === unfoldHistory(exp).length;
});

// Property 3: Rewind compositionality
property("rewind(rewind(x, m), n) = rewind(x, m+n)", () => {
  const exp = randomExperience();
  const m = randomInt(0, depth(exp));
  const n = randomInt(0, depth(exp) - m);

  return rewind(rewind(exp, m), n) === rewind(exp, m + n);
});

// Property 4: Map preserves depth
property("map preserves depth", () => {
  const exp = randomExperience();
  const f = randomFunction();

  return depth(mapExperience(exp, f)) === depth(exp);
});
```

---

## Open Questions

1. **Memory Complexity**: What is the optimal structural sharing strategy?
2. **Infinite Chains**: Can we extend to infinite experience chains with lazy evaluation?
3. **Branching Histories**: How to handle alternative timelines?
4. **Garbage Collection**: When is it safe to prune old experiences?

---

## References

- Original λ-calculus: Church (1936)
- Persistent data structures: Okasaki (1996)
- Zipper data structure: Huet (1997)
- Event sourcing: Young (2010)

---

*"To prove is to understand. To understand is to create correctly."*

🔬∞λ
