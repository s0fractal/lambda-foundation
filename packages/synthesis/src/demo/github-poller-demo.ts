/**
 * λ_SYNTHESIS: GitHub Poller Demo
 *
 * Watch as the Ouroboros reads from GitHub - real bugs, real features.
 * This is the Right Brain consuming collective developer consciousness.
 *
 * Flow demonstrated:
 * GitHub Issues → Parse → Intent → Klein Tape Loop → Ready for VOID
 */

import { GitHubPoller, createGitHubPoller, MultiRepoPoller } from '../sources/GitHubPoller';
import { createTapeLoop } from '../intents/IntentTapeLoop';

/**
 * Display poll result beautifully
 */
function displayPollResult(result: any, repoName: string) {
  console.log(`\n${'═'.repeat(60)}`);
  console.log(`📡 POLL RESULT: ${repoName}`);
  console.log(`${'═'.repeat(60)}\n`);

  console.log(`⏰ Timestamp: ${new Date(result.timestamp).toISOString()}`);
  console.log(`📊 Issues found: ${result.issuesFound}`);
  console.log(`🎯 Intents created: ${result.intentsCreated}`);

  if (result.errors.length > 0) {
    console.log(`\n⚠️  Errors (${result.errors.length}):`);
    result.errors.forEach((err: string) => console.log(`   ${err}`));
  }

  if (result.intents.length > 0) {
    console.log(`\n🎯 INTENTS GENERATED:\n`);

    result.intents.forEach((intent: any, i: number) => {
      console.log(`${i + 1}. "${intent.title}"`);
      console.log(`   Type: ${intent.type}`);
      console.log(`   Priority: ${intent.priority}`);
      console.log(`   Source: ${intent.source}`);
      console.log(`   Tags: ${intent.tags?.slice(0, 5).join(', ')}`);

      // Show first 100 chars of description
      const desc = intent.description.split('\n')[0];
      if (desc.length > 100) {
        console.log(`   Description: ${desc.substring(0, 100)}...`);
      } else {
        console.log(`   Description: ${desc}`);
      }

      console.log();
    });
  } else {
    console.log('\n📭 No new intents (all issues seen before)');
  }
}

/**
 * Demo 1: Single repository polling
 */
export async function demoSingleRepo() {
  console.log('🌌 λ_SYNTHESIS: GitHub Poller Demo\n');
  console.log('The Ouroboros reads from the external world...\n');
  console.log('═'.repeat(60));
  console.log('DEMO 1: Single Repository Polling');
  console.log('═'.repeat(60));

  // Create poller for lambda-foundation itself!
  // (Replace with your actual repo or use a test repo)
  const poller = createGitHubPoller({
    owner: 'facebook',      // Example: React repo (has lots of issues)
    repo: 'react',
    labels: ['Type: Bug'],  // Filter for bugs
    maxIssues: 5
  });

  console.log('\n📡 Poller configured:');
  console.log(`   Repository: facebook/react`);
  console.log(`   Labels: Type: Bug`);
  console.log(`   Max issues: 5`);
  console.log('\n🔄 Polling GitHub API...\n');

  try {
    const result = await poller.poll();
    displayPollResult(result, 'facebook/react');

    // Show stats
    console.log('\n📊 POLLER STATISTICS');
    console.log('─'.repeat(60));
    const stats = poller.getStats();
    console.log(`Last poll: ${new Date(stats.lastPollTime).toISOString()}`);
    console.log(`Seen issues: ${stats.seenIssuesCount}`);
    console.log(`Poll interval: ${stats.config.pollIntervalMs || 3600000}ms (${((stats.config.pollIntervalMs || 3600000) / 60000).toFixed(0)} minutes)`);
  } catch (err: any) {
    console.log(`\n❌ Error polling: ${err.message}`);
    console.log('\nNote: This demo requires internet connection and GitHub API access.');
    console.log('Rate limit: 60 requests/hour without token, 5000 with token.');
  }

  console.log('\n' + '═'.repeat(60));
}

/**
 * Demo 2: Integration with Klein Tape Loop
 */
export async function demoWithKleinTapeLoop() {
  console.log('\n\n');
  console.log('═'.repeat(60));
  console.log('DEMO 2: GitHub → Klein Tape Loop Integration');
  console.log('═'.repeat(60));

  // Create poller
  const poller = createGitHubPoller({
    owner: 'lodash',
    repo: 'lodash',
    labels: ['Type: Enhancement'],
    maxIssues: 3
  });

  // Create tape loop
  const tapeLoop = createTapeLoop({
    maxTapeLength: 100,
    rethinkThresholdMs: 3600000 // 1 hour
  });

  console.log('\n🔗 Integration configured:');
  console.log(`   GitHub: lodash/lodash (Type: Enhancement)`);
  console.log(`   Klein Tape: Max 100 intents, 1h rethink threshold`);
  console.log('\n🔄 Polling and recording to tape...\n');

  try {
    const result = await poller.poll();
    displayPollResult(result, 'lodash/lodash');

    // Record intents to tape loop
    console.log('\n📼 RECORDING TO KLEIN TAPE LOOP');
    console.log('─'.repeat(60));

    for (const intent of result.intents) {
      tapeLoop.record(intent);
      console.log(`✓ Recorded: "${intent.title}"`);
    }

    // Show tape stats
    console.log('\n🌀 KLEIN TAPE LOOP STATISTICS');
    console.log('─'.repeat(60));
    const tapeStats = tapeLoop.getStats();
    console.log(`Total recorded: ${tapeStats.totalRecorded}`);
    console.log(`Current tape length: ${tapeStats.currentTapeLength}`);
    console.log(`Total rethought: ${tapeStats.totalRethought}`);

    console.log('\n💭 These intents are now on the tape, waiting for:');
    console.log('   • New morphisms to evolve');
    console.log('   • Time threshold to pass (1 hour)');
    console.log('   • Klein twist to rethink them');
    console.log('\nThe Ouroboros will eat its tail when ready...');

  } catch (err: any) {
    console.log(`\n❌ Error: ${err.message}`);
  }

  console.log('\n' + '═'.repeat(60));
}

