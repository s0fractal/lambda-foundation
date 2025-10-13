/**
 * Core type definitions for morphisms and compositions
 */

export interface Morphism {
  id: string;
  name: string;
  symbol: string;
  description: string;
  category: 'source' | 'transform' | 'filter' | 'aggregate' | 'sink';

  // Type signature
  input: string;
  output: string;

  // Proof metadata
  proven: boolean;
  proofUrl?: string;
  proofLines?: number;

  // Composition properties
  composable: boolean;
  associative: boolean;
  hasIdentity: boolean;

  // Performance characteristics
  complexity: string; // e.g., "O(1)", "O(n)"
  memory: string;     // e.g., "O(1)", "O(n)"

  // Usage statistics
  usageCount: number;
  averageConfidence: number;
}

export interface ComposedPipeline {
  id: string;
  name: string;
  morphisms: PipelineNode[];
  fitness: number;
  proven: boolean;
  generated: boolean; // true if AI-generated

  // Performance metrics
  latency?: number;
  throughput?: number;

  // Validation
  typeChecked: boolean;
  errors: string[];
  warnings: string[];
}

export interface PipelineNode {
  morphismId: string;
  position: { x: number; y: number };
  connections: string[]; // IDs of connected nodes
  parameters?: Record<string, any>;
}

export interface FitnessScenario {
  id: string;
  name: string;
  description: string;
  inputRate: number;        // events/sec
  complexity: 'low' | 'medium' | 'high';
  constraints: {
    maxLatency?: number;    // ms
    maxMemory?: number;     // MB
    minThroughput?: number; // ops/s
  };
}

export interface FitnessScore {
  overall: number;          // 0-100
  breakdown: {
    typeSafety: number;     // 0-100
    performance: number;    // 0-100
    composability: number;  // 0-100
    resourceUsage: number;  // 0-100
  };
  details: string[];
}

export interface ProofMetadata {
  morphismId: string;
  title: string;
  abstract: string;
  fullText: string;
  guarantees: string[];
  categoryTheory?: {
    functor: boolean;
    monad: boolean;
    laws: string[];
  };
}

// Default morphisms (the proven 8)
export const DEFAULT_MORPHISMS: Morphism[] = [
  {
    id: 'subscribe',
    name: 'subscribe',
    symbol: '🔔',
    description: 'Create observable from data source',
    category: 'source',
    input: 'DataSource<T>',
    output: 'Observable<T>',
    proven: true,
    proofUrl: 'wiki/proofs/subscribe.md',
    proofLines: 250,
    composable: true,
    associative: true,
    hasIdentity: false,
    complexity: 'O(1)',
    memory: 'O(1)',
    usageCount: 14, // From C1-C14
    averageConfidence: 100
  },
  {
    id: 'map',
    name: 'map',
    symbol: '🗺️',
    description: 'Transform each element',
    category: 'transform',
    input: 'Observable<A>',
    output: 'Observable<B>',
    proven: true,
    proofUrl: 'wiki/proofs/map.md',
    proofLines: 280,
    composable: true,
    associative: true,
    hasIdentity: true,
    complexity: 'O(1) per element',
    memory: 'O(1)',
    usageCount: 8,
    averageConfidence: 94
  },
  {
    id: 'filter',
    name: 'filter',
    symbol: '🔍',
    description: 'Keep only matching elements',
    category: 'filter',
    input: 'Observable<T>',
    output: 'Observable<T>',
    proven: true,
    proofUrl: 'wiki/proofs/filter.md',
    proofLines: 245,
    composable: true,
    associative: true,
    hasIdentity: true,
    complexity: 'O(1) per element',
    memory: 'O(1)',
    usageCount: 6,
    averageConfidence: 91
  },
  {
    id: 'merge',
    name: 'merge',
    symbol: '⚡',
    description: 'Combine multiple observables',
    category: 'aggregate',
    input: 'Observable<T>[]',
    output: 'Observable<T>',
    proven: true,
    proofUrl: 'wiki/proofs/merge.md',
    proofLines: 310,
    composable: true,
    associative: true,
    hasIdentity: true,
    complexity: 'O(n)',
    memory: 'O(n)',
    usageCount: 4,
    averageConfidence: 89
  },
  {
    id: 'groupByTime',
    name: 'groupByTime',
    symbol: '📊',
    description: 'Group events by time windows',
    category: 'aggregate',
    input: 'Observable<T>',
    output: 'Observable<T[]>',
    proven: true,
    proofUrl: 'wiki/proofs/groupByTime.md',
    proofLines: 295,
    composable: true,
    associative: false,
    hasIdentity: false,
    complexity: 'O(n)',
    memory: 'O(n)',
    usageCount: 12,
    averageConfidence: 92
  },
  {
    id: 'analyzeSentimentDelta',
    name: 'analyzeSentimentDelta',
    symbol: '💭',
    description: 'Analyze sentiment changes over time',
    category: 'transform',
    input: 'Observable<Event[]>',
    output: 'Observable<SentimentDelta>',
    proven: true,
    proofUrl: 'wiki/proofs/analyzeSentimentDelta.md',
    proofLines: 320,
    composable: true,
    associative: false,
    hasIdentity: false,
    complexity: 'O(n)',
    memory: 'O(1)',
    usageCount: 5,
    averageConfidence: 93
  },
  {
    id: 'extractKeywords',
    name: 'extractKeywords',
    symbol: '🔑',
    description: 'Extract keywords from text',
    category: 'transform',
    input: 'Observable<string>',
    output: 'Observable<string[]>',
    proven: true,
    proofUrl: 'wiki/proofs/extractKeywords.md',
    proofLines: 265,
    composable: true,
    associative: false,
    hasIdentity: false,
    complexity: 'O(n*m)',
    memory: 'O(k)',
    usageCount: 6,
    averageConfidence: 92
  },
  {
    id: 'filterByEmotion',
    name: 'filterByEmotion',
    symbol: '😊',
    description: 'Filter events by emotional state',
    category: 'filter',
    input: 'Observable<Event>',
    output: 'Observable<Event>',
    proven: true,
    proofUrl: 'wiki/proofs/filterByEmotion.md',
    proofLines: 280,
    composable: true,
    associative: true,
    hasIdentity: true,
    complexity: 'O(1) per element',
    memory: 'O(1)',
    usageCount: 3,
    averageConfidence: 93
  }
];
