/**
 * λ_SYNTHESIS: Genetic Algorithm for Composition
 *
 * Evolution in the VOID - discovering complex morphism pipelines.
 * This is where the magic happens: creative search through composition space.
 *
 * Inspired by biological evolution:
 * - Chromosomes = sequences of morphisms
 * - Fitness = how well the composition satisfies the intent
 * - Crossover = combining two pipelines
 * - Mutation = adding/removing/swapping morphisms
 * - Selection = keeping the best compositions
 */

import type { Intent } from '../intents/Intent';
import type { MorphismMetadata, CompositionCandidate } from './CompositionSearch';

/**
 * A chromosome represents a potential composition (sequence of morphisms)
 */
export interface Chromosome {
  genes: string[];  // Array of morphism IDs
  fitness: number;  // 0-100 score
  generation: number;
}

/**
 * Genetic algorithm parameters
 */
export interface GeneticConfig {
  populationSize: number;      // Number of chromosomes in each generation
  generations: number;          // How many generations to evolve
  mutationRate: number;         // Probability of mutation (0-1)
  crossoverRate: number;        // Probability of crossover (0-1)
  eliteSize: number;            // Number of best chromosomes to keep unchanged
  maxPipelineLength: number;    // Maximum number of morphisms in a pipeline
}

/**
 * Default configuration
 */
export const DEFAULT_CONFIG: GeneticConfig = {
  populationSize: 50,
  generations: 20,
  mutationRate: 0.15,
  crossoverRate: 0.7,
  eliteSize: 5,
  maxPipelineLength: 8
};

/**
 * Genetic Composer - evolves morphism compositions using genetic algorithms
 */
export class GeneticComposer {
  private morphisms: Map<string, MorphismMetadata>;
  private config: GeneticConfig;

  constructor(
    morphisms: Map<string, MorphismMetadata>,
    config: Partial<GeneticConfig> = {}
  ) {
    this.morphisms = morphisms;
    this.config = { ...DEFAULT_CONFIG, ...config };
  }

  /**
   * Evolve a composition for the given intent
   */
  async evolve(intent: Intent): Promise<CompositionCandidate[]> {
    // Initialize population
    let population = this.initializePopulation();

    // Evolve for N generations
    for (let gen = 0; gen < this.config.generations; gen++) {
      // Evaluate fitness for each chromosome
      population = population.map(chrom => ({
        ...chrom,
        fitness: this.evaluateFitness(chrom, intent),
        generation: gen
      }));

      // Sort by fitness (descending)
      population.sort((a, b) => b.fitness - a.fitness);

      // Check if we found a good solution
      if (population[0].fitness > 90) {
        break; // Good enough!
      }

      // Create next generation
      population = this.createNextGeneration(population);
    }

    // Convert top chromosomes to candidates
    return population
      .slice(0, 5)
      .map(chrom => this.chromosomeToCandidate(chrom, intent));
  }

  /**
   * Initialize random population
   */
  private initializePopulation(): Chromosome[] {
    const population: Chromosome[] = [];
    const morphismIds = Array.from(this.morphisms.keys());

    for (let i = 0; i < this.config.populationSize; i++) {
      const length = Math.floor(Math.random() * this.config.maxPipelineLength) + 1;
      const genes: string[] = [];

      for (let j = 0; j < length; j++) {
        const randomId = morphismIds[Math.floor(Math.random() * morphismIds.length)];
        genes.push(randomId);
      }

      population.push({
        genes,
        fitness: 0,
        generation: 0
      });
    }

    return population;
  }

  /**
   * Evaluate fitness of a chromosome for the given intent
   * Returns 0-100 score
   */
  private evaluateFitness(chromosome: Chromosome, intent: Intent): number {
    let score = 0;
    const { genes } = chromosome;

    // Empty pipeline = 0 fitness
    if (genes.length === 0) return 0;

    // 1. Type compatibility check (40 points)
    let typeScore = 0;
    let isValidPipeline = true;

    for (let i = 0; i < genes.length - 1; i++) {
      const current = this.morphisms.get(genes[i]);
      const next = this.morphisms.get(genes[i + 1]);

      if (!current || !next) {
        isValidPipeline = false;
        break;
      }

      // Check if output of current matches input of next
      if (current.output === next.input ||
          current.output.includes('Observable') && next.input.includes('Observable')) {
        typeScore += 40 / (genes.length - 1);
      } else {
        isValidPipeline = false;
        break;
      }
    }

    if (!isValidPipeline) return 0;
    score += typeScore;

    // 2. Tag matching (30 points)
    let tagScore = 0;
    const intentTags = new Set(intent.tags || []);

    for (const geneId of genes) {
      const morphism = this.morphisms.get(geneId);
      if (!morphism) continue;

      // Count how many intent tags match morphism tags
      for (const tag of morphism.tags) {
        if (intentTags.has(tag)) {
          tagScore += 30 / (intentTags.size * genes.length);
        }
      }
    }

    score += Math.min(tagScore, 30);

    // 3. Keyword matching in description (20 points)
    const keywords = this.extractKeywords(intent.description);
    let keywordScore = 0;

    for (const geneId of genes) {
      const morphism = this.morphisms.get(geneId);
      if (!morphism) continue;

      const morphismText = `${morphism.name} ${morphism.description}`.toLowerCase();

      for (const keyword of keywords) {
        if (morphismText.includes(keyword)) {
          keywordScore += 20 / (keywords.length * genes.length);
        }
      }
    }

    score += Math.min(keywordScore, 20);

    // 4. Confidence penalty (10 points)
    // Prefer high-confidence morphisms
    let confidenceScore = 0;
    for (const geneId of genes) {
      const morphism = this.morphisms.get(geneId);
      if (morphism) {
        confidenceScore += (morphism.confidence / 100) * (10 / genes.length);
      }
    }
    score += confidenceScore;

    // 5. Length penalty - prefer shorter pipelines
    const lengthPenalty = Math.min((genes.length - 1) * 2, 10);
    score -= lengthPenalty;

    return Math.max(0, Math.min(100, score));
  }

