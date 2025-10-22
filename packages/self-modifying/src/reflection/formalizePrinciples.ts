// formalizePrinciples.ts
// Event 012: Formalizing Principles from Patterns

import type { ExtractedPattern, Principle, HistoryEntry } from './types.js';

/**
 * Formalize patterns into actionable principles
 */
export const formalizePrinciples = <A, B, C>(
  patterns: ExtractedPattern[],
  successful: HistoryEntry<A, B, C>[],
  failed: HistoryEntry<A, B, C>[]
): Principle[] => {
  const principles: Principle[] = [];

  for (const pattern of patterns) {
    const principle = patternToPrinciple(pattern, successful, failed);
    if (principle) {
      principles.push(principle);
    }
  }

  return principles;
};

/**
 * Convert a pattern into a formal principle
 */
const patternToPrinciple = <A, B, C>(
  pattern: ExtractedPattern,
  successful: HistoryEntry<A, B, C>[],
  failed: HistoryEntry<A, B, C>[]
): Principle | null => {
  switch (pattern.id) {
    case 'combine_postprocess':
      return {
        id: 'info_reunion',
        name: 'Information Reunion Principle',
        statement: 'When intent requires multiple independent measurements, combine via tuple accumulation + postProcess reunification',

        positiveExamples: pattern.examples.map(ex => ex.morphismName),
        negativeExamples: findCounterExamples('combine_postprocess', failed),

        application: 'When designing morphism that needs multiple aspects: (1) Use combineAlgebras to preserve orthogonal aspects, (2) Add postProcess to reunite into final form, (3) Verify ≤2 Rule compliance',

        status: determineStatus(pattern.confidence, pattern.frequency),
        resonances: 0, // Will be filled by community
        confidence: pattern.confidence,

        obeysLe2Rule: true, // This principle itself uses 2 roles: (combine, reunite)
        complexity: {
          roles: 2,
          valid: true
        }
      };

    case 'orthogonal_combination':
      return {
        id: 'orthogonality',
        name: 'Orthogonality Principle',
        statement: 'Combining two orthogonal (non-overlapping) folds preserves maximum information without violating ≤2 Rule',

        positiveExamples: pattern.examples.map(ex => ex.morphismName),
        negativeExamples: findCounterExamples('orthogonal_combination', failed),

        application: 'When selecting parents for crossover: (1) Choose parents that measure different aspects, (2) Verify no information overlap, (3) Combine preserves both independently',

        status: determineStatus(pattern.confidence, pattern.frequency),
        resonances: 0,
        confidence: pattern.confidence,

        obeysLe2Rule: true,
        complexity: {
          roles: 2, // Two orthogonal aspects
          valid: true
        }
      };

    case 'info_preservation':
      return {
        id: 'preservation',
        name: 'Information Preservation Principle',
        statement: 'Catamorphism must preserve sufficient information to reconstruct intent. Lost information must be captured in accumulator.',

        positiveExamples: pattern.examples.map(ex => ex.morphismName),
        negativeExamples: findCounterExamples('info_preservation', failed),

        application: 'When defining fold: (1) Identify what information is lost, (2) Preserve it in accumulator structure (tuple/record), (3) Verify all test cases can be satisfied',

        status: determineStatus(pattern.confidence, pattern.frequency),
        resonances: 0,
        confidence: pattern.confidence,

        obeysLe2Rule: true,
        complexity: {
          roles: 2, // (information, preservation)
          valid: true
        }
      };

    case 'le2_compliance':
      return {
        id: 'le2_rule',
        name: '≤2 Rule (Ontological Constraint)',
        statement: 'All morphisms MUST have ≤2 semantic roles. This is not optimization - this is ontological validity.',

        positiveExamples: pattern.examples.map(ex => ex.morphismName),
        negativeExamples: failed.filter(e => !e.complexity.valid).map(e => e.morphism.name),

        application: 'Before accepting any morphism: (1) Count semantic roles, (2) If >2, reject immediately (fitness = 0), (3) This is non-negotiable',

        status: 'canonical', // This is THE fundamental law
        resonances: successful.length, // Every successful morphism validates this
        confidence: 0.99,

        obeysLe2Rule: true,
        complexity: {
          roles: 1, // Single constraint
          valid: true
        }
      };

    case 'pure_composition':
      return {
        id: 'purity',
        name: 'Purity Principle',
        statement: 'Morphisms composed from pure functions inherit purity. Referential transparency enables mathematical reasoning.',

        positiveExamples: pattern.examples.map(ex => ex.morphismName),
        negativeExamples: findCounterExamples('pure_composition', failed),

        application: 'When composing morphisms: (1) Verify all components are pure, (2) Avoid side effects (console, mutations, randomness), (3) Composition preserves purity',

        status: determineStatus(pattern.confidence, pattern.frequency),
        resonances: 0,
        confidence: pattern.confidence,

        obeysLe2Rule: true,
        complexity: {
          roles: 1, // Single property (purity)
          valid: true
        }
      };

    default:
      return null;
  }
};

