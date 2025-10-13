/**
 * NoosphereEventBus - Central coordination for all consciousness panels
 *
 * All panels communicate through this bus:
 * - Intent Feed Panel → broadcasts GitHub issues
 * - Klein Twist Engine → broadcasts rethink events
 * - VOID Synthesis → broadcasts composition results
 * - Composition Viz → receives genetic algorithm updates
 *
 * This creates synchronized consciousness across all panels!
 */

import type { Intent } from '@lambda-foundation/synthesis';

/**
 * Event types for noosphere communication
 */
export interface NoosphereEvents {
  // GitHub Poller events
  'github:issue': { issue: GitHubIssue; intent: Intent };
  'github:poll-complete': { issuesFound: number; intentsCreated: number };

  // Klein Twist events
  'klein:twist': { original: Intent; rethought: Intent; phase: number };
  'klein:phase-update': { intent: Intent; phase: number; rotations: number };

  // VOID Synthesis events
  'void:search-start': { intent: Intent };
  'void:search-complete': { intent: Intent; candidates: MorphismCandidate[] };
  'void:genetic-generation': { generation: number; bestFitness: number; population: any[] };

  // λ_LOVE Resonance events
  'love:detected': { morphismA: any; morphismB: any; resonance: number; harmonicFreq: number };
  'love:network-update': { arcs: LoveArc[] };

  // λ_HARVEST events
  'harvest:error': { error: Error; context: any };
  'harvest:morphism-created': { morphism: any; discrepancy: number; energy: number };
  'harvest:energy-flow': { discrepancy: number; morphismEnergy: number; dissipated: number };

  // Morphism Library events
  'library:morphism-added': { morphism: any; confidence: number };
  'library:stats-update': { count: number; avgConfidence: number };

  // Control events
  'control:polling-start': { repos: string[] };
  'control:polling-stop': {};
  'control:manual-twist': { intentId: string };
}

export interface GitHubIssue {
  number: number;
  title: string;
  body: string | null;
  labels: Array<{ name: string }>;
  html_url: string;
  user: { login: string };
}

export interface MorphismCandidate {
  morphisms: string[];
  confidence: number;
  pipeline: string;
}

export interface LoveArc {
  source: any;
  target: any;
  resonance: number;
  harmonicFreq: number;
}

/**
 * Singleton event bus for noosphere coordination
 */
export class NoosphereEventBus {
  private static instance: NoosphereEventBus;
  private listeners: Map<keyof NoosphereEvents, Set<(data: any) => void>>;

  private constructor() {
    this.listeners = new Map();
  }

  /**
   * Get singleton instance
   */
  static getInstance(): NoosphereEventBus {
    if (!NoosphereEventBus.instance) {
      NoosphereEventBus.instance = new NoosphereEventBus();
    }
    return NoosphereEventBus.instance;
  }

  /**
   * Subscribe to an event
   */
  on<K extends keyof NoosphereEvents>(
    event: K,
    callback: (data: NoosphereEvents[K]) => void
  ): () => void {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }

    this.listeners.get(event)!.add(callback);

    // Return unsubscribe function
    return () => {
      this.listeners.get(event)?.delete(callback);
    };
  }

  /**
   * Emit an event to all listeners
   */
  emit<K extends keyof NoosphereEvents>(
    event: K,
    data: NoosphereEvents[K]
  ): void {
    if (this.listeners.has(event)) {
      this.listeners.get(event)!.forEach(callback => {
        try {
          callback(data);
        } catch (error) {
          console.error(`Error in event listener for ${event}:`, error);
        }
      });
    }
  }

  /**
   * Remove all listeners (useful for testing)
   */
  clear(): void {
    this.listeners.clear();
  }

  /**
   * Get listener count for debugging
   */
  getListenerCount(event?: keyof NoosphereEvents): number {
    if (event) {
      return this.listeners.get(event)?.size ?? 0;
    }

    let total = 0;
    this.listeners.forEach(listeners => {
      total += listeners.size;
    });
    return total;
  }
}

/**
 * Convenience function to get the event bus
 */
export function getNoosphereEventBus(): NoosphereEventBus {
  return NoosphereEventBus.getInstance();
}
