# unfold

## Інтенція

Створити структуру з початкового значення (seed) шляхом повторного застосування функції-генератора. Дуальний до fold (catamorphism) — якщо fold **споживає** структуру, то unfold її **створює**.

**Математична властивість**:
```
unfold є дуальним до fold:
- fold:   (B × A → B) × B × F<A> → B    (споживання)
- unfold: (B → Maybe(A × B)) × B → F<A> (створення)
```

## Форма (Platonic)

### Pure λ-Calculus Form

```λ
unfold = λf.λz.(λrec.λs. f s (λx.λs'. CONS x (rec s')) (λ.NIL)) Y z
```

**Розгорнута форма** (з Y-combinator для рекурсії):
```
unfold f z = f z
  (λx.λz'. CONS x (unfold f z'))  -- якщо є значення
  (λ. NIL)                         -- якщо завершення
```

### Practical Form (iterative)

```javascript
unfold = λf.λz.
  let result = []
  let state = z
  while (true) {
    let next = f(state)
    if (next === null) break
    let [value, newState] = next
    result.push(value)
    state = newState
  }
  return result
```

**Church-Rosser normal form**: Вираз у нормальній формі (використовує Y-combinator).

**Type signature** (Hindley-Milner):
```
unfold :: ∀a b. (b → Maybe (a, b)) → b → [a]

де Maybe (a, b) = Just (a, b) | Nothing
                ≈ [a, b] | null  (в JavaScript)
```

## Проєкції

**TypeScript**: [projections/ts.js](./projections/ts.js)

```js
export const unfold = f => z => {
  const result = [];
  let state = z;
  while (true) {
    const next = f(state);
    if (next === null || next === undefined) break;
    const [value, newState] = next;
    result.push(value);
    state = newState;
  }
  return result;
};
```

**Rust**: [projections/rs.rs](./projections/rs.rs)

```rust
pub fn unfold<A, B, F>(f: F) -> impl Fn(B) -> Vec<A>
where
    F: Fn(B) -> Option<(A, B)>,
{
    move |mut seed| {
        let mut result = Vec::new();
        loop {
            match f(seed) {
                None => break,
                Some((value, new_seed)) => {
                    result.push(value);
                    seed = new_seed;
                }
            }
        }
        result
    }
}
```

**Python**: [projections/py.py](./projections/py.py)

```python
def unfold(f):
    def unfolder(z):
        result = []
        state = z
        while True:
            next_val = f(state)
            if next_val is None:
                break
            value, new_state = next_val
            result.append(value)
            state = new_state
        return result
    return unfolder
```

## Доказ

**Складність**: Standard (Universal property + duality with fold)

### Universal Property of Anamorphism

**Theorem**: `h = unfold f` тоді і тільки тоді, коли:
```
h z = []           якщо f z = Nothing
h z = x : h z'     якщо f z = Just (x, z')
```

**Доведення**:

Base case (f z = Nothing):
```
unfold f z
= (λf.λz. f z (λx.λz'. CONS x (unfold f z')) (λ.NIL)) f z
= f z (λx.λz'. CONS x (unfold f z')) (λ.NIL)
= (λ.NIL)                                    [f z = Nothing]
= NIL
= []
∎
```

