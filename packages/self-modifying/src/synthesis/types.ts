// types.ts
// Event 013: Principle-Driven Synthesis Types

import type { Principle } from '../reflection/types.js';
import type { EvolvableMorphism } from '../evolution/operators.js';

/**
 * Intent requirements decomposition
 */
export interface IntentRequirements {
  intent: string;

  input: {
    type: 'sequence' | 'single' | 'pair';
    constraint?: string;
  };

  output: {
    type: 'single' | 'sequence' | 'aggregate';
    position?: 'first' | 'last' | 'middle' | 'all';
    property?: string;
  };

  transformation: string[]; // e.g., ['preserve', 'sort', 'select']

  constraints: string[]; // e.g., ['≤2 Rule', 'purity', 'total function']
}

/**
 * Matched principle for synthesis
 */
export interface MatchedPrinciple {
  principle: Principle;
  relevance: number; // 0-1: how relevant to requirements
  application: string; // How to apply this principle
  component: 'algebra' | 'coalgebra' | 'postProcess' | 'init';
}

/**
 * Synthesis plan
 */
export interface SynthesisPlan {
  intent: string;
  requirements: IntentRequirements;
  matchedPrinciples: MatchedPrinciple[];
  confidence: number; // 0-1: confidence in synthesis
  strategy: string; // Description of synthesis strategy
}

/**
 * Synthesis result
 */
export interface SynthesisResult<A = any, B = any, C = any> {
  morphism: EvolvableMorphism<A, B, C> & { postProcess?: (result: B) => any };
  plan: SynthesisPlan;
  validation: {
    valid: boolean;
    complexity: { roles: number; valid: boolean };
    purity: number;
    testsPass: boolean;
    reason?: string;
  };
  iterations: number; // Always 1 for direct synthesis
  confidence: number;
}

/**
 * Synthesis failure
 */
export interface SynthesisFailure {
  intent: string;
  reason: string;
  fallback?: 'guided_evolution' | 'blind_evolution';
}
