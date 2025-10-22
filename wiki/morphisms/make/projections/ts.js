/**
 * make - Morphism Factory (Meta-morphisms)
 *
 * Platonic forms:
 *   makeFold = λalg.λinit.λxs.fold alg init xs
 *   makeUnfold = λcoalg.λseed.unfold coalg seed
 *   makeHylo = λalg.λcoalg.λseed.λinit.hylo alg coalg seed init
 *
 * Meta-morphisms that generate other morphisms from parameters.
 * This is μορφογένεσις (morphogenesis) — the birth of forms.
 */

import { fold } from '../../fold/projections/ts.js';
import { unfold } from '../../unfold/projections/ts.js';
import { hylo } from '../../hylo/projections/ts.js';

/**
 * makeFold: Creates a fold morphism with fixed algebra and init
 *
 * Type: (b → a → b) → b → ([a] → b)
 */
export const makeFold = alg => init => xs => fold(alg)(init)(xs);

/**
 * makeUnfold: Creates an unfold morphism with fixed coalgebra
 *
 * Type: (c → Maybe (a, c)) → (c → [a])
 */
export const makeUnfold = coalg => seed => unfold(coalg)(seed);

/**
 * makeHylo: Creates a hylo morphism with fixed algebra and coalgebra
 *
 * Type: (b → a → b) → (c → Maybe (a, c)) → (c → b → b)
 */
export const makeHylo = alg => coalg => seed => init => hylo(alg)(coalg)(seed)(init);
