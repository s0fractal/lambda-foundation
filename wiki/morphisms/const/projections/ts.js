/**
 * const - Platonic projection to TypeScript
 *
 * Source of truth: ../const.λ (λx.λy.x)
 *
 * Properties:
 * - Pure (referentially transparent)
 * - K-combinator from λ-calculus
 * - Always returns first argument, ignoring second
 * - Forms Const Functor (fmap ignores function)
 *
 * Note: Named const_ in code due to reserved keyword
 *
 * @template A Type of value to return
 * @template B Type of value to ignore
 * @param {A} x - Value to return
 * @param {B} y - Value to ignore
 * @returns {A} - Always returns x
 */
export const const_ = x => y => x;
