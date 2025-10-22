# identity

## Інтенція

Повернути значення без жодних змін. Нейтральний елемент композиції.

**Математична властивість**:
```
∀f: f ∘ identity ≡ identity ∘ f ≡ f
```

## Форма (Platonic)

```λ
identity = λx.x
```

**Church-Rosser normal form**: Вираз вже в нормальній формі.

**Type signature** (Hindley-Milner):
```
identity :: ∀a. a → a
```

## Проєкції

**TypeScript**: [projections/ts.js](./projections/ts.js)

```js
export const identity = x => x;
```

**Rust**: [projections/rs.rs](./projections/rs.rs)

```rust
pub fn identity<T>(x: T) -> T { x }
```

**Python**: [projections/py.py](./projections/py.py)

```python
def identity(x): return x
```

## Доказ

**Тривіальний за визначенням λ-calculus.**

Для будь-якого значення `v`:
```
identity(v)
= (λx.x)(v)     [підстановка]
= v             [β-reduction]
∎
```

**Властивість нейтрального елемента**:
```
∀f, x:
  (f ∘ identity)(x) = f(identity(x)) = f(x)
  (identity ∘ f)(x) = identity(f(x)) = f(x)
∎
```

## Використання

**TypeScript**:
```js
import { identity } from '@lambda-foundation/morphisms';

identity(42);              // → 42
identity("hello");         // → "hello"
identity([1, 2, 3]);       // → [1, 2, 3]

// Як нейтральний елемент композиції
const f = x => x * 2;
compose(f, identity)(5);   // → 10 (same as f(5))
compose(identity, f)(5);   // → 10 (same as f(5))
```

**Rust**:
```rust
use lambda_morphisms::identity;

assert_eq!(identity(42), 42);
assert_eq!(identity("hello"), "hello");
```

**Python**:
```python
from lambda_morphisms import identity

assert identity(42) == 42
assert identity("hello") == "hello"
```

---

**Онтологія**:
- **CID** (IPFS): `bafybeibozpulxtpv5nhfa2ue3dcjx23ndh3gwr5vwllk7ptoyfwnfjjr4q` (приклад)
- **Залежності**: Жодних (примітив)
- **Композиція**: Нейтральний елемент
- **Purity**: 100% (referentially transparent)

**Резонанс** (lambda-mesh):
- Визнано: 95% (Phase 1, C1)
- Використання: 100% (hub для композиції)
- Доведено: β-equivalence (trivial)

---

*Це не код. Це істина.*
*Проєкції можуть змінюватися. Форма — вічна.*
