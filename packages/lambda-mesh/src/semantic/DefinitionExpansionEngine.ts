/**
 * Definition Expansion Engine (Phase 5)
 *
 * Expands morphism identifiers to their pure λ-calculus definitions.
 * Enables semantic comparison by reducing expressions to their canonical forms.
 *
 * Example:
 *   Input:  λn. (ADD ONE n)
 *   Registry: { ADD: "λm. λn. λf. λx. m f (n f x)", ONE: "λf. λx. f x" }
 *   Output: λn. ((λm. λn. λf. λx. m f (n f x)) (λf. λx. f x) n)
 */

import type { CanonicalMorphism } from '../types.js';

export class DefinitionExpansionEngine {
  /**
   * Expand all morphism identifiers in expression to their definitions.
   *
   * @param expr - Expression with identifiers (e.g., "λn. ADD ONE n")
   * @param morphisms - Available morphisms for expansion
   * @param maxDepth - Maximum recursion depth (prevent infinite loops)
   * @returns Expanded expression with all identifiers replaced
   */
  expand(
    expr: string,
    morphisms: CanonicalMorphism[],
    maxDepth: number = 10
  ): string {
    // Build identifier → definition registry
    const registry = this.buildRegistry(morphisms);

    // Recursively expand until no more identifiers or max depth
    return this.expandRecursive(expr, registry, maxDepth, new Set());
  }

  /**
   * Build registry mapping identifier → definition
   */
  private buildRegistry(morphisms: CanonicalMorphism[]): Map<string, string> {
    const registry = new Map<string, string>();

    for (const morphism of morphisms) {
      // Convention: Morphism names in UPPERCASE are expandable identifiers
      const identifier = morphism.name.toUpperCase();
      registry.set(identifier, morphism.definition);
    }

    return registry;
  }

  /**
   * Recursively expand identifiers
   */
  private expandRecursive(
    expr: string,
    registry: Map<string, string>,
    depth: number,
    expanding: Set<string>
  ): string {
    if (depth === 0) {
      // Max depth reached - return as-is
      return expr;
    }

    // Extract identifiers from expression
    const identifiers = this.extractIdentifiers(expr);

    if (identifiers.length === 0) {
      // No identifiers to expand - done
      return expr;
    }

    // Expand each identifier
    let expanded = expr;
    for (const identifier of identifiers) {
      const definition = registry.get(identifier);

      if (!definition) {
        // Unknown identifier - skip
        continue;
      }

      if (expanding.has(identifier)) {
        // Circular dependency detected - skip
        console.warn(`⚠️  Circular dependency detected: ${identifier}`);
        continue;
      }

      // Mark as expanding (prevent circular dependencies)
      const nextExpanding = new Set(expanding);
      nextExpanding.add(identifier);

      // First, recursively expand the definition itself
      const expandedDef = this.expandRecursive(definition, registry, depth - 1, nextExpanding);

      // Then substitute in expression
      expanded = this.substitute(expanded, identifier, expandedDef);
    }

    // If anything changed, recurse (might have revealed new identifiers)
    if (expanded !== expr) {
      return this.expandRecursive(expanded, registry, depth - 1, expanding);
    }

    return expanded;
  }

  /**
   * Extract all uppercase identifiers from expression.
   * Convention: UPPERCASE = morphism identifier, lowercase = λ-variable
   *
   * Example: "λn. ADD ONE n" → ["ADD", "ONE"]
   */
  extractIdentifiers(expr: string): string[] {
    // Match uppercase identifiers (not preceded by λ or inside string)
    const identifierRegex = /\b[A-Z][A-Z0-9_]*\b/g;
    const matches = expr.match(identifierRegex);

    if (!matches) return [];

    // Remove duplicates and return
    return Array.from(new Set(matches));
  }

  /**
   * Substitute identifier with definition in expression.
   * Handles proper parenthesization to preserve semantics.
   *
   * Example:
   *   expr: "λn. ADD ONE n"
   *   identifier: "ADD"
   *   definition: "λm. λn. λf. λx. m f (n f x)"
   *   result: "λn. (λm. λn. λf. λx. m f (n f x)) ONE n"
   */
  private substitute(expr: string, identifier: string, definition: string): string {
    // Escape special regex characters in identifier
    const escapedId = identifier.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

    // Match identifier as whole word (not part of another identifier)
    const regex = new RegExp(`\\b${escapedId}\\b`, 'g');

    // Wrap definition in parens if it's a lambda (for safe substitution)
    const wrappedDef = definition.startsWith('λ') ? `(${definition})` : definition;

    return expr.replace(regex, wrappedDef);
  }

  /**
   * Check if two expressions are equivalent after expansion.
   *
   * @returns true if expanded forms are identical (modulo whitespace)
   */
  areEquivalentAfterExpansion(
    expr1: string,
    expr2: string,
    morphisms: CanonicalMorphism[]
  ): boolean {
    const expanded1 = this.expand(expr1, morphisms);
    const expanded2 = this.expand(expr2, morphisms);

    // Normalize whitespace for comparison
    const normalized1 = this.normalizeWhitespace(expanded1);
    const normalized2 = this.normalizeWhitespace(expanded2);

    return normalized1 === normalized2;
  }

  /**
   * Normalize whitespace for comparison
   */
  private normalizeWhitespace(expr: string): string {
    return expr.replace(/\s+/g, ' ').trim();
  }
}
