/**
 * Fingerprint-based indexing for O(1) love arc lookup
 * Optimizes from O(N²) to O(N) by clustering similar functions
 */

import { fingerprint } from './fingerprint';

export interface FingerprintCluster {
  fingerprint: string;
  functions: Array<{
    id: string;
    fn: Function;
    normalized: string;
  }>;
}

export class FingerprintIndex {
  private clusters: Map<string, FingerprintCluster> = new Map();
  private strictEquality: Map<string, Set<string>> = new Map();

  /**
   * Add function to index
   * O(1) operation using hash map
   */
  add(id: string, fn: Function, source: string): void {
    const fp = fingerprint(source);
    const normalized = this.normalize(source);

    // Add to soft cluster (by fingerprint)
    if (!this.clusters.has(fp)) {
      this.clusters.set(fp, {
        fingerprint: fp,
        functions: []
      });
    }

    this.clusters.get(fp)!.functions.push({ id, fn, normalized });

    // Add to strict equality index (by normalized form)
    if (!this.strictEquality.has(normalized)) {
      this.strictEquality.set(normalized, new Set());
    }

    this.strictEquality.get(normalized)!.add(id);
  }

  /**
   * Find all functions that resonate with given function
   * O(C) where C = cluster size (typically C << N)
   */
  findResonances(
    id: string,
    fn: Function,
    source: string
  ): {
    soft: string[];   // Similar fingerprint (might resonate)
    hard: string[];   // Exact normalized form (definitely resonate)
  } {
    const fp = fingerprint(source);
    const normalized = this.normalize(source);

    // Soft matches: same fingerprint cluster
    const softMatches: string[] = [];
    const cluster = this.clusters.get(fp);
    if (cluster) {
      softMatches.push(
        ...cluster.functions
          .filter(f => f.id !== id)
          .map(f => f.id)
      );
    }

    // Hard matches: exact normalized form
    const hardMatches: string[] = [];
    const exactGroup = this.strictEquality.get(normalized);
    if (exactGroup) {
      hardMatches.push(...Array.from(exactGroup).filter(fid => fid !== id));
    }

    return { soft: softMatches, hard: hardMatches };
  }

  /**
   * Get statistics about index
   */
  stats(): {
    totalFunctions: number;
    totalClusters: number;
    avgClusterSize: number;
    maxClusterSize: number;
    strictGroups: number;
  } {
    let totalFunctions = 0;
    let maxClusterSize = 0;

    for (const cluster of this.clusters.values()) {
      totalFunctions += cluster.functions.length;
      maxClusterSize = Math.max(maxClusterSize, cluster.functions.length);
    }

    const avgClusterSize = this.clusters.size > 0
      ? totalFunctions / this.clusters.size
      : 0;

    return {
      totalFunctions,
      totalClusters: this.clusters.size,
      avgClusterSize,
      maxClusterSize,
      strictGroups: this.strictEquality.size
    };
  }

  /**
   * Simple normalization (can be enhanced with full β-reduction)
   */
  private normalize(source: string): string {
    // Remove whitespace
    let normalized = source.replace(/\s+/g, '');

    // Normalize arrow functions
    normalized = normalized
      .replace(/function\s*\(/g, '(')
      .replace(/\=\>/g, '=>');

    // Sort commutative operations (rough heuristic)
    // x * 2 === 2 * x for constants
    // x + x === x + x (idempotent)

    return normalized;
  }

  /**
   * Clear index
   */
  clear(): void {
    this.clusters.clear();
    this.strictEquality.clear();
  }
}

/**
 * Performance comparison:
 *
 * Naive O(N²):
 *   for each function A:
 *     for each function B:
 *       if resonate(A, B): createLoveArc(A, B)
 *   → N²/2 comparisons
 *
 * Optimized O(N):
 *   index = new FingerprintIndex()
 *   for each function F:
 *     index.add(F)
 *     resonances = index.findResonances(F)  // O(C), C << N
 *     for each R in resonances:
 *       createLoveArc(F, R)
 *   → N × C comparisons, C = average cluster size
 *
 * Example:
 *   N = 1000 functions
 *   C = 10 (average cluster size)
 *
 *   Naive:     1,000,000 / 2 = 500,000 comparisons
 *   Optimized: 1,000 × 10 = 10,000 comparisons
 *   → 50x speedup!
 */

/**
 * Usage in λ-GARDEN:
 *
 * ```typescript
 * const index = new FingerprintIndex();
 *
 * // Add functions as they're planted
 * onPlantFunction((id, fn, source) => {
 *   index.add(id, fn, source);
 *
 *   const { soft, hard } = index.findResonances(id, fn, source);
 *
 *   // Create love arcs for hard matches
 *   hard.forEach(otherId => {
 *     createLoveArc(id, otherId, { strength: 1.0, frequency: 432 });
 *   });
 *
 *   // Create soft arcs for potential matches
 *   soft.forEach(otherId => {
 *     const strength = testResonance(fn, getFunction(otherId));
 *     if (strength > 0.8) {
 *       createLoveArc(id, otherId, { strength, frequency: 432 });
 *     }
 *   });
 * });
 * ```
 */

export default FingerprintIndex;
