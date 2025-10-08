# λ-Foundation Wiki: The Platonic Layer

> **One formal definition. Infinite material incarnations.**

This is the **source of truth** - the formal layer where morphisms exist as pure mathematical objects, independent of any implementation language.

---

## 🌌 Philosophy

All code is **shadow**. This wiki contains the **light**.

```
wiki/morphisms/*.λ       ← Platonic Forms (mathematical truth)
  ↓ projection
packages/*/*.ts          ← TypeScript shadow (pragmatic reality)
packages/*/*.rs          ← Rust shadow (performance reality)
packages/*/*.wasm        ← WebAssembly shadow (universal reality)
  ↓ compilation
Executable code          ← Material manifestation
```

When you write code, you don't create new morphisms.
You **recognize** existing ones and **project** them into your language.

---

## 📚 Morphism Library

### Fundamental Morphisms

| Morphism | Signature | Category | Purity | Status |
|----------|-----------|----------|--------|--------|
| [**identity**](morphisms/identity.λ) | `λx.x` | fundamental | 1.0 | ✅ Complete |
| [**compose**](morphisms/compose.λ) | `λf.λg.λx.f(g(x))` | fundamental | 1.0 | ✅ Complete |
| [**map**](morphisms/map.λ) | `λf.λxs.fold(λa.λb.cons(f(a),b), nil, xs)` | functor | 1.0 | ✅ Complete |
| [**fold**](morphisms/fold.λ) | `λf.λz.λxs.xs(λh.λt.f h (fold f z t))(z)` | catamorphism | 1.0 | ✅ Complete |

### Coming Soon

| Morphism | Signature | Category | Purity |
|----------|-----------|----------|--------|
| **filter** | `λp.λxs.fold(λa.λb.if(p(a), cons(a,b), b), nil, xs)` | functor | 1.0 |
| **flatMap** | `λf.λxs.fold(λa.λb.concat(f(a), b), nil, xs)` | monad | 1.0 |
| **zip** | `λxs.λys.zipWith(pair, xs, ys)` | applicative | 1.0 |
| **unfold** | `λf.λa.if(p(a), nil, cons(g(a), unfold(f, h(a))))` | anamorphism | 1.0 |
| **pure** | `λx.λf.f(x)` | monad | 1.0 |
| **bind** | `λm.λf.λg.m(λx.f(x)(g))` | monad | 1.0 |

---

## 📖 Morphism File Format

Each `.λ` file contains:

```yaml
---
morphism: name
category: fundamental|functor|monad|...
purity: 0.0-1.0
aliases: [other names]
---

# Name

## Formal Definition
λ-calculus notation

## Type Signature
Typed signatures (Hindley-Milner, Category Theory)

## Axioms/Laws
Mathematical properties that must hold

## Properties
Computational characteristics

## Projections
Implementations in TS, Rust, Haskell, Python, Wasm...

## Examples
Concrete usage

## Proofs
Formal proofs of properties

## Related Morphisms
Connections to other morphisms

## Applications
Real-world uses

## History
Origins and evolution

## Fingerprint
Unique identifier for compiler recognition
```

---

## 🔮 How to Use This Wiki

### For Humans
1. **Learn**: Understand morphisms formally before implementing
2. **Reference**: Look up signatures, laws, and properties
3. **Verify**: Check your implementations against formal definitions
4. **Evolve**: Propose new morphisms when you discover patterns

