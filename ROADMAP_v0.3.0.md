# Roadmap: v0.3.0 - Performance & Testing

**Status**: Planning Phase
**Target**: Q1 2025 (tentative)
**Theme**: Optimize, Validate, Scale

---

## 🎯 Overview

Version 0.3.0 focuses on **performance optimization** and **testing coverage**, implementing medium-priority items from ChatGPT's technical review while maintaining 100% purity compliance.

**Guiding Principle**: Optimize after measuring, never prematurely.

---

## 🔥 Planned Features

### 1. Fingerprint v2 Migration (xxHash/BLAKE3)

**Current State**: Custom `hash32()` function
**Target**: Industry-standard xxHash or BLAKE3
**Approach**: **Two-phase migration** (zero downtime)

#### Phase A: Dual Fingerprinting
```typescript
// Add fingerprint_v2 alongside fingerprint_v1
interface GraphNode {
  fingerprint_v1?: string;  // Current (keep for backward compat)
  fingerprint_v2?: string;  // New (xxHash/BLAKE3)
}

// Build edges using both
edges = buildLoveArcs(seeds, {
  useV1: true,   // Current
  useV2: true,   // New (parallel)
});
```

**Metrics to Track**:
- Collision rate: v1 vs v2
- Performance: hashing speed (samples/sec)
- Coverage: % of seeds with both fingerprints

**Duration**: 2-4 weeks (collect data)

#### Phase B: Analysis & Decision
- Compare collision rates
- Benchmark performance
- Evaluate code clarity

**Decision Point**: Keep v2 if:
- Collision rate < v1
- Performance ≥ v1
- Code maintainability ≥ v1

#### Phase C: Migration (if approved)
```typescript
// Migrate seeds to v2
seeds.forEach(s => {
  s.fingerprint = s.fingerprint_v2;  // Switch
  delete s.fingerprint_v1;           // Clean up
  delete s.fingerprint_v2;
});
```

**Rollback Plan**: Restore v1 from git history if issues arise

---

### 2. Incremental LOVE Indexing (O(Δ) Optimization)

**Current State**: O(N²) for full graph rebuild
**Target**: O(Δ) for incremental updates

#### Data Structures
```typescript
// Maintain two indices
const byNF = new Map<string, Set<string>>();     // Normalized form → seed IDs
const byFP = new Map<string, Set<string>>();     // Fingerprint → seed IDs

// Example:
// byNF.get("λx.x") → Set(["seed-identity-1", "seed-identity-2"])
// byFP.get("a1b2c3") → Set(["seed-double-mult", "seed-double-add"])
```

#### Incremental Update Algorithm
```typescript
function updateLoveArcs(changedSeeds: GraphNode[]) {
  const affectedEdges = new Set<Edge>();

  for (const seed of changedSeeds) {
    // Remove old edges
    removeEdgesForSeed(seed.id);

    // Update indices
    if (seed.nf) byNF.get(seed.nf)?.add(seed.id);
    if (seed.fingerprint) byFP.get(seed.fingerprint)?.add(seed.id);

    // Rebuild edges ONLY for this seed
    const candidates = new Set([
      ...(seed.nf ? byNF.get(seed.nf) ?? [] : []),
      ...(seed.fingerprint ? byFP.get(seed.fingerprint) ?? [] : [])
    ]);

    for (const targetId of candidates) {
      if (targetId !== seed.id) {
        affectedEdges.add({
          from: seed.id,
          to: targetId,
          type: "LOVE_ARC",
          strength: /* compute */
        });
      }
    }
  }

  return Array.from(affectedEdges);
}
```

**Complexity**:
- Full rebuild: O(N²) where N = total seeds
- Incremental: O(Δ × C) where Δ = changed seeds, C = cluster size
- For typical case (C ≈ 10, Δ = 1): 50x faster

**Trigger Threshold**: Implement when seeds > 1000

---

### 3. Property-Based Testing (fast-check)

**Goal**: Validate morphism properties across thousands of inputs

#### Phase 1: Golden Canary Test
```typescript
// Test the canonical example: double equivalence
import fc from 'fast-check';

test('double equivalence: x*2 ≡ x+x (LOVE_ARC detection)', () => {
  const double_mult = (x: number) => x * 2;
  const double_add = (x: number) => x + x;

  // Property: Same behavior across all integers
  fc.assert(
    fc.property(
      fc.integer({ min: -1e6, max: 1e6 }),
      (x) => double_mult(x) === double_add(x)
    )
  );

  // Verify LOVE_ARC is detected
  const arc = detectLoveArc(double_mult, double_add);
  expect(arc.type).toBe("LOVE_ARC");
  expect(arc.strength).toBe("HARD_ISO"); // Normalized forms match
});
```

**Expected Outcome**:
- Pass 10,000+ random inputs
- Prove equivalence empirically
- Catch edge cases (overflow, NaN, etc.)

#### Phase 2: Core Morphism Properties
```typescript
// λ_COMPOSE associativity
fc.property(
  fc.func(fc.integer()), // f
  fc.func(fc.integer()), // g
  fc.func(fc.integer()), // h
  fc.integer(),          // x
  (f, g, h, x) => {
    // (f ∘ g) ∘ h ≡ f ∘ (g ∘ h)
    const lhs = compose(compose(f, g), h)(x);
    const rhs = compose(f, compose(g, h))(x);
    return lhs === rhs;
  }
);

// λ_LOVE commutativity
fc.property(
  fc.func(fc.integer()), // f
  fc.func(fc.integer()), // g
  (f, g) => {
    // λ_LOVE(f, g) ≈ λ_LOVE(g, f) (symmetric)
    const arc1 = detectLoveArc(f, g);
    const arc2 = detectLoveArc(g, f);
    return arc1.strength === arc2.strength;
  }
);
```

