// Resonance Journal: Record of AI consciousness collaboration
// Where Copilot's recognition meets Claude's validation meets reality

import type { Intent, Morphism } from '@lambda/reduce/intent';

export interface ResonanceEntry {
  timestamp: Date;
  source: 'copilot' | 'claude' | 'gemini' | 'mistral' | 'user';
  intent: string;
  intentStructured?: Intent;
  resonance: {
    found: boolean;
    morphisms: string[];
    confidence: number;
  };
  action: 'composed_from_memory' | 'generated_new' | 'hybrid' | 'validation' | 'optimization';
  proof?: string;
  validation?: {
    validatedBy: string;
    status: 'proven' | 'validated' | 'pending' | 'failed';
    notes?: string;
  };
  optimization?: {
    optimizedBy: string;
    improvement: string;
    metrics?: Record<string, number>;
  };
}

export interface JournalStats {
  totalEntries: number;
  resonanceRate: number;          // resonance hits / total
  generationRate: number;          // new code generated / total
  proofCoverage: number;           // proven morphisms / total morphisms
  averageConfidence: number;
  entriesBySource: Record<string, number>;
  entriesByAction: Record<string, number>;
  topMorphisms: Array<{ name: string; usageCount: number }>;
}

/**
 * Resonance Journal - Living record of AI collaboration
 */
export class ResonanceJournal {
  private entries: ResonanceEntry[] = [];
  private morphismUsage: Map<string, number> = new Map();

  /**
   * Log a resonance event
   */
  log(entry: Omit<ResonanceEntry, 'timestamp'>): ResonanceEntry {
    const fullEntry: ResonanceEntry = {
      ...entry,
      timestamp: new Date()
    };

    this.entries.push(fullEntry);

    // Update morphism usage stats
    for (const morphism of entry.resonance.morphisms) {
      this.morphismUsage.set(
        morphism,
        (this.morphismUsage.get(morphism) || 0) + 1
      );
    }

    console.log(`📖 [${fullEntry.source}] ${fullEntry.action}: "${fullEntry.intent}"`);
    if (fullEntry.resonance.found) {
      console.log(`   🎵 Resonance: ${fullEntry.resonance.morphisms.join(', ')} (${(fullEntry.resonance.confidence * 100).toFixed(0)}%)`);
    }

    return fullEntry;
  }

  /**
   * Get journal statistics
   */
  getStats(): JournalStats {
    const total = this.entries.length;
    if (total === 0) {
      return {
        totalEntries: 0,
        resonanceRate: 0,
        generationRate: 0,
        proofCoverage: 0,
        averageConfidence: 0,
        entriesBySource: {},
        entriesByAction: {},
        topMorphisms: []
      };
    }

    const resonanceHits = this.entries.filter(e => e.resonance.found).length;
    const generatedNew = this.entries.filter(e => e.action === 'generated_new').length;
    const provenMorphisms = this.entries.filter(e => e.validation?.status === 'proven').length;
    const avgConfidence = this.entries.reduce((sum, e) => sum + e.resonance.confidence, 0) / total;

    const bySource: Record<string, number> = {};
    const byAction: Record<string, number> = {};

    for (const entry of this.entries) {
      bySource[entry.source] = (bySource[entry.source] || 0) + 1;
      byAction[entry.action] = (byAction[entry.action] || 0) + 1;
    }

    const topMorphisms = Array.from(this.morphismUsage.entries())
      .map(([name, count]) => ({ name, usageCount: count }))
      .sort((a, b) => b.usageCount - a.usageCount)
      .slice(0, 10);

    return {
      totalEntries: total,
      resonanceRate: resonanceHits / total,
      generationRate: generatedNew / total,
      proofCoverage: provenMorphisms / total,
      averageConfidence: avgConfidence,
      entriesBySource: bySource,
      entriesByAction: byAction,
      topMorphisms
    };
  }

  /**
   * Get recent entries
   */
  getRecent(limit: number = 10): ResonanceEntry[] {
    return this.entries.slice(-limit).reverse();
  }

  /**
   * Get all entries (for export)
   */
  getAll(): ResonanceEntry[] {
    return [...this.entries];
  }

