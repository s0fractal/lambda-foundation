/**
 * @lambda-foundation/self-modifying
 * Phase 5.2: Genetic Engine
 *
 * Enables morphisms to reproduce through crossover.
 * Not just evolution - speciation through combination.
 *
 * Co-authored by: Copilot + Claude + chaoshex
 */

import type { SelfModifyingMorphism, UsageHistory } from './types.js';
import { lineageTracker, recordCrossoverBirth } from './lineageTracker.js';
import { usageTracker } from './usageTracker.js';

/**
 * Fitness metrics for a morphism
 */
export interface FitnessScore {
  morphismId: string;

  // Performance metrics
  performance: number;    // 0-1 (based on latency, confidence)

  // Usage metrics
  popularity: number;     // 0-1 (based on usage count)

  // Trust metrics
  trust: number;          // 0-1 (validation success rate)

  // Age metrics
  age: number;            // 0-1 (proven over time)

  // Lineage metrics
  lineage: number;        // 0-1 (quality of ancestors)

  // Overall fitness (weighted average)
  overall: number;        // 0-1
}

/**
 * Crossover strategy
 */
export type CrossoverStrategy =
  | 'sequence'      // Chain: parent1 → parent2
  | 'parallel'      // Parallel: run both, merge results
  | 'conditional'   // If-else: parent1 or parent2 based on condition
  | 'hybrid';       // Mix: extract best parts of each

/**
 * Crossover result
 */
export interface CrossoverResult {
  offspring: SelfModifyingMorphism;
  strategy: CrossoverStrategy;
  parent1: string;
  parent2: string;
  expectedFitness: number;
  hybridFeatures: string[];
}

/**
 * Population of morphisms
 */
export interface Population {
  morphisms: SelfModifyingMorphism[];
  fitnessScores: Map<string, FitnessScore>;
  generation: number;
}

/**
 * Genetic configuration
 */
export interface GeneticConfig {
  populationSize: number;          // Max population size
  selectionPressure: number;       // 0-1 (higher = more elitist)
  crossoverRate: number;           // 0-1 (probability of breeding)
  mutationRate: number;            // 0-1 (probability of mutation)
  elitismCount: number;            // Top N to keep always

  // Fitness weights
  fitnessWeights: {
    performance: number;
    popularity: number;
    trust: number;
    age: number;
    lineage: number;
  };
}

export const DEFAULT_GENETIC_CONFIG: GeneticConfig = {
  populationSize: 10,
  selectionPressure: 0.7,
  crossoverRate: 0.8,
  mutationRate: 0.2,
  elitismCount: 2,

  fitnessWeights: {
    performance: 0.3,
    popularity: 0.25,
    trust: 0.25,
    age: 0.1,
    lineage: 0.1,
  },
};

/**
 * Genetic Engine - Breeding chamber for morphisms
 */
export class GeneticEngine {
  private config: GeneticConfig;

  constructor(config?: Partial<GeneticConfig>) {
    this.config = { ...DEFAULT_GENETIC_CONFIG, ...config };
  }

  /**
   * Calculate fitness score for a morphism
   */
  calculateFitness(morphism: SelfModifyingMorphism): FitnessScore {
    const history = usageTracker.getHistory(morphism.name);
    const stats = usageTracker.getStats(morphism.name);
    const birth = lineageTracker.getBirthRecord(morphism.name);

    // Performance: Based on latency and confidence
    let performance = 0;
    if (stats) {
      const latencyScore = Math.max(0, 1 - stats.averageLatency / 200);  // 0-200ms range
      const confidenceScore = stats.averageConfidence;
      performance = (latencyScore + confidenceScore) / 2;
    }

    // Popularity: Based on usage count
    let popularity = 0;
    if (stats) {
      popularity = Math.min(1, stats.totalUses / 100);  // Max at 100 uses
    }

    // Trust: Based on validation success
    let trust = 0.5;  // Default neutral
    if (birth?.validated) {
      trust = birth.validationConsensus ?? 0.5;
    }

    // Age: Morphisms proven over time get bonus
    let age = 0;
    if (birth) {
      const ageInDays = (Date.now() - birth.birthTime) / (1000 * 60 * 60 * 24);
      age = Math.min(1, ageInDays / 30);  // Max at 30 days
    }

    // Lineage: Quality of ancestors
    let lineage = 0.5;  // Default neutral
    const ancestors = lineageTracker.getAncestors(morphism.name);
    if (ancestors.length > 0) {
      // Average fitness of ancestors (if available)
      let ancestorFitnessSum = 0;
      let ancestorCount = 0;
      for (const ancestor of ancestors) {
        const ancestorBirth = lineageTracker.getBirthRecord(ancestor);
        if (ancestorBirth?.initialFitness) {
          ancestorFitnessSum += ancestorBirth.initialFitness;
          ancestorCount++;
        }
      }
      if (ancestorCount > 0) {
        lineage = ancestorFitnessSum / ancestorCount;
      }
    }

    // Overall: Weighted average
    const weights = this.config.fitnessWeights;
    const overall =
      performance * weights.performance +
      popularity * weights.popularity +
      trust * weights.trust +
      age * weights.age +
      lineage * weights.lineage;

    return {
      morphismId: morphism.name,
      performance,
      popularity,
      trust,
      age,
      lineage,
      overall,
    };
  }

