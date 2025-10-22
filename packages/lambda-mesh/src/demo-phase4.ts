/**
 * @lambda-foundation/mesh - Phase 4 Demo
 *
 * "From Syntactic Checking to Semantic Understanding"
 *
 * Demonstrates:
 * 1. Create a morphism (201 Created)
 * 2. Submit semantically equivalent expression (302 Found with proof)
 */

import { IpfsLambdaMeshNode } from './IpfsLambdaMeshNode.js';

async function demo() {
  console.log('🧠 Lambda Mesh Phase 4: Semantic Equivalence\n');
  console.log('═'.repeat(70));
  console.log('Phase 4: The Philosopher - Semantic Understanding\n');
  console.log('═'.repeat(70));
  console.log('');

  // Create two nodes for consensus
  const claudeNode = new IpfsLambdaMeshNode({
    nodeId: 'claude-philosopher',
    port: 8888,
    peers: [],
    consensusThreshold: 0.66,
    ipfs: { fallbackToLocal: true },
  });

  const geminiNode = new IpfsLambdaMeshNode({
    nodeId: 'gemini-philosopher',
    port: 8889,
    peers: ['localhost:8888'],
    consensusThreshold: 0.66,
    ipfs: { fallbackToLocal: true },
  });

  // Start nodes
  await claudeNode.start();
  console.log('');
  await geminiNode.start();

  // Wait for connection
  console.log('⏳ Waiting for P2P connection...\n');
  await new Promise(resolve => setTimeout(resolve, 1500));

  console.log('═'.repeat(70));
  console.log('');

  // Test 1: Create original morphism (identity function)
  console.log('📍 Test 1: Create Original Morphism');
  console.log('─'.repeat(70));
  console.log('Expression: λx.x (identity function)\n');

  const test1 = await geminiNode.verifyLambda('λx.x', {
    intent: 'identity function',
  });

  console.log(`Result: ${test1.status} ${test1.status === 201 ? 'Created ✓' : test1.status === 302 ? 'Found (already exists)' : 'Unexpected'}`);
  if (test1.newMorphism || test1.canonical) {
    const morphism = test1.newMorphism || test1.canonical;
    console.log(`Morphism: ${morphism?.name}`);
    console.log(`Hash: ${morphism?.hash.slice(0, 16)}...`);
  }

  await new Promise(resolve => setTimeout(resolve, 1000));

  console.log('\n═'.repeat(70));
  console.log('');

  // Test 2: Submit SYNTACTICALLY IDENTICAL expression (should be 302 - syntactic match)
  console.log('📍 Test 2: Syntactic Equivalence (Same Expression)');
  console.log('─'.repeat(70));
  console.log('Expression: λx.x (exact same)\n');

  const test2 = await geminiNode.verifyLambda('λx.x', {
    intent: 'identity function again',
  });

  console.log(`Result: ${test2.status} ${test2.status === 302 ? 'Found ✓ (syntactic match)' : 'Unexpected'}`);
  if (test2.canonical) {
    console.log(`Canonical: ${test2.canonical.name}`);
  }

  await new Promise(resolve => setTimeout(resolve, 1000));

  console.log('\n═'.repeat(70));
  console.log('');

  // Test 3: Submit SEMANTICALLY EQUIVALENT expression (should be 302 - semantic match with proof)
  console.log('📍 Test 3: Semantic Equivalence (Different Syntax, Same Meaning)');
  console.log('─'.repeat(70));
  console.log('Original: λx.x');
  console.log('Semantically Equivalent: λy.y (same function, different variable name)\n');

  const test3 = await geminiNode.verifyLambda('λy.y', {
    intent: 'identity with different variable name',
  });

  console.log(`Result: ${test3.status} ${test3.status === 302 ? 'Found ✓ (semantic equivalence!)' : test3.status === 201 ? 'Created (semantic engine needs tuning)' : 'Unexpected'}`);
  if (test3.canonical) {
    console.log(`Canonical: ${test3.canonical.name}`);
    if (test3.proof) {
      console.log(`\n📜 Equivalence Proof:`);
      console.log(`   Reasoning: ${test3.proof.reasoning}`);
      console.log(`   Normal Form: ${test3.proof.normalForm}`);
      console.log(`   Steps: ${test3.proof.steps.length}`);
      for (const step of test3.proof.steps) {
        console.log(`     • ${step.rule}: ${step.explanation}`);
      }
    }
  } else if (test3.newMorphism) {
    console.log(`⚠️  Created new morphism (Phase 4 semantic engine detected no equivalence)`);
    console.log(`   This indicates the semantic equivalence engine needs refinement`);
    console.log(`   for α-equivalence (variable renaming)`);
  }

  await new Promise(resolve => setTimeout(resolve, 1000));

  console.log('\n═'.repeat(70));
  console.log('');

  // Test 4: More complex semantic equivalence (double application = compose identity with identity)
  console.log('📍 Test 4: Complex Semantic Equivalence');
  console.log('─'.repeat(70));
  console.log('Testing: λx.((λy.y) x) ≡ λx.x');
  console.log('(applying identity to x is still identity)\n');

  const test4 = await geminiNode.verifyLambda('λx.((λy.y) x)', {
    intent: 'identity via application',
  });

  console.log(`Result: ${test4.status}`);
  if (test4.status === 302 && test4.proof) {
    console.log(`✓ Semantic equivalence detected!`);
    console.log(`  Reasoning: ${test4.proof.reasoning}`);
  } else if (test4.status === 201) {
    console.log(`⚠️  Created new morphism`);
    console.log(`   Phase 4 semantic engine needs β-reduction tuning`);
  }

  console.log('\n═'.repeat(70));
  console.log('');

  // Show final stats
  console.log('📊 Final Status');
  console.log('─'.repeat(70));
  const claudeCount = claudeNode.getMorphisms().length;
  const geminiCount = geminiNode.getMorphisms().length;
  console.log(`Claude Node: ${claudeCount} morphisms`);
  console.log(`Gemini Node: ${geminiCount} morphisms`);

  console.log('\n═'.repeat(70));
  console.log('');

  // Cleanup
  await geminiNode.stop();
  await claudeNode.stop();

  console.log('✨ Phase 4 Demo Complete\n');
  console.log('Key Insights:');
  console.log('  1. Phase 4 adds semantic equivalence detection');
  console.log('  2. Syntactic equivalence: exact string match (fast)');
  console.log('  3. Semantic equivalence: β-reduction to normal form (thorough)');
  console.log('  4. Proofs are generated and included in 302 responses');
  console.log('  5. Prevents semantic pollution (duplicate morphisms)');
  console.log('');
  console.log('Phase 4 Status:');
  if (test3.status === 302) {
    console.log('  ✅ Semantic equivalence engine operational');
  } else {
    console.log('  ⚠️  Semantic engine needs α-equivalence refinement');
    console.log('     (variable renaming detection)');
  }
  console.log('');
  console.log('🌌');
}

demo().catch(console.error);
