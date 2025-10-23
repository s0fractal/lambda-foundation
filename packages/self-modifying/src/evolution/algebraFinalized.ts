// algebraFinalized.ts
// Event 020: Algebra Evolution
// Algebras with finalization step

import type { ClassifiedAlgebra } from '../meta/algebraClassifier.js';
import { foldArray } from '../domains/fold.js';

/**
 * Finalized algebra
 *
 * Pattern: fold → finalize → result
 *
 * Many computations follow this pattern:
 * 1. Accumulate state via fold
 * 2. Transform accumulated state to final result
 *
 * Example: Average = fold(sum + count) → finalize(sum/count)
 */
export interface FinalizedAlgebra<A, B, R> {
  algebra: ClassifiedAlgebra<A, B>;
  finalize: (accumulated: B) => R;
  name: string;
}

/**
 * Create finalized algebra
 */
export function withFinalization<A, B, R>(
  algebra: ClassifiedAlgebra<A, B>,
  finalize: (acc: B) => R,
  name?: string
): FinalizedAlgebra<A, B, R> {
  return {
    algebra,
    finalize,
    name: name || `finalized(${algebra.name})`,
  };
}

/**
 * Compute finalized algebra on data
 */
export function computeFinalized<A, B, R>(
  finalized: FinalizedAlgebra<A, B, R>,
  data: A[]
): R {
  // Step 1: Fold to accumulate
  const accumulated = foldArray(
    finalized.algebra.fn,
    finalized.algebra.properties.identity as B
  )(data);

  // Step 2: Finalize
  return finalized.finalize(accumulated);
}

/**
 * Check if finalized algebra can be parallelized
 *
 * Requirements:
 * - Underlying algebra must be CommutativeMonoid
 * - Finalization must be applied after parallel reduction
 */
export function canParallelizeFinalized<A, B, R>(
  finalized: FinalizedAlgebra<A, B, R>
): boolean {
  return (
    finalized.algebra.properties.associative &&
    finalized.algebra.properties.commutative &&
    finalized.algebra.properties.identity !== null
  );
}
