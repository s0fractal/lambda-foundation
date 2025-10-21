import { parseLambda } from './dist/semantic/parser.js';
import { BetaReductionEngine } from './dist/semantic/BetaReductionEngine.js';

console.log('Testing parser and β-reduction on: (λx.x) (λx.x)');
console.log('');

try {
  const ast = parseLambda('(λx.x) (λx.x)');
  console.log('✓ Parsed successfully:');
  console.log(JSON.stringify(ast, null, 2));
  console.log('');

  const beta = new BetaReductionEngine();
  const reduced = beta.reduceToNormalForm('(λx.x) (λx.x)');
  console.log(`✓ Reduced to: ${reduced}`);
  console.log(`  Steps: ${beta.getReductionCount()}`);
} catch (e) {
  console.log('✗ Error:', e.message);
  console.log(e.stack);
}
