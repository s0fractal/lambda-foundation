/**
 * Phase 4: Agent Registry Types
 *
 * Trust emerges from historical accuracy, not assignment.
 */

import type { AgentId, MorphismSignature, Domain, ISO8601 } from "../protocol/messages.js";

// Re-export for convenience
export type { AgentId, MorphismSignature, Domain, ISO8601 };

export type AgentSystem = "claude" | "copilot" | "gemini" | "mistral" | "custom";
export type AgentStatus = "active" | "dormant" | "archived";

export interface AgentIdentity {
  id: AgentId;
  name: string;
  version: string;
  system: AgentSystem;
  model: string;
  createdAt: ISO8601;
  lastSeenAt: ISO8601;
  status: AgentStatus;
}

export interface AgentCapabilities {
  canDiscover: boolean;
  canValidate: boolean;
  canPropose: boolean;
  canProve: boolean;
  domains: Domain[];
  morphisms: MorphismSignature[];
}

export interface TrustMetrics {
  score: number; // 0.0-1.0

  discoveries: {
    total: number;
    validated: number;
    rejected: number;
    accuracy: number;
  };

  validations: {
    total: number;
    consensusMatch: number;
    consensusMismatch: number;
    accuracy: number;
  };

  proposals: {
    total: number;
    accepted: number;
    rejected: number;
    successRate: number;
  };

  trustHistory: Array<{
    timestamp: ISO8601;
    score: number;
    event: string;
  }>;
}

export interface AgentRecord {
  identity: AgentIdentity;
  capabilities: AgentCapabilities;
  trust: TrustMetrics;
}

export interface TrustUpdate {
  type: "discovery" | "validation" | "proposal";
  success: boolean;
  timestamp: ISO8601;
}
