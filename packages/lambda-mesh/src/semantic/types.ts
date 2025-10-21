/**
 * Phase 4: Semantic Equivalence Engine - Type Definitions
 */

import type { LambdaExpr } from '@lambda/reduce';
import type { CanonicalMorphism } from '../types.js';

export interface RewriteStep {
  rule: string;
  from: string;
  to: string;
  explanation: string;
}

export interface EquivalenceProof {
  steps: RewriteStep[];
  normalForm: string;
  canonicalHash: string;
  reasoning: string;
}

export interface NormalForm {
  expr: LambdaExpr;
  normalized: string;
  hash: string;
}

export interface SemanticEquivalenceEngine {
  /**
   * Reduce expression to canonical normal form
   */
  reduceToNormalForm(expr: LambdaExpr | string): NormalForm;

  /**
   * Prove two expressions are equivalent
   */
  proveEquivalent(expr1: LambdaExpr | string, expr2: LambdaExpr | string): EquivalenceProof | null;

  /**
   * Find canonical representative in existing morphisms
   */
  findCanonical(expr: LambdaExpr | string, morphisms: Map<string, CanonicalMorphism>): {
    canonical: CanonicalMorphism;
    proof: EquivalenceProof;
  } | null;
}

/**
 * Known algebraic equivalences
 */
export interface EquivalenceRule {
  name: string;
  pattern: string;
  replacement: string;
  explanation: string;
}

export const KNOWN_EQUIVALENCES: EquivalenceRule[] = [
  {
    name: 'flatMap-fold',
    pattern: 'flatMap',
    replacement: 'fold (λacc. λx. (concat acc (f x))) []',
    explanation: 'flatMap is equivalent to fold with concat'
  },
  {
    name: 'map-fold',
    pattern: 'map',
    replacement: 'fold (λacc. λx. (append acc (f x))) []',
    explanation: 'map is equivalent to fold with append'
  },
  {
    name: 'filter-fold',
    pattern: 'filter',
    replacement: 'fold (λacc. λx. (if (p x) then (append acc x) else acc)) []',
    explanation: 'filter is equivalent to fold with conditional append'
  },
  {
    name: 'eta-reduction',
    pattern: 'λx. (f x)',
    replacement: 'f',
    explanation: 'Eta reduction: λx. (f x) ≡ f when x not free in f'
  },
  {
    name: 'identity-left',
    pattern: '(λx. x) M',
    replacement: 'M',
    explanation: 'Identity function application'
  },
  {
    name: 'compose-associative',
    pattern: '(compose (compose f g) h)',
    replacement: '(compose f (compose g h))',
    explanation: 'Function composition is associative'
  }
];
