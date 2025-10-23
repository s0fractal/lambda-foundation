// index.ts
// Event 013: Principle-Driven Synthesis Engine
// Direct construction of morphisms from principles

import { analyzeIntent } from './analyzeIntent.js';
import { matchPrinciples, calculateSynthesisConfidence } from './matchPrinciples.js';
import { constructMorphism } from './construct.js';
import { measureComplexity, measurePurity } from '../geneticEngine.js';
import type { Principle } from '../reflection/types.js';
import type { SynthesisPlan, SynthesisResult, SynthesisFailure } from './types.js';

/**
 * Main synthesis function
 * Constructs morphism directly from intent + principles
 */
export const synthesize = (
  intent: string,
  principleBase: Principle[],
  testCases?: Array<{ input: any; expected: any }>
): SynthesisResult | SynthesisFailure => {
  console.log(`\n🎨 Synthesizing morphism for intent: "${intent}"`);

  // Step 1: Analyze intent
  console.log('Step 1: Analyzing intent...');
  const requirements = analyzeIntent(intent);
  console.log(`  Requirements: ${requirements.transformation.join(' → ')}`);

  // Step 2: Match principles
  console.log('Step 2: Matching principles...');
  const matchedPrinciples = matchPrinciples(requirements, principleBase);
  console.log(`  Matched ${matchedPrinciples.length} principles:`);
  for (const match of matchedPrinciples.slice(0, 3)) {
    console.log(`    • ${match.principle.name} (relevance: ${(match.relevance * 100).toFixed(0)}%)`);
  }

  // Calculate synthesis confidence
  const confidence = calculateSynthesisConfidence(matchedPrinciples);
  console.log(`  Synthesis confidence: ${(confidence * 100).toFixed(0)}%`);

  // Check if we have enough confidence to synthesize
  if (confidence < 0.5) {
    console.log(`  ❌ Insufficient confidence (${(confidence * 100).toFixed(0)}% < 50%)`);
    return {
      intent,
      reason: `Insufficient principle matches (confidence: ${(confidence * 100).toFixed(0)}%)`,
      fallback: 'guided_evolution'
    };
  }

  // Step 3: Create synthesis plan
  const plan: SynthesisPlan = {
    intent,
    requirements,
    matchedPrinciples,
    confidence,
    strategy: describeSynthesisStrategy(matchedPrinciples)
  };

  console.log('Step 3: Synthesis plan created');
  console.log(`  Strategy: ${plan.strategy}`);

  // Step 4: Construct morphism
  console.log('Step 4: Constructing morphism...');
  try {
    const morphism = constructMorphism(plan);
    console.log(`  ✅ Morphism constructed: ${morphism.name}`);

    // Step 5: Validate
    console.log('Step 5: Validating...');
    const validation = validateSynthesizedMorphism(morphism, requirements, testCases);

    if (!validation.valid) {
      console.log(`  ❌ Validation failed: ${validation.reason}`);
      // Event 014: Include morphism for failure analysis
      return {
        intent,
        reason: `Validation failed: ${validation.reason}`,
        fallback: 'guided_evolution',
        morphism,
        validation: validation as any,
        plan,
        confidence
      };
    }

    console.log('  ✅ Validation passed:');
    console.log(`    ≤2 Rule: ${validation.complexity.valid ? '✅' : '❌'} (${validation.complexity.roles} roles)`);
    console.log(`    Purity: ${(validation.purity * 100).toFixed(0)}%`);
    if (testCases) {
      console.log(`    Tests: ${validation.testsPass ? '✅' : '❌'}`);
    }

    return {
      morphism,
      plan,
      validation,
      iterations: 1, // Direct synthesis = 1 iteration
      confidence
    };
  } catch (error: any) {
    console.log(`  ❌ Construction failed: ${error.message}`);
    return {
      intent,
      reason: `Construction error: ${error.message}`,
      fallback: 'blind_evolution'
    };
  }
};

/**
 * Describe synthesis strategy from matched principles
 */
const describeSynthesisStrategy = (matches: any[]): string => {
  const parts: string[] = [];

  for (const match of matches.slice(0, 3)) {
    parts.push(match.application);
  }

  return parts.join(' + ');
};

/**
 * Validate synthesized morphism
 */
const validateSynthesizedMorphism = (
  morphism: any,
  requirements: any,
  testCases?: Array<{ input: any; expected: any }>
): {
  valid: boolean;
  complexity: { roles: number; valid: boolean };
  purity: number;
  testsPass: boolean;
  reason?: string;
} => {
  // Check ≤2 Rule
  const complexityMeasure = measureComplexity(morphism.algebra);
  const complexity = {
    roles: complexityMeasure.semanticRoles,
    valid: complexityMeasure.valid
  };

  if (!complexity.valid) {
    return {
      valid: false,
      complexity,
      purity: 0,
      testsPass: false,
      reason: `≤2 Rule violation (${complexity.roles} roles)`
    };
  }

  // Check purity
  const purity = measurePurity(morphism.algebra);
  if (purity < 0.8) {
    return {
      valid: false,
      complexity,
      purity,
      testsPass: false,
      reason: `Low purity (${(purity * 100).toFixed(0)}%)`
    };
  }

  // Run test cases if provided
  let testsPass = true;
  if (testCases && testCases.length > 0) {
    testsPass = runTestCases(morphism, testCases);
    if (!testsPass) {
      return {
        valid: false,
        complexity,
        purity,
        testsPass: false,
        reason: 'Test cases failed'
      };
    }
  }

  return {
    valid: true,
    complexity,
    purity,
    testsPass
  };
};

/**
 * Run test cases on synthesized morphism
 */
const runTestCases = (
  morphism: any,
  testCases: Array<{ input: any; expected: any }>
): boolean => {
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

      // Compare (with tolerance for floating point)
      if (typeof result === 'number' && typeof testCase.expected === 'number') {
        if (Math.abs(result - testCase.expected) > 0.001) {
          return false;
        }
      } else if (JSON.stringify(result) !== JSON.stringify(testCase.expected)) {
        return false;
      }
    } catch (error) {
      return false;
    }
  }

  return true;
};

// Re-export types and utilities
export * from './types.js';
export { analyzeIntent } from './analyzeIntent.js';
export { matchPrinciples } from './matchPrinciples.js';
export { constructMorphism } from './construct.js';

// Event 014: Self-Improvement from Failure
export { analyzeFailure } from './analyzeFailure.js';
export type { FailureAnalysis } from './analyzeFailure.js';
export { extractPrincipleFromFailure } from './extractFromFailure.js';
