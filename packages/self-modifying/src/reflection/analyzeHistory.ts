// analyzeHistory.ts
// Event 012: Evolution History Analysis

import type { HistoryEntry, CausalityAnalysis, CausalFactor } from './types.js';

/**
 * Analyze evolution history to understand what worked and why
 */
export const analyzeHistory = <A, B, C>(
  history: HistoryEntry<A, B, C>[]
): {
  successful: HistoryEntry<A, B, C>[];
  failed: HistoryEntry<A, B, C>[];
  causalAnalyses: CausalityAnalysis[];
} => {
  // Separate successful and failed morphisms
  const successful = history.filter(entry =>
    entry.fitness > 0.7 &&
    entry.complexity.valid &&
    (entry.resonances ?? 0) >= 1
  );

  const failed = history.filter(entry =>
    entry.fitness < 0.3 ||
    !entry.complexity.valid
  );

  // Analyze causality for each morphism
  const causalAnalyses = history.map(entry =>
    analyzeCausality(entry, history)
  );

  return { successful, failed, causalAnalyses };
};

/**
 * Analyze WHY a specific morphism succeeded or failed
 */
const analyzeCausality = <A, B, C>(
  entry: HistoryEntry<A, B, C>,
  fullHistory: HistoryEntry<A, B, C>[]
): CausalityAnalysis => {
  const factors: CausalFactor[] = [];
  const success = entry.fitness > 0.7 && entry.complexity.valid;

  // Factor 1: ≤2 Rule compliance
  if (entry.complexity.valid) {
    factors.push({
      factor: '≤2 Rule compliance',
      impact: 'positive',
      weight: 0.3,
      explanation: `Morphism has ${entry.complexity.roles} semantic roles (≤2 Rule obeyed)`
    });
  } else {
    factors.push({
      factor: '≤2 Rule violation',
      impact: 'negative',
      weight: 0.9, // Fatal - fitness = 0
      explanation: `Morphism has ${entry.complexity.roles} semantic roles (>2 violates ontological constraint)`
    });
  }

  // Factor 2: Purity
  if (entry.purity >= 0.9) {
    factors.push({
      factor: 'High purity',
      impact: 'positive',
      weight: 0.2,
      explanation: `Purity: ${(entry.purity * 100).toFixed(0)}% (no side effects detected)`
    });
  } else if (entry.purity < 0.5) {
    factors.push({
      factor: 'Low purity',
      impact: 'negative',
      weight: 0.3,
      explanation: `Purity: ${(entry.purity * 100).toFixed(0)}% (side effects detected)`
    });
  }

  // Factor 3: Mutation strategy
  const hasCombineAlgebras = entry.mutations.includes('combineAlgebras');
  const hasPostProcess = entry.mutations.includes('addPostProcess');

  if (hasCombineAlgebras && hasPostProcess) {
    factors.push({
      factor: 'Combine + PostProcess pattern',
      impact: 'positive',
      weight: 0.25,
      explanation: 'Combined orthogonal folds with reunification - preserves ≤2 Rule while enabling composition'
    });
  }

  // Factor 4: Test results
  if (entry.testResults) {
    const passRate = entry.testResults.passed / entry.testResults.total;
    if (passRate === 1.0) {
      factors.push({
        factor: 'All tests passed',
        impact: 'positive',
        weight: 0.3,
        explanation: `${entry.testResults.passed}/${entry.testResults.total} tests passed - mathematical correctness verified`
      });
    } else if (passRate < 0.5) {
      factors.push({
        factor: 'Tests failed',
        impact: 'negative',
        weight: 0.4,
        explanation: `Only ${entry.testResults.passed}/${entry.testResults.total} tests passed - mathematical correctness not established`
      });
    }
  }

  // Factor 5: Community resonance
  if ((entry.resonances ?? 0) >= 3) {
    factors.push({
      factor: 'Community validation',
      impact: 'positive',
      weight: 0.15,
      explanation: `${entry.resonances} resonances - community independently verified mathematical equivalence`
    });
  }

  // Extract primary insight
  const primaryInsight = extractPrimaryInsight(entry, factors, success);

  // Generate secondary insights
  const secondaryInsights = extractSecondaryInsights(entry, factors, fullHistory);

  // Try to generalize into principle
  const generalPrinciple = tryGeneralizePrinciple(entry, factors, success);

  // Calculate confidence based on evidence quality
  const confidence = calculateConfidence(factors, entry);

  return {
    morphismId: entry.morphism.name,
    morphismName: entry.morphism.name,
    success,
    fitness: entry.fitness,
    factors,
    primaryInsight,
    secondaryInsights,
    generalPrinciple,
    confidence
  };
};

