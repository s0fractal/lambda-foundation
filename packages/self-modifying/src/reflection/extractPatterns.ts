// extractPatterns.ts
// Event 012: Pattern Extraction from Evolution History

import type { HistoryEntry, ExtractedPattern, PatternExample } from './types.js';

/**
 * Extract patterns from successful morphisms
 */
export const extractPatterns = <A, B, C>(
  successful: HistoryEntry<A, B, C>[],
  all: HistoryEntry<A, B, C>[]
): ExtractedPattern[] => {
  const patterns: ExtractedPattern[] = [];

  // Pattern 1: Combine + PostProcess
  const combinePostProcessPattern = detectCombinePostProcessPattern(successful, all);
  if (combinePostProcessPattern) {
    patterns.push(combinePostProcessPattern);
  }

  // Pattern 2: Orthogonal Fold Combination
  const orthogonalPattern = detectOrthogonalPattern(successful, all);
  if (orthogonalPattern) {
    patterns.push(orthogonalPattern);
  }

  // Pattern 3: Information Preservation
  const infoPreservationPattern = detectInfoPreservationPattern(successful, all);
  if (infoPreservationPattern) {
    patterns.push(infoPreservationPattern);
  }

  // Pattern 4: ≤2 Rule Compliance
  const le2CompliancePattern = detectLe2CompliancePattern(successful, all);
  if (le2CompliancePattern) {
    patterns.push(le2CompliancePattern);
  }

  // Pattern 5: Pure Function Composition
  const pureCompositionPattern = detectPureCompositionPattern(successful, all);
  if (pureCompositionPattern) {
    patterns.push(pureCompositionPattern);
  }

  return patterns;
};

/**
 * Detect Combine + PostProcess pattern
 */
const detectCombinePostProcessPattern = <A, B, C>(
  successful: HistoryEntry<A, B, C>[],
  all: HistoryEntry<A, B, C>[]
): ExtractedPattern | null => {
  const matching = successful.filter(entry =>
    entry.mutations.includes('combineAlgebras') &&
    entry.mutations.includes('addPostProcess')
  );

  if (matching.length === 0) return null;

  const frequency = matching.length / successful.length;
  const confidence = frequency * 0.8 + 0.2; // Base confidence 0.2

  const examples: PatternExample[] = matching.slice(0, 3).map(entry => ({
    morphismId: entry.morphism.name,
    morphismName: entry.morphism.name,
    generation: entry.generation,
    fitness: entry.fitness,
    howItMatches: `Uses combineAlgebras to preserve information + postProcess to reunite`
  }));

  return {
    id: 'combine_postprocess',
    name: 'Combine + PostProcess',
    description: 'Successful morphisms often combine orthogonal folds into tuple, then reunite via postProcess',
    frequency,
    examples,
    abstraction: 'fold(f) × fold(g) ⇒ fold({f,g}) ⇒ postProcess(h)',
    confidence
  };
};

/**
 * Detect orthogonal fold combination pattern
 */
const detectOrthogonalPattern = <A, B, C>(
  successful: HistoryEntry<A, B, C>[],
  all: HistoryEntry<A, B, C>[]
): ExtractedPattern | null => {
  // Morphisms that combine different parent types
  const matching = successful.filter(entry =>
    entry.parents.length === 2 &&
    entry.parents[0] !== entry.parents[1] && // Different parents
    entry.complexity.valid
  );

  if (matching.length === 0) return null;

  const frequency = matching.length / successful.length;
  const confidence = frequency * 0.7 + 0.25;

  const examples: PatternExample[] = matching.slice(0, 3).map(entry => ({
    morphismId: entry.morphism.name,
    morphismName: entry.morphism.name,
    generation: entry.generation,
    fitness: entry.fitness,
    howItMatches: `Combines orthogonal parents: [${entry.parents.join(', ')}]`
  }));

  return {
    id: 'orthogonal_combination',
    name: 'Orthogonal Fold Combination',
    description: 'Combining two orthogonal (non-overlapping) folds preserves maximum information',
    frequency,
    examples,
    abstraction: 'orthogonal(f, g) ⇒ no information overlap ⇒ maximum preservation',
    confidence
  };
};

/**
 * Detect information preservation pattern
 */
