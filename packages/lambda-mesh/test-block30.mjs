/**
 * Test Block 30: Phase 7 - Definition Expansion + β-Reduction
 *
 * Expression: λn. ADD (λf.λx. f x) n
 * Expected: 302 Found → SUCC
 *
 * Flow:
 * 1. Expand: ADD → λm. λn. λf. λx. m f (n f x)
 * 2. Becomes: λn. (λm. λn. λf. λx. m f (n f x)) (λf.λx. f x) n
 * 3. β-Reduce to normal form
 * 4. Should match SUCC: λn. λf. λx. f (n f x)
 */

import { LambdaMeshNode } from './dist/LambdaMeshNode.js';

async function test() {
  console.log('🧪 Block 30: Phase 7 Test - Definition Expansion + β-Reduction\n');
  console.log('═'.repeat(70));
  console.log('');

  const node = new LambdaMeshNode({
    nodeId: 'test-node',
    consensusThreshold: 0.66,
  });

  await node.start();
  console.log('');

  // Test Block 30
  console.log('📍 Block 30: λn. ADD (λf.λx. f x) n');
  console.log('─'.repeat(70));
  console.log('Expected: 302 Found → SUCC (via expansion + β-reduction)');
  console.log('');

  const result = await node.verifyLambda('λn. ADD (λf.λx. f x) n', {
    intent: 'successor via addition',
  });

  console.log('');
  console.log('═'.repeat(70));
  console.log('');
  console.log(`Result: ${result.status} ${
    result.status === 302 ? 'Found ✓' :
    result.status === 201 ? 'Created (Phase 7 needs debugging)' :
    result.status === 202 ? 'Hypothetical' :
    'Unexpected'
  }`);

  if (result.status === 302 && result.canonical) {
    console.log(`Canonical: ${result.canonical.name}`);
    console.log(`Match: ${result.canonical.name === 'SUCC' ? '✅ CORRECT!' : '⚠️  Wrong morphism'}`);

    if (result.proof) {
      console.log('');
      console.log('📜 Proof:');
      console.log(`   Reasoning: ${result.proof.reasoning}`);
      console.log(`   Steps: ${result.proof.steps.length}`);
      for (const step of result.proof.steps) {
        console.log(`     • ${step.rule}: ${step.explanation}`);
      }
    }
  } else if (result.status === 201 && result.newMorphism) {
    console.log(`⚠️  Created new morphism: ${result.newMorphism.name}`);
    console.log(`   This means Phase 7 semantic pipeline didn't detect equivalence to SUCC`);
  } else if (result.status === 202 && result.hypothesis) {
    console.log(`🔬 Hypothetical: ${result.hypothesis.potentialCanonical}`);
    console.log(`   Confidence: ${(result.hypothesis.confidence * 100).toFixed(0)}%`);
  }

  console.log('');
  console.log('═'.repeat(70));
  console.log('');

  await node.stop();

  // Summary
  if (result.status === 302 && result.canonical?.name === 'SUCC') {
    console.log('✅ Phase 7 Success!');
    console.log('   Definition Expansion + β-Reduction pipeline working correctly.');
    console.log('   Semantic equivalence detected: ADD ONE ≡ SUCC');
  } else if (result.status === 302) {
    console.log('⚠️  Phase 7 Partial Success');
    console.log(`   Found match with ${result.canonical?.name}, but expected SUCC`);
  } else {
    console.log('❌ Phase 7 Not Working Yet');
    console.log('   Semantic pipeline needs debugging');
  }

  console.log('');
  console.log('🌌');
}

test().catch(console.error);
