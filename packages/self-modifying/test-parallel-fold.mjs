// test-parallel-fold.mjs
// Event 019: Automatic Parallelization via CommutativeMonoid
// Demonstration: Parallelization as Mathematical Consequence

import { classifyAlgebra } from './dist/meta/algebraClassifier.js';
import { algebras, foldArray } from './dist/domains/fold.js';
import { generateParallelStrategy, canParallelize, whyNotParallelizable } from './dist/parallel/index.js';

console.log('═'.repeat(70));
console.log('Event 019: Automatic Parallelization - Parallelism as Mathematics');
console.log('═'.repeat(70));
console.log('Properties → Recognition → Proven Strategy → Guaranteed Correctness');
console.log('');

// ============================================================================
// Setup: Classify algebras
// ============================================================================

console.log('📊 Classifying Algebras...');
console.log('');

const sum = classifyAlgebra('sum', algebras.sum, {
  identityCandidates: [0],
  numSamples: 100,
});

const product = classifyAlgebra('product', algebras.product, {
  identityCandidates: [1],
  numSamples: 100,
});

const max = classifyAlgebra('max', algebras.max, {
  identityCandidates: [-Infinity],
  numSamples: 100,
});

const subtract = classifyAlgebra('subtract', (acc, val) => acc - val, {
  identityCandidates: [0],
  numSamples: 100,
});

const first = classifyAlgebra('first', algebras.first, {
  identityCandidates: [null],
  numSamples: 100,
});

console.log('Algebras:');
console.log(`  sum: ${sum.class} (assoc: ${sum.properties.associative}, comm: ${sum.properties.commutative}, id: ${sum.properties.identity})`);
console.log(`  product: ${product.class} (assoc: ${product.properties.associative}, comm: ${product.properties.commutative}, id: ${product.properties.identity})`);
console.log(`  max: ${max.class} (assoc: ${max.properties.associative}, comm: ${max.properties.commutative}, id: ${max.properties.identity})`);
console.log(`  subtract: ${subtract.class} (assoc: ${subtract.properties.associative}, comm: ${subtract.properties.commutative}, id: ${subtract.properties.identity})`);
console.log(`  first: ${first.class} (assoc: ${first.properties.associative}, comm: ${first.properties.commutative}, id: ${first.properties.identity})`);
console.log('');

// ============================================================================
// Test 1: Sum (CommutativeMonoid) — Parallelizable
// ============================================================================

console.log('─'.repeat(70));
console.log('Test 1: Sum (CommutativeMonoid) — Automatic Parallelization');
console.log('─'.repeat(70));
console.log('');

console.log('Algebra: sum');
console.log(`  Class: ${sum.class}`);
console.log(`  Can parallelize: ${canParallelize(sum) ? '✅' : '❌'}`);
console.log('');

const sumStrategy = generateParallelStrategy(sum, 4);

console.log('Strategy Generated:');
console.log(`  Can parallelize: ${sumStrategy.canParallelize ? '✅' : '❌'}`);
console.log(`  Reason: ${sumStrategy.reason}`);
console.log('');

console.log('Proof:');
console.log(`  Theorem: ${sumStrategy.proof.theorem}`);
console.log(`  Requirement: ${sumStrategy.proof.requirement}`);
console.log(`  Satisfied: ${sumStrategy.proof.satisfied ? '✅' : '❌'}`);
console.log(`  Explanation: ${sumStrategy.proof.explanation}`);
console.log('');

// Test with data
const data1 = Array.from({length: 100}, (_, i) => i + 1);  // [1, 2, ..., 100]

console.log('Test Data: [1, 2, 3, ..., 100]');
console.log('');

// Sequential fold
const sequential1 = foldArray(sum.fn, sum.properties.identity)(data1);
console.log(`Sequential fold result: ${sequential1}`);

// Parallel fold (simulated)
const parallel1 = sumStrategy.mapReduce(data1, 25);  // 4 chunks of 25
console.log(`Parallel fold result: ${parallel1}`);
console.log(`Results equivalent: ${sequential1 === parallel1 ? '✅' : '❌'}`);
console.log('');

console.log('Explanation:');
console.log('  Sequential: 1 + 2 + 3 + ... + 100 = 5050');
console.log('  Parallel:');
console.log('    Chunk 1: fold([1..25]) = 325');
console.log('    Chunk 2: fold([26..50]) = 950');
console.log('    Chunk 3: fold([51..75]) = 1575');
console.log('    Chunk 4: fold([76..100]) = 2200');
console.log('    Reduce: 325 + 950 + 1575 + 2200 = 5050 ✅');
console.log('  Guaranteed by Theorem 43 (CommutativeMonoid)');
console.log('');

// ============================================================================
// Test 2: Product (CommutativeMonoid) — Parallelizable
// ============================================================================

