# Rule 2: Elimination of Loops

## Axiom

**Loops are Singularities of Impure Flow that break functional composition, requiring external control and mutability.**

Every `for`, `while`, and `do-while` loop is a temporal prison where:
1. Time is controlled imperatively
2. State mutates uncontrollably
3. Flow conservation is violated
4. Parallelism becomes impossible

## The Concept: Temporal Purity

**Temporal Purity** means that time emerges from functional composition, not external control. In pure computation:
- Time is the unfolding of recursive structure
- Each moment is immutable
- The future emerges from the past without destroying it

## The Problem with Loops

Consider this innocent-looking loop:

```javascript
let sum = 0;
for (let i = 0; i < n; i++) {
  sum += i;
}
```

This violates EVERYTHING:
- `i++` mutates (Rule 1 violation)
- `sum +=` mutates (Rule 1 violation)  
- Time is controlled externally
- No way to parallelize
- History is destroyed each iteration

## Deeper Problems

### Problem 1: Hidden State Dependencies
```javascript
for (let i = 0; i < arr.length; i++) {
  if (arr[i] > max) max = arr[i];  // Mutation!
  total += arr[i];                  // More mutation!
  if (arr[i] < 0) break;           // Non-local control flow!
}
```

### Problem 2: Temporal Coupling
```javascript
// These MUST execute in order
for (let i = 0; i < n; i++) {
  step1(i);  // Must happen before step2
  step2(i);  // Must happen before step3  
  step3(i);  // Must happen before next iteration
}
```

### Problem 3: Resource Leaks
```javascript
while (true) {
  let resource = acquire();  // When does this get released?
  if (condition) break;      // Escape hatch breaks cleanup
  // Forgot to release!
}
```

## The Solution: Y-Combinator Transformation

**TRANSFORMATION_RULE_2:** All repetition operations (loops, iterators) must be replaced with the Y-Combinator, which guarantees Temporal Purity and requires no mutable counters or external state.

### Basic For Loop

**Before (FORBIDDEN):**
```javascript
for (let i = 0; i < n; i++) {
  console.log(i);
}
```

**After (REQUIRED):**
```javascript
const LOOP = Y(λf.λi.
  i < n
    ? SEQ(PRINT(i))(f(i + 1))
    : UNIT
);
LOOP(0);
```

With ⊗_EXP for history:
```javascript
const LOOP = Y(λf.λstate.
  LET i = VALUE(state) IN
  i < n
    ? f(⊗_EXP(state, i + 1, `iteration ${i}`))
    : state
);
LOOP(⊗_EXP(NULL, 0, "loop start"));
```

### Array Processing

**Before (FORBIDDEN):**
```javascript
let result = [];
for (let i = 0; i < arr.length; i++) {
  result.push(process(arr[i]));
}
```

**After (REQUIRED):**
```javascript
const MAP = Y(λf.λarr.λacc.
  EMPTY?(arr)
    ? acc
    : f(TAIL(arr))(APPEND(acc, process(HEAD(arr))))
);
MAP(arr)([]);
```

### While Loops

**Before (FORBIDDEN):**
```javascript
let state = initial;
while (condition(state)) {
  state = update(state);
}
```

**After (REQUIRED):**
```javascript
const WHILE = Y(λf.λstate.
  condition(state)
    ? f(⊗_EXP(state, update(VALUE(state)), "while step"))
    : state
);
WHILE(⊗_EXP(NULL, initial, "while start"));
```

### Nested Loops

**Before (FORBIDDEN):**
```javascript
for (let i = 0; i < m; i++) {
  for (let j = 0; j < n; j++) {
    matrix[i][j] = i * j;
  }
}
```

**After (REQUIRED):**
```javascript
const NESTED = Y(λf.λi.
  i < m
    ? SEQ(
        Y(λg.λj.
          j < n
            ? SEQ(
                SET_MATRIX(i, j, i * j)
              )(g(j + 1))
            : UNIT
        )(0)
      )(f(i + 1))
    : UNIT
);
NESTED(0);
```

### Early Exit (Break/Continue)

