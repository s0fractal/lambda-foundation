// analyzeFailure.ts
// Event 014: Failure Analysis for Self-Improvement
// Analyzes WHY synthesis failed and identifies missing concepts

import type { SynthesisFailure, IntentRequirements } from './types.js';
import type { Principle } from '../reflection/types.js';

/**
 * Failure analysis result
 */
export interface FailureAnalysis {
  synthesisAttempt: {
    intent: string;
    morphism?: any;
    confidence: number;
    failureReason: string;
  };
  testFailures?: Array<{
    input: any;
    expected: any;
    actual: any;
    reason: string;
  }>;
  rootCause: string;
  missingConcept: string;
  recommendation: string;
  suggestedPrinciple?: {
    name: string;
    statement: string;
    application: string;
  };
}

/**
 * Analyze why synthesis failed
 * Identifies root cause and missing concepts
 */
export const analyzeFailure = (
  failure: SynthesisFailure | any,
  testCases?: Array<{ input: any; expected: any }>,
  principleBase?: Principle[]
): FailureAnalysis => {
  console.log(`\n🔬 Analyzing synthesis failure...`);
  console.log(`  Intent: "${failure.intent}"`);
  console.log(`  Reason: ${failure.reason}`);

  const analysis: FailureAnalysis = {
    synthesisAttempt: {
      intent: failure.intent,
      morphism: 'morphism' in failure ? failure.morphism : undefined,
      confidence: 'confidence' in failure ? failure.confidence : 0,
      failureReason: failure.reason
    },
    rootCause: '',
    missingConcept: '',
    recommendation: ''
  };

  // Case 1: Test cases failed (morphism created but semantically incorrect)
  if (failure.reason.includes('Test cases failed') && testCases && 'morphism' in failure) {
    console.log(`\n  Failure type: Test validation failed`);
    console.log(`  Analyzing test case execution...`);

    const testFailures = executeTestCases(failure.morphism, testCases);
    analysis.testFailures = testFailures;

    // Analyze pattern of failures
    const rootCause = identifyRootCause(failure.intent, testFailures, principleBase || []);
    analysis.rootCause = rootCause.cause;
    analysis.missingConcept = rootCause.missingConcept;
    analysis.recommendation = rootCause.recommendation;

    if (rootCause.suggestedPrinciple) {
      analysis.suggestedPrinciple = rootCause.suggestedPrinciple;
    }

    console.log(`\n  Root cause: ${analysis.rootCause}`);
    console.log(`  Missing concept: ${analysis.missingConcept}`);
    console.log(`  Recommendation: ${analysis.recommendation}`);
  }
  // Case 2: Insufficient confidence (no morphism created)
  else if (failure.reason.includes('Insufficient')) {
    analysis.rootCause = 'Principle base lacks concepts for this intent';
    analysis.missingConcept = `Concepts specific to "${failure.intent}"`;
    analysis.recommendation = 'Add domain-specific principles';
  }
  // Case 3: Construction error
  else if (failure.reason.includes('Construction error')) {
    analysis.rootCause = 'Matched principles insufficient for construction';
    analysis.missingConcept = 'Complete construction strategy';
    analysis.recommendation = 'Add more detailed construction principles';
  }
  // Case 4: Validation failed (≤2 Rule or purity)
  else if (failure.reason.includes('≤2 Rule') || failure.reason.includes('purity')) {
    analysis.rootCause = 'Constructed morphism violates ontological constraints';
    analysis.missingConcept = 'Simpler construction approach';
    analysis.recommendation = 'Add decomposition principles for complex intents';
  }

  return analysis;
};

/**
 * Execute test cases manually to see actual vs expected
 */
const executeTestCases = (
  morphism: any,
  testCases: Array<{ input: any; expected: any }>
): Array<{ input: any; expected: any; actual: any; reason: string }> => {
  const failures: Array<{ input: any; expected: any; actual: any; reason: string }> = [];

  for (const testCase of testCases) {
    try {
      // Execute morphism
      let result = morphism.init;
      let state = testCase.input;
      let iterations = 0;
      const maxIterations = 10000;

      while (iterations < maxIterations) {
        const next = morphism.coalgebra(state);
        if (next === null || next === undefined) break;

        const [val, newState] = next;
        result = morphism.algebra(result, val);
        state = newState;
        iterations++;
      }

      // Apply postProcess if exists
      if (morphism.postProcess) {
        result = morphism.postProcess(result);
      }

      // Check if matches expected
      const matches = compareResults(result, testCase.expected);

      if (!matches) {
        failures.push({
          input: testCase.input,
          expected: testCase.expected,
          actual: result,
          reason: describeDiscrepancy(testCase.expected, result)
        });
      }
    } catch (error: any) {
      failures.push({
        input: testCase.input,
        expected: testCase.expected,
        actual: null,
        reason: `Execution error: ${error.message}`
      });
    }
  }

  return failures;
};

