// algebraClassifier.ts
// Event 016: Meta-Algebra Analysis
// Classification of algebraic structures into ontological hierarchy

import type { Algebra } from '../evolution/operators.js';
import type { AlgebraProperties } from './algebraProperties.js';
import { detectProperties } from './algebraProperties.js';

/**
 * Ontological hierarchy of algebraic structures
 *
 * Magma → Semigroup → Monoid → CommutativeMonoid → Group → AbelianGroup
 *                              ↓
 *                      IdempotentMonoid
 */
export type AlgebraClass =
  | 'Magma'                    // Just a binary operation (no guarantees)
  | 'Semigroup'                // Associative
  | 'Monoid'                   // Associative + Identity
  | 'CommutativeMonoid'        // Associative + Identity + Commutative
  | 'IdempotentMonoid'         // Monoid + Idempotent
  | 'IdempotentCommutativeMonoid'  // CommutativeMonoid + Idempotent
  | 'Group'                    // Monoid + Inverse
  | 'AbelianGroup';            // Group + Commutative

/**
 * Implications derived from algebra class
 */
export interface AlgebraImplications {
  parallelizable: boolean;       // Can use MapReduce (requires commutative + associative)
  foldable: boolean;             // Can fold in any direction (always true for algebras)
  safeForUnordered: boolean;     // Result independent of order (requires commutative)
  safeForDuplicates: boolean;    // Duplicates don't change result (requires idempotent)
  hasIdentity: boolean;          // Has identity element (required for empty fold)
  invertible: boolean;           // Operations can be reversed (requires inverse)
}

/**
 * Complete algebra metadata
 */
export interface ClassifiedAlgebra<A, B> {
  name: string;
  fn: Algebra<A, B>;
  properties: AlgebraProperties;
  class: AlgebraClass;
  implications: AlgebraImplications;
}

/**
 * Classify algebra into ontological hierarchy
 *
 * Decision tree:
 * 1. If not associative → Magma
 * 2. If associative but no identity → Semigroup
 * 3. If has identity but not commutative, no inverse → Monoid
 * 4. If commutative but no inverse → CommutativeMonoid (+ Idempotent variant)
 * 5. If has inverse but not commutative → Group
 * 6. If has inverse and commutative → AbelianGroup
 */
export function classify(properties: AlgebraProperties): AlgebraClass {
  // Level 1: Check associativity
  if (!properties.associative) {
    return 'Magma';
  }

  // Level 2: Check identity
  if (properties.identity === null) {
    return 'Semigroup';
  }

  // Level 3: Check inverse
  if (properties.hasInverse) {
    if (properties.commutative) {
      return 'AbelianGroup';
    } else {
      return 'Group';
    }
  }

  // Level 4: No inverse, so Monoid or its variants
  if (!properties.commutative) {
    return 'Monoid';
  }

  // Level 5: Commutative monoid variants
  if (properties.idempotent) {
    return 'IdempotentCommutativeMonoid';
  }

  return 'CommutativeMonoid';
}

/**
 * Derive implications from algebra class
 */
export function deriveImplications(
  algebraClass: AlgebraClass,
  properties: AlgebraProperties
): AlgebraImplications {
  const hasIdentity = properties.identity !== null;
  const isCommutative = properties.commutative;
  const isAssociative = properties.associative;
  const isIdempotent = properties.idempotent;
  const hasInverse = properties.hasInverse;

  return {
    // Parallelizable requires both commutative AND associative
    parallelizable: isCommutative && isAssociative,

    // All algebras can be folded (even non-associative ones, just order-dependent)
    foldable: true,

    // Safe for unordered data requires commutativity
    safeForUnordered: isCommutative,

    // Safe for duplicates requires idempotence
    safeForDuplicates: isIdempotent,

    // Has identity element
    hasIdentity,

    // Invertible operations
    invertible: hasInverse,
  };
}

