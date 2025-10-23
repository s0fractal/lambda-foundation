// analyzeIntent.ts
// Event 013: Intent Analysis for Synthesis

import type { IntentRequirements } from './types.js';

/**
 * Analyze intent string and decompose into ontological requirements
 */
export const analyzeIntent = (intent: string): IntentRequirements => {
  const normalized = intent.toLowerCase().trim();

  // Pattern matching for known intents
  if (normalized.includes('median')) {
    return analyzeMedian();
  }

  if (normalized.includes('mode')) {
    return analyzeMode();
  }

  if (normalized.includes('variance') || normalized.includes('spread')) {
    return analyzeVariance();
  }

  if (normalized.includes('standard deviation') || normalized.includes('std')) {
    return analyzeStdDev();
  }

  if (normalized.includes('range')) {
    return analyzeRange();
  }

  if (normalized.includes('first') || normalized.includes('head')) {
    return analyzeFirst();
  }

  if (normalized.includes('last') || normalized.includes('tail')) {
    return analyzeLast();
  }

  if (normalized.includes('distinct') || normalized.includes('unique')) {
    return analyzeDistinct();
  }

  // Fallback: generic analysis
  return analyzeGeneric(normalized);
};

/**
 * Analyze "median" intent
 */
const analyzeMedian = (): IntentRequirements => {
  return {
    intent: 'median',
    input: {
      type: 'sequence',
      constraint: 'comparable elements'
    },
    output: {
      type: 'single',
      position: 'middle',
      property: 'value'
    },
    transformation: ['preserve', 'sort', 'select'],
    constraints: ['≤2 Rule', 'purity', 'total function']
  };
};

/**
 * Analyze "mode" intent
 */
const analyzeMode = (): IntentRequirements => {
  return {
    intent: 'mode',
    input: {
      type: 'sequence'
    },
    output: {
      type: 'single',
      property: 'most frequent value'
    },
    transformation: ['count frequencies', 'find maximum'],
    constraints: ['≤2 Rule', 'purity', 'total function']
  };
};

/**
 * Analyze "variance" intent
 */
const analyzeVariance = (): IntentRequirements => {
  return {
    intent: 'variance',
    input: {
      type: 'sequence',
      constraint: 'numeric elements'
    },
    output: {
      type: 'single',
      property: 'spread measure'
    },
    transformation: ['compute mean', 'compute squared deviations', 'average'],
    constraints: ['≤2 Rule', 'purity', 'total function']
  };
};

/**
 * Analyze "standard deviation" intent
 */
const analyzeStdDev = (): IntentRequirements => {
  return {
    intent: 'standard_deviation',
    input: {
      type: 'sequence',
      constraint: 'numeric elements'
    },
    output: {
      type: 'single',
      property: 'spread measure (square root of variance)'
    },
    transformation: ['compute variance', 'square root'],
    constraints: ['≤2 Rule', 'purity', 'total function']
  };
};

/**
 * Analyze "range" intent
 */
const analyzeRange = (): IntentRequirements => {
  return {
    intent: 'range',
    input: {
      type: 'sequence',
      constraint: 'numeric elements'
    },
    output: {
      type: 'single',
      property: 'max - min'
    },
    transformation: ['find max', 'find min', 'subtract'],
    constraints: ['≤2 Rule', 'purity', 'total function']
  };
};

/**
 * Analyze "first" intent
 */
const analyzeFirst = (): IntentRequirements => {
  return {
    intent: 'first',
    input: {
      type: 'sequence'
    },
    output: {
      type: 'single',
      position: 'first'
    },
    transformation: ['select first'],
    constraints: ['≤2 Rule', 'purity', 'partial function']
  };
};

/**
 * Analyze "last" intent
 */
const analyzeLast = (): IntentRequirements => {
  return {
    intent: 'last',
    input: {
      type: 'sequence'
    },
    output: {
      type: 'single',
      position: 'last'
    },
    transformation: ['preserve', 'select last'],
    constraints: ['≤2 Rule', 'purity', 'partial function']
  };
};

/**
 * Analyze "distinct" intent
 * Event 014: Added for self-improvement demo
 */
const analyzeDistinct = (): IntentRequirements => {
  return {
    intent: 'distinct',
    input: {
      type: 'sequence'
    },
    output: {
      type: 'sequence',
      property: 'unique values only'
    },
    transformation: ['deduplicate', 'preserve order'],
    constraints: ['≤2 Rule', 'purity', 'total function']
  };
};

/**
 * Generic analysis for unknown intents
 */
const analyzeGeneric = (intent: string): IntentRequirements => {
  // Try to infer from keywords
  const hasPreserve = intent.includes('all') || intent.includes('collect') || intent.includes('list');
  const hasSort = intent.includes('sort') || intent.includes('order');
  const hasSelect = intent.includes('select') || intent.includes('pick') || intent.includes('choose');
  const hasAggregate = intent.includes('sum') || intent.includes('count') || intent.includes('total');

  const transformation: string[] = [];
  if (hasPreserve) transformation.push('preserve');
  if (hasSort) transformation.push('sort');
  if (hasSelect) transformation.push('select');
  if (hasAggregate) transformation.push('aggregate');

  return {
    intent,
    input: {
      type: 'sequence'
    },
    output: {
      type: transformation.includes('aggregate') ? 'single' : 'sequence'
    },
    transformation: transformation.length > 0 ? transformation : ['unknown'],
    constraints: ['≤2 Rule', 'purity']
  };
};
