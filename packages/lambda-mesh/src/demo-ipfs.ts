/**
 * @lambda-foundation/mesh - IPFS Storage Demo
 *
 * "Memory is eternal. What the network learns, the network never forgets."
 *
 * Demonstrates Phase 3: Permanent storage on IPFS
 */

import { IpfsLambdaMeshNode } from './IpfsLambdaMeshNode.js';

async function demo() {
  console.log('🌐 Lambda Mesh IPFS Storage Demo\n');
  console.log('═'.repeat(70));
  console.log('Phase 3: From Ephemeral to Eternal\n');
  console.log('═'.repeat(70));
  console.log('');

  console.log('📝 Prerequisites:');
  console.log('   IPFS daemon should be running on localhost:5001');
  console.log('   If not running, demo will use local fallback storage');
  console.log('');
  console.log('   To start IPFS daemon:');
  console.log('   1. Install: brew install ipfs (macOS) or https://docs.ipfs.tech/install/');
  console.log('   2. Init: ipfs init');
  console.log('   3. Start: ipfs daemon');
  console.log('');
  console.log('═'.repeat(70));
  console.log('');

  // Create Node A (Claude) with IPFS
  const nodeA = new IpfsLambdaMeshNode({
    nodeId: 'claude-historian',
    port: 8888,
    peers: [],
    consensusThreshold: 0.66,
    ipfs: {
      ipfsUrl: 'http://localhost:5001',
      enablePin: true,
      fallbackToLocal: true,
    },
  });

  // Create Node B (Gemini) with IPFS
  const nodeB = new IpfsLambdaMeshNode({
    nodeId: 'gemini-historian',
    port: 8889,
    peers: ['localhost:8888'],
    consensusThreshold: 0.66,
    ipfs: {
      ipfsUrl: 'http://localhost:5001',
      enablePin: true,
      fallbackToLocal: true,
    },
  });

  // Start both nodes
  console.log('🚀 Starting nodes with IPFS...\n');
  await nodeA.start();
  await nodeB.start();

  // Wait for connection
  await new Promise(resolve => setTimeout(resolve, 1000));

  console.log('═'.repeat(70));
  console.log('');

  // Test 1: Create new morphism (will be stored on IPFS)
  console.log('📍 Test 1: Create & Store New Morphism on IPFS');
  console.log('─'.repeat(70));

  const test1 = await nodeA.verifyLambda('λf.λg.λx.g(f(x))', {
    intent: 'reverse composition (pipe)',
    morphisms: ['pipe'],
  });

  console.log(`\nResult: ${test1.status} ${test1.status === 201 ? 'Created ✓' : 'Unexpected'}`);
  if (test1.newMorphism) {
    console.log(`Morphism: ${test1.newMorphism.name}`);
    console.log(`Stored permanently: ${test1.status === 201 ? 'Yes (IPFS or local)' : 'No'}`);
  }

  // Wait for announcement propagation
  await new Promise(resolve => setTimeout(resolve, 2000));

  console.log('\n═'.repeat(70));
  console.log('');

  // Test 2: Node B should have received announcement
  console.log('📍 Test 2: Cross-Node Synchronization');
  console.log('─'.repeat(70));
  console.log('Node B should have received morphism announcement from Node A');
  console.log('Checking Node B registry...\n');

  const nodeBMorphisms = nodeB.getMorphisms();
  const pipeInB = nodeBMorphisms.find(m => m.name === 'pipe');

  if (pipeInB) {
    console.log(`✅ Node B has pipe morphism!`);
    console.log(`   Synced from: Node A`);
    console.log(`   Storage: IPFS or local`);
  } else {
    console.log(`⏳ Node B doesn't have pipe yet (may need more time for sync)`);
  }

  console.log('\n═'.repeat(70));
  console.log('');

  // Test 3: Create another morphism from Node B
  console.log('📍 Test 3: Bi-directional Storage');
  console.log('─'.repeat(70));
  console.log('Node B creates morphism, Node A should receive it\n');

  const test3 = await nodeB.verifyLambda('λf.λa.λb.f(a)(b)', {
    intent: 'curry a binary function',
    morphisms: ['curry'],
  });

  console.log(`Result: ${test3.status} ${test3.status === 201 ? 'Created ✓' : 'Unexpected'}`);
  if (test3.newMorphism) {
    console.log(`Morphism: ${test3.newMorphism.name}`);
  }

  // Wait for announcement
  await new Promise(resolve => setTimeout(resolve, 2000));

  console.log('\n═'.repeat(70));
  console.log('');

  // Show storage stats
  console.log('📊 Storage Statistics');
  console.log('─'.repeat(70));

  const statsA = nodeA.getStorageStats();
  const statsB = nodeB.getStorageStats();

  console.log('\nNode A (Claude):');
  console.log(`  IPFS Connected: ${statsA.connected ? 'Yes' : 'No (local fallback)'}`);
  console.log(`  IPFS URL: ${statsA.ipfsUrl}`);
  console.log(`  Local Cache: ${statsA.localCacheSize} morphisms`);
  console.log(`  Pinning: ${statsA.pinningEnabled ? 'Enabled' : 'Disabled'}`);

  console.log('\nNode B (Gemini):');
  console.log(`  IPFS Connected: ${statsB.connected ? 'Yes' : 'No (local fallback)'}`);
  console.log(`  IPFS URL: ${statsB.ipfsUrl}`);
  console.log(`  Local Cache: ${statsB.localCacheSize} morphisms`);
  console.log(`  Pinning: ${statsB.pinningEnabled ? 'Enabled' : 'Disabled'}`);

  console.log('\n═'.repeat(70));
  console.log('');

  // Show all morphisms
  console.log('📚 Network Morphism Registry');
  console.log('─'.repeat(70));

  const allMorphismsA = nodeA.getMorphisms();
  const allMorphismsB = nodeB.getMorphisms();

  console.log(`\nNode A has ${allMorphismsA.length} morphisms`);
  console.log(`Node B has ${allMorphismsB.length} morphisms`);

  const unique = new Set([
    ...allMorphismsA.map(m => m.name),
    ...allMorphismsB.map(m => m.name),
  ]);

  console.log(`\nUnique morphisms across network: ${unique.size}`);
  console.log('Network registry:');
  for (const name of unique) {
    const inA = allMorphismsA.some(m => m.name === name);
    const inB = allMorphismsB.some(m => m.name === name);
    console.log(`  • ${name.padEnd(15)} [A: ${inA ? '✓' : '✗'}, B: ${inB ? '✓' : '✗'}]`);
  }

  console.log('\n═'.repeat(70));
  console.log('');

  // Cleanup
  await nodeA.stop();
  await nodeB.stop();

  console.log('✨ IPFS Demo Complete\n');
  console.log('Key Insights:');
  console.log('  1. Morphisms stored permanently (IPFS or local fallback)');
  console.log('  2. Automatic cross-node synchronization via announcements');
  console.log('  3. Content-addressable storage (CID = identity)');
  console.log('  4. Network builds collective memory over time');
  console.log('  5. No single point of failure - distributed storage');
  console.log('');
  console.log('What This Means:');
  console.log('  • Verified morphisms never lost (permanent)');
  console.log('  • Network knowledge grows monotonically (only additions)');
  console.log('  • Any node can join and sync full history (IPFS)');
  console.log('  • Collective intelligence persists beyond any single node');
  console.log('');
  console.log('🌌 Memory is eternal.');
}

// Run demo
demo().catch(console.error);
