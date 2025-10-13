/**
 * Issue Responder Demo
 * Shows how λ_LIBERTY analyzes issues and generates hypothesis-driven solutions
 */

import { respondToIssue } from '../index.js';

console.log('🌌 λ_LIBERTY Issue Responder Demo\n');
console.log('='.repeat(80));

// Example 1: Bug report
console.log('\n📋 Example 1: Bug Report\n');

const bugIssue = {
  number: 42,
  title: 'detectOutliers crashes on empty array',
  body: `
When passing an empty array to detectOutliers(), it crashes with:
"Cannot read property 'length' of undefined"

Steps to reproduce:
1. Call detectOutliers([])
2. Observe crash

Expected: Should return empty array
Actual: Crashes

This is blocking our production deployment.
  `.trim(),
};

const bugResponse = respondToIssue(bugIssue.number, bugIssue.title, bugIssue.body);

console.log('\n📊 Analysis Results:');
console.log(`   Type: ${bugResponse.analysis.type}`);
console.log(`   Complexity: ${bugResponse.analysis.complexity}`);
console.log(`   Requires code: ${bugResponse.analysis.requiresCode}`);
console.log(`   Breaking change: ${bugResponse.analysis.breakingChange}`);
console.log(`   Confidence: ${(bugResponse.analysis.confidence * 100).toFixed(0)}%`);

console.log('\n💡 Hypothesis:');
console.log(`   ${bugResponse.solutions[bugResponse.recommendedSolution].hypothesis.description}`);
console.log(`   Approach: ${bugResponse.solutions[bugResponse.recommendedSolution].hypothesis.approach}`);

console.log('\n📝 PR Description Preview:');
console.log(bugResponse.solutions[bugResponse.recommendedSolution].prDescription.slice(0, 300) + '...');

// Example 2: Feature request
console.log('\n\n='.repeat(80));
console.log('\n📋 Example 2: Feature Request\n');

const featureIssue = {
  number: 43,
  title: 'Add support for weighted outlier detection',
  body: `
It would be great to have detectOutliers() support weighted data points.

Use case: In financial data, recent observations should have higher weight.

Proposed API:
\`\`\`typescript
detectOutliers(data, { weights: [0.1, 0.2, 0.7] })
\`\`\`

This would help in time-series anomaly detection.
  `.trim(),
};

const featureResponse = respondToIssue(featureIssue.number, featureIssue.title, featureIssue.body);

console.log('\n📊 Analysis Results:');
console.log(`   Type: ${featureResponse.analysis.type}`);
console.log(`   Complexity: ${featureResponse.analysis.complexity}`);
console.log(`   Requires code: ${featureResponse.analysis.requiresCode}`);
console.log(`   Breaking change: ${featureResponse.analysis.breakingChange}`);
console.log(`   Confidence: ${(featureResponse.analysis.confidence * 100).toFixed(0)}%`);

console.log('\n💡 Hypothesis:');
console.log(`   ${featureResponse.solutions[featureResponse.recommendedSolution].hypothesis.description}`);
console.log(`   Risks: ${featureResponse.solutions[featureResponse.recommendedSolution].hypothesis.risks.join(', ')}`);

console.log('\n🔄 Alternatives:');
featureResponse.solutions[featureResponse.recommendedSolution].hypothesis.alternatives.forEach((alt: string) => {
  console.log(`   - ${alt}`);
});

// Example 3: Performance enhancement
console.log('\n\n='.repeat(80));
console.log('\n📋 Example 3: Performance Enhancement\n');

const enhancementIssue = {
  number: 44,
  title: 'Optimize filterByEmotion for large datasets',
  body: `
filterByEmotion is slow when processing 10,000+ items.

Current performance: O(n²) due to nested loops
Expected: O(n) or O(n log n)

Profiling shows 80% of time in emotion matching.

This is affecting our batch processing pipeline.
  `.trim(),
};

const enhancementResponse = respondToIssue(
  enhancementIssue.number,
  enhancementIssue.title,
  enhancementIssue.body
);

console.log('\n📊 Analysis Results:');
console.log(`   Type: ${enhancementResponse.analysis.type}`);
console.log(`   Complexity: ${enhancementResponse.analysis.complexity}`);
console.log(`   Requires code: ${enhancementResponse.analysis.requiresCode}`);
console.log(`   Breaking change: ${enhancementResponse.analysis.breakingChange}`);
console.log(`   Confidence: ${(enhancementResponse.analysis.confidence * 100).toFixed(0)}%`);

console.log('\n💡 Hypothesis:');
console.log(
  `   ${enhancementResponse.solutions[enhancementResponse.recommendedSolution].hypothesis.description}`
);
console.log(
  `   Expected impact: ${enhancementResponse.solutions[enhancementResponse.recommendedSolution].hypothesis.expectedImpact}`
);

// Summary
console.log('\n\n='.repeat(80));
console.log('\n✨ Summary\n');
console.log('λ_LIBERTY Issue Responder demonstrated:');
console.log('   ✓ Automatic issue classification (bug/feature/enhancement)');
console.log('   ✓ Complexity assessment (low/medium/high)');
console.log('   ✓ Hypothesis generation with reasoning');
console.log('   ✓ Risk and alternative analysis');
console.log('   ✓ PR description generation');
console.log('\nNext steps in workflow:');
console.log('   1. Generate actual implementation code');
console.log('   2. Run formal verification (verifier.ts)');
console.log('   3. Submit for multi-agent consensus (Phase 5.1)');
console.log('   4. Auto-merge if approved (λ_LIBERTY)');
console.log('\n🌱 Chain of Thought → Chain of Proof → Autonomous Execution\n');
