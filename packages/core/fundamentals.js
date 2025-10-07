// Fundamental morphisms - the basis of all computation

// Identity: α → α
export const IDENTITY = x => x;

// Composition: (β→γ) → (α→β) → (α→γ)
export const COMPOSE = f => g => x => f(g(x));

// Pairing: α → β → (α×β)
export const PAIR = a => b => f => f(a)(b);

// First projection: (α×β) → α
export const FST = p => p(x => y => x);

// Second projection: (α×β) → β
export const SND = p => p(x => y => y);

// Church Booleans
export const TRUE = x => y => x;
export const FALSE = x => y => y;

// Boolean operations
export const AND = p => q => p(q)(p);
export const OR = p => q => p(p)(q);
export const NOT = p => p(FALSE)(TRUE);

// Selection morphism
export const SELECT = pred => onTrue => onFalse => x =>
  pred(x) ? onTrue(x) : onFalse(x);

// Triple for more complex data
export const TRIPLE = a => b => c => f => f(a)(b)(c);
export const FIRST = t => t(x => y => z => x);
export const SECOND = t => t(x => y => z => y);
export const THIRD = t => t(x => y => z => z);