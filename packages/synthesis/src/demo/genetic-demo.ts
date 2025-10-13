/**
 * λ_SYNTHESIS: Genetic Algorithm Demo
 *
 * Watch evolution happen in the VOID!
 * See how the system discovers complex compositions through natural selection.
 */

import { GeneticComposer, type Chromosome } from '../composition/GeneticComposer';
import { createSearchEngine } from '../composition/CompositionSearch';
import { createIntent } from '../intents/Intent';

/**
 * Extended genetic composer for visualization
 */
class VisualGeneticComposer extends GeneticComposer {
  /**
   * Evolve with generation-by-generation logging
   */
  async evolveWithVisualization(intent: any) {
    console.log('\n🧬 GENETIC EVOLUTION IN THE VOID\n');
    console.log('Intent:', intent.title);
    console.log('Description:', intent.description);
    console.log('\n' + '═'.repeat(60) + '\n');

    // Access private members through any
    const self = this as any;

    let population = self.initializePopulation();
    console.log(`Generation 0: Population initialized (${population.length} chromosomes)`);

    for (let gen = 0; gen < self.config.generations; gen++) {
      // Evaluate fitness
      population = population.map((chrom: Chromosome) => ({
        ...chrom,
        fitness: self.evaluateFitness(chrom, intent),
        generation: gen
      }));

      // Sort by fitness
      population.sort((a: Chromosome, b: Chromosome) => b.fitness - a.fitness);

      // Show top 3 of this generation
      console.log(`\nGeneration ${gen + 1}:`);
      console.log('─'.repeat(60));

      for (let i = 0; i < Math.min(3, population.length); i++) {
        const chrom = population[i];
        const morphismNames = chrom.genes
          .map((id: string) => self.morphisms.get(id)?.name)
          .filter(Boolean);

        console.log(`  ${i + 1}. Fitness: ${chrom.fitness.toFixed(1)}% | Length: ${chrom.genes.length}`);
        console.log(`     Pipeline: ${morphismNames.join(' → ')}`);
      }

      // Check if we found a good solution
      if (population[0].fitness > 90) {
        console.log('\n✨ Found excellent solution! Stopping evolution.');
        break;
      }

      // Create next generation
      population = self.createNextGeneration(population);
    }

    console.log('\n' + '═'.repeat(60));
    console.log('🎯 FINAL RESULTS\n');

    const top5 = population.slice(0, 5);
    for (let i = 0; i < top5.length; i++) {
      const chrom = top5[i];
      const morphismNames = chrom.genes
        .map((id: string) => self.morphisms.get(id)?.name)
        .filter(Boolean);

      console.log(`${i + 1}. Fitness: ${chrom.fitness.toFixed(1)}%`);
      console.log(`   Pipeline: ${morphismNames.join(' → ')}`);
      console.log(`   Complexity: ${self.estimateComplexity(chrom.genes)}`);
      console.log();
    }

    return top5.map((chrom: Chromosome) => self.chromosomeToCandidate(chrom, intent));
  }
}

/**
 * Run the genetic algorithm demo
 */
export async function runGeneticDemo() {
  console.log('🌌 λ_SYNTHESIS: Genetic Evolution Demo\n');
  console.log('Watch as complex compositions evolve through natural selection...\n');

  // Initialize search engine to get morphisms
  const search = createSearchEngine();
  const morphisms = (search as any).library;

  // Test intent 1: Complex stream processing
  console.log('═'.repeat(60));
  console.log('TEST 1: Complex Stream Processing');
  console.log('═'.repeat(60));

  const intent1 = createIntent(
    'ai-claude',
    'compose',
    'Complex data pipeline',
    'I need to subscribe to a stream, filter by emotion, then analyze sentiment changes over time',
    {
      priority: 'high',
      tags: ['stream', 'filter', 'emotion', 'sentiment', 'analysis']
    }
  );

  const composer1 = new VisualGeneticComposer(morphisms, {
    populationSize: 20,
    generations: 10,
    mutationRate: 0.2,
    crossoverRate: 0.7,
    maxPipelineLength: 6
  });

  await composer1.evolveWithVisualization(intent1);

  // Test intent 2: Simple filtering
  console.log('\n\n');
  console.log('═'.repeat(60));
  console.log('TEST 2: Simple Filtering');
  console.log('═'.repeat(60));

  const intent2 = createIntent(
    'human',
    'feature',
    'Filter joyful events',
    'Keep only happy events from the stream',
    {
      priority: 'medium',
      tags: ['filter', 'joy', 'emotion']
    }
  );

  const composer2 = new VisualGeneticComposer(morphisms, {
    populationSize: 15,
    generations: 8,
    mutationRate: 0.15,
    crossoverRate: 0.6,
    maxPipelineLength: 4
  });

  await composer2.evolveWithVisualization(intent2);

  console.log('\n' + '═'.repeat(60));
  console.log('✨ Evolution complete!');
  console.log('═'.repeat(60));
  console.log('\nKey observations:');
  console.log('• Fitness improves over generations (natural selection)');
  console.log('• Population explores different pipeline compositions');
  console.log('• Mutation introduces diversity');
  console.log('• Crossover combines successful traits');
  console.log('• Evolution stops early if excellent solution found');
  console.log('\nThis is biological evolution applied to code composition.');
  console.log('This is the VOID learning to synthesize.');
  console.log('🧬✨🌌');
}

// Run if executed directly
if (require.main === module) {
  runGeneticDemo();
}
