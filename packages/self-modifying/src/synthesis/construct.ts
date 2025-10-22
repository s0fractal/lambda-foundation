// construct.ts
// Event 013: Morphism Construction from Principles

import type { IntentRequirements, MatchedPrinciple, SynthesisPlan } from './types.js';
import type { EvolvableMorphism, Algebra, Coalgebra } from '../evolution/operators.js';

/**
 * Construct morphism from matched principles
 */
export const constructMorphism = <A = any, B = any, C = any>(
  plan: SynthesisPlan
): EvolvableMorphism<A, B, C> & { postProcess?: (result: B) => any } => {
  const { requirements, matchedPrinciples, intent } = plan;

  // Default coalgebra (unfold from array)
  const coalgebra: Coalgebra<A, C> = (state: any) => {
    if (Array.isArray(state) && state.length > 0) {
      const [head, ...tail] = state;
      return [head, tail as any];
    }
    if (typeof state === 'number' && state > 0) {
      return [state as any, (state - 1) as any];
    }
    return null;
  };

  // Construct based on intent
  switch (requirements.intent) {
    case 'median':
      return constructMedian(matchedPrinciples);

    case 'mode':
      return constructMode(matchedPrinciples);

    case 'variance':
      return constructVariance(matchedPrinciples);

    case 'standard_deviation':
      return constructStdDev(matchedPrinciples);

    case 'range':
      return constructRange(matchedPrinciples);

    case 'first':
      return constructFirst(matchedPrinciples);

    case 'last':
      return constructLast(matchedPrinciples);

    default:
      // Fallback: try generic construction
      return constructGeneric(requirements, matchedPrinciples);
  }
};

/**
 * Construct median morphism
 */
const constructMedian = (principles: MatchedPrinciple[]): any => {
  // Apply "Information Preservation" principle → collect algebra
  const algebra: Algebra<any, any[]> = (acc, val) => [...acc, val];
  const init: any[] = [];

  // Apply "Order-dependent" + "Positional Selection" principles → sort + select middle
  const postProcess = (values: any[]) => {
    if (values.length === 0) return null;
    const sorted = [...values].sort((a, b) => a - b);
    const middleIndex = Math.floor(sorted.length / 2);
    return sorted[middleIndex];
  };

  const coalgebra: Coalgebra<any, any> = (state) => {
    if (Array.isArray(state) && state.length > 0) {
      const [head, ...tail] = state;
      return [head, tail];
    }
    return null;
  };

  return {
    name: 'median',
    algebra,
    coalgebra,
    init,
    postProcess,
    metadata: {
      generation: 0,
      parents: ['collect'],
      mutations: ['synthesized']
    }
  };
};

/**
 * Construct mode morphism
 */
const constructMode = (principles: MatchedPrinciple[]): any => {
  // Apply "count frequencies" principle → frequency map algebra
  const algebra: Algebra<any, Record<string, number>> = (freqMap, val) => {
    const key = String(val);
    freqMap[key] = (freqMap[key] || 0) + 1;
    return freqMap;
  };
  const init: Record<string, number> = {};

  // Apply "find maximum" principle → find max frequency in postProcess
  const postProcess = (freqMap: Record<string, number>) => {
    let maxFreq = 0;
    let mode = null;

    for (const [val, freq] of Object.entries(freqMap)) {
      if (freq > maxFreq) {
        maxFreq = freq;
        mode = val;
      }
    }

    // Try to parse back to number if possible
    return mode !== null && !isNaN(Number(mode)) ? Number(mode) : mode;
  };

  const coalgebra: Coalgebra<any, any> = (state) => {
    if (Array.isArray(state) && state.length > 0) {
      const [head, ...tail] = state;
      return [head, tail];
    }
    return null;
  };

  return {
    name: 'mode',
    algebra,
    coalgebra,
    init,
    postProcess,
    metadata: {
      generation: 0,
      parents: ['count', 'max'],
      mutations: ['synthesized']
    }
  };
};

/**
 * Construct variance morphism
 */
