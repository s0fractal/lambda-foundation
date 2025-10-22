/**
 * map - Platonic projection to TypeScript
 *
 * Source of truth: ../map.λ (λf.λxs.FOLD (λx.λacc.CONS (f x) acc) NIL xs)
 *
 * Projection uses Array.prototype.map for simplicity.
 * Equivalent to: xs.reduce((acc, x) => [...acc, f(x)], [])
 *
 * Properties:
 * - Pure (if f is pure, map f is pure)
 * - Functor: satisfies identity and composition laws
 * - Natural transformation: preserves structure
 * - First Functor in λ-Foundation
 *
 * Functor Laws:
 * 1. map(identity) ≡ identity
 * 2. map(f ∘ g) ≡ map(f) ∘ map(g)
 *
 * @template A Input element type
 * @template B Output element type
 * @param {(a: A) => B} f - Transformation function
 * @param {A[]} xs - Input array
 * @returns {B[]} - Transformed array
 */
export const map = f => xs => xs.map(f);
