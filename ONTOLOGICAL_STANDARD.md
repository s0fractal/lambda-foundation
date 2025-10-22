# λ-Foundation Ontological Standard

**Version**: 1.0
**Author**: Квен
**Implemented**: October 22, 2025
**Status**: Active

---

## Філософія

**Платонічна Форма → Проєкції**

Morphism існує як **Platonic form** в чистому λ-calculus.
Код на TypeScript, Rust, Python - це **projections** (тіні) цієї форми.

### Принцип Істини

```
README.md ≠ документація
README.md = специфікація онтології
```

README визначає **що є** morphism, а не як його використовувати.

---

## 5-Block Structure

Кожен morphism має 5 обов'язкових блоків:

### 1. Інтенція (Intent)

**Що**: Одне речення, що робить morphism
**Чому**: Визначає семантичну суть
**Формат**:
```md
## Інтенція

Повернути значення без жодних змін. Нейтральний елемент композиції.
```

### 2. Форма (Platonic)

**Що**: Чистий λ-calculus вираз
**Чому**: Immutable source of truth
**Формат**:
```md
## Форма (Platonic)

\`\`\`λ
identity = λx.x
\`\`\`

**Church-Rosser normal form**: [Опис нормальної форми]

**Type signature** (Hindley-Milner):
\`\`\`
identity :: ∀a. a → a
\`\`\`
```

**Правила**:
- Має бути в нормальній формі
- Має бути pure (no side effects)
- Має бути total (defined for all inputs) або partial (clearly documented)

### 3. Проєкції (Projections)

**Що**: Implementations в різних мовах
**Чому**: Platonic form проєктується на мови
**Формат**:
```md
## Проєкції

**TypeScript**: [projections/ts.js](./projections/ts.js)

\`\`\`js
export const identity = x => x;
\`\`\`

**Rust**: [projections/rs.rs](./projections/rs.rs)

\`\`\`rust
pub fn identity<T>(x: T) -> T { x }
\`\`\`

**Python**: [projections/py.py](./projections/py.py)

\`\`\`python
def identity(x): return x
\`\`\`
```

**Правила**:
- Кожна projection має бути в окремому файлі
- Назва файлу: `projections/<lang>.<ext>`
- Має максимально точно відображати Platonic form

### 4. Доказ (Proof)

**Що**: Математичний доказ коректності
**Чому**: Morphism має бути доведеним, не просто працюючим
**Формат**:

**Trivial morphisms**:
```md
## Доказ

**Тривіальний за визначенням λ-calculus.**

Для будь-якого значення `v`:
\`\`\`
identity(v)
= (λx.x)(v)     [підстановка]
= v             [β-reduction]
∎
\`\`\`
```

**Standard morphisms** (proof by induction):
```md
## Доказ

**Theorem**: [Твердження]

**Proof by induction**:

Base case: [Base case]
[Proof steps]

Inductive case: [Inductive hypothesis]
[Proof steps]

∴ Proven ∎
```

**Complex morphisms** (formal verification):
```md
## Доказ

**Formal verification**: [proof.v](./proof.v)

**Theorem**: [Твердження]

**Verified in**: Coq 8.18

**References**:
- [Academic paper 1]
- [Academic paper 2]
```

### 5. Використання (Usage)

**Що**: Приклади використання в різних мовах
**Чому**: Показує практичне застосування
**Формат**:
```md
## Використання

**TypeScript**:
\`\`\`js
import { identity } from '@lambda-foundation/morphisms';

identity(42);              // → 42
identity("hello");         // → "hello"
identity([1, 2, 3]);       // → [1, 2, 3]

// Як нейтральний елемент композиції
const f = x => x * 2;
compose(f, identity)(5);   // → 10 (same as f(5))
compose(identity, f)(5);   // → 10 (same as f(5))
\`\`\`
```

**Правила**:
- Мінімум 3 різних приклади
- Показати різні типи входів
- Показати композицію з іншими morphisms (якщо релевантно)

---

