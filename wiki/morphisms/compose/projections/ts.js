/**
 * compose - Platonic projection to TypeScript
 *
 * Source of truth: ../compose.λ (λf.λg.λx.f(g(x)))
 *
 * Properties:
 * - Pure (referentially transparent)
 * - Associative: (f ∘ g) ∘ h ≡ f ∘ (g ∘ h)
 * - Identity is neutral: f ∘ identity ≡ identity ∘ f ≡ f
 * - Defines Category of functions
 *
 * @template A Input type
 * @template B Intermediate type
 * @template C Output type
 * @param {(b: B) => C} f - Outer transformation
 * @param {(a: A) => B} g - Inner transformation
 * @returns {(x: A) => C} - Composed function
 */
export const compose = f => g => x => f(g(x));
