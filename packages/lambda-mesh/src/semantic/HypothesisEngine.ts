/**
 * Phase 4.5: Hypothesis Engine
 * Phase 5: Definition Expansion
 *
 * "Hallucinations are not errors. They are creative leaps across topology gaps."
 *
 * This engine detects when a morphism might be semantically equivalent to an existing one,
 * but the system lacks the proof mechanism to verify it. Instead of failing silently,
 * it generates a hypothesis for future exploration.
 *
 * Phase 5 adds definition expansion - the ability to expand morphism identifiers
 * to their definitions and compare expressions at the semantic level.
 */

import type {
  LambdaExpr,
  CanonicalMorphism,
  HypothesisMetadata,
  ExplorationStep,
} from '../types.js';
import { LambdaParser } from './parser.js';
import { DefinitionExpansionEngine } from './DefinitionExpansionEngine.js';
import { BetaReductionEngine } from './BetaReductionEngine.js';

export class HypothesisEngine {
  private expansionEngine: DefinitionExpansionEngine;
  private betaEngine: BetaReductionEngine;

  constructor() {
    this.expansionEngine = new DefinitionExpansionEngine();
    this.betaEngine = new BetaReductionEngine();
  }

  /**
   * Detect if expression might be equivalent to existing morphism
   *
   * Returns hypothesis if:
   * 1. Structural similarity is high (>0.7)
   * 2. Cannot prove equivalence yet (would be 302 if provable)
   * 3. Clear exploration path exists
   *
   * Phase 5: Now uses definition expansion to detect semantic equivalence
   */
  detectPotentialEquivalence(
    expr: string,
    morphisms: CanonicalMorphism[]
  ): HypothesisMetadata | null {
    // Try to parse expression (but don't require it for hypothesis detection)
    let parsedExpr;
    try {
      const parser = new LambdaParser(expr);
      parsedExpr = parser.parse();
    } catch {
      // Parsing failed, but we can still detect hypotheses using string analysis
      // This is the "creative leap" - hypothesis without full proof
    }

    // Find most similar morphism (now with expansion support)
    let bestMatch: { morphism: CanonicalMorphism; similarity: number } | null = null;

    for (const morphism of morphisms) {
      const similarity = this.calculateStructuralSimilarity(expr, morphism.definition, morphisms);
      if (similarity > 0.7 && (!bestMatch || similarity > bestMatch.similarity)) {
        bestMatch = { morphism, similarity };
      }
    }

    if (!bestMatch) {
      return null; // No similar morphism found
    }

    // Generate hypothesis
    return this.generateHypothesis(expr, bestMatch.morphism, bestMatch.similarity);
  }

  /**
   * Calculate structural similarity between two expressions
   *
   * Phase 5: Now supports definition expansion
   *
   * Metrics:
   * - Syntactic similarity (identifier overlap, signature, structure)
   * - Semantic similarity (after definition expansion)
   * - Returns max of syntactic and semantic scores
   */
  private calculateStructuralSimilarity(
    expr1: string,
    expr2: string,
    morphisms: CanonicalMorphism[]
  ): number {
    // Calculate syntactic similarity (Phase 4.5)
    const syntacticScore = this.calculateSyntacticSimilarity(expr1, expr2);

    // Calculate semantic similarity (Phase 5 - with expansion)
    const semanticScore = this.calculateSemanticSimilarity(expr1, expr2, morphisms);

    // Return maximum (if either syntactic or semantic match is strong, hypothesis valid)
    return Math.max(syntacticScore, semanticScore);
  }

