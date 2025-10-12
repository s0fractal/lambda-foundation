/**
 * @lambda-foundation/self-modifying
 * Mutation Engine - Generate morphism variants and apply mutations
 *
 * Co-authored by: Copilot + Claude + chaoshex
 */

import type {
  SelfModifyingMorphism,
  MutationProposal,
  DeployedMutation,
  MorphismVersion,
  UsageHistory,
} from './types.js';

/**
 * Generates and manages morphism mutations
 */
export class MutationEngine {
  private deployedMutations: Map<string, DeployedMutation[]>;
  private versionCounter: Map<string, number>;

  constructor() {
    this.deployedMutations = new Map();
    this.versionCounter = new Map();
  }

  /**
   * Apply a mutation to create a new morphism version
   */
  applyMutation(
    morphism: SelfModifyingMorphism,
    proposal: MutationProposal
  ): SelfModifyingMorphism {
    const currentVersion = this.versionCounter.get(morphism.name) || 1;
    const nextVersion = currentVersion + 1;

    // Create new morphism with mutated logic
    const mutated: SelfModifyingMorphism = {
      name: `${morphism.name}_v${nextVersion}`,
      version: nextVersion,
      logic: proposal.newLogic,
      selfModify: morphism.selfModify, // Keep self-modification capability
      metadata: {
        ...morphism.metadata,
        mutation: proposal.mutation,
        reason: proposal.reason,
        parentVersion: currentVersion,
        mutatedAt: Date.now(),
      },
    };

    this.versionCounter.set(morphism.name, nextVersion);

    return mutated;
  }

  /**
   * Generate mutation variants for testing
   */
  generateVariants(
    morphism: SelfModifyingMorphism,
    proposal: MutationProposal,
    count: number = 1
  ): SelfModifyingMorphism[] {
    const variants: SelfModifyingMorphism[] = [];

    for (let i = 0; i < count; i++) {
      const variant = this.applyMutation(morphism, proposal);
      variants.push(variant);
    }

    return variants;
  }

  /**
   * Deploy a mutation with gradual rollout
   */
  deployMutation(
    morphismId: string,
    version: number,
    proposal: MutationProposal,
    validation: any // ValidationResult from validationLoop
  ): DeployedMutation {
    const deployment: DeployedMutation = {
      morphismId,
      version,
      mutation: proposal.mutation,
      proposal,
      validation,
      rollout: {
        strategy: 'gradual',
        percentage: 10, // Start with 10%
        startTime: Date.now(),
      },
      status: 'testing',
    };

    // Store deployment
    if (!this.deployedMutations.has(morphismId)) {
      this.deployedMutations.set(morphismId, []);
    }
    this.deployedMutations.get(morphismId)!.push(deployment);

    return deployment;
  }

  /**
   * Update rollout percentage
   */
  updateRollout(
    morphismId: string,
    version: number,
    percentage: number
  ): void {
    const deployments = this.deployedMutations.get(morphismId);
    if (!deployments) return;

    const deployment = deployments.find(d => d.version === version);
    if (!deployment) return;

    deployment.rollout.percentage = percentage;

    if (percentage >= 100) {
      deployment.rollout.completionTime = Date.now();
      deployment.status = 'active';
    }
  }

  /**
   * Rollback a mutation
   */
  rollbackMutation(morphismId: string, version: number): void {
    const deployments = this.deployedMutations.get(morphismId);
    if (!deployments) return;

    const deployment = deployments.find(d => d.version === version);
    if (!deployment) return;

    deployment.status = 'rolled_back';
    deployment.rollout.completionTime = Date.now();
  }

  /**
   * Get deployment status
   */
  getDeploymentStatus(morphismId: string, version: number): DeployedMutation | undefined {
    const deployments = this.deployedMutations.get(morphismId);
    if (!deployments) return undefined;

    return deployments.find(d => d.version === version);
  }

  /**
   * Get all deployments for a morphism
   */
  getAllDeployments(morphismId: string): DeployedMutation[] {
    return this.deployedMutations.get(morphismId) || [];
  }

  /**
   * Create morphism lineage/history
   */
  createLineage(morphismId: string): MorphismVersion[] {
    const deployments = this.deployedMutations.get(morphismId) || [];

    return deployments.map((deployment, index) => ({
      version: deployment.version,
      mutation: deployment.mutation,
      timestamp: deployment.rollout.startTime,
      proposal: deployment.proposal,
      validation: deployment.validation,
      deployed: deployment,
      rolledBack: deployment.status === 'rolled_back',
      comparison: index > 0 ? this.compareVersions(deployments[index - 1], deployment) : undefined,
    }));
  }

