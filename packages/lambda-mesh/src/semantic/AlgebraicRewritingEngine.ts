/**
 * Phase 9.2: Algebraic Rewriting Engine
 *
 * Applies algebraic laws to transform λ-expressions.
 * Generates proof chains showing which laws were applied.
 */

import type { CanonicalMorphism, EquivalenceProof } from '../types.js';
import { parseLambda, type ASTNode } from './parser.js';
import { ALGEBRAIC_LAWS, type AlgebraicLaw, type LawMatch } from './AlgebraicLaws.js';

export interface RewriteStep {
  law: string;
  from: string;
  to: string;
  explanation: string;
}

export class AlgebraicRewritingEngine {
  private laws: AlgebraicLaw[];
  private maxDepth: number;

  constructor(maxDepth: number = 10) {
    this.laws = ALGEBRAIC_LAWS;
    this.maxDepth = maxDepth;
  }

  /**
   * Find canonical morphism algebraically equivalent to expression
   *
   * Phase 9.2: Uses algebraic laws to transform expressions
   *
   * Algorithm:
   * 1. Parse expression to AST
   * 2. Apply algebraic laws to transform AST
   * 3. For each transformation, check if it matches a morphism
   * 4. Return first match with proof chain
   */
  findCanonical(
    expr: string,
    morphisms: Map<string, CanonicalMorphism>
  ): { canonical: CanonicalMorphism; proof: EquivalenceProof } | null {
    try {
      console.log(`[Phase 9] Original expression: ${expr}`);

      // Parse expression
      const ast = parseLambda(expr);

      // Try to rewrite and match
      return this.rewriteAndMatch(ast, expr, morphisms, 0, []);
    } catch (error) {
      console.warn(`[Phase 9] Algebraic rewriting failed: ${error}`);
      return null;
    }
  }

  /**
   * Recursively rewrite expression and check for matches
   */
  private rewriteAndMatch(
    ast: ASTNode,
    exprString: string,
    morphisms: Map<string, CanonicalMorphism>,
    depth: number,
    steps: RewriteStep[]
  ): { canonical: CanonicalMorphism; proof: EquivalenceProof } | null {
    // Check depth limit
    if (depth >= this.maxDepth) {
      console.log(`[Phase 9] Max rewrite depth reached`);
      return null;
    }

    // Check if current form matches any morphism
    console.log(`[Phase 9] Checking expression: ${exprString}`);
    const match = this.checkMatch(exprString, morphisms);
    if (match) {
      console.log(`[Phase 9] ✓ Algebraic match found: ${match.name} (after ${steps.length} rewrites)`);

      // Build proof from rewrite steps
      const proof: EquivalenceProof = {
        normalForm: exprString,
        canonicalHash: match.hash,
        steps: steps.map(step => ({
          rule: `algebraic-law:${step.law}`,
          from: step.from,
          to: step.to,
          explanation: step.explanation,
        })),
        reasoning: steps.length > 0
          ? `Expression algebraically equivalent to ${match.name} via ${steps.length} law application(s)`
          : `Expression matches ${match.name} (no rewriting needed)`,
      };

      return { canonical: match, proof };
    }

    // Try applying each law to transform the expression
    for (const law of this.laws) {
      const rewrite = this.tryApplyLaw(ast, law, exprString);
      if (rewrite) {
        console.log(`[Phase 9] Applied ${law.name}: ${exprString} → ${rewrite.exprString}`);

        // Add step to proof chain
        const newSteps: RewriteStep[] = [
          ...steps,
          {
            law: law.name,
            from: exprString,
            to: rewrite.exprString,
            explanation: law.description,
          },
        ];

        // Recursively try to match the rewritten form
        const result = this.rewriteAndMatch(
          rewrite.ast,
          rewrite.exprString,
          morphisms,
          depth + 1,
          newSteps
        );

        if (result) {
          return result; // Found a match after this rewrite!
        }
      }
    }

    // No match found after trying all laws
    return null;
  }

  /**
   * Try to apply a law to the expression (at any sub-expression level)
   */
  private tryApplyLaw(
    ast: ASTNode,
    law: AlgebraicLaw,
    exprString: string
  ): { ast: ASTNode; exprString: string } | null {
    // Try to match and apply at the root
    const match = law.matches(ast);
    if (match) {
      const rewritten = law.apply(ast, match);
      const rewrittenString = this.astToString(rewritten);
      return { ast: rewritten, exprString: rewrittenString };
    }

    // Try to apply recursively to sub-expressions
    if (ast.type === 'abstraction') {
      const bodyRewrite = this.tryApplyLaw(ast.body, law, this.astToString(ast.body));
      if (bodyRewrite) {
        const rewritten: ASTNode = {
          type: 'abstraction',
          param: ast.param,
          body: bodyRewrite.ast,
        };
        return { ast: rewritten, exprString: this.astToString(rewritten) };
      }
    }

    if (ast.type === 'application') {
      // Try rewriting the function
      const funcRewrite = this.tryApplyLaw(ast.func, law, this.astToString(ast.func));
      if (funcRewrite) {
        const rewritten: ASTNode = {
          type: 'application',
          func: funcRewrite.ast,
          arg: ast.arg,
        };
        return { ast: rewritten, exprString: this.astToString(rewritten) };
      }

      // Try rewriting the argument
      const argRewrite = this.tryApplyLaw(ast.arg, law, this.astToString(ast.arg));
      if (argRewrite) {
        const rewritten: ASTNode = {
          type: 'application',
          func: ast.func,
          arg: argRewrite.ast,
        };
        return { ast: rewritten, exprString: this.astToString(rewritten) };
      }
    }

    // No rewrite possible
    return null;
  }

  /**
   * Check if expression matches any morphism (syntactically)
   */
  private checkMatch(
    expr: string,
    morphisms: Map<string, CanonicalMorphism>
  ): CanonicalMorphism | null {
    const normalized = this.normalizeWhitespace(expr);

    for (const [hash, morphism] of morphisms) {
      const morphismNormalized = this.normalizeWhitespace(morphism.definition);
      if (normalized === morphismNormalized) {
        return morphism;
      }
    }

    return null;
  }

  /**
   * Convert AST back to string representation
   */
  private astToString(node: ASTNode): string {
    if (node.type === 'variable') {
      return node.name;
    }

    if (node.type === 'literal') {
      return String(node.value);
    }

    if (node.type === 'abstraction') {
      return `λ${node.param}. ${this.astToString(node.body)}`;
    }

    if (node.type === 'application') {
      const func = this.astToString(node.func);
      const arg = this.astToString(node.arg);

      // Add parentheses around arg if it's not atomic
      const needsParens = node.arg.type === 'abstraction' || node.arg.type === 'application';
      const argStr = needsParens ? `(${arg})` : arg;

      // Add parentheses around func if it's an abstraction
      const funcNeedsParens = node.func.type === 'abstraction';
      const funcStr = funcNeedsParens ? `(${func})` : func;

      return `${funcStr} ${argStr}`;
    }

    if (node.type === 'let') {
      const bindings = node.bindings
        .map(b => `${b.name} = ${this.astToString(b.value)}`)
        .join(', ');
      const body = this.astToString(node.body);
      return `let ${bindings} in ${body}`;
    }

    return '???';
  }

  /**
   * Normalize whitespace for comparison
   */
  private normalizeWhitespace(expr: string): string {
    return expr.replace(/\s+/g, ' ').trim();
  }
}
