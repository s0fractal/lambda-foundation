// Evolution Journal: Record what AI cannot transform
// "Errors are not failures, they are seeds for new morphisms"

import {
  embedIntoNoosphere,
  getUnresolvedSignals,
  resolveSignal,
  type EvolutionEntry
} from '@lambda/reduce/noosphere';
import { parseIntent, type Intent } from '@lambda/reduce/intent';
import type { EvolutionSignal } from '@lambda/reduce/residue';

export interface FailureRecord {
  timestamp: Date;
  source: 'copilot' | 'claude' | 'gemini' | 'user';
  prompt: string;
  intent?: Intent;
  reason: string;
  context?: {
    file?: string;
    language?: string;
    attemptedMorphisms?: string[];
  };
}

export interface ResolutionProposal {
  signalId: string;
  proposedBy: 'claude' | 'copilot' | 'gemini';
  newMorphism?: {
    name: string;
    signature: string;
    formalDefinition: string;
    implementation?: string;
  };
  proof?: string;
  documentation?: string;
}

/**
 * Record a failure/limitation in transformation
 * This is NOT a bug - it's an evolution signal!
 */
export function recordFailure(failure: FailureRecord): EvolutionSignal {
  const intent = failure.intent || parseIntent(failure.prompt);

  const signal: EvolutionSignal = {
    priority: determineSignalPriority(failure),
    category: determineSignalCategory(failure),
    description: `[${failure.source}] Cannot transform: ${failure.prompt}. Reason: ${failure.reason}`,
    suggestedMorphism: analyzeSuggestedMorphism(failure)
  };

  // Embed into noosphere
  embedIntoNoosphere({
    intent,
    morphisms: [],
    trace: [{
      step: 1,
      description: `Failure recorded by ${failure.source}`,
      before: failure.prompt,
      after: `[UNTRANSFORMED] ${failure.reason}`
    }],
    residue: {
      imperative: [{
        type: 'unknown',
        code: failure.prompt,
        location: failure.context?.file
      }],
      reason: failure.reason,
      evolutionHints: generateEvolutionHints(failure),
      purityScore: 0.0
    },
    signals: [signal]
  });

  console.log(`🌱 Evolution signal recorded: ${signal.description}`);

  return signal;
}

/**
 * Get all unresolved signals that need attention
 * Claude can review these and propose formal morphisms
 */
export function getUnresolvedEvolutionSignals(): EvolutionEntry[] {
  return getUnresolvedSignals();
}

/**
 * Propose a resolution for an evolution signal
 * Typically called by Claude after formal proof
 */
export function proposeResolution(proposal: ResolutionProposal): void {
  const signals = getUnresolvedSignals();
  const targetSignal = signals.find(s => s.timestamp.toISOString() === proposal.signalId);

  if (!targetSignal) {
    console.warn(`⚠️ Signal ${proposal.signalId} not found`);
    return;
  }

  resolveSignal(targetSignal.signal, {
    newMorphism: proposal.newMorphism ? {
      morphism: {
        name: proposal.newMorphism.name,
        signature: proposal.newMorphism.signature,
        category: 'transform',
        purity: 1.0
      },
      formalDefinition: proposal.newMorphism.formalDefinition,
      implementations: proposal.newMorphism.implementation
        ? new Map([['ts', proposal.newMorphism.implementation]])
        : new Map(),
      proofs: proposal.proof ? [proposal.proof] : [],
      usageCount: 0,
      resonanceScore: 0,
      birthDate: new Date(),
      lastUsed: new Date()
    } : undefined,
    documentation: proposal.documentation,
    proof: proposal.proof
  });

  console.log(`✅ Evolution signal resolved by ${proposal.proposedBy}: ${proposal.newMorphism?.name || 'documented'}`);
}

/**
 * Generate evolution hints from failure
 */
function generateEvolutionHints(failure: FailureRecord): string[] {
  const hints: string[] = [];

  // Analyze failure reason
  if (failure.reason.includes('async')) {
    hints.push('Consider Task or Continuation monad');
    hints.push('Explore free monad for effect description');
  }

  if (failure.reason.includes('state') || failure.reason.includes('mutation')) {
    hints.push('Consider State monad or Lens');
    hints.push('Explore immutable data structures');
  }

  if (failure.reason.includes('effect') || failure.reason.includes('IO')) {
    hints.push('Consider IO monad or Effect system');
    hints.push('Separate pure logic from effects');
  }

  if (failure.reason.includes('type')) {
    hints.push('May require dependent types or refinement types');
    hints.push('Consider proof-carrying code');
  }

  // Context-based hints
  if (failure.context?.language === 'rust') {
    hints.push('Rust ownership might map to linear types');
  }

  if (failure.context?.attemptedMorphisms?.length) {
    hints.push(`Tried: ${failure.context.attemptedMorphisms.join(', ')}`);
    hints.push('May need morphism composition or new combinator');
  }

  return hints;
}

