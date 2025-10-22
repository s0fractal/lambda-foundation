/**
 * Phase 9: Semantic Equivalence Engine (with Algebraic Rewriting)
 *
 * Intelligent four-tier semantic pipeline:
 *
 * Phase 5: DefinitionExpansionEngine - Expands identifiers to definitions
 * Phase 6: BetaReductionEngine - Reduces to normal form (for terminating expressions)
 * Phase 7: Integration - Expand BEFORE reduce for complete semantic equivalence
 * Phase 8: Recursion Handling - Structural comparison for non-terminating expressions
 * Phase 9: Algebraic Rewriting - Transform expressions using proven laws
 *
 * Strategy:
 * 1. Detect if expression is recursive (Y-combinator, FOLD, etc.)
 * 2. If recursive:
 *    a. Try structural equivalence (cheap, α-equivalence)
 *    b. If no match, try algebraic rewriting (expensive, theorem application)
 * 3. If not recursive:
 *    a. Try β-reduction (medium cost, full normalization)
 *    b. If no match, try algebraic rewriting (expensive, theorem application)
 */

import type { CanonicalMorphism, EquivalenceProof } from '../types.js';
import { BetaReductionEngine } from './BetaReductionEngine.js';
import { DefinitionExpansionEngine } from './DefinitionExpansionEngine.js';
import { RecursionDetector } from './RecursionDetector.js';
import { StructuralEquivalenceEngine } from './StructuralEquivalenceEngine.js';
import { AlgebraicRewritingEngine } from './AlgebraicRewritingEngine.js';

export class SemanticEquivalenceEngine {
  private betaEngine: BetaReductionEngine;
  private expansionEngine: DefinitionExpansionEngine;
  private recursionDetector: RecursionDetector;
  private structuralEngine: StructuralEquivalenceEngine;
  private algebraicEngine: AlgebraicRewritingEngine;

  constructor() {
    this.betaEngine = new BetaReductionEngine();
    this.expansionEngine = new DefinitionExpansionEngine();
    this.recursionDetector = new RecursionDetector();
    this.structuralEngine = new StructuralEquivalenceEngine();
    this.algebraicEngine = new AlgebraicRewritingEngine();
  }

  /**
   * Find canonical morphism semantically equivalent to expression
   *
   * Phase 9: Intelligent multi-tier semantic pipeline
   *
   * Algorithm:
   * 1. Check if expression is recursive (Y-combinator, FOLD, etc.)
   * 2. If recursive:
   *    a. Try structural equivalence (Phase 8.2)
   *    b. If no match, try algebraic rewriting (Phase 9.2)
   * 3. If not recursive:
   *    a. Try β-reduction (Phase 7)
   *    b. If no match, try algebraic rewriting (Phase 9.2)
   */
  findCanonical(
    expr: string,
    morphisms: Map<string, CanonicalMorphism>
  ): { canonical: CanonicalMorphism; proof: EquivalenceProof } | null {
    // Phase 8.1: Detect recursion
    const isRecursive = this.recursionDetector.isNonTerminating(expr);
    console.log(`[Phase 9] Recursion detected: ${isRecursive}`);

    if (isRecursive) {
      // Phase 8.2: Try structural equivalence first (cheap)
      console.log(`[Phase 9] Trying structural equivalence (recursive expression)`);
      const structuralMatch = this.structuralEngine.findCanonical(expr, morphisms);
      if (structuralMatch) {
        return structuralMatch; // Found via α-equivalence!
      }

      // Phase 9.2: Try algebraic rewriting (expensive, but works for H1!)
      console.log(`[Phase 9] Structural failed, trying algebraic rewriting`);
      const algebraicMatch = this.algebraicEngine.findCanonical(expr, morphisms);
      if (algebraicMatch) {
        return algebraicMatch; // Found via theorem application!
      }

      // No match found
      return null;
    } else {
      // Phase 7: Try β-reduction first (medium cost)
      console.log(`[Phase 9] Trying β-reduction (non-recursive expression)`);
      const reductionMatch = this.findCanonicalViaReduction(expr, morphisms);
      if (reductionMatch) {
        return reductionMatch; // Found via normalization!
      }

      // Phase 9.2: Try algebraic rewriting as fallback
      console.log(`[Phase 9] β-reduction failed, trying algebraic rewriting`);
      const algebraicMatch = this.algebraicEngine.findCanonical(expr, morphisms);
      if (algebraicMatch) {
        return algebraicMatch; // Found via theorem application!
      }

      // No match found
      return null;
    }
  }

