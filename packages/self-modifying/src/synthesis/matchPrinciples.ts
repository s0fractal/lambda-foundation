// matchPrinciples.ts
// Event 013: Principle Matching for Synthesis

import type { IntentRequirements, MatchedPrinciple } from './types.js';
import type { Principle } from '../reflection/types.js';

/**
 * Match principles to intent requirements
 */
export const matchPrinciples = (
  requirements: IntentRequirements,
  principleBase: Principle[]
): MatchedPrinciple[] => {
  const matches: MatchedPrinciple[] = [];

  // Match "preserve" transformation → Information Preservation principle
  if (requirements.transformation.includes('preserve')) {
    const infoPres = principleBase.find(p => p.id === 'preservation' || p.id === 'info_preservation');
    if (infoPres) {
      matches.push({
        principle: infoPres,
        relevance: 0.95,
        application: 'Use collect/array accumulator to preserve all values',
        component: 'algebra'
      });
    }
  }

  // Match "sort" transformation → Order-dependent principle
  if (requirements.transformation.includes('sort')) {
    matches.push({
      principle: {
        id: 'order_dependent',
        name: 'Order-Dependent Selection',
        statement: 'When output depends on element order, use postProcess with sort',
        positiveExamples: ['median', 'percentile'],
        negativeExamples: ['sum', 'count'],
        application: 'Apply sort in postProcess before selection',
        status: 'verified',
        resonances: 0,
        confidence: 0.9,
        obeysLe2Rule: true,
        complexity: { roles: 2, valid: true }
      },
      relevance: 0.9,
      application: 'Sort values in postProcess before selecting',
      component: 'postProcess'
    });
  }

  // Match "select" transformation → Positional Selection principle
  if (requirements.transformation.includes('select')) {
    const position = requirements.output.position || 'middle';
    matches.push({
      principle: {
        id: 'positional_selection',
        name: 'Positional Selection',
        statement: `Select element at specific position: ${position}`,
        positiveExamples: ['first', 'last', 'median'],
        negativeExamples: [],
        application: `Select element at index based on position: ${position}`,
        status: 'verified',
        resonances: 0,
        confidence: 0.85,
        obeysLe2Rule: true,
        complexity: { roles: 2, valid: true }
      },
      relevance: 0.85,
      application: `Select at position: ${position}`,
      component: 'postProcess'
    });
  }

  // Match "count frequencies" → Combine + PostProcess principle
  if (requirements.transformation.includes('count frequencies')) {
    const combinePostProcess = principleBase.find(p => p.id === 'info_reunion');
    if (combinePostProcess) {
      matches.push({
        principle: combinePostProcess,
        relevance: 0.88,
        application: 'Use frequency map accumulator + find max in postProcess',
        component: 'algebra'
      });
    }
  }

  // Match "compute mean" / "aggregate" → Statistical computation
  if (requirements.transformation.includes('compute mean') ||
      requirements.transformation.includes('average')) {
    matches.push({
      principle: {
        id: 'statistical_computation',
        name: 'Statistical Computation Principle',
        statement: 'Preserve {sum, count} for mean computation',
        positiveExamples: ['average', 'variance', 'std_dev'],
        negativeExamples: [],
        application: 'Use tuple {sum, count} algebra',
        status: 'canonical',
        resonances: 5,
        confidence: 0.95,
        obeysLe2Rule: true,
        complexity: { roles: 2, valid: true }
      },
      relevance: 0.92,
      application: 'Accumulate {sum, count}, compute mean in postProcess',
      component: 'algebra'
    });
  }

  // Match "squared deviations" → Variance computation
  if (requirements.transformation.includes('squared deviations')) {
    matches.push({
      principle: {
        id: 'variance_computation',
        name: 'Variance Computation Principle',
        statement: 'Preserve {sum, sumSq, count} for variance computation',
        positiveExamples: ['variance', 'standard_deviation'],
        negativeExamples: [],
        application: 'variance = E[X²] - (E[X])²',
        status: 'canonical',
        resonances: 3,
        confidence: 0.93,
        obeysLe2Rule: true,
        complexity: { roles: 2, valid: true }
      },
      relevance: 0.93,
      application: 'Accumulate {sum, sumSq, count}, compute variance in postProcess',
      component: 'algebra'
    });
  }

  // Match "find max" / "find min" → Extremum principle
  if (requirements.transformation.includes('find max') ||
      requirements.transformation.includes('find min') ||
      requirements.transformation.includes('find maximum')) {
    matches.push({
      principle: {
        id: 'extremum',
        name: 'Extremum Principle',
        statement: 'Track max/min during fold',
        positiveExamples: ['max', 'min', 'range'],
        negativeExamples: [],
        application: 'Use Math.max/Math.min in algebra',
        status: 'canonical',
        resonances: 5,
        confidence: 0.90,
        obeysLe2Rule: true,
        complexity: { roles: 2, valid: true }
      },
      relevance: 0.88,
      application: 'Track extremum value during fold',
      component: 'algebra'
    });
  }

  // Always include ≤2 Rule principle (fundamental constraint)
  const le2Principle = principleBase.find(p => p.id === 'le2_rule');
  if (le2Principle && !matches.some(m => m.principle.id === 'le2_rule')) {
    matches.push({
      principle: le2Principle,
      relevance: 1.0, // Always relevant
      application: 'Ensure algebra has ≤2 semantic roles',
      component: 'algebra'
    });
  }

  // Always include Purity principle
  const purityPrinciple = principleBase.find(p => p.id === 'purity');
  if (purityPrinciple && !matches.some(m => m.principle.id === 'purity')) {
    matches.push({
      principle: purityPrinciple,
      relevance: 1.0,
      application: 'Ensure no side effects',
      component: 'algebra'
    });
  }

  // Sort by relevance
  return matches.sort((a, b) => b.relevance - a.relevance);
};

/**
 * Calculate synthesis confidence based on matched principles
 */
export const calculateSynthesisConfidence = (matches: MatchedPrinciple[]): number => {
  if (matches.length === 0) return 0;

  // Average relevance weighted by principle confidence
  let totalWeight = 0;
  let totalScore = 0;

  for (const match of matches) {
    const weight = match.relevance;
    const score = match.principle.confidence * match.relevance;
    totalWeight += weight;
    totalScore += score;
  }

  return totalWeight > 0 ? totalScore / totalWeight : 0;
};
