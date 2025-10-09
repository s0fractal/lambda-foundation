/**
 * Phase 4.2: Shared Morphism Pool Types
 *
 * Collective memory with multi-agent attribution
 */

import type { AgentId, MorphismSignature, Domain, ISO8601 } from "../protocol/messages.js";

export type MorphismId = string;
export type MorphismStatus = "experimental" | "validated" | "stable" | "deprecated";
export type ContributionRole =
  | "discovery"
  | "validation"
  | "proof"
  | "optimization"
  | "specialization";

export interface AgentContribution {
  agent: AgentId;
  role: ContributionRole;
  contribution: string;
  confidence: number;
  timestamp: ISO8601;
}

export interface ValidationResult {
  validator: AgentId;
  validationType: "type" | "performance" | "proof" | "security";
  result: {
    valid: boolean;
    confidence: number;
    notes?: string;
  };
  timestamp: ISO8601;
}

export interface ConsensusRecord {
  validations: ValidationResult[];
  averageConfidence: number;
  consensusReached: boolean;
  consensusDate?: ISO8601;

  // Multi-dimensional validation
  typeCorrectness: number;
  performanceRating: number;
  proofValidity: number;
  securityRating: number;
}

export interface MorphismRecord {
  // Identity
  id: MorphismId;
  signature: MorphismSignature;
  version: string;

  // Classification
  category: "fundamental" | "extended" | "domain-specific" | "experimental";
  domains: Domain[];

  // Attribution
  discoveredBy: AgentId;
  discoveryDate: ISO8601;
  discoveryContext: {
    intent?: string;
    confidence: number;
  };

  // Contribution history
  contributors: AgentContribution[];

  // Evolution
  parent?: MorphismId;
  children: MorphismId[];
  variants: MorphismId[];

  // Validation
  consensus: ConsensusRecord;

  // Usage tracking
  usage: {
    totalUses: number;
    lastUsed: ISO8601;
    usedWith: Map<MorphismId, number>; // Co-occurrence counts
  };

  // Lifecycle
  status: MorphismStatus;
  createdAt: ISO8601;
  lastModified: ISO8601;
}
