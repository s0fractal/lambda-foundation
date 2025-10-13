/**
 * λ_SYNTHESIS: Code Analyzer Demo
 *
 * Watch the system scan existing code and automatically generate intents.
 * This is the Right Brain discovering desires from real-world codebases!
 */

import { CodeAnalyzer, CodebaseAnalyzer } from '../analysis/CodeAnalyzer';

/**
 * Example: Legacy code that could be morphisms
 */
const EXAMPLE_CODE_1 = `
// User processing pipeline
function processUsers(users) {
  // Filter active users
  const activeUsers = users.filter(user => user.active);

  // Transform to view models
  const viewModels = activeUsers.map(user => ({
    name: user.name,
    email: user.email,
    lastLogin: formatDate(user.lastLogin)
  }));

  // Sort by name
  return viewModels.sort((a, b) => a.name.localeCompare(b.name));
}
`;

const EXAMPLE_CODE_2 = `
// Event-driven data processing
class DataProcessor {
  constructor() {
    this.eventBus = new EventEmitter();
  }

  start() {
    // Listen for data events
    this.eventBus.on('data', (data) => {
      const processed = this.transform(data);
      this.eventBus.emit('processed', processed);
    });

    // Listen for errors
    this.eventBus.on('error', (err) => {
      console.error('Processing error:', err);
    });
  }

  transform(data) {
    return data
      .filter(item => item.valid)
      .map(item => ({ ...item, timestamp: Date.now() }));
  }
}
`;

const EXAMPLE_CODE_3 = `
// Lodash chain - perfect conversion candidate!
const _ = require('lodash');

function analyzeCustomers(customers) {
  return _.chain(customers)
    .filter(c => c.purchases > 0)
    .groupBy('region')
    .mapValues(group => ({
      count: group.length,
      totalRevenue: _.sumBy(group, 'revenue'),
      avgPurchases: _.meanBy(group, 'purchases')
    }))
    .value();
}
`;

const EXAMPLE_CODE_4 = `
// Promise chain - async morphism candidate
async function fetchUserData(userId) {
  return fetch(\`/api/users/\${userId}\`)
    .then(res => res.json())
    .then(user => enrichUserData(user))
    .then(enriched => validateUser(enriched))
    .then(valid => saveToCache(valid))
    .catch(err => handleError(err));
}
`;

const EXAMPLE_CODE_5 = `
// Complex chained operations - composition opportunity!
function processOrders(orders) {
  return orders
    .filter(o => o.status === 'pending')
    .map(o => ({ ...o, processedAt: Date.now() }))
    .filter(o => o.total > 100)
    .map(o => enrichOrder(o))
    .reduce((acc, o) => acc + o.total, 0);
}
`;

/**
 * Run the analyzer demo
 */