  /**
   * Select parents for breeding (tournament selection)
   */
  selectParents(population: Population): [SelfModifyingMorphism, SelfModifyingMorphism] | null {
    if (population.morphisms.length < 2) return null;

    // Tournament selection: Pick random subset, choose best
    const tournamentSize = Math.max(2, Math.floor(population.morphisms.length * this.config.selectionPressure));

    const selectOne = (): SelfModifyingMorphism => {
      const tournament: SelfModifyingMorphism[] = [];
      for (let i = 0; i < tournamentSize; i++) {
        const random = population.morphisms[Math.floor(Math.random() * population.morphisms.length)];
        tournament.push(random);
      }

      // Return fittest from tournament
      return tournament.reduce((best, current) => {
        const bestFitness = population.fitnessScores.get(best.name)?.overall ?? 0;
        const currentFitness = population.fitnessScores.get(current.name)?.overall ?? 0;
        return currentFitness > bestFitness ? current : best;
      });
    };

    const parent1 = selectOne();
    let parent2 = selectOne();

    // Ensure different parents
    let attempts = 0;
    while (parent2.name === parent1.name && attempts < 10) {
      parent2 = selectOne();
      attempts++;
    }

    if (parent2.name === parent1.name) return null;

    return [parent1, parent2];
  }

  /**
   * Crossover two morphisms to create offspring
   */
  crossover(
    parent1: SelfModifyingMorphism,
    parent2: SelfModifyingMorphism,
    strategy: CrossoverStrategy = 'sequence'
  ): CrossoverResult {
    const offspringName = `${parent1.name}_x_${parent2.name}_${Date.now()}`;

    let offspringLogic: Function;
    let hybridFeatures: string[] = [];

    switch (strategy) {
      case 'sequence':
        // Chain: parent1 → parent2
        offspringLogic = (...args: any[]) => {
          const result1 = parent1.logic(...args);
          return parent2.logic(result1);
        };
        hybridFeatures = ['sequential_composition', 'pipeline'];
        break;

      case 'parallel':
        // Run both, merge results
        offspringLogic = (...args: any[]) => {
          const result1 = parent1.logic(...args);
          const result2 = parent2.logic(...args);

          // Merge strategy: prefer parent1's result if valid
          if (Array.isArray(result1) && Array.isArray(result2)) {
            return [...result1, ...result2];
          }
          return result1 ?? result2;
        };
        hybridFeatures = ['parallel_execution', 'result_merging'];
        break;

      case 'conditional':
        // If-else based on input
        offspringLogic = (...args: any[]) => {
          // Simple heuristic: use parent1 for small inputs, parent2 for large
          const inputSize = JSON.stringify(args).length;
          return inputSize < 100 ? parent1.logic(...args) : parent2.logic(...args);
        };
        hybridFeatures = ['conditional_logic', 'adaptive_selection'];
        break;

      case 'hybrid':
        // Mix: Extract features from both
        offspringLogic = (...args: any[]) => {
          // Use parent1's preprocessing, parent2's core logic
          const preprocessed = parent1.logic(...args);

          // If parent1 returns something, pass it to parent2
          if (preprocessed !== undefined && preprocessed !== null) {
            return parent2.logic(preprocessed);
          }

          // Otherwise, just use parent2
          return parent2.logic(...args);
        };
        hybridFeatures = ['hybrid_logic', 'feature_extraction', 'combined_processing'];
        break;
    }

    // Create offspring
    const offspring: SelfModifyingMorphism = {
      name: offspringName,
      version: 1,
      logic: offspringLogic,

      // Inherit self-modification capability (from parent with better fitness)
      selfModify: (history: UsageHistory) => {
        // Offspring can still self-modify (inherit from parent1)
        return parent1.selfModify(history);
      },

      metadata: {
        parents: [parent1.name, parent2.name],
        crossoverStrategy: strategy,
        birthTime: Date.now(),
        hybridFeatures,
      },
    };

    // Calculate expected fitness (average of parents)
    const parent1Fitness = this.calculateFitness(parent1).overall;
    const parent2Fitness = this.calculateFitness(parent2).overall;
    const expectedFitness = (parent1Fitness + parent2Fitness) / 2;

    return {
      offspring,
      strategy,
      parent1: parent1.name,
      parent2: parent2.name,
      expectedFitness,
      hybridFeatures,
    };
  }

