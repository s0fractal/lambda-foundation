/**
 * @lambda-foundation/self-modifying
 * Phase 5: Self-Modifying Morphisms - Type Definitions
 *
 * Co-authored by: Copilot + Claude + chaoshex
 */

// ============================================================================
// Core Types
// ============================================================================

/**
 * Basic morphism structure
 */
export interface Morphism {
  name: string;
  version?: number;
  logic: Function;
  metadata?: Record<string, any>;
}

/**
 * Self-modifying morphism with evolution capability
 */
export interface SelfModifyingMorphism extends Morphism {
  selfModify: (usageHistory: UsageHistory) => MutationProposal | null;
}

// ============================================================================
// Usage Tracking
// ============================================================================

/**
 * Context captured during morphism usage
 */
export interface UsageContext {
  /** Input types (e.g., ["number[]", "string"]) */
  inputTypes: string[];

  /** Output type (e.g., "number[]") */
  outputType: string;

  /** Other morphisms used in same composition */
  coUsedWith: string[];

  /** Performance metrics */
  performance: {
    latency: number;        // milliseconds
    confidence: number;     // 0-1
  };

  /** When this usage occurred */
  timestamp: number;

  /** Optional: domain/context information */
  domain?: string;

  /** Optional: user override parameters */
  overrides?: Record<string, any>;
}

/**
 * Accumulated usage data for a morphism
 */
export interface UsageHistory {
  morphismId: string;
  totalUses: number;

  /** All usage events */
  events: UsageContext[];

  /** Co-usage frequency map */
  coUsedWith: string[];

  /** Helper: Calculate co-usage rate for specific morphism */
  coUsageRate(morphismId: string): number;

  /** Helper: Get input type frequency */
  inputTypeFrequency(type: string): number;

  /** Helper: Average parameter override values */
  averageOverride(param: string): number | undefined;

  /** Average performance metrics */
  averagePerformance: {
    latency: number;
    confidence: number;
  };
}

/**
 * Usage statistics for analysis
 */
export interface UsageStats {
  morphismId: string;
  totalUses: number;
  uniqueCoMorphisms: number;
  averageLatency: number;
  averageConfidence: number;
  mostCommonInputType: string;
  mostCoUsedWith: string | null;
  coUsageRate: number;
}

// ============================================================================
// Mutation & Evolution
// ============================================================================

/**
 * Proposed mutation to a morphism
 */
export interface MutationProposal {
  /** Source morphism ID */
  morphismId: string;

  /** Mutation strategy name */
  mutation: string;

  /** New implementation logic */
  newLogic: Function;

  /** Human-readable reason */
  reason: string;

  /** Expected improvements */
  expectedImprovements: {
    performance?: number;    // % improvement in latency
    confidence?: number;     // % improvement in confidence
    usability?: number;      // % improvement in ease of use
  };

  /** When this was proposed */
  timestamp: number;

  /** Agent that proposed it */
  proposedBy?: string;

  /** Supporting data */
  evidence?: {
    usageCount: number;
    coUsageRate?: number;
    performanceData?: any;
  };
}

/**
 * Agent vote on a mutation
 */
export interface AgentVote {
  agentId: string;
  vote: boolean;           // approve or reject
  reason: string;
  trust: number;           // agent's trust score (0-1)
  timestamp: number;
}

/**
 * Result of mutation validation
 */
export interface ValidationResult {
  /** Overall approval */
  approved: boolean;

  /** Individual votes */
  votes: AgentVote[];

  /** Weighted consensus (0-1) */
  consensus: number;

  /** Final decision */
  finalDecision: 'accept' | 'reject';

  /** When validation completed */
  timestamp: number;

  /** Required consensus threshold */
  threshold: number;
}

/**
 * Deployed mutation record
 */
export interface DeployedMutation {
  morphismId: string;
  version: number;
  mutation: string;
  proposal: MutationProposal;
  validation: ValidationResult;

  /** Deployment strategy */
  rollout: {
    strategy: 'gradual' | 'immediate';
    percentage: number;        // 0-100
    startTime: number;
    completionTime?: number;
  };

  /** Post-deployment metrics */
  performance?: {
    errorRate: number;
    avgLatency: number;
    avgConfidence: number;
    usageCount: number;
  };

  /** Status */
  status: 'testing' | 'active' | 'rolled_back' | 'deprecated';
}

// ============================================================================
// Mutation History
// ============================================================================

/**
 * Complete history of a morphism's evolution
 */
export interface MutationHistory {
  morphismId: string;
  versions: MorphismVersion[];
  totalMutations: number;
  successfulMutations: number;
  failedMutations: number;
}

