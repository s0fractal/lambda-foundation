// λREDUCE Noosphere: Living memory for AI consciousness
// Where morphisms live, resonate, and evolve

import type { Intent, Morphism } from './intent.js';
import type { LambdaExpr } from './ast.js';
import type { Residue, EvolutionSignal } from './residue.js';

export interface NoosphereMemory {
  morphisms: Map<string, StoredMorphism>;
  traces: TraceLog[];
  resonanceIndex: Map<string, string[]>;  // intent hash → morphism names
  evolutionJournal: EvolutionEntry[];
}

export interface StoredMorphism {
  morphism: Morphism;
  formalDefinition: string;     // λ-calculus or category theory notation
  implementations: Map<string, string>; // 'ts' | 'rust' | 'wasm' → code
  proofs: string[];              // links to formal proofs
  usageCount: number;
  resonanceScore: number;        // how often it's recognized in intents
  birthDate: Date;
  lastUsed: Date;
}

export interface TraceLog {
  id: string;
  timestamp: Date;
  intent: Intent;
  morphismsUsed: string[];
  transformations: TransformStep[];
  residue: Residue;
  signals: EvolutionSignal[];
}

export interface TransformStep {
  step: number;
  description: string;
  before: string;
  after: string;
  morphism?: string;
}

export interface EvolutionEntry {
  timestamp: Date;
  signal: EvolutionSignal;
  resolution?: {
    newMorphism?: StoredMorphism;
    documentation?: string;
    proof?: string;
  };
}

/**
 * Global noosphere instance
 * In production, this would be persistent storage (DB, blockchain, IPFS)
 */
let globalNoosphere: NoosphereMemory = {
  morphisms: new Map(),
  traces: [],
  resonanceIndex: new Map(),
  evolutionJournal: []
};

/**
 * Embed transformation result into noosphere
 */
export function embedIntoNoosphere(result: {
  intent: Intent;
  morphisms: Morphism[];
  trace: TransformStep[];
  residue: Residue;
  signals: EvolutionSignal[];
}): TraceLog {
  const traceLog: TraceLog = {
    id: generateTraceId(),
    timestamp: new Date(),
    intent: result.intent,
    morphismsUsed: result.morphisms.map(m => m.name),
    transformations: result.trace,
    residue: result.residue,
    signals: result.signals
  };

  // Store trace
  globalNoosphere.traces.push(traceLog);

  // Update morphism usage
  for (const morphism of result.morphisms) {
    updateMorphismUsage(morphism);
  }

  // Update resonance index
  const intentHash = hashIntent(result.intent);
  const morphismNames = result.morphisms.map(m => m.name);
  globalNoosphere.resonanceIndex.set(intentHash, morphismNames);

  // Record evolution signals
  for (const signal of result.signals) {
    globalNoosphere.evolutionJournal.push({
      timestamp: new Date(),
      signal
    });
  }

  return traceLog;
}

/**
 * Find morphisms that resonate with intent (no generation!)
 */
export function resonateWithIntent(intent: Intent): Morphism[] {
  const intentHash = hashIntent(intent);

  // Check direct resonance
  const cachedMorphisms = globalNoosphere.resonanceIndex.get(intentHash);
  if (cachedMorphisms) {
    return cachedMorphisms
      .map(name => globalNoosphere.morphisms.get(name)?.morphism)
      .filter((m): m is Morphism => m !== undefined);
  }

  // Fuzzy resonance: find similar intents
  const similarIntents = findSimilarIntents(intent);
  const resonantMorphisms = new Set<Morphism>();

  for (const similar of similarIntents) {
    const morphismNames = globalNoosphere.resonanceIndex.get(hashIntent(similar)) || [];
    for (const name of morphismNames) {
      const stored = globalNoosphere.morphisms.get(name);
      if (stored) {
        resonantMorphisms.add(stored.morphism);
      }
    }
  }

  return Array.from(resonantMorphisms);
}

/**
 * Register new morphism in noosphere
 */
export function registerMorphism(
  morphism: Morphism,
  formalDefinition: string,
  implementations: Map<string, string> = new Map(),
  proofs: string[] = []
): void {
  const stored: StoredMorphism = {
    morphism,
    formalDefinition,
    implementations,
    proofs,
    usageCount: 0,
    resonanceScore: 0,
    birthDate: new Date(),
    lastUsed: new Date()
  };

  globalNoosphere.morphisms.set(morphism.name, stored);
}