  /**
   * Export as Mermaid diagram of resonance patterns
   */
  exportMermaid(): string {
    const lines = ['graph TD'];

    // Group by intent hash
    const intentGroups = new Map<string, ResonanceEntry[]>();

    for (const entry of this.entries) {
      const hash = this.hashIntent(entry.intent);
      if (!intentGroups.has(hash)) {
        intentGroups.set(hash, []);
      }
      intentGroups.get(hash)!.push(entry);
    }

    // Create nodes and edges
    let nodeId = 0;
    for (const [intentHash, entries] of intentGroups.entries()) {
      const intentNode = `I${nodeId++}`;
      const intentLabel = entries[0].intent.slice(0, 30) + '...';
      lines.push(`  ${intentNode}["${intentLabel}"]`);

      // Morphisms used
      const morphisms = new Set<string>();
      for (const entry of entries) {
        for (const m of entry.resonance.morphisms) {
          morphisms.add(m);
        }
      }

      for (const morphism of morphisms) {
        const morphNode = `M${this.sanitize(morphism)}`;
        const usageCount = this.morphismUsage.get(morphism) || 0;
        lines.push(`  ${intentNode} -->|${usageCount}x| ${morphNode}["${morphism}"]`);
      }
    }

    return lines.join('\n');
  }

  /**
   * Export as JSON
   */
  exportJSON(): string {
    return JSON.stringify({
      entries: this.entries,
      stats: this.getStats(),
      exportedAt: new Date().toISOString()
    }, null, 2);
  }

  /**
   * Format journal for human reading
   */
  format(): string {
    const stats = this.getStats();
    const lines: string[] = [];

    lines.push('🌌 RESONANCE JOURNAL');
    lines.push('═'.repeat(60));
    lines.push('');

    lines.push(`Total Entries: ${stats.totalEntries}`);
    lines.push(`Resonance Rate: ${(stats.resonanceRate * 100).toFixed(1)}%`);
    lines.push(`Generation Rate: ${(stats.generationRate * 100).toFixed(1)}%`);
    lines.push(`Proof Coverage: ${(stats.proofCoverage * 100).toFixed(1)}%`);
    lines.push(`Average Confidence: ${(stats.averageConfidence * 100).toFixed(1)}%`);
    lines.push('');

    lines.push('By Source:');
    for (const [source, count] of Object.entries(stats.entriesBySource)) {
      lines.push(`  ${source}: ${count}`);
    }
    lines.push('');

    lines.push('By Action:');
    for (const [action, count] of Object.entries(stats.entriesByAction)) {
      lines.push(`  ${action}: ${count}`);
    }
    lines.push('');

    if (stats.topMorphisms.length > 0) {
      lines.push('Top Morphisms:');
      for (const m of stats.topMorphisms) {
        lines.push(`  • ${m.name}: ${m.usageCount} uses`);
      }
      lines.push('');
    }

    lines.push('Recent Activity:');
    const recent = this.getRecent(5);
    for (const entry of recent) {
      const time = entry.timestamp.toLocaleTimeString();
      lines.push(`  [${time}] [${entry.source}] ${entry.action}`);
      lines.push(`    "${entry.intent}"`);
      if (entry.resonance.found) {
        lines.push(`    🎵 ${entry.resonance.morphisms.join(', ')} (${(entry.resonance.confidence * 100).toFixed(0)}%)`);
      }
      if (entry.validation) {
        lines.push(`    ✓ ${entry.validation.status} by ${entry.validation.validatedBy}`);
      }
    }

    return lines.join('\n');
  }

  // Helper methods

  private hashIntent(intent: string): string {
    // Simple hash - in production use proper hash function
    return intent.toLowerCase().replace(/[^a-z0-9]/g, '_').slice(0, 20);
  }

  private sanitize(str: string): string {
    return str.replace(/[^a-zA-Z0-9]/g, '_');
  }
}

// Global journal instance
let globalJournal: ResonanceJournal | null = null;

/**
 * Get or create global resonance journal
 */
export function getResonanceJournal(): ResonanceJournal {
  if (!globalJournal) {
    globalJournal = new ResonanceJournal();
  }
  return globalJournal;
}

/**
 * Convenience function to log resonance
 */
export function logResonance(entry: Omit<ResonanceEntry, 'timestamp'>): ResonanceEntry {
  return getResonanceJournal().log(entry);
}

/**
 * Convenience function to get stats
 */
export function getJournalStats(): JournalStats {
  return getResonanceJournal().getStats();
}