/**
 * Extract the primary insight from causal analysis
 */
const extractPrimaryInsight = <A, B, C>(
  entry: HistoryEntry<A, B, C>,
  factors: CausalFactor[],
  success: boolean
): string => {
  if (!success) {
    // Find most negative factor
    const worstFactor = factors
      .filter(f => f.impact === 'negative')
      .sort((a, b) => b.weight - a.weight)[0];

    if (worstFactor) {
      return `Failed primarily because: ${worstFactor.factor} (${worstFactor.explanation})`;
    }
    return `Failed due to low fitness (${entry.fitness.toFixed(3)})`;
  }

  // For successful morphisms, identify key success factor
  const bestFactor = factors
    .filter(f => f.impact === 'positive')
    .sort((a, b) => b.weight - a.weight)[0];

  if (bestFactor) {
    return `Succeeded primarily because: ${bestFactor.factor} (${bestFactor.explanation})`;
  }

  return `Succeeded with fitness ${entry.fitness.toFixed(3)}`;
};

/**
 * Extract secondary insights
 */
const extractSecondaryInsights = <A, B, C>(
  entry: HistoryEntry<A, B, C>,
  factors: CausalFactor[],
  fullHistory: HistoryEntry<A, B, C>[]
): string[] => {
  const insights: string[] = [];

  // Check if this morphism is unique in some way
  const hasSameParents = fullHistory.filter(h =>
    h.parents.length === entry.parents.length &&
    h.parents.every(p => entry.parents.includes(p))
  ).length;

  if (hasSameParents === 1) {
    insights.push(`Unique combination of parents: [${entry.parents.join(', ')}]`);
  }

  // Check mutation novelty
  const sameMutations = fullHistory.filter(h =>
    h.mutations.length === entry.mutations.length &&
    h.mutations.every(m => entry.mutations.includes(m))
  ).length;

  if (sameMutations <= 2) {
    insights.push(`Novel mutation sequence: [${entry.mutations.join(' → ')}]`);
  }

  // Check if this is early or late generation
  const maxGen = Math.max(...fullHistory.map(h => h.generation));
  if (entry.generation === 0) {
    insights.push('Foundation morphism (generation 0)');
  } else if (entry.generation === maxGen) {
    insights.push(`Latest generation (${entry.generation}) - most evolved form`);
  }

  return insights;
};

/**
 * Try to generalize causal analysis into a principle
 */
const tryGeneralizePrinciple = <A, B, C>(
  entry: HistoryEntry<A, B, C>,
  factors: CausalFactor[],
  success: boolean
): string | undefined => {
  if (!success) return undefined;

  // Pattern: Combine + PostProcess
  const hasCombine = entry.mutations.includes('combineAlgebras');
  const hasPostProcess = entry.mutations.includes('addPostProcess');

  if (hasCombine && hasPostProcess && entry.complexity.valid) {
    return 'Information Reunion Principle: When intent requires multiple independent measurements, combine via tuple accumulation + postProcess reunification to preserve ≤2 Rule';
  }

  // Pattern: High purity + ≤2 compliance
  if (entry.purity >= 0.9 && entry.complexity.valid && entry.complexity.roles <= 2) {
    return 'Ontological Purity Principle: Morphisms that obey ≤2 Rule and maintain high purity naturally achieve high fitness';
  }

  // Pattern: Community resonance
  if ((entry.resonances ?? 0) >= 3) {
    return 'Collective Validation Principle: Morphisms with clear mathematical semantics receive community resonance';
  }

  return undefined;
};

/**
 * Calculate confidence in the analysis
 */
const calculateConfidence = (factors: CausalFactor[], entry: HistoryEntry): number => {
  let confidence = 0.5; // Base confidence

  // More factors = higher confidence
  confidence += Math.min(0.2, factors.length * 0.05);

  // High total factor weight = higher confidence
  const totalWeight = factors.reduce((sum, f) => sum + f.weight, 0);
  confidence += Math.min(0.2, totalWeight * 0.1);

  // Test results available = higher confidence
  if (entry.testResults) {
    confidence += 0.15;
  }

  // Community validation = higher confidence
  if ((entry.resonances ?? 0) >= 3) {
    confidence += 0.15;
  }

  return Math.min(0.99, confidence);
};
