/**
 * evolution/evolve.ts
 * Event 009: Main Evolution Loop for Autonomous Discovery
 *
 * Complete genetic algorithm implementation that discovers new morphisms
 * while enforcing ≤2 Rule constraint.
 */

import type { EvolvableMorphism } from './operators.js';
import { mutateRandom, createStateAccumulator, addPostProcess } from './operators.js';
import { crossoverRandom, combineAlgebras } from './crossover.js';

// Import from geneticEngine for fitness calculation
import { measureComplexity, measurePurity } from '../geneticEngine.js';

// ============================================================================
// TYPES
// ============================================================================

export interface TestCase<Input, Output> {
  input: Input;
  expected: Output;
  description: string;
}

export interface EvolutionConfig {
  generations: number;
  populationSize: number;
  eliteSize: number;
  mutationRate: number;
  crossoverRate: number;

  weights: {
    purity: number;
    performance: number;
    simplicity: number;
    novelty: number;
    testsPassed: number;
  };
}

export interface FitnessResult {
  overall: number;
  purity: number;
  simplicity: number;
  testsPassed: number;
  performance: number;
  novelty: number;
  valid: boolean;
}

export interface EvolutionResult<A, B, C> {
  best: EvolvableMorphism<A, B, C> & { postProcess?: (result: B) => any };
  fitness: FitnessResult;
  generation: number;
  history: {
    generation: number;
    bestFitness: number;
    avgFitness: number;
  }[];
}

// ============================================================================
// FITNESS EVALUATION
// ============================================================================

/**
 * Evaluate fitness of a morphism against test cases
 */
const evaluateFitness = <A, B, C>(
  morphism: EvolvableMorphism<A, B, C> & { postProcess?: (result: B) => any },
  testCases: TestCase<C, any>[],
  population: EvolvableMorphism<A, B, C>[],
  config: EvolutionConfig
): FitnessResult => {
  // 1. Complexity (≤2 Rule enforcement)
  const complexity = measureComplexity(morphism.algebra);

  // CRITICAL: ≤2 Rule violation → fitness = 0
  if (!complexity.valid) {
    return {
      overall: 0,
      purity: 0,
      simplicity: 0,
      testsPassed: 0,
      performance: 0,
      novelty: 0,
      valid: false
    };
  }

  // 2. Purity
  const purity = measurePurity(morphism.algebra);

  // 3. Simplicity (from complexity score)
  const simplicity = complexity.score;

  // 4. Tests passed
  let passed = 0;
  let totalTime = 0;

  for (const testCase of testCases) {
    try {
      const start = Date.now();

      // Execute morphism (assuming hylo-like structure)
      let result: B = morphism.init;
      let state: C = testCase.input;

      // Run coalgebra until exhausted
      let iterations = 0;
      const maxIterations = 10000;

      while (iterations < maxIterations) {
        const next = morphism.coalgebra(state);
        if (next === null || next === undefined) break;

        const [val, newState] = next;
        result = morphism.algebra(result, val);
        state = newState;
        iterations++;
      }

      // Apply post-processing if exists
      const finalResult = morphism.postProcess ? morphism.postProcess(result) : result;

      const elapsed = Date.now() - start;
      totalTime += elapsed;

      // Check if result matches expected
      if (JSON.stringify(finalResult) === JSON.stringify(testCase.expected)) {
        passed++;
      }
    } catch (error) {
      // Test failed
    }
  }

  const testsPassed = testCases.length > 0 ? passed / testCases.length : 0;
  const performance = testCases.length > 0 ? Math.max(0, 1 - totalTime / (testCases.length * 100)) : 0.5;

  // 5. Novelty (distance from population)
  const novelty = calculateNovelty(morphism, population);

  // Overall fitness (weighted)
  const weights = config.weights;
  const overall =
    purity * weights.purity +
    simplicity * weights.simplicity +
    testsPassed * weights.testsPassed +
    performance * weights.performance +
    novelty * weights.novelty;

  return {
    overall,
    purity,
    simplicity,
    testsPassed,
    performance,
    novelty,
    valid: true
  };
};

/**
 * Calculate novelty (how different from population)
 */
const calculateNovelty = <A, B, C>(
  morphism: EvolvableMorphism<A, B, C>,
  population: EvolvableMorphism<A, B, C>[]
): number => {
  // Simple heuristic: if name is unique, novelty = 1
  const similarNames = population.filter(m => m.name.includes(morphism.name.split('_')[0]));
  return Math.max(0, 1 - similarNames.length / population.length);
};

// ============================================================================
// SELECTION
// ============================================================================

/**
 * Tournament selection
 */