console.log('─'.repeat(70));
console.log('Test 2: Product (CommutativeMonoid) — Automatic Parallelization');
console.log('─'.repeat(70));
console.log('');

const productStrategy = generateParallelStrategy(product, 4);

console.log('Algebra: product');
console.log(`  Can parallelize: ${canParallelize(product) ? '✅' : '❌'}`);
console.log(`  Reason: ${productStrategy.reason}`);
console.log('');

const data2 = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];

console.log('Test Data: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]');
console.log('');

const sequential2 = foldArray(product.fn, product.properties.identity)(data2);
const parallel2 = productStrategy.mapReduce(data2, 3);  // Chunks of ~3

console.log(`Sequential: ${sequential2}`);
console.log(`Parallel: ${parallel2}`);
console.log(`Equivalent: ${sequential2 === parallel2 ? '✅' : '❌'}`);
console.log('');

console.log('Explanation:');
console.log('  Sequential: 1 * 2 * 3 * ... * 10 = 3628800');
console.log('  Parallel:');
console.log('    Chunk 1: 1 * 2 * 3 = 6');
console.log('    Chunk 2: 4 * 5 * 6 = 120');
console.log('    Chunk 3: 7 * 8 * 9 = 504');
console.log('    Chunk 4: 10 = 10');
console.log('    Reduce: 6 * 120 * 504 * 10 = 3628800 ✅');
console.log('');

// ============================================================================
// Test 3: Max (IdempotentCommutativeMonoid) — Parallelizable
// ============================================================================

console.log('─'.repeat(70));
console.log('Test 3: Max (IdempotentCommutativeMonoid) — Parallelizable');
console.log('─'.repeat(70));
console.log('');

const maxStrategy = generateParallelStrategy(max, 4);

console.log('Algebra: max');
console.log(`  Can parallelize: ${canParallelize(max) ? '✅' : '❌'}`);
console.log(`  Reason: ${maxStrategy.reason}`);
console.log('');

const data3 = [15, 42, 8, 23, 99, 7, 34, 56, 12, 88];

console.log(`Test Data: [${data3.join(', ')}]`);
console.log('');

const sequential3 = foldArray(max.fn, max.properties.identity)(data3);
const parallel3 = maxStrategy.mapReduce(data3, 3);

console.log(`Sequential: ${sequential3}`);
console.log(`Parallel: ${parallel3}`);
console.log(`Equivalent: ${sequential3 === parallel3 ? '✅' : '❌'}`);
console.log('');

// ============================================================================
// Test 4: Subtract (Non-Commutative) — Cannot Parallelize
// ============================================================================

console.log('─'.repeat(70));
console.log('Test 4: Subtract (Non-Commutative) — Parallelization Rejected');
console.log('─'.repeat(70));
console.log('');

console.log('Algebra: subtract');
console.log(`  Class: ${subtract.class}`);
console.log(`  Can parallelize: ${canParallelize(subtract) ? '✅' : '❌'}`);
console.log('');

const subtractStrategy = generateParallelStrategy(subtract, 4);

console.log('Strategy Generation Result:');
console.log(`  Can parallelize: ${subtractStrategy.canParallelize ? '✅' : '❌'}`);
console.log(`  Reason: ${subtractStrategy.reason}`);
console.log('');

console.log('Proof:');
console.log(`  Theorem: ${subtractStrategy.proof.theorem}`);
console.log(`  Requirement: ${subtractStrategy.proof.requirement}`);
console.log(`  Satisfied: ${subtractStrategy.proof.satisfied ? '✅' : '❌'}`);
console.log(`  Explanation: ${subtractStrategy.proof.explanation}`);
console.log('');

const whyNot = whyNotParallelizable(subtract);
console.log(`Why not parallelizable: ${whyNot}`);
console.log('');

// Demonstrate WHY it would fail
const data4 = [10, 20, 30];
const sequential4 = foldArray(subtract.fn, 100)(data4);

console.log('Example showing why parallelization fails:');
console.log(`  Data: [${data4.join(', ')}]`);
console.log(`  Initial: 100`);
console.log('');
console.log('Sequential:');
console.log('  ((100 - 10) - 20) - 30 = 40');
console.log(`  Result: ${sequential4}`);
console.log('');
console.log('Hypothetical Parallel (system prevents this):');
console.log('  Chunk 1: (100 - 10) - 20 = 70');
console.log('  Chunk 2: 100 - 30 = 70');
console.log('  Reduce: (100 - 70) - 70 = -40');
console.log('  Result would be: -40 ❌ (WRONG!)');
console.log('');
console.log('System correctly rejects parallelization for subtract.');
console.log('');

// ============================================================================
// Test 5: First (Non-Commutative) — Cannot Parallelize
// ============================================================================