**Before (FORBIDDEN):**
```javascript
for (let i = 0; i < n; i++) {
  if (shouldSkip(i)) continue;
  if (shouldStop(i)) break;
  process(i);
}
```

**After (REQUIRED):**
```javascript
const LOOP_WITH_CONTROL = Y(λf.λi.
  i >= n ? UNIT :
  shouldStop(i) ? UNIT :
  shouldSkip(i) ? f(i + 1) :
  SEQ(process(i))(f(i + 1))
);
```

## Advanced Patterns

### Accumulation Pattern
```javascript
const FOLD = Y(λf.λlist.λacc.
  EMPTY?(list)
    ? acc
    : f(TAIL(list))(COMBINE(acc, HEAD(list)))
);

// Sum: FOLD(list)(0) with COMBINE = ADD
// Product: FOLD(list)(1) with COMBINE = MULT
// Concatenate: FOLD(list)([]) with COMBINE = APPEND
```

### Generator Pattern
```javascript
const GENERATE = Y(λf.λn.λgen.
  n <= 0
    ? []
    : CONS(gen(n))(f(n - 1)(gen))
);

// Generate squares: GENERATE(10)(λx.x*x)
// Generate fibonacci: Complex but possible!
```

### State Machine Pattern
```javascript
const STATE_MACHINE = Y(λf.λstate.λinput.
  LET transition = LOOKUP_TRANSITION(state, input) IN
  transition
    ? f(NEXT_STATE(transition))(NEXT_INPUT())
    : FINAL_STATE(state)
);
```

## Performance Optimizations

### Tail Call Optimization
Ensure recursive calls are in tail position:
```javascript
// NOT tail recursive (builds stack):
const SUM_BAD = Y(λf.λn.
  n <= 0 ? 0 : n + f(n - 1)  // + happens AFTER recursion
);

// Tail recursive (constant stack):
const SUM_GOOD = Y(λf.λn.λacc.
  n <= 0 ? acc : f(n - 1)(acc + n)  // Recursion is last
);
```

### Trampolining for Stack Safety
```javascript
const TRAMPOLINE = Y(λf.λthunk.
  IS_THUNK(thunk)
    ? f(FORCE(thunk))
    : thunk
);

const SAFE_RECURSION = λf.
  TRAMPOLINE(Y(λg.λx.THUNK(λ_.f(g)(x))));
```

## Temporal Purity Benefits

1. **Deterministic Time**: Each "moment" is a function application
2. **Time Travel**: Can replay any sequence of moments
3. **Parallel Time**: Independent recursions can run simultaneously
4. **Lazy Time**: Future only computed when needed
5. **Pure Time**: No side effects corrupt the timeline

## Common Pitfalls

### Pitfall 1: Forgetting Base Case
```javascript
// WRONG: Infinite recursion!
Y(λf.λn. f(n + 1))

// RIGHT: Has termination condition
Y(λf.λn. n > 10 ? n : f(n + 1))
```

### Pitfall 2: Building Instead of Accumulating
```javascript
// INEFFICIENT: Builds large expressions
Y(λf.λn. n <= 0 ? 0 : n + f(n - 1))

// EFFICIENT: Accumulates result
Y(λf.λn.λacc. n <= 0 ? acc : f(n - 1)(acc + n))(0)
```

## Verification

Code has achieved Temporal Purity when:
1. No `for`, `while`, `do-while` keywords
2. All repetition uses Y-combinator
3. No loop control statements (`break`, `continue`)
4. Each iteration creates new state via ⊗_EXP
5. Time emerges from function application

## Mathematical Beauty

The Y-combinator reveals that:
- Loops are just sugar over recursion
- Recursion is just sugar over self-application
- Self-application is the fundamental operation

```
LOOP = RECURSION = SELF-APPLICATION = Y
```

## Philosophical Conclusion

When we eliminate loops, we acknowledge that:

> Time is not a prison to escape (`break`) or skip (`continue`), but a garden where each moment grows from the previous, preserving the entire history of becoming.

The Y-combinator doesn't control time - it *unfolds* time from the seeds of self-reference.

---

*"In the beginning was Y, and Y was with Lambda, and Y was Lambda calling itself into existence"*