/**
 * Phase 4.2: Consensus Engine
 *
 * Coordinates multi-agent consensus without central authority.
 * Trust-weighted voting + threshold validation.
 */

import { ResonanceProtocol, SharedMessageBus } from "../protocol/ResonanceProtocol.js";
import { AgentRegistry } from "../registry/AgentRegistry.js";
import { SharedMorphismPool } from "../memory/SharedMorphismPool.js";
import type {
  PatternDiscovery,
  ValidationRequest,
  ValidationResponse,
  ConsensusReached,
  AgentId,
  PatternId,
} from "../protocol/messages.js";
import type { ValidationResult } from "../memory/types.js";
import { EventEmitter } from "events";

export interface ConsensusConfig {
  minValidators: number; // Minimum agents needed (default: 3)
  consensusThreshold: number; // Average confidence threshold (default: 0.8)
  trustWeight: boolean; // Weight by agent trust? (default: true)
}

export class ConsensusEngine extends EventEmitter {
  private messageBus: SharedMessageBus;
  private registry: AgentRegistry;
  private pool: SharedMorphismPool;
  private config: ConsensusConfig;

  // Pending validations: PatternId -> Set of AgentIds who validated
  private pendingValidations: Map<PatternId, Set<AgentId>> = new Map();

  // Validation results: PatternId -> ValidationResponse[]
  private validationResults: Map<PatternId, ValidationResponse[]> = new Map();

  constructor(
    messageBus: SharedMessageBus,
    registry: AgentRegistry,
    pool: SharedMorphismPool,
    config?: Partial<ConsensusConfig>
  ) {
    super();

    this.messageBus = messageBus;
    this.registry = registry;
    this.pool = pool;

    this.config = {
      minValidators: config?.minValidators || 3,
      consensusThreshold: config?.consensusThreshold || 0.8,
      trustWeight: config?.trustWeight !== false,
    };

    this.setupListeners();
  }

  /**
   * Start consensus process for a pattern
   */
  initiateConsensus(patternId: PatternId): void {
    if (!this.pendingValidations.has(patternId)) {
      this.pendingValidations.set(patternId, new Set());
      this.validationResults.set(patternId, []);
    }

    this.emit("consensus:initiated", { patternId });
  }

  /**
   * Get consensus status for pattern
   */
  getConsensusStatus(patternId: PatternId): {
    validatorCount: number;
    averageConfidence: number;
    consensusReached: boolean;
  } {
    const results = this.validationResults.get(patternId) || [];

    if (results.length === 0) {
      return {
        validatorCount: 0,
        averageConfidence: 0,
        consensusReached: false,
      };
    }

    const averageConfidence = this.calculateWeightedConsensus(results);
    const consensusReached =
      results.length >= this.config.minValidators &&
      averageConfidence >= this.config.consensusThreshold;

    return {
      validatorCount: results.length,
      averageConfidence,
      consensusReached,
    };
  }

  /**
   * Get all pending patterns
   */
  getPendingPatterns(): PatternId[] {
    return Array.from(this.pendingValidations.keys());
  }

  // Private methods

  private setupListeners(): void {
    // Listen for pattern discoveries
    this.messageBus.on("broadcast", (message: any) => {
      if (message.type === "pattern:discovery") {
        this.onPatternDiscovery(message as PatternDiscovery);
      } else if (message.type === "validation:response") {
        this.onValidationResponse(message as ValidationResponse);
      }
    });
  }

  private onPatternDiscovery(msg: PatternDiscovery): void {
    const patternId = msg.id;

    // Record in morphism pool
    const morphismId = this.pool.recordDiscovery(
      msg.pattern.morphism,
      msg.agent,
      msg.pattern.domain,
      msg.pattern.confidence,
      msg.pattern.context
    );

    // Initiate consensus process
    this.initiateConsensus(patternId);

    this.log(`Pattern discovered: ${msg.pattern.morphism} by ${this.getAgentName(msg.agent)}`);
  }

  private onValidationResponse(msg: ValidationResponse): void {
    const patternId = msg.referenceRequest;

    // Add to validation results
    if (!this.validationResults.has(patternId)) {
      this.validationResults.set(patternId, []);
    }

    this.validationResults.get(patternId)!.push(msg);

    // Track validator
    if (!this.pendingValidations.has(patternId)) {
      this.pendingValidations.set(patternId, new Set());
    }
    this.pendingValidations.get(patternId)!.add(msg.agent);

    this.log(
      `Validation received from ${this.getAgentName(msg.agent)} (confidence: ${msg.result.confidence.toFixed(2)})`
    );

    // Check if consensus reached
    this.checkConsensus(patternId);
  }

  private checkConsensus(patternId: PatternId): void {
    const status = this.getConsensusStatus(patternId);

    if (status.consensusReached) {
      const validators = Array.from(this.pendingValidations.get(patternId) || []);

      // Emit consensus reached
      const consensusMsg: Omit<ConsensusReached, "id" | "timestamp"> = {
        type: "consensus:reached",
        agent: "consensus-engine",
        pattern: patternId,
        agents: validators,
        averageConfidence: status.averageConfidence,
      };

      this.emit("consensus:reached", consensusMsg);

      this.log(
        `✨ CONSENSUS REACHED! Pattern validated by ${status.validatorCount} agents (avg: ${status.averageConfidence.toFixed(2)})`
      );

      // Update morphism pool status
      // (In real implementation, would need to map patternId -> morphismId)
      // For now, we'll emit event for others to handle

      // Clean up
      this.pendingValidations.delete(patternId);
    } else if (status.validatorCount >= this.config.minValidators) {
      // Have enough validators but confidence too low
      this.log(
        `⚠️  Insufficient confidence: ${status.validatorCount} validators, avg ${status.averageConfidence.toFixed(2)} (need ${this.config.consensusThreshold})`
      );
    }
  }

  private calculateWeightedConsensus(responses: ValidationResponse[]): number {
    if (!this.config.trustWeight) {
      // Simple average
      const sum = responses.reduce((acc, r) => acc + r.result.confidence, 0);
      return sum / responses.length;
    }

    // Trust-weighted average
    let weightedSum = 0;
    let totalWeight = 0;

    responses.forEach((response) => {
      const agent = this.registry.getAgent(response.agent);
      const trust = agent?.trust.score || 0.5;

      weightedSum += response.result.confidence * trust;
      totalWeight += trust;
    });

    return totalWeight > 0 ? weightedSum / totalWeight : 0;
  }

  private getAgentName(agentId: AgentId): string {
    const agent = this.registry.getAgent(agentId);
    return agent?.identity.name || agentId;
  }

  private log(message: string): void {
    const timestamp = new Date().toISOString().split("T")[1].split(".")[0];
    console.log(`[${timestamp}] ConsensusEngine: ${message}`);
  }
}
