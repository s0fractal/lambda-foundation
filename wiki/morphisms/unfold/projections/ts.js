/**
 * unfold - Anamorphism (dual of fold)
 *
 * Platonic form: λf.λz.(λrec.λs. f s (λx.λs'. CONS x (rec s')) (λ.NIL)) Y z
 *
 * Creates a structure from a seed value by repeatedly applying a function
 * until a termination condition is met. Dual of fold (catamorphism).
 *
 * f :: b → Maybe (a, b)  -- returns [value, newSeed] or null to stop
 * z :: b                 -- initial seed
 * result :: [a]          -- generated list
 */
export const unfold = f => z => {
  const result = [];
  let state = z;
  while (true) {
    const next = f(state);
    if (next === null || next === undefined) break;
    const [value, newState] = next;
    result.push(value);
    state = newState;
  }
  return result;
};
