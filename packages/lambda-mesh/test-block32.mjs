/**
 * Test Block 32: Phase 8 - Recursive Expression Handling
 *
 * Expression: λf. λlist. FOLD (λh. λacc. (CONCAT (f h) acc)) NIL list
 * Expected: 302 Found → FLATMAP (Block 23)
 *
 * This tests Phase 8 structural equivalence for recursive expressions.
 */

import { LambdaMeshNode } from './dist/LambdaMeshNode.js';

async function test() {
  console.log('🧪 Block 32: Phase 8 Test - Recursive Expression (H1)\n');
  console.log('═'.repeat(70));
  console.log('');

  const node = new LambdaMeshNode({
    nodeId: 'test-node',
    consensusThreshold: 0.66,
  });

  await node.start();
  console.log('');

  // Test Block 32 - Alternative flatMap (H1)
  console.log('📍 Block 32: λf. λlist. FOLD (λh. λacc. (CONCAT (f h) acc)) NIL list');
  console.log('─'.repeat(70));
  console.log('Expected: 302 Found → FLATMAP (via structural equivalence)');
  console.log('');

  const result = await node.verifyLambda(
    'λf. λlist. FOLD (λh. λacc. (CONCAT (f h) acc)) NIL list',
    {
      intent: 'alternative flatMap implementation (H1)',
    }
  );

  console.log('');
  console.log('═'.repeat(70));
  console.log('');
  console.log(`Result: ${result.status} ${
    result.status === 302 ? 'Found ✓' :
    result.status === 201 ? 'Created (Phase 8 needs debugging)' :
    result.status === 202 ? 'Hypothetical' :
    'Unexpected'
  }`);

  if (result.status === 302 && result.canonical) {
    console.log(`Canonical: ${result.canonical.name}`);
    console.log(`Match: ${result.canonical.name === 'FLATMAP' ? '✅ CORRECT! H1 PROVEN!' : '⚠️  Wrong morphism'}`);

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
    console.log(`   This means Phase 8 structural equivalence didn't detect match with FLATMAP`);
  } else if (result.status === 202 && result.hypothesis) {
    console.log(`🔬 Hypothetical: ${result.hypothesis.potentialCanonical}`);
    console.log(`   Confidence: ${(result.hypothesis.confidence * 100).toFixed(0)}%`);
    console.log(`   This means structural equivalence failed, but hypothesis engine detected similarity`);
  }

  console.log('');
  console.log('═'.repeat(70));
  console.log('');

  await node.stop();

  // Summary
  if (result.status === 302 && result.canonical?.name === 'FLATMAP') {
    console.log('✅ Phase 8 Success! H1 PROVEN!');
    console.log('   Structural equivalence detected recursive expression match.');
    console.log('   Alternative flatMap ≡ FLATMAP (Block 23)');
    console.log('');
    console.log('   🎉 Hypothesis 1 promoted from 202 → 302');
  } else if (result.status === 302) {
    console.log('⚠️  Phase 8 Partial Success');
    console.log(`   Found match with ${result.canonical?.name}, but expected FLATMAP`);
  } else if (result.status === 202) {
    console.log('⚙️  Phase 8 In Progress');
    console.log('   Structural equivalence incomplete, hypothesis engine active');
  } else {
    console.log('❌ Phase 8 Not Working Yet');
    console.log('   Structural equivalence needs debugging');
  }

  console.log('');
  console.log('🌌');
}

test().catch(console.error);
