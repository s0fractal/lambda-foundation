/**
 * evolution/crossover.ts
 * Event 009: Crossover Operators for Morphism Breeding
 *
 * Combines two parent morphisms to create offspring with hybrid features.
 */

import type { EvolvableMorphism, Algebra, Coalgebra } from './operators.js';

// ============================================================================
// CROSSOVER STRATEGIES
// ============================================================================

/**
 * Crossover Strategy 1: Combine Algebras into State
 *
 * Takes two algebras and creates a new one that tracks both.
 * CRITICAL for discovering average from sum and count.
 *
 * Example:
 * - Parent1: sum = (acc, x) => acc + x
 * - Parent2: count = (acc, x) => acc + 1
 * - Child: (acc, x) => ({ sum: acc.sum + x, count: acc.count + 1 })
 */
export const combineAlgebras = <A>(
  parent1: EvolvableMorphism<A, number, any>,
  parent2: EvolvableMorphism<A, number, any>
): EvolvableMorphism<A, { sum: number; count: number }, any> => {
  const algebra1 = parent1.algebra;
  const algebra2 = parent2.algebra;

  // Create combined algebra
  const childAlgebra: Algebra<A, { sum: number; count: number }> = (acc, val) => {
    const sum = algebra1(acc.sum, val);
    const count = algebra2(acc.count, val);
    return { sum, count };
  };

  // Use parent1's coalgebra (they should be the same for hylo-based morphisms)
  const childCoalgebra = parent1.coalgebra;

  return {
    name: `${parent1.name}_×_${parent2.name}`,
    algebra: childAlgebra,
    coalgebra: childCoalgebra,
    init: { sum: parent1.init, count: parent2.init },
    metadata: {
      generation: Math.max(parent1.metadata?.generation || 0, parent2.metadata?.generation || 0) + 1,
      parents: [parent1.name, parent2.name],
      mutations: []
    }
  };
};

/**
 * Crossover Strategy 2: Inherit Best Algebra
 *
 * Takes the algebra from the fitter parent, coalgebra from the other.
 */
export const inheritBest = <A, B, C>(
  parent1: EvolvableMorphism<A, B, C>,
  parent2: EvolvableMorphism<A, B, C>,
  fitness1: number,
  fitness2: number
): EvolvableMorphism<A, B, C> => {
  const [betterParent, worseParent] = fitness1 > fitness2 ? [parent1, parent2] : [parent2, parent1];

  return {
    name: `${betterParent.name}_inherit`,
    algebra: betterParent.algebra,
    coalgebra: worseParent.coalgebra,  // Take coalgebra from other parent
    init: betterParent.init,
    seed: worseParent.seed,
    metadata: {
      generation: Math.max(parent1.metadata?.generation || 0, parent2.metadata?.generation || 0) + 1,
      parents: [parent1.name, parent2.name],
      mutations: []
    }
  };
};

/**
 * Crossover Strategy 3: Hybrid Algebra
 *
 * Creates a new algebra that alternates between parents based on input.
 */
export const hybridAlgebra = <A, B, C>(
  parent1: EvolvableMorphism<A, B, C>,
  parent2: EvolvableMorphism<A, B, C>
): EvolvableMorphism<A, B, C> => {
  const algebra1 = parent1.algebra;
  const algebra2 = parent2.algebra;

  // Hybrid: use parent1 for even indices, parent2 for odd
  let callCount = 0;
  const hybridAlgebra: Algebra<A, B> = (acc, val) => {
    const useParent1 = callCount % 2 === 0;
    callCount++;
    return useParent1 ? algebra1(acc, val) : algebra2(acc, val);
  };

  return {
    name: `${parent1.name}_hybrid_${parent2.name}`,
    algebra: hybridAlgebra,
    coalgebra: parent1.coalgebra,
    init: parent1.init,
    seed: parent1.seed,
    metadata: {
      generation: Math.max(parent1.metadata?.generation || 0, parent2.metadata?.generation || 0) + 1,
      parents: [parent1.name, parent2.name],
      mutations: []
    }
  };
};

/**
 * Crossover Strategy 4: Average Initialization
 *
 * Takes average of parent init values.
 */
export const averageInit = <A, B, C>(
  parent1: EvolvableMorphism<A, number, C>,
  parent2: EvolvableMorphism<A, number, C>
): EvolvableMorphism<A, number, C> => {
  const avgInit = ((parent1.init + parent2.init) / 2) as any;

  return {
    name: `${parent1.name}_avginit_${parent2.name}`,
    algebra: parent1.algebra,
    coalgebra: parent1.coalgebra,
    init: avgInit,
    seed: parent1.seed,
    metadata: {
      generation: Math.max(parent1.metadata?.generation || 0, parent2.metadata?.generation || 0) + 1,
      parents: [parent1.name, parent2.name],
      mutations: []
    }
  };
};

// ============================================================================
// RANDOM CROSSOVER
// ============================================================================

/**
 * Random crossover strategy selector
 */
export const crossoverRandom = <A, B, C>(
  parent1: EvolvableMorphism<A, B, C>,
  parent2: EvolvableMorphism<A, B, C>,
  fitness1: number = 0.5,
  fitness2: number = 0.5
): EvolvableMorphism<A, B, C> => {
  const strategies = [
    () => inheritBest(parent1, parent2, fitness1, fitness2),
    () => hybridAlgebra(parent1, parent2),
  ];

  const randomStrategy = strategies[Math.floor(Math.random() * strategies.length)];
  return randomStrategy();
};
