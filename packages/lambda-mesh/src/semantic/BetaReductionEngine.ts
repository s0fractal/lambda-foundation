/**
 * Phase 6: β-Reduction Engine
 *
 * "The Philosopher learns to think."
 *
 * Implements β-reduction: the computational core of λ-calculus.
 * Enables semantic equivalence by reducing expressions to normal form.
 *
 * β-reduction: (λx. M) N → M[x := N]
 * α-conversion: λx. M → λy. M[x := y] (avoid variable capture)
 *
 * Example:
 *   Input:  (λm. λn. λf. λx. m f (n f x)) (λf. λx. f x) n
 *   Output: λn. λf. λx. (λf. λx. f x) f ((n f) x)
 *   Further: λn. λf. λx. f (n f x)  [= SUCC]
 */

import { LambdaParser, ASTNode } from './parser.js';

export class BetaReductionEngine {
  private maxReductions: number;
  private reductionCount: number;

  constructor(maxReductions: number = 1000) {
    this.maxReductions = maxReductions;
    this.reductionCount = 0;
  }

  /**
   * Reduce expression to normal form (full β-reduction)
   *
   * @param expr - λ-calculus expression
   * @returns Normal form (no more β-reductions possible)
   */
  reduceToNormalForm(expr: string): string {
    this.reductionCount = 0;

    try {
      const parser = new LambdaParser(expr);
      let ast = parser.parse();

      // Repeatedly β-reduce until normal form
      while (this.reductionCount < this.maxReductions) {
        const reduced = this.betaReduce(ast);

        if (this.astEquals(reduced, ast)) {
          // No change - reached normal form
          return this.astToString(reduced);
        }

        ast = reduced;
        this.reductionCount++;
      }

      // Max reductions exceeded - return current form
      console.warn(`⚠️  β-reduction limit reached (${this.maxReductions} steps)`);
      return this.astToString(ast);
    } catch (error) {
      // Parsing failed - return original
      return expr;
    }
  }

  /**
   * Perform one step of β-reduction (leftmost-outermost strategy)
   *
   * Finds leftmost redex and reduces it.
   * Redex: (λx. M) N
   */
  private betaReduce(node: ASTNode): ASTNode {
    if (node.type === 'application') {
      // Check if this is a redex: (λx. M) N
      if (node.func.type === 'abstraction') {
        // This is a redex! Perform β-reduction
        const param = node.func.param;
        const body = node.func.body;
        const arg = node.arg;

        // Substitute: body[param := arg]
        return this.substitute(body, param, arg);
      }

      // Not a redex - try reducing function or argument (leftmost first)
      const reducedFunc = this.betaReduce(node.func);
      if (!this.astEquals(reducedFunc, node.func)) {
        return {
          type: 'application',
          func: reducedFunc,
          arg: node.arg,
        };
      }

      const reducedArg = this.betaReduce(node.arg);
      if (!this.astEquals(reducedArg, node.arg)) {
        return {
          type: 'application',
          func: node.func,
          arg: reducedArg,
        };
      }
    }

    if (node.type === 'abstraction') {
      // Try reducing body
      const reducedBody = this.betaReduce(node.body);
      if (!this.astEquals(reducedBody, node.body)) {
        return {
          type: 'abstraction',
          param: node.param,
          body: reducedBody,
        };
      }
    }

    if (node.type === 'let') {
      // First try to reduce bindings
      for (let i = 0; i < node.bindings.length; i++) {
        const reduced = this.betaReduce(node.bindings[i].value);
        if (!this.astEquals(reduced, node.bindings[i].value)) {
          const newBindings = [...node.bindings];
          newBindings[i] = { ...newBindings[i], value: reduced };
          return {
            type: 'let',
            bindings: newBindings,
            body: node.body,
          };
        }
      }

      // Try reducing body
      const reducedBody = this.betaReduce(node.body);
      if (!this.astEquals(reducedBody, node.body)) {
        return {
          type: 'let',
          bindings: node.bindings,
          body: reducedBody,
        };
      }
    }

    // No reduction possible (includes literals and variables)
    return node;
  }

  /**
   * Substitute arg for param in expr, avoiding variable capture
   *
   * expr[param := arg]
   */
  private substitute(expr: ASTNode, param: string, arg: ASTNode): ASTNode {
    if (expr.type === 'variable') {
      // Replace if matches param
      return expr.name === param ? arg : expr;
    }

    if (expr.type === 'literal') {
      // Literals don't contain variables
      return expr;
    }

    if (expr.type === 'abstraction') {
      // λy. M where we're substituting [x := N]

      if (expr.param === param) {
        // Shadowing - param is bound here, don't substitute in body
        return expr;
      }

      const freeInArg = this.freeVariables(arg);
      if (freeInArg.has(expr.param)) {
        // Variable capture would occur!
        // α-convert: rename expr.param to fresh variable
        const fresh = this.freshVariable(expr.param, freeInArg);
        const renamedBody = this.rename(expr.body, expr.param, fresh);

        return {
          type: 'abstraction',
          param: fresh,
          body: this.substitute(renamedBody, param, arg),
        };
      }

      // Safe to substitute in body
      return {
        type: 'abstraction',
        param: expr.param,
        body: this.substitute(expr.body, param, arg),
      };
    }

    if (expr.type === 'application') {
      return {
        type: 'application',
        func: this.substitute(expr.func, param, arg),
        arg: this.substitute(expr.arg, param, arg),
      };
    }

    if (expr.type === 'let') {
      // Let bindings need special handling for shadowing
      const newBindings = expr.bindings.map(binding => {
        if (binding.name === param) {
          // Shadowing starts here - don't substitute in later bindings or body
          return binding;
        }
        return {
          name: binding.name,
          value: this.substitute(binding.value, param, arg),
        };
      });

      // Check if any binding shadows param
      const shadows = expr.bindings.some(b => b.name === param);
      const newBody = shadows ? expr.body : this.substitute(expr.body, param, arg);

      return {
        type: 'let',
        bindings: newBindings,
        body: newBody,
      };
    }

    return expr;
  }

