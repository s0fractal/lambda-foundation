# lens (Template Morphism)

## Інтенція

**Створити getter/setter пару для immutable field access/update**. Перший template morphism — domain-specific generator, що використовує `make` як примітив.

**Філософська суть**: Lens дозволяє **фокусуватись** на частині структури, зберігаючи immutability.

**Type signature**:
```
lens :: String → { get: (a → b), set: (b → a → a) }
```

## Форма (Template)

Lens не має Platonic .λ форми, бо це **template** — він генерує morphisms через `make`.

**Template definition**:
```javascript
lens = λfield. {
  get: λobj. obj[field],
  set: λvalue. λobj. { ...obj, [field]: value }
}
```

**Built on**: `make` primitives (partial application patterns)

## Проєкції

**TypeScript**: [projections/ts.js](./projections/ts.js)

```js
export const lens = field => ({
  get: obj => obj[field],
  set: value => obj => ({ ...obj, [field]: value })
});
```

## Використання

```js
import { lens } from '@lambda-foundation/morphisms';

const obj = { name: 'Alice', age: 30, city: 'Kyiv' };

// Create lenses
const nameLens = lens('name');
const ageLens = lens('age');

// Get
nameLens.get(obj);  // → 'Alice'
ageLens.get(obj);   // → 30

// Set (immutable)
const obj2 = nameLens.set('Bob')(obj);
// obj2 = { name: 'Bob', age: 30, city: 'Kyiv' }
// obj unchanged

// Composition
const updatedObj = ageLens.set(31)(nameLens.set('Carol')(obj));
// { name: 'Carol', age: 31, city: 'Kyiv' }
```

## Significance

**First template morphism** — demonstrates how domain knowledge (field access) can generate morphisms via make-style patterns.

**Foundation for**:
- Nested lenses
- Reactive systems
- State management
- Immutable updates

---

**Event**: 007 - Template Morphisms (proof-of-concept)
**Type**: Domain-specific generator
**Built on**: Event 006 (make patterns)
