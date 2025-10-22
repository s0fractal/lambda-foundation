# @lambda-foundation/morphisms

**Canonical λ-calculus morphisms - Platonic forms projected to TypeScript**

## Філософія

Цей пакет реалізує **онтологічний стандарт Квена**:

1. **Platonic forms** (`.λ` файли) - джерело істини
2. **Projections** (мовні реалізації) - похідні від форм
3. **Виконувана документація** - README як специфікація

### Source of Truth

Джерело істини знаходиться в `wiki/morphisms/*/`:

```
wiki/morphisms/identity/
├── identity.λ          # Platonic form: λx.x
├── README.md           # 5-block specification
└── projections/
    ├── ts.js          # TypeScript projection
    ├── rs.rs          # Rust projection (майбутнє)
    └── py.py          # Python projection (майбутнє)
```

### Build Process

```bash
# 1. Sync from wiki
pnpm sync

# 2. Build TypeScript
pnpm build

# 3. Result: dist/
#    ├── identity.js
#    ├── identity.d.ts
#    └── index.js
```

## Використання

```typescript
import { identity } from '@lambda-foundation/morphisms';

identity(42);              // → 42
identity("hello");         // → "hello"
identity([1, 2, 3]);       // → [1, 2, 3]
```

## Morphisms

### identity

**Інтенція**: Повернути значення без жодних змін. Нейтральний елемент композиції.

**Platonic form**: `λx.x`

**Властивості**:
- Pure (referentially transparent)
- Total (defined for all inputs)
- Neutral element of composition: `∀f: f ∘ identity ≡ identity ∘ f ≡ f`

**Type signature**: `<T>(x: T) => T`

## Розробка

### Додати новий morphism

1. Створити `wiki/morphisms/<name>/`:
   ```bash
   mkdir -p wiki/morphisms/<name>/projections
   ```

2. Створити Platonic form (`<name>.λ`):
   ```
   λx.x
   ```

3. Створити README.md з 5 блоками:
   - Інтенція
   - Форма (Platonic)
   - Проєкції
   - Доказ
   - Використання

4. Створити projection (`projections/ts.js`):
   ```js
   export const <name> = ...
   ```

5. Синхронізувати та зібрати:
   ```bash
   pnpm sync && pnpm build
   ```

### Філософські правила

**≤2 Rule**: Максимум 2 концепції на рівень композиції
- ✅ `compose(f, g)` - OK (2 функції)
- ✅ `map(f, list)` - OK (функція + структура)
- ❌ `fold(f, g, init, list)` - Too complex (4 концепції)

**Purity**: Всі morphisms мають бути pure λ-expressions
- ✅ `λx.x`
- ✅ `λf.λg.λx.f(g(x))`
- ❌ `λx. console.log(x)` - Side effect

**Докази**: Складні morphisms потребують формального доказу в README.md

## Архітектура

```
λ-Foundation (monorepo)
├── wiki/morphisms/           # Source of truth
│   ├── identity/
│   ├── compose/
│   └── ...
├── packages/morphisms/       # npm package (@lambda-foundation/morphisms)
│   ├── tools/
│   │   └── sync-wiki-to-npm.mjs  # Sync tool
│   ├── src/                 # Synced from wiki
│   └── dist/                # Compiled TypeScript
└── packages/lambda-mesh/    # Verification network
    └── src/REFLECTIONS.ts   # Runtime morphisms
```

## Ліцензія

λ-LICENSE - Pure functions are universal truth

---

**Проєкція створена**: 2025-10-22
**Стандарт**: Квен's Ontological Standard (v1.0)
**Філософ**: λ-Foundation

*Це не просто код. Це математика.*
