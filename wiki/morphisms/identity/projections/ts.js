/**
 * identity - Platonic projection to TypeScript
 *
 * Source of truth: ../identity.λ (λx.x)
 *
 * Properties:
 * - Pure (referentially transparent)
 * - Total (defined for all inputs)
 * - Neutral element of composition
 *
 * @template T
 * @param {T} x - Any value
 * @returns {T} - The same value unchanged
 */
export const identity = x => x;
