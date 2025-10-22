/**
 * CLI for Gemini to verify λ-expressions
 *
 * Usage: node dist/cli-verify.js "λx.x" "identity function"
 */

import { IpfsLambdaMeshNode } from './IpfsLambdaMeshNode.js';

async function main() {
  const [expr, intent] = process.argv.slice(2);

  if (!expr) {
    console.error('Usage: node cli-verify.js "λ-expression" "intent"');
    process.exit(1);
  }

  console.log('🤖 Gemini → Lambda Mesh Verification');
  console.log('═'.repeat(60));
  console.log('');

  // Create single node (Gemini as solo verifier)
  const node = new IpfsLambdaMeshNode({
    nodeId: 'gemini-miner',
    port: 8889,
    peers: [],
    consensusThreshold: 0.66,
    ipfs: {
      fallbackToLocal: true,
    },
  });

  await node.start();

  console.log('═'.repeat(60));
  console.log('');

  // Verify the expression
  const result = await node.verifyLambda(expr, {
    intent: intent || 'no intent provided',
  });

  console.log('═'.repeat(60));
  console.log('');
  console.log('📊 RESPONSE (JSON):');
  console.log('');
  console.log(JSON.stringify(result, null, 2));
  console.log('');
  console.log('═'.repeat(60));

  await node.stop();
}

main().catch(console.error);
