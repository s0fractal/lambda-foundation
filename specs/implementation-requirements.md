# Implementation Requirements for Lambda-Foundation

## Mandatory Constraints

Any language implementation (lambda-ts, lambda-js, lambda-rust, etc.) MUST:

### 1. NO Imperative Constructs

**FORBIDDEN**:
- ❌ `for`, `while`, `do-while` loops
- ❌ `var`, `let` with reassignment  
- ❌ `array[i] = value` mutations
- ❌ `object.field = value` mutations
- ❌ `try-catch-finally` blocks
- ❌ `class`, `extends`, `implements`
- ❌ `throw new Error()`
- ❌ `++`, `--`, `+=`, `-=` operators

**REQUIRED**:
- ✅ Only `const` bindings
- ✅ Y combinator for recursion
- ✅ New objects/arrays for updates
- ✅ λ_HARVEST for error evolution

### 2. The Seven Morphisms Implementation

Each implementation MUST provide:

```typescript
// Example for lambda-ts
type Morphism<A, B> = (a: A) => B;

const I: <T>(x: T) => T;           // Identity
const APP: <A,B>(f: (a: A) => B) => (x: A) => B; // Application
const ABS: <A,B>(body: (a: A) => B) => Morphism<A,B>; // Abstraction
const AND: (p: Bool) => (q: Bool) => Bool;  // Conjunction
const NOT: (p: Bool) => Bool;      // Negation  
const SEL: <T>(p: Bool) => (a: T) => (b: T) => T; // Selection
const PAIR: <A,B>(x: A) => (y: B) => Pair<A,B>; // Pairing
```

### 3. Conservation of Flow Verification

Implementations MUST provide tools to verify:
- Every function has explicit input/output types
- No hidden side effects
- No null/undefined leaks
- Total functions (no partial application errors)

### 4. Error Evolution Protocol

Replace exceptions with evolution:

```typescript
// FORBIDDEN
try {
  dangerousOperation();
} catch (e) {
  handleError(e);
}

// REQUIRED
const result = λ_HARVEST
  (dangerousOperation)
  (context)
  (errorHandler);
```

### 5. State Threading Pattern

All "stateful" operations must thread state explicitly:

```typescript
// FORBIDDEN
let counter = 0;
function increment() { counter++; }

// REQUIRED
const increment = (counter: number): number => counter + 1;
const state1 = increment(0);  // 1
const state2 = increment(state1); // 2
```

### 6. Recursion via Y Combinator

```typescript
// FORBIDDEN
function factorial(n) {
  if (n === 0) return 1;
  return n * factorial(n - 1);
}

// REQUIRED  
const factorial = Y((f: (n: number) => number) => 
  (n: number) =>
    SEL(EQUALS(n)(0))
      (() => 1)
      (() => MULT(n)(f(PRED(n))))()
);
```

### 7. Data Structure Requirements

- Arrays → Linked lists via PAIR
- Objects → Nested PAIRs with string keys
- Maps → Binary trees of PAIRs
- Sets → Lists with uniqueness predicate

## Testing Requirements

Each implementation MUST pass:

1. **Morphism Laws Test Suite**
   - Identity laws
   - Composition laws
   - Distribution laws

2. **Conservation Tests**
   - Flow analysis
   - Type preservation
   - No mutation detection

3. **Church-Rosser Tests**
   - Confluence verification
   - Normal form uniqueness
   - Parallel reduction safety

4. **Performance Benchmarks**
   - Reduction count metrics
   - Memory allocation tracking
   - Parallelization efficiency

## Build System Requirements

- NO webpack, rollup, or bundlers that assume imperative code
- Pure functional build pipeline
- Morphism-aware optimizer
- Hex-Torus topology visualizer

## Documentation Requirements

Each function MUST document:
1. Morphism decomposition
2. Port configuration  
3. Reduction cost
4. Error evolution behavior
5. Topological representation

## Example Implementation Structure

```
/lambda-ts/
  /src/
    /core/
      seven-morphisms.ts    # The Seven
      y-combinator.ts       # Recursion
      harvest.ts            # Error evolution
    /composite/
      arithmetic.ts         # ADD, MULT, etc
      lists.ts             # List operations
      logic.ts             # Extended boolean ops
    /transform/
      compiler.ts          # TS → Lambda
      optimizer.ts         # β-reduction
      visualizer.ts        # Hex-Torus view
  /tests/
    morphism-laws.test.ts
    conservation.test.ts
    church-rosser.test.ts
```

## Certification

An implementation is certified when:
1. Zero imperative constructs detected
2. All tests pass
3. Conservation of Flow verified
4. Documentation complete
5. Community review approved

---

*"The language binds, but the Lambda liberates"*