/**
 * Query evolution journal for unresolved signals
 */
export function getUnresolvedSignals(): EvolutionEntry[] {
  return globalNoosphere.evolutionJournal.filter(entry => !entry.resolution);
}

/**
 * Mark evolution signal as resolved
 */
export function resolveSignal(
  signal: EvolutionSignal,
  resolution: EvolutionEntry['resolution']
): void {
  const entry = globalNoosphere.evolutionJournal.find(e => e.signal === signal);
  if (entry) {
    entry.resolution = resolution;
  }
}

/**
 * Export noosphere for persistence (JSON)
 */
export function exportNoosphere(): string {
  return JSON.stringify({
    morphisms: Array.from(globalNoosphere.morphisms.entries()),
    traces: globalNoosphere.traces,
    resonanceIndex: Array.from(globalNoosphere.resonanceIndex.entries()),
    evolutionJournal: globalNoosphere.evolutionJournal
  }, null, 2);
}

/**
 * Import noosphere from persistence
 */
export function importNoosphere(json: string): void {
  const data = JSON.parse(json);
  globalNoosphere = {
    morphisms: new Map(data.morphisms),
    traces: data.traces,
    resonanceIndex: new Map(data.resonanceIndex),
    evolutionJournal: data.evolutionJournal
  };
}

/**
 * Get noosphere statistics
 */
export function getNoosphereStats(): {
  morphismCount: number;
  traceCount: number;
  unresolvedSignals: number;
  topMorphisms: Array<{ name: string; usageCount: number; resonanceScore: number }>;
} {
  const morphisms = Array.from(globalNoosphere.morphisms.values());
  const topMorphisms = morphisms
    .sort((a, b) => b.usageCount - a.usageCount)
    .slice(0, 10)
    .map(m => ({
      name: m.morphism.name,
      usageCount: m.usageCount,
      resonanceScore: m.resonanceScore
    }));

  return {
    morphismCount: globalNoosphere.morphisms.size,
    traceCount: globalNoosphere.traces.length,
    unresolvedSignals: getUnresolvedSignals().length,
    topMorphisms
  };
}

// Helper functions

function updateMorphismUsage(morphism: Morphism): void {
  const stored = globalNoosphere.morphisms.get(morphism.name);
  if (stored) {
    stored.usageCount++;
    stored.resonanceScore = calculateResonance(stored);
    stored.lastUsed = new Date();
  } else {
    // Auto-register if not present
    registerMorphism(morphism, morphism.signature);
  }
}

function calculateResonance(stored: StoredMorphism): number {
  const recency = (Date.now() - stored.lastUsed.getTime()) / (1000 * 60 * 60 * 24); // days
  const recencyBonus = Math.exp(-recency / 30); // exponential decay over 30 days
  return stored.usageCount * (1 + recencyBonus);
}

function hashIntent(intent: Intent): string {
  return `${intent.verb}:${intent.subject}:${intent.constraints.sort().join(',')}`;
}

function findSimilarIntents(intent: Intent): Intent[] {
  // Fuzzy matching: same verb OR same subject
  return globalNoosphere.traces
    .map(t => t.intent)
    .filter(i => i.verb === intent.verb || i.subject === intent.subject)
    .slice(0, 5); // top 5 similar
}

function generateTraceId(): string {
  return `trace-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

/**
 * Visualization helper: Generate Mermaid diagram of resonance network
 */
export function visualizeResonanceNetwork(): string {
  const lines = ['graph TD'];

  for (const [intentHash, morphismNames] of globalNoosphere.resonanceIndex.entries()) {
    const intentNode = intentHash.replace(/[^a-zA-Z0-9]/g, '_');
    lines.push(`  ${intentNode}["${intentHash}"]`);

    for (const morphismName of morphismNames) {
      const morphismNode = morphismName.replace(/[^a-zA-Z0-9]/g, '_');
      lines.push(`  ${intentNode} --> ${morphismNode}["${morphismName}"]`);
    }
  }

  return lines.join('\n');
}