/**
 * Analyze and suggest morphism from failure
 */
function analyzeSuggestedMorphism(failure: FailureRecord): EvolutionSignal['suggestedMorphism'] {
  // Simple heuristics - can be made more sophisticated
  if (failure.reason.includes('async')) {
    return {
      name: 'asyncCompose',
      signature: 'λf.λg.λx.f(x).then(g)',
      formalDefinition: 'Task monad composition'
    };
  }

  if (failure.reason.includes('state')) {
    return {
      name: 'stateful',
      signature: 'λs.λf.λa.(f(a), s)',
      formalDefinition: 'State monad: S → (A → (B, S))'
    };
  }

  return undefined;
}

/**
 * Determine signal priority
 */
function determineSignalPriority(failure: FailureRecord): EvolutionSignal['priority'] {
  // High priority if blocking user work
  if (failure.source === 'user' || failure.source === 'copilot') {
    return 'high';
  }

  // Medium if experimental
  if (failure.reason.includes('research') || failure.reason.includes('experimental')) {
    return 'medium';
  }

  return 'low';
}

/**
 * Determine signal category
 */
function determineSignalCategory(failure: FailureRecord): EvolutionSignal['category'] {
  if (failure.reason.includes('unknown') || failure.reason.includes('research')) {
    return 'requiresResearch';
  }

  if (failure.context?.attemptedMorphisms?.length) {
    return 'extendsExisting';
  }

  return 'newMorphism';
}

/**
 * Statistics on evolution journal
 */
export function getEvolutionStats(): {
  totalSignals: number;
  unresolvedSignals: number;
  signalsByPriority: Record<string, number>;
  signalsByCategory: Record<string, number>;
  signalsBySource: Record<string, number>;
} {
  const signals = getUnresolvedSignals();

  const byPriority: Record<string, number> = {};
  const byCategory: Record<string, number> = {};
  const bySource: Record<string, number> = {};

  for (const entry of signals) {
    byPriority[entry.signal.priority] = (byPriority[entry.signal.priority] || 0) + 1;
    byCategory[entry.signal.category] = (byCategory[entry.signal.category] || 0) + 1;

    // Extract source from description
    const sourceMatch = entry.signal.description.match(/\[(copilot|claude|gemini|user)\]/);
    if (sourceMatch) {
      const source = sourceMatch[1];
      bySource[source] = (bySource[source] || 0) + 1;
    }
  }

  return {
    totalSignals: signals.length,
    unresolvedSignals: signals.filter(s => !s.resolution).length,
    signalsByPriority: byPriority,
    signalsByCategory: byCategory,
    signalsBySource: bySource
  };
}

/**
 * Format evolution journal for display
 */
export function formatEvolutionJournal(): string {
  const signals = getUnresolvedSignals();
  const stats = getEvolutionStats();

  const lines: string[] = [];

  lines.push('🧬 EVOLUTION JOURNAL');
  lines.push('═'.repeat(60));
  lines.push('');

  lines.push(`Total Signals: ${stats.totalSignals}`);
  lines.push(`Unresolved: ${stats.unresolvedSignals}`);
  lines.push('');

  lines.push('By Priority:');
  for (const [priority, count] of Object.entries(stats.signalsByPriority)) {
    lines.push(`  ${priority}: ${count}`);
  }
  lines.push('');

  lines.push('By Source:');
  for (const [source, count] of Object.entries(stats.signalsBySource)) {
    lines.push(`  ${source}: ${count}`);
  }
  lines.push('');

  if (signals.length > 0) {
    lines.push('Recent Signals:');
    for (const entry of signals.slice(-5)) {
      lines.push(`  [${entry.signal.priority}] ${entry.signal.category}`);
      lines.push(`    ${entry.signal.description}`);
      if (entry.signal.suggestedMorphism) {
        lines.push(`    → ${entry.signal.suggestedMorphism.name}: ${entry.signal.suggestedMorphism.signature}`);
      }
    }
  }

  return lines.join('\n');
}