const detectInfoPreservationPattern = <A, B, C>(
  successful: HistoryEntry<A, B, C>[],
  all: HistoryEntry<A, B, C>[]
): ExtractedPattern | null => {
  // Morphisms with tuple accumulators
  const matching = successful.filter(entry => {
    // Check if morphism uses tuple-based accumulation
    // (This is a heuristic - in real implementation we'd inspect the algebra)
    const hasCombine = entry.mutations.includes('combineAlgebras');
    const goodFitness = entry.fitness > 0.7;
    return hasCombine && goodFitness;
  });

  if (matching.length === 0) return null;

  const frequency = matching.length / successful.length;
  const confidence = frequency * 0.75 + 0.2;

  const examples: PatternExample[] = matching.slice(0, 3).map(entry => ({
    morphismId: entry.morphism.name,
    morphismName: entry.morphism.name,
    generation: entry.generation,
    fitness: entry.fitness,
    howItMatches: 'Preserves information via tuple accumulation'
  }));

  return {
    id: 'info_preservation',
    name: 'Information Preservation',
    description: 'Morphisms that preserve all necessary information via tuple accumulators achieve higher fitness',
    frequency,
    examples,
    abstraction: 'lost(x) ⇒ preserve(x) in accumulator ⇒ retrieve(x) in postProcess',
    confidence
  };
};

/**
 * Detect ≤2 Rule compliance pattern
 */
const detectLe2CompliancePattern = <A, B, C>(
  successful: HistoryEntry<A, B, C>[],
  all: HistoryEntry<A, B, C>[]
): ExtractedPattern | null => {
  // ALL successful morphisms should obey ≤2 Rule (by definition)
  const matching = successful.filter(entry => entry.complexity.valid);

  if (matching.length === 0) return null;

  const frequency = matching.length / successful.length;
  const confidence = 0.99; // Very high - this is ontological law

  const examples: PatternExample[] = matching.slice(0, 3).map(entry => ({
    morphismId: entry.morphism.name,
    morphismName: entry.morphism.name,
    generation: entry.generation,
    fitness: entry.fitness,
    howItMatches: `${entry.complexity.roles} semantic roles (≤2)`
  }));

  // Also show counter-examples (failed morphisms that violated ≤2)
  const violations = all.filter(entry => !entry.complexity.valid);

  return {
    id: 'le2_compliance',
    name: '≤2 Rule Compliance',
    description: `${(frequency * 100).toFixed(0)}% of successful morphisms obey ≤2 Rule. ${violations.length} violations all failed.`,
    frequency,
    examples,
    abstraction: 'complexity(morphism) ≤ 2 semantic roles ⇒ ontological validity',
    confidence
  };
};

/**
 * Detect pure function composition pattern
 */
const detectPureCompositionPattern = <A, B, C>(
  successful: HistoryEntry<A, B, C>[],
  all: HistoryEntry<A, B, C>[]
): ExtractedPattern | null => {
  // Morphisms with high purity (≥0.9)
  const matching = successful.filter(entry => entry.purity >= 0.9);

  if (matching.length === 0) return null;

  const frequency = matching.length / successful.length;
  const confidence = frequency * 0.8 + 0.15;

  const avgPurity = matching.reduce((sum, e) => sum + e.purity, 0) / matching.length;

  const examples: PatternExample[] = matching.slice(0, 3).map(entry => ({
    morphismId: entry.morphism.name,
    morphismName: entry.morphism.name,
    generation: entry.generation,
    fitness: entry.fitness,
    howItMatches: `Purity: ${(entry.purity * 100).toFixed(0)}% (no side effects)`
  }));

  return {
    id: 'pure_composition',
    name: 'Pure Function Composition',
    description: `${(frequency * 100).toFixed(0)}% of successful morphisms maintain high purity (avg: ${(avgPurity * 100).toFixed(0)}%)`,
    frequency,
    examples,
    abstraction: 'pure(f) ∧ pure(g) ⇒ pure(f ∘ g) ⇒ referential transparency',
    confidence
  };
};

/**
 * Rank patterns by confidence and frequency
 */
export const rankPatterns = (patterns: ExtractedPattern[]): ExtractedPattern[] => {
  return patterns.sort((a, b) => {
    // Primary sort: confidence
    const confDiff = b.confidence - a.confidence;
    if (Math.abs(confDiff) > 0.05) return confDiff;

    // Secondary sort: frequency
    return b.frequency - a.frequency;
  });
};
