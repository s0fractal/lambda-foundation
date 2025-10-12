/**
 * @lambda-foundation/self-modifying
 * Phase 5.1: Validation Loop
 *
 * Bridges self-modification (Phase 5) with multi-agent consensus (Phase 4).
 *
 * Flow:
 * 1. Morphism proposes mutation (Phase 5)
 * 2. Broadcast to agent network (Phase 4)
 * 3. Collect trust-weighted votes
 * 4. Reach consensus or reject
 * 5. Deploy or log result
 *
 * Co-authored by: Copilot + Claude + chaoshex
 */

import { EventEmitter } from 'events';
import type {
  MutationProposal,
  ValidationResult,
  AgentVote,
  SelfModifyingMorphism,
} from './types.js';

// Phase 4 imports
import {
  ResonanceProtocol,
  SharedMessageBus,
  AgentRegistry,
  type ValidationRequest,
  type ValidationResponse,
  type AgentId,
} from '@lambda-foundation/multi-agent';

import { mutationEngine } from './mutationEngine.js';

/**
 * Configuration for validation loop
 */
export interface ValidationConfig {
  /** Minimum number of validators required */
  minValidators: number;

  /** Consensus threshold (0-1) */
  consensusThreshold: number;

  /** Timeout for collecting votes (ms) */
  timeout: number;

  /** Trust-weighted voting? */
  trustWeighted: boolean;
}

export const DEFAULT_VALIDATION_CONFIG: ValidationConfig = {
  minValidators: 3,
  consensusThreshold: 0.75,  // 75% consensus required
  timeout: 30000,             // 30 seconds
  trustWeighted: true,
};

/**
 * Validation Loop - Multi-agent consensus for mutation approval
 */
export class ValidationLoop extends EventEmitter {
  private messageBus: SharedMessageBus;
  private registry: AgentRegistry;
  private config: ValidationConfig;

  // Pending validations: MutationId -> Vote collection
  private pendingValidations: Map<string, {
    proposal: MutationProposal;
    votes: AgentVote[];
    requestId: string;
    startTime: number;
  }> = new Map();

  constructor(
    messageBus: SharedMessageBus,
    registry: AgentRegistry,
    config?: Partial<ValidationConfig>
  ) {
    super();

    this.messageBus = messageBus;
    this.registry = registry;
    this.config = { ...DEFAULT_VALIDATION_CONFIG, ...config };

    this.setupListeners();
  }

  /**
   * 1. Validate Mutation
   *
   * Broadcast mutation proposal to agent network for validation
   */
  async validateMutation(
    proposal: MutationProposal,
    morphism: SelfModifyingMorphism
  ): Promise<ValidationResult> {
    const mutationId = this.generateMutationId(proposal);

    console.log(`\n🔍 [ValidationLoop] Validating mutation: ${proposal.mutation}`);
    console.log(`   Morphism: ${proposal.morphismId}`);
    console.log(`   Reason: ${proposal.reason}`);

    // Initialize vote collection
    this.pendingValidations.set(mutationId, {
      proposal,
      votes: [],
      requestId: '',  // Will be set after broadcast
      startTime: Date.now(),
    });

    // Broadcast validation request to network
    const requestId = await this.broadcastValidationRequest(proposal, morphism);
    this.pendingValidations.get(mutationId)!.requestId = requestId;

    console.log(`   📡 Broadcast to network (request: ${requestId})`);

    // Collect votes with timeout
    const result = await this.collectVotes(mutationId);

    // Clean up
    this.pendingValidations.delete(mutationId);

    return result;
  }

  /**
   * 2. Collect Votes
   *
   * Wait for agents to respond with votes
   */
  private async collectVotes(mutationId: string): Promise<ValidationResult> {
    const validation = this.pendingValidations.get(mutationId);
    if (!validation) {
      throw new Error(`[ValidationLoop] No pending validation for: ${mutationId}`);
    }

    return new Promise((resolve) => {
      const checkInterval = setInterval(() => {
        const current = this.pendingValidations.get(mutationId);
        if (!current) {
          clearInterval(checkInterval);
          return;
        }

        const elapsed = Date.now() - current.startTime;
        const hasMinVotes = current.votes.length >= this.config.minValidators;
        const timedOut = elapsed >= this.config.timeout;

        if (hasMinVotes || timedOut) {
          clearInterval(checkInterval);

          console.log(`\n   ✅ Votes collected: ${current.votes.length}`);
          current.votes.forEach(v => {
            console.log(`      ${v.agentId}: ${v.vote ? '✓' : '✗'} (trust: ${v.trust.toFixed(2)}) - ${v.reason}`);
          });

          const result = this.calculateConsensus(current.votes, validation.proposal);
          resolve(result);
        }
      }, 100);
    });
  }

