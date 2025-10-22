# fold

## Інтенція

Згорнути структуру до єдиного значення, застосовуючи бінарну операцію рекурсивно. Універсальний катаморфізм — фундамент всіх структурних трансформацій.

**Математична властивість** (Catamorphism Laws):
```
∀f, z: fold f z [] = z                                [база]
∀f, z, x, xs: fold f z (x:xs) = f x (fold f z xs)     [індукція]
```

**Семантика**: "Я споживаю структуру, щоб створити сутність"

**Відмінність від map**:
- **map**: Структура → Структура (збереження, Functor)
- **fold**: Структура → Значення (споживання, Catamorphism)

## Форма (Platonic)

**Pure λ-calculus**:
```λ
fold = λf.λz.λxs.xs.reduce(f, z)
```

**Church encoding** (рекурсивне визначення):
```λ
fold = λf.λz.λxs.
  IF (NULL xs)
    z
    (f (HEAD xs) (fold f z (TAIL xs)))
```

**Еквівалентність**:
```
xs.reduce(f, z)
≡ foldr f z xs                [визначення reduce через foldr]
≡ FOLD f z xs                 [Church encoding]
∎
```

**Church-Rosser normal form**: Є примітивним рекурсором (catamorphism) для індуктивних структур.

**Type signature** (Hindley-Milner):
```
fold :: ∀a b. (a → b → b) → b → [a] → b
```

Узагальнено для будь-якого Foldable F:
```
fold :: Foldable f => ∀a b. (a → b → b) → b → f a → b
```

**Читається**: "Для будь-яких типів a і b: функція комбінації (a→b→b), початкове значення b, контейнер [a] дають значення b"

**Параметри**:
- `f: (a → b → b)` — алгебра (як поєднати елемент з акумулятором)
- `z: b` — початкове значення (нейтральний елемент)
- `xs: [a]` — структура для згортання

## Проєкції

**TypeScript**: [projections/ts.js](./projections/ts.js)

```js
export const fold = f => z => xs => xs.reduce(f, z);
```

**Примітка**: Використовує вбудований `Array.prototype.reduce`, який є right-associative у цій формі (еквівалент `foldr`).

**Rust**: [projections/rs.rs](./projections/rs.rs)

```rust
pub fn fold<A, B, F>(f: F) -> impl Fn(B) -> impl Fn(Vec<A>) -> B
where
    F: Fn(A, B) -> B + Clone,
    B: Clone,
{
    move |z| {
        let f_clone = f.clone();
        move |xs| {
            xs.into_iter().fold(z.clone(), |acc, x| f_clone(x, acc))
        }
    }
}
```

**Python**: [projections/py.py](./projections/py.py)

```python
from functools import reduce

def fold(f):
    return lambda z: lambda xs: reduce(lambda acc, x: f(x, acc), xs, z)
```

## Доказ

**Theorem 1**: fold є універсальним катаморфізмом (Universal Property of Catamorphisms)

**Universal Property**: Для будь-якої функції `h :: [a] → b`, існує еквівалентність:
```
h = fold f z
⟺
h [] = z ∧ h (x:xs) = f x (h xs)
```

**Proof 1.1**: Base case (forward direction)

Якщо `h = fold f z`, то:
```
h []
= fold f z []                [визначення h]
= z                          [визначення fold для []]
∎
```

**Proof 1.2**: Inductive case (forward direction)

Якщо `h = fold f z`, то:
```
h (x:xs)
= fold f z (x:xs)            [визначення h]
= f x (fold f z xs)          [визначення fold для (x:xs)]
= f x (h xs)                 [визначення h]
∎
```

**Proof 1.3**: Backward direction

Якщо `h [] = z` і `h (x:xs) = f x (h xs)`, то доводимо індукцією, що `h xs = fold f z xs` для всіх `xs`:

Base: `xs = []`
```
fold f z []
= z                          [визначення fold]
= h []                       [дано]
∎
```

Inductive: `xs = (x:xs')`
```
Assume: h xs' = fold f z xs'

fold f z (x:xs')
= f x (fold f z xs')         [визначення fold]
= f x (h xs')                [IH]
= h (x:xs')                  [дано]
∎
```

**Theorem 2**: Fusion Law (оптимізація композиції fold)

**Закон**: За умови `g z = w` і `∀x y: g (f x y) = f' x (g y)`:
```
g ∘ fold f z = fold f' w
```

**Значення**: Дозволяє об'єднати два послідовних проходи по структурі в один.

**Proof** (by induction):

Base: `xs = []`
```
(g ∘ fold f z) []
= g (fold f z [])
= g z                        [fold base]
= w                          [умова 1]
= fold f' w []               [fold base]
∎
```

