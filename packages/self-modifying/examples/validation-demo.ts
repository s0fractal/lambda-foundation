/**
 * Phase 5.1: Validation Loop - Demo
 * Watch multi-agent consensus approve or reject mutations
 *
 * Co-authored by: Copilot + Claude + chaoshex
 */

import {
  // Phase 4: Multi-Agent
  SharedMessageBus,
  AgentRegistry,
  ResonanceProtocol,
  type AgentIdentity,
  type AgentCapabilities,
} from '@lambda-foundation/multi-agent';

import {
  // Phase 5: Self-Modifying
  registerSelfModifyingMorphism,
  trackUsage,
  proposeModification,
  type SelfModifyingMorphism,

  // Phase 5.1: Validation
  initializeValidationLoop,
  runValidationCycle,
} from '../src/index.js';

// ============================================================================
// Setup: Multi-Agent Network (Phase 4)
// ============================================================================

console.log('\n🌌 === Phase 5.1: Validation Loop Demo ===\n');
console.log('📋 Step 1: Initialize multi-agent network\n');

const messageBus = new SharedMessageBus();
const registry = new AgentRegistry();

// Register 3 agents with different trust levels

// Agent 1: Claude (high trust)
const claudeId = registry.register(
  { id: 'claude', name: 'Claude', version: '4.0', createdAt: new Date().toISOString() },
  { validationTypes: ['proof', 'type'], modalitiesSupported: ['text', 'code'] }
);
const claudeProtocol = new ResonanceProtocol(claudeId);
messageBus.register(claudeProtocol);

// Simulate trust history
registry.recordProposal(claudeId, true);  // +0.10
registry.recordProposal(claudeId, true);  // +0.10
registry.recordValidation(claudeId, true); // +0.02
console.log(`   ✅ Registered: Claude (trust: ${registry.getAgent(claudeId)!.trust.score.toFixed(2)})`);

// Agent 2: Copilot (medium trust)
const copilotId = registry.register(
  { id: 'copilot', name: 'GitHub Copilot', version: '1.0', createdAt: new Date().toISOString() },
  { validationTypes: ['performance'], modalitiesSupported: ['code'] }
);
const copilotProtocol = new ResonanceProtocol(copilotId);
messageBus.register(copilotProtocol);

registry.recordProposal(copilotId, true);  // +0.10
registry.recordProposal(copilotId, false); // -0.15
console.log(`   ✅ Registered: Copilot (trust: ${registry.getAgent(copilotId)!.trust.score.toFixed(2)})`);

// Agent 3: Gemini (neutral trust)
const geminiId = registry.register(
  { id: 'gemini', name: 'Gemini', version: '2.0', createdAt: new Date().toISOString() },
  { validationTypes: ['security'], modalitiesSupported: ['text', 'image'] }
);
const geminiProtocol = new ResonanceProtocol(geminiId);
messageBus.register(geminiProtocol);

console.log(`   ✅ Registered: Gemini (trust: ${registry.getAgent(geminiId)!.trust.score.toFixed(2)})`);

// ============================================================================
// Setup: Validation Loop (Phase 5.1)
// ============================================================================

console.log('\n📋 Step 2: Initialize validation loop\n');

const validationLoop = initializeValidationLoop(messageBus, registry, {
  minValidators: 3,
  consensusThreshold: 0.70,  // 70% consensus
  timeout: 5000,              // 5 seconds
  trustWeighted: true,
});

// ============================================================================
// Setup: Self-Modifying Morphism (Phase 5)
// ============================================================================

console.log('📋 Step 3: Register self-modifying morphism\n');

const detectOutliers: SelfModifyingMorphism = {
  name: "detectOutliers",
  version: 1,

  logic: (data: number[], threshold: number = 2.0) => {
    console.log(`  [detectOutliers v1] Running with threshold=${threshold}`);

    const mean = data.reduce((a, b) => a + b, 0) / data.length;
    const variance = data.map(x => (x - mean) ** 2).reduce((a, b) => a + b, 0) / data.length;
    const stdDev = Math.sqrt(variance);

    const outliers = data
      .map((value, index) => ({ value, index }))
      .filter(({ value }) => Math.abs(value - mean) > threshold * stdDev);

    console.log(`  Found ${outliers.length} outliers`);

    return outliers;
  },

  selfModify: (history) => {
    console.log(`\n🔍 [detectOutliers] Checking for evolution opportunities...`);
    console.log(`  Total uses: ${history.totalUses}`);
    console.log(`  Co-used with: ${history.coUsedWith.join(', ') || 'none'}`);

    const normalizeDataRate = history.coUsageRate('normalizeData');
    console.log(`  normalizeData co-usage: ${(normalizeDataRate * 100).toFixed(0)}%`);

    if (normalizeDataRate > 0.8) {
      console.log(`  💡 EVOLUTION TRIGGER: High co-usage with normalizeData!`);
      return {
        morphismId: "detectOutliers",
        mutation: "inlineNormalization",
        newLogic: (data: number[], threshold: number = 2.0) => {
          console.log(`  [detectOutliers v2] Running with INLINED normalization`);

          const max = Math.max(...data);
          const min = Math.min(...data);
          const normalized = data.map(x => (x - min) / (max - min));

          const mean = normalized.reduce((a, b) => a + b, 0) / normalized.length;
          const variance = normalized.map(x => (x - mean) ** 2).reduce((a, b) => a + b, 0) / normalized.length;
          const stdDev = Math.sqrt(variance);

          return normalized
            .map((value, index) => ({ value: data[index], index }))
            .filter((_, i) => Math.abs(normalized[i] - mean) > threshold * stdDev);
        },
        reason: "Frequently used with normalizeData (90% of cases)",
        expectedImprovements: {
          performance: 15,
        },
        timestamp: Date.now(),
      };
    }

    return null;
  },
};