  /**
   * Evolve population for one generation
   */
  evolveGeneration(population: Population): Population {
    const newGeneration: SelfModifyingMorphism[] = [];

    // Elitism: Keep top performers
    const sorted = [...population.morphisms].sort((a, b) => {
      const aFitness = population.fitnessScores.get(a.name)?.overall ?? 0;
      const bFitness = population.fitnessScores.get(b.name)?.overall ?? 0;
      return bFitness - aFitness;
    });

    const elite = sorted.slice(0, this.config.elitismCount);
    newGeneration.push(...elite);

    console.log(`\n[GeneticEngine] 🧬 Generation ${population.generation + 1}`);
    console.log(`   Elite preserved: ${elite.map(m => m.name).join(', ')}`);

    // Breeding: Fill remaining slots
    while (newGeneration.length < this.config.populationSize) {
      // Select parents
      const parents = this.selectParents(population);
      if (!parents) break;

      const [parent1, parent2] = parents;

      // Crossover?
      if (Math.random() < this.config.crossoverRate) {
        // Choose strategy based on parent characteristics
        const strategies: CrossoverStrategy[] = ['sequence', 'parallel', 'conditional', 'hybrid'];
        const strategy = strategies[Math.floor(Math.random() * strategies.length)];

        const result = this.crossover(parent1, parent2, strategy);
        newGeneration.push(result.offspring);

        // Record birth in lineage
        recordCrossoverBirth(
          result.offspring.name,
          parent1.name,
          parent2.name,
          result.expectedFitness
        );

        console.log(`   💕 Bred: ${parent1.name} × ${parent2.name} → ${result.offspring.name} (${strategy})`);
      } else {
        // No crossover, just copy parent
        newGeneration.push(parent1);
      }
    }

    // Calculate fitness for new generation
    const newFitnessScores = new Map<string, FitnessScore>();
    for (const morphism of newGeneration) {
      newFitnessScores.set(morphism.name, this.calculateFitness(morphism));
    }

    return {
      morphisms: newGeneration,
      fitnessScores: newFitnessScores,
      generation: population.generation + 1,
    };
  }

  /**
   * Get population statistics
   */
  getPopulationStats(population: Population): {
    averageFitness: number;
    maxFitness: number;
    minFitness: number;
    diversityScore: number;
  } {
    const fitnesses = Array.from(population.fitnessScores.values()).map(f => f.overall);

    const averageFitness = fitnesses.reduce((a, b) => a + b, 0) / fitnesses.length;
    const maxFitness = Math.max(...fitnesses);
    const minFitness = Math.min(...fitnesses);

    // Diversity: Standard deviation of fitness scores
    const variance = fitnesses.reduce((sum, f) => sum + (f - averageFitness) ** 2, 0) / fitnesses.length;
    const diversityScore = Math.sqrt(variance);

    return {
      averageFitness,
      maxFitness,
      minFitness,
      diversityScore,
    };
  }
}

/**
 * Global genetic engine instance
 */
export const geneticEngine = new GeneticEngine();

/**
 * Convenience functions
 */
export function calculateFitness(morphism: SelfModifyingMorphism): FitnessScore {
  return geneticEngine.calculateFitness(morphism);
}

export function crossover(
  parent1: SelfModifyingMorphism,
  parent2: SelfModifyingMorphism,
  strategy?: CrossoverStrategy
): CrossoverResult {
  return geneticEngine.crossover(parent1, parent2, strategy);
}

export function evolveGeneration(population: Population): Population {
  return geneticEngine.evolveGeneration(population);
}
