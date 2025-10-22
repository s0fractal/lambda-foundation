// types.ts
// Event 012: Meta-Reflection Type Definitions

import type { EvolvableMorphism } from '../evolution/operators.js';

/**
 * Pattern extracted from evolution history
 */
export interface ExtractedPattern {
  id: string;
  name: string;
  description: string;
  frequency: number; // 0-1: how often this pattern appears in successful morphisms
  examples: PatternExample[];
  abstraction: string; // Abstract form of the pattern
  confidence: number; // 0-1: confidence in this pattern
}

export interface PatternExample {
  morphismId: string;
  morphismName: string;
  generation: number;
  fitness: number;
  howItMatches: string;
}

/**
 * Principle formalized from patterns
 */
export interface Principle {
  id: string;
  name: string;
  statement: string; // Natural language statement of the principle

  // Evidence
  positiveExamples: string[]; // Morphisms that demonstrate this principle
  negativeExamples: string[]; // Morphisms that violate this principle

  // Application
  application: string; // How to apply this principle in practice

  // Validation
  status: 'candidate' | 'verified' | 'canonical';
  resonances: number;
  confidence: number; // 0-1

  // Ontological compliance
  obeysLe2Rule: boolean;
  complexity: {
    roles: number;
    valid: boolean;
  };
}

/**
 * Analysis of why a morphism succeeded or failed
 */
export interface CausalityAnalysis {
  morphismId: string;
  morphismName: string;

  success: boolean;
  fitness: number;

  // Causal factors
  factors: CausalFactor[];

  // Insights
  primaryInsight: string;
  secondaryInsights: string[];

  // Generalization
  generalPrinciple?: string;
  confidence: number;
}

export interface CausalFactor {
  factor: string; // e.g., "combineAlgebras preserved both sum and count"
  impact: 'positive' | 'negative' | 'neutral';
  weight: number; // 0-1: how much this factor contributed
  explanation: string;
}

/**
 * Meta-analysis of reflection process itself
 */
export interface MetaReflection {
  observation: string;
  examples: {
    principle: string;
    roles: number;
    valid: boolean;
  }[];
  insight: string;
  metaPrinciple?: string;
  proof?: string;
  status: 'candidate' | 'verified';
}

/**
 * Complete reflection result
 */
export interface ReflectionResult {
  // Input
  historySize: number;
  successfulMorphisms: number;
  failedMorphisms: number;

  // Extracted knowledge
  patterns: ExtractedPattern[];
  principles: Principle[];
  causalAnalyses: CausalityAnalysis[];

  // Meta-level
  metaReflections: MetaReflection[];

  // Recommendations
  recommendations: string[];

  timestamp: number;
}

/**
 * Evolution history entry
 */
export interface HistoryEntry<A = any, B = any, C = any> {
  morphism: EvolvableMorphism<A, B, C>;
  generation: number;
  fitness: number;
  purity: number;
  complexity: {
    roles: number;
    valid: boolean;
  };
  mutations: string[];
  parents: string[];
  testResults?: {
    passed: number;
    total: number;
  };
  resonances?: number;
  status?: 'candidate' | 'verified' | 'canonical';
  timestamp: number;
}
