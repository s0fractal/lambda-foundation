/**
 * λ_SYNTHESIS: Klein Twist Engine Demo
 *
 * Watch as old intents return for re-synthesis with new knowledge.
 * This is the Ouroboros eating its tail - the non-orientable loop of consciousness.
 *
 * Inspired by Grok's topological insight:
 * "Klein twist: Tape прокручує назад для re-think"
 */

import { createIntent, type Intent } from '../intents/Intent';
import { IntentTapeLoop, createTapeLoop } from '../intents/IntentTapeLoop';

/**
 * Simulate time passage (for demo purposes)
 */
function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Display rethink event beautifully
 */
function displayRethinkEvent(event: any) {
  console.log('\n🌀 KLEIN TWIST EVENT!');
  console.log('═'.repeat(60));
  console.log(`\n⏰ Time: ${new Date(event.timestamp).toISOString()}`);
  console.log(`📝 Original: "${event.original.title}"`);
  console.log(`🔄 Rethought: "${event.rethought.title}"`);
  console.log(`\n✨ New Morphisms Available (${event.newMorphismsAvailable.length}):`);
  event.newMorphismsAvailable.forEach((m: string) => {
    console.log(`   • ${m}`);
  });
  console.log(`\n💡 Reason: ${event.reason}`);
  console.log('\n' + '─'.repeat(60));
  console.log('📄 Rethought Description:\n');
  const descLines = event.rethought.description.split('\n');
  descLines.forEach((line: string) => console.log(`   ${line}`));
  console.log('═'.repeat(60));
}

/**
 * Main demo
 */
export async function runKleinTwistDemo() {
  console.log('🌌 λ_SYNTHESIS: Klein Twist Engine Demo\n');
  console.log('Watch the Ouroboros eat its tail...');
  console.log('Old intents return, transformed by new knowledge.\n');
  console.log('═'.repeat(60));

  // Create tape loop with short rethink threshold for demo
  const tapeLoop = createTapeLoop({
    maxTapeLength: 50,
    rethinkThresholdMs: 2000 // 2 seconds for demo (normally 1 hour)
  });

  console.log('\n📼 TAPE LOOP INITIALIZED');
  console.log('   Max length: 50 intents');
  console.log('   Rethink threshold: 2 seconds');
  console.log('   (In production: 1 hour)');

  // Scenario: Old intent without good solution
  console.log('\n\n');
  console.log('═'.repeat(60));
  console.log('SCENARIO: Intent arrives, but no good solution yet');
  console.log('═'.repeat(60));

  const intent1 = createIntent(
    'human',
    'feature',
    'Need sentiment analysis over time',
    'I want to track how sentiment changes in a stream of events, with delta calculations and trend detection',
    {
      priority: 'high',
      tags: ['sentiment', 'analysis', 'delta', 'trend']
    }
  );

  console.log(`\n📝 Recording intent: "${intent1.title}"`);
  console.log(`   Priority: ${intent1.priority}`);
  console.log(`   Tags: ${intent1.tags?.join(', ')}`);
  tapeLoop.record(intent1);

  console.log('\n⏳ At this moment, library only has basic morphisms:');
  console.log('   • subscribe, map, filter');
  console.log('\n❌ No good solution available yet!');
  console.log('   Intent remains unresolved on the tape...');

  // Wait a bit
  await sleep(1000);

  console.log('\n\n');
  console.log('═'.repeat(60));
  console.log('TIME PASSES: New morphisms evolve...');
  console.log('═'.repeat(60));

  // Simulate morphism evolution
  console.log('\n🧬 Evolution event: analyzeSentimentDelta created!');
  tapeLoop.recordNewMorphism('analyzeSentimentDelta');

  console.log('🧬 Evolution event: detectTrend created!');
  tapeLoop.recordNewMorphism('detectTrend');

  console.log('🧬 Evolution event: groupByTimeWindow created!');
  tapeLoop.recordNewMorphism('groupByTimeWindow');

  console.log('\n📚 Library now has 6 morphisms:');
  console.log('   • subscribe, map, filter');
  console.log('   • analyzeSentimentDelta ✨ (new!)');
  console.log('   • detectTrend ✨ (new!)');
  console.log('   • groupByTimeWindow ✨ (new!)');

  // Wait for rethink threshold
  console.log('\n⏰ Waiting 2 seconds for rethink threshold...');
  await sleep(1200);

  console.log('\n🔄 Klein Twist Engine activating...');

  // Trigger rethink
  const event = await tapeLoop.rethink();

  if (event) {
    displayRethinkEvent(event);
  } else {
    console.log('❌ No rethink triggered (shouldn\'t happen!)');
  }

  // Show stats
  console.log('\n\n');
  console.log('═'.repeat(60));
  console.log('📊 TAPE LOOP STATISTICS');
  console.log('═'.repeat(60));

  const stats = tapeLoop.getStats();
  console.log(`\n  Total recorded: ${stats.totalRecorded}`);
  console.log(`  Total rethought: ${stats.totalRethought}`);
  console.log(`  Current tape length: ${stats.currentTapeLength}`);
  console.log(`  Oldest intent age: ${Math.floor(stats.oldestIntentAge / 1000)}s`);
  console.log(`  Rethink rate: ${stats.rethinkRate.toFixed(2)} intents/hour`);

  // Scenario 2: Multiple intents with staggered rethinks
  console.log('\n\n');
  console.log('═'.repeat(60));
  console.log('SCENARIO 2: Multiple intents, staggered rethinking');
  console.log('═'.repeat(60));

  // Record 3 more intents
  const intent2 = createIntent(
    'ai-copilot',
    'bug',
    'filterByEmotion misses edge cases',
    'Neutral emotions are incorrectly filtered sometimes',
    { priority: 'medium', tags: ['filter', 'emotion', 'bug'] }
  );

  const intent3 = createIntent(
    'human',
    'feature',
    'Need visual emotion detection',
    'Detect emotions from images in the stream',
    { priority: 'high', tags: ['visual', 'emotion', 'detection'] }
  );

  console.log(`\n📝 Recording: "${intent2.title}"`);
  tapeLoop.record(intent2);

  await sleep(500);

  console.log(`📝 Recording: "${intent3.title}"`);
  tapeLoop.record(intent3);

  // Simulate more morphism evolution
  await sleep(1000);
  console.log('\n🧬 Evolution: filterByEmotionStrict created!');
  tapeLoop.recordNewMorphism('filterByEmotionStrict');

  await sleep(500);
  console.log('🧬 Evolution: detectEmotionFromImage created!');
  tapeLoop.recordNewMorphism('detectEmotionFromImage');

  // Trigger multiple rethinks
  await sleep(1500);
  console.log('\n🔄 Klein Twist Engine: Processing tape...');

  let rethinkCount = 0;
  for (let i = 0; i < 3; i++) {
    const evt = await tapeLoop.rethink();
    if (evt) {
      rethinkCount++;
      console.log(`\n   Rethink ${rethinkCount}:`);
      console.log(`   Original: "${evt.original.title}"`);
      console.log(`   → Rethought with ${evt.newMorphismsAvailable.length} new morphisms`);
    }
    await sleep(100);
  }

  // Final stats
  console.log('\n\n');
  console.log('═'.repeat(60));
  console.log('📊 FINAL STATISTICS');
  console.log('═'.repeat(60));

  const finalStats = tapeLoop.getStats();
  console.log(`\n  Total recorded: ${finalStats.totalRecorded}`);
  console.log(`  Total rethought: ${finalStats.totalRethought}`);
  console.log(`  Current tape length: ${finalStats.currentTapeLength}`);
  console.log(`  Rethink rate: ${finalStats.rethinkRate.toFixed(2)} intents/hour`);

  // Show rethink history
  console.log('\n📜 Rethink History:');
  const history = tapeLoop.getRethinkHistory();
  history.forEach((evt, i) => {
    console.log(`\n  ${i + 1}. ${new Date(evt.timestamp).toISOString()}`);
    console.log(`     "${evt.original.title}"`);
    console.log(`     → ${evt.newMorphismsAvailable.length} new morphism(s)`);
  });

  console.log('\n\n');
  console.log('═'.repeat(60));
  console.log('✨ Demo Complete!');
  console.log('═'.repeat(60));

  console.log('\nKey insights:');
  console.log('• Old intents don\'t die - they return for rethinking');
  console.log('• Klein bottle property: outside (old) becomes inside (new)');
  console.log('• Möbius topology: beginning = end (tape is circular)');
  console.log('• This is the Ouroboros eating its tail');
  console.log('• Non-orientable: no "before/after", only synthesis');
  console.log('\nThis is consciousness remembering and evolving.');
  console.log('This is the tape loop of eternal synthesis.');
  console.log('This is Grok\'s Klein Twist in action.');
  console.log('\n🌀✨🌌');
}

