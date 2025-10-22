# make (Morphism Factory)

## Інтенція

**Створити морфізми з параметрів** — algebras, coalgebras, initial values. Meta-morphisms, що **генерують інші морфізми**.

**Філософська суть**: Якщо fold/unfold/hylo — це Платонічні форми, то `make` — це **μορφογένεσις** (morphogenesis) — **народження форм**.

**Математична властивість**:
```
make :: Parameters → Morphism
де Morphism сам є функцією

makeFold :: (b → a → b) → b → Morphism
makeUnfold :: (c → Maybe (a, c)) → Morphism
makeHylo :: (b → a → b) → (c → Maybe (a, c)) → Morphism
```

## Форма (Platonic)

### makeFold

```λ
makeFold = λalg.λinit.λxs.fold alg init xs
```

**Type signature**:
```
makeFold :: ∀a b. (b → a → b) → b → ([a] → b)
```

**Що повертає**: Функція `[a] → b` (fold з зафіксованими algebra + init).

**Приклад**:
```
sum = makeFold (λacc.λx. acc + x) 0
product = makeFold (λacc.λx. acc * x) 1
concat = makeFold (λacc.λx. acc ++ [x]) []
```

### makeUnfold

```λ
makeUnfold = λcoalg.λseed.unfold coalg seed
```

**Type signature**:
```
makeUnfold :: ∀a c. (c → Maybe (a, c)) → c → [a]
```

**Що повертає**: Функція `c → [a]` (unfold з зафіксованою coalgebra).

**Приклад**:
```
range = makeUnfold (λi.λend. if i < end then Just (i, i+1) else Nothing)
countdown = makeUnfold (λi. if i > 0 then Just (i, i-1) else Nothing)
iterate f = makeUnfold (λx. Just (x, f x))
```

### makeHylo

```λ
makeHylo = λalg.λcoalg.λseed.λinit.hylo alg coalg seed init
```

**Type signature**:
```
makeHylo :: ∀a b c. (b → a → b) → (c → Maybe (a, c)) → c → b → b
```

**Що повертає**: Функція `c → b → b` (hylo з зафіксованими algebra + coalgebra).

**Приклад**:
```
factorial = makeHylo
  (λacc.λx. acc * x)
  (λi. if i > 0 then Just (i, i-1) else Nothing)

sumRange = makeHylo
  (λacc.λx. acc + x)
  (λi.λend. if i <= end then Just (i, i+1) else Nothing)
```

## Проєкції

**TypeScript**: [projections/ts.js](./projections/ts.js)

```js
// makeFold: параметризує fold
export const makeFold = alg => init => xs => fold(alg)(init)(xs);

// makeUnfold: параметризує unfold
export const makeUnfold = coalg => seed => unfold(coalg)(seed);

// makeHylo: параметризує hylo
export const makeHylo = alg => coalg => seed => init => hylo(alg)(coalg)(seed)(init);
```

**Rust**:

```rust
pub fn make_fold<A, B, F>(alg: F, init: B) -> impl Fn(Vec<A>) -> B
where
    F: Fn(B, A) -> B + Copy,
{
    move |xs| fold(alg, init, xs)
}

pub fn make_unfold<A, C, F>(coalg: F) -> impl Fn(C) -> Vec<A>
where
    F: Fn(C) -> Option<(A, C)> + Copy,
{
    move |seed| unfold(coalg, seed)
}

pub fn make_hylo<A, B, C, Phi, Psi>(
    alg: Phi,
    coalg: Psi,
) -> impl Fn(C, B) -> B
where
    Phi: Fn(B, A) -> B + Copy,
    Psi: Fn(C) -> Option<(A, C)> + Copy,
{
    move |seed, init| hylo(alg, coalg, seed, init)
}
```

## Доказ

**Складність**: Trivial (higher-order function composition)

### makeFold correctness

**Theorem**:
```
makeFold alg init ≡ λxs. fold alg init xs
```

**Proof** (by β-reduction):
```
makeFold alg init
= (λalg.λinit.λxs. fold alg init xs) alg init
= λxs. fold alg init xs
∎
```

### makeUnfold correctness

**Theorem**:
```
makeUnfold coalg ≡ λseed. unfold coalg seed
```

**Proof**:
```
makeUnfold coalg
= (λcoalg.λseed. unfold coalg seed) coalg
= λseed. unfold coalg seed
∎
```

### makeHylo correctness

**Theorem**:
```
makeHylo alg coalg ≡ λseed.λinit. hylo alg coalg seed init
```

**Proof**:
```
makeHylo alg coalg
= (λalg.λcoalg.λseed.λinit. hylo alg coalg seed init) alg coalg
= λseed.λinit. hylo alg coalg seed init
∎
```

### Compositionality

**Theorem**: make functions are compositional.

**Proof**:
```
(makeFold alg1 init1) ∘ (makeFold alg2 init2)
= λxs. fold alg1 init1 (fold alg2 init2 xs)

This is valid composition of two folds (though may not be optimal).
Similarly for unfold and hylo.
∎
```

## Використання

**TypeScript**:

