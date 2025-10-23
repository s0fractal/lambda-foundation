// algebraComposer.ts
// Event 020: Algebra Evolution
// Compose algebras to create new ontological objects

import type { ClassifiedAlgebra, AlgebraProperties } from '../meta/algebraClassifier.js';
import { classify, deriveImplications } from '../meta/algebraClassifier.js';

/**
 * Compose two algebras into a product algebra
 *
 * Result computes both algebras simultaneously on the same input.
 *
 * Requirements:
 * - Both algebras must have identity (Monoid or higher)
 * - If both are commutative, result is commutative (parallelizable)
 *
 * Theorem 44: Product of monoids is a monoid
 */
export function composeAlgebras<A, B1, B2>(
  alg1: ClassifiedAlgebra<A, B1>,
  alg2: ClassifiedAlgebra<A, B2>
): ClassifiedAlgebra<A, [B1, B2]> | null {
  // Check: both must be at least Monoid (have identity)
  if (alg1.properties.identity === null) {
    console.warn(`Cannot compose: ${alg1.name} has no identity (not a Monoid)`);
    return null;
  }
  if (alg2.properties.identity === null) {
    console.warn(`Cannot compose: ${alg2.name} has no identity (not a Monoid)`);
    return null;
  }

  // Both must be associative (Monoid requirement)
  if (!alg1.properties.associative || !alg2.properties.associative) {
    console.warn(`Cannot compose: one or both algebras are not associative`);
    return null;
  }

  // Composed function: compute both simultaneously
  const composedFn = (acc: [B1, B2], val: A): [B1, B2] => {
    return [
      alg1.fn(acc[0], val),
      alg2.fn(acc[1], val)
    ];
  };

  // Composed identity: tuple of identities
  const composedIdentity: [B1, B2] = [
    alg1.properties.identity as B1,
    alg2.properties.identity as B2
  ];

  // Properties: product inherits from components
  const isCommutative = alg1.properties.commutative && alg2.properties.commutative;
  const isIdempotent = alg1.properties.idempotent && alg2.properties.idempotent;
  const hasInverse = alg1.properties.hasInverse && alg2.properties.hasInverse;

  const composedProperties: AlgebraProperties = {
    associative: true,  // Product of associative is associative
    commutative: isCommutative,
    identity: composedIdentity,
    idempotent: isIdempotent,
    hasInverse: hasInverse,
  };

  // Classify
  const algebraClass = classify(composedProperties);
  const implications = deriveImplications(algebraClass, composedProperties);

  return {
    name: `compose(${alg1.name}, ${alg2.name})`,
    fn: composedFn,
    properties: composedProperties,
    class: algebraClass,
    implications,
  };
}

/**
 * Compose three algebras into a triple product
 */
export function composeThree<A, B1, B2, B3>(
  alg1: ClassifiedAlgebra<A, B1>,
  alg2: ClassifiedAlgebra<A, B2>,
  alg3: ClassifiedAlgebra<A, B3>
): ClassifiedAlgebra<A, [B1, B2, B3]> | null {
  // Compose first two
  const composed12 = composeAlgebras(alg1, alg2);
  if (!composed12) return null;

  // Compose result with third
  const composed123Raw = composeAlgebras(composed12, alg3);
  if (!composed123Raw) return null;

  // Flatten the result from [[B1, B2], B3] to [B1, B2, B3]
  const flattenedFn = (acc: [B1, B2, B3], val: A): [B1, B2, B3] => {
    const nested = composed123Raw.fn([[acc[0], acc[1]], acc[2]], val);
    return [nested[0][0], nested[0][1], nested[1]];
  };

  const flattenedIdentity: [B1, B2, B3] = [
    alg1.properties.identity as B1,
    alg2.properties.identity as B2,
    alg3.properties.identity as B3
  ];

  return {
    name: `compose(${alg1.name}, ${alg2.name}, ${alg3.name})`,
    fn: flattenedFn,
    properties: {
      ...composed123Raw.properties,
      identity: flattenedIdentity,
    },
    class: composed123Raw.class,
    implications: composed123Raw.implications,
  };
}

/**
 * Transform algebra input with a function
 *
 * Creates algebra: A' where A'(acc, x) = A(acc, f(x))
 *
 * This allows existing algebras to work on transformed data.
 */
export function withTransform<A, B, C>(
  algebra: ClassifiedAlgebra<B, C>,
  transform: (x: A) => B,
  name?: string
): ClassifiedAlgebra<A, C> {
  const transformedFn = (acc: C, val: A): C => {
    return algebra.fn(acc, transform(val));
  };

  return {
    name: name || `transform(${algebra.name})`,
    fn: transformedFn,
    properties: algebra.properties,  // Properties preserved
    class: algebra.class,
    implications: algebra.implications,
  };
}

/**
 * Check if two algebras can be composed
 */
export function canCompose<A, B1, B2>(
  alg1: ClassifiedAlgebra<A, B1>,
  alg2: ClassifiedAlgebra<A, B2>
): boolean {
  return (
    alg1.properties.associative &&
    alg2.properties.associative &&
    alg1.properties.identity !== null &&
    alg2.properties.identity !== null
  );
}

/**
 * Explain why algebras cannot be composed
 */
export function whyCannotCompose<A, B1, B2>(
  alg1: ClassifiedAlgebra<A, B1>,
  alg2: ClassifiedAlgebra<A, B2>
): string | null {
  if (canCompose(alg1, alg2)) {
    return null;
  }

  const reasons: string[] = [];
  if (!alg1.properties.associative) {
    reasons.push(`${alg1.name} is not associative`);
  }
  if (!alg2.properties.associative) {
    reasons.push(`${alg2.name} is not associative`);
  }
  if (alg1.properties.identity === null) {
    reasons.push(`${alg1.name} has no identity`);
  }
  if (alg2.properties.identity === null) {
    reasons.push(`${alg2.name} has no identity`);
  }

  return `Cannot compose: ${reasons.join(', ')}`;
}
