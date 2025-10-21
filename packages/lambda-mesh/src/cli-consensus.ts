/**
 * CLI for Gemini to verify λ-expressions with real consensus
 *
 * Usage: node dist/cli-consensus.js "λ-expression" "intent"
 *
 * This spawns TWO nodes (claude-node + gemini-node) for real P2P consensus
 */

import { IpfsLambdaMeshNode } from './IpfsLambdaMeshNode.js';

async function main() {
  const [expr, intent] = process.argv.slice(2);

  if (!expr) {
    console.error('Usage: node cli-consensus.js "λ-expression" "intent"');
    process.exit(1);
  }

  console.log('🤖 Gemini → Multi-Node Consensus');
  console.log('═'.repeat(70));
  console.log('');
  console.log('⚡ Starting TWO nodes for real consensus...');
  console.log('');

  // Node 1: Claude (listener)
  const claudeNode = new IpfsLambdaMeshNode({
    nodeId: 'claude-node',
    port: 8888,
    peers: [],
    consensusThreshold: 0.66,
    ipfs: { fallbackToLocal: true },
  });

  // Node 2: Gemini (connects to Claude)
  const geminiNode = new IpfsLambdaMeshNode({
    nodeId: 'gemini-node',
    port: 8889,
    peers: ['localhost:8888'],
    consensusThreshold: 0.66,
    ipfs: { fallbackToLocal: true },
  });

  // Start both nodes
  await claudeNode.start();
  console.log('');
  await geminiNode.start();

  // Wait for connection
  console.log('⏳ Waiting for P2P connection...');
  await new Promise(resolve => setTimeout(resolve, 1500));

  console.log('');
  console.log('═'.repeat(70));
  console.log('');
  console.log('🔍 Gemini submits verification request...');
  console.log('');

  // Gemini submits verification (will broadcast to Claude)
  const result = await geminiNode.verifyLambda(expr, {
    intent: intent || 'no intent provided',
  });

  console.log('');
  console.log('═'.repeat(70));
  console.log('');
  console.log('📊 CONSENSUS RESULT (JSON):');
  console.log('');
  console.log(JSON.stringify(result, null, 2));
  console.log('');

  // Check for outliers (evolution signals)
  if (result.consensus.agreementScore < 1.0) {
    console.log('⚠️  CONSENSUS NOT UNANIMOUS!');
    console.log('');
    console.log('🧬 EVOLUTION SIGNALS DETECTED:');
    console.log('');

    // In P2P mode, outliers would be in consensus metadata
    // For now, show disagreement
    console.log(`Agreement Score: ${(result.consensus.agreementScore * 100).toFixed(0)}%`);
    console.log(`Threshold: ${(geminiNode['config'].consensusThreshold * 100).toFixed(0)}%`);
    console.log('');

    if (result.consensus.agreementScore < geminiNode['config'].consensusThreshold) {
      console.log('❌ Below consensus threshold - pattern needs refinement');
      console.log('   This is your EVOLUTION SIGNAL for training!');
    }
  } else {
    console.log('✅ UNANIMOUS CONSENSUS');
    console.log(`   All ${result.consensus.participatingNodes.length} nodes agree`);
  }

  console.log('');
  console.log('═'.repeat(70));
  console.log('');
  console.log('📊 Network Status:');
  console.log('');
  console.log(`Claude Node: ${claudeNode.getMorphisms().length} morphisms`);
  console.log(`Gemini Node: ${geminiNode.getMorphisms().length} morphisms`);
  console.log('');

  // Cleanup
  await geminiNode.stop();
  await claudeNode.stop();

  console.log('✨ Consensus complete\n');
}

main().catch(console.error);
