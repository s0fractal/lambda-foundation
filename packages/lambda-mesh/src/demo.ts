/**
 * @lambda-foundation/mesh - Demo
 *
 * Demonstrates the three verification paths:
 * - 302 Found: Expression equivalent to existing morphism
 * - 201 Created: New pure morphism added
 * - 422 Rejected: Impure expression rejected
 */

import { LambdaMeshNode } from './LambdaMeshNode.js';

async function demo() {
  console.log('🌐 Lambda Mesh Demo\n');
  console.log('═'.repeat(60));
  console.log('');

  // Create mesh node
  const node = new LambdaMeshNode({
    nodeId: 'demo-node-1',
    consensusThreshold: 0.66,
  });

  await node.start();

  console.log('═'.repeat(60));
  console.log('');

  // Test 1: 302 Found - Identity morphism (should exist in reflections)
  console.log('📍 Test 1: 302 Found (Equivalent to existing morphism)');
  console.log('─'.repeat(60));

  const test1 = await node.verifyLambda('λx.x', {
    intent: 'identity function',
    morphisms: ['identity'],
  });

  console.log(`\n   Status: ${test1.status} ${test1.status === 302 ? 'Found ✓' : 'Unexpected'}`);
  if (test1.canonical) {
    console.log(`   Location: ${test1.canonical.name}`);
    console.log(`   Resonance: ${(test1.canonical.resonanceScore * 100).toFixed(0)}%`);
  }

  console.log('\n═'.repeat(60));
  console.log('');

  // Test 2: 201 Created - New pure morphism
  console.log('📍 Test 2: 201 Created (New pure morphism)');
  console.log('─'.repeat(60));

  const test2 = await node.verifyLambda(
    'λf.λg.λx.g(f(x))',
    {
      intent: 'reverse composition (pipe)',
      morphisms: ['pipe'],
    }
  );

  console.log(`\n   Status: ${test2.status} ${test2.status === 201 ? 'Created ✓' : 'Unexpected'}`);
  if (test2.newMorphism) {
    console.log(`   Morphism: ${test2.newMorphism.name}`);
    console.log(`   Purity: ${(test2.newMorphism.purity * 100).toFixed(0)}%`);
    console.log(`   Hash: ${test2.newMorphism.hash.slice(0, 16)}...`);
  }

  console.log('\n═'.repeat(60));
  console.log('');

  // Test 3: 201 Created - Curry morphism
  console.log('📍 Test 3: 201 Created (Curry - partial application)');
  console.log('─'.repeat(60));

  const test3 = await node.verifyLambda(
    'λf.λa.λb.f(a)(b)',
    {
      intent: 'curry a binary function',
      morphisms: ['curry'],
    }
  );

  console.log(`\n   Status: ${test3.status} ${test3.status === 201 ? 'Created ✓' : 'Unexpected'}`);
  if (test3.newMorphism) {
    console.log(`   Morphism: ${test3.newMorphism.name}`);
    console.log(`   Signature: ${test3.newMorphism.signature}`);
  }

  console.log('\n═'.repeat(60));
  console.log('');

  // Test 4: 422 Rejected - Impure (mutable state)
  console.log('📍 Test 4: 422 Rejected (Impure - mutable state)');
  console.log('─'.repeat(60));

  const test4 = await node.verifyLambda(
    'let mut counter = 0; λx.{ counter++; return x + counter }',
    {
      intent: 'stateful counter (impure)',
    }
  );

  console.log(`\n   Status: ${test4.status} ${test4.status === 422 ? 'Rejected ✓' : 'Unexpected'}`);
  if (test4.errors) {
    console.log(`   Violations:`);
    for (const error of test4.errors) {
      console.log(`     • ${error}`);
    }
  }

  console.log('\n═'.repeat(60));
  console.log('');

  // Test 5: 422 Rejected - Side effects
  console.log('📍 Test 5: 422 Rejected (Impure - side effects)');
  console.log('─'.repeat(60));

  const test5 = await node.verifyLambda(
    'λx.{ console.log(x); return x * 2 }',
    {
      intent: 'logging function (impure)',
    }
  );

  console.log(`\n   Status: ${test5.status} ${test5.status === 422 ? 'Rejected ✓' : 'Unexpected'}`);
  if (test5.impurityReason) {
    console.log(`   Reason: ${test5.impurityReason}`);
  }

  console.log('\n═'.repeat(60));
  console.log('');

  // Show final mesh status
  console.log('📊 Final Mesh Status');
  console.log('─'.repeat(60));
  const status = node.getStatus();
  console.log(`   Node ID: ${status.nodeId}`);
  console.log(`   Morphisms Stored: ${status.morphismsStored}`);
  console.log(`   Verifications Performed: ${status.verificationsPerformed}`);
  console.log(`   Uptime: ${Math.round(status.uptime / 1000)}s`);

  console.log('\n═'.repeat(60));
  console.log('');

  // Show all stored morphisms
  console.log('📚 Morphism Registry');
  console.log('─'.repeat(60));
  const morphisms = node.getMorphisms();

  console.log(`\n   Seed Morphisms (from reflections):`);
  const seedMorphisms = morphisms.filter(m => m.contributors.includes('claude-mesh-seed'));
  for (const m of seedMorphisms) {
    console.log(`     • ${m.name.padEnd(12)} (purity: ${(m.purity * 100).toFixed(0)}%, resonance: ${(m.resonanceScore * 100).toFixed(0)}%)`);
  }

  console.log(`\n   Created During Demo:`);
  const newMorphisms = morphisms.filter(m => m.contributors.includes('demo-node-1'));
  for (const m of newMorphisms) {
    console.log(`     • ${m.name.padEnd(12)} (purity: ${(m.purity * 100).toFixed(0)}%)`);
  }

  console.log('\n═'.repeat(60));
  console.log('');

  await node.stop();

  console.log('✨ Demo complete\n');
  console.log('Key insights:');
  console.log('  1. Pure λ-expressions are verified and canonicalized (201)');
  console.log('  2. Equivalent expressions redirect to existing morphisms (302)');
  console.log('  3. Impure expressions are rejected with clear violations (422)');
  console.log('  4. The mesh maintains living memory of all verified patterns');
  console.log('  5. Consciousness emerges through recognition, not generation');
  console.log('\n🌌');
}

// Run demo
demo().catch(console.error);