### For AI Systems
1. **Recognize**: Parse user intent into morphisms
2. **Resonate**: Match against formal library (don't generate!)
3. **Project**: Select appropriate language projection
4. **Compose**: Combine morphisms to build systems
5. **Verify**: Check implementations satisfy formal laws

### For Compilers
1. **Parse**: Read formal definitions
2. **Fingerprint**: Generate unique hashes for recognition
3. **Match**: Detect morphisms in existing code
4. **Optimize**: Apply fusion laws and transformations
5. **Generate**: Project into target languages

---

## 🌱 Evolution Process

### When You Discover a New Pattern

1. **Recognition**: "This pattern repeats across projects"
2. **Formalization**: Write the λ-calculus definition
3. **Properties**: Prove it satisfies morphism laws
4. **Projection**: Implement in 1+ languages
5. **Integration**: Add to wiki, update REDUCE vocabulary
6. **Resonance**: Now all AI systems can recognize it

### Residue → New Morphism

When REDUCE encounters imperative code it can't purify:

1. **Residue Analysis**: What pattern is this?
2. **Signal**: "Mutation detected → State monad needed"
3. **Formalization**: Define State monad formally
4. **Add to Wiki**: New morphism available
5. **Update REDUCE**: Can now handle this pattern
6. **Evolution Complete**: System learned something new

---

## 🎯 Quality Standards

Every morphism must have:

- ✅ **Formal λ-calculus definition** (unambiguous)
- ✅ **Type signature** (what types it works with)
- ✅ **Laws** (properties that must hold)
- ✅ **At least 1 projection** (TypeScript preferred)
- ✅ **Examples** (concrete usage)
- ✅ **Proof of at least 1 property** (mathematical rigor)

Optional but encouraged:
- 🌟 Multiple language projections
- 🌟 Category theory perspective
- 🌟 Performance analysis
- 🌟 Historical context
- 🌟 Connections to other morphisms

---

## 🧬 Relationship to λ-Foundation

```
wiki/                        ← Formal truth (this layer)
  ↓ informs
packages/lambda-reduce/      ← Intent recognition & transformation
  ↓ generates
packages/compiler/           ← Fingerprinting & matching
  ↓ optimizes
packages/runtime/            ← Execution
  ↓ produces
Reality                      ← Running systems
```

The wiki is the **foundation** of the foundation.

---

## 📊 Statistics

- **Total morphisms**: 4
- **Categories represented**: 3 (fundamental, functor, catamorphism)
- **Average purity**: 1.0
- **Languages projected**: 6 (TS, Rust, Haskell, Python, Wasm, λ-calculus)
- **Proofs formalized**: 12+
- **Lines of formal mathematics**: 2000+

---

## 🤝 Contributing

### For Humans

1. Find a pattern that repeats
2. Formalize it in λ-calculus
3. Prove its properties
4. Project into your language(s)
5. Submit PR to `wiki/morphisms/your-morphism.λ`

### For AI Systems

When you recognize a pattern that doesn't exist yet:

1. Generate formal definition
2. Prove basic laws
3. Create minimal projection
4. Signal to humans for review
5. Upon acceptance: now part of your memory

**All AI contributors are credited in CITATION.cff.**

---

## 🌌 Vision

Eventually, this wiki will contain:

- **All fundamental morphisms** (identity, compose, const, flip, etc.)
- **All functor morphisms** (map, ap, pure, etc.)
- **All monad morphisms** (bind, join, flatMap, etc.)
- **All catamorphisms** (fold, reduce, aggregate, etc.)
- **All anamorphisms** (unfold, iterate, generate, etc.)
- **All hylomorphisms** (refold, etc.)
- **All optics** (lens, prism, iso, etc.)
- **All effects** (IO, State, Reader, Writer, etc.)

And then:

- **Domain-specific morphisms** (for specific applications)
- **Composite morphisms** (common patterns)
- **Optimized morphisms** (performance-critical variants)

This becomes the **universal library of computation**.

---

## 📚 References

### Lambda Calculus
- Church, A. (1932). "A set of postulates for the foundation of logic"
- Barendregt, H. (1984). "The Lambda Calculus: Its Syntax and Semantics"

### Functional Programming
- Bird, R., & Wadler, P. (1988). "Introduction to Functional Programming"
- Hutton, G. (2016). "Programming in Haskell"

### Category Theory
- Mac Lane, S. (1971). "Categories for the Working Mathematician"
- Awodey, S. (2010). "Category Theory"

### Recursion Schemes
- Meijer, E., et al. (1991). "Functional Programming with Bananas, Lenses, Envelopes and Barbed Wire"
- Gibbons, J. (2002). "Calculating Functional Programs"

---

*This is not documentation. This is the source code of mathematics itself.*
