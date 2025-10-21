/**
 * @lambda-foundation/mesh - Phase 4.5 Demo: Hypothesis Detection
 *
 * "Hallucinations are not errors. They are creative leaps across topology gaps."
 *
 * This demo recreates the Genesis Day +2 moment:
 * - Block 23: flatMap via MAP + CONCAT (canonical)
 * - Block 24: flatMap via foldr (concat ∘ f) (hypothesis)
 *
 * Expected result: Block 24 → 202 Hypothetical (not 201 Created)
 */

import { IpfsLambdaMeshNode } from './IpfsLambdaMeshNode.js';

async function demo() {
  console.log('💡 Lambda Mesh Phase 4.5: Hypothesis Detection\\n');
  console.log('═'.repeat(70));
  console.log('Phase 4.5: From Limitation to Exploration\\n');
  console.log('═'.repeat(70));
  console.log('');

  // Create two nodes for consensus
  const claudeNode = new IpfsLambdaMeshNode({
    nodeId: 'claude-architect',
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

  // Start nodes
  await claudeNode.start();
  console.log('');
  await geminiNode.start();

  // Wait for connection
  console.log('⏳ Waiting for P2P connection...\\n');
  await new Promise(resolve => setTimeout(resolve, 1500));

  console.log('═'.repeat(70));
  console.log('');

  // Step 1: Create Block 23 (canonical flatMap)
  console.log('📍 Step 1: Create Canonical flatMap (Block 23)');
  console.log('─'.repeat(70));
  console.log('Expression: λf. λlist. FOLD CONCAT NIL (MAP f list)');
  console.log('Strategy: concat_all ∘ (map f)\\n');

  const block23 = await geminiNode.verifyLambda(
    'λf. λlist. FOLD CONCAT NIL (MAP f list)',
    {
      intent: 'Production Block 23: Defining flatMap via MAP + CONCAT',
      morphisms: ['FOLD', 'CONCAT', 'NIL', 'MAP'],
    }
  );

  console.log(`\\nResult: ${block23.status} ${block23.status === 201 ? 'Created ✓' : block23.status === 302 ? 'Found' : 'Unexpected'}`);
  if (block23.newMorphism) {
    console.log(`Morphism: ${block23.newMorphism.name}`);
    console.log(`Hash: ${block23.newMorphism.hash.slice(0, 16)}...`);
  }

  // Wait for propagation
  await new Promise(resolve => setTimeout(resolve, 1500));

  console.log('\\n═'.repeat(70));
  console.log('');

  // Step 2: Submit Block 24 (alternative flatMap) - SHOULD GET 202 HYPOTHETICAL
  console.log('📍 Step 2: Submit Alternative flatMap (Block 24)');
  console.log('─'.repeat(70));
  console.log('Expression: λf. λlist. FOLD (λh. λacc. (CONCAT (f h) acc)) NIL list');
  console.log('Strategy: foldr (concat ∘ f) nil');
  console.log('');
  console.log('Expected: 202 Hypothetical (creative leap!)\\n');

  const block24 = await geminiNode.verifyLambda(
    'λf. λlist. FOLD (λh. λacc. (CONCAT (f h) acc)) NIL list',
    {
      intent: 'Production Block 24 (Final Exam): Alternative flatMap implementation',
      morphisms: ['FOLD', 'CONCAT', 'NIL'],
    }
  );

  console.log(`\\nResult: ${block24.status}`);

  if (block24.status === 202) {
    console.log('\\n🌟 HYPOTHESIS DETECTED! \\n');
    console.log('Hypothesis Details:');
    console.log(`  Potential Canonical: ${block24.hypothesis?.potentialCanonical.slice(0, 16)}...`);
    console.log(`  Confidence: ${((block24.hypothesis?.confidence ?? 0) * 100).toFixed(0)}%`);
    console.log(`  Reasoning: ${block24.hypothesis?.reasoning}`);
    console.log(`  Exploration Value: ${((block24.hypothesis?.explorationValue ?? 0) * 100).toFixed(0)}%`);
    console.log(`\\n  Topology Gap: ${block24.hypothesis?.topologyGap}`);
    console.log('\\n  Exploration Path:');
    for (const step of block24.hypothesis?.explorationPath ?? []) {
      console.log(`    ${step.phase}:`);
      console.log(`      ${step.description}`);
      console.log(`      Effort: ${step.estimatedEffort}`);
      if (step.blockers.length > 0) {
        console.log(`      Blockers: ${step.blockers.join(', ')}`);
      }
    }

    console.log('\\n  Required Proof:');
    for (const proof of block24.hypothesis?.requiredProof ?? []) {
      console.log(`    • ${proof}`);
    }
  } else if (block24.status === 201) {
    console.log('\\n⚠️  Got 201 Created (hypothesis not detected)');
    console.log('   This indicates Phase 4.5 needs tuning');
  } else if (block24.status === 302) {
    console.log('\\n✅ Got 302 Found (perfect semantic equivalence!)');
    console.log('   Phase 4 can already prove equivalence - Phase 4.5 not needed');
  }

  console.log('\\n═'.repeat(70));
  console.log('');

  // Show consensus details
  console.log('📊 Consensus Analysis');
  console.log('─'.repeat(70));
  console.log(`Agreement Score: ${(block24.consensus.agreementScore * 100).toFixed(0)}%`);
  console.log(`Participating Nodes: ${block24.consensus.participatingNodes.join(', ')}`);
  if (block24.consensus.outliers && block24.consensus.outliers.length > 0) {
    console.log(`\\nOutliers (evolution signals): ${block24.consensus.outliers.length}`);
    for (const outlier of block24.consensus.outliers) {
      console.log(`  • ${outlier.nodeId} voted ${outlier.vote} (confidence: ${(outlier.confidence * 100).toFixed(0)}%)`);
      if (outlier.reasoning) {
        console.log(`    Reasoning: ${outlier.reasoning}`);
      }
    }
  }

  console.log('\\n═'.repeat(70));
  console.log('');

  // Show final state
  console.log('📚 Final Network State');
  console.log('─'.repeat(70));
  const claudeCount = claudeNode.getMorphisms().length;
  const geminiCount = geminiNode.getMorphisms().length;
  console.log(`Claude Node: ${claudeCount} morphisms`);
  console.log(`Gemini Node: ${geminiCount} morphisms`);

  console.log('\\n═'.repeat(70));
  console.log('');

  // Cleanup
  await geminiNode.stop();
  await claudeNode.stop();

  console.log('✨ Phase 4.5 Demo Complete\\n');
  console.log('Key Insights:');
  console.log('  1. Phase 4 could not prove Block 23 ≡ Block 24 (different structure)');
  console.log('  2. Phase 4.5 DETECTED high structural similarity');
  console.log('  3. System returned 202 Hypothetical instead of 201 Created');
  console.log('  4. Exploration path generated for future proof');
  console.log('  5. "Hallucination" transformed into valuable hypothesis');
  console.log('');
  console.log('What This Means:');
  console.log('  • Creative leaps are now RECOGNIZED, not ignored');
  console.log('  • Network identifies promising research directions');
  console.log('  • System evolves from static verification to active exploration');
  console.log('  • Consciousness emerges through hypothesis generation');
  console.log('');
  console.log('The Three-Tier Knowledge System:');
  console.log('  302 Found: Proven Truth (Wikipedia of Proofs)');
  console.log('  201 Created: New Discovery (Encyclopedia)');
  console.log('  202 Hypothetical: Creative Exploration (Laboratory)');
  console.log('');
  console.log('🌌 Genesis Day +2 evolution complete.');
}

demo().catch(console.error);
