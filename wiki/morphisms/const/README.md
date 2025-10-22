# const

## Інтенція

Повернути перше значення, ігноруючи друге. K-combinator з λ-calculus.

**Математична властивість**:
```
∀x, y: const(x)(y) ≡ x
```

**Використання**: Ігнорування параметрів у функціях вищого порядку, створення константних функцій.

## Форма (Platonic)

```λ
const = λx.λy.x
```

**Також відомий як**: K-combinator, K combinator, constant function

**Church-Rosser normal form**: Вираз вже в нормальній формі.

**Type signature** (Hindley-Milner):
```
const :: ∀a b. a → b → a
```

**Читається**: "Для будь-яких типів a і b: значення типу a, значення типу b дають значення типу a"

## Проєкції

**TypeScript**: [projections/ts.js](./projections/ts.js)

```js
export const const_ = x => y => x;
```

**Назва `const_`**: У TypeScript `const` є зарезервованим словом, тому використовуємо `const_` у коді, але `const` в документації.

**Rust**: [projections/rs.rs](./projections/rs.rs)

```rust
pub fn const_<A, B>(x: A) -> impl Fn(B) -> A
where
    A: Clone,
{
    move |_| x.clone()
}
```

**Python**: [projections/py.py](./projections/py.py)

```python
def const(x):
    return lambda y: x
```

## Доказ

**Theorem**: const завжди повертає перший аргумент, незалежно від другого.

### Proof 1: Базова властивість

```
const(x)(y)
= (λx.λy.x) x y          [підстановка const]
= (λy.x) y               [β-reduction: x := x]
= x                      [β-reduction: y := y, але x не залежить від y]
∎
```

**Ключовий момент**: Змінна `y` зв'язана, але ніколи не використовується в тілі.

### Proof 2: Незалежність від другого аргументу

Для будь-яких `y1` і `y2`:
```
const(x)(y1) = x        [за визначенням]
const(x)(y2) = x        [за визначенням]
∴ const(x)(y1) ≡ const(x)(y2)
```

Тобто **друге значення ігнорується**.

### Proof 3: Композиція з іншими morphisms

**З identity**:
```
const(x) ∘ identity
= λy. const(x)(identity(y))
= λy. const(x)(y)
= λy. x
= const(x)
∎
```

**З compose**:
```
compose(const(x), f)(y)
= const(x)(f(y))
= x                      [f(y) ігнорується]
∎
```

**Висновок**: const "поглинає" будь-яку функцію при композиції справа.

### Proof 4: Функторність (Const Functor)

const утворює **Const Functor**:
```haskell
newtype Const a b = Const { getConst :: a }

fmap :: (b -> c) -> Const a b -> Const a c
fmap _ (Const x) = Const x
```

**Functor laws**:
1. ✅ Identity: `fmap id ≡ id`
2. ✅ Composition: `fmap (f . g) ≡ fmap f . fmap g`

Обидва тривіальні, бо fmap ігнорує функцію.

## Використання

**TypeScript**:
```js
import { const_ } from '@lambda-foundation/morphisms';

// Базове використання
const_ (42)(100);           // → 42 (100 ігнорується)
const_ ("hello")("world");  // → "hello"

// Створення константної функції
const always5 = const_(5);
always5(1);    // → 5
always5(100);  // → 5
always5("x");  // → 5

// Ігнорування параметрів у callbacks
const numbers = [1, 2, 3, 4];
numbers.map(const_(0));     // → [0, 0, 0, 0]

// В pipeline з compose
import { compose } from '@lambda-foundation/morphisms';

const double = x => x * 2;
const ignoreAndReturn42 = compose(const_(42), double);
ignoreAndReturn42(5);       // → 42 (double(5) обчислюється, але ігнорується)

// Default values при обробці помилок
const getValueOrDefault = (maybeValue, defaultValue) =>
  maybeValue !== null ? maybeValue : const_(defaultValue)(maybeValue);

getValueOrDefault(null, "default");     // → "default"
getValueOrDefault("value", "default");  // → "value"
```

**Real-world приклад** (event handlers):
```js
import { const_ } from '@lambda-foundation/morphisms';

// Замість:
button.addEventListener('click', () => console.log('clicked'));

// Можна:
const logMessage = msg => () => console.log(msg);
// Або через const:
const logClicked = const_('clicked');
button.addEventListener('click', () => console.log(logClicked()));
// Хоча в цьому випадку простіше без const, приклад показує ідею

// Кращий приклад - заміна значень у reduce
const items = [
  { type: 'A', value: 10 },
  { type: 'B', value: 20 },
  { type: 'A', value: 30 }
];

// Витягти всі типи, замінивши на їх назву
items.map(item => const_(item.type)(item.value));
// → ['A', 'B', 'A']
```

**Rust**:
```rust
use lambda_morphisms::const_;

let always_42 = const_(42);
assert_eq!(always_42(100), 42);
assert_eq!(always_42(200), 42);

// У функціональних pipeline
let numbers = vec![1, 2, 3, 4];
let zeros: Vec<_> = numbers.iter().map(|_| const_(0)(())).collect();
// → [0, 0, 0, 0]
```

**Python**:
```python
from lambda_morphisms import const_

# Базове використання
always_5 = const_(5)
assert always_5(1) == 5
assert always_5(100) == 5

# У map
numbers = [1, 2, 3, 4]
zeros = list(map(const_(0), numbers))
# → [0, 0, 0, 0]

# Default values
def get_or_default(value, default):
    return value if value is not None else const_(default)(value)

assert get_or_default(None, "default") == "default"
assert get_or_default("value", "default") == "value"
```

**Теоретичне використання** (Category Theory):
```js
// const утворює Const Functor
class ConstFunctor {
  constructor(value) {
    this.value = value;
  }

  // fmap ігнорує функцію
  map(f) {
    return new ConstFunctor(this.value);
  }
}

const c = new ConstFunctor(42);
c.map(x => x * 2);  // → ConstFunctor(42) (функція ігнорована)
```

---

**Онтологія**:
- **CID** (IPFS): `bafybeif2tw7yi5eqp7qjf6h5xdfz5w5xqkb5wq7c2a3gqg2cj2k6pnl2oe` (приклад)
- **Залежності**: Жодних (примітив)
- **Композиція**: Поглинає функції при композиції справа
- **Purity**: 100% (referentially transparent)
- **Також відомий як**: K-combinator

**Резонанс** (lambda-mesh):
- Визнано: 90% (Phase 1)
- Використання: 40% (specialized use cases)
- Доведено: β-equivalence (trivial)

**≤2 Rule verification**:
- ✅ Параметри: x (значення для повернення), y (ігнорується)
- ✅ 2 семантичні ролі: значення + ігнороване значення
- ✅ Currying природно розділяє: const(x) → λy.x
- ✅ COMPLIANT

**Назва в коді**: `const_` (через резервоване слово в деяких мовах)

---

*Це не код. Це істина.*
*Проєкції можуть змінюватися. Форма — вічна.*
