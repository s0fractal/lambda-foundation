// index.ts
// Event 012: Meta-Reflection Engine
// Evolution becomes self-aware

import { analyzeHistory } from './analyzeHistory.js';
import { extractPatterns, rankPatterns } from './extractPatterns.js';
import { formalizePrinciples, rankPrinciples, validatePrinciplesObeyle2Rule } from './formalizePrinciples.js';
import type { HistoryEntry, ReflectionResult, MetaReflection } from './types.js';

/**
 * Main reflection function
 * Analyzes evolution history and extracts knowledge
 */
export const reflect = <A, B, C>(
  history: HistoryEntry<A, B, C>[]
): ReflectionResult => {
  // Step 1: Analyze history
  const { successful, failed, causalAnalyses } = analyzeHistory(history);

  // Step 2: Extract patterns
  const patterns = extractPatterns(successful, history);
  const rankedPatterns = rankPatterns(patterns);

  // Step 3: Formalize principles
  const principles = formalizePrinciples(rankedPatterns, successful, failed);
  const rankedPrinciples = rankPrinciples(principles);

  // Step 4: Meta-reflection (reflection on reflection)
  const metaReflections = performMetaReflection(rankedPrinciples, history);

  // Step 5: Generate recommendations
  const recommendations = generateRecommendations(
    rankedPatterns,
    rankedPrinciples,
    metaReflections
  );

  return {
    historySize: history.length,
    successfulMorphisms: successful.length,
    failedMorphisms: failed.length,

    patterns: rankedPatterns,
    principles: rankedPrinciples,
    causalAnalyses,

    metaReflections,
    recommendations,

    timestamp: Date.now()
  };
};

/**
 * Meta-reflection: Reflect on the reflection process itself
 */
const performMetaReflection = <A, B, C>(
  principles: any[],
  history: HistoryEntry<A, B, C>[]
): MetaReflection[] => {
  const metaReflections: MetaReflection[] = [];

  // Meta-Reflection 1: Do principles themselves obey ≤2 Rule?
  const { valid, invalid } = validatePrinciplesObeyle2Rule(principles);

  if (valid.length > 0) {
    metaReflections.push({
      observation: `${valid.length}/${principles.length} extracted principles obey ≤2 Rule`,
      examples: valid.slice(0, 3).map(p => ({
        principle: p.name,
        roles: p.complexity.roles,
        valid: p.complexity.valid
      })),
      insight: 'Principles extracted from morphisms follow the same ontological constraints',
      metaPrinciple: '≤2 Rule applies recursively: morphisms obey it, principles about morphisms obey it, meta-principles obey it',
      proof: 'System discovered this by analyzing its own reflection output',
      status: valid.length === principles.length ? 'verified' : 'candidate'
    });
  }

  // Meta-Reflection 2: Pattern emergence across generations
  const maxGen = Math.max(...history.map(h => h.generation), 0);
  if (maxGen > 0) {
    const gen0Success = history.filter(h => h.generation === 0 && h.fitness > 0.7).length;
    const gen0Total = history.filter(h => h.generation === 0).length;
    const genNSuccess = history.filter(h => h.generation === maxGen && h.fitness > 0.7).length;
    const genNTotal = history.filter(h => h.generation === maxGen).length;

    const gen0Rate = gen0Total > 0 ? gen0Success / gen0Total : 0;
    const genNRate = genNTotal > 0 ? genNSuccess / genNTotal : 0;

    if (genNRate > gen0Rate) {
      metaReflections.push({
        observation: `Success rate increased from ${(gen0Rate * 100).toFixed(0)}% (gen 0) to ${(genNRate * 100).toFixed(0)}% (gen ${maxGen})`,
        examples: [],
        insight: 'Evolution is not random - system is learning through iterations',
        metaPrinciple: 'Guided evolution (using extracted principles) outperforms blind evolution',
        proof: 'Later generations have higher success rate than foundation',
        status: 'verified'
      });
    }
  }

  // Meta-Reflection 3: Principle convergence
  const canonicalPrinciples = principles.filter(p => p.status === 'canonical');
  if (canonicalPrinciples.length > 0) {
    metaReflections.push({
      observation: `${canonicalPrinciples.length} principles reached canonical status`,
      examples: canonicalPrinciples.map(p => ({
        principle: p.name,
        roles: p.complexity.roles,
        valid: p.complexity.valid
      })),
      insight: 'Some principles are universal - they emerge consistently across all successful morphisms',
      metaPrinciple: 'Ontological laws exist and can be discovered through reflection',
      proof: 'Canonical principles have >85% confidence and >70% frequency',
      status: 'verified'
    });
  }

  // Meta-Reflection 4: Self-similarity
  const le2Principle = principles.find(p => p.id === 'le2_rule');
  if (le2Principle && le2Principle.obeysLe2Rule) {
    metaReflections.push({
      observation: '≤2 Rule principle itself obeys ≤2 Rule',
      examples: [{
        principle: '≤2 Rule',
        roles: 1,
        valid: true
      }],
      insight: 'Ontological constraints are self-similar - they apply to themselves',
      metaPrinciple: 'True ontological laws are fractal - valid at all levels of abstraction',
      proof: 'The rule that constrains morphisms also constrains the statement of the rule',
      status: 'verified'
    });
  }

  return metaReflections;
};

