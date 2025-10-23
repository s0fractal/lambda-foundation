// algebraSpec.ts
// Event 017: Algebra Synthesis from Properties
// Ontological specification language for algebras

import type { AlgebraClass } from '../meta/algebraClassifier.js';

/**
 * Semantic categories for algebras
 */
export type AlgebraSemantics =
  | 'additive'        // a + b (sum)
  | 'multiplicative'  // a * b (product)
  | 'extremal'        // max/min
  | 'concatenative'   // string/array concatenation
  | 'custom';         // User-defined

/**
 * Value types supported
 */
export type ValueType =
  | 'number'
  | 'string'
  | 'boolean'
  | 'array'
  | 'custom';

/**
 * Algebra specification (ontological declaration)
 *
 * This is not "how to implement".
 * This is "what properties must hold".
 */
export interface AlgebraSpec {
  // Ontological class (required)
  class: AlgebraClass;

  // Value type
  valueType: ValueType;

  // Identity element (required for Monoid and above)
  identity?: unknown;

  // Semantic hint (helps synthesis)
  semantics?: AlgebraSemantics;

  // Additional property constraints (optional, for validation)
  constraints?: {
    associative?: boolean;
    commutative?: boolean;
    idempotent?: boolean;
    hasInverse?: boolean;
  };

  // Optional: human-readable name
  name?: string;
}

/**
 * Validation result
 */
export interface ValidationResult {
  valid: boolean;
  errors: string[];
}

/**
 * Validate that a specification is ontologically consistent
 *
 * Checks:
 * 1. Monoid+ requires identity
 * 2. Semantics compatible with type and identity
 * 3. Class constraints match specified properties
 */
export function validateSpec(spec: AlgebraSpec): ValidationResult {
  const errors: string[] = [];

  // Rule 1: Monoid and above require identity
  const requiresIdentity: AlgebraClass[] = [
    'Monoid',
    'CommutativeMonoid',
    'IdempotentMonoid',
    'IdempotentCommutativeMonoid',
    'Group',
    'AbelianGroup',
  ];

  if (requiresIdentity.includes(spec.class) && spec.identity === undefined) {
    errors.push(`${spec.class} requires identity element`);
  }

  // Rule 2: Semantic validation
  if (spec.semantics && spec.valueType && spec.identity !== undefined) {
    const expectedIdentity = getExpectedIdentity(spec.semantics, spec.valueType);
    if (expectedIdentity !== null && expectedIdentity !== spec.identity) {
      errors.push(
        `${spec.semantics} semantics with ${spec.valueType} expects identity=${expectedIdentity}, got ${spec.identity}`
      );
    }
  }

  // Rule 3: Class implies properties
  const requiredProps = getRequiredProperties(spec.class);

  if (spec.constraints) {
    // Check that user-specified constraints are compatible with class
    if (requiredProps.associative && spec.constraints.associative === false) {
      errors.push(`${spec.class} requires associative property`);
    }

    if (requiredProps.commutative && spec.constraints.commutative === false) {
      errors.push(`${spec.class} requires commutative property`);
    }

    if (requiredProps.idempotent && spec.constraints.idempotent === false) {
      errors.push(`${spec.class} requires idempotent property`);
    }
  }

  // Rule 4: Ontological impossibilities
  if (spec.class === 'Group' || spec.class === 'AbelianGroup') {
    // Groups require inverses
    if (spec.valueType === 'string' && spec.semantics === 'concatenative') {
      errors.push('String concatenation has no inverse operation (cannot form Group)');
    }
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

/**
 * Get expected identity for semantic category and type
 */
function getExpectedIdentity(semantics: AlgebraSemantics, valueType: ValueType): unknown | null {
  if (valueType === 'number') {
    switch (semantics) {
      case 'additive':
        return 0;
      case 'multiplicative':
        return 1;
      case 'extremal':
        return null; // Depends on min/max (handled separately)
      default:
        return null;
    }
  }

  if (valueType === 'string') {
    switch (semantics) {
      case 'concatenative':
        return '';
      default:
        return null;
    }
  }

  if (valueType === 'array') {
    switch (semantics) {
      case 'concatenative':
        return [];
      default:
        return null;
    }
  }

  return null;
}

/**
 * Get required properties for an algebra class
 */
function getRequiredProperties(algebraClass: AlgebraClass): {
  associative: boolean;
  commutative: boolean;
  idempotent: boolean;
  hasInverse: boolean;
} {
  const props = {
    associative: false,
    commutative: false,
    idempotent: false,
    hasInverse: false,
  };

  // Semigroup and above are associative
  if (['Semigroup', 'Monoid', 'CommutativeMonoid', 'IdempotentMonoid', 'IdempotentCommutativeMonoid', 'Group', 'AbelianGroup'].includes(algebraClass)) {
    props.associative = true;
  }

  // CommutativeMonoid, AbelianGroup are commutative
  if (['CommutativeMonoid', 'IdempotentCommutativeMonoid', 'AbelianGroup'].includes(algebraClass)) {
    props.commutative = true;
  }

  // IdempotentMonoid, IdempotentCommutativeMonoid are idempotent
  if (['IdempotentMonoid', 'IdempotentCommutativeMonoid'].includes(algebraClass)) {
    props.idempotent = true;
  }

  // Group, AbelianGroup have inverses
  if (['Group', 'AbelianGroup'].includes(algebraClass)) {
    props.hasInverse = true;
  }

  return props;
}

/**
 * Check if two specs are equivalent (same algebra should satisfy both)
 */
export function specsEquivalent(spec1: AlgebraSpec, spec2: AlgebraSpec): boolean {
  return (
    spec1.class === spec2.class &&
    spec1.valueType === spec2.valueType &&
    spec1.identity === spec2.identity &&
    spec1.semantics === spec2.semantics
  );
}

/**
 * Create a minimal spec from class and type
 */
export function minimalSpec(
  algebraClass: AlgebraClass,
  valueType: ValueType,
  identity?: unknown
): AlgebraSpec {
  return {
    class: algebraClass,
    valueType,
    identity,
  };
}
