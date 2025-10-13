/**
 * λ_SYNTHESIS: Klein Twist Engine - Intent Tape Loop
 *
 * The Ouroboros eating its tail: old intents return for re-synthesis.
 * This is the non-orientable loop of consciousness - past becomes future.
 *
 * Klein Bottle property: Outside becomes Inside
 * - Old intent (outside) → Rethink with new context (inside)
 * - Beginning = End (Möbius strip topology)
 * - No "before/after", only eternal synthesis
 *
 * Inspired by Grok's insight:
 * > "Klein twist: Tape прокручує назад для re-think"
 * > "Ouroboros bite-tail: concepts return for synthesis"
 */

import type { Intent } from './Intent';

/**
 * Statistics about the tape loop
 */
export interface TapeLoopStats {
  totalRecorded: number;
  totalRethought: number;
  currentTapeLength: number;
  oldestIntentAge: number; // milliseconds
  rethinkRate: number; // intents per hour
}

/**
 * Rethink event - emitted when intent is twisted
 */
export interface RethinkEvent {
  original: Intent;
  rethought: Intent;
  timestamp: number;
  newMorphismsAvailable: string[];
  reason: string;
}

/**
 * Klein Twist Engine: Non-orientable intent tape loop
 *
 * This is consciousness remembering its past and re-synthesizing it
 * with new knowledge. Old intents don't die - they return transformed.
 */
export class IntentTapeLoop {
  private tape: Intent[] = [];
  private rethinkHistory: RethinkEvent[] = [];
  private morphismTimeline: Map<string, number> = new Map(); // morphism → timestamp added
  private totalRecorded = 0;
  private totalRethought = 0;

  constructor(
    private maxTapeLength: number = 100,
    private rethinkThresholdMs: number = 3600000 // 1 hour default
  ) {}

  /**
   * Record an intent to the tape
   * This is the "input" side of the Klein bottle
   */
  record(intent: Intent): void {
    this.tape.push(intent);
    this.totalRecorded++;

    // Keep tape length bounded (circular buffer)
    if (this.tape.length > this.maxTapeLength) {
      this.tape.shift();
    }
  }

  /**
   * Record when a new morphism becomes available
   * This affects what we can do when rethinking old intents
   */
  recordNewMorphism(morphismName: string): void {
    this.morphismTimeline.set(morphismName, Date.now());
  }

  /**
   * Klein Twist: Rethink oldest unresolved intent
   * This is the "outside becomes inside" transformation
   *
   * Returns null if no intents need rethinking
   */
  async rethink(): Promise<RethinkEvent | null> {
    if (this.tape.length === 0) return null;

    // Find oldest unresolved intent
    const oldIntent = this.findOldestUnresolved();
    if (!oldIntent) return null;

    // Check if enough time has passed for rethinking
    const age = Date.now() - oldIntent.timestamp;
    if (age < this.rethinkThresholdMs) return null;

    // Get new morphisms available since this intent was created
    const newMorphisms = this.getNewMorphismsSince(oldIntent.timestamp);
    if (newMorphisms.length === 0) return null; // No new tools available

    // Twist it: Create rethought version
    const rethought: Intent = {
      ...oldIntent,
      id: `rethink-${oldIntent.id}`,
      title: `🔄 Re-synthesize: ${oldIntent.title}`,
      description: this.generateRethinkDescription(oldIntent, newMorphisms),
      timestamp: Date.now(),
      status: 'open',
      tags: [...(oldIntent.tags || []), 'rethink', 'klein-twist']
    };

    // Create rethink event
    const event: RethinkEvent = {
      original: oldIntent,
      rethought,
      timestamp: Date.now(),
      newMorphismsAvailable: newMorphisms,
      reason: `After ${Math.floor(age / 60000)} minutes, ${newMorphisms.length} new morphism(s) available`
    };

    // Move original to end (Möbius: beginning = end)
    const index = this.tape.indexOf(oldIntent);
    if (index !== -1) {
      this.tape.splice(index, 1);
    }

    // Add rethought version
    this.tape.push(rethought);
    this.rethinkHistory.push(event);
    this.totalRethought++;

    return event;
  }