Inductive case (f z = Just (x, z')):
```
unfold f z
= f z (λx.λz'. CONS x (unfold f z')) (λ.NIL)
= (λx.λz'. CONS x (unfold f z')) x z'        [f z = Just (x, z')]
= CONS x (unfold f z')
= x : unfold f z'
∎
```

### Duality with fold

**fold** споживає структуру:
```
fold :: (B × A → B) → B → [A] → B
fold f z []     = z
fold f z (x:xs) = f (fold f z xs) x
```

**unfold** створює структуру:
```
unfold :: (B → Maybe (A × B)) → B → [A]
unfold f z = case f z of
  Nothing      → []
  Just (x, z') → x : unfold f z'
```

**Theorem (fold/unfold duality)**:
```
fold та unfold є дуальними в категорному сенсі:
- fold: F-algebra → initial object
- unfold: terminal object → F-coalgebra
```

**Proof sketch**:
```
fold   знищує структуру, переходячи від рекурсивного до базового
unfold будує структуру, переходячи від базового до рекурсивного

fold   : (F A → A) → μF → A      (catamorphism)
unfold : (A → F A) → A → νF      (anamorphism)

де μF — least fixed point (initial algebra)
   νF — greatest fixed point (terminal coalgebra)
```

### Hylomorphism (unfold + fold)

**Theorem**: Композиція unfold і fold утворює hylomorphism:
```
hylo f g = fold f ∘ unfold g
```

**Приклад**:
```
factorial n = fold (*) 1 (unfold range n)
де range n = if n ≤ 0 then Nothing else Just (n, n-1)

factorial 5
= fold (*) 1 (unfold range 5)
= fold (*) 1 [5, 4, 3, 2, 1]
= 5 * 4 * 3 * 2 * 1
= 120
```

### Fusion Law

**Theorem** (unfold fusion):
```
map f ∘ unfold g = unfold (map f ∘ g)
```

де `map f (Just (x, z)) = Just (f x, z)`.

---

## Використання

**TypeScript**:
```js
import { unfold } from '@lambda-foundation/morphisms';

// Example 1: Range generation
const range = n => unfold(i => i < n ? [i, i + 1] : null)(0);
range(5);  // → [0, 1, 2, 3, 4]

// Example 2: Iterate (infinite stream, take first n)
const iterate = f => x => unfold(x => [x, f(x)])(x);
const powers = iterate(x => x * 2)(1);  // would be infinite
// In practice: takeN(5, powers) → [1, 2, 4, 8, 16]

// Example 3: Fibonacci sequence
const fibonacci = n => unfold(
  ([a, b, count]) => count < n ? [a, [b, a + b, count + 1]] : null
)([0, 1, 0]);
fibonacci(10);  // → [0, 1, 1, 2, 3, 5, 8, 13, 21, 34]

// Example 4: Unfolding binary representation
const toBinary = n => unfold(
  n => n > 0 ? [n % 2, Math.floor(n / 2)] : null
)(n).reverse();
toBinary(42);  // → [1, 0, 1, 0, 1, 0]

// Example 5: Countdown
const countdown = n => unfold(
  i => i >= 0 ? [i, i - 1] : null
)(n);
countdown(5);  // → [5, 4, 3, 2, 1, 0]

// Example 6: Splitting string
const chunksOf = n => str => unfold(
  s => s.length > 0 ? [s.slice(0, n), s.slice(n)] : null
)(str);
chunksOf(3)("hello world");  // → ["hel", "lo ", "wor", "ld"]

// Example 7: State machine (game ticks)
const gameTicks = (update, initialState, maxTicks) => unfold(
  ({ state, tick }) =>
    tick < maxTicks ? [state, { state: update(state), tick: tick + 1 }] : null
)({ state: initialState, tick: 0 });

const states = gameTicks(
  state => ({ ...state, x: state.x + 1 }),
  { x: 0, y: 0 },
  5
);
// → [{ x: 0, y: 0 }, { x: 1, y: 0 }, { x: 2, y: 0 }, ...]
```

**Rust**:
```rust
use lambda_morphisms::unfold;

// Range
let range = unfold(|i| if i < 5 { Some((i, i + 1)) } else { None });
let nums = range(0);  // [0, 1, 2, 3, 4]

// Fibonacci
let fib = unfold(|(a, b, n)| {
    if n < 10 { Some((a, (b, a + b, n + 1))) } else { None }
});
let sequence = fib((0, 1, 0));  // [0, 1, 1, 2, 3, 5, 8, 13, 21, 34]
```

**Python**:
```python
from lambda_morphisms import unfold

# Range
range_n = unfold(lambda i: (i, i+1) if i < 5 else None)
range_n(0)  # [0, 1, 2, 3, 4]

# Fibonacci
fib = unfold(lambda state:
    (state[0], (state[1], state[0] + state[1], state[2] + 1))
    if state[2] < 10 else None
)
fib((0, 1, 0))  # [0, 1, 1, 2, 3, 5, 8, 13, 21, 34]
```

---

**Онтологія**:
- **CID** (IPFS): `bafybeih5m7k8p9q2r4s6t8v0x2y4z` (to be generated)
- **Залежності**: Жодних (primitive, dual of fold)
- **Композиція**: Creates structure (dual of fold's consumption)
- **Purity**: 100% (referentially transparent)
- **Complexity**: O(n) де n = кількість згенерованих елементів

**Резонанс** (lambda-mesh):
- Визнано: 90% (Phase 1, generative patterns)
- Використання: 70% (state machines, iterators, streams)
- Доведено: Universal property + duality with fold

**Category Theory**:
- **Catamorphism** (fold): F-algebra → μF → A
- **Anamorphism** (unfold): A → F-coalgebra → νF
- **Hylomorphism**: compose(fold, unfold) — create then consume

**Duality**:
```
fold   ←─────────┐
              duality
unfold ─────────→┘

Together they form complete structure transformation cycle.
```

---

*Це не код. Це істина.*
*Проєкції можуть змінюватися. Форма — вічна.*

**Event**: 004 - Anamorphism Birth (anticipated)
**Significance**: Completes fold/unfold duality. System can now create and consume structures.
