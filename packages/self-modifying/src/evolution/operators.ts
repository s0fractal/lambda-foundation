/**
 * evolution/operators.ts
 * Event 009: Mutation Operators for Autonomous Discovery
 *
 * Real mutation operators that transform algebras and coalgebras
 * while maintaining ≤2 Rule constraint.
 */

/**
 * Algebra: (B, A) => B
 * Example: (acc, x) => acc + x
 */
export type Algebra<A, B> = (acc: B, val: A) => B;

/**
 * Coalgebra: (C) => [A, C] | null
 * Example: (n) => n > 0 ? [n, n-1] : null
 */
export type Coalgebra<A, C> = (state: C) => [A, C] | null;

/**
 * Morphism representation for evolution
 */
export interface EvolvableMorphism<A, B, C> {
  name: string;
  algebra: Algebra<A, B>;
  coalgebra: Coalgebra<A, C>;
  init: B;
  seed?: C;
  metadata?: {
    generation?: number;
    parents?: string[];
    mutations?: string[];
  };
}

// ============================================================================
// MUTATION OPERATORS
// ============================================================================

/**
 * Mutation Type 1: Perturb Algebra
 *
 * Changes the algebra operation while maintaining ≤2 Rule.
 * Examples:
 * - (acc, x) => acc + x  →  (acc, x) => acc + x * 2
 * - (acc, x) => acc + x  →  (acc, x) => acc * x
 */
export const perturbAlgebra = <A, B>(
  morphism: EvolvableMorphism<A, B, any>,
  perturbationType: 'multiply' | 'divide' | 'power' | 'negate'
): EvolvableMorphism<A, B, any> => {
  const oldAlgebra = morphism.algebra;

  let newAlgebra: Algebra<A, B>;

  switch (perturbationType) {
    case 'multiply':
      // acc + x → acc + x * 2
      newAlgebra = (acc: B, val: A) => {
        // Heuristic: try to double the contribution
        if (typeof val === 'number') {
          return oldAlgebra(acc, (val * 2) as A);
        }
        return oldAlgebra(acc, val);
      };
      break;

    case 'divide':
      // acc + x → acc + x / 2
      newAlgebra = (acc: B, val: A) => {
        if (typeof val === 'number') {
          return oldAlgebra(acc, (val / 2) as A);
        }
        return oldAlgebra(acc, val);
      };
      break;

    case 'power':
      // acc + x → acc + x^2
      newAlgebra = (acc: B, val: A) => {
        if (typeof val === 'number') {
          return oldAlgebra(acc, (val ** 2) as A);
        }
        return oldAlgebra(acc, val);
      };
      break;

    case 'negate':
      // acc + x → acc - x (by negating x)
      newAlgebra = (acc: B, val: A) => {
        if (typeof val === 'number') {
          return oldAlgebra(acc, (-val) as A);
        }
        return oldAlgebra(acc, val);
      };
      break;
  }

  return {
    ...morphism,
    algebra: newAlgebra,
    name: `${morphism.name}_${perturbationType}`,
    metadata: {
      ...morphism.metadata,
      mutations: [...(morphism.metadata?.mutations || []), `algebra_${perturbationType}`]
    }
  };
};

/**
 * Mutation Type 2: Mutate Init Value
 *
 * Changes the initial accumulator value.
 * Examples:
 * - init: 0  →  init: 1
 * - init: 1  →  init: 10
 */
export const mutateInit = <A, B, C>(
  morphism: EvolvableMorphism<A, B, C>,
  strategy: 'increment' | 'multiply' | 'negate' | 'identity'
): EvolvableMorphism<A, B, C> => {
  const oldInit = morphism.init;
  let newInit: B;

  if (typeof oldInit === 'number') {
    switch (strategy) {
      case 'increment':
        newInit = (oldInit + 1) as B;
        break;
      case 'multiply':
        newInit = (oldInit * 10) as B;
        break;
      case 'negate':
        newInit = (-oldInit) as B;
        break;
      case 'identity':
        newInit = (oldInit === 0 ? 1 : 0) as B;
        break;
      default:
        newInit = oldInit;
    }
  } else {
    newInit = oldInit;
  }

  return {
    ...morphism,
    init: newInit,
    name: `${morphism.name}_init${strategy}`,
    metadata: {
      ...morphism.metadata,
      mutations: [...(morphism.metadata?.mutations || []), `init_${strategy}`]
    }
  };
};

/**
 * Mutation Type 3: Create State Accumulator
 *
 * Transforms scalar accumulator into object accumulator.
 * CRITICAL for discovering average from sum.
 *
 * Example:
 * - (acc: number, x) => acc + x
 * → (acc: {sum: number, count: number}, x) => ({sum: acc.sum + x, count: acc.count + 1})
 */
export const createStateAccumulator = (
  morphism: EvolvableMorphism<number, number, any>
): EvolvableMorphism<number, { sum: number; count: number }, any> => {
  const oldAlgebra = morphism.algebra;

  // New algebra that tracks both sum and count
  const newAlgebra: Algebra<number, { sum: number; count: number }> = (acc, x) => {
    // Apply old algebra to get sum contribution
    const newSum = oldAlgebra(acc.sum, x);

    return {
      sum: newSum,
      count: acc.count + 1
    };
  };

  return {
    ...morphism,
    algebra: newAlgebra as any,
    init: { sum: morphism.init as number, count: 0 } as any,
    name: `${morphism.name}_stateful`,
    metadata: {
      ...morphism.metadata,
      mutations: [...(morphism.metadata?.mutations || []), 'create_state_accumulator']
    }
  };
};

/**
 * Mutation Type 4: Post-Process Result
 *
 * Adds a post-processing step to the morphism result.
 * CRITICAL for average: {sum, count} → sum/count
 */
export const addPostProcess = <A, B, C, R>(
  morphism: EvolvableMorphism<A, B, C>,
  postProcess: (result: B) => R,
  postProcessName: string
): EvolvableMorphism<A, B, C> & { postProcess: (result: B) => R } => {
  return {
    ...morphism,
    postProcess,
    name: `${morphism.name}_${postProcessName}`,
    metadata: {
      ...morphism.metadata,
      mutations: [...(morphism.metadata?.mutations || []), `post_${postProcessName}`]
    }
  };
};

/**
 * Random mutation selector
 */
export const mutateRandom = <A, B, C>(
  morphism: EvolvableMorphism<A, B, C>
): EvolvableMorphism<A, B, C> => {
  const strategies = ['multiply', 'divide', 'power', 'negate'] as const;
  const randomStrategy = strategies[Math.floor(Math.random() * strategies.length)];

  return perturbAlgebra(morphism, randomStrategy) as EvolvableMorphism<A, B, C>;
};

// ============================================================================
// HELPER: Apply mutations chain
// ============================================================================

/**
 * Apply sequence of mutations
 */
export const applyMutations = <A, B, C>(
  morphism: EvolvableMorphism<A, B, C>,
  mutations: ((m: any) => any)[]
): EvolvableMorphism<A, B, C> => {
  return mutations.reduce((m, mutation) => mutation(m), morphism);
};