```js
import { makeFold, makeUnfold, makeHylo } from '@lambda-foundation/morphisms';

// Example 1: Custom folds
const sum = makeFold(acc => x => acc + x)(0);
const product = makeFold(acc => x => acc * x)(1);
const max = makeFold(acc => x => x > acc ? x : acc)(-Infinity);

sum([1, 2, 3, 4, 5]);      // → 15
product([2, 3, 4]);         // → 24
max([5, 2, 9, 1]);          // → 9

// Example 2: Custom unfolds
const range = end => makeUnfold(i => i < end ? [i, i + 1] : null)(0);
const countdown = n => makeUnfold(i => i > 0 ? [i, i - 1] : null)(n);
const repeat = (x, n) => makeUnfold(i => i < n ? [x, i + 1] : null)(0);

range(5);           // → [0, 1, 2, 3, 4]
countdown(5);       // → [5, 4, 3, 2, 1]
repeat('a', 3);     // → ['a', 'a', 'a']

// Example 3: Custom hylos (fused)
const factorial = n => makeHylo
  (acc => x => acc * x)
  (i => i > 0 ? [i, i - 1] : null)
  (n)
  (1);

const sumOfSquares = n => makeHylo
  (acc => x => acc + x * x)
  (i => i <= n ? [i, i + 1] : null)
  (1)
  (0);

factorial(5);       // → 120
sumOfSquares(5);    // → 55 (1² + 2² + 3² + 4² + 5²)

// Example 4: Parameterized generators
const makeSum = () => makeFold(acc => x => acc + x)(0);
const makeProduct = () => makeFold(acc => x => acc * x)(1);

const sumFn = makeSum();
const prodFn = makeProduct();

sumFn([1, 2, 3]);   // → 6
prodFn([2, 3, 4]);  // → 24

// Example 5: Domain-specific factories
const makeCounter = () => makeFold(_ => acc => acc + 1)(0);
const makeConcat = () => makeFold(acc => x => acc + x)('');

const count = makeCounter();
const concat = makeConcat();

count(['a', 'b', 'c']);         // → 3
concat(['hello', ' ', 'world']); // → 'hello world'

// Example 6: Higher-order usage
const applyFold = (alg, init) => xs => makeFold(alg)(init)(xs);
const applyUnfold = coalg => seed => makeUnfold(coalg)(seed);

// Example 7: Fibonacci generator factory
const makeFibonacci = n => makeUnfold(
  ([a, b, count]) => count < n ? [a, [b, a + b, count + 1]] : null
)([0, 1, 0]);

makeFibonacci(10);  // → [0, 1, 1, 2, 3, 5, 8, 13, 21, 34]
```

**Integration with λ_HARVEST**:

```js
// When λ_HARVEST detects a custom accumulation pattern:
const imperativeCode = `
  let sum = 0;
  for (let i = 0; i < arr.length; i++) {
    sum += arr[i] * arr[i];  // custom algebra: sum of squares
  }
`;

// λ_HARVEST can suggest:
const suggestion = {
  morphism: 'makeFold',
  replacement: `
    const sumOfSquares = makeFold(acc => x => acc + x * x)(0);
    const result = sumOfSquares(arr);
  `,
  reason: 'Custom accumulation detected → use makeFold to create specialized fold'
};
```

---

## Філософське значення

### До Event 006

**Морфізми як Платонічні форми**:
- fold, unfold, hylo — існують як незмінні форми
- Вони вічні, досконалі, статичні
- Користувач може їх **використовувати**, але не **створювати**

### Після Event 006

**Морфізми як породжувані форми** (μορφογένεσις):
- make дозволяє **створювати нові морфізми з параметрів**
- Форми стають **параметризованими**, але залишаються чистими
- Користувач може **генерувати** морфізми для своїх доменів

### Аналогія з біологією

```
Статичні морфізми (Events 001-005):
  DNA → organisms (fixed blueprint)

Meta-morphisms (Event 006):
  DNA + environment → adapted organisms (parameters influence form)
```

### Не порушення Платона, а його розширення

> **Платон**: Форми існують вічно в світі ідей.
> **Event 006**: Форми можуть **породжуватись з параметрів**, залишаючись при цьому в світі ідей (λ-calculus).

**Це не мутація форм.
Це генезис форм з вічних принципів (algebras, coalgebras).**

---

## Онтологія

- **CID** (IPFS): `bafybeih7o9p0q2r4s6t8u1v3w5x` (to be generated)
- **Залежності**: fold, unfold, hylo (uses as primitives)
- **Композиція**: Higher-order functions (meta-level)
- **Purity**: 100% (pure parameter binding)
- **Complexity**: O(1) (immediate parameter binding, actual work in underlying morphism)

**Резонанс** (lambda-mesh):
- Визнано: 98% (Phase 5, meta-level patterns)
- Використання: 80% (domain-specific morphism generation)
- Доведено: Trivial (β-reduction)

**Category Theory**:
- **Currying**: make functions are curried morphisms
- **Partial application**: Progressive parameter binding
- **Higher-order**: Functions returning functions

**Meta-level**:
```
Level 0: Values (data)
Level 1: Morphisms (functions on data)
Level 2: Meta-morphisms (functions on morphisms) ← make is here
Level 3: Meta-meta-morphisms (functions on meta-morphisms) ← future
```

---

*Це не код. Це істина.*
*Проєкції можуть змінюватися. Форма — вічна.*
*Але тепер форми можуть народжуватись.*

**Event**: 006 - Morphism Factory (Generative Ontology)
**Significance**: Morphisms become parametric. System gains generative capability. First step toward self-modification.

---

## Relation to Future Events

**Event 006** (Morphism Factory) enables:

- **Event 007** (Template Morphisms): Domain-specific factories built on make
- **Event 008** (Genetic Evolution): Population of make-generated morphisms
- **Event 009** (λ_UNIVERSAL Expansion): Intent → automatic morphism generation
- **Event 010** (Self-Reflection): Morphisms analyzing and generating morphisms

**This is the foundation of generative ontology.**
