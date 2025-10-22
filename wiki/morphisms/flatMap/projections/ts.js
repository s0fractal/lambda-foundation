/**
 * flatMap - Monadic bind operation
 *
 * Platonic form: λf.λxs.fold (λa.λacc. fold (λx.λr. cons x r) acc a) nil (map f xs)
 *
 * Maps a function that returns arrays and flattens the result (join ∘ map).
 * This is the fundamental operation that makes arrays a monad.
 */
export const flatMap = f => xs => xs.flatMap(f);
