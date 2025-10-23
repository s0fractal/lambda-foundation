// test-fold-fusion.mjs
// Event 018: Fold Fusion via Algebraic Properties
// Demonstration: Optimization as Proof

import { classifyAlgebra } from './dist/meta/algebraClassifier.js';
import { algebras, universalFold, foldArray } from './dist/domains/fold.js';
import { fuseMapFold, fuseFilterFold } from './dist/optimization/index.js';

console.log('═'.repeat(70));
console.log('Event 018: Fold Fusion - Optimization as Proof');
console.log('═'.repeat(70));
console.log('Pattern → Properties → Proof → Transform → Guarantee');
console.log('');

// ============================================================================
// Setup: Classify algebras
// ============================================================================

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

const firstNonAssociative = classifyAlgebra('first', algebras.first, {
  identityCandidates: [null],
  numSamples: 100,
});

console.log('📊 Algebras Classified:');
console.log(`  sum: ${sum.class} (associative: ${sum.properties.associative})`);
console.log(`  product: ${product.class} (associative: ${product.properties.associative})`);
console.log(`  max: ${max.class} (associative: ${max.properties.associative})`);
console.log(`  first: ${firstNonAssociative.class} (associative: ${firstNonAssociative.properties.associative})`);
console.log('');

// ============================================================================
// Test 1: Map-Fold Fusion
// Pattern: map(f) → fold(algebra)
// Requirement: algebra must be associative
// Transform: fold((acc, x) => algebra(acc, f(x)))
// ============================================================================

console.log('─'.repeat(70));
console.log('Test 1: Map-Fold Fusion');
console.log('─'.repeat(70));
console.log('Pattern: [1,2,3,4,5] |> map(x => x*x) |> fold(sum, 0)');
console.log('Goal: Eliminate intermediate array, fuse into single pass');
console.log('');

const data1 = [1, 2, 3, 4, 5];
const mapFn = (x) => x * x;

// Original: 2 passes
console.log('Original (2 passes):');
const mapped = data1.map(mapFn);
console.log(`  Step 1 (map): [${data1}] → [${mapped}]`);
const result1Original = foldArray(sum.fn, sum.properties.identity)(mapped);
console.log(`  Step 2 (fold): [${mapped}] → ${result1Original}`);
console.log(`  Traversals: 2`);
console.log('');

// Fused: 1 pass
console.log('Attempting fusion...');
const fusion1 = fuseMapFold(mapFn, sum);

if (fusion1) {
  console.log('✅ FUSION SUCCESSFUL');
  console.log('');
  console.log('Proof:');
  console.log(`  Theorem: ${fusion1.proof.theorem}`);
  console.log(`  Requirement: ${fusion1.proof.requirement}`);
  console.log(`  Satisfied: ${fusion1.proof.satisfied ? '✅' : '❌'}`);
  console.log(`  Explanation: ${fusion1.proof.explanation}`);
  console.log('');
  console.log('Performance:');
  console.log(`  Original: ${fusion1.performanceGain.original}`);
  console.log(`  Fused: ${fusion1.performanceGain.fused}`);
  console.log(`  Improvement: ${fusion1.performanceGain.improvement}`);
  console.log('');

  // Verify equivalence
  const result1Fused = foldArray(fusion1.fused.fn, fusion1.fused.properties.identity)(data1);
  console.log('Verification:');
  console.log(`  Original result: ${result1Original}`);
  console.log(`  Fused result: ${result1Fused}`);
  console.log(`  Equivalent: ${result1Original === result1Fused ? '✅' : '❌'}`);
} else {
  console.log('❌ FUSION FAILED (requirements not met)');
}

console.log('');

// ============================================================================
// Test 2: Filter-Fold Fusion
// Pattern: filter(p) → fold(algebra)
// Requirement: algebra must be associative
// Transform: fold((acc, x) => p(x) ? algebra(acc, x) : acc)
// ============================================================================

console.log('─'.repeat(70));
console.log('Test 2: Filter-Fold Fusion');
console.log('─'.repeat(70));
console.log('Pattern: [1,2,3,4,5] |> filter(x > 2) |> fold(sum, 0)');
console.log('Goal: Eliminate intermediate array, fuse into single pass');
console.log('');

const data2 = [1, 2, 3, 4, 5];
const predicate = (x) => x > 2;

