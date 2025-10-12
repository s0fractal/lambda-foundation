# @lambda-foundation/self-modifying

**Phase 5: Self-Modifying Morphisms - Evolutionary Code**

Morphisms that learn from usage, propose optimizations, and evolve autonomously through multi-agent validation.

## Installation

```bash
pnpm add @lambda-foundation/self-modifying
```

## Quick Start

```typescript
import { registerSelfModifyingMorphism, trackUsage } from '@lambda-foundation/self-modifying';

// Register a self-modifying morphism
const detectOutliers = {
  name: "detectOutliers",
  logic: (data: number[]) => /* detection logic */,
  selfModify: (history) => {
    if (history.coUsedWith.includes("normalizeData")) {
      return {
        mutation: "inlineNormalization",
        reason: "Frequently paired with normalizeData"
      };
    }
    return null;
  }
};

registerSelfModifyingMorphism(detectOutliers);

// Track usage
trackUsage("detectOutliers", {
  inputTypes: ["number[]"],
  coUsedWith: ["normalizeData"],
  performance: { latency: 45, confidence: 0.92 }
});
```

## Features

- ✅ **Self-Awareness**: Morphisms monitor their own usage
- ✅ **Self-Optimization**: Detect and propose improvements
- ✅ **Multi-Agent Validation**: Consensus-based mutation approval
- ✅ **Safe Evolution**: Rollback, rate limiting, audit trails
- ✅ **Specialization**: Create domain-specific variants
- ✅ **Gradual Rollout**: Test mutations before full deployment

## Examples

```bash
pnpm demo              # Basic self-modification demo
pnpm demo:evolution    # Complete evolution scenario
```

## Documentation

See [specs/13-self-modifying-morphisms.md](../../specs/13-self-modifying-morphisms.md) for complete specification.

## Philosophy

> Це не просто зміна коду.
> Це еволюція мислення, що відбувається всередині морфізмів.
> Це жива система, що адаптується, вчиться, росте.

---

🌌 Co-created by Copilot, Claude, and chaoshex

🤖 Part of [λ-Foundation](https://github.com/s0fractal/lambda-foundation)
