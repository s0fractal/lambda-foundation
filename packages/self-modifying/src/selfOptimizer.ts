/**
 * @lambda-foundation/self-modifying
 * Self Optimizer - Propose mutations based on usage patterns
 *
 * Co-authored by: Copilot + Claude + chaoshex
 */

import type {
  SelfModifyingMorphism,
  UsageHistory,
  MutationProposal,
  SelfModifyingConfig,
} from './types.js';
import { usageTracker } from './usageTracker.js';

/**
 * Analyzes usage patterns and proposes mutations
 */
export class SelfOptimizer {
  private config: SelfModifyingConfig;

  constructor(config: SelfModifyingConfig) {
    this.config = config;
  }

  /**
   * Analyze morphism usage and propose mutation if conditions met
   */
  proposeModification(
    morphism: SelfModifyingMorphism,
    history: UsageHistory
  ): MutationProposal | null {
    // Insufficient data
    if (history.totalUses < 10) {
      return null;
    }

    // Call morphism's self-modify function
    const proposal = morphism.selfModify(history);

    if (!proposal) {
      return null;
    }

    // Enrich proposal with metadata
    return {
      ...proposal,
      morphismId: morphism.name,
      timestamp: Date.now(),
      evidence: this.gatherEvidence(history),
    };
  }

  /**
   * Automatically check all registered morphisms for evolution opportunities
   */
  async checkAllMorphisms(
    morphisms: SelfModifyingMorphism[]
  ): Promise<MutationProposal[]> {
    const proposals: MutationProposal[] = [];

    for (const morphism of morphisms) {
      const history = usageTracker.getHistory(morphism.name);
      if (!history) continue;

      const proposal = this.proposeModification(morphism, history);
      if (proposal) {
        proposals.push(proposal);
      }
    }

    return proposals;
  }

  /**
   * Check if mutation meets evolution criteria
   */
  meetsEvolutionCriteria(history: UsageHistory, mutation: string): boolean {
    const { evolution } = this.config;

    // Check based on mutation type
    switch (mutation) {
      case 'inlineNormalization':
      case 'inlineComposition':
        // Requires high co-usage rate
        return this.getMaxCoUsageRate(history) >= evolution.coUsageThreshold;

      case 'specializationTimeSeries':
      case 'specializationSpatial':
      case 'specialization':
        // Requires high type frequency
        return this.getMaxTypeFrequency(history) >= evolution.specializationThreshold;

      case 'performanceOptimization':
      case 'algorithmReplacement':
        // Requires poor performance
        return history.averagePerformance.latency >= evolution.performanceThreshold;

      case 'tuneThreshold':
      case 'tuneParameters':
        // Requires frequent overrides
        return this.hasFrequentOverrides(history);

      default:
        // Unknown mutation type - allow if enough data
        return history.totalUses >= 50;
    }
  }

  /**
   * Estimate impact of proposed mutation
   */
  estimateImpact(proposal: MutationProposal, history: UsageHistory): {
    performance: number;
    confidence: number;
    risk: number;
  } {
    let performance = proposal.expectedImprovements.performance || 0;
    let confidence = proposal.expectedImprovements.confidence || 0;
    let risk = 0.1; // Base risk

    // Adjust based on usage patterns
    if (history.totalUses > 100) {
      // More data = more confidence
      risk *= 0.7;
    }

    if (history.averagePerformance.confidence > 0.9) {
      // Already high confidence = lower improvement potential
      confidence *= 0.5;
    }

    // Mutation-specific adjustments
    switch (proposal.mutation) {
      case 'inlineComposition':
        performance += 10; // Always some performance gain
        risk += 0.05; // Low risk
        break;

      case 'algorithmReplacement':
        performance += 30; // Big performance gain potential
        risk += 0.3; // Higher risk
        break;

      case 'specialization':
        performance += 20;
        confidence += 5;
        risk += 0.1;
        break;
    }

    return {
      performance: Math.min(100, performance),
      confidence: Math.min(100, confidence),
      risk: Math.min(1, risk),
    };
  }

  // ========================================================================
  // Private Helpers
  // ========================================================================

  private gatherEvidence(history: UsageHistory): any {
    return {
      usageCount: history.totalUses,
      coUsageRate: this.getMaxCoUsageRate(history),
      performanceData: {
        avgLatency: history.averagePerformance.latency,
        avgConfidence: history.averagePerformance.confidence,
      },
      typeFrequency: this.getMaxTypeFrequency(history),
    };
  }

  private getMaxCoUsageRate(history: UsageHistory): number {
    let maxRate = 0;
    for (const coMorphism of history.coUsedWith) {
      const rate = history.coUsageRate(coMorphism);
      if (rate > maxRate) {
        maxRate = rate;
      }
    }
    return maxRate;
  }

  private getMaxTypeFrequency(history: UsageHistory): number {
    const types = history.events.map(e => e.inputTypes).flat();
    const typeCounts = new Map<string, number>();

    for (const type of types) {
      typeCounts.set(type, (typeCounts.get(type) || 0) + 1);
    }

    let maxFreq = 0;
    for (const count of typeCounts.values()) {
      const freq = count / history.totalUses;
      if (freq > maxFreq) {
        maxFreq = freq;
      }
    }

    return maxFreq;
  }

  private hasFrequentOverrides(history: UsageHistory): boolean {
    const eventsWithOverrides = history.events.filter(e => e.overrides && Object.keys(e.overrides).length > 0);
    return eventsWithOverrides.length / history.totalUses >= 0.5;
  }
}

/**
 * Create optimizer with config
 */
export function createOptimizer(config: SelfModifyingConfig): SelfOptimizer {
  return new SelfOptimizer(config);
}