  /**
   * Find canonical via β-reduction (Phase 7 logic)
   * Used for non-recursive expressions
   */
  private findCanonicalViaReduction(
    expr: string,
    morphisms: Map<string, CanonicalMorphism>
  ): { canonical: CanonicalMorphism; proof: EquivalenceProof } | null {
    try {
      // Phase 5: Expand identifiers in expression
      const morphismsArray = Array.from(morphisms.values());
      console.log(`[Phase 7] Original expression: ${expr}`);
      const expandedExpr = this.expansionEngine.expand(expr, morphismsArray);
      console.log(`[Phase 7] Expanded expression: ${expandedExpr}`);

      // Phase 6: Reduce expanded expression to normal form
      const normalizedExpr = this.betaEngine.reduceToNormalForm(expandedExpr);
      const reductionSteps = this.betaEngine.getReductionCount();
      console.log(`[Phase 7] Reduced to: ${normalizedExpr} (${reductionSteps} steps)`);

      // Search through morphisms for semantic match
      for (const [hash, morphism] of morphisms) {
        // Phase 5: Expand identifiers in morphism definition
        const expandedMorphism = this.expansionEngine.expand(morphism.definition, morphismsArray);

        // Phase 6: Reduce morphism definition to normal form
        const normalizedMorphism = this.betaEngine.reduceToNormalForm(expandedMorphism);

        const exprNorm = this.normalizeWhitespace(normalizedExpr);
        const morphNorm = this.normalizeWhitespace(normalizedMorphism);

        // Debug: Show comparison for SUCC (test case)
        if (morphism.name === 'SUCC' || morphism.name === 'identity') {
          console.log(`[Phase 7] Comparing with ${morphism.name}:`);
          console.log(`  Expression: "${exprNorm}"`);
          console.log(`  Morphism:   "${morphNorm}"`);
          console.log(`  Match: ${exprNorm === morphNorm}`);
        }

        // Compare normal forms (modulo whitespace)
        if (exprNorm === morphNorm) {
          // Found semantic equivalence!
          console.log(`[Phase 7] ✓ Semantic match found: ${morphism.name}`);

          const steps = [];

          // Add expansion step if expression was expanded
          if (expandedExpr !== expr) {
            steps.push({
              rule: 'definition-expansion',
              from: expr,
              to: expandedExpr,
              explanation: `Expanded identifiers to definitions`,
            });
          }

          // Add reduction step if expression was reduced
          if (reductionSteps > 0) {
            steps.push({
              rule: 'β-reduction',
              from: expandedExpr,
              to: normalizedExpr,
              explanation: `Reduced to normal form in ${reductionSteps} steps`,
            });
          }

          const proof: EquivalenceProof = {
            normalForm: normalizedExpr,
            canonicalHash: morphism.hash,
            steps,
            reasoning: expandedExpr !== expr
              ? `Expression expands and reduces to same normal form as ${morphism.name}`
              : `Expression reduces to same normal form as ${morphism.name} via β-reduction`,
          };

          return { canonical: morphism, proof };
        }
      }

      // No semantic match found
      console.log(`[Phase 7] No semantic match found`);
      return null;
    } catch (error) {
      // Semantic equivalence check failed
      console.warn(`[Phase 7] Semantic equivalence check failed: ${error}`);
      return null;
    }
  }

  /**
   * Normalize whitespace for comparison
   */
  private normalizeWhitespace(expr: string): string {
    return expr.replace(/\s+/g, ' ').trim();
  }
}