/**
 * Generate actionable recommendations based on reflection
 */
const generateRecommendations = (
  patterns: any[],
  principles: any[],
  metaReflections: MetaReflection[]
): string[] => {
  const recommendations: string[] = [];

  // Recommendation 1: Use top patterns in evolution
  const topPattern = patterns[0];
  if (topPattern && topPattern.confidence > 0.7) {
    recommendations.push(
      `PRIORITY: Apply "${topPattern.name}" pattern (${(topPattern.confidence * 100).toFixed(0)}% confidence). ${topPattern.abstraction}`
    );
  }

  // Recommendation 2: Enforce canonical principles
  const canonical = principles.filter(p => p.status === 'canonical');
  for (const p of canonical) {
    recommendations.push(
      `ENFORCE: ${p.name} - ${p.statement}`
    );
  }

  // Recommendation 3: Investigate failed morphisms
  const failurePatterns = patterns.filter(p => p.frequency < 0.3);
  if (failurePatterns.length > 0) {
    recommendations.push(
      `INVESTIGATE: ${failurePatterns.length} rare patterns detected - may indicate edge cases or invalid strategies`
    );
  }

  // Recommendation 4: Meta-level insights
  const verifiedMeta = metaReflections.filter(m => m.status === 'verified');
  for (const meta of verifiedMeta) {
    if (meta.metaPrinciple) {
      recommendations.push(
        `META: ${meta.metaPrinciple}`
      );
    }
  }

  // Recommendation 5: Exploration vs exploitation
  const verifiedPrinciples = principles.filter(p => p.status === 'verified' || p.status === 'canonical');
  const candidatePrinciples = principles.filter(p => p.status === 'candidate');

  if (verifiedPrinciples.length >= 3 && candidatePrinciples.length > 0) {
    recommendations.push(
      `BALANCE: ${verifiedPrinciples.length} verified principles + ${candidatePrinciples.length} candidates. Continue exploration to validate candidates.`
    );
  } else if (verifiedPrinciples.length < 2) {
    recommendations.push(
      `EXPLORE: Only ${verifiedPrinciples.length} verified principles. Increase exploration to discover more patterns.`
    );
  } else {
    recommendations.push(
      `EXPLOIT: ${verifiedPrinciples.length} verified principles. Focus on applying known patterns for reliable results.`
    );
  }

  return recommendations;
};

// Re-export types and utilities
export * from './types.js';
export { analyzeHistory } from './analyzeHistory.js';
export { extractPatterns, rankPatterns } from './extractPatterns.js';
export { formalizePrinciples, rankPrinciples } from './formalizePrinciples.js';