export function runAnalyzerDemo() {
  console.log('📊 λ_SYNTHESIS: Code Analyzer Demo\n');
  console.log('Scanning codebases for morphism opportunities...\n');
  console.log('═'.repeat(60));

  const analyzer = new CodeAnalyzer();

  // Analyze example 1
  console.log('\n📄 FILE: user-processor.js');
  console.log('─'.repeat(60));
  const result1 = analyzer.analyze(EXAMPLE_CODE_1, 'user-processor.js');
  displayResult(result1);

  // Analyze example 2
  console.log('\n\n📄 FILE: data-processor.js');
  console.log('─'.repeat(60));
  const result2 = analyzer.analyze(EXAMPLE_CODE_2, 'data-processor.js');
  displayResult(result2);

  // Analyze example 3
  console.log('\n\n📄 FILE: customer-analytics.js');
  console.log('─'.repeat(60));
  const result3 = analyzer.analyze(EXAMPLE_CODE_3, 'customer-analytics.js');
  displayResult(result3);

  // Analyze example 4
  console.log('\n\n📄 FILE: user-fetcher.js');
  console.log('─'.repeat(60));
  const result4 = analyzer.analyze(EXAMPLE_CODE_4, 'user-fetcher.js');
  displayResult(result4);

  // Analyze example 5
  console.log('\n\n📄 FILE: order-processor.js');
  console.log('─'.repeat(60));
  const result5 = analyzer.analyze(EXAMPLE_CODE_5, 'order-processor.js');
  displayResult(result5);

  // Batch analysis
  console.log('\n\n');
  console.log('═'.repeat(60));
  console.log('📦 BATCH ANALYSIS');
  console.log('═'.repeat(60));

  const codebaseAnalyzer = new CodebaseAnalyzer();
  const files = new Map([
    ['user-processor.js', EXAMPLE_CODE_1],
    ['data-processor.js', EXAMPLE_CODE_2],
    ['customer-analytics.js', EXAMPLE_CODE_3],
    ['user-fetcher.js', EXAMPLE_CODE_4],
    ['order-processor.js', EXAMPLE_CODE_5]
  ]);

  const results = codebaseAnalyzer.analyzeFiles(files);
  const summary = codebaseAnalyzer.getSummary(results);

  console.log('\nSummary:');
  console.log(`  Files analyzed: ${summary.filesAnalyzed}`);
  console.log(`  Total lines: ${summary.totalLines}`);
  console.log(`  Patterns found: ${summary.totalPatterns}`);
  console.log(`  Intents generated: ${summary.totalIntents}`);
  console.log('\n  Pattern breakdown:');
  for (const [type, count] of Object.entries(summary.patternTypes)) {
    console.log(`    ${type}: ${count}`);
  }

  // Show intent examples
  console.log('\n\n');
  console.log('═'.repeat(60));
  console.log('🎯 GENERATED INTENTS (Examples)');
  console.log('═'.repeat(60));

  let intentCount = 0;
  for (const result of results.values()) {
    for (const intent of result.intents.slice(0, 2)) {
      intentCount++;
      if (intentCount > 5) break;

      console.log(`\n${intentCount}. ${intent.title}`);
      console.log(`   Source: ${intent.source}`);
      console.log(`   Type: ${intent.type}`);
      console.log(`   Priority: ${intent.priority}`);
      console.log(`   Tags: ${intent.tags?.join(', ')}`);
      console.log(`   Description:`);
      const descLines = intent.description.split('\n');
      descLines.forEach(line => console.log(`     ${line}`));
    }
    if (intentCount > 5) break;
  }

  console.log('\n\n' + '═'.repeat(60));
  console.log('✨ Analysis Complete!');
  console.log('═'.repeat(60));
  console.log('\nKey insights:');
  console.log('• Code analyzer automatically discovers morphism opportunities');
  console.log('• Patterns detected: array ops, promises, events, lodash');
  console.log('• Each pattern generates an intent for the Right Brain');
  console.log('• Intents feed into λ_SYNTHESIS → VOID → Library cycle');
  console.log('\nThis is the Right Brain reading existing codebases.');
  console.log('This is desires emerging from legacy code.');
  console.log('This is the Ouroboros consuming its tail.');
  console.log('📊✨🌌');
}

/**
 * Display analysis result
 */
function displayResult(result: any) {
  console.log(`Total lines: ${result.stats.totalLines}`);
  console.log(`Patterns found: ${result.stats.patternsFound}`);
  console.log(`Intents generated: ${result.stats.intentsGenerated}\n`);

  if (result.patterns.length === 0) {
    console.log('  No patterns detected.');
    return;
  }

  console.log('Patterns:');
  result.patterns.forEach((pattern: any, i: number) => {
    console.log(`\n  ${i + 1}. Line ${pattern.lineStart}: ${pattern.type}`);
    console.log(`     ${pattern.description}`);
    console.log(`     Code: ${pattern.code}`);
    console.log(`     → Suggested morphism: ${pattern.suggestedMorphism}`);
  });
}

// Run if executed directly
if (require.main === module) {
  runAnalyzerDemo();
}