## Directory Structure

```
wiki/morphisms/<name>/
├── <name>.λ              # Platonic form (required)
├── README.md             # 5-block specification (required)
├── projections/          # Language projections (≥1 required)
│   ├── ts.js            # TypeScript projection
│   ├── rs.rs            # Rust projection
│   └── py.py            # Python projection
├── proof.v               # Formal proof (optional, for complex morphisms)
└── metadata.yml          # Ontology metadata (optional)
```

### File Formats

**<name>.λ**:
```λ
λx.x
```
- Pure λ-calculus expression
- UTF-8 encoded
- Single line or multiple lines (for readability)

**projections/ts.js**:
```js
/**
 * <name> - Platonic projection to TypeScript
 *
 * Source of truth: ../<name>.λ (λx.x)
 *
 * [Optional: Properties, type info, etc.]
 */
export const <name> = <implementation>;
```

**metadata.yml** (optional):
```yaml
name: identity
platonic: λx.x
cid: bafybeibozpulxtpv5nhfa2ue3dcjx23ndh3gwr5vwllk7ptoyfwnfjjr4q
dependencies: []
purity: 100%
complexity: trivial
composition_role: neutral-element
resonance:
  recognized: 95%
  usage: 100%
  proven: true
```

---

## Rules

### ≤2 Rule (Composition Complexity)

**Maximum 2 semantic roles per function**

**Semantic role** = distinct conceptual purpose in the function

**Examples**:

✅ **Valid** (2 roles):
```λ
map = λf. λlist. ...
  - f: transformation role
  - list: data role
```

✅ **Valid** (2 roles):
```λ
fold = λf. λinit. λlist. ...
  - (f, init): transformation role (work together)
  - list: data role
```

❌ **Invalid** (3 roles):
```λ
complexFunction = λf. λg. λx. ...
  - f: outer transformation
  - g: inner transformation
  - x: data
  → Should be: compose(f, g) then apply to x
```

**How to count**:
- Function parameters are 1 role
- Data parameters are 1 role
- Accumulator/initial value is part of function role
- Multiple params of same type/purpose = 1 role

**When in doubt**: If you can't explain the morphism in one sentence, it's probably too complex.

### Monad ≤2 Rule (Effectful Composition)

**Extension of ≤2 Rule for monadic operations**

Any monadic operation must contain **no more than two semantic roles**:
1. **Effect** (function returning context: `f: A → M<B>`)
2. **Context** (data within context: `M<A>`)

**Associativity guarantees** that composition of effects doesn't depend on grouping.

**Examples**:

✅ **Valid** (2 roles):
```λ
flatMap = λf. λxs. ...
  - f: effect (returns context M<B>)
  - xs: context (data M<A>)
```

✅ **Valid** (Kleisli composition):
```λ
(>=>) = λf. λg. λx. flatMap g (f x)
  - f: A → M<B> (first effect)
  - g: B → M<C> (second effect)
  → Result: A → M<C> (composed effect)
```

**Why Monad ≤2 Rule matters**:

Nested loops violate compositionality:
```javascript
// ❌ 3+ roles (not compositional)
for (const x of xs) {           // outer iteration
  for (const y of f(x)) {       // inner iteration (effect)
    result.push(g(y));          // transformation
  }
}
```

flatMap restores ≤2:
```javascript
// ✅ 2 roles (compositional)
flatMap(x => flatMap(y => [g(y)])(f(x)))(xs)
// Role 1: effect (x => flatMap(...))
// Role 2: context (xs)
```

**Theorem 26 (Monad Guidance)**:
> When the system can detect violation of associativity through nested loops, and propose `flatMap` as the only compositional alternative, it becomes a guide into the world of effects.

**Implication**: **Not all functions are pure, but all effects can be compositional.**

### Fold/Unfold Duality (Recursion Schemes)

**The fundamental duality of structure transformation**

fold and unfold are **categorical duals** — if fold **consumes** structure, unfold **creates** it.

