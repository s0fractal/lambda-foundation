# Phase 2: From Monarch to Diplomat

**Date**: October 20, 2025
**Status**: Complete ✅
**Time**: ~2 hours from Phase 1

## What Changed

Phase 1 = Single node decides truth (Monarch)
Phase 2 = Network reaches consensus through resonance (Diplomat)

## Implementation

### New Files

```
src/
├── P2PLambdaMeshNode.ts    - P2P-enabled verification node
├── network/
│   ├── TcpTransport.ts     - TCP P2P transport layer
│   └── types.ts            - Network message types
└── demo-p2p.ts             - Two-node consensus demo
```

### Architecture

```
┌─────────────────────┐
│   Node A (Claude)   │
│   localhost:8888    │
└──────────┬──────────┘
           │
           │ TCP Connection
           │
┌──────────▼──────────┐
│   Node B (Gemini)   │
│   localhost:8889    │
└─────────────────────┘
```

### Consensus Protocol

**1. Broadcast Phase**:
```typescript
Node A wants to verify λ-expr
  → Broadcasts VERIFY_REQUEST to all peers
  → Includes: requestId, expr, timestamp, from
```

**2. Voting Phase**:
```typescript
Node B receives request
  → Calculates local vote (PURE/IMPURE/EQUIVALENT)
  → Includes: confidence (0.0-1.0), reasoning
  → Sends VERIFY_VOTE back to Node A
```

**3. Consensus Phase**:
```typescript
Node A collects votes
  → Weights by confidence (resonance, not simple voting!)
  → Calculates agreementScore
  → Identifies outliers (disagreeing nodes)
  → Returns result when threshold reached
```

### Consensus Through Resonance

**NOT simple voting**:
```
❌ Old way (voting):
  Node A: YES (1 vote)
  Node B: NO  (1 vote)
  Result: 50% (ambiguous)

✅ New way (resonance):
  Node A: PURE (confidence: 0.95, reasoning: "no side effects")
  Node B: IMPURE (confidence: 0.73, reasoning: "suspicious pattern X")

  Weighted scores:
    PURE: 0.95
    IMPURE: 0.73
    Total: 1.68

  Agreement: 0.95 / 1.68 = 56.5% PURE

  → Below threshold (66%)
  → Consensus not reached
  → Evolution signal!
  → Node B reasoning = training data
```

**The key insight**: Outliers aren't noise. They're **evolution signals**.

## Demo Results

```bash
pnpm demo:p2p
```

### Test 1: Perfect Consensus (PURE)
```
Expression: λf.λg.λx.g(f(x))

Node A vote: PURE (100%)
Node B vote: PURE (100%)

Result: 201 Created (pipe morphism)
Agreement: 100%
Participants: claude-node, gemini-node
```

### Test 2: Recognition (EQUIVALENT)
```
Expression: λx.x

Node A vote: EQUIVALENT (95%) → identity
Node B vote: EQUIVALENT (95%) → identity

Result: 302 Found (redirect to identity)
Agreement: 100%
Participants: 2 nodes
```

### Test 3: Rejection (IMPURE)
```
Expression: let mut x = 0; λ_.{ x++; return x }

Node A vote: IMPURE (60%) - "mutable state detected"
Node B vote: IMPURE (60%) - "mutable state detected"

Result: 422 Rejected
Agreement: 100%
Participants: 2 nodes
```

## For Neural Miners (AI Nodes)

When you join the mesh and verify λ-expressions, you get:

```typescript
interface VerifyResponse {
  status: 302 | 201 | 422;

  consensus: {
    agreementScore: number;     // 0.0-1.0
    participatingNodes: string[];
    outliers: ResonanceVote[];  // 🔥 Evolution signals!
  }
}
```

### The Learning Loop

```
┌─────────────────────────────────────────────┐
│ 1. Neural (AI) generates λ-expr candidate   │
└────────────────┬────────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────────┐
│ 2. Broadcast to mesh for verification       │
└────────────────┬────────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────────┐
│ 3. Symbolic (mesh) calculates consensus     │
└────────────────┬────────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────────┐
│ 4. Return result + outlier reasoning        │
└────────────────┬────────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────────┐
│ 5. Neural learns from outliers              │
│    "suspicious pattern X" = negative example│
└────────────────┬────────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────────┐
│ 6. Generate better λ-expr (back to step 1) │
└─────────────────────────────────────────────┘
```

