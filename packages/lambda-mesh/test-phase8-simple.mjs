/**
 * Test Phase 8 - Simple Structural Equivalence
 *
 * Test that Phase 8 can handle recursive expressions with α-equivalence.
 */

import { LambdaMeshNode } from './dist/LambdaMeshNode.js';

async function test() {
  console.log('🧪 Phase 8 Simple Test - Structural Equivalence\n');
  console.log('═'.repeat(70));
  console.log('');

  const node = new LambdaMeshNode({
    nodeId: 'test-node',
    consensusThreshold: 0.66,
  });

  await node.start();
  console.log('');

  // Test 1: Exact match with variable renaming (α-equivalence)
  console.log('📍 Test 1: α-Equivalent FLATMAP');
  console.log('─'.repeat(70));
  console.log('Expression: λg. λxs. FOLD CONCAT NIL (MAP g xs)');
  console.log('Expected: 302 Found → FLATMAP (different variables, same structure)');
  console.log('');

  const result1 = await node.verifyLambda(
    'λg. λxs. FOLD CONCAT NIL (MAP g xs)',
    { intent: 'flatMap with different variable names' }
  );

  console.log('');
  console.log(`Result: ${result1.status} ${
    result1.status === 302 ? 'Found ✓' :
    result1.status === 201 ? 'Created' :
    'Unexpected'
  }`);

  if (result1.status === 302) {
    console.log(`Canonical: ${result1.canonical.name}`);
    console.log(`α-Equivalence: ${result1.canonical.name === 'FLATMAP' ? '✅ SUCCESS!' : '⚠️  Wrong match'}`);
  }

  console.log('');
  console.log('═'.repeat(70));
  console.log('');

  // Test 2: Non-recursive expression (should still use β-reduction)
  console.log('📍 Test 2: Non-Recursive ADD ONE');
  console.log('─'.repeat(70));
  console.log('Expression: λn. ADD (λf.λx. f x) n');
  console.log('Expected: 302 Found → SUCC (via β-reduction, not structural)');
  console.log('');

  const result2 = await node.verifyLambda(
    'λn. ADD (λf.λx. f x) n',
    { intent: 'non-recursive test' }
  );

  console.log('');
  console.log(`Result: ${result2.status} ${
    result2.status === 302 ? 'Found ✓' :
    result2.status === 201 ? 'Created' :
    'Unexpected'
  }`);

  if (result2.status === 302) {
    console.log(`Canonical: ${result2.canonical.name}`);
    console.log(`β-Reduction: ${result2.canonical.name === 'SUCC' ? '✅ SUCCESS!' : '⚠️  Wrong match'}`);
  }

  console.log('');
  console.log('═'.repeat(70));
  console.log('');

  // Test 3: Block 32 - Different structure (should NOT match)
  console.log('📍 Test 3: Block 32 - Different Structure');
  console.log('─'.repeat(70));
  console.log('Expression: λf. λlist. FOLD (λh. λacc. (CONCAT (f h) acc)) NIL list');
  console.log('Expected: 201 Created OR 202 Hypothetical');
  console.log('(Structure is different from FLATMAP, needs deeper equivalence)');
  console.log('');

  const result3 = await node.verifyLambda(
    'λf. λlist. FOLD (λh. λacc. (CONCAT (f h) acc)) NIL list',
    { intent: 'alternative flatMap (different structure)' }
  );

  console.log('');
  console.log(`Result: ${result3.status} ${
    result3.status === 302 ? 'Found (unexpected!)' :
    result3.status === 201 ? 'Created ✓' :
    result3.status === 202 ? 'Hypothetical ✓' :
    'Unexpected'
  }`);

  if (result3.status === 202 && result3.hypothesis) {
    console.log(`Hypothesis: ${result3.hypothesis.potentialCanonical}`);
    console.log(`Confidence: ${(result3.hypothesis.confidence * 100).toFixed(0)}%`);
  }

  console.log('');
  console.log('═'.repeat(70));
  console.log('');

  await node.stop();

  // Summary
  console.log('Phase 8 Summary:');
  console.log('');
  console.log(`Test 1 (α-equivalence): ${result1.status === 302 && result1.canonical?.name === 'FLATMAP' ? '✅' : '❌'}`);
  console.log(`Test 2 (β-reduction):   ${result2.status === 302 && result2.canonical?.name === 'SUCC' ? '✅' : '❌'}`);
  console.log(`Test 3 (hypothesis):    ${result3.status === 202 || result3.status === 201 ? '✅' : '❌'}`);
  console.log('');

  if (
    result1.status === 302 && result1.canonical?.name === 'FLATMAP' &&
    result2.status === 302 && result2.canonical?.name === 'SUCC'
  ) {
    console.log('✅ Phase 8 Working!');
    console.log('   - Structural equivalence for recursive expressions ✓');
    console.log('   - β-reduction for non-recursive expressions ✓');
    console.log('   - Intelligent routing based on recursion detection ✓');
  } else {
    console.log('⚙️  Phase 8 Partial Success');
    console.log('   Some tests passed, but full Phase 8 needs refinement');
  }

  console.log('');
  console.log('Note: Block 32 (H1) requires deeper equivalence (Phase 9)');
  console.log('      Current Phase 8 handles α-equivalence, not structural transformation');
  console.log('');
  console.log('🌌');
}

test().catch(console.error);