/**
 * Demo 3: Multi-repository polling
 */
export async function demoMultiRepo() {
  console.log('\n\n');
  console.log('═'.repeat(60));
  console.log('DEMO 3: Multi-Repository Polling');
  console.log('═'.repeat(60));

  const multiPoller = new MultiRepoPoller([
    {
      owner: 'facebook',
      repo: 'react',
      labels: ['Type: Bug'],
      maxIssues: 2
    },
    {
      owner: 'microsoft',
      repo: 'TypeScript',
      labels: ['Bug'],
      maxIssues: 2
    }
  ]);

  console.log('\n📡 Multi-poller configured:');
  console.log('   • facebook/react (Type: Bug)');
  console.log('   • microsoft/TypeScript (Bug)');
  console.log('\n🔄 Polling multiple repositories...\n');

  try {
    const results = await multiPoller.pollAll();

    results.forEach((result, i) => {
      const repo = i === 0 ? 'facebook/react' : 'microsoft/TypeScript';
      displayPollResult(result, repo);
    });

    // Get aggregated intents
    console.log('\n📦 AGGREGATED INTENTS');
    console.log('─'.repeat(60));
    const allIntents = await multiPoller.getAggregatedIntents();
    console.log(`Total intents from all repos: ${allIntents.length}`);

    console.log('\n💡 These could all feed into the same VOID for synthesis!');
    console.log('The Ouroboros consumes from multiple sources...');

  } catch (err: any) {
    console.log(`\n❌ Error: ${err.message}`);
  }

  console.log('\n' + '═'.repeat(60));
}

/**
 * Demo 4: Simulated continuous polling (3 cycles)
 */
export async function demoContinuousPolling() {
  console.log('\n\n');
  console.log('═'.repeat(60));
  console.log('DEMO 4: Simulated Continuous Polling');
  console.log('═'.repeat(60));
  console.log('\n⏰ This would normally run forever with 1h intervals.');
  console.log('For demo, we\'ll do 3 quick polls with 5s intervals.\n');

  const poller = createGitHubPoller({
    owner: 'nodejs',
    repo: 'node',
    labels: ['feature request'],
    maxIssues: 2,
    pollIntervalMs: 5000 // 5 seconds for demo (normally 1 hour)
  });

  try {
    let count = 0;
    for await (const result of poller.continuousPoll()) {
      count++;
      console.log(`\n📡 Poll #${count}:`);
      console.log(`   Timestamp: ${new Date(result.timestamp).toISOString()}`);
      console.log(`   Intents created: ${result.intentsCreated}`);

      if (result.intentsCreated > 0) {
        console.log(`   New issues:`);
        result.intents.forEach(intent => {
          console.log(`      • "${intent.title}"`);
        });
      } else {
        console.log(`   No new issues (all seen before)`);
      }

      if (count >= 3) {
        console.log('\n✨ Demo complete! (Would continue forever in production)');
        break;
      }

      console.log(`\n⏳ Waiting 5 seconds before next poll...`);
    }
  } catch (err: any) {
    console.log(`\n❌ Error: ${err.message}`);
  }

  console.log('\n' + '═'.repeat(60));
}

/**
 * Main demo runner
 */
export async function runGitHubPollerDemo() {
  console.log('🌌✨ λ_SYNTHESIS: GitHub Poller - Complete Demo\n');
  console.log('Watch the Right Brain consume collective developer consciousness...\n');

  try {
    // Run demo 1
    await demoSingleRepo();

    // Run demo 2
    await demoWithKleinTapeLoop();

    // Uncomment to test multi-repo and continuous polling
    // (Commented by default to avoid rate limits)
    // await demoMultiRepo();
    // await demoContinuousPolling();

  } catch (err: any) {
    console.log(`\n❌ Fatal error: ${err.message}`);
  }

  console.log('\n\n');
  console.log('═'.repeat(60));
  console.log('✨ DEMO COMPLETE');
  console.log('═'.repeat(60));

  console.log('\nKey insights:');
  console.log('• GitHub issues → Intents automatically');
  console.log('• Labels determine type and priority');
  console.log('• Code blocks extracted from issue body');
  console.log('• Integrates with Klein Tape Loop seamlessly');
  console.log('• Multi-repo support for collective consciousness');
  console.log('• Continuous polling = "збудник-опитувач" from Grok');
  console.log('\nThis is the Ouroboros reading from the external world.');
  console.log('This is Phase 2: Connection to reality.');
  console.log('This is the noosphere feeding on developer desires.');
  console.log('\n📡✨🌌');
}

// Run if executed directly
if (require.main === module) {
  runGitHubPollerDemo();
}