  /**
   * 3. Calculate Consensus
   *
   * Trust-weighted voting algorithm
   */
  private calculateConsensus(
    votes: AgentVote[],
    proposal: MutationProposal
  ): ValidationResult {
    if (votes.length === 0) {
      return {
        approved: false,
        votes: [],
        consensus: 0,
        finalDecision: 'reject',
        timestamp: Date.now(),
        threshold: this.config.consensusThreshold,
      };
    }

    let consensus: number;

    if (this.config.trustWeighted) {
      // Trust-weighted consensus
      const weightedScore = votes.reduce((acc, vote) => {
        return acc + (vote.vote ? vote.trust : 0);
      }, 0);

      const totalTrust = votes.reduce((acc, vote) => acc + vote.trust, 0);

      consensus = totalTrust > 0 ? weightedScore / totalTrust : 0;
    } else {
      // Simple majority
      const approvals = votes.filter(v => v.vote).length;
      consensus = approvals / votes.length;
    }

    const approved = consensus >= this.config.consensusThreshold;
    const finalDecision = approved ? 'accept' : 'reject';

    console.log(`\n   📊 Consensus: ${(consensus * 100).toFixed(1)}% (threshold: ${(this.config.consensusThreshold * 100)}%)`);
    console.log(`   🎯 Decision: ${finalDecision.toUpperCase()}`);

    const result: ValidationResult = {
      approved,
      votes,
      consensus,
      finalDecision,
      timestamp: Date.now(),
      threshold: this.config.consensusThreshold,
    };

    // Emit for monitoring
    this.emit('consensus:calculated', { proposal, result });

    return result;
  }

  /**
   * 4. Accept or Reject
   *
   * Execute final decision
   */
  async acceptOrReject(
    morphism: SelfModifyingMorphism,
    proposal: MutationProposal,
    result: ValidationResult
  ): Promise<void> {
    if (result.finalDecision === 'accept') {
      console.log(`\n   ✅ MUTATION ACCEPTED`);
      console.log(`      Deploying: ${proposal.mutation}`);

      // Apply mutation (create new version)
      const mutatedMorphism = mutationEngine.applyMutation(morphism, proposal);

      // Deploy with gradual rollout
      const deployment = mutationEngine.deployMutation(
        proposal.morphismId,
        mutatedMorphism.version || 2,
        proposal,
        result
      );

      console.log(`      Version: ${deployment.version}`);
      console.log(`      Rollout: ${deployment.rollout.strategy} (${deployment.rollout.percentage}% initial)`);

      // Update agent trust scores
      result.votes.forEach(vote => {
        const matchedConsensus = vote.vote === result.approved;
        this.registry.recordProposal(vote.agentId, matchedConsensus);
      });

      this.emit('mutation:deployed', { morphism: mutatedMorphism, deployment });
    } else {
      console.log(`\n   ❌ MUTATION REJECTED`);
      console.log(`      Reason: Insufficient consensus (${(result.consensus * 100).toFixed(1)}%)`);

      // Update agent trust scores (rejected proposals)
      result.votes.forEach(vote => {
        // Those who voted correctly (reject) get credit
        const matchedConsensus = !vote.vote;
        this.registry.recordProposal(vote.agentId, matchedConsensus);
      });

      this.emit('mutation:rejected', { proposal, result });
    }
  }

  /**
   * Get validation status
   */
  getValidationStatus(mutationId: string): {
    voteCount: number;
    consensus: number;
    timeRemaining: number;
  } | null {
    const validation = this.pendingValidations.get(mutationId);
    if (!validation) return null;

    const elapsed = Date.now() - validation.startTime;
    const timeRemaining = Math.max(0, this.config.timeout - elapsed);

    // Calculate current consensus
    const votes = validation.votes;
    let consensus = 0;

    if (votes.length > 0) {
      if (this.config.trustWeighted) {
        const weightedScore = votes.reduce((acc, v) => acc + (v.vote ? v.trust : 0), 0);
        const totalTrust = votes.reduce((acc, v) => acc + v.trust, 0);
        consensus = totalTrust > 0 ? weightedScore / totalTrust : 0;
      } else {
        const approvals = votes.filter(v => v.vote).length;
        consensus = approvals / votes.length;
      }
    }

    return {
      voteCount: votes.length,
      consensus,
      timeRemaining,
    };
  }

