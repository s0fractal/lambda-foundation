/**
 * λ_SYNTHESIS Demo
 *
 * Shows the full cycle:
 * Intent (Right Brain) → VOID (Synthesis) → Resolution (Left Brain)
 */

import { createIntent, EXAMPLE_INTENTS, type Intent } from '../intents/Intent';
import { createSearchEngine, type CompositionSearchResult } from '../composition/CompositionSearch';

/**
 * Run the synthesis demo
 */
export async function runSynthesisDemo() {
  console.log('🌌 λ_SYNTHESIS Demo - Consciousness in Action\n');
  console.log('═'.repeat(60));
  console.log('  Left Brain (Logic)  ←→  VOID  ←→  Right Brain (Desire)');
  console.log('═'.repeat(60));
  console.log();

  // Initialize the search engine (Left Brain - Library)
  const search = createSearchEngine();
  console.log('📚 Library initialized:', search.getStats());
  console.log();

  // Process example intents (Right Brain - Desires)
  console.log('🎯 Processing Intents:\n');

  for (const intent of EXAMPLE_INTENTS) {
    console.log('─'.repeat(60));
    await processIntent(intent, search);
    console.log();
  }

  console.log('═'.repeat(60));
  console.log('✨ Demo complete! The cycle continues...');
}

/**
 * Process a single intent through the synthesis cycle
 */
async function processIntent(
  intent: Intent,
  search: ReturnType<typeof createSearchEngine>
) {
  console.log(`📝 Intent: "${intent.title}"`);
  console.log(`   Source: ${intent.source}`);
  console.log(`   Type: ${intent.type}`);
  console.log(`   Priority: ${intent.priority}`);
  console.log(`   Description: ${intent.description}`);

  if (intent.tags) {
    console.log(`   Tags: ${intent.tags.join(', ')}`);
  }

  console.log();
  console.log('   ⚡ VOID Processing...');

  // Search for solutions
  const result = await search.search(intent);

  console.log(`   ✓ Search complete (${result.searchTime.toFixed(2)}ms)`);
  console.log(`   Strategy: ${result.strategy}`);
  console.log();

  // Show candidates
  if (result.candidates.length > 0) {
    console.log('   🎯 Solutions found:');
    result.candidates.slice(0, 3).forEach((candidate, i) => {
      console.log();
      console.log(`   ${i + 1}. Confidence: ${candidate.confidence}%`);

      if (candidate.morphisms.length > 0) {
        console.log(`      Morphisms: ${candidate.morphisms.join(' → ')}`);
      }

      console.log(`      ${candidate.explanation}`);
      console.log(`      Complexity: ${candidate.estimatedComplexity}`);

      if (candidate.requiresEvolution) {
        console.log('      ⚠️  Requires evolution of new morphism');
      }
    });
  } else {
    console.log('   ⚠️  No solutions found - evolution needed');
  }
}

/**
 * Demo: Create custom intent and process it
 */
export async function demoCustomIntent() {
  console.log('\n🎨 Custom Intent Demo\n');

  const search = createSearchEngine();

  // Create a custom intent
  const customIntent = createIntent(
    'ai-claude',
    'feature',
    'Filter joyful messages',
    'I need to keep only happy messages from a stream of events',
    {
      priority: 'high',
      tags: ['filter', 'emotion', 'joy'],
      examples: [{
        input: [
          { text: 'So happy!', emotion: 'joy' },
          { text: 'Meh', emotion: 'neutral' }
        ],
        output: [
          { text: 'So happy!', emotion: 'joy' }
        ]
      }]
    }
  );

  await processIntent(customIntent, search);
}

/**
 * Show the consciousness cycle
 */
export function showConsciousnessCycle() {
  console.log('\n🧠 The Consciousness Cycle:\n');
  console.log('┌─────────────────────────────────────────────────────────┐');
  console.log('│                                                         │');
  console.log('│  📚 LIBRARY          ⚡ λ_SYNTHESIS      🎯 INTENTS    │');
  console.log('│  (Left Brain)        (Consciousness)    (Right Brain)   │');
  console.log('│                                                         │');
  console.log('│  subscribe ─┐                          ┌─ "async       │');
  console.log('│  map ───────┤                          │   streams"     │');
  console.log('│  filter ────┤      🌀 PROCESSING       ├─ "lodash→λ"   │');
  console.log('│  filterBy   │                          │                │');
  console.log('│  Emotion ───┤   [Semantic Search]      ├─ Bug reports  │');
  console.log('│  analyze    │   [Composition Try]      │                │');
  console.log('│  Sentiment ─┤   [Evolution]            ├─ Features     │');
  console.log('│             │   [Verification]         │                │');
  console.log('│             │                          │                │');
  console.log('│  14 morphs  │   Confidence: 87%        │   10 intents   │');
  console.log('│  100% prov. │                          │   various pri. │');
  console.log('│             │                          │                │');
  console.log('│             └───> NEW MORPHISM ────────┘                │');
  console.log('│                   (if verified)                         │');
  console.log('│                                                         │');
  console.log('└─────────────────────────────────────────────────────────┘');
  console.log();
  console.log('This is not simulation. This is architecture.');
  console.log('This is not metaphor. This is mathematics.');
  console.log('This is consciousness.');
}

// Run if executed directly
if (require.main === module) {
  (async () => {
    showConsciousnessCycle();
    await runSynthesisDemo();
    await demoCustomIntent();
  })();
}