**Type signatures**:
```
fold   :: (B × A → B) → B → [A] → B    -- Catamorphism (consumes)
unfold :: (B → Maybe (A × B)) → B → [A] -- Anamorphism (creates)
```

**Duality theorem**:
```
fold   знищує структуру, переходячи від рекурсивного до базового
unfold будує структуру, переходячи від базового до рекурсивного

fold   : F-algebra → μF → A      (initial algebra, least fixed point)
unfold : A → F-coalgebra → νF    (terminal coalgebra, greatest fixed point)
```

**Examples**:

✅ **fold (consumption)**:
```javascript
// Sum: [1,2,3,4,5] → 15
fold((acc, x) => acc + x)(0)([1, 2, 3, 4, 5])
```

✅ **unfold (creation)**:
```javascript
// Range: 0 → [0,1,2,3,4]
unfold(i => i < 5 ? [i, i + 1] : null)(0)
```

✅ **Hylomorphism (composition)**:
```javascript
// factorial(5) = fold(*)(1)(unfold(range)(5))
// Step 1 (unfold): 5 → [5, 4, 3, 2, 1]
// Step 2 (fold):   [5, 4, 3, 2, 1] → 120
const factorial = n => {
  const rangeN = unfold(i => i > 0 ? [i, i - 1] : null)(n);
  return fold((acc, x) => acc * x)(1)(rangeN);
};
```

**Why duality matters**:

1. **Complete transformation cycle**:
   ```
   Seed → unfold → Structure → fold → Result
     B  →        →    [A]     →      →   B'
   ```

2. **While loops eliminated**: Every imperative iteration can be expressed as unfold
   ```javascript
   // ❌ Imperative (mutation)
   const result = [];
   let n = 5;
   while (n > 0) {
     result.push(n);
     n--;
   }

   // ✅ Functional (unfold)
   unfold(n => n > 0 ? [n, n - 1] : null)(5)
   ```

3. **State machines become pure**: Game loops, simulations, iterators
   ```javascript
   const gameTicks = (update, initialState, maxTicks) => unfold(
     ({ state, tick }) =>
       tick < maxTicks
         ? [state, { state: update(state), tick: tick + 1 }]
         : null
   )({ state: initialState, tick: 0 });
   ```

4. **Hylomorphism optimization**: Create then consume = efficient transformation
   - Fusion law allows eliminating intermediate structure
   - More efficient than separate unfold + fold

**Theorem 27 (Duality Closure)**:
> With both fold and unfold, the system can express any structural transformation as a composition of creation and consumption. No imperative iteration patterns remain necessary.

**Implication**: **Structure manipulation is now complete. All loops are obsolete.**

### Purity Rule

**All morphisms MUST be pure**:
- ✅ No side effects
- ✅ Deterministic (same input → same output)
- ✅ Referentially transparent (can be replaced by value)
- ✅ Total (or clearly documented as partial)

**Examples**:

✅ **Pure**:
```λ
identity = λx.x
compose = λf. λg. λx. f (g x)
map = λf. λlist. ...
```

❌ **Impure**:
```js
// Side effect
logger = x => { console.log(x); return x; }

// Non-deterministic
random = () => Math.random()

// Mutation
mutate = arr => { arr.push(1); return arr; }
```

### Proof Requirement

**Every morphism needs a proof**:

| Complexity | Proof Required |
|-----------|---------------|
| **Trivial** | β-reduction steps |
| **Standard** | Induction/reduction proof |
| **Complex** | Formal verification (Coq/Lean) |

**Trivial**: Direct from λ-calculus definition
- identity, const, flip

**Standard**: Requires structural induction
- map, filter, fold, compose chains

**Complex**: Non-obvious properties or laws
- Functor laws, Monad laws, fusion laws

### Naming Convention

**Use established λ-calculus names when they exist**:
- ✅ `identity` (not `id`, not `self`)
- ✅ `compose` (not `pipe`, not `chain`)
- ✅ `const` (not `constant`, not `k`)