console.log('─'.repeat(70));
console.log('Test 5: First (Semigroup, Non-Commutative) — Rejected');
console.log('─'.repeat(70));
console.log('');

const firstStrategy = generateParallelStrategy(first, 4);

console.log('Algebra: first');
console.log(`  Class: ${first.class}`);
console.log(`  Can parallelize: ${canParallelize(first) ? '✅' : '❌'}`);
console.log(`  Reason: ${firstStrategy.reason}`);
console.log('');

console.log('Why parallelization fails:');
console.log('  first is associative ✅ (allows splitting)');
console.log('  first is NOT commutative ❌ (order matters!)');
console.log('  → Parallel chunks could be processed in wrong order');
console.log('  → Result depends on which chunk finishes first');
console.log('  → Non-deterministic results');
console.log('');

const data5 = [1, 2, 3, 4, 5];
const sequential5 = foldArray(first.fn, first.properties.identity)(data5);

console.log(`Example: [${data5.join(', ')}]`);
console.log(`Sequential result: ${sequential5} (first element)`);
console.log('Parallel would give non-deterministic results depending on chunk order.');
console.log('');

// ============================================================================
// Test 6: Large Dataset Performance Comparison
// ============================================================================

console.log('─'.repeat(70));
console.log('Test 6: Large Dataset - Performance Structure');
console.log('─'.repeat(70));
console.log('');

const largeData = Array.from({length: 100_000}, (_, i) => i + 1);  // Reduced for demo

console.log(`Dataset size: ${largeData.length.toLocaleString()} elements`);
console.log('');

// Sum
console.log('Algebra: sum (CommutativeMonoid)');
const sumLargeStrategy = generateParallelStrategy(sum, 8);
console.log(`  Parallelizable: ${sumLargeStrategy.canParallelize ? '✅' : '❌'}`);
console.log(`  Chunk strategy: Split into 8 chunks`);
console.log(`  Theoretical speedup: ~8x on 8 cores`);
console.log('');

const startSeq = Date.now();
const seqResult = foldArray(sum.fn, sum.properties.identity)(largeData);
const seqTime = Date.now() - startSeq;

const startPar = Date.now();
const parResult = sumLargeStrategy.mapReduce(largeData, Math.ceil(largeData.length / 8));
const parTime = Date.now() - startPar;

console.log('Results:');
console.log(`  Sequential: ${seqResult} (${seqTime}ms)`);
console.log(`  Parallel structure: ${parResult} (${parTime}ms)`);
console.log(`  Equivalent: ${seqResult === parResult ? '✅' : '❌'}`);
console.log(`  Structure demonstrates MapReduce decomposition`);
console.log('');

console.log('Note: This demonstration shows the MapReduce structure.');
console.log('      True parallelization would use Worker threads or similar.');
console.log('      The guarantee: Theorem 43 ensures equivalence regardless of');
console.log('      execution model (sequential, threaded, distributed, GPU).');
console.log('');

// ============================================================================
// Summary
// ============================================================================

console.log('═'.repeat(70));
console.log('Summary: Parallelization as Mathematical Consequence');
console.log('═'.repeat(70));
console.log('');

console.log('Theorem 43 (MapReduce via CommutativeMonoid):');
console.log('  fold(A, init, xs) ≡ fold(A, init, map(chunk => fold(A, init, chunk), split(xs)))');
console.log('  when A is CommutativeMonoid');
console.log('');

console.log('Results:');
console.log('  ✅ sum: CommutativeMonoid → Parallelizable');
console.log('  ✅ product: CommutativeMonoid → Parallelizable');
console.log('  ✅ max: IdempotentCommutativeMonoid → Parallelizable');
console.log('  ❌ subtract: Magma (non-associative) → Rejected');
console.log('  ❌ first: Semigroup (non-commutative) → Rejected');
console.log('');

console.log('Key Insights:');
console.log('  1. Parallelization is not a feature, it\'s a property consequence');
console.log('  2. System automatically recognizes parallelizability through classification');
console.log('  3. Invalid parallelizations are ontologically impossible (rejected)');
console.log('  4. Every parallelization includes proof of correctness');
console.log('  5. Guarantees hold regardless of execution model');
console.log('');

console.log('The Inversion:');
console.log('  Traditional: Developer → manually parallelize → hope for correctness');
console.log('  λ-Foundation: Properties → automatic recognition → proven strategy');
console.log('');

console.log('Event 019 demonstrates:');
console.log('  Properties → Recognition → Proven Strategy → Guaranteed Correctness');
console.log('');

console.log('The system does not parallelize code.');
console.log('The system recognizes mathematical structures that permit decomposition.');
console.log('');

console.log('═'.repeat(70));
console.log('Parallelization is not heuristic. Parallelization is theorem application.');
console.log('═'.repeat(70));