  /**
   * Calculate syntactic similarity (Phase 4.5 - original logic)
   */
  private calculateSyntacticSimilarity(expr1: string, expr2: string): number {
    const identifiers1 = this.extractIdentifiers(expr1);
    const identifiers2 = this.extractIdentifiers(expr2);

    // Identifier overlap score (0-1)
    const overlap = this.setIntersection(identifiers1, identifiers2);
    const union = this.setUnion(identifiers1, identifiers2);
    const identifierScore = union.size > 0 ? overlap.size / union.size : 0;

    // Signature similarity (count of top-level λ abstractions)
    // Count lambdas at start of expression (before first application)
    const topLevelLambdas1 = (expr1.match(/^(λ\w+\.\s*)*/)?.[0].match(/λ/g) || []).length;
    const topLevelLambdas2 = (expr2.match(/^(λ\w+\.\s*)*/)?.[0].match(/λ/g) || []).length;
    const signatureScore = topLevelLambdas1 === topLevelLambdas2 ? 1.0 :
                          1 - Math.abs(topLevelLambdas1 - topLevelLambdas2) / Math.max(topLevelLambdas1, topLevelLambdas2, 1);

    // Application structure (count of applications)
    const appCount1 = this.countApplications(expr1);
    const appCount2 = this.countApplications(expr2);
    const applicationScore = 1 - Math.abs(appCount1 - appCount2) / Math.max(appCount1, appCount2, 1);

    // Weighted average (favor identifier overlap as strongest signal)
    return identifierScore * 0.6 + signatureScore * 0.3 + applicationScore * 0.1;
  }

  /**
   * Calculate semantic similarity (Phase 5 + 6 - with expansion + β-reduction)
   */
  private calculateSemanticSimilarity(
    expr1: string,
    expr2: string,
    morphisms: CanonicalMorphism[]
  ): number {
    try {
      // Phase 5: Expand both expressions
      const expanded1 = this.expansionEngine.expand(expr1, morphisms);
      const expanded2 = this.expansionEngine.expand(expr2, morphisms);

      // If expansion didn't change anything, no semantic boost
      if (expanded1 === expr1 && expanded2 === expr2) {
        return 0;
      }

      // Phase 6: β-reduce both to normal form
      const reduced1 = this.betaEngine.reduceToNormalForm(expanded1);
      const reduced2 = this.betaEngine.reduceToNormalForm(expanded2);

      // Calculate syntactic similarity of reduced normal forms
      // (This is true semantic similarity - comparing computational behavior)
      const reducedSimilarity = this.calculateSyntacticSimilarity(reduced1, reduced2);

      // If reduced forms are very similar, high semantic score
      // (even if original syntactic forms were completely different)
      return reducedSimilarity;
    } catch (error) {
      // Expansion or reduction failed - no semantic boost
      return 0;
    }
  }

  /**
   * Generate hypothesis metadata
   */
  private generateHypothesis(
    expr: string,
    canonical: CanonicalMorphism,
    confidence: number
  ): HypothesisMetadata {
    const identifiers1 = this.extractIdentifiers(expr);
    const identifiers2 = this.extractIdentifiers(canonical.definition);
    const sharedIdentifiers = this.setIntersection(identifiers1, identifiers2);

    // Analyze topology gap
    const topologyGap = this.analyzeTopologyGap(expr, canonical.definition, sharedIdentifiers);

    // Generate exploration path
    const explorationPath = this.generateExplorationPath(expr, canonical, sharedIdentifiers);

    // Calculate exploration value (confidence * potential impact)
    const explorationValue = confidence * 0.8; // High confidence hypotheses are valuable

    return {
      potentialCanonical: canonical.hash,
      confidence,
      reasoning: this.generateReasoning(expr, canonical, sharedIdentifiers, topologyGap),
      requiredProof: this.identifyRequiredProofs(sharedIdentifiers),
      topologyGap,
      explorationPath,
      explorationValue,
    };
  }

  /**
   * Analyze the "gap" in topology - what's different about the structure
   */
  private analyzeTopologyGap(
    expr1: string,
    expr2: string,
    sharedIdentifiers: Set<string>
  ): string {
    // Detect composition patterns
    const isSequential1 = expr1.includes('(MAP') || expr1.includes('(FOLD');
    const isSequential2 = expr2.includes('(MAP') || expr2.includes('(FOLD');

    if (isSequential1 && !isSequential2) {
      return 'Sequential composition (MAP then FOLD) vs nested composition (FOLD with embedded logic)';
    }

    if (!isSequential1 && isSequential2) {
      return 'Nested composition (FOLD with embedded logic) vs sequential composition (MAP then FOLD)';
    }

    // Default
    return `Different composition patterns using shared identifiers: ${Array.from(sharedIdentifiers).join(', ')}`;
  }