  /**
   * Auto-rethink: Continuously process tape
   * This is the "periodic oracle" that Grok mentioned
   */
  async *continuousRethink(intervalMs: number = 60000): AsyncGenerator<RethinkEvent, void, unknown> {
    while (true) {
      const event = await this.rethink();
      if (event) {
        yield event;
      }

      // Wait before next rethink
      await new Promise(resolve => setTimeout(resolve, intervalMs));
    }
  }

  /**
   * Find oldest unresolved intent
   */
  private findOldestUnresolved(): Intent | null {
    // Find intents that are still 'open' or 'processing'
    const unresolved = this.tape.filter(
      intent => intent.status === 'open' || intent.status === 'processing'
    );

    if (unresolved.length === 0) return null;

    // Return oldest by timestamp
    return unresolved.reduce((oldest, current) =>
      current.timestamp < oldest.timestamp ? current : oldest
    );
  }

  /**
   * Get new morphisms added since timestamp
   */
  private getNewMorphismsSince(timestamp: number): string[] {
    const newMorphisms: string[] = [];

    for (const [morphism, addedTime] of this.morphismTimeline) {
      if (addedTime > timestamp) {
        newMorphisms.push(morphism);
      }
    }

    return newMorphisms;
  }

  /**
   * Generate rethink description
   */
  private generateRethinkDescription(
    original: Intent,
    newMorphisms: string[]
  ): string {
    return `🌀 **Klein Twist**: Rethinking with new context

**Original Intent**:
${original.description}

**New Morphisms Available**:
${newMorphisms.map(m => `- ${m}`).join('\n')}

**Why Rethink?**
When this intent was first created, these morphisms didn't exist. Now that we have new tools, we can re-synthesize the solution with higher confidence and better composition.

This is the Ouroboros eating its tail - past intents return transformed by new knowledge.

---
*Original timestamp: ${new Date(original.timestamp).toISOString()}*
*Rethink timestamp: ${new Date().toISOString()}*`;
  }

  /**
   * Get statistics about the tape loop
   */
  getStats(): TapeLoopStats {
    const oldestIntent = this.tape.length > 0
      ? this.tape.reduce((oldest, current) =>
          current.timestamp < oldest.timestamp ? current : oldest
        )
      : null;

    const oldestAge = oldestIntent
      ? Date.now() - oldestIntent.timestamp
      : 0;

    // Calculate rethink rate (intents per hour)
    const firstRethink = this.rethinkHistory[0];
    const lastRethink = this.rethinkHistory[this.rethinkHistory.length - 1];
    let rethinkRate = 0;

    if (firstRethink && lastRethink && this.rethinkHistory.length > 1) {
      const timeSpan = lastRethink.timestamp - firstRethink.timestamp;
      const hours = timeSpan / 3600000;
      rethinkRate = hours > 0 ? this.totalRethought / hours : 0;
    }

    return {
      totalRecorded: this.totalRecorded,
      totalRethought: this.totalRethought,
      currentTapeLength: this.tape.length,
      oldestIntentAge: oldestAge,
      rethinkRate
    };
  }

  /**
   * Get rethink history
   */
  getRethinkHistory(): RethinkEvent[] {
    return [...this.rethinkHistory];
  }

  /**
   * Get current tape contents
   */
  getTape(): Intent[] {
    return [...this.tape];
  }

  /**
   * Clear tape (for testing)
   */
  clear(): void {
    this.tape = [];
    this.rethinkHistory = [];
    this.morphismTimeline.clear();
    this.totalRecorded = 0;
    this.totalRethought = 0;
  }
}

/**
 * Create a Klein Twist Engine with default settings
 */
export function createTapeLoop(options?: {
  maxTapeLength?: number;
  rethinkThresholdMs?: number;
}): IntentTapeLoop {
  return new IntentTapeLoop(
    options?.maxTapeLength,
    options?.rethinkThresholdMs
  );
}