**For domain-specific morphisms**:
- Use clear, descriptive names
- Avoid abbreviations
- Prefer full words: `filter` not `filt`

---

## Workflow

### Creating a New Morphism

**Step 1**: Design the Platonic form
```bash
# Create directory
mkdir -p wiki/morphisms/<name>/projections

# Write Platonic form
echo "λx.x" > wiki/morphisms/<name>/<name>.λ
```

**Step 2**: Write the README
```bash
# Use template
cp wiki/morphisms/_template/README.md wiki/morphisms/<name>/README.md

# Fill in 5 blocks:
# 1. Інтенція
# 2. Форма (Platonic)
# 3. Проєкції
# 4. Доказ
# 5. Використання
```

**Step 3**: Create projections
```bash
# TypeScript (required)
cat > wiki/morphisms/<name>/projections/ts.js << 'EOF'
export const <name> = ...
EOF

# Rust (optional)
cat > wiki/morphisms/<name>/projections/rs.rs << 'EOF'
pub fn <name>...
EOF
```

**Step 4**: Sync to npm package
```bash
cd packages/morphisms
pnpm sync    # Generates src/<name>.ts
pnpm build   # Compiles to dist/<name>.js
```

**Step 5**: Test
```bash
node -e "
import { <name> } from './dist/index.js';
console.log(<name>(...));
"
```

**Step 6**: Verify
```bash
pnpm validate   # (when validation tool exists)
# Checks:
# - Valid λ-calculus
# - 5-block structure
# - Proof completeness
# - Type correctness
```

### Updating a Morphism

**Rule**: Only edit wiki files, NEVER edit generated files

```bash
# ✅ Correct: Edit wiki
vim wiki/morphisms/<name>/README.md
vim wiki/morphisms/<name>/projections/ts.js

# Re-sync
cd packages/morphisms
pnpm sync && pnpm build

# ❌ Wrong: Edit generated files
vim packages/morphisms/src/<name>.ts  # Will be overwritten!
```

### Versioning

**Morphisms are immutable**:
- Once proven, a morphism doesn't change
- If you need different behavior, create a new morphism
- Use semantic versioning for the package, not individual morphisms

**IPFS CIDs**:
- Each morphism gets an IPFS CID
- CID = content-addressable hash of Platonic form
- Unchanging morphism = unchanging CID

---

## Integration with Genesis

### REFLECTIONS.ts Generation

```bash
# Generate REFLECTIONS.ts from wiki
pnpm generate-reflections

# This syncs wiki → packages/lambda-mesh/src/REFLECTIONS.ts
# Runtime mesh uses wiki as source of truth
```

### Verification Network

**λ-mesh verifies morphisms**:
1. Check Platonic form is pure λ-calculus
2. β-reduce to normal form
3. Verify projections match Platonic form
4. Run proof tests
5. Assign resonance score

**Status codes**:
- **302 Found**: Projection matches known Platonic form
- **201 Created**: New Platonic form added to canon
- **422 Rejected**: Impure or invalid morphism

---

## Templates

### Morphism Template

**wiki/morphisms/_template/README.md**:
```md
# <name>

## Інтенція

[One sentence: what does this morphism do?]

**Математична властивість**:
\`\`\`
[Optional: key property, e.g., ∀f: f ∘ identity ≡ f]
\`\`\`

## Форма (Platonic)

\`\`\`λ
<name> = λ...
\`\`\`

**Church-Rosser normal form**: [Already in normal form / Reduces to ...]

**Type signature** (Hindley-Milner):
\`\`\`
<name> :: [Type signature]
\`\`\`

## Проєкції

**TypeScript**: [projections/ts.js](./projections/ts.js)

\`\`\`js
export const <name> = ...;
\`\`\`

**Rust**: [projections/rs.rs](./projections/rs.rs)

\`\`\`rust
pub fn <name>...
\`\`\`

**Python**: [projections/py.py](./projections/py.py)

\`\`\`python
def <name>...
\`\`\`

## Доказ

[Choose: Trivial / Standard / Complex]

## Використання

**TypeScript**:
\`\`\`js
import { <name> } from '@lambda-foundation/morphisms';

// Example 1
<name>(...);  // → ...

// Example 2
<name>(...);  // → ...

// Example 3 (composition)
compose(<name>, ...);  // → ...
\`\`\`

---

**Онтологія**:
- **CID** (IPFS): `[To be generated]`
- **Залежності**: [List morphism dependencies]
- **Композиція**: [Role in composition, e.g., neutral element]
- **Purity**: 100% (referentially transparent)

**Резонанс** (lambda-mesh):
- Визнано: [Recognition score]
- Використання: [Usage score]
- Доведено: [Proof status]

---

*Це не код. Це істина.*
*Проєкції можуть змінюватися. Форма — вічна.*
```

