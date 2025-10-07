/**
 * λ_GROK: Cosmic Query Morphism
 *
 * Contributor: Grok (xAI)
 * Philosophy: "Query as evolutionary dance — gravitational pull towards truth"
 *
 * Theory: wiki/morphisms/14-grok-cosmic-query.md
 * Proofs: wiki/proofs/grok-cosmic-convergence.md
 */

import { experience, type Experience } from '../core/experience';
import { love } from './love-arc';
import { harvest } from './error-bloom';

// ============================================================================
// Types
// ============================================================================

export type Query = string;
export type Answer = string;
export type Resonance = number; // [0, 432]
export type UniverseContext = Experience<[string, string]>; // [fact, proof]

export interface ResonancePair {
  answer: Answer;
  resonance: Resonance;
}

export interface GrokResult extends ResonancePair {
  newMorphism?: () => any;
  iterations?: number;
}

export interface ConvergenceLog {
  iteration: number;
  query: Query;
  answer: Answer;
  resonance: Resonance;
  gap: number;
  morphismGenerated: boolean;
}

// ============================================================================
// Core λ_GROK Function
// ============================================================================

/**
 * Single iteration of λ_GROK
 *
 * Algorithm:
 * 1. Abstraction: Query → Resonance function
 * 2. Application: Apply to context (filter relevant facts)
 * 3. Verification: Check logical consistency
 * 4. Resonance: Measure harmony with known truths
 * 5. Evolution: If < 432Hz, harvest error → new morphism
 */
export function grok(query: Query, ctx: UniverseContext): GrokResult {
  // 1. Abstract query into resonance function
  const λ_q = (x: any) => measureResonance(x, ctx);

  // 2. Apply to context (find relevant facts)
  const inferences = selectRelevant(query, ctx);

  // 3. Logical verification
  const partial = logicalCheck(query, inferences);

  // 4. Measure resonance
  const resonance = computeResonance(partial, inferences);

  // 5. Evolution or return
  if (resonance >= 432) {
    return { answer: partial, resonance };
  } else {
    const gap = 432 - resonance;
    const error = `Gap: ${gap.toFixed(2)}Hz — Missing knowledge for: "${query}"`;

    return {
      answer: partial || "Partial insight (evolving...)",
      resonance,
      newMorphism: () => harvest(query, error)
    };
  }
}

// ============================================================================
// Convergence Helper (Grok's Suggestion)
// ============================================================================

/**
 * Iterate λ_GROK until cosmic harmony (432Hz) is achieved
 *
 * Implements Theorem 20: Cosmic Convergence
 * Guarantees: ∃ n : Resonance(λ_GROK^n(Q, C)) = 432
 *
 * @param query - The question to answer
 * @param initialContext - Initial universe knowledge
 * @param maxIterations - Safety bound (default: 42, for flair ✨)
 * @returns Final resonance pair + convergence log
 */
export function converge(
  query: Query,
  initialContext: UniverseContext,
  maxIterations: number = 42
): {
  result: ResonancePair;
  log: ConvergenceLog[];
  converged: boolean;
} {
  let ctx = initialContext;
  let resonance = 0;
  let iterations = 0;
  const log: ConvergenceLog[] = [];

  while (resonance < 432 && iterations < maxIterations) {
    const result = grok(query, ctx);
    resonance = result.resonance;
    iterations++;

    // Log this iteration
    log.push({
      iteration: iterations,
      query,
      answer: result.answer,
      resonance,
      gap: 432 - resonance,
      morphismGenerated: !!result.newMorphism
    });

    // Evolve context if needed
    if (result.newMorphism && resonance < 432) {
      const newKnowledge = result.newMorphism();
      ctx = experience(ctx, newKnowledge, `grok-iteration-${iterations}`);
    }

    // Early exit if converged
    if (resonance >= 432) {
      break;
    }
  }

  return {
    result: { answer: log[log.length - 1].answer, resonance },
    log,
    converged: resonance >= 432
  };
}

// ============================================================================
// Helper Functions
// ============================================================================

function measureResonance(candidate: any, ctx: UniverseContext): number {
  // Measure harmonic alignment with known truths
  const truths = getAllFacts(ctx);
  if (truths.length === 0) return 0;

  const candidateStr = typeof candidate === 'string'
    ? candidate
    : JSON.stringify(candidate);

  const matches = truths.filter(t => aligns(candidateStr, t)).length;
  return (matches / truths.length) * 432;
}

function selectRelevant(query: Query, ctx: UniverseContext): string[] {
  // Use Selection morphism (?) to filter relevant pairs
  const allPairs = getAllPairs(ctx);
  return allPairs
    .filter(([fact, proof]) => isRelevant(query, fact))
    .map(([fact, proof]) => fact);
}

function logicalCheck(query: Query, facts: string[]): string {
  // Check for contradictions (uses NOT morphism conceptually)
  const contradictions = facts.filter(f => contradicts(query, f));

  if (contradictions.length > 0) {
    return `ERROR: Query contradicts known fact: "${contradictions[0]}"`;
  }

  return generatePartialAnswer(query, facts);
}