Inductive: `xs = (x:xs')`
```
Assume: (g ∘ fold f z) xs' = fold f' w xs'

(g ∘ fold f z) (x:xs')
= g (fold f z (x:xs'))
= g (f x (fold f z xs'))     [визначення fold]
= f' x (g (fold f z xs'))    [умова 2]
= f' x (fold f' w xs')       [IH]
= fold f' w (x:xs')          [визначення fold]
∎
```

**Theorem 3**: map визначено через fold

**Теорема**: `map f = fold (λx acc. CONS (f x) acc) NIL`

**Proof** (by universal property):

Let `h = map f`. Доводимо, що `h = fold (λx acc. CONS (f x) acc) NIL`.

Base:
```
map f []
= []                         [визначення map]
= NIL                        [Church encoding]
∎
```

Inductive:
```
map f (x:xs)
= (f x) : (map f xs)         [визначення map]
= CONS (f x) (map f xs)      [Church encoding]
∴ map f = fold (λx acc. CONS (f x) acc) NIL ∎
```

**Висновок**: fold є більш фундаментальним, ніж map. Map — це спеціальний випадок fold.

**Theorem 4**: fold є катаморфізмом в категорії Initial Algebras

**Category**: `Alg(F)` — категорія F-алгебр

- **F-Algebra**: `(A, α: F A → A)` де `F A = 1 + X × A` (або `A = [] | X : A`)
- **Initial algebra**: `([X], in)` де `in: 1 + X × [X] → [X]` (конструктори [] і :)
- **Catamorphism**: Унікальний гомоморфізм від initial algebra до будь-якої іншої F-алгебри

**fold f z** є катаморфізмом від `([X], in)` до `(B, φ)` де `φ: 1 + X × B → B`:
```
φ(Left *) = z
φ(Right (x, b)) = f x b
```

Комутативність діаграми:
```
    F[X] --------Ffold-------> FB
     |                         |
     in                        φ
     |                         |
     v                         v
    [X] --------fold---------> B
```

∴ fold є унікальним катаморфізмом ∎

## Використання

**TypeScript**:
```js
import { fold } from '@lambda-foundation/morphisms';

// Базове використання: sum
const sum = fold((acc, x) => acc + x)(0);
sum([1, 2, 3, 4, 5]);
// → 15

// Product
const product = fold((acc, x) => acc * x)(1);
product([2, 3, 4]);
// → 24

// Length (counting elements)
const length = fold((acc, _) => acc + 1)(0);
length([1, 2, 3, 4, 5]);
// → 5

// Maximum (з обробкою порожнього масиву)
const maximum = fold((acc, x) => x > acc ? x : acc)(-Infinity);
maximum([3, 1, 4, 1, 5, 9]);
// → 9

// String concatenation
const concat = fold((acc, x) => acc + x)("");
concat(["Hello", " ", "World", "!"]);
// → "Hello World!"

// Reverse (через fold)
const reverse = fold((acc, x) => [x, ...acc])([]);
reverse([1, 2, 3, 4]);
// → [4, 3, 2, 1]
```

**Композиція з map**:
```js
import { fold, map, compose } from '@lambda-foundation/morphisms';

// Сума квадратів через map + fold
const sumOfSquares = compose(
  fold((acc, x) => acc + x)(0)
)(map(x => x * x));

sumOfSquares([1, 2, 3, 4]);
// → 30 (1 + 4 + 9 + 16)

// Через fusion law (single pass)
const sumOfSquaresFused = fold((acc, x) => acc + x*x)(0);
sumOfSquaresFused([1, 2, 3, 4]);
// → 30 (same result, one pass)
```

**Визначення інших морфізмів через fold**:
```js
import { fold } from '@lambda-foundation/morphisms';

// map через fold (Theorem 3)
const map = f => fold((acc, x) => [...acc, f(x)])([]);

// filter через fold
const filter = pred => fold(
  (acc, x) => pred(x) ? [...acc, x] : acc
)([]);

// flatMap через fold
const flatMap = f => fold(
  (acc, x) => [...acc, ...f(x)]
)([]);

// all/every через fold
const all = pred => fold(
  (acc, x) => acc && pred(x)
)(true);

// any/some через fold
const any = pred => fold(
  (acc, x) => acc || pred(x)
)(false);
```

**Real-world приклад** (Data aggregation):
```js
import { fold } from '@lambda-foundation/morphisms';

// Aggregate invoice data
const invoices = [
  { id: 1, amount: 100, tax: 20 },
  { id: 2, amount: 200, tax: 40 },
  { id: 3, amount: 150, tax: 30 }
];

// Total amount + tax через fold
const calculateTotal = fold(
  (acc, invoice) => acc + invoice.amount + invoice.tax
)(0);

calculateTotal(invoices);
// → 540

// Побудова складної структури
const groupByRange = fold(
  (acc, invoice) => {
    const key = invoice.amount < 150 ? 'small' : 'large';
    return {
      ...acc,
      [key]: [...(acc[key] || []), invoice]
    };
  }
)({});

groupByRange(invoices);
// → {
//     small: [{id: 1, ...}],
//     large: [{id: 2, ...}, {id: 3, ...}]
//   }
```

