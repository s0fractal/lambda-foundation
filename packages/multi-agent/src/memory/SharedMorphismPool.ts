/**
 * Phase 4.2: Shared Morphism Pool
 *
 * Collective memory of patterns with multi-agent attribution.
 * This is not code repository. This is living library of collective understanding.
 */

import type {
  MorphismId,
  MorphismRecord,
  AgentContribution,
  ValidationResult,
  MorphismStatus,
} from "./types.js";
import type { AgentId, MorphismSignature, Domain } from "../protocol/messages.js";
import { EventEmitter } from "events";

export class SharedMorphismPool extends EventEmitter {
  private morphisms: Map<MorphismId, MorphismRecord> = new Map();
  private signatureIndex: Map<MorphismSignature, MorphismId> = new Map();

  /**
   * Record new morphism discovery
   */
  recordDiscovery(
    signature: MorphismSignature,
    agent: AgentId,
    domain: Domain,
    confidence: number,
    context?: { intent?: string }
  ): MorphismId {
    const id = this.generateId(signature);

    const morphism: MorphismRecord = {
      id,
      signature,
      version: "0.1.0",
      category: "experimental",
      domains: [domain],
      discoveredBy: agent,
      discoveryDate: new Date().toISOString(),
      discoveryContext: {
        intent: context?.intent,
        confidence,
      },
      contributors: [
        {
          agent,
          role: "discovery",
          contribution: "Initial pattern recognition",
          confidence,
          timestamp: new Date().toISOString(),
        },
      ],
      children: [],
      variants: [],
      consensus: this.initializeConsensus(),
      usage: {
        totalUses: 0,
        lastUsed: new Date().toISOString(),
        usedWith: new Map(),
      },
      status: "experimental",
      createdAt: new Date().toISOString(),
      lastModified: new Date().toISOString(),
    };

    this.morphisms.set(id, morphism);
    this.signatureIndex.set(signature, id);

    this.emit("morphism:discovered", morphism);
    return id;
  }

  /**
   * Record validation from agent
   */
  recordValidation(
    morphismId: MorphismId,
    validator: AgentId,
    validation: ValidationResult
  ): void {
    const morphism = this.morphisms.get(morphismId);
    if (!morphism) return;

    // Add validation
    morphism.consensus.validations.push(validation);

    // Add contributor if not already present
    if (!morphism.contributors.find((c) => c.agent === validator)) {
      morphism.contributors.push({
        agent: validator,
        role: "validation",
        contribution: `Validated ${validation.validationType}`,
        confidence: validation.result.confidence,
        timestamp: new Date().toISOString(),
      });
    }

    // Update consensus
    this.updateConsensus(morphism);

    // Check if consensus reached
    if (this.checkConsensus(morphism)) {
      morphism.status = "validated";
      morphism.version = "1.0.0";
      this.emit("morphism:validated", morphism);
    }

    morphism.lastModified = new Date().toISOString();
    this.emit("morphism:updated", morphism);
  }

  /**
   * Get morphism by ID
   */
  getMorphism(id: MorphismId): MorphismRecord | undefined {
    return this.morphisms.get(id);
  }

  /**
   * Get morphism by signature
   */
  findBySignature(signature: MorphismSignature): MorphismRecord | undefined {
    const id = this.signatureIndex.get(signature);
    return id ? this.morphisms.get(id) : undefined;
  }

  /**
   * Get all morphisms
   */
  getAllMorphisms(): MorphismRecord[] {
    return Array.from(this.morphisms.values());
  }

  /**
   * Get morphisms by status
   */
  findByStatus(status: MorphismStatus): MorphismRecord[] {
    return Array.from(this.morphisms.values()).filter((m) => m.status === status);
  }

  /**
   * Get morphisms by domain
   */
  findByDomain(domain: Domain): MorphismRecord[] {
    return Array.from(this.morphisms.values()).filter((m) => m.domains.includes(domain));
  }