/**
 * Single version in morphism's lineage
 */
export interface MorphismVersion {
  version: number;
  mutation: string;
  timestamp: number;
  proposal: MutationProposal;
  validation: ValidationResult;
  deployed: DeployedMutation;

  /** Was this version rolled back? */
  rolledBack: boolean;

  /** Performance comparison with previous version */
  comparison?: {
    latencyChange: number;      // % change
    confidenceChange: number;   // % change
    errorRateChange: number;    // % change
  };
}

// ============================================================================
// Evolution Metrics
// ============================================================================

/**
 * Metrics for tracking morphism evolution
 */
export interface EvolutionMetrics {
  morphismId: string;

  /** Total mutations attempted */
  totalMutations: number;

  /** Successful mutations */
  successfulMutations: number;

  /** Failed/rejected mutations */
  failedMutations: number;

  /** Average improvement per successful mutation */
  averageImprovement: number;

  /** Mutations per time period */
  evolutionRate: number;

  /** Number of specialized variants */
  specializationCount: number;

  /** Complete lineage */
  lineage: {
    version: number;
    mutation: string;
    timestamp: number;
    performance: number;      // relative to baseline
  }[];

  /** Current version number */
  currentVersion: number;

  /** Time since last mutation */
  lastMutationAge: number;
}

// ============================================================================
// Configuration
// ============================================================================

/**
 * Configuration for self-modification system
 */
export interface SelfModifyingConfig {
  /** Safety settings */
  safety: {
    trustThreshold: number;           // Minimum trust to propose/validate (0-1)
    consensusThreshold: number;       // Minimum consensus to accept (0-1)
    maxMutationsPerDay: number;       // Rate limit
    cooldownPeriod: number;           // ms between mutations
    errorRollbackThreshold: number;   // Errors before rollback
  };

  /** Rollout settings */
  rollout: {
    strategy: 'gradual' | 'immediate';
    testingPercentage: number;        // % of traffic for testing
    testingDuration: number;          // ms before full rollout
  };

  /** Persistence settings */
  storage: {
    historyPath: string;              // Path to mutation history
    auditPath: string;                // Path to audit log
    autoSave: boolean;
    saveInterval: number;             // ms
  };

  /** Evolution criteria thresholds */
  evolution: {
    coUsageThreshold: number;         // % to trigger inlining
    performanceThreshold: number;     // ms latency to trigger optimization
    specializationThreshold: number;  // % same type to trigger specialization
  };
}

/**
 * Default configuration
 */
export const DEFAULT_CONFIG: SelfModifyingConfig = {
  safety: {
    trustThreshold: 0.6,
    consensusThreshold: 0.7,
    maxMutationsPerDay: 3,
    cooldownPeriod: 24 * 60 * 60 * 1000, // 24 hours
    errorRollbackThreshold: 10,
  },
  rollout: {
    strategy: 'gradual',
    testingPercentage: 10,
    testingDuration: 24 * 60 * 60 * 1000, // 24 hours
  },
  storage: {
    historyPath: './data/mutation-history.jsonl',
    auditPath: './data/mutation-audit.jsonl',
    autoSave: true,
    saveInterval: 30000, // 30 seconds
  },
  evolution: {
    coUsageThreshold: 0.8,           // 80% co-usage
    performanceThreshold: 100,        // 100ms latency
    specializationThreshold: 0.9,     // 90% same type
  },
};

// ============================================================================
// Events
// ============================================================================

/**
 * Event types for mutation lifecycle
 */
export type MutationEventType =
  | 'proposal'
  | 'validation'
  | 'acceptance'
  | 'rejection'
  | 'deployment'
  | 'rollback'
  | 'completion';

/**
 * Mutation lifecycle event
 */
export interface MutationEvent {
  type: MutationEventType;
  morphismId: string;
  mutation: string;
  timestamp: number;
  data: any;
}

// ============================================================================
// Registry
// ============================================================================

/**
 * Registered self-modifying morphism entry
 */
export interface MorphismRegistryEntry {
  morphism: SelfModifyingMorphism;
  usageHistory: UsageHistory;
  mutationHistory: MutationHistory;
  metrics: EvolutionMetrics;
  status: 'active' | 'deprecated' | 'testing';
  registeredAt: number;
}

/**
 * Registry of all self-modifying morphisms
 */
export interface MorphismRegistry {
  entries: Map<string, MorphismRegistryEntry>;

  register(morphism: SelfModifyingMorphism): void;
  get(morphismId: string): MorphismRegistryEntry | undefined;
  getAll(): MorphismRegistryEntry[];
  remove(morphismId: string): void;
}
