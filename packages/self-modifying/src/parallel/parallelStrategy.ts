// parallelStrategy.ts
// Event 019: Automatic Parallelization via CommutativeMonoid
// Parallel strategy generation with proof

import type { ClassifiedAlgebra } from '../meta/algebraClassifier.js';
import { foldArray } from '../domains/fold.js';

/**
 * Parallel strategy for an algebra
 *
 * Only commutative monoids can be parallelized safely
 */
export interface ParallelStrategy<A, B> {
  canParallelize: boolean;
  reason: string;
  mapReduce: ((data: A[], chunkSize?: number) => B) | null;
  proof: {
    theorem: 'MapReduce via CommutativeMonoid';
    requirement: string;
    satisfied: boolean;
    explanation: string;
  };
  estimatedSpeedup?: number;  // Expected speedup on N cores
}

/**
 * Generate parallel strategy for an algebra
 *
 * Requirements for parallelization:
 * - Associative: allows splitting computation into sub-problems
 * - Commutative: allows processing chunks in any order
 * - Identity: allows safe initialization of each chunk
 *
 * If any requirement is not met, parallelization is ontologically impossible
 * while preserving semantics.
 */
export function generateParallelStrategy<A, B>(
  algebra: ClassifiedAlgebra<A, B>,
  targetCores: number = 8
): ParallelStrategy<A, B> {
  // Check requirements
  const isAssociative = algebra.properties.associative;
  const isCommutative = algebra.properties.commutative;
  const hasIdentity = algebra.properties.identity !== null;

  // All three properties required for safe parallelization
  const canParallelize = isAssociative && isCommutative && hasIdentity;

  if (!canParallelize) {
    // Determine which properties are missing
    const missing: string[] = [];
    if (!isAssociative) missing.push('associative');
    if (!isCommutative) missing.push('commutative');
    if (!hasIdentity) missing.push('identity');

    return {
      canParallelize: false,
      reason: `Algebra "${algebra.name}" is ${algebra.class}, not CommutativeMonoid (missing: ${missing.join(', ')})`,
      mapReduce: null,
      proof: {
        theorem: 'MapReduce via CommutativeMonoid',
        requirement: 'Algebra must be CommutativeMonoid (associative + commutative + identity)',
        satisfied: false,
        explanation: `Parallelization would violate semantics. Missing properties: ${missing.join(', ')}`,
      },
    };
  }

  // Generate MapReduce morphism
  const identity = algebra.properties.identity as B;

  const mapReduce = (data: A[], chunkSize?: number): B => {
    if (data.length === 0) {
      return identity;
    }

    // Auto-determine chunk size if not provided
    // Target: one chunk per core for optimal parallelism
    const effectiveChunkSize = chunkSize ?? Math.ceil(data.length / targetCores);

    // Edge case: if data is smaller than chunk size, just fold directly
    if (data.length <= effectiveChunkSize) {
      return foldArray(algebra.fn, identity)(data);
    }

    // Split into chunks
    const chunks: A[][] = [];
    for (let i = 0; i < data.length; i += effectiveChunkSize) {
      chunks.push(data.slice(i, i + effectiveChunkSize));
    }

    // Phase 1: Map - fold each chunk independently
    // In a real parallel implementation, this would use Worker threads or similar
    // For now, we demonstrate the structure (sequential execution)
    const chunkResults: B[] = chunks.map(chunk =>
      foldArray(algebra.fn, identity)(chunk)
    );

    // Phase 2: Reduce - fold the chunk results
    // For homogeneous algebras (where A = B), we can fold the results
    // TypeScript needs help here with the type assertion
    return foldArray(algebra.fn as any, identity)(chunkResults as any);
  };

  // Calculate estimated speedup based on chunk count
  const estimatedChunkCount = Math.min(targetCores, 100);  // Cap at reasonable number
  const estimatedSpeedup = Math.min(targetCores, estimatedChunkCount);

  return {
    canParallelize: true,
    reason: `Algebra "${algebra.name}" is ${algebra.class} (associative ✅, commutative ✅, identity: ${identity} ✅)`,
    mapReduce,
    proof: {
      theorem: 'MapReduce via CommutativeMonoid',
      requirement: 'Algebra must be CommutativeMonoid',
      satisfied: true,
      explanation: 'Theorem 43: fold(A, init, xs) ≡ fold(A, init, map(chunk => fold(A, init, chunk), split(xs))) when A is commutative monoid. Associativity permits decomposition, commutativity permits any order, identity permits safe chunk initialization.',
    },
    estimatedSpeedup,
  };
}

/**
 * Check if an algebra can be parallelized
 *
 * Quick check without generating full strategy
 */
export function canParallelize<A, B>(algebra: ClassifiedAlgebra<A, B>): boolean {
  return (
    algebra.properties.associative &&
    algebra.properties.commutative &&
    algebra.properties.identity !== null
  );
}

/**
 * Get reason why an algebra cannot be parallelized
 *
 * Returns null if algebra CAN be parallelized
 */
export function whyNotParallelizable<A, B>(algebra: ClassifiedAlgebra<A, B>): string | null {
  if (canParallelize(algebra)) {
    return null;
  }

  const missing: string[] = [];
  if (!algebra.properties.associative) {
    missing.push('associative (required for splitting into sub-problems)');
  }
  if (!algebra.properties.commutative) {
    missing.push('commutative (required for processing chunks in any order)');
  }
  if (algebra.properties.identity === null) {
    missing.push('identity (required for safe chunk initialization)');
  }

  return `Missing properties: ${missing.join(', ')}`;
}
