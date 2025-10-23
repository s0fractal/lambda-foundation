// algebraCombinators.ts
// Event 016: Meta-Algebra Analysis
// Type-safe combinators for composing algebras

import type { Algebra } from '../evolution/operators.js';
import type { ClassifiedAlgebra, AlgebraClass } from './algebraClassifier.js';
import { classifyAlgebra, isAtLeast, classify, deriveImplications } from './algebraClassifier.js';

/**
 * Parallel combinator: Apply two algebras simultaneously
 *
 * Requirements: Both algebras must be CommutativeMonoid
 * (to ensure parallel execution is safe)
 *
 * Result: [result1, result2]
 */
export function parallel<A1, B1, A2, B2>(
  alg1: ClassifiedAlgebra<A1, B1>,
  alg2: ClassifiedAlgebra<A2, B2>
): ClassifiedAlgebra<A1 | A2, [B1, B2]> {
  // Type safety: Check that both are at least CommutativeMonoid
  if (!isAtLeast(alg1.class, 'CommutativeMonoid')) {
    throw new Error(
      `parallel requires CommutativeMonoid, but ${alg1.name} is ${alg1.class}`
    );
  }

  if (!isAtLeast(alg2.class, 'CommutativeMonoid')) {
    throw new Error(
      `parallel requires CommutativeMonoid, but ${alg2.name} is ${alg2.class}`
    );
  }

  const combinedFn: Algebra<A1 | A2, [B1, B2]> = (acc, val) => {
    return [
      alg1.fn(acc[0], val as A1),
      alg2.fn(acc[1], val as A2),
    ];
  };

  const identity = [alg1.properties.identity, alg2.properties.identity];

  // Manually construct (property detection doesn't work on composite types)
  const properties = {
    associative: alg1.properties.associative && alg2.properties.associative,
    commutative: alg1.properties.commutative && alg2.properties.commutative,
    identity,
    idempotent: alg1.properties.idempotent && alg2.properties.idempotent,
    hasInverse: alg1.properties.hasInverse && alg2.properties.hasInverse,
  };

  const algebraClass = classify(properties);
  const implications = deriveImplications(algebraClass, properties);

  return {
    name: `parallel(${alg1.name}, ${alg2.name})`,
    fn: combinedFn,
    properties,
    class: algebraClass,
    implications,
  };
}

/**
 * Conditional combinator: Choose algebra based on predicate
 *
 * Properties: Intersection of both branches
 * (result is only as strong as the weakest branch)
 */
export function conditional<A, B>(
  predicate: (val: A) => boolean,
  ifTrue: ClassifiedAlgebra<A, B>,
  ifFalse: ClassifiedAlgebra<A, B>
): ClassifiedAlgebra<A, B> {
  const combinedFn: Algebra<A, B> = (acc, val) => {
    return predicate(val)
      ? ifTrue.fn(acc, val)
      : ifFalse.fn(acc, val);
  };

  // Properties are intersection (weakest guarantees)
  const properties = {
    associative: ifTrue.properties.associative && ifFalse.properties.associative,
    commutative: ifTrue.properties.commutative && ifFalse.properties.commutative,
    identity:
      ifTrue.properties.identity === ifFalse.properties.identity
        ? ifTrue.properties.identity
        : null,
    idempotent: ifTrue.properties.idempotent && ifFalse.properties.idempotent,
    hasInverse: ifTrue.properties.hasInverse && ifFalse.properties.hasInverse,
  };

  // Manually construct classified algebra (skip auto-detection)
  const algebraClass = classify(properties);
  const implications = deriveImplications(algebraClass, properties);

  return {
    name: `conditional(${ifTrue.name}, ${ifFalse.name})`,
    fn: combinedFn,
    properties,
    class: algebraClass,
    implications,
  };
}

/**
 * Lift combinator: Transform values before applying algebra
 *
 * Properties: Preserved from original algebra
 * (transformation doesn't change algebraic properties)
 */
export function lift<A, B, C>(
  transform: (val: A) => C,
  algebra: ClassifiedAlgebra<C, B>
): ClassifiedAlgebra<A, B> {
  const combinedFn: Algebra<A, B> = (acc, val) => {
    return algebra.fn(acc, transform(val));
  };

  // Properties are preserved (transform doesn't affect algebra)
  return {
    name: `lift(f, ${algebra.name})`,
    fn: combinedFn,
    properties: algebra.properties,
    class: algebra.class,
    implications: algebra.implications,
  };
}

