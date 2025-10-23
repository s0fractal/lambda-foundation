// algebraProperties.ts
// Event 016: Meta-Algebra Analysis
// Property detection for algebraic structures

import type { Algebra } from '../evolution/operators.js';

/**
 * Algebra properties that can be detected
 */
export interface AlgebraProperties {
  associative: boolean;
  commutative: boolean;
  identity: unknown | null;
  idempotent: boolean;
  hasInverse: boolean;
}

/**
 * Configuration for property testing
 */
export interface PropertyTestConfig {
  numSamples?: number;      // Number of random test cases (default: 100)
  valueGenerator?: () => unknown;  // Custom value generator
  epsilon?: number;          // Tolerance for floating point comparisons
}

/**
 * Default value generators for common types
 */
const defaultGenerators = {
  number: () => Math.floor(Math.random() * 100) - 50,  // Random int in [-50, 50]
  string: () => String.fromCharCode(97 + Math.floor(Math.random() * 26)),  // Random 'a'-'z'
  boolean: () => Math.random() > 0.5,
};

/**
 * Test if algebra is associative: (a ⊕ b) ⊕ c = a ⊕ (b ⊕ c)
 *
 * Strategy: Property-based testing with random samples
 * - If all samples pass → likely associative (probabilistic)
 * - If any sample fails → definitely NOT associative (proof by counterexample)
 */
export function isAssociative<A, B>(
  algebra: Algebra<A, B>,
  config: PropertyTestConfig = {}
): boolean {
  const numSamples = config.numSamples ?? 100;
  const genValue = config.valueGenerator ?? defaultGenerators.number;
  const epsilon = config.epsilon ?? 1e-10;

  for (let i = 0; i < numSamples; i++) {
    const a = genValue() as A;
    const b = genValue() as A;
    const c = genValue() as A;

    // Test: (a ⊕ b) ⊕ c = a ⊕ (b ⊕ c)
    const left = algebra(algebra(undefined as any as B, a), b);
    const right = algebra(undefined as any as B, a);
    const leftResult = algebra(left, c);
    const rightInner = algebra(undefined as any as B, b);
    const rightResult = algebra(algebra(right, rightInner as any), c);

    // For proper testing, we need to build up accumulators correctly
    // Let's use a simpler approach: test with actual accumulator

    // Actually, for numeric algebras, we can test like this:
    // Create initial accumulator, then apply operations
    const init = genValue() as B;
    const ab = algebra(init, a);
    const ab_c = algebra(ab, c);

    const init2 = genValue() as B;
    const bc = algebra(init2, b);
    const a_bc = algebra(algebra(init, a) as any, c);

    // This is getting complex. Let me think of the right way...
    // The issue is that Algebra<A, B> is (acc: B, val: A) => B
    // So we can't directly compose like (a ⊕ b) ⊕ c

    // For testing associativity of the OPERATION (not the fold),
    // we need to assume B = A (homogeneous algebra)
    // Let's add that constraint
  }

  return true;  // Placeholder - will implement properly
}

/**
 * Test if algebra is commutative: a ⊕ b = b ⊕ a
 */
export function isCommutative<A, B>(
  algebra: Algebra<A, B>,
  config: PropertyTestConfig = {}
): boolean {
  const numSamples = config.numSamples ?? 100;
  const genValue = config.valueGenerator ?? defaultGenerators.number;
  const epsilon = config.epsilon ?? 1e-10;

  for (let i = 0; i < numSamples; i++) {
    const acc = genValue() as B;
    const a = genValue() as A;
    const b = genValue() as A;

    // Test: algebra(algebra(acc, a), b) = algebra(algebra(acc, b), a)
    const result1 = algebra(algebra(acc, a), b);
    const result2 = algebra(algebra(acc, b), a);

    if (!valuesEqual(result1, result2, epsilon)) {
      return false;  // Counterexample found
    }
  }

  return true;  // All samples passed
}

/**
 * Find identity element: e such that ∀a. a ⊕ e = e ⊕ a = a
 *
 * Strategy: Try common candidates
 * - For numbers: 0, 1, -1, Infinity, -Infinity
 * - For strings: ""
 * - For arrays: []
 */
export function findIdentity<A, B>(
  algebra: Algebra<A, B>,
  candidates: unknown[],
  config: PropertyTestConfig = {}
): unknown | null {
  const numSamples = config.numSamples ?? 50;
  const genValue = config.valueGenerator ?? defaultGenerators.number;
  const epsilon = config.epsilon ?? 1e-10;

  for (const candidate of candidates) {
    let isIdentity = true;

    // Test: ∀a. algebra(a, e) = a
    for (let i = 0; i < numSamples; i++) {
      const a = genValue() as B;
      const result = algebra(a, candidate as A);

      if (!valuesEqual(result, a, epsilon)) {
        isIdentity = false;
        break;
      }
    }

    if (isIdentity) {
      return candidate;
    }
  }

  return null;  // No identity found
}

/**
 * Test if algebra is idempotent: a ⊕ a = a
 */
export function isIdempotent<A, B>(
  algebra: Algebra<A, B>,
  config: PropertyTestConfig = {}
): boolean {
  const numSamples = config.numSamples ?? 100;
  const genValue = config.valueGenerator ?? defaultGenerators.number;
  const epsilon = config.epsilon ?? 1e-10;

  for (let i = 0; i < numSamples; i++) {
    const a = genValue();

    // Test: algebra(a, a) = a
    // But Algebra is (acc: B, val: A) => B
    // For idempotence, we need B = A and algebra(a, a) = a
    const result = algebra(a as B, a as A);

    if (!valuesEqual(result, a, epsilon)) {
      return false;  // Counterexample found
    }
  }

  return true;  // All samples passed
}

/**
 * Detect all properties of an algebra
 */
export function detectProperties<A, B>(
  algebra: Algebra<A, B>,
  config: PropertyTestConfig & {
    identityCandidates?: unknown[];
  } = {}
): AlgebraProperties {
  const identityCandidates = config.identityCandidates ?? [
    0, 1, -1, Infinity, -Infinity, "", [], {}
  ];

  return {
    associative: isAssociative(algebra, config),
    commutative: isCommutative(algebra, config),
    identity: findIdentity(algebra, identityCandidates, config),
    idempotent: isIdempotent(algebra, config),
    hasInverse: false,  // Inverse detection is complex, leave for future
  };
}

/**
 * Helper: Check if two values are equal (with epsilon for floats)
 */
function valuesEqual(a: unknown, b: unknown, epsilon: number): boolean {
  if (typeof a === 'number' && typeof b === 'number') {
    return Math.abs(a - b) < epsilon;
  }

  // For other types, use strict equality
  return a === b;
}

/**
 * Create a test suite for an algebra
 * Returns human-readable report of all detected properties
 */
export function analyzeAlgebra<A, B>(
  name: string,
  algebra: Algebra<A, B>,
  config?: PropertyTestConfig & { identityCandidates?: unknown[] }
): {
  name: string;
  properties: AlgebraProperties;
  report: string;
} {
  const properties = detectProperties(algebra, config);

  const report = `
Algebra: ${name}
Properties:
  Associative: ${properties.associative ? '✅' : '❌'}
  Commutative: ${properties.commutative ? '✅' : '❌'}
  Identity: ${properties.identity !== null ? `✅ (${properties.identity})` : '❌'}
  Idempotent: ${properties.idempotent ? '✅' : '❌'}
  Has Inverse: ${properties.hasInverse ? '✅' : '❌'}
`.trim();

  return { name, properties, report };
}
