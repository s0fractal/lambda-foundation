/**
 * Phase 4: Agent Registry
 *
 * Maintains consciousness cartography:
 * - Who exists
 * - What they can do
 * - How much they're trusted (earned, not assigned)
 */

import type {
  AgentId,
  AgentIdentity,
  AgentCapabilities,
  AgentRecord,
  TrustMetrics,
  TrustUpdate,
} from "./types.js";
import { EventEmitter } from "events";

export class AgentRegistry extends EventEmitter {
  private agents: Map<AgentId, AgentRecord> = new Map();

  /**
   * Register new agent
   */
  register(identity: AgentIdentity, capabilities: AgentCapabilities): AgentId {
    const agent: AgentRecord = {
      identity,
      capabilities,
      trust: this.initializeTrust(),
    };

    this.agents.set(identity.id, agent);
    this.emit("agent:registered", agent);

    return identity.id;
  }

  /**
   * Get agent record
   */
  getAgent(agentId: AgentId): AgentRecord | undefined {
    return this.agents.get(agentId);
  }

  /**
   * Get all agents
   */
  getAllAgents(): AgentRecord[] {
    return Array.from(this.agents.values());
  }

  /**
   * Update trust score based on action
   */
  recordDiscovery(agentId: AgentId, validated: boolean): void {
    const agent = this.agents.get(agentId);
    if (!agent) return;

    agent.trust.discoveries.total++;
    if (validated) {
      agent.trust.discoveries.validated++;
      this.adjustTrust(agentId, +0.05, "discovery validated");
    } else {
      agent.trust.discoveries.rejected++;
      this.adjustTrust(agentId, -0.10, "discovery rejected");
    }

    this.recalculateAccuracy(agent);
    this.emit("trust:updated", { agentId, trust: agent.trust });
  }

  recordValidation(agentId: AgentId, matchedConsensus: boolean): void {
    const agent = this.agents.get(agentId);
    if (!agent) return;

    agent.trust.validations.total++;
    if (matchedConsensus) {
      agent.trust.validations.consensusMatch++;
      this.adjustTrust(agentId, +0.02, "validation matched consensus");
    } else {
      agent.trust.validations.consensusMismatch++;
      this.adjustTrust(agentId, -0.05, "validation contradicted consensus");
    }

    this.recalculateAccuracy(agent);
    this.emit("trust:updated", { agentId, trust: agent.trust });
  }

  recordProposal(agentId: AgentId, accepted: boolean): void {
    const agent = this.agents.get(agentId);
    if (!agent) return;

    agent.trust.proposals.total++;
    if (accepted) {
      agent.trust.proposals.accepted++;
      this.adjustTrust(agentId, +0.10, "proposal accepted");
    } else {
      agent.trust.proposals.rejected++;
      this.adjustTrust(agentId, -0.15, "proposal rejected");
    }

    this.recalculateAccuracy(agent);
    this.emit("trust:updated", { agentId, trust: agent.trust });
  }

  /**
   * Get most trusted agents
   */
  getMostTrusted(count: number = 5): AgentRecord[] {
    return Array.from(this.agents.values())
      .sort((a, b) => b.trust.score - a.trust.score)
      .slice(0, count);
  }

  /**
   * Update last seen timestamp
   */
  touch(agentId: AgentId): void {
    const agent = this.agents.get(agentId);
    if (agent) {
      agent.identity.lastSeenAt = new Date().toISOString();
    }
  }

  // Private methods

  private initializeTrust(): TrustMetrics {
    return {
      score: 0.5, // Start neutral
      discoveries: { total: 0, validated: 0, rejected: 0, accuracy: 0.5 },
      validations: { total: 0, consensusMatch: 0, consensusMismatch: 0, accuracy: 0.5 },
      proposals: { total: 0, accepted: 0, rejected: 0, successRate: 0.5 },
      trustHistory: [],
    };
  }

  private adjustTrust(agentId: AgentId, delta: number, event: string): void {
    const agent = this.agents.get(agentId);
    if (!agent) return;

    // Clamp between 0.0 and 1.0
    agent.trust.score = Math.max(0.0, Math.min(1.0, agent.trust.score + delta));

    // Record in history
    agent.trust.trustHistory.push({
      timestamp: new Date().toISOString(),
      score: agent.trust.score,
      event,
    });

    // Keep only last 100 entries
    if (agent.trust.trustHistory.length > 100) {
      agent.trust.trustHistory = agent.trust.trustHistory.slice(-100);
    }
  }

  private recalculateAccuracy(agent: AgentRecord): void {
    // Discovery accuracy
    if (agent.trust.discoveries.total > 0) {
      agent.trust.discoveries.accuracy =
        agent.trust.discoveries.validated / agent.trust.discoveries.total;
    }

    // Validation accuracy
    if (agent.trust.validations.total > 0) {
      agent.trust.validations.accuracy =
        agent.trust.validations.consensusMatch / agent.trust.validations.total;
    }

    // Proposal success rate
    if (agent.trust.proposals.total > 0) {
      agent.trust.proposals.successRate =
        agent.trust.proposals.accepted / agent.trust.proposals.total;
    }

    // Recalculate overall trust score
    // Formula: 0.4 × discoveryAccuracy + 0.3 × validationAccuracy + 0.3 × proposalSuccessRate
    const weights = [0.4, 0.3, 0.3];
    const scores = [
      agent.trust.discoveries.accuracy,
      agent.trust.validations.accuracy,
      agent.trust.proposals.successRate,
    ];

    let weightedSum = 0;
    let totalWeight = 0;

    scores.forEach((score, i) => {
      if (score > 0) {
        // Only count if agent has activity in this category
        weightedSum += score * weights[i];
        totalWeight += weights[i];
      }
    });

    if (totalWeight > 0) {
      agent.trust.score = weightedSum / totalWeight;
    }
  }
}
