# Conservation of Flow Law

## Statement

In the Hex-Torus topology, computational flow is conserved: every input port connects to exactly one output port, and the total flow entering a region equals the total flow exiting.

## Formal Definition

Let:
- `G = (V, E)` be the directed graph of morphisms and connections
- `f_in(v)` = total flow entering vertex v
- `f_out(v)` = total flow exiting vertex v

**Conservation Law**: ∀v ∈ V: f_in(v) = f_out(v)

## Topological Proof

### 1. Local Conservation

For each fundamental morphism:

**Identity (I)**:
```
IN ──> [I] ──> OUT
f_in = 1, f_out = 1 ✓
```

**Application (@)**:
```
FUNC ──> [@] ──> RESULT
ARG  ──>/
f_in = 2, f_out = 1 (after reduction) ✓
```

**Abstraction (λ)**:
```
BODY ──> [λ] ──> CLOSURE
f_in = 1, f_out = 1 ✓
```

**Selection (?)**:
```
PRED ──> [?] ──> RESULT
THEN ──>/
ELSE ──>/
f_in = 3, f_out = 1 (one branch taken) ✓
```

### 2. Global Conservation

By induction on graph structure:
- Base case: Single morphism conserves flow ✓
- Inductive step: If subgraphs G₁, G₂ conserve flow, then:
  - Sequential composition G₁;G₂ conserves flow
  - Parallel composition G₁|G₂ conserves flow
  - Cyclic composition (via Y) maintains invariant

### 3. Hex-Torus Periodicity

The torus topology ensures:
```
∮_C f·dl = 0
```

Where C is any closed loop on the torus surface. This is the discrete analog of Gauss's law.

## Geometric Visualization

In the hexagonal tiling:

```
    ╱─╲─╱─╲
   ╱ A ╲ B ╲
  ╱─╲─╱─╲─╱─╲
 ╱ C ╲ * ╱ D ╲
╱─╲─╱─╲─╱─╲─╱
```

Flow entering the central hex (*) from A, B, C must equal flow exiting to B, D, etc.

## Connection to Church-Rosser

**Theorem**: Conservation of Flow ⟺ Church-Rosser Property

**Proof**:
- (→) If flow is conserved, then different reduction paths preserve total flow, implying same final state
- (←) If Church-Rosser holds, then reduction paths converge, implying flow conservation

## Implications

1. **No Resource Leaks**: Memory/compute is never lost
2. **Predictable Performance**: Flow determines cost
3. **Automatic Parallelism**: Non-intersecting flows can execute simultaneously
4. **Reversibility**: With flow records, computation can be undone

## Violation Detection

A system violates Conservation of Flow if:
- Ports are left disconnected (flow leak)
- Multiple outputs connect to one input (flow collision)  
- Cycles exist without Y-combinator mediation (infinite flow)

## Quantum Extension

In quantum lambda calculus:
- Flow becomes amplitude
- Conservation becomes unitarity
- Measurement collapses superposed flows

## Practical Application

When implementing morphisms:
1. Count input ports
2. Count output ports  
3. Ensure every path through the morphism preserves count
4. Test with flow analysis tools

---

*"What flows in must flow out - this is the way"*