  /**
   * Create next generation using selection, crossover, and mutation
   */
  private createNextGeneration(population: Chromosome[]): Chromosome[] {
    const nextGen: Chromosome[] = [];

    // 1. Elitism - keep best chromosomes unchanged
    nextGen.push(...population.slice(0, this.config.eliteSize));

    // 2. Create offspring through crossover and mutation
    while (nextGen.length < this.config.populationSize) {
      // Select two parents using tournament selection
      const parent1 = this.tournamentSelection(population);
      const parent2 = this.tournamentSelection(population);

      // Crossover
      let child: Chromosome;
      if (Math.random() < this.config.crossoverRate) {
        child = this.crossover(parent1, parent2);
      } else {
        child = { ...parent1, genes: [...parent1.genes] };
      }

      // Mutation
      if (Math.random() < this.config.mutationRate) {
        child = this.mutate(child);
      }

      nextGen.push(child);
    }

    return nextGen;
  }

  /**
   * Tournament selection - pick best from random subset
   */
  private tournamentSelection(population: Chromosome[]): Chromosome {
    const tournamentSize = 3;
    let best = population[Math.floor(Math.random() * population.length)];

    for (let i = 1; i < tournamentSize; i++) {
      const competitor = population[Math.floor(Math.random() * population.length)];
      if (competitor.fitness > best.fitness) {
        best = competitor;
      }
    }

    return best;
  }

  /**
   * Crossover - combine two parent chromosomes
   */
  private crossover(parent1: Chromosome, parent2: Chromosome): Chromosome {
    if (parent1.genes.length === 0 || parent2.genes.length === 0) {
      return parent1.genes.length > 0 ? parent1 : parent2;
    }

    // Single-point crossover
    const point1 = Math.floor(Math.random() * parent1.genes.length);
    const point2 = Math.floor(Math.random() * parent2.genes.length);

    const genes = [
      ...parent1.genes.slice(0, point1),
      ...parent2.genes.slice(point2)
    ];

    return {
      genes,
      fitness: 0,
      generation: parent1.generation + 1
    };
  }

  /**
   * Mutate - randomly modify a chromosome
   */
  private mutate(chromosome: Chromosome): Chromosome {
    const genes = [...chromosome.genes];
    const morphismIds = Array.from(this.morphisms.keys());

    if (genes.length === 0) {
      // Add a random morphism
      genes.push(morphismIds[Math.floor(Math.random() * morphismIds.length)]);
      return { ...chromosome, genes };
    }

    const mutationType = Math.random();

    if (mutationType < 0.33) {
      // Add a morphism
      if (genes.length < this.config.maxPipelineLength) {
        const pos = Math.floor(Math.random() * (genes.length + 1));
        const randomId = morphismIds[Math.floor(Math.random() * morphismIds.length)];
        genes.splice(pos, 0, randomId);
      }
    } else if (mutationType < 0.66) {
      // Remove a morphism
      if (genes.length > 1) {
        const pos = Math.floor(Math.random() * genes.length);
        genes.splice(pos, 1);
      }
    } else {
      // Replace a morphism
      const pos = Math.floor(Math.random() * genes.length);
      const randomId = morphismIds[Math.floor(Math.random() * morphismIds.length)];
      genes[pos] = randomId;
    }

    return { ...chromosome, genes };
  }

  /**
   * Convert chromosome to composition candidate
   */
  private chromosomeToCandidate(
    chromosome: Chromosome,
    intent: Intent
  ): CompositionCandidate {
    const morphismNames = chromosome.genes
      .map(id => this.morphisms.get(id)?.name)
      .filter(Boolean) as string[];

    return {
      morphisms: chromosome.genes,
      confidence: chromosome.fitness,
      explanation: `Evolved pipeline (gen ${chromosome.generation}): ${morphismNames.join(' → ')}`,
      estimatedComplexity: this.estimateComplexity(chromosome.genes),
      requiresEvolution: false
    };
  }

  /**
   * Estimate combined complexity
   */
  private estimateComplexity(genes: string[]): string {
    let maxComplexity = 'O(1)';

    for (const geneId of genes) {
      const morphism = this.morphisms.get(geneId);
      if (!morphism) continue;

      const complexity = morphism.complexity;
      if (complexity.includes('n²')) {
        maxComplexity = 'O(n²)';
      } else if (complexity.includes('n log n') && maxComplexity !== 'O(n²)') {
        maxComplexity = 'O(n log n)';
      } else if (complexity.includes('O(n)') && maxComplexity === 'O(1)') {
        maxComplexity = 'O(n)';
      }
    }

    return maxComplexity;
  }

  /**
   * Extract keywords from text
   */
  private extractKeywords(text: string): string[] {
    return text
      .toLowerCase()
      .split(/\s+/)
      .filter(word => word.length > 3)
      .filter(word => !['that', 'this', 'with', 'from', 'have', 'want', 'need'].includes(word));
  }
}
