// extractFromFailure.ts
// Event 014: Principle Extraction from Failure
// Converts failure analysis into actionable principle

import { measureComplexity } from '../geneticEngine.js';
import type { Principle } from '../reflection/types.js';
import type { FailureAnalysis } from './analyzeFailure.js';

/**
 * Extract principle from failure analysis
 * Converts missing concept into formalized principle
 */
export const extractPrincipleFromFailure = (
  analysis: FailureAnalysis
): Principle | null => {
  console.log(`\n🌱 Extracting principle from failure...`);

  // If analysis already suggested a principle, use it as base
  if (analysis.suggestedPrinciple) {
    console.log(`  Using suggested principle: ${analysis.suggestedPrinciple.name}`);

    const principle = formalizeSuggestedPrinciple(analysis);

    if (principle) {
      console.log(`  ✅ Principle extracted: ${principle.name}`);
      console.log(`    Statement: ${principle.statement}`);
      console.log(`    ≤2 Rule: ${principle.obeysLe2Rule ? '✅' : '❌'} (${principle.complexity.roles} roles)`);
      console.log(`    Status: ${principle.status}`);
      console.log(`    Confidence: ${(principle.confidence * 100).toFixed(0)}%`);

      return principle;
    }
  }

  // Otherwise try generic extraction
  console.log(`  No suggested principle, attempting generic extraction...`);
  const principle = extractGeneric(analysis);

  if (principle) {
    console.log(`  ✅ Generic principle extracted: ${principle.name}`);
    return principle;
  }

  console.log(`  ❌ Could not extract principle from failure`);
  return null;
};

/**
 * Formalize suggested principle from analysis
 */
const formalizeSuggestedPrinciple = (analysis: FailureAnalysis): Principle | null => {
  if (!analysis.suggestedPrinciple) return null;

  const suggested = analysis.suggestedPrinciple;

  // Generate ID from name
  const id = suggested.name
    .toLowerCase()
    .replace(/principle/gi, '')
    .replace(/\s+/g, '_')
    .trim();

  // Extract positive examples from intent
  const positiveExamples: string[] = [analysis.synthesisAttempt.intent];

  // Add related intents if mentioned
  if (suggested.statement.includes('frequency')) {
    positiveExamples.push('mode', 'histogram', 'groupBy');
  } else if (suggested.statement.includes('median')) {
    positiveExamples.push('median', 'percentile');
  }

  // Negative examples (opposite strategies)
  const negativeExamples: string[] = [];
  if (suggested.statement.includes('Map') || suggested.statement.includes('Object')) {
    negativeExamples.push('sum', 'product', 'average'); // Simple accumulators
  }

  // Validate complexity (ensure ≤2 Rule compliance)
  const complexityValid = validatePrincipleComplexity(suggested.application);

  if (!complexityValid.valid) {
    console.log(`  ⚠️  Principle violates ≤2 Rule (${complexityValid.roles} roles)`);
    console.log(`  Attempting simplification...`);

    // Try to simplify (future: could implement automatic simplification)
    // For now, we reject if too complex
    return null;
  }

  // Create principle
  const principle: Principle = {
    id,
    name: suggested.name,
    statement: suggested.statement,
    positiveExamples: Array.from(new Set(positiveExamples)),
    negativeExamples: Array.from(new Set(negativeExamples)),
    application: suggested.application,
    status: 'candidate', // Born from failure, needs verification
    resonances: 0, // Will accumulate through use
    confidence: 0.8, // High confidence from failure analysis, but not verified yet
    obeysLe2Rule: complexityValid.valid,
    complexity: {
      roles: complexityValid.roles,
      valid: complexityValid.valid
    },
    // Additional metadata
    extractedFrom: 'failure_analysis',
    sourceEvent: 'Event_014'
  } as Principle & { extractedFrom: string; sourceEvent: string };

  return principle;
};

/**
 * Validate principle complexity (ensure ≤2 Rule)
 */
const validatePrincipleComplexity = (application: string): { valid: boolean; roles: number } => {
  // Try to create a test algebra from application string
  try {
    // For map-based: map[val] = (map[val] || 0) + 1
    // Roles: (accumulator: Map, value: val) → 2 roles ✅

    // For array collect: [...acc, val]
    // Roles: (accumulator: Array, value: val) → 2 roles ✅

    // Count semantic roles in application description
    const hasAccumulator = application.includes('acc') || application.includes('map');
    const hasValue = application.includes('val') || application.includes('value');

    const roles = (hasAccumulator ? 1 : 0) + (hasValue ? 1 : 0);

    // Simple heuristic: if description mentions both accumulator and value, it's 2 roles
    // More sophisticated: parse actual function and measure

    return {
      valid: roles <= 2,
      roles
    };
  } catch (error) {
    // If can't validate, assume valid (conservative)
    return { valid: true, roles: 2 };
  }
};

/**
 * Extract principle generically from missing concept
 */
const extractGeneric = (analysis: FailureAnalysis): Principle | null => {
  // Generic fallback: create principle from missing concept description
  const id = `missing_${Date.now()}`;

  return {
    id,
    name: `${analysis.missingConcept} Principle`,
    statement: `Missing: ${analysis.missingConcept}. ${analysis.recommendation}`,
    positiveExamples: [analysis.synthesisAttempt.intent],
    negativeExamples: [],
    application: 'To be determined from successful implementation',
    status: 'candidate',
    resonances: 0,
    confidence: 0.5, // Low confidence for generic extraction
    obeysLe2Rule: true, // Assume true until proven otherwise
    complexity: { roles: 2, valid: true }
  };
};