const constructVariance = (principles: MatchedPrinciple[]): any => {
  // Apply "variance computation" principle → {sum, sumSq, count} algebra
  const algebra: Algebra<number, { sum: number; sumSq: number; count: number }> = (acc, val) => ({
    sum: acc.sum + val,
    sumSq: acc.sumSq + val * val,
    count: acc.count + 1
  });
  const init = { sum: 0, sumSq: 0, count: 0 };

  // Apply variance formula: E[X²] - (E[X])²
  const postProcess = ({ sum, sumSq, count }: { sum: number; sumSq: number; count: number }) => {
    if (count === 0) return 0;
    const mean = sum / count;
    const meanSq = sumSq / count;
    return meanSq - mean * mean;
  };

  const coalgebra: Coalgebra<number, any> = (state) => {
    if (Array.isArray(state) && state.length > 0) {
      const [head, ...tail] = state;
      return [head, tail];
    }
    return null;
  };

  return {
    name: 'variance',
    algebra,
    coalgebra,
    init,
    postProcess,
    metadata: {
      generation: 0,
      parents: ['sum', 'sumSq', 'count'],
      mutations: ['synthesized']
    }
  };
};

/**
 * Construct standard deviation morphism
 */
const constructStdDev = (principles: MatchedPrinciple[]): any => {
  // Reuse variance construction
  const varianceMorphism = constructVariance(principles);

  // Add square root in postProcess
  const variancePostProcess = varianceMorphism.postProcess!;
  const postProcess = (acc: any) => {
    const variance = variancePostProcess(acc);
    return Math.sqrt(variance);
  };

  return {
    ...varianceMorphism,
    name: 'standard_deviation',
    postProcess,
    metadata: {
      generation: 0,
      parents: ['variance'],
      mutations: ['synthesized']
    }
  };
};

/**
 * Construct range morphism
 */
const constructRange = (principles: MatchedPrinciple[]): any => {
  // Apply "extremum" principle → track {min, max}
  const algebra: Algebra<number, { min: number; max: number }> = (acc, val) => ({
    min: Math.min(acc.min, val),
    max: Math.max(acc.max, val)
  });
  const init = { min: Infinity, max: -Infinity };

  // Compute range = max - min
  const postProcess = ({ min, max }: { min: number; max: number }) => max - min;

  const coalgebra: Coalgebra<number, any> = (state) => {
    if (Array.isArray(state) && state.length > 0) {
      const [head, ...tail] = state;
      return [head, tail];
    }
    return null;
  };

  return {
    name: 'range',
    algebra,
    coalgebra,
    init,
    postProcess,
    metadata: {
      generation: 0,
      parents: ['min', 'max'],
      mutations: ['synthesized']
    }
  };
};

/**
 * Construct first morphism
 */
const constructFirst = (principles: MatchedPrinciple[]): any => {
  // Simply take first value
  const algebra: Algebra<any, any> = (acc, val) => (acc === null ? val : acc);
  const init = null;

  const coalgebra: Coalgebra<any, any> = (state) => {
    if (Array.isArray(state) && state.length > 0) {
      const [head, ...tail] = state;
      return [head, tail];
    }
    return null;
  };

  return {
    name: 'first',
    algebra,
    coalgebra,
    init,
    metadata: {
      generation: 0,
      parents: [],
      mutations: ['synthesized']
    }
  };
};

/**
 * Construct last morphism
 */
const constructLast = (principles: MatchedPrinciple[]): any => {
  // Keep updating to last value seen
  const algebra: Algebra<any, any> = (acc, val) => val;
  const init = null;

  const coalgebra: Coalgebra<any, any> = (state) => {
    if (Array.isArray(state) && state.length > 0) {
      const [head, ...tail] = state;
      return [head, tail];
    }
    return null;
  };

  return {
    name: 'last',
    algebra,
    coalgebra,
    init,
    metadata: {
      generation: 0,
      parents: [],
      mutations: ['synthesized']
    }
  };
};

/**
 * Generic construction (fallback)
 */
const constructGeneric = (
  requirements: IntentRequirements,
  principles: MatchedPrinciple[]
): any => {
  // Default: collect all values
  const algebra: Algebra<any, any[]> = (acc, val) => [...acc, val];
  const init: any[] = [];

  const coalgebra: Coalgebra<any, any> = (state) => {
    if (Array.isArray(state) && state.length > 0) {
      const [head, ...tail] = state;
      return [head, tail];
    }
    return null;
  };

  // If requirements include sort, add sort in postProcess
  let postProcess: ((result: any) => any) | undefined;
  if (requirements.transformation.includes('sort')) {
    postProcess = (values: any[]) => [...values].sort((a, b) => a - b);
  }

  return {
    name: requirements.intent,
    algebra,
    coalgebra,
    init,
    postProcess,
    metadata: {
      generation: 0,
      parents: ['generic'],
      mutations: ['synthesized']
    }
  };
};