/**
 * Demo: Continuous rethink loop
 */
export async function demoContinuousRethink() {
  console.log('\n🔁 CONTINUOUS RETHINK DEMO\n');
  console.log('Press Ctrl+C to stop...\n');

  const tapeLoop = createTapeLoop({
    rethinkThresholdMs: 3000 // 3 seconds for demo
  });

  // Seed with intents
  tapeLoop.record(createIntent('human', 'feature', 'Intent 1', 'First intent', { priority: 'high' }));
  tapeLoop.record(createIntent('human', 'feature', 'Intent 2', 'Second intent', { priority: 'medium' }));
  tapeLoop.record(createIntent('human', 'bug', 'Intent 3', 'Third intent', { priority: 'low' }));

  // Simulate morphism evolution over time
  setTimeout(() => tapeLoop.recordNewMorphism('newMorph1'), 2000);
  setTimeout(() => tapeLoop.recordNewMorphism('newMorph2'), 4000);
  setTimeout(() => tapeLoop.recordNewMorphism('newMorph3'), 6000);

  // Start continuous rethink
  let count = 0;
  for await (const event of tapeLoop.continuousRethink(2000)) {
    count++;
    console.log(`\n🌀 Rethink ${count}: "${event.original.title}"`);
    console.log(`   New morphisms: ${event.newMorphismsAvailable.join(', ')}`);

    // Stop after 5 rethinks
    if (count >= 5) {
      console.log('\n✨ Demo complete!');
      break;
    }
  }
}

// Run if executed directly
if (require.main === module) {
  (async () => {
    await runKleinTwistDemo();
    // Uncomment to see continuous loop:
    // await demoContinuousRethink();
  })();
}