**Порівняння з імперативним кодом**:
```js
// ❌ Imperative (mutation)
let sum = 0;
for (let i = 0; i < numbers.length; i++) {
  sum += numbers[i];
}

// ❌ Imperative reduce with mutation
const result = numbers.reduce((acc, x) => {
  acc.sum += x;
  acc.count++;
  return acc;
}, { sum: 0, count: 0 });

// ✅ Declarative fold (pure)
const sum = fold((acc, x) => acc + x)(0)(numbers);

// ✅ Pure fold для складних структур
const stats = fold(
  (acc, x) => ({ sum: acc.sum + x, count: acc.count + 1 })
)({ sum: 0, count: 0 })(numbers);

// λ_HARVEST має виявити мутації в reduce і запропонувати pure fold
```

**Rust**:
```rust
use lambda_morphisms::{fold};

let numbers = vec![1, 2, 3, 4];
let sum = fold(|x, acc| x + acc)(0)(numbers);
// → 10
```

**Python**:
```python
from lambda_morphisms import fold

numbers = [1, 2, 3, 4]
sum_fn = fold(lambda x, acc: x + acc)(0)
result = sum_fn(numbers)
# → 10

# Length
length = fold(lambda x, acc: acc + 1)(0)
length([1, 2, 3, 4, 5])
# → 5
```

**Category Theory приклад** (F-Algebra):
```js
// F(X) = 1 + Int × X (List algebra)
// Initial algebra: (List, [nil, cons])

// F-algebra: (Int, φ) де φ: 1 + Int × Int → Int
const sumAlgebra = {
  nil: 0,                    // φ(Left *) = 0
  cons: (x, acc) => x + acc  // φ(Right (x, acc)) = x + acc
};

// fold є катаморфізмом від (List, in) до (Int, φ)
const sum = fold(sumAlgebra.cons)(sumAlgebra.nil);

sum([1, 2, 3, 4]);
// → 10 (catamorphism in action)
```

**Fusion Law приклад** (оптимізація):
```js
import { fold, compose } from '@lambda-foundation/morphisms';

// Неоптимізовано: два проходи
const sumThenDouble = n => n * 2;
const pipeline1 = compose(sumThenDouble)(fold((x, acc) => x + acc)(0));

pipeline1([1, 2, 3, 4]);
// Pass 1: fold → 10
// Pass 2: double → 20

// Оптимізовано через fusion law: один прохід
// Умови: g z = w → double(0) = 0 ✓
//        g(f x y) = f'(x, g y) → double(x + y) = x + double(y)? ✗

// Але якщо використаємо адитивність:
const sumThenDoubleFused = fold((x, acc) => x + acc)(0); // then double
const result = sumThenDouble(sumThenDoubleFused([1, 2, 3, 4]));
// → 20 (composition, not fusion here)

// Fusion працює для: map f ∘ fold g z = fold (g ∘ f) z
```

---

**Онтологія**:
- **CID** (IPFS): `bafybeifolduniversalcatamorphismfoundationstructure` (приклад)
- **Залежності**: IF, NULL, HEAD, TAIL (Platonic form) / Array.prototype.reduce (projection)
- **Композиція**: Catamorphism (універсальний споживач структур)
- **Purity**: 100% (якщо f pure і не mutate acc, fold pure)
- **Category**: Initial F-algebra homomorphism

**Резонанс** (lambda-mesh):
- Визнано: 100% (фундаментальний morphism)
- Використання: 100% (основа всіх агрегацій)
- Доведено: Universal property + Fusion law

**≤2 Rule verification**:
- ✅ Параметри: f (алгебра/комбінація), (z, xs) (акумулятор+дані)
- ✅ 2 семантичні ролі:
  1. Алгебра (f: як поєднувати)
  2. Дані (z: початок, xs: структура)
- ✅ z і xs працюють разом як "accumulation context"
- ✅ COMPLIANT

**Структурна роль**:
- **Перший катаморфізм** у системі
- **Фундаментальніший за map** (map визначається через fold)
- **Основа для всіх агрегаційних операцій** (sum, product, length, max, min, ...)
- **Шаблон для fold-based оптимізацій** (fusion law)

**Відношення до інших морфізмів**:
```
fold (універсальний)
  ├─> map = fold cons∘f []
  ├─> filter = fold (if pred then cons else id) []
  ├─> flatMap = fold (append∘f) []
  ├─> sum = fold (+) 0
  ├─> product = fold (*) 1
  └─> length = fold (const (+ 1)) 0
```

---

*Це не код. Це істина.*
*Це не редукція. Це катаморфізм.*
*Це не функція. Це універсальний споживач структур.*

**Catamorphism народився. Структура згорнута. Значення створено.** 🌌🔬