/**
 * Compare results (with tolerance for floating point)
 */
const compareResults = (actual: any, expected: any): boolean => {
  if (typeof actual === 'number' && typeof expected === 'number') {
    return Math.abs(actual - expected) <= 0.001;
  }
  return JSON.stringify(actual) === JSON.stringify(expected);
};

/**
 * Describe discrepancy between expected and actual
 */
const describeDiscrepancy = (expected: any, actual: any): string => {
  if (typeof expected === 'number' && typeof actual === 'number') {
    if (actual > expected) {
      return `Result too large (${actual} > ${expected})`;
    } else {
      return `Result too small (${actual} < ${expected})`;
    }
  }

  if (Array.isArray(expected) && Array.isArray(actual)) {
    if (actual.length !== expected.length) {
      return `Wrong array length (${actual.length} vs ${expected.length})`;
    }
    return `Array content mismatch`;
  }

  return `Type or value mismatch`;
};

/**
 * Identify root cause from test failures
 */
const identifyRootCause = (
  intent: string,
  failures: Array<{ input: any; expected: any; actual: any; reason: string }>,
  principleBase: Principle[]
): {
  cause: string;
  missingConcept: string;
  recommendation: string;
  suggestedPrinciple?: { name: string; statement: string; application: string };
} => {
  const intentLower = intent.toLowerCase();

  // Case: mode (most frequent element)
  if (intentLower.includes('mode')) {
    // Check if failures show wrong element selection
    const hasWrongSelection = failures.some(f =>
      f.reason.includes('mismatch') || typeof f.expected === 'number'
    );

    if (hasWrongSelection) {
      // Check if principleBase has frequency/counting concept
      const hasFrequencyPrinciple = principleBase.some(p =>
        p.statement.toLowerCase().includes('frequency') ||
        p.statement.toLowerCase().includes('count') ||
        p.statement.toLowerCase().includes('map')
      );

      if (!hasFrequencyPrinciple) {
        return {
          cause: 'Missing principle for frequency tracking',
          missingConcept: 'Accumulator as frequency map (value → count)',
          recommendation: 'Add Map-Based Accumulation principle',
          suggestedPrinciple: {
            name: 'Map-Based Accumulation Principle',
            statement: 'When intent requires frequency/grouping/counting, use Map/Object accumulator to track value occurrences',
            application: 'algebra: (map, val) => { map[val] = (map[val] || 0) + 1; return map; }'
          }
        };
      }
    }
  }

  // Case: median (positional selection after sort)
  if (intentLower.includes('median')) {
    return {
      cause: 'Missing principle for order-dependent selection',
      missingConcept: 'Positional selection after sorting',
      recommendation: 'Add Order-Dependent Selection principle',
      suggestedPrinciple: {
        name: 'Order-Dependent Selection Principle',
        statement: 'When intent requires positional value (median, percentile), preserve order via array + sort in postProcess',
        application: 'algebra: collect array, postProcess: sort + select by index'
      }
    };
  }

  // Case: distinct (unique values)
  if (intentLower.includes('distinct') || intentLower.includes('unique')) {
    // Check if principleBase has Set/uniqueness concept
    const hasSetPrinciple = principleBase.some(p =>
      p.statement.toLowerCase().includes('set') ||
      p.statement.toLowerCase().includes('unique') ||
      p.statement.toLowerCase().includes('distinct')
    );

    if (!hasSetPrinciple) {
      return {
        cause: 'Missing principle for uniqueness tracking',
        missingConcept: 'Accumulator as Set (value deduplication)',
        recommendation: 'Add Set-Based Accumulation principle',
        suggestedPrinciple: {
          name: 'Set-Based Accumulation Principle',
          statement: 'When intent requires uniqueness/distinct values, use Set-like accumulator to track seen values and avoid duplicates',
          application: 'algebra: (seen, val) => seen.has(val) ? seen : seen.add(val), postProcess: Set → Array'
        }
      };
    }
  }

  // Generic case
  return {
    cause: `Synthesis created morphism but logic incorrect for "${intent}"`,
    missingConcept: `Domain-specific concept for "${intent}"`,
    recommendation: 'Analyze test failures to identify missing accumulation strategy'
  };
};