/**
 * Filter combinator: Only apply algebra when predicate is true
 *
 * Warning: May break associativity/commutativity depending on predicate
 */
export function filter<A, B>(
  predicate: (val: A) => boolean,
  algebra: ClassifiedAlgebra<A, B>
): ClassifiedAlgebra<A, B> {
  const combinedFn: Algebra<A, B> = (acc, val) => {
    return predicate(val)
      ? algebra.fn(acc, val)
      : acc;  // Skip if predicate false
  };

  // Properties may be broken by filtering
  // Conservative: assume only idempotence preserved
  return classifyAlgebra(`filter(p, ${algebra.name})`, combinedFn);
}

/**
 * Chain combinator: Apply algebras sequentially
 *
 * Warning: Result type of first must match accumulator type of second
 */
export function chain<A, B, C>(
  alg1: ClassifiedAlgebra<A, B>,
  alg2: ClassifiedAlgebra<B, C>
): ClassifiedAlgebra<A, C> {
  // This is tricky - we need to fold with alg1, then fold result with alg2
  // Not directly composable as Algebra<A, C>

  // Simplified: Assume we can convert B to A for second fold
  const combinedFn: Algebra<A, C> = (acc, val) => {
    const intermediate = alg1.fn(undefined as any, val);
    return alg2.fn(acc, intermediate as any);
  };

  return classifyAlgebra(`chain(${alg1.name}, ${alg2.name})`, combinedFn);
}

/**
 * Const combinator: Ignore values, always return constant
 *
 * Properties:
 * - Associative: ✅ (always returns same thing)
 * - Commutative: ✅ (ignores values)
 * - Identity: the constant itself
 * - Idempotent: ✅
 */
export function constant<A, B>(value: B): ClassifiedAlgebra<A, B> {
  const fn: Algebra<A, B> = (_acc, _val) => value;

  return classifyAlgebra('const', fn, {
    identityCandidates: [value],
  });
}

/**
 * Sum combinator: Combine results of multiple algebras
 *
 * Result: [result1, result2, ...]
 * Similar to parallel, but for N algebras
 */
export function sum<A, B>(
  ...algebras: ClassifiedAlgebra<A, B>[]
): ClassifiedAlgebra<A, B[]> {
  // Check all are at least Semigroup
  for (const alg of algebras) {
    if (!isAtLeast(alg.class, 'Semigroup')) {
      throw new Error(
        `sum requires at least Semigroup, but ${alg.name} is ${alg.class}`
      );
    }
  }

  const combinedFn: Algebra<A, B[]> = (acc, val) => {
    return algebras.map((alg, i) => alg.fn(acc[i], val));
  };

  const identities = algebras.map(alg => alg.properties.identity);

  return classifyAlgebra(
    `sum(${algebras.map(a => a.name).join(', ')})`,
    combinedFn,
    {
      identityCandidates: [identities],
    }
  );
}

/**
 * First combinator: Use first algebra, ignore rest
 *
 * Useful for providing fallback algebras
 */
export function first<A, B>(
  ...algebras: ClassifiedAlgebra<A, B>[]
): ClassifiedAlgebra<A, B> {
  if (algebras.length === 0) {
    throw new Error('first requires at least one algebra');
  }

  return algebras[0];
}

/**
 * Validate that an algebra has required class before use
 *
 * Throws if algebra doesn't meet requirements
 */
export function requireClass<A, B>(
  algebra: ClassifiedAlgebra<A, B>,
  requiredClass: AlgebraClass,
  operation: string
): void {
  if (!isAtLeast(algebra.class, requiredClass)) {
    throw new Error(
      `${operation} requires ${requiredClass}, but ${algebra.name} is ${algebra.class}`
    );
  }
}

/**
 * Safe parallel: Only compile if both algebras are CommutativeMonoid
 *
 * This is a type-level guarantee (would need TypeScript 4.9+ for full safety)
 */
export function safeParallel<A1, B1, A2, B2>(
  alg1: ClassifiedAlgebra<A1, B1>,
  alg2: ClassifiedAlgebra<A2, B2>
): ClassifiedAlgebra<A1 | A2, [B1, B2]> {
  requireClass(alg1, 'CommutativeMonoid', 'parallel');
  requireClass(alg2, 'CommutativeMonoid', 'parallel');

  return parallel(alg1, alg2);
}