const selectParent = <A, B, C>(
  population: Array<{ morphism: EvolvableMorphism<A, B, C>; fitness: FitnessResult }>,
  tournamentSize: number = 3
): EvolvableMorphism<A, B, C> => {
  // Pick random tournament
  const tournament: Array<{ morphism: EvolvableMorphism<A, B, C>; fitness: FitnessResult }> = [];
  for (let i = 0; i < tournamentSize; i++) {
    const random = population[Math.floor(Math.random() * population.length)];
    tournament.push(random);
  }

  // Return fittest
  tournament.sort((a, b) => b.fitness.overall - a.fitness.overall);
  return tournament[0].morphism;
};

// ============================================================================
// MAIN EVOLUTION LOOP
// ============================================================================

/**
 * Evolve population to discover new morphisms
 */
export const evolve = <A, B, C>(
  initialPopulation: EvolvableMorphism<A, B, C>[],
  config: EvolutionConfig,
  testCases: TestCase<C, any>[]
): EvolutionResult<A, B, C> => {
  console.log('\n🧬 Starting Evolution...');
  console.log(`Population: ${config.populationSize}, Generations: ${config.generations}`);
  console.log(`Elite: ${config.eliteSize}, Mutation: ${config.mutationRate}, Crossover: ${config.crossoverRate}`);
  console.log('');

  let population: EvolvableMorphism<A, B, C>[] = [...initialPopulation];

  // Expand to population size
  while (population.length < config.populationSize) {
    const random = population[Math.floor(Math.random() * population.length)];
    population.push({ ...random, name: `${random.name}_clone${population.length}` });
  }

  const history: { generation: number; bestFitness: number; avgFitness: number }[] = [];

  let bestEver: { morphism: EvolvableMorphism<A, B, C>; fitness: FitnessResult } | null = null;

  for (let gen = 0; gen < config.generations; gen++) {
    // Evaluate fitness
    const evaluated = population.map(morphism => ({
      morphism,
      fitness: evaluateFitness(morphism, testCases, population, config)
    }));

    // Sort by fitness
    evaluated.sort((a, b) => b.fitness.overall - a.fitness.overall);

    const bestThisGen = evaluated[0];
    const avgFitness = evaluated.reduce((sum, e) => sum + e.fitness.overall, 0) / evaluated.length;

    // Update best ever
    if (!bestEver || bestThisGen.fitness.overall > bestEver.fitness.overall) {
      bestEver = bestThisGen;
    }

    history.push({
      generation: gen,
      bestFitness: bestThisGen.fitness.overall,
      avgFitness
    });

    // Log progress
    if (gen % 10 === 0 || gen === config.generations - 1) {
      console.log(`Gen ${gen.toString().padStart(3)}: Best=${bestThisGen.fitness.overall.toFixed(3)} (${bestThisGen.morphism.name}), Avg=${avgFitness.toFixed(3)}, Tests=${bestThisGen.fitness.testsPassed.toFixed(2)}`);
    }

    // Check for convergence
    if (bestThisGen.fitness.testsPassed === 1.0 && bestThisGen.fitness.overall > 0.9) {
      console.log(`\n✨ Converged at generation ${gen}!`);
      break;
    }

    // Create next generation
    const nextGen: EvolvableMorphism<A, B, C>[] = [];

    // Elitism: keep top performers
    for (let i = 0; i < config.eliteSize && i < evaluated.length; i++) {
      nextGen.push(evaluated[i].morphism);
    }

    // Breed rest of population
    while (nextGen.length < config.populationSize) {
      const parent1 = selectParent(evaluated);
      const parent2 = selectParent(evaluated);

      let child: EvolvableMorphism<A, B, C>;

      // Crossover?
      if (Math.random() < config.crossoverRate) {
        const fitness1 = evaluated.find(e => e.morphism === parent1)?.fitness.overall || 0;
        const fitness2 = evaluated.find(e => e.morphism === parent2)?.fitness.overall || 0;
        child = crossoverRandom(parent1, parent2, fitness1, fitness2);
      } else {
        child = { ...parent1, name: `${parent1.name}_copy` };
      }

      // Mutation?
      if (Math.random() < config.mutationRate) {
        child = mutateRandom(child) as any;
      }

      nextGen.push(child);
    }

    population = nextGen;
  }

  console.log('\n✅ Evolution complete');
  console.log(`Best morphism: ${bestEver!.morphism.name}`);
  console.log(`Fitness: ${bestEver!.fitness.overall.toFixed(3)}`);
  console.log(`Tests passed: ${(bestEver!.fitness.testsPassed * 100).toFixed(1)}%`);
  console.log('');

  return {
    best: bestEver!.morphism,
    fitness: bestEver!.fitness,
    generation: history.length - 1,
    history
  };
};
