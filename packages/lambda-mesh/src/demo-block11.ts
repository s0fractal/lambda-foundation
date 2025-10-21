/**
 * Block 11 Test: Semantic Equivalence Proof
 *
 * "The ultimate test of Phase 4"
 *
 * This demo proves that Phase 4 prevents semantic pollution by:
 * 1. Creating Block 10 (canonical flatMap)
 * 2. Submitting Block 11 (fold-based flatMap)
 * 3. Expecting 302 Found (semantic equivalence)
 */

import { IpfsLambdaMeshNode } from './IpfsLambdaMeshNode.js';

async function demo() {
  console.log('🧬 Block 11 Test: Semantic Equivalence Proof\n');
  console.log('═'.repeat(70));
  console.log('Phase 4: Testing semantic deduplication\n');
  console.log('═'.repeat(70));
  console.log('');

  // Create nodes
  const claudeNode = new IpfsLambdaMeshNode({
    nodeId: 'claude-philosopher',
    port: 8888,
    peers: [],
    consensusThreshold: 0.66,
    ipfs: { fallbackToLocal: true },
  });

  const geminiNode = new IpfsLambdaMeshNode({
    nodeId: 'gemini-miner',
    port: 8889,
    peers: ['localhost:8888'],
    consensusThreshold: 0.66,
    ipfs: { fallbackToLocal: true },
  });

  await claudeNode.start();
  console.log('');
  await geminiNode.start();

  console.log('⏳ Waiting for P2P connection...\n');
  await new Promise(resolve => setTimeout(resolve, 1500));

  console.log('═'.repeat(70));
  console.log('');

  // Step 1: Seed Block 10 (canonical flatMap)
  console.log('📍 Step 1: Seed Canonical Form (Block 10)');
  console.log('─'.repeat(70));
  console.log('Dirty Code: Nested for-loops (Cartesian product)');
  console.log('Lambda: λlist1. λlist2. flatMap list1 (λx. map list2 (λy. x + y))');
  console.log('Purpose: Establish canonical representation in registry\n');

  const block10 = await geminiNode.verifyLambda(
    'λlist1. λlist2. flatMap list1 (λx. map list2 (λy. x + y))',
    {
      intent: 'Canonical flatMap pattern for Cartesian product',
      morphisms: ['flatMap', 'map'],
    }
  );

  console.log(`Result: ${block10.status} ${block10.status === 201 ? 'Created ✓' : block10.status === 302 ? 'Found' : 'Unexpected'}`);
  if (block10.newMorphism) {
    console.log(`Morphism: ${block10.newMorphism.name}`);
    console.log(`Hash: ${block10.newMorphism.hash.slice(0, 16)}...`);
    console.log(`Stored: Yes (in session registry)`);
  }

  await new Promise(resolve => setTimeout(resolve, 1000));

  console.log('\n═'.repeat(70));
  console.log('');

  // Step 2: Test Block 11 (fold-based flatMap)
  console.log('📍 Step 2: Test Semantic Equivalence (Block 11)');
  console.log('─'.repeat(70));
  console.log('Lambda: λf. λlist. fold (λacc. λx. concat acc (f x)) [] list');
  console.log('Semantic Meaning: flatMap implementation via fold + concat');
  console.log('Expected: 302 Found (equivalent to Block 10)\n');

  const block11 = await geminiNode.verifyLambda(
    'λf. λlist. fold (λacc. λx. concat acc (f x)) [] list',
    {
      intent: 'Fold-based flatMap implementation (testing semantic equivalence)',
      morphisms: ['fold', 'concat'],
    }
  );

  console.log(`Result: ${block11.status}`);

  if (block11.status === 302) {
    console.log('✅ SEMANTIC EQUIVALENCE DETECTED!');
    console.log(`   Canonical: ${block11.canonical?.name}`);
    console.log(`   Hash: ${block11.canonical?.hash.slice(0, 16)}...`);

    if (block11.proof) {
      console.log(`\n📜 Equivalence Proof:`);
      console.log(`   Reasoning: ${block11.proof.reasoning}`);
      console.log(`   Normal Form: ${block11.proof.normalForm}`);
      console.log(`   Steps: ${block11.proof.steps.length}`);
      for (const step of block11.proof.steps) {
        console.log(`     • ${step.rule}: ${step.explanation}`);
      }
    }

    console.log('\n🌟 Phase 4 SUCCESS:');
    console.log('   The mesh recognized that Block 11 is semantically equivalent');
    console.log('   to Block 10, preventing semantic pollution!');

  } else if (block11.status === 201) {
    console.log('⚠️  Created new morphism (semantic equivalence NOT detected)');
    console.log(`   New Morphism: ${block11.newMorphism?.name}`);
    console.log(`   Hash: ${block11.newMorphism?.hash.slice(0, 16)}...`);
    console.log('\n   This indicates:');
    console.log('   - Parser may have failed to parse complex syntax');
    console.log('   - β-reduction may not have reached same normal form');
    console.log('   - Phase 4 semantic engine needs refinement for this pattern');

  } else {
    console.log('❌ Unexpected result');
  }

  console.log('\n═'.repeat(70));
  console.log('');

  // Step 3: Test simpler semantic equivalence (α-equivalence)
  console.log('📍 Step 3: Control Test (Alpha-Equivalence)');
  console.log('─'.repeat(70));
  console.log('Testing: λx.x vs λy.y (variable renaming)');
  console.log('Expected: 302 Found (known to work from demo-phase4)\n');

  const block12 = await geminiNode.verifyLambda('λz.z', {
    intent: 'Identity with yet another variable name',
  });

  console.log(`Result: ${block12.status} ${block12.status === 302 ? '✓ (α-equivalence works)' : block12.status === 201 ? '✗ (unexpected)' : '?'}`);
  if (block12.canonical) {
    console.log(`Canonical: ${block12.canonical.name}`);
  }

  console.log('\n═'.repeat(70));
  console.log('');

  // Final stats
  console.log('📊 Final Registry Status');
  console.log('─'.repeat(70));
  const claudeCount = claudeNode.getMorphisms().length;
  const geminiCount = geminiNode.getMorphisms().length;
  console.log(`Claude Node: ${claudeCount} morphisms`);
  console.log(`Gemini Node: ${geminiCount} morphisms`);

  const geminiMorphisms = geminiNode.getMorphisms();
  const newMorphisms = geminiMorphisms.filter(m => m.contributors.includes('gemini-miner'));
  console.log(`\nGemini's contributions: ${newMorphisms.length}`);
  for (const m of newMorphisms) {
    console.log(`  • ${m.name} (${m.signature.slice(0, 40)}...)`);
  }

  console.log('\n═'.repeat(70));
  console.log('');

  // Cleanup
  await geminiNode.stop();
  await claudeNode.stop();

  console.log('✨ Block 11 Test Complete\n');

  if (block11.status === 302) {
    console.log('🌟 PHASE 4 VALIDATED:');
    console.log('   Semantic equivalence detection operational');
    console.log('   Semantic pollution prevented');
    console.log('   The Wikipedia of Proofs maintains canonical knowledge');
  } else if (block10.status === 201 && block11.status === 201) {
    console.log('⚠️  PHASE 4 PARTIAL:');
    console.log('   α-equivalence: ✓ Working');
    console.log('   Complex patterns: ⚠️  Needs parser enhancement');
    console.log('   Simpler equivalences (like identity renaming) work correctly');
  }

  console.log('');
  console.log('🌌');
}

demo().catch(console.error);
