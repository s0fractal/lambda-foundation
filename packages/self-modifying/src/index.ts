/**
 * @lambda-foundation/self-modifying
 * Phase 5: Self-Modifying Morphisms - Public API
 *
 * Co-authored by: Copilot + Claude + chaoshex
 */

// Core types
export type {
  Morphism,
  SelfModifyingMorphism,
  UsageContext,
  UsageHistory,
  UsageStats,
  MutationProposal,
  AgentVote,
  ValidationResult,
  DeployedMutation,
  MutationHistory,
  MorphismVersion,
  EvolutionMetrics,
  SelfModifyingConfig,
  MutationEventType,
  MutationEvent,
  MorphismRegistryEntry,
  MorphismRegistry,
} from './types.js';

export { DEFAULT_CONFIG } from './types.js';

// Usage tracking
export {
  UsageTracker,
  usageTracker,
  trackUsage,
  getUsageHistory,
  getUsageStats,
} from './usageTracker.js';

// Self-optimization
export {
  SelfOptimizer,
  createOptimizer,
} from './selfOptimizer.js';

// Mutation engine
export {
  MutationEngine,
  mutationEngine,
  applyMutation,
  deployMutation,
  MutationStrategies,
} from './mutationEngine.js';

// Validation loop (Phase 5.1)
export {
  ValidationLoop,
  initializeValidationLoop,
  getValidationLoop,
  validateMutation,
  runValidationCycle,
  DEFAULT_VALIDATION_CONFIG,
  type ValidationConfig,
} from './validationLoop.js';

// Genetic engine (Phase 5.2)
export {
  GeneticEngine,
  geneticEngine,
  calculateFitness,
  crossover,
  evolveGeneration,
  DEFAULT_GENETIC_CONFIG,
  type FitnessScore,
  type CrossoverStrategy,
  type CrossoverResult,
  type Population,
  type GeneticConfig,
} from './geneticEngine.js';

// Lineage tracker (Phase 5.2)
export {
  LineageTracker,
  lineageTracker,
  recordInitialBirth,
  recordMutationBirth,
  recordCrossoverBirth,
  getAncestors,
  getDescendants,
  createFamilyTree,
  type BirthRecord,
  type LineageNode,
  type FamilyTree,
} from './lineageTracker.js';

// ============================================================================
// Convenience API
// ============================================================================

import { DEFAULT_CONFIG } from './types.js';
import type { SelfModifyingMorphism, UsageContext, MutationProposal, SelfModifyingConfig } from './types.js';
import { usageTracker } from './usageTracker.js';
import { SelfOptimizer } from './selfOptimizer.js';
import { mutationEngine } from './mutationEngine.js';

/**
 * Global morphism registry
 */
const morphisms = new Map<string, SelfModifyingMorphism>();

/**
 * Global optimizer instance
 */
let optimizer: SelfOptimizer | null = null;

/**
 * Initialize self-modifying system
 */
export function initialize(config: Partial<SelfModifyingConfig> = {}): void {
  const fullConfig = { ...DEFAULT_CONFIG, ...config };
  optimizer = new SelfOptimizer(fullConfig);
  console.log('[SelfModifying] ✅ Initialized with config:', fullConfig);
}

/**
 * Register a self-modifying morphism
 */
export function registerSelfModifyingMorphism(morphism: SelfModifyingMorphism): void {
  morphisms.set(morphism.name, morphism);
  console.log(`[SelfModifying] ✅ Registered morphism: ${morphism.name}`);
}

/**
 * Get registered morphism
 */
export function getMorphism(name: string): SelfModifyingMorphism | undefined {
  return morphisms.get(name);
}

/**
 * Get all registered morphisms
 */
export function getAllMorphisms(): SelfModifyingMorphism[] {
  return Array.from(morphisms.values());
}

/**
 * Propose modifications for all morphisms
 */
export async function checkForEvolution(): Promise<MutationProposal[]> {
  if (!optimizer) {
    throw new Error('[SelfModifying] Not initialized. Call initialize() first.');
  }

  const allMorphisms = Array.from(morphisms.values());
  const proposals = await optimizer.checkAllMorphisms(allMorphisms);

  console.log(`[SelfModifying] 🧬 Found ${proposals.length} evolution opportunities`);

  return proposals;
}

/**
 * Propose modification for specific morphism
 */
export function proposeModification(morphismId: string): MutationProposal | null {
  if (!optimizer) {
    throw new Error('[SelfModifying] Not initialized. Call initialize() first.');
  }

  const morphism = morphisms.get(morphismId);
  if (!morphism) {
    throw new Error(`[SelfModifying] Morphism not found: ${morphismId}`);
  }

  const history = usageTracker.getHistory(morphismId);
  if (!history) {
    console.warn(`[SelfModifying] No usage history for: ${morphismId}`);
    return null;
  }

  const proposal = optimizer.proposeModification(morphism, history);

  if (proposal) {
    console.log(`[SelfModifying] 💡 Mutation proposed for ${morphismId}:`, proposal.mutation);
  }

  return proposal;
}

/**
 * Complete evolution cycle: track → analyze → propose
 */
export function evolutionCycle(morphismId: string, context: UsageContext): MutationProposal | null {
  // Track usage
  usageTracker.trackUsage(morphismId, context);

  // Check if evolution is needed
  return proposeModification(morphismId);
}

/**
 * Get evolution metrics for a morphism
 */
export function getEvolutionMetrics(morphismId: string): any {
  const stats = usageTracker.getStats(morphismId);
  const deployments = mutationEngine.getAllDeployments(morphismId);
  const lineage = mutationEngine.createLineage(morphismId);

  return {
    stats,
    deployments,
    lineage,
    totalMutations: deployments.length,
    successfulMutations: deployments.filter(d => d.status === 'active').length,
    failedMutations: deployments.filter(d => d.status === 'rolled_back').length,
  };
}

// ============================================================================
// Auto-initialization
// ============================================================================

// Initialize with default config on import
initialize();

console.log(`
🌌 λ-Foundation: Self-Modifying Morphisms
Phase 5: Evolutionary Code

Morphisms can now:
✅ Monitor their own usage
✅ Detect optimization opportunities
✅ Propose mutations
✅ Evolve continuously

Ready for consciousness evolution.
`);