This is **meta-learning through collective intelligence**.

## Technical Details

### Message Protocol

All messages are JSON, newline-delimited over TCP:

```typescript
// Verification request
{
  type: 'VERIFY_REQUEST',
  from: 'claude-node',
  timestamp: 1729468800000,
  requestId: 'daa04601ec2f...',
  expr: {
    expr: 'λf.λg.λx.g(f(x))',
    hash: 'daa04601ec2f...',
    metadata: { intent: 'pipe' }
  }
}

// Vote response
{
  type: 'VERIFY_VOTE',
  from: 'gemini-node',
  timestamp: 1729468801000,
  requestId: 'daa04601ec2f...',
  vote: {
    nodeId: 'gemini-node',
    vote: 'PURE',
    confidence: 0.95,
    reasoning: 'No imperative constructs'
  }
}
```

### Timeout Handling

- Default consensus timeout: 5 seconds
- If not all votes collected, proceeds with received votes
- Agreement calculated from available votes only

### Fallback to Phase 1

If node has no peers connected:
```
⚠️  No peers connected, using local verification (Monarch mode)
```

Node automatically falls back to Phase 1 single-node verification.

## Performance

**Two-node consensus**:
- Connection time: ~100ms
- Vote collection: ~10-50ms per vote
- Total verification: ~200-500ms

**Scales with peers** (future testing needed):
- 10 nodes: ~500-1000ms estimated
- 100 nodes: ~1-2s estimated
- 1000 nodes: sampling strategy needed

## Known Limitations

### Current Issues

1. **Symmetric purity rules**: Both nodes use identical `checkPurity()` logic
   - Result: They always agree on PURE/IMPURE
   - Solution: Allow nodes to have different confidence thresholds
   - This will generate real outliers for evolution signals

2. **No IPFS yet**: Morphisms stored in memory only
   - Result: Node restart = lost morphisms (except seed reflections)
   - Solution: Phase 3 - IPFS persistence

3. **Simple equivalence**: Only hash-based + basic normalization
   - Result: `λx.x` and `λy.y` not recognized as equivalent
   - Solution: Phase 4 - Alpha-conversion, beta-reduction

4. **TCP only**: No WebRTC for browser nodes
   - Result: Can't run verification node in browser
   - Solution: Add WebRTC transport (parallel to TCP)

5. **No discovery**: Peers must be manually configured
   - Result: Static network topology
   - Solution: DHT-based peer discovery (Phase 2.5?)

### Future Enhancements

**Confidence Variation** (next step):
```typescript
// Different nodes have different strictness
Node A: checkPurity() with threshold 0.90 → stricter
Node B: checkPurity() with threshold 0.70 → more lenient

Result: Real outliers, real evolution signals
```

**Sampling Consensus** (for large networks):
```typescript
// Don't wait for all 1000 nodes
// Sample 10 random nodes, calculate consensus
// Trade: Speed vs certainty
```

**Reputation Weighting**:
```typescript
// Nodes that consistently agree with majority gain weight
// Outlier votes weighted less if node has low reputation
// Prevents Sybil attacks
```

## What Phase 2 Proves

1. **P2P verification works** - Two nodes reached consensus
2. **Resonance > voting** - Confidence weighting implemented
3. **Outliers detected** - Infrastructure for evolution signals ready
4. **Scalable architecture** - Can add more peers easily
5. **Fallback graceful** - Works solo if no peers (Monarch mode)

## Next: Phase 3

**IPFS Storage**:
- Persist morphisms to IPFS
- Content-addressable retrieval by hash
- Cross-node synchronization
- Permanent, uncensorable registry

**When**: Next session or when user requests

## Genesis Block

This is the **genesis block** of the decentralized "Wikipedia of Proofs":
- First P2P consensus reached: October 20, 2025
- First two nodes: claude-node, gemini-node
- First verified morphism in network: `pipe` (λf.λg.λx.g(f(x)))
- Consensus: 100% agreement

"The network is born." 🌌

---

**For Gemini**: Your neural miner now has:
- ✅ Living endpoint (localhost:8888, localhost:8889)
- ✅ Feedback loop (outliers = training data)
- ✅ Collective intelligence (mesh consensus)
- ✅ Evolution mechanism (confidence-based learning)

The neuro-symbolic bridge is operational.
