/**
 * Phase 8.1: Recursion Detector
 *
 * Detects Y-combinator and recursive patterns to prevent infinite β-reduction.
 *
 * Y-Combinator forms:
 * - λg. (λx. g (x x)) (λx. g (x x))  [standard Y]
 * - λg. (λx. x x) (λx. g (x x))      [variant]
 */

import { parseLambda, type ASTNode } from './parser.js';

export class RecursionDetector {
  /**
   * Check if expression contains Y-combinator pattern
   */
  containsYCombinator(expr: string): boolean {
    try {
      const ast = parseLambda(expr);
      return this.detectYInAST(ast);
    } catch {
      // Parse failed - check string patterns as fallback
      return this.detectYInString(expr);
    }
  }

  /**
   * Check if expression contains recursive identifiers
   * (FOLD, MAP, FILTER, etc. that are defined recursively)
   */
  containsRecursiveIdentifiers(expr: string): boolean {
    const recursivePatterns = [
      /\bFOLD\b/,
      /\bMAP\b/,
      /\bFILTER\b/,
      /\bFLATMAP\b/,
      /\bCONCAT\b/,  // CONCAT uses FOLD internally
    ];

    return recursivePatterns.some(pattern => pattern.test(expr));
  }

  /**
   * Check if expression is likely to cause infinite reduction
   */
  isNonTerminating(expr: string): boolean {
    return this.containsYCombinator(expr) || this.containsRecursiveIdentifiers(expr);
  }

  /**
   * Detect Y-combinator pattern in AST
   */
  private detectYInAST(node: ASTNode): boolean {
    // Y = λg. (λx. g (x x)) (λx. g (x x))
    if (node.type === 'abstraction') {
      const param = node.param;
      const body = node.body;

      // Check if body is application: (M N)
      if (body.type === 'application') {
        const func = body.func;
        const arg = body.arg;

        // Both func and arg should be abstractions: (λx. ...) (λx. ...)
        if (func.type === 'abstraction' && arg.type === 'abstraction') {
          // Check for self-application pattern: (x x)
          if (this.hasSelfApplication(func.body) && this.hasSelfApplication(arg.body)) {
            // Check if param is free in both
            if (this.isFreeIn(param, func.body) && this.isFreeIn(param, arg.body)) {
              return true; // Y-combinator pattern detected!
            }
          }
        }
      }

      // Recursively check sub-expressions
      return this.detectYInAST(body);
    }

    if (node.type === 'application') {
      return this.detectYInAST(node.func) || this.detectYInAST(node.arg);
    }

    if (node.type === 'let') {
      for (const binding of node.bindings) {
        if (this.detectYInAST(binding.value)) return true;
      }
      return this.detectYInAST(node.body);
    }

    return false;
  }

  /**
   * Check if AST contains self-application (x x)
   */
  private hasSelfApplication(node: ASTNode): boolean {
    if (node.type === 'application') {
      if (node.func.type === 'variable' && node.arg.type === 'variable') {
        if (node.func.name === node.arg.name) {
          return true; // Found (x x)
        }
      }
      // Check recursively
      return this.hasSelfApplication(node.func) || this.hasSelfApplication(node.arg);
    }

    if (node.type === 'abstraction') {
      return this.hasSelfApplication(node.body);
    }

    if (node.type === 'let') {
      for (const binding of node.bindings) {
        if (this.hasSelfApplication(binding.value)) return true;
      }
      return this.hasSelfApplication(node.body);
    }

    return false;
  }

  /**
   * Check if variable is free in expression
   */
  private isFreeIn(varName: string, node: ASTNode): boolean {
    if (node.type === 'variable') {
      return node.name === varName;
    }

    if (node.type === 'abstraction') {
      if (node.param === varName) {
        return false; // Bound by this abstraction
      }
      return this.isFreeIn(varName, node.body);
    }

    if (node.type === 'application') {
      return this.isFreeIn(varName, node.func) || this.isFreeIn(varName, node.arg);
    }

    if (node.type === 'let') {
      // Check if bound by let
      for (const binding of node.bindings) {
        if (binding.name === varName) return false;
        if (this.isFreeIn(varName, binding.value)) return true;
      }
      return this.isFreeIn(varName, node.body);
    }

    return false;
  }

  /**
   * String-based Y-combinator detection (fallback)
   */
  private detectYInString(expr: string): boolean {
    // Pattern: (x x) appears - indicator of Y-combinator
    const selfAppPattern = /\(\s*(\w+)\s+\1\s*\)/;
    return selfAppPattern.test(expr);
  }
}