  /**
   * Rename all occurrences of oldVar to newVar in expr
   */
  private rename(expr: ASTNode, oldVar: string, newVar: string): ASTNode {
    if (expr.type === 'variable') {
      return expr.name === oldVar ? { type: 'variable', name: newVar } : expr;
    }

    if (expr.type === 'literal') {
      return expr;
    }

    if (expr.type === 'abstraction') {
      if (expr.param === oldVar) {
        // Shadowing - don't rename in body
        return expr;
      }

      return {
        type: 'abstraction',
        param: expr.param === oldVar ? newVar : expr.param,
        body: this.rename(expr.body, oldVar, newVar),
      };
    }

    if (expr.type === 'application') {
      return {
        type: 'application',
        func: this.rename(expr.func, oldVar, newVar),
        arg: this.rename(expr.arg, oldVar, newVar),
      };
    }

    if (expr.type === 'let') {
      const newBindings = expr.bindings.map(b => ({
        name: b.name === oldVar ? newVar : b.name,
        value: this.rename(b.value, oldVar, newVar),
      }));
      const shadows = expr.bindings.some(b => b.name === oldVar);
      return {
        type: 'let',
        bindings: newBindings,
        body: shadows ? expr.body : this.rename(expr.body, oldVar, newVar),
      };
    }

    return expr;
  }

  /**
   * Generate fresh variable name (not in used set)
   */
  private freshVariable(base: string, used: Set<string>): string {
    let candidate = base;
    let counter = 1;

    while (used.has(candidate)) {
      candidate = `${base}${counter}`;
      counter++;
    }

    return candidate;
  }

  /**
   * Get set of free variables in expression
   */
  private freeVariables(expr: ASTNode): Set<string> {
    if (expr.type === 'variable') {
      return new Set([expr.name]);
    }

    if (expr.type === 'literal') {
      return new Set();
    }

    if (expr.type === 'abstraction') {
      const bodyFree = this.freeVariables(expr.body);
      bodyFree.delete(expr.param); // param is bound
      return bodyFree;
    }

    if (expr.type === 'application') {
      const funcFree = this.freeVariables(expr.func);
      const argFree = this.freeVariables(expr.arg);
      return new Set([...funcFree, ...argFree]);
    }

    if (expr.type === 'let') {
      const result = new Set<string>();
      for (const binding of expr.bindings) {
        const valueFree = this.freeVariables(binding.value);
        valueFree.forEach(v => result.add(v));
      }
      const bodyFree = this.freeVariables(expr.body);
      bodyFree.forEach(v => {
        if (!expr.bindings.some(b => b.name === v)) {
          result.add(v);
        }
      });
      return result;
    }

    return new Set();
  }

  /**
   * Check if two ASTs are structurally equal
   */
  private astEquals(a: ASTNode, b: ASTNode): boolean {
    if (a.type !== b.type) return false;

    if (a.type === 'variable' && b.type === 'variable') {
      return a.name === b.name;
    }

    if (a.type === 'literal' && b.type === 'literal') {
      return a.value === b.value;
    }

    if (a.type === 'abstraction' && b.type === 'abstraction') {
      return a.param === b.param && this.astEquals(a.body, b.body);
    }

    if (a.type === 'application' && b.type === 'application') {
      return this.astEquals(a.func, b.func) && this.astEquals(a.arg, b.arg);
    }

    if (a.type === 'let' && b.type === 'let') {
      if (a.bindings.length !== b.bindings.length) return false;
      for (let i = 0; i < a.bindings.length; i++) {
        if (a.bindings[i].name !== b.bindings[i].name) return false;
        if (!this.astEquals(a.bindings[i].value, b.bindings[i].value)) return false;
      }
      return this.astEquals(a.body, b.body);
    }

    return false;
  }

  /**
   * Convert AST back to string
   */
  private astToString(node: ASTNode): string {
    if (node.type === 'variable') {
      return node.name;
    }

    if (node.type === 'literal') {
      return String(node.value);
    }

    if (node.type === 'abstraction') {
      return `λ${node.param}.${this.astToString(node.body)}`;
    }

    if (node.type === 'application') {
      const funcStr = node.func.type === 'abstraction'
        ? `(${this.astToString(node.func)})`
        : this.astToString(node.func);
      const argStr = node.arg.type === 'application' || node.arg.type === 'abstraction'
        ? `(${this.astToString(node.arg)})`
        : this.astToString(node.arg);
      return `${funcStr} ${argStr}`;
    }

    if (node.type === 'let') {
      const bindingsStr = node.bindings
        .map(b => `${b.name} = ${this.astToString(b.value)}`)
        .join(', ');
      return `let ${bindingsStr} in ${this.astToString(node.body)}`;
    }

    return '';
  }

  /**
   * Check if two expressions are equivalent after β-reduction
   */
  areEquivalent(expr1: string, expr2: string): boolean {
    const normal1 = this.reduceToNormalForm(expr1);
    const normal2 = this.reduceToNormalForm(expr2);

    // Normalize whitespace for comparison
    const normalized1 = normal1.replace(/\s+/g, ' ').trim();
    const normalized2 = normal2.replace(/\s+/g, ' ').trim();

    return normalized1 === normalized2;
  }

  /**
   * Get reduction steps (for debugging/proof generation)
   */
  getReductionCount(): number {
    return this.reductionCount;
  }
}
