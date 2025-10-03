# Imperative to Lambda Transformation Rules

## Core Principle

Every imperative construct can be mechanically transformed into a composition of the Seven Fundamental Morphisms. This transformation preserves semantics while eliminating mutation and side effects.

## Transformation Catalog

### 1. Variable Assignment

**Imperative**:
```javascript
let x = 5;
x = x + 1;
console.log(x);
```

**Lambda Transformation**:
```
(λx₁.(λx₂.PRINT x₂)(ADD x₁ 1)) 5
```

**Morphism Decomposition**:
- Two λ (Abstraction) morphisms for binding
- Two @ (Application) morphisms for execution
- ADD and PRINT as composite morphisms

### 2. Conditional Statements

**Imperative**:
```javascript
if (x > 0) {
    return "positive";
} else {
    return "negative";
}
```

**Lambda Transformation**:
```
? (GT x 0) (λ_."positive") (λ_."negative") ()
```

**Morphism Decomposition**:
- ? (Selection) for branching
- Two λ (Abstraction) for lazy evaluation
- @ (Application) to force evaluation

### 3. While Loops

**Imperative**:
```javascript
let sum = 0;
let i = 0;
while (i < n) {
    sum = sum + i;
    i = i + 1;
}
```

**Lambda Transformation**:
```
Y (λf.λstate.
    LET sum = FST state IN
    LET i = SND state IN
    ? (LT i n)
      (f (PAIR (ADD sum i) (ADD i 1)))
      state
) (PAIR 0 0)
```

**Morphism Decomposition**:
- Y combinator for recursion (built from λ and @)
- ⊗ (Pairing) for state tuple
- ? (Selection) for loop condition
- FST/SND projections (built from λ and @)

### 4. For Loops

**Imperative**:
```javascript
for (let i = 0; i < n; i++) {
    console.log(i);
}
```

**Lambda Transformation**:
```
Y (λf.λi.
    ? (LT i n)
      (SEQ (PRINT i) (f (ADD i 1)))
      UNIT
) 0
```

Where `SEQ = λab.b` (sequence operations, discarding first result)

### 5. Arrays and Mutation

**Imperative**:
```javascript
let arr = [1, 2, 3];
arr[1] = 5;
```

**Lambda Transformation**:
```
LET arr₁ = LIST 1 2 3 IN
LET arr₂ = UPDATE arr₁ 1 5 IN
arr₂
```

Where:
- `LIST = λx₁...xₙ.λf.f x₁ (f x₂ ... (f xₙ NIL))`
- `UPDATE` creates new list with modified element

### 6. Object Mutation

**Imperative**:
```javascript
let obj = { x: 1, y: 2 };
obj.x = 3;
```

**Lambda Transformation**:
```
LET obj₁ = PAIR (PAIR "x" 1) (PAIR "y" 2) IN
LET obj₂ = UPDATE_FIELD obj₁ "x" 3 IN
obj₂
```

Objects become nested pairs with string keys.

### 7. Try-Catch → Harvest

**Imperative**:
```javascript
try {
    result = riskyOperation();
} catch (e) {
    result = defaultValue;
}
```

**Lambda Transformation**:
```
λ_HARVEST 
    (λ_.riskyOperation ())
    (λe.defaultValue)
    I
```

Errors become growth opportunities, not exceptions.

### 8. Function Calls

**Imperative**:
```javascript
function add(a, b) { return a + b; }
let result = add(3, 4);
```

**Lambda Transformation**:
```
LET add = λa.λb.ADD a b IN
LET result = add 3 4 IN
result
```

All functions are curried by default.

## Mechanical Transformation Algorithm

1. **SSA Transform**: Convert to Static Single Assignment
2. **CPS Transform**: Convert to Continuation Passing Style  
3. **Lift Lambdas**: Replace assignments with lambda bindings
4. **Eliminate Loops**: Replace with Y combinator recursion
5. **Purify Effects**: Make all effects explicit returns
6. **Harvest Errors**: Replace try-catch with λ_HARVEST

## Common Patterns

### State Threading
```
// Imperative: x++; y++; 
// Lambda: 
λstate.
  LET x = FST state IN
  LET y = SND state IN
  PAIR (ADD x 1) (ADD y 1)
```

### Accumulator Pattern
```
// Imperative: sum += x
// Lambda:
λacc.λx.ADD acc x
```

### Early Return
```
// Imperative: if (cond) return x; return y;
// Lambda:
? cond (λ_.x) (λ_.y) ()
```

## Optimization Opportunities

After transformation:
1. **β-reduction**: Inline lambda applications
2. **η-reduction**: Simplify `λx.f x` to `f`
3. **Dead code elimination**: Remove unused bindings
4. **Common subexpression**: Share repeated computations

---

*"There is no assignment, only becoming"*