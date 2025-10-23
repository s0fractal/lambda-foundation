// algebraSearch.ts
// Event 017: Algebra Synthesis from Properties
// Search existing algebras by specification

import type { ClassifiedAlgebra } from '../meta/algebraClassifier.js';
import { classifyAlgebra } from '../meta/algebraClassifier.js';
import { algebras } from '../domains/fold.js';
import type { AlgebraSpec } from './algebraSpec.js';

/**
 * Known algebras database
 * These are pre-classified and ready to match against specs
 */
export const knownAlgebras: Map<string, ClassifiedAlgebra<any, any>> = new Map();

/**
 * Initialize known algebras database
 */
export function initializeKnownAlgebras(): void {
  // Numeric algebras
  knownAlgebras.set('sum', classifyAlgebra('sum', algebras.sum, {
    identityCandidates: [0],
    numSamples: 100,
  }));

  knownAlgebras.set('product', classifyAlgebra('product', algebras.product, {
    identityCandidates: [1],
    numSamples: 100,
  }));

  knownAlgebras.set('max', classifyAlgebra('max', algebras.max, {
    identityCandidates: [-Infinity],
    numSamples: 100,
  }));

  knownAlgebras.set('min', classifyAlgebra('min', algebras.min, {
    identityCandidates: [Infinity],
    numSamples: 100,
  }));

  knownAlgebras.set('count', classifyAlgebra('count', algebras.count, {
    identityCandidates: [0],
    numSamples: 100,
  }));

  // String algebras
  knownAlgebras.set('concat', classifyAlgebra('concat', algebras.concat, {
    identityCandidates: [''],
    numSamples: 100,
  }));

  // Array algebras
  // Note: collect skipped for now (property detection doesn't handle array accumulators well)
}

/**
 * Search for an existing algebra matching the specification
 *
 * @returns ClassifiedAlgebra if found, null otherwise
 */
export function searchExisting(spec: AlgebraSpec): ClassifiedAlgebra<any, any> | null {
  // Initialize if not done
  if (knownAlgebras.size === 0) {
    initializeKnownAlgebras();
  }

  // Search through known algebras
  for (const [name, algebra] of knownAlgebras.entries()) {
    if (matchesSpec(algebra, spec)) {
      return algebra;
    }
  }

  return null;
}

/**
 * Check if a classified algebra matches a specification
 */
function matchesSpec(algebra: ClassifiedAlgebra<any, any>, spec: AlgebraSpec): boolean {
  // 1. Class must match or be stronger
  if (!classMatches(algebra.class, spec.class)) {
    return false;
  }

  // 2. Identity must match (if specified)
  if (spec.identity !== undefined && algebra.properties.identity !== spec.identity) {
    return false;
  }

  // 3. Constraints must be satisfied (if specified)
  if (spec.constraints) {
    if (spec.constraints.associative !== undefined &&
        algebra.properties.associative !== spec.constraints.associative) {
      return false;
    }

    if (spec.constraints.commutative !== undefined &&
        algebra.properties.commutative !== spec.constraints.commutative) {
      return false;
    }

    if (spec.constraints.idempotent !== undefined &&
        algebra.properties.idempotent !== spec.constraints.idempotent) {
      return false;
    }

    if (spec.constraints.hasInverse !== undefined &&
        algebra.properties.hasInverse !== spec.constraints.hasInverse) {
      return false;
    }
  }

  // 4. Semantic hint (if provided, helps narrow down)
  if (spec.semantics) {
    return matchesSemantic(algebra.name, spec.semantics, spec.identity);
  }

  return true;
}

/**
 * Check if algebra class matches or exceeds required class
 */
function classMatches(actual: string, required: string): boolean {
  // Exact match
  if (actual === required) {
    return true;
  }

  // Allow stronger classes
  // For example, CommutativeMonoid satisfies Monoid requirement
  const hierarchy: Record<string, number> = {
    'Magma': 0,
    'Semigroup': 1,
    'Monoid': 2,
    'CommutativeMonoid': 3,
    'IdempotentMonoid': 2.5,
    'IdempotentCommutativeMonoid': 3.5,
    'Group': 4,
    'AbelianGroup': 5,
  };

  return (hierarchy[actual] || 0) >= (hierarchy[required] || 0);
}

/**
 * Check if algebra name matches semantic hint
 */
function matchesSemantic(
  name: string,
  semantics: string,
  identity: unknown
): boolean {
  switch (semantics) {
    case 'additive':
      return name === 'sum' && identity === 0;

    case 'multiplicative':
      return name === 'product' && identity === 1;

    case 'extremal':
      return (name === 'max' && identity === -Infinity) ||
             (name === 'min' && identity === Infinity);

    case 'concatenative':
      return (name === 'concat' && identity === '') ||
             (name === 'collect' && JSON.stringify(identity) === '[]');

    default:
      return true;  // Custom semantics, accept any
  }
}

/**
 * Get all algebras matching a partial spec (for exploration)
 */
export function searchAll(partialSpec: Partial<AlgebraSpec>): ClassifiedAlgebra<any, any>[] {
  if (knownAlgebras.size === 0) {
    initializeKnownAlgebras();
  }

  const results: ClassifiedAlgebra<any, any>[] = [];

  for (const algebra of knownAlgebras.values()) {
    let matches = true;

    if (partialSpec.class && algebra.class !== partialSpec.class) {
      matches = false;
    }

    if (partialSpec.identity !== undefined &&
        algebra.properties.identity !== partialSpec.identity) {
      matches = false;
    }

    if (matches) {
      results.push(algebra);
    }
  }

  return results;
}