  // ========================================================================
  // Mutation Strategies
  // ========================================================================

  /**
   * Inline a frequently co-used morphism
   */
  static inlineComposition(
    morphism: SelfModifyingMorphism,
    coMorphism: SelfModifyingMorphism
  ): MutationProposal {
    const newLogic = (...args: any[]) => {
      const result1 = morphism.logic(...args);
      return coMorphism.logic(result1);
    };

    return {
      morphismId: morphism.name,
      mutation: 'inlineComposition',
      newLogic,
      reason: `Frequently used with ${coMorphism.name}`,
      expectedImprovements: {
        performance: 15, // Reduce function call overhead
      },
      timestamp: Date.now(),
    };
  }

  /**
   * Specialize for a specific input type
   */
  static specialize(
    morphism: SelfModifyingMorphism,
    targetType: string,
    optimizedLogic: Function
  ): MutationProposal {
    return {
      morphismId: morphism.name,
      mutation: `specialization${targetType}`,
      newLogic: optimizedLogic,
      reason: `Optimized for ${targetType} (90%+ of inputs)`,
      expectedImprovements: {
        performance: 25,
        confidence: 5,
      },
      timestamp: Date.now(),
    };
  }

  /**
   * Tune default parameters based on usage
   */
  static tuneParameters(
    morphism: SelfModifyingMorphism,
    newDefaults: Record<string, any>
  ): MutationProposal {
    const newLogic = (...args: any[]) => {
      // Merge user args with new defaults
      const mergedArgs = { ...newDefaults, ...args[0] };
      return morphism.logic(mergedArgs);
    };

    return {
      morphismId: morphism.name,
      mutation: 'tuneParameters',
      newLogic,
      reason: `Adjusted defaults based on user overrides`,
      expectedImprovements: {
        usability: 20,
        confidence: 10,
      },
      timestamp: Date.now(),
    };
  }

  /**
   * Replace algorithm with more efficient version
   */
  static replaceAlgorithm(
    morphism: SelfModifyingMorphism,
    newAlgorithm: Function,
    algorithmName: string
  ): MutationProposal {
    return {
      morphismId: morphism.name,
      mutation: 'algorithmReplacement',
      newLogic: newAlgorithm,
      reason: `Replaced with ${algorithmName} for better performance`,
      expectedImprovements: {
        performance: 40,
      },
      timestamp: Date.now(),
    };
  }

  // ========================================================================
  // Private Helpers
  // ========================================================================

  private compareVersions(
    prev: DeployedMutation,
    current: DeployedMutation
  ): {
    latencyChange: number;
    confidenceChange: number;
    errorRateChange: number;
  } | undefined {
    if (!prev.performance || !current.performance) {
      return undefined;
    }

    return {
      latencyChange: ((current.performance.avgLatency - prev.performance.avgLatency) / prev.performance.avgLatency) * 100,
      confidenceChange: ((current.performance.avgConfidence - prev.performance.avgConfidence) / prev.performance.avgConfidence) * 100,
      errorRateChange: ((current.performance.errorRate - prev.performance.errorRate) / Math.max(prev.performance.errorRate, 0.001)) * 100,
    };
  }
}

/**
 * Global mutation engine instance
 */
export const mutationEngine = new MutationEngine();

/**
 * Apply mutation (convenience function)
 */
export function applyMutation(
  morphism: SelfModifyingMorphism,
  proposal: MutationProposal
): SelfModifyingMorphism {
  return mutationEngine.applyMutation(morphism, proposal);
}

/**
 * Deploy mutation (convenience function)
 */
export function deployMutation(
  morphismId: string,
  version: number,
  proposal: MutationProposal,
  validation: any
): DeployedMutation {
  return mutationEngine.deployMutation(morphismId, version, proposal, validation);
}

/**
 * Common mutation strategies
 */
export const MutationStrategies = {
  inlineComposition: MutationEngine.inlineComposition,
  specialize: MutationEngine.specialize,
  tuneParameters: MutationEngine.tuneParameters,
  replaceAlgorithm: MutationEngine.replaceAlgorithm,
};