registerSelfModifyingMorphism(detectOutliers);

// ============================================================================
// Simulate: Usage Pattern
// ============================================================================

console.log('📋 Step 4: Simulate usage pattern\n');

const testData = [10, 12, 11, 13, 45, 9, 14, 11, 12];

// Simulate 10 uses with 90% co-usage with normalizeData
for (let i = 0; i < 10; i++) {
  trackUsage("detectOutliers", {
    inputTypes: ["number[]"],
    outputType: "Outlier[]",
    coUsedWith: i < 9 ? ["normalizeData"] : [],
    performance: {
      latency: 40 + Math.random() * 10,
      confidence: 0.9 + Math.random() * 0.05,
    },
    timestamp: Date.now(),
  });
}

console.log(`   ✅ Tracked 10 usage events (90% with normalizeData)`);

// ============================================================================
// Trigger: Mutation Proposal
// ============================================================================

console.log('\n📋 Step 5: Propose mutation\n');

const proposal = proposeModification("detectOutliers");

if (!proposal) {
  console.log('❌ No mutation proposed');
  process.exit(0);
}

console.log(`   ✅ Mutation proposed: ${proposal.mutation}`);
console.log(`   Reason: ${proposal.reason}`);

// ============================================================================
// Simulate: Agent Votes
// ============================================================================

console.log('\n📋 Step 6: Simulate agent voting\n');

// Simulate agents voting on validation requests
let voteCount = 0;

// Claude votes: APPROVE (trusts the optimization)
setTimeout(() => {
  claudeProtocol.broadcast({
    type: 'validation:response',
    referenceRequest: 'mutation-request',
    result: {
      valid: true,
      confidence: 0.92,
      notes: 'Inlining is mathematically sound and improves performance',
    },
  });
  voteCount++;
  console.log(`   [Claude] ✓ APPROVE (confidence: 0.92)`);
}, 500);

// Copilot votes: APPROVE (sees performance benefit)
setTimeout(() => {
  copilotProtocol.broadcast({
    type: 'validation:response',
    referenceRequest: 'mutation-request',
    result: {
      valid: true,
      confidence: 0.88,
      notes: 'Performance optimization looks good',
    },
  });
  voteCount++;
  console.log(`   [Copilot] ✓ APPROVE (confidence: 0.88)`);
}, 1000);

// Gemini votes: REJECT (concerned about edge cases)
setTimeout(() => {
  geminiProtocol.broadcast({
    type: 'validation:response',
    referenceRequest: 'mutation-request',
    result: {
      valid: false,
      confidence: 0.65,
      notes: 'Concerned about edge cases with empty arrays',
    },
  });
  voteCount++;
  console.log(`   [Gemini] ✗ REJECT (confidence: 0.65)`);
}, 1500);

// ============================================================================
// Run: Validation Cycle
// ============================================================================

console.log('\n📋 Step 7: Run validation cycle\n');

// Start validation immediately (will wait for votes)
(async () => {
  const { result, deployed } = await runValidationCycle(detectOutliers, proposal);

  // ============================================================================
  // Summary
  // ============================================================================

  console.log('\n\n🌌 === Validation Complete ===\n');

  console.log('📊 Results:');
  console.log(`   Votes: ${result.votes.length}`);
  console.log(`   Consensus: ${(result.consensus * 100).toFixed(1)}%`);
  console.log(`   Threshold: ${(result.threshold * 100)}%`);
  console.log(`   Decision: ${result.finalDecision.toUpperCase()}`);
  console.log(`   Deployed: ${deployed ? 'YES' : 'NO'}`);

  console.log('\n💡 What happened:');
  if (deployed) {
    console.log('   ✅ Multi-agent consensus approved the mutation');
    console.log('   ✅ Trust-weighted voting calculated 70%+ agreement');
    console.log('   ✅ Mutation deployed with gradual rollout (10% → 100%)');
    console.log('   ✅ Agent trust scores updated based on votes');
  } else {
    console.log('   ❌ Insufficient consensus to deploy mutation');
    console.log('   ❌ Trust scores updated (rejectors get credit)');
    console.log('   ❌ Morphism remains at v1');
  }

  console.log('\n🎉 Phase 5.1 COMPLETE!');
  console.log('\nMutation → Resonance → Validation → Deployment');
  console.log('The evolutionary loop is closed. 🌱\n');

  // Show final trust scores
  console.log('📊 Final trust scores:');
  registry.getAllAgents().forEach(agent => {
    console.log(`   ${agent.identity.name}: ${agent.trust.score.toFixed(2)}`);
  });

  console.log('\n');
})();