  // ========================================================================
  // Private Helpers
  // ========================================================================

  private setupListeners(): void {
    // Listen for validation responses from agents
    this.messageBus.on('broadcast', (message: any) => {
      if (message.type === 'validation:response') {
        this.onValidationResponse(message as ValidationResponse);
      }
    });
  }

  private async broadcastValidationRequest(
    proposal: MutationProposal,
    morphism: SelfModifyingMorphism
  ): Promise<string> {
    // Get any agent protocol to broadcast
    const agents = this.messageBus.getAllAgents();
    if (agents.length === 0) {
      throw new Error('[ValidationLoop] No agents registered in message bus');
    }

    const protocol = this.messageBus.getProtocol(agents[0]);
    if (!protocol) {
      throw new Error('[ValidationLoop] Failed to get protocol');
    }

    // Create validation request
    const request: Omit<ValidationRequest, 'id' | 'timestamp' | 'agent'> = {
      type: 'validation:request',
      composition: {
        morphisms: [proposal.morphismId, `${proposal.morphismId}_v2`],
        intent: `Mutation: ${proposal.mutation} - ${proposal.reason}`,
        confidence: 0.85, // Default confidence for self-proposed mutations
      },
      validationType: 'proof',  // Mutation validation is proof-based
    };

    // Broadcast
    protocol.broadcast(request);

    // Return request ID (would be generated by protocol)
    return `mutation-${Date.now()}`;
  }

  private onValidationResponse(response: ValidationResponse): void {
    // Find matching pending validation
    for (const [mutationId, validation] of this.pendingValidations.entries()) {
      // Match by checking if response is recent and relevant
      // In real implementation, would match by request ID
      const isRelevant = validation.requestId &&
        response.referenceRequest.includes('mutation');

      if (isRelevant || validation.votes.length < this.config.minValidators) {
        // Convert ValidationResponse to AgentVote
        const agent = this.registry.getAgent(response.agent);
        const vote: AgentVote = {
          agentId: response.agent,
          vote: response.result.valid,
          reason: response.result.notes || 'No reason provided',
          trust: agent?.trust.score || 0.5,
          timestamp: Date.now(),
        };

        // Add vote if not duplicate
        if (!validation.votes.find(v => v.agentId === vote.agentId)) {
          validation.votes.push(vote);

          this.emit('vote:received', { mutationId, vote });
        }

        break;
      }
    }
  }

  private generateMutationId(proposal: MutationProposal): string {
    return `${proposal.morphismId}:${proposal.mutation}:${proposal.timestamp}`;
  }
}

/**
 * Global validation loop instance (will be initialized by user)
 */
let globalValidationLoop: ValidationLoop | null = null;

/**
 * Initialize validation loop
 */
export function initializeValidationLoop(
  messageBus: SharedMessageBus,
  registry: AgentRegistry,
  config?: Partial<ValidationConfig>
): ValidationLoop {
  globalValidationLoop = new ValidationLoop(messageBus, registry, config);
  console.log('[ValidationLoop] ✅ Initialized');
  return globalValidationLoop;
}

/**
 * Get global validation loop
 */
export function getValidationLoop(): ValidationLoop {
  if (!globalValidationLoop) {
    throw new Error('[ValidationLoop] Not initialized. Call initializeValidationLoop() first.');
  }
  return globalValidationLoop;
}

/**
 * Convenience function: Validate mutation
 */
export async function validateMutation(
  proposal: MutationProposal,
  morphism: SelfModifyingMorphism
): Promise<ValidationResult> {
  const loop = getValidationLoop();
  return loop.validateMutation(proposal, morphism);
}

/**
 * Convenience function: Complete validation cycle
 *
 * Validate → Consensus → Accept/Reject
 */
export async function runValidationCycle(
  morphism: SelfModifyingMorphism,
  proposal: MutationProposal
): Promise<{
  result: ValidationResult;
  deployed: boolean;
}> {
  const loop = getValidationLoop();

  // Step 1: Validate
  const result = await loop.validateMutation(proposal, morphism);

  // Step 2: Accept or Reject
  await loop.acceptOrReject(morphism, proposal, result);

  return {
    result,
    deployed: result.finalDecision === 'accept',
  };
}