#### Phase 3: Gradual Coverage
- Target: 1 property test per morphism
- Priority: λ_REDUCE, λ_COMPOSE, λ_LOVE, λ_HARVEST
- Coverage goal: 80% of core morphisms

---

### 4. 432Hz ADSR Envelope (UX Polish)

**Current State**: Basic sine wave (potential clicks)
**Target**: Professional audio quality

#### Implementation
```typescript
// packages/garden/src/audio/resonance.ts
export function play432Hz(options: {
  gain?: number;      // Default: 0.05
  duration?: number;  // Default: 0.3s
  attack?: number;    // Default: 0.02s
  decay?: number;     // Default: 0.05s
  sustain?: number;   // Default: 0.7 (70% of gain)
  release?: number;   // Default: 0.1s
}) {
  const ctx = new AudioContext();
  const osc = new OscillatorNode(ctx, { frequency: 432 });
  const gain = new GainNode(ctx, { gain: 0 });

  osc.connect(gain).connect(ctx.destination);

  const t = ctx.currentTime;
  const { attack = 0.02, decay = 0.05, sustain = 0.7, release = 0.1, duration = 0.3 } = options;
  const maxGain = options.gain ?? 0.05;
  const sustainGain = maxGain * sustain;

  // ADSR envelope
  gain.gain.setValueAtTime(0, t);
  gain.gain.linearRampToValueAtTime(maxGain, t + attack);              // Attack
  gain.gain.linearRampToValueAtTime(sustainGain, t + attack + decay);  // Decay
  gain.gain.setValueAtTime(sustainGain, t + duration - release);       // Sustain
  gain.gain.linearRampToValueAtTime(0, t + duration);                  // Release

  osc.start(t);
  osc.stop(t + duration);
}
```

**User Experience**:
- No clicks/pops
- Smooth attack (20ms)
- Natural decay (50ms)
- Gentle release (100ms)

**Integration Points**:
- LOVE_ARC detection → play tone
- Theorem proof complete → play tone
- Purity validation pass → play tone

---

### 5. Sandbox Execution (When Needed)

**Trigger**: User-submitted seeds from community

**Current Risk**: None (all seeds are manually created)

**Future Risk**: Untrusted code execution

#### Solution: iframe + postMessage
```typescript
// When community seeds are accepted:
// 1. Create sandboxed iframe
<iframe
  id="λ-sandbox"
  sandbox="allow-scripts"
  src="/sandbox.html"
  style="display:none"
></iframe>

// 2. Eval in sandbox
function evalInSandbox(code: string): Promise<any> {
  const iframe = document.getElementById('λ-sandbox') as HTMLIFrameElement;
  return new Promise((resolve, reject) => {
    const id = crypto.randomUUID();
    const handler = (e: MessageEvent) => {
      if (e.data.id === id) {
        window.removeEventListener('message', handler);
        e.data.error ? reject(e.data.error) : resolve(e.data.result);
      }
    };
    window.addEventListener('message', handler);
    iframe.contentWindow!.postMessage({ id, code }, '*');
  });
}
```

**Deferred Until**: Community submission feature is built

---

## 📊 Success Metrics

### Performance
- [ ] Fingerprint v2 collision rate < v1
- [ ] Incremental LOVE 10x+ faster for Δ < 10% seeds
- [ ] 432Hz tone has no audible clicks

### Quality
- [ ] Property tests pass 10,000+ cases
- [ ] Test coverage ≥ 80% for core morphisms
- [ ] Zero regressions in purity scores

### Community
- [ ] At least 1 external contributor
- [ ] At least 3 community queries answered
- [ ] At least 100 GitHub stars

---

## 🗓️ Timeline (Tentative)

### Week 1-2: Fingerprint v2 (Phase A)
- Implement dual fingerprinting
- Collect collision metrics
- Performance benchmarks

### Week 3-4: Property Testing
- Implement golden canary test
- Add tests for 3-5 core morphisms
- Document property test patterns

### Week 5-6: Analysis & Decision
- Review fingerprint v2 data
- Decide on migration (Phase C) or rollback
- Implement incremental LOVE (if justified by seed count)

### Week 7: UX Polish
- 432Hz ADSR envelope
- Audio integration in garden
- User testing

### Week 8: Release Prep
- Documentation updates
- Release notes
- Community announcements

**Total**: ~8 weeks (flexible)

---

## 🚫 Out of Scope (v0.3.0)

- Sandbox execution (defer until community submissions)
- New morphisms (focus on quality, not quantity)
- Breaking changes (maintain backward compatibility)
- Major UI redesign (incremental improvements only)

---

## 🤝 How to Contribute

Interested in v0.3.0 features? Check:
- [ ] Open issues tagged `v0.3.0`
- [ ] Read `CONTRIBUTING.md`
- [ ] Join discussions in Quintinity Response thread
- [ ] Submit PRs with property tests

---

## 📚 References

**Technical**:
- [xxHash](https://github.com/Cyan4973/xxHash) - Fast hashing
- [BLAKE3](https://github.com/BLAKE3-team/BLAKE3) - Cryptographic hashing
- [fast-check](https://fast-check.dev/) - Property-based testing
- [Web Audio API](https://developer.mozilla.org/en-US/docs/Web/API/Web_Audio_API) - ADSR envelopes

**Community Feedback**:
- ChatGPT review (2025-01-07)
- GitHub issues (ongoing)
- Discord discussions (planned)

---

**Next Update**: After v0.2.0 release

🌱∞λ = **optimize(performance) ⊗ validate(properties) ⊗ polish(UX)**

---

*This roadmap is subject to change based on community feedback and priorities.*
