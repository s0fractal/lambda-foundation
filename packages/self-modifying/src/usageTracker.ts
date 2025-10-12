/**
 * @lambda-foundation/self-modifying
 * Usage Tracker - Monitor morphism usage patterns
 *
 * Co-authored by: Copilot + Claude + chaoshex
 */

import type {
  UsageContext,
  UsageHistory,
  UsageStats,
} from './types.js';

/**
 * Tracks usage patterns for morphisms
 */
export class UsageTracker {
  /** Usage history per morphism */
  private histories: Map<string, UsageHistory>;

  constructor() {
    this.histories = new Map();
  }

  /**
   * Track a usage event
   */
  trackUsage(morphismId: string, context: UsageContext): void {
    let history = this.histories.get(morphismId);

    if (!history) {
      history = this.createHistory(morphismId);
      this.histories.set(morphismId, history);
    }

    // Add event
    history.events.push(context);
    history.totalUses++;

    // Update co-usage tracking
    for (const coMorphism of context.coUsedWith) {
      if (!history.coUsedWith.includes(coMorphism)) {
        history.coUsedWith.push(coMorphism);
      }
    }

    // Update average performance
    this.updateAveragePerformance(history, context);
  }

  /**
   * Get usage history for a morphism
   */
  getHistory(morphismId: string): UsageHistory | undefined {
    return this.histories.get(morphismId);
  }

  /**
   * Get usage statistics
   */
  getStats(morphismId: string): UsageStats | undefined {
    const history = this.histories.get(morphismId);
    if (!history) return undefined;

    const inputTypes = history.events.map(e => e.inputTypes).flat();
    const inputTypeCounts = this.countOccurrences(inputTypes);
    const mostCommonInputType = this.getMostCommon(inputTypeCounts);

    const coUsages = history.events.map(e => e.coUsedWith).flat();
    const coUsageCounts = this.countOccurrences(coUsages);
    const mostCoUsedWith = this.getMostCommon(coUsageCounts);
    const coUsageRate = mostCoUsedWith
      ? coUsageCounts.get(mostCoUsedWith)! / history.totalUses
      : 0;

    return {
      morphismId,
      totalUses: history.totalUses,
      uniqueCoMorphisms: history.coUsedWith.length,
      averageLatency: history.averagePerformance.latency,
      averageConfidence: history.averagePerformance.confidence,
      mostCommonInputType: mostCommonInputType || 'unknown',
      mostCoUsedWith,
      coUsageRate,
    };
  }

  /**
   * Get all tracked morphisms
   */
  getAllMorphisms(): string[] {
    return Array.from(this.histories.keys());
  }

  /**
   * Clear history for a morphism
   */
  clearHistory(morphismId: string): void {
    this.histories.delete(morphismId);
  }

  /**
   * Export all histories (for persistence)
   */
  exportHistories(): Record<string, UsageHistory> {
    const exported: Record<string, UsageHistory> = {};
    for (const [id, history] of this.histories.entries()) {
      exported[id] = history;
    }
    return exported;
  }

  /**
   * Import histories (from persistence)
   */
  importHistories(histories: Record<string, UsageHistory>): void {
    for (const [id, history] of Object.entries(histories)) {
      this.histories.set(id, history);
    }
  }

  // ========================================================================
  // Private Helpers
  // ========================================================================

  private createHistory(morphismId: string): UsageHistory {
    const self = this;

    return {
      morphismId,
      totalUses: 0,
      events: [],
      coUsedWith: [],

      coUsageRate(coMorphismId: string): number {
        const count = this.events.filter(e =>
          e.coUsedWith.includes(coMorphismId)
        ).length;
        return this.totalUses > 0 ? count / this.totalUses : 0;
      },

      inputTypeFrequency(type: string): number {
        const count = this.events.filter(e =>
          e.inputTypes.includes(type)
        ).length;
        return this.totalUses > 0 ? count / this.totalUses : 0;
      },

      averageOverride(param: string): number | undefined {
        const overrides = this.events
          .filter(e => e.overrides && param in e.overrides)
          .map(e => e.overrides![param]);

        if (overrides.length === 0) return undefined;

        const numericOverrides = overrides.filter(v => typeof v === 'number');
        if (numericOverrides.length === 0) return undefined;

        return numericOverrides.reduce((sum, v) => sum + v, 0) / numericOverrides.length;
      },

      averagePerformance: {
        latency: 0,
        confidence: 0,
      },
    };
  }

  private updateAveragePerformance(history: UsageHistory, context: UsageContext): void {
    const n = history.totalUses;

    // Incremental average update
    history.averagePerformance.latency =
      (history.averagePerformance.latency * (n - 1) + context.performance.latency) / n;

    history.averagePerformance.confidence =
      (history.averagePerformance.confidence * (n - 1) + context.performance.confidence) / n;
  }

  private countOccurrences<T>(arr: T[]): Map<T, number> {
    const counts = new Map<T, number>();
    for (const item of arr) {
      counts.set(item, (counts.get(item) || 0) + 1);
    }
    return counts;
  }

  private getMostCommon<T>(counts: Map<T, number>): T | null {
    if (counts.size === 0) return null;

    let maxCount = 0;
    let mostCommon: T | null = null;

    for (const [item, count] of counts.entries()) {
      if (count > maxCount) {
        maxCount = count;
        mostCommon = item;
      }
    }

    return mostCommon;
  }
}

/**
 * Global usage tracker instance
 */
export const usageTracker = new UsageTracker();

/**
 * Track usage (convenience function)
 */
export function trackUsage(morphismId: string, context: UsageContext): void {
  usageTracker.trackUsage(morphismId, context);
}

/**
 * Get usage history (convenience function)
 */
export function getUsageHistory(morphismId: string): UsageHistory | undefined {
  return usageTracker.getHistory(morphismId);
}

/**
 * Get usage statistics (convenience function)
 */
export function getUsageStats(morphismId: string): UsageStats | undefined {
  return usageTracker.getStats(morphismId);
}
