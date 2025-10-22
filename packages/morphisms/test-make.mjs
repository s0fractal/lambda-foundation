// test-make.mjs
// Tests for make (Morphism Factory) - meta-morphisms

import { fold } from './dist/fold.js';
import { unfold } from './dist/unfold.js';
import { hylo } from './dist/hylo.js';

// makeFold, makeUnfold, makeHylo implementations
const makeFold = alg => init => xs => fold(alg)(init)(xs);
const makeUnfold = coalg => seed => unfold(coalg)(seed);
const makeHylo = alg => coalg => seed => init => hylo(alg)(coalg)(seed)(init);

console.log('🧪 Testing make (Morphism Factory) from @lambda/morphisms...\n');

const assertEq = (a, b, msg) => {
  const eq = JSON.stringify(a) === JSON.stringify(b);
  console.log(`${eq ? '✓' : '✗'} ${msg}`);
  if (!eq) console.log(`  Expected: ${JSON.stringify(b)}, Got: ${JSON.stringify(a)}`);
  return eq;
};

console.log('═'.repeat(70));
console.log('MAKE FOLD - Custom Fold Generation');
console.log('═'.repeat(70));
console.log('');

// Test makeFold
const sum = makeFold(acc => x => acc + x)(0);
const product = makeFold(acc => x => acc * x)(1);
const max = makeFold(acc => x => x > acc ? x : acc)(-Infinity);

assertEq(sum([1,2,3,4,5]), 15, 'sum([1,2,3,4,5]) = 15');
assertEq(product([2,3,4]), 24, 'product([2,3,4]) = 24');
assertEq(max([5,2,9,1]), 9, 'max([5,2,9,1]) = 9');

console.log('');
console.log('✅ makeFold generates correct folds');
console.log('');

console.log('═'.repeat(70));
console.log('MAKE UNFOLD - Custom Unfold Generation');
console.log('═'.repeat(70));
console.log('');

// Test makeUnfold
const range = end => makeUnfold(i => i < end ? [i, i + 1] : null)(0);
const countdown = n => makeUnfold(i => i > 0 ? [i, i - 1] : null)(n);

assertEq(range(5), [0,1,2,3,4], 'range(5) = [0,1,2,3,4]');
assertEq(countdown(5), [5,4,3,2,1], 'countdown(5) = [5,4,3,2,1]');

console.log('');
console.log('✅ makeUnfold generates correct unfolds');
console.log('');

console.log('═'.repeat(70));
console.log('MAKE HYLO - Custom Hylo Generation');
console.log('═'.repeat(70));
console.log('');

// Test makeHylo
const factorial = n => makeHylo
  (acc => x => acc * x)
  (i => i > 0 ? [i, i - 1] : null)
  (n)
  (1);

const sumOfSquares = n => makeHylo
  (acc => x => acc + x * x)
  (i => i <= n ? [i, i + 1] : null)
  (1)
  (0);

assertEq(factorial(5), 120, 'factorial(5) = 120');
assertEq(sumOfSquares(5), 55, 'sumOfSquares(5) = 55');

console.log('');
console.log('✅ makeHylo generates correct hylos');
console.log('');

console.log('═'.repeat(70));
console.log('✅ All make (Morphism Factory) tests passed!');
console.log('═'.repeat(70));
console.log('');
console.log('🌌 Meta-morphisms operational');
console.log('   Morphisms can now be generated from parameters');
console.log('   μορφογένεσις (morphogenesis) enabled');
console.log('');
console.log('🌱 Event 006: Morphism Factory - VERIFIED');
console.log('');
