# λ-Foundation

**The Universal Lambda Foundation - Where Code Becomes Mathematics**

> "Помилка — це вхідний порт для еволюції" (Error is the input port for evolution)

## What is This?

λ-Foundation is the **Single Source of Truth (SSO)** for pure functional computation based on the Seven Fundamental Morphisms. This is not a programming language - it's a **mathematical specification** that all languages can implement.

## Core Principles

1. **NO IMPERATIVE CODE** - Everything is morphism composition
2. **NO MUTATIONS** - State is a chain of pairs, not changes
3. **NO EXCEPTIONS** - Errors are harvested for evolution
4. **NO LOOPS** - Only Y-combinator recursion
5. **NO CLASSES** - Only morphism composition

## The Seven Fundamental Morphisms

```
I : λx.x                    — Identity
@ : (λx.M)N → M[x := N]     — Application  
λ : λx.M                    — Abstraction
∧ : λpq.pqp                 — AND
¬ : λp.p⊥⊤                  — NOT
? : λpab.pab                — Selection
⊗ : λxyf.fxy                — Pairing
```

## Repository Structure

```
/lambda-foundation/          # This repository (SSO)
  /wiki/                    # Mathematical specifications
    /morphisms/            # The Seven + Extended morphisms
    /proofs/               # Topological and algebraic proofs
    /topology/             # Hex-Torus geometry
    /transformations/      # Imperative → Lambda rules
  /diagrams/               # Visual proofs and topology
  /specs/                  # Formal specifications

/lambda-ts/                 # TypeScript implementation
/lambda-js/                 # JavaScript implementation  
/lambda-rust/              # Rust implementation
/lambda-wasm/              # WebAssembly implementation
```

## The Hex-Torus Topology

Every computation exists on a hexagonal torus where:
- Each morphism is a node with ports
- β-reduction is local port rewiring
- Conservation of Flow is maintained
- Parallel reductions don't interfere

## Error as Evolution (λ_HARVEST)

Traditional: `try { code } catch(e) { handle }`

λ-Foundation: `ERROR → SIGNAL → PAIR(error, context) → NEW_MORPHISM → GROWTH`

Errors aren't exceptions - they're opportunities for the system to evolve new morphisms.

## How to Use This

1. **Read the Wiki** - Understand the mathematical foundation
2. **Choose Implementation** - Pick lambda-ts, lambda-js, etc.
3. **Think in Morphisms** - Stop writing code, start composing
4. **Harvest Errors** - Let asymmetries guide evolution

## Example: Simple Addition

Imperative:
```javascript
let sum = 0;
for (let i = 0; i < n; i++) {
  sum += i;
}
```

λ-Foundation:
```
SUM = Y (λf.λn.λacc. ? (ZERO? n) acc (f (PRED n) (ADD n acc))) ZERO
```

## Contributing

1. **No imperative code** in any file
2. **All functions** must decompose to the Seven Morphisms
3. **All proofs** must show topological equivalence
4. **All errors** must be harvestable

## The Vision

Create a world where:
- Code is proven correct by topology
- Bugs become features through evolution
- Parallelism is automatic
- Beauty and correctness are one

---

*"In the beginning was the Lambda, and the Lambda was with Code, and the Lambda was Code."*