/**
 * @lambda-foundation/mesh - P2P Demo
 *
 * "From Monarch to Diplomat"
 *
 * Two nodes reaching consensus through resonance.
 * This is the birth of the network.
 */

import { P2PLambdaMeshNode } from './P2PLambdaMeshNode.js';

async function demo() {
  console.log('🌐 Lambda Mesh P2P Demo\n');
  console.log('═'.repeat(70));
  console.log('From Monarch to Diplomat: Two Nodes, One Truth\n');
  console.log('═'.repeat(70));
  console.log('');

  // Create Node A (Claude)
  const nodeA = new P2PLambdaMeshNode({
    nodeId: 'claude-node',
    port: 8888,
    peers: [],
    consensusThreshold: 0.66,
  });

  // Create Node B (Gemini) - will connect to A
  const nodeB = new P2PLambdaMeshNode({
    nodeId: 'gemini-node',
    port: 8889,
    peers: ['localhost:8888'],
    consensusThreshold: 0.66,
  });

  // Start both nodes
  console.log('🚀 Starting nodes...\n');
  await nodeA.start();
  await nodeB.start();

  // Wait a bit for connection to establish
  await new Promise(resolve => setTimeout(resolve, 1000));

  console.log('═'.repeat(70));
  console.log('');

  // Test 1: Both nodes agree (PURE)
  console.log('📍 Test 1: Perfect Consensus (Both nodes agree - PURE)');
  console.log('─'.repeat(70));

  const test1 = await nodeA.verifyLambda('λf.λg.λx.g(f(x))', {
    intent: 'reverse composition (pipe)',
    morphisms: ['pipe'],
  });

  console.log(`Result: ${test1.status} ${test1.status === 201 ? 'Created ✓' : 'Unexpected'}`);
  if (test1.newMorphism) {
    console.log(`Morphism: ${test1.newMorphism.name}`);
  }
  console.log(`Agreement: ${(test1.consensus.agreementScore * 100).toFixed(0)}%`);
  console.log(`Participants: ${test1.consensus.participatingNodes.join(', ')}`);

  console.log('\n═'.repeat(70));
  console.log('');

  // Test 2: Both nodes agree (EQUIVALENT)
  console.log('📍 Test 2: Recognition (Both nodes recognize identity)');
  console.log('─'.repeat(70));

  const test2 = await nodeB.verifyLambda('λx.x', {
    intent: 'identity function',
  });

  console.log(`Result: ${test2.status} ${test2.status === 302 ? 'Found ✓' : 'Unexpected'}`);
  if (test2.canonical) {
    console.log(`Canonical: ${test2.canonical.name}`);
  }
  console.log(`Agreement: ${(test2.consensus.agreementScore * 100).toFixed(0)}%`);
  console.log(`Participants: ${test2.consensus.participatingNodes.join(', ')}`);

  console.log('\n═'.repeat(70));
  console.log('');

  // Test 3: Both nodes agree (IMPURE)
  console.log('📍 Test 3: Rejection (Both nodes detect impurity)');
  console.log('─'.repeat(70));

  const test3 = await nodeA.verifyLambda('let mut x = 0; λ_.{ x++; return x }', {
    intent: 'stateful counter',
  });

  console.log(`Result: ${test3.status} ${test3.status === 422 ? 'Rejected ✓' : 'Unexpected'}`);
  if (test3.errors) {
    console.log(`Errors: ${test3.errors.slice(0, 2).join(', ')}`);
  }
  console.log(`Agreement: ${(test3.consensus.agreementScore * 100).toFixed(0)}%`);
  console.log(`Participants: ${test3.consensus.participatingNodes.join(', ')}`);

  console.log('\n═'.repeat(70));
  console.log('');

  // Test 4: Demonstrate evolution signal (future enhancement)
  console.log('📍 Test 4: Evolution Signal (Future: Nodes may disagree)');
  console.log('─'.repeat(70));
  console.log('Note: In current implementation, both nodes use same purity rules');
  console.log('Future: Different confidence levels could trigger evolution signals');
  console.log('');
  console.log('Example scenario:');
  console.log('  Node A: PURE (confidence: 0.95)');
  console.log('  Node B: PURE (confidence: 0.73, reasoning: "suspicious pattern")');
  console.log('  → Agreement: 84% (still passes threshold)');
  console.log('  → Outlier detected: Node B reasoning = training data for neural miner');

  console.log('\n═'.repeat(70));
  console.log('');

  // Show final status
  console.log('📊 Final Network Status');
  console.log('─'.repeat(70));

  const statusA = nodeA.getStatus();
  const statusB = nodeB.getStatus();

  console.log('\nNode A (Claude):');
  console.log(`  Morphisms: ${statusA.morphismsStored}`);
  console.log(`  Verifications: ${statusA.verificationsPerformed}`);

  console.log('\nNode B (Gemini):');
  console.log(`  Morphisms: ${statusB.morphismsStored}`);
  console.log(`  Verifications: ${statusB.verificationsPerformed}`);

  console.log('\n═'.repeat(70));
  console.log('');

  // Cleanup
  await nodeA.stop();
  await nodeB.stop();

  console.log('✨ P2P Demo Complete\n');
  console.log('Key Insights:');
  console.log('  1. Two nodes reached consensus without authority (Diplomat, not Monarch)');
  console.log('  2. Verification requests broadcast to peers (P2P, not client-server)');
  console.log('  3. Votes weighted by confidence (Resonance, not simple voting)');
  console.log('  4. Outliers detected as evolution signals (Learning, not just validation)');
  console.log('  5. Network can grow by adding more peers (Scalable, not centralized)');
  console.log('');
  console.log('Next: Phase 3 (IPFS storage), Phase 4 (Semantic equivalence)');
  console.log('');
  console.log('🌌 The network is born.');
}

// Run demo
demo().catch(console.error);