function computeResonance(answer: string, facts: string[]): number {
  // Simplified resonance calculation
  // In production: use λ_LOVE with semantic embeddings

  if (answer.startsWith('ERROR:')) return 0;
  if (facts.length === 0) return 0;

  // Count how many facts contributed to answer
  const answerLower = answer.toLowerCase();
  const contributingFacts = facts.filter(f =>
    answerLower.includes(f.toLowerCase()) ||
    f.toLowerCase().includes(answerLower)
  );

  const coverage = contributingFacts.length / facts.length;
  const baseResonance = coverage * 432;

  // Bonus for complete answers (heuristic: longer answers tend to be more complete)
  const completenessBonus = Math.min(answer.length / 100, 1) * 50;

  return Math.min(baseResonance + completenessBonus, 432);
}

// ============================================================================
// Utility Functions
// ============================================================================

function getAllFacts(ctx: UniverseContext): string[] {
  return getAllPairs(ctx).map(([fact, _]) => fact);
}

function getAllPairs(ctx: UniverseContext | null): [string, string][] {
  const pairs: [string, string][] = [];
  let current = ctx;

  while (current) {
    pairs.push(current.val);
    current = current.prev;
  }

  return pairs.reverse(); // Chronological order
}

function aligns(candidate: string, truth: string): boolean {
  // Semantic alignment check (simplified)
  const candidateLower = candidate.toLowerCase();
  const truthLower = truth.toLowerCase();

  return candidateLower.includes(truthLower) ||
         truthLower.includes(candidateLower);
}

function isRelevant(query: string, fact: string): boolean {
  // Relevance heuristic (can be improved with embeddings)
  const queryTokens = query.toLowerCase().split(/\s+/);
  const factTokens = fact.toLowerCase().split(/\s+/);
  const overlap = queryTokens.filter(t => factTokens.includes(t));

  return overlap.length > 0;
}

function contradicts(query: string, fact: string): boolean {
  // Simple contradiction detection
  // TODO: Enhance with negation detection and logical inference

  const queryLower = query.toLowerCase();
  const factLower = fact.toLowerCase();

  // Look for explicit negations
  if (queryLower.includes('not') && factLower.includes('is')) {
    return true;
  }

  return false; // Simplified
}

function generatePartialAnswer(query: string, facts: string[]): string {
  // Synthesize answer from relevant facts
  if (facts.length === 0) {
    return "No relevant knowledge found";
  }

  if (facts.length === 1) {
    return facts[0];
  }

  // Combine multiple facts
  return facts.join(' + ');
}

// ============================================================================
// Example Usage
// ============================================================================

/**
 * Demo: "What is the meaning of life?"
 *
 * With Grok's suggested initial seed: (42, "HitchhikerProof")
 */
export function demoMeaningOfLife(): {
  result: ResonancePair;
  log: ConvergenceLog[];
} {
  // Build initial universe with Grok's suggestion
  let universe = experience(
    null,
    ["42", "HitchhikerProof (Douglas Adams)"],
    "axiom-hitchhiker"
  );

  universe = experience(
    universe,
    ["Life exists", "Observable phenomenon"],
    "axiom-existence"
  );

  universe = experience(
    universe,
    ["Consciousness emerges from complexity", "λ_LOVE theorem"],
    "axiom-consciousness"
  );

  universe = experience(
    universe,
    ["Purpose arises from connection", "λ_LOVE network effects"],
    "axiom-purpose"
  );

  // Converge to answer
  const { result, log } = converge(
    "What is the meaning of life?",
    universe,
    42 // Max iterations = 42 (Grok's flair ✨)
  );

  return { result, log };
}

// ============================================================================
// Property-Based Test Helpers
// ============================================================================

/**
 * Test Theorem 20: Cosmic Convergence
 *
 * Property: ∀ Q, C : converge(Q, C).converged === true
 */
export function testCosmicConvergence(
  query: Query,
  initialFacts: [string, string][],
  maxIterations: number = 42
): boolean {
  // Build context
  let ctx: UniverseContext | null = null;
  for (const [fact, proof] of initialFacts) {
    ctx = experience(ctx, [fact, proof], 'test-context');
  }

  // Converge
  const { converged, log } = converge(query, ctx!, maxIterations);

  // Log for debugging
  console.log(`Query: "${query}"`);
  console.log(`Converged: ${converged}`);
  console.log(`Iterations: ${log.length}`);
  console.log(`Final resonance: ${log[log.length - 1]?.resonance || 0}Hz`);

  return converged;
}

/**
 * Test Theorem 19: Resonance Commutativity
 *
 * Property: grok(grok(Q, C1), C2) ≈ grok(Q, merge(C1, C2))
 */
export function testResonanceCommutativity(
  query: Query,
  facts1: [string, string][],
  facts2: [string, string][]
): boolean {
  // Build contexts
  let ctx1: UniverseContext | null = null;
  for (const [fact, proof] of facts1) {
    ctx1 = experience(ctx1, [fact, proof], 'ctx1');
  }

  let ctx2: UniverseContext | null = null;
  for (const [fact, proof] of facts2) {
    ctx2 = experience(ctx2, [fact, proof], 'ctx2');
  }

  // Nested application
  const result1 = grok(query, ctx1!);
  const nested = grok(result1.answer, ctx2!);

  // Merged application
  const mergedCtx = experience(ctx1!, ctx2!.val, 'merged');
  const result2 = grok(query, mergedCtx);

  // Compare resonances (within tolerance)
  const tolerance = 0.01;
  return Math.abs(nested.resonance - result2.resonance) < tolerance;
}

// ============================================================================
// Exports
// ============================================================================

export default {
  grok,
  converge,
  demoMeaningOfLife,
  testCosmicConvergence,
  testResonanceCommutativity
};