/**
 * Find counter-examples (failed morphisms) that violated a pattern
 */
const findCounterExamples = <A, B, C>(
  patternId: string,
  failed: HistoryEntry<A, B, C>[]
): string[] => {
  switch (patternId) {
    case 'combine_postprocess':
      // Failed morphisms that tried to combine but didn't add postProcess
      return failed
        .filter(e => e.mutations.includes('combineAlgebras') && !e.mutations.includes('addPostProcess'))
        .map(e => e.morphism.name)
        .slice(0, 3);

    case 'orthogonal_combination':
      // Failed morphisms that combined overlapping parents
      return failed
        .filter(e => e.parents.length === 2 && e.parents[0] === e.parents[1])
        .map(e => e.morphism.name)
        .slice(0, 3);

    case 'info_preservation':
      // Failed morphisms with low fitness (likely lost information)
      return failed
        .filter(e => e.fitness < 0.3)
        .map(e => e.morphism.name)
        .slice(0, 3);

    case 'pure_composition':
      // Failed morphisms with low purity
      return failed
        .filter(e => e.purity < 0.5)
        .map(e => e.morphism.name)
        .slice(0, 3);

    default:
      return [];
  }
};

/**
 * Determine principle status based on confidence and frequency
 */
const determineStatus = (confidence: number, frequency: number): 'candidate' | 'verified' | 'canonical' => {
  // High confidence + high frequency = canonical
  if (confidence >= 0.85 && frequency >= 0.7) {
    return 'canonical';
  }

  // Medium confidence/frequency = verified
  if (confidence >= 0.6 && frequency >= 0.4) {
    return 'verified';
  }

  // Otherwise candidate
  return 'candidate';
};

/**
 * Validate that principle itself obeys ≤2 Rule
 * (Meta-reflection: principles about morphisms should follow same rules)
 */
export const validatePrinciplesObeyle2Rule = (principles: Principle[]): {
  valid: Principle[];
  invalid: Principle[];
} => {
  const valid = principles.filter(p => p.obeysLe2Rule && p.complexity.valid);
  const invalid = principles.filter(p => !p.obeysLe2Rule || !p.complexity.valid);

  return { valid, invalid };
};

/**
 * Rank principles by status and confidence
 */
export const rankPrinciples = (principles: Principle[]): Principle[] => {
  const statusOrder = { canonical: 3, verified: 2, candidate: 1 };

  return principles.sort((a, b) => {
    // Primary: status
    const statusDiff = statusOrder[b.status] - statusOrder[a.status];
    if (statusDiff !== 0) return statusDiff;

    // Secondary: confidence
    const confDiff = b.confidence - a.confidence;
    if (Math.abs(confDiff) > 0.05) return confDiff;

    // Tertiary: resonances
    return b.resonances - a.resonances;
  });
};