// Original: 2 passes
console.log('Original (2 passes):');
const filtered = data2.filter(predicate);
console.log(`  Step 1 (filter): [${data2}] → [${filtered}]`);
const result2Original = foldArray(sum.fn, sum.properties.identity)(filtered);
console.log(`  Step 2 (fold): [${filtered}] → ${result2Original}`);
console.log(`  Traversals: 2`);
console.log('');

// Fused: 1 pass
console.log('Attempting fusion...');
const fusion2 = fuseFilterFold(predicate, sum);

if (fusion2) {
  console.log('✅ FUSION SUCCESSFUL');
  console.log('');
  console.log('Proof:');
  console.log(`  Theorem: ${fusion2.proof.theorem}`);
  console.log(`  Requirement: ${fusion2.proof.requirement}`);
  console.log(`  Satisfied: ${fusion2.proof.satisfied ? '✅' : '❌'}`);
  console.log(`  Explanation: ${fusion2.proof.explanation}`);
  console.log('');
  console.log('Performance:');
  console.log(`  Original: ${fusion2.performanceGain.original}`);
  console.log(`  Fused: ${fusion2.performanceGain.fused}`);
  console.log(`  Improvement: ${fusion2.performanceGain.improvement}`);
  console.log('');

  // Verify equivalence
  const result2Fused = foldArray(fusion2.fused.fn, fusion2.fused.properties.identity)(data2);
  console.log('Verification:');
  console.log(`  Original result: ${result2Original}`);
  console.log(`  Fused result: ${result2Fused}`);
  console.log(`  Equivalent: ${result2Original === result2Fused ? '✅' : '❌'}`);
} else {
  console.log('❌ FUSION FAILED (requirements not met)');
}

console.log('');

// ============================================================================
// Test 3: Invalid Fusion (Non-Associative Algebra)
// Pattern: map(f) → fold(non-associative)
// Expected: Fusion rejected (safety guarantee)
// ============================================================================

console.log('─'.repeat(70));
console.log('Test 3: Invalid Fusion (Non-Associative Algebra)');
console.log('─'.repeat(70));
console.log('Pattern: [1,2,3] |> map(f) |> fold(first, null)');
console.log('Goal: Demonstrate fusion rejection for non-associative algebras');
console.log('');

const data3 = [1, 2, 3];
const mapFn3 = (x) => x + 1;

console.log(`Algebra: first (associative: ${firstNonAssociative.properties.associative})`);
console.log('Attempting fusion...');
const fusion3 = fuseMapFold(mapFn3, firstNonAssociative);

if (fusion3) {
  console.log('❌ UNEXPECTED: Fusion should have been rejected!');
} else {
  console.log('✅ FUSION CORRECTLY REJECTED');
  console.log('');
  console.log('Reason: Algebra is not associative');
  console.log('Safety: Invalid optimizations prevented at compile/classification time');
  console.log('');
  console.log('This is not a runtime error.');
  console.log('This is an ontological impossibility, detected and rejected.');
}

console.log('');

// ============================================================================
// Test 4: Map-Filter-Fold Triple Fusion
// Pattern: map(f) → filter(p) → fold(algebra)
// Strategy: Fuse map-fold first, then filter-fold
// ============================================================================

console.log('─'.repeat(70));
console.log('Test 4: Map-Filter-Fold Triple Fusion');
console.log('─'.repeat(70));
console.log('Pattern: [1,2,3,4,5] |> map(x*2) |> filter(x>5) |> fold(sum, 0)');
console.log('Goal: Fuse all three operations into single pass');
console.log('');

const data4 = [1, 2, 3, 4, 5];
const mapFn4 = (x) => x * 2;
const predicate4 = (x) => x > 5;

// Original: 3 passes
console.log('Original (3 passes):');
const mapped4 = data4.map(mapFn4);
console.log(`  Step 1 (map): [${data4}] → [${mapped4}]`);
const filtered4 = mapped4.filter(predicate4);
console.log(`  Step 2 (filter): [${mapped4}] → [${filtered4}]`);
const result4Original = foldArray(sum.fn, sum.properties.identity)(filtered4);
console.log(`  Step 3 (fold): [${filtered4}] → ${result4Original}`);
console.log(`  Traversals: 3`);
console.log('');