/**
 * Classify an algebra and derive all metadata
 */
export function classifyAlgebra<A, B>(
  name: string,
  algebra: Algebra<A, B>,
  config?: {
    identityCandidates?: unknown[];
    numSamples?: number;
  }
): ClassifiedAlgebra<A, B> {
  const properties = detectProperties(algebra, config);
  const algebraClass = classify(properties);
  const implications = deriveImplications(algebraClass, properties);

  return {
    name,
    fn: algebra,
    properties,
    class: algebraClass,
    implications,
  };
}

/**
 * Check if an algebra belongs to a specific class or higher
 *
 * Hierarchy levels (higher = more structure):
 * Magma (0) < Semigroup (1) < Monoid (2) < CommutativeMonoid (3) < Group (4) < AbelianGroup (5)
 */
export function isAtLeast(actual: AlgebraClass, required: AlgebraClass): boolean {
  const hierarchy: Record<AlgebraClass, number> = {
    'Magma': 0,
    'Semigroup': 1,
    'Monoid': 2,
    'CommutativeMonoid': 3,
    'IdempotentMonoid': 2.5,  // Branch from Monoid
    'IdempotentCommutativeMonoid': 3.5,  // Branch from CommutativeMonoid
    'Group': 4,
    'AbelianGroup': 5,
  };

  return hierarchy[actual] >= hierarchy[required];
}

/**
 * Generate human-readable report for classified algebra
 */
export function generateReport<A, B>(classified: ClassifiedAlgebra<A, B>): string {
  const { name, properties, class: algebraClass, implications } = classified;

  const propertyList = [
    properties.associative && 'Associative',
    properties.commutative && 'Commutative',
    properties.identity !== null && `Identity: ${properties.identity}`,
    properties.idempotent && 'Idempotent',
    properties.hasInverse && 'Invertible',
  ].filter(Boolean).join(', ');

  const implicationList = [
    implications.parallelizable && 'Parallelizable',
    implications.safeForUnordered && 'Order-independent',
    implications.safeForDuplicates && 'Idempotent (safe for duplicates)',
    implications.hasIdentity && 'Has identity (safe for empty)',
    implications.invertible && 'Invertible',
  ].filter(Boolean).join(', ');

  return `
╔═══════════════════════════════════════════════════════════════════╗
║ Algebra: ${name.padEnd(58)} ║
╠═══════════════════════════════════════════════════════════════════╣
║ Class: ${algebraClass.padEnd(60)} ║
╠═══════════════════════════════════════════════════════════════════╣
║ Properties:                                                       ║
║   ${propertyList.padEnd(64)} ║
╠═══════════════════════════════════════════════════════════════════╣
║ Implications:                                                     ║
║   ${implicationList.padEnd(64)} ║
╚═══════════════════════════════════════════════════════════════════╝
`.trim();
}

/**
 * Compare two algebras for equivalence
 *
 * Two algebras are equivalent if they have the same properties
 * (not the same implementation, but the same mathematical structure)
 */
export function algebrasEquivalent(
  props1: AlgebraProperties,
  props2: AlgebraProperties
): boolean {
  return (
    props1.associative === props2.associative &&
    props1.commutative === props2.commutative &&
    props1.identity === props2.identity &&
    props1.idempotent === props2.idempotent &&
    props1.hasInverse === props2.hasInverse
  );
}

/**
 * Get the ontological "distance" between two algebra classes
 * (number of property differences)
 */
export function algebraDistance(props1: AlgebraProperties, props2: AlgebraProperties): number {
  let distance = 0;

  if (props1.associative !== props2.associative) distance++;
  if (props1.commutative !== props2.commutative) distance++;
  if ((props1.identity !== null) !== (props2.identity !== null)) distance++;
  if (props1.idempotent !== props2.idempotent) distance++;
  if (props1.hasInverse !== props2.hasInverse) distance++;

  return distance;
}
