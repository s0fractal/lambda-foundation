/**
 * hylo - Hylomorphism (fusion of catamorphism and anamorphism)
 *
 * Platonic form: λphi.λpsi.λz.λinit.(λrec.λstate. psi state (λval.λnewState. phi val (rec newState)) (λ.init)) Y z
 *
 * Transforms value through create-consume cycle WITHOUT materializing intermediate structure.
 * This is deforestation: the "tree" (list) never exists in memory.
 *
 * phi  :: a → b → b           -- algebra (fold function)
 * psi  :: c → Maybe (a, c)    -- coalgebra (unfold function)
 * z    :: c                   -- initial seed
 * init :: b                   -- initial accumulator
 * result :: b                 -- final value
 *
 * Fusion law: hylo phi psi z init ≡ fold phi init (unfold psi z)
 * BUT: hylo is O(1) space, fold ∘ unfold is O(n) space
 */
export const hylo = phi => psi => z => init => {
  const rec = state => {
    const next = psi(state);
    if (next === null || next === undefined) return init;
    const [val, newState] = next;
    return phi(val)(rec(newState));
  };
  return rec(z);
};
