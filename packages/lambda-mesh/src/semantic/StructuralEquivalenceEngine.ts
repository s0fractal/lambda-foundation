/**
 * Phase 8.2: Structural Equivalence Engine
 *
 * Compares λ-expressions structurally (without β-reduction).
 * Handles recursive expressions that don't have normal forms.
 *
 * Strategy:
 * 1. Expand identifiers to definitions
 * 2. Parse to AST
 * 3. Compare AST structure with α-equivalence
 * 4. No β-reduction (prevents Y-combinator explosion)
 */

import type { CanonicalMorphism, EquivalenceProof } from '../types.js';
import { parseLambda, type ASTNode } from './parser.js';
import { DefinitionExpansionEngine } from './DefinitionExpansionEngine.js';

export class StructuralEquivalenceEngine {
  private expansionEngine: DefinitionExpansionEngine;

  constructor() {
    this.expansionEngine = new DefinitionExpansionEngine();
  }

  /**
   * Find canonical morphism structurally equivalent to expression
   *
   * Phase 8.2: Structural comparison (no β-reduction)
   *
   * Algorithm:
   * 1. Expand identifiers in expression
   * 2. For each morphism: expand → parse → compare AST
   * 3. Use α-equivalence for variable renaming
   * 4. Return first match with proof
   */
  findCanonical(
    expr: string,
    morphisms: Map<string, CanonicalMorphism>
  ): { canonical: CanonicalMorphism; proof: EquivalenceProof } | null {
    try {
      // Phase 8.2: Compare WITHOUT expansion (treat identifiers as opaque)
      // This avoids Y-combinator explosion during expansion
      console.log(`[Phase 8.2] Original expression: ${expr}`);
      console.log(`[Phase 8.2] Using direct comparison (no expansion for recursive)`);

      // Parse to AST (without expansion)
      const exprAST = parseLambda(expr);

      // Search through morphisms for structural match
      for (const [hash, morphism] of morphisms) {
        // Parse morphism definition (without expansion)
        try {
          const morphismAST = parseLambda(morphism.definition);

          // Debug: show comparison attempts
          console.log(`[Phase 8.2] Comparing with ${morphism.name}: ${morphism.definition}`);

          // Compare AST structure with α-equivalence
          // Identifiers (FOLD, CONCAT, etc.) treated as opaque variables
          if (this.alphaEquivalent(exprAST, morphismAST)) {
            // Found structural equivalence!
            console.log(`[Phase 8.2] ✓ Structural match found: ${morphism.name}`);

            const proof: EquivalenceProof = {
              normalForm: expr, // No normalization for recursive
              canonicalHash: morphism.hash,
              steps: [{
                rule: 'structural-equivalence',
                from: expr,
                to: expr,
                explanation: `Structurally equivalent (α-equivalence, identifiers opaque)`,
              }],
              reasoning: `Expression is structurally equivalent to ${morphism.name} (recursive, identifiers as constants)`,
            };

            return { canonical: morphism, proof };
          } else {
            console.log(`[Phase 8.2]   No match`);
          }
        } catch (error: unknown) {
          // Parse failed for this morphism, skip it
          const message = error instanceof Error ? error.message : String(error);
          console.warn(`[Phase 8.2] Parse failed for ${morphism.name}: ${message}`);
          continue;
        }
      }

      // No structural match found
      console.log(`[Phase 8.2] No structural match found`);
      return null;
    } catch (error) {
      // Structural equivalence check failed
      console.warn(`[Phase 8.2] Structural equivalence check failed: ${error}`);
      return null;
    }
  }

  /**
   * Check if two ASTs are α-equivalent (same structure, modulo variable renaming)
   */
  private alphaEquivalent(node1: ASTNode, node2: ASTNode, env: Map<string, string> = new Map()): boolean {
    // Both literals
    if (node1.type === 'literal' && node2.type === 'literal') {
      return node1.value === node2.value;
    }

    // Both variables
    if (node1.type === 'variable' && node2.type === 'variable') {
      // Check if bound to same parameter
      const mapped1 = env.get(node1.name) ?? node1.name;
      const mapped2 = env.get(node2.name) ?? node2.name;
      return mapped1 === mapped2;
    }

    // Both abstractions
    if (node1.type === 'abstraction' && node2.type === 'abstraction') {
      // Create fresh binding for α-equivalence
      const fresh = `_α${Math.random().toString(36).slice(2, 8)}`;
      const newEnv = new Map(env);
      newEnv.set(node1.param, fresh);
      newEnv.set(node2.param, fresh);

      return this.alphaEquivalent(node1.body, node2.body, newEnv);
    }

    // Both applications
    if (node1.type === 'application' && node2.type === 'application') {
      return (
        this.alphaEquivalent(node1.func, node2.func, env) &&
        this.alphaEquivalent(node1.arg, node2.arg, env)
      );
    }

    // Both let bindings
    if (node1.type === 'let' && node2.type === 'let') {
      if (node1.bindings.length !== node2.bindings.length) {
        return false;
      }

      const newEnv = new Map(env);
      for (let i = 0; i < node1.bindings.length; i++) {
        const b1 = node1.bindings[i];
        const b2 = node2.bindings[i];

        // Check binding values are equivalent
        if (!this.alphaEquivalent(b1.value, b2.value, env)) {
          return false;
        }

        // Bind both names to same fresh variable
        const fresh = `_α${Math.random().toString(36).slice(2, 8)}`;
        newEnv.set(b1.name, fresh);
        newEnv.set(b2.name, fresh);
      }

      return this.alphaEquivalent(node1.body, node2.body, newEnv);
    }

    // Different types
    return false;
  }

  /**
   * Normalize whitespace for string comparison (fallback)
   */
  private normalizeWhitespace(expr: string): string {
    return expr.replace(/\s+/g, ' ').trim();
  }
}