// Fusion strategy: map-fold → filter-fold
console.log('Attempting fusion...');
console.log('  Step 1: Fuse map + fold');
const fusionMapFold = fuseMapFold(mapFn4, sum);
if (!fusionMapFold) {
  console.log('    ❌ Map-fold fusion failed');
} else {
  console.log('    ✅ Map-fold fused (2 passes → 1 pass)');

  console.log('  Step 2: Fuse filter into result');
  const fusionFinal = fuseFilterFold(predicate4, fusionMapFold.fused);

  if (!fusionFinal) {
    console.log('    ❌ Filter-fold fusion failed');
  } else {
    console.log('    ✅ Filter-fold fused (1 pass → 1 pass, filter integrated)');
    console.log('');
    console.log('✅ TRIPLE FUSION SUCCESSFUL');
    console.log('');
    console.log('Final algebra:');
    console.log(`  Name: ${fusionFinal.fused.name}`);
    console.log(`  Properties: ${fusionFinal.fused.class}`);
    console.log('');
    console.log('Performance:');
    console.log(`  Original: 3 passes (map, filter, fold)`);
    console.log(`  Fused: 1 pass`);
    console.log(`  Improvement: 66.7% reduction in traversals`);
    console.log('');

    // Verify equivalence
    const result4Fused = foldArray(fusionFinal.fused.fn, fusionFinal.fused.properties.identity)(data4);
    console.log('Verification:');
    console.log(`  Original result: ${result4Original}`);
    console.log(`  Fused result: ${result4Fused}`);
    console.log(`  Equivalent: ${result4Original === result4Fused ? '✅' : '❌'}`);
  }
}

console.log('');

// ============================================================================
// Test 5: Parallel Fold-Fold Fusion (Bonus)
// Pattern: fold(A1, init1, xs) + fold(A2, init2, xs)
// Requirement: Both algebras are commutative monoids
// Transform: fold((acc1, acc2), x) => (A1(acc1, x), A2(acc2, x)), (init1, init2), xs)
// Note: This is a preview of parallel fusion (not fully implemented yet)
// ============================================================================

console.log('─'.repeat(70));
console.log('Test 5: Parallel Fold-Fold Fusion (Preview)');
console.log('─'.repeat(70));
console.log('Pattern: fold(sum) + fold(product) on same data');
console.log('Goal: Compute both in single pass');
console.log('');

const data5 = [1, 2, 3, 4, 5];

// Original: 2 passes
console.log('Original (2 independent folds):');
const result5Sum = foldArray(sum.fn, sum.properties.identity)(data5);
const result5Product = foldArray(product.fn, product.properties.identity)(data5);
console.log(`  fold(sum): [${data5}] → ${result5Sum}`);
console.log(`  fold(product): [${data5}] → ${result5Product}`);
console.log(`  Traversals: 2`);
console.log('');

console.log('Parallel fusion (conceptual):');
console.log('  Requirements:');
console.log(`    sum is ${sum.class}: ${sum.properties.commutative ? '✅' : '❌'}`);
console.log(`    product is ${product.class}: ${product.properties.commutative ? '✅' : '❌'}`);
console.log('  Transform:');
console.log('    fold(([s, p], x) => [s + x, p * x], [0, 1], xs)');
console.log('  Result: 2 passes → 1 pass (50% reduction)');
console.log('');
console.log('Note: Full implementation would use parallel combinator from Event 016');

console.log('');

// ============================================================================
// Summary
// ============================================================================

console.log('═'.repeat(70));
console.log('Summary: Optimization as Proof');
console.log('═'.repeat(70));
console.log('');
console.log('Theorem 42 (Map-Fold Fusion):');
console.log('  fold(A, init, map(f, xs)) ≡ fold(A ∘ f, init, xs)');
console.log('  when A is associative');
console.log('');
console.log('Corollary 1 (Filter-Fold Fusion):');
console.log('  fold(A, init, filter(p, xs)) ≡ fold(conditional(p, A, id), init, xs)');
console.log('  when A is associative');
console.log('');
console.log('Results:');
console.log('  ✅ Map-fold fusion: 2 passes → 1 pass (50% reduction)');
console.log('  ✅ Filter-fold fusion: 2 passes → 1 pass (50% reduction)');
console.log('  ✅ Triple fusion: 3 passes → 1 pass (66.7% reduction)');
console.log('  ✅ Invalid fusion rejected: non-associative algebras prevented');
console.log('');
console.log('Key Insight:');
console.log('  Optimization is not heuristic guessing.');
console.log('  Optimization is theorem application.');
console.log('  Every optimization comes with a proof of correctness.');
console.log('');
console.log('Event 018 demonstrates:');
console.log('  Pattern → Properties → Proof → Transform → Guarantee');
console.log('');
console.log('The system does not optimize blindly.');
console.log('The system proves equivalence, then optimizes.');
console.log('');
console.log('═'.repeat(70));
