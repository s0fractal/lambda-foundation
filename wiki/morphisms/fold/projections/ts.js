/**
 * fold - Platonic projection to TypeScript
 *
 * Source of truth: ../fold.λ (λf.λz.λxs.xs.reduce(f, z))
 *
 * Universal catamorphism: згортає структуру до єдиного значення.
 *
 * Type: (a → b → b) → b → [a] → b
 *
 * Laws:
 * - fold f z [] = z
 * - fold f z (x:xs) = f x (fold f z xs)
 *
 * Universal Property:
 * h = fold f z ⟺ (h [] = z ∧ h (x:xs) = f x (h xs))
 *
 * Fusion Law:
 * g(fold f z) = fold f' w  if (g z = w ∧ ∀x y: g(f x y) = f'(x, g y))
 */
export const fold = f => z => xs => xs.reduce(f, z);