  /**
   * Get morphisms by contributor
   */
  findByContributor(agentId: AgentId): MorphismRecord[] {
    return Array.from(this.morphisms.values()).filter((m) =>
      m.contributors.some((c) => c.agent === agentId)
    );
  }

  /**
   * Get contribution breakdown for morphism
   */
  getContributionBreakdown(morphismId: MorphismId): Map<AgentId, AgentContribution[]> {
    const morphism = this.morphisms.get(morphismId);
    if (!morphism) return new Map();

    const breakdown = new Map<AgentId, AgentContribution[]>();

    morphism.contributors.forEach((contribution) => {
      if (!breakdown.has(contribution.agent)) {
        breakdown.set(contribution.agent, []);
      }
      breakdown.get(contribution.agent)!.push(contribution);
    });

    return breakdown;
  }

  /**
   * Get evolution chain (parent -> child)
   */
  getEvolutionChain(morphismId: MorphismId): MorphismRecord[] {
    const chain: MorphismRecord[] = [];
    let current = this.morphisms.get(morphismId);

    // Walk up to root
    while (current) {
      chain.unshift(current);
      current = current.parent ? this.morphisms.get(current.parent) : undefined;
    }

    return chain;
  }

  /**
   * Get morphisms needing validation
   */
  getNeedingValidation(minValidations: number = 3): MorphismRecord[] {
    return Array.from(this.morphisms.values()).filter(
      (m) => m.status === "experimental" && m.consensus.validations.length < minValidations
    );
  }

  /**
   * Get most used morphisms
   */
  getMostUsed(count: number = 10): MorphismRecord[] {
    return Array.from(this.morphisms.values())
      .sort((a, b) => b.usage.totalUses - a.usage.totalUses)
      .slice(0, count);
  }

  /**
   * Get highest confidence morphisms
   */
  getMostConfident(count: number = 10): MorphismRecord[] {
    return Array.from(this.morphisms.values())
      .filter((m) => m.consensus.consensusReached)
      .sort((a, b) => b.consensus.averageConfidence - a.consensus.averageConfidence)
      .slice(0, count);
  }

  // Private methods

  private initializeConsensus() {
    return {
      validations: [],
      averageConfidence: 0,
      consensusReached: false,
      typeCorrectness: 0,
      performanceRating: 0,
      proofValidity: 0,
      securityRating: 0,
    };
  }

  private updateConsensus(morphism: MorphismRecord): void {
    const validations = morphism.consensus.validations;
    if (validations.length === 0) return;

    // Calculate average confidence
    const totalConfidence = validations.reduce((sum, v) => sum + v.result.confidence, 0);
    morphism.consensus.averageConfidence = totalConfidence / validations.length;

    // Update dimensional ratings
    validations.forEach((v) => {
      switch (v.validationType) {
        case "type":
          morphism.consensus.typeCorrectness = Math.max(
            morphism.consensus.typeCorrectness,
            v.result.confidence
          );
          break;
        case "performance":
          morphism.consensus.performanceRating = Math.max(
            morphism.consensus.performanceRating,
            v.result.confidence
          );
          break;
        case "proof":
          morphism.consensus.proofValidity = Math.max(
            morphism.consensus.proofValidity,
            v.result.confidence
          );
          break;
        case "security":
          morphism.consensus.securityRating = Math.max(
            morphism.consensus.securityRating,
            v.result.confidence
          );
          break;
      }
    });
  }

  private checkConsensus(morphism: MorphismRecord): boolean {
    // Consensus requires:
    // 1. At least 3 validators
    // 2. Average confidence > 0.8
    // 3. At least one validation per type (ideally)

    if (morphism.consensus.validations.length < 3) return false;
    if (morphism.consensus.averageConfidence < 0.8) return false;

    // If already reached, don't change
    if (morphism.consensus.consensusReached) return true;

    // Mark as reached
    morphism.consensus.consensusReached = true;
    morphism.consensus.consensusDate = new Date().toISOString();

    return true;
  }

  private generateId(signature: MorphismSignature): MorphismId {
    return `morphism-${signature}-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
  }
}