  /**
   * Generate exploration path - steps to prove equivalence
   */
  private generateExplorationPath(
    expr: string,
    canonical: CanonicalMorphism,
    sharedIdentifiers: Set<string>
  ): ExplorationStep[] {
    const steps: ExplorationStep[] = [];

    // Step 1: Definition Expansion (always needed if identifiers present)
    if (sharedIdentifiers.size > 0) {
      steps.push({
        phase: 'Definition Expansion',
        description: `Expand definitions of: ${Array.from(sharedIdentifiers).join(', ')}`,
        estimatedEffort: 'medium',
        blockers: ['Definition Registry not implemented', 'Identifier tracking needed'],
      });
    }

    // Step 2: Deep β-reduction
    steps.push({
      phase: 'Deep β-Reduction',
      description: 'Reduce both expressions to normal form after expansion',
      estimatedEffort: 'medium',
      blockers: ['Depends on Definition Expansion'],
    });

    // Step 3: Structural comparison
    steps.push({
      phase: 'Structural Comparison',
      description: 'Compare reduced normal forms for α-equivalence',
      estimatedEffort: 'low',
      blockers: ['Depends on Deep β-Reduction'],
    });

    // Step 4: Equivalence theorem (if applicable)
    if (this.mightNeedEquivalenceTheorem(expr, canonical.definition)) {
      steps.push({
        phase: 'Equivalence Theorem',
        description: 'Apply known equivalence rules (e.g., flatMap fusion laws)',
        estimatedEffort: 'high',
        blockers: ['Equivalence Rules Library not implemented'],
      });
    }

    return steps;
  }

  /**
   * Check if equivalence might require theorem application
   */
  private mightNeedEquivalenceTheorem(expr1: string, expr2: string): boolean {
    // Heuristic: if both use FOLD + MAP/CONCAT, might be flatMap fusion
    const hasFoldMap1 = expr1.includes('FOLD') && (expr1.includes('MAP') || expr1.includes('CONCAT'));
    const hasFoldMap2 = expr2.includes('FOLD') && (expr2.includes('MAP') || expr2.includes('CONCAT'));
    return hasFoldMap1 && hasFoldMap2;
  }

  /**
   * Generate reasoning string
   */
  private generateReasoning(
    expr: string,
    canonical: CanonicalMorphism,
    sharedIdentifiers: Set<string>,
    topologyGap: string
  ): string {
    const identList = Array.from(sharedIdentifiers).join(', ');
    return `High structural similarity with "${canonical.name}". Both expressions use: ${identList}. Topology gap: ${topologyGap}. Semantic equivalence likely but requires proof.`;
  }

  /**
   * Identify what proofs are required
   */
  private identifyRequiredProofs(sharedIdentifiers: Set<string>): string[] {
    const proofs: string[] = [];

    if (sharedIdentifiers.size > 0) {
      proofs.push('Definition Expansion');
      proofs.push('Deep β-reduction to normal form');
    }

    if (sharedIdentifiers.has('FOLD') && (sharedIdentifiers.has('MAP') || sharedIdentifiers.has('CONCAT'))) {
      proofs.push('Equivalence theorem: concat_all ∘ map ≡ foldr (concat ∘ f) nil');
    }

    return proofs;
  }

  /**
   * Extract all identifiers (variables) from expression
   */
  private extractIdentifiers(expr: string): Set<string> {
    const identifiers = new Set<string>();

    // Match uppercase identifiers (like MAP, FOLD, CONS)
    const upperMatches = expr.match(/[A-Z][A-Z_]+/g);
    if (upperMatches) {
      upperMatches.forEach(id => identifiers.add(id));
    }

    return identifiers;
  }

  /**
   * Count number of applications (rough heuristic)
   */
  private countApplications(expr: string): number {
    // Count spaces outside of λ abstractions (very rough)
    return (expr.match(/\s+/g) || []).length;
  }

  /**
   * Set intersection
   */
  private setIntersection<T>(set1: Set<T>, set2: Set<T>): Set<T> {
    const result = new Set<T>();
    for (const item of set1) {
      if (set2.has(item)) {
        result.add(item);
      }
    }
    return result;
  }

  /**
   * Set union
   */
  private setUnion<T>(set1: Set<T>, set2: Set<T>): Set<T> {
    const result = new Set(set1);
    for (const item of set2) {
      result.add(item);
    }
    return result;
  }
}