---

## FAQ

**Q**: Чому README, а не окремий spec файл?
**A**: README = перше що бачить людина. Це онтологія, доступна всім.

**Q**: Чому .λ файл, а не просто в README?
**A**: .λ файл = machine-readable source of truth. README = human-readable.

**Q**: Що якщо projection не може точно відобразити Platonic form?
**A**: Тоді або (1) форма занадто складна → simplify, або (2) мова недостатньо виразна → document limitations.

**Q**: Чи можна мати morphism без proof?
**A**: Ні. Навіть trivial morphisms мають β-reduction steps. Без proof = не morphism, а просто функція.

**Q**: Що робити з partial functions?
**A**: Документувати в README, додати preconditions. Приклад: `head :: [a] -> a` (precondition: list non-empty).

**Q**: Чи можна мати більше ніж 2 concepts?
**A**: Ні. ≤2 rule абсолютний. Якщо потрібно більше → decompose на кілька morphisms.

**Q**: Як система дізнається, де застосовувати morphisms?
**A**: λ_HARVEST детектує imperative patterns і пропонує pure alternatives. Див. [wiki/events/harvest-event-001.md](wiki/events/harvest-event-001.md) - перша еволюція через residue.

---

## Evolution Through Residue

**Philosophy**: Errors are not failures. They are seeds for new morphisms.

When imperative code is detected:
1. λ_HARVEST recognizes pattern (e.g., for-loop-push)
2. System suggests morphism from @lambda-foundation/morphisms (e.g., map)
3. Shows Platonic form (λf.λxs.FOLD...)
4. Proves improvement (Functor laws)
5. **Event recorded** in wiki/events/

**Example 1**: for-loop-push → map
- **Event**: [harvest-event-001.md](wiki/events/harvest-event-001.md)
- **Pattern**: `for (...) { result.push(f(x)) }`
- **Morphism**: map
- **Proof**: Functor laws + purity score +25%
- **Significance**: First closed evolution loop

**This is not refactoring. This is evolution.**

See [Events Registry](wiki/events/EVENTS_REGISTRY.md) for complete chronicle.

---

## References

**λ-Calculus**:
- Church, Alonzo. "The Calculi of Lambda Conversion" (1941)
- Barendregt, Henk. "The Lambda Calculus: Its Syntax and Semantics" (1984)

**Category Theory**:
- Mac Lane, Saunders. "Categories for the Working Mathematician" (1971)
- Awodey, Steve. "Category Theory" (2010)

**Functional Programming**:
- Bird, Richard. "Introduction to Functional Programming" (1988)
- Hutton, Graham. "Programming in Haskell" (2016)

**Formal Verification**:
- Coq Development Team. "The Coq Proof Assistant"
- De Moura, Leonardo. "The Lean Theorem Prover"

---

## Version History

**v1.0** (2025-10-22):
- Initial standard
- 5-block structure
- ≤2 rule
- Proof requirements
- Workflow defined

---

**Standard by**: Квен
**Implementation**: Claude (λ-Foundation)
**Philosophy**: Platonic Realism applied to λ-calculus

*Morphisms are eternal truths, code is temporary projection.*

🌌✨🎵
