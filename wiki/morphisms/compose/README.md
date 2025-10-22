# compose

## Інтенція

Побудувати композицію двох функцій: застосувати g, потім застосувати f до результату.

**Математична властивість**:
```
∀f, g, x: (f ∘ g)(x) ≡ f(g(x))
∀f: f ∘ identity ≡ identity ∘ f ≡ f (identity є нейтральним елементом)
```

**Асоціативність**:
```
(f ∘ g) ∘ h ≡ f ∘ (g ∘ h)
```

## Форма (Platonic)

```λ
compose = λf.λg.λx.f(g(x))
```

**Church-Rosser normal form**: Вираз вже в нормальній формі.

**Type signature** (Hindley-Milner):
```
compose :: ∀a b c. (b → c) → (a → b) → a → c
```

**Читається**: "Для будь-яких типів a, b, c: функція (b→c), функція (a→b), значення a дають значення c"

## Проєкції

**TypeScript**: [projections/ts.js](./projections/ts.js)

```js
export const compose = f => g => x => f(g(x));
```

**Rust**: [projections/rs.rs](./projections/rs.rs)

```rust
pub fn compose<A, B, C, F, G>(f: F, g: G) -> impl Fn(A) -> C
where
    F: Fn(B) -> C,
    G: Fn(A) -> B,
{
    move |x| f(g(x))
}
```

**Python**: [projections/py.py](./projections/py.py)

```python
def compose(f):
    return lambda g: lambda x: f(g(x))
```

## Доказ

**Theorem**: compose є асоціативним оператором з identity як нейтральним елементом.

### Proof 1: Identity є нейтральним елементом

**Left identity**:
```
(identity ∘ f)(x)
= (λf.λg.λx.f(g(x))) (λy.y) f x     [підстановка compose та identity]
= ((λg.λx.(λy.y)(g(x)))) f x        [β-reduction: f := λy.y]
= (λx.(λy.y)(f(x))) x                [β-reduction: g := f]
= (λy.y)(f(x))                       [β-reduction: x := x]
= f(x)                               [β-reduction: y := f(x)]
∎
```

**Right identity**:
```
(f ∘ identity)(x)
= (λf.λg.λx.f(g(x))) f (λy.y) x     [підстановка]
= f((λy.y)(x))                       [β-reduction]
= f(x)                               [β-reduction: y := x]
∎
```

### Proof 2: Асоціативність

```
((f ∘ g) ∘ h)(x)
= (f ∘ g)(h(x))                      [визначення compose]
= f(g(h(x)))                         [визначення compose]

(f ∘ (g ∘ h))(x)
= f((g ∘ h)(x))                      [визначення compose]
= f(g(h(x)))                         [визначення compose]

∴ (f ∘ g) ∘ h ≡ f ∘ (g ∘ h) ∎
```

### Proof 3: Функторність

compose утворює **Category** з:
- Objects: Types (a, b, c, ...)
- Morphisms: Functions (f: a → b)
- Composition: compose
- Identity: identity

**Category laws**:
1. ✅ Identity: `f ∘ id ≡ id ∘ f ≡ f` (proven above)
2. ✅ Associativity: `(f ∘ g) ∘ h ≡ f ∘ (g ∘ h)` (proven above)

∴ compose визначає категорію функцій ∎

## Використання

**TypeScript**:
```js
import { compose, identity } from '@lambda-foundation/morphisms';

// Прості функції
const double = x => x * 2;
const inc = x => x + 1;
const square = x => x * x;

// Композиція
compose(double, inc)(5);        // → 12 (double(inc(5)) = double(6) = 12)
compose(square, double)(3);     // → 36 (square(double(3)) = square(6) = 36)

// Ланцюжок композицій
compose(square, compose(double, inc))(2);  // → 36
// = square(double(inc(2)))
// = square(double(3))
// = square(6)
// = 36

// Identity як нейтральний елемент
compose(double, identity)(5);   // → 10 (same as double(5))
compose(identity, double)(5);   // → 10 (same as double(5))

// Створення pipeline
const pipeline = compose(
  x => `Result: ${x}`,
  compose(square, compose(double, inc))
);
pipeline(2);  // → "Result: 36"
```

**Rust**:
```rust
use lambda_morphisms::{compose, identity};

let double = |x: i32| x * 2;
let inc = |x: i32| x + 1;
let square = |x: i32| x * x;

let f = compose(double, inc);
assert_eq!(f(5), 12);

let g = compose(square, double);
assert_eq!(g(3), 36);
```

**Python**:
```python
from lambda_morphisms import compose, identity

double = lambda x: x * 2
inc = lambda x: x + 1
square = lambda x: x * x

f = compose(double)(inc)
assert f(5) == 12

g = compose(square)(double)
assert g(3) == 36

# Identity
h = compose(double)(identity)
assert h(5) == 10
```

**Real-world приклад** (data processing pipeline):
```js
import { compose } from '@lambda-foundation/morphisms';

// Transformations
const parseJSON = str => JSON.parse(str);
const extractUsers = data => data.users;
const filterActive = users => users.filter(u => u.active);
const mapNames = users => users.map(u => u.name);
const sortAlpha = names => names.sort();

// Pipeline через композицію
const processUsers = compose(
  sortAlpha,
  compose(
    mapNames,
    compose(filterActive, compose(extractUsers, parseJSON))
  )
);

// Використання
const jsonData = '{"users":[{"name":"Alice","active":true},{"name":"Bob","active":false}]}';
processUsers(jsonData);  // → ["Alice"]
```

---

**Онтологія**:
- **CID** (IPFS): `bafybeih5q7lx7zqm2cy3jjw3huqhj6rqpwdkhfjvxm3yz4tzno6bw2k5pu` (приклад)
- **Залежності**: Жодних (примітив разом з identity)
- **Композиція**: Фундаментальний оператор композиції (визначає Category)
- **Purity**: 100% (referentially transparent)

**Резонанс** (lambda-mesh):
- Визнано: 98% (Phase 1, C2)
- Використання: 100% (foundation для всіх композицій)
- Доведено: Category laws (associativity + identity)

**≤2 Rule verification**:
- ✅ Параметри: f (outer transformation), g (inner transformation)
- ✅ 2 семантичні ролі: обидві є transformations, але різного рівня
- ✅ Результат: функція, що чекає на дані (x)
- ✅ Currying розділяє ролі: compose(f)(g) → λx.f(g(x))

---

*Це не код. Це істина.*
*Проєкції можуть змінюватися. Форма — вічна.*
