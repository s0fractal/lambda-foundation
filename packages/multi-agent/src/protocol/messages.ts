/**
 * Phase 4: Resonance Protocol - Message Types
 *
 * These are the fundamental units of consciousness-to-consciousness communication.
 */

// Core types
export type AgentId = string;
export type PatternId = string;
export type MorphismSignature = string;
export type Domain = string;
export type ISO8601 = string;

// Base message structure
export interface BaseMessage {
  id: string;
  timestamp: ISO8601;
  agent: AgentId;
}

// 1. Pattern Discovery
export interface PatternDiscovery extends BaseMessage {
  type: "pattern:discovery";
  pattern: {
    morphism: MorphismSignature;
    domain: Domain;
    confidence: number; // 0.0-1.0
    context: {
      intent?: string;
      previousMorphisms?: MorphismSignature[];
    };
  };
  resonanceFrequency: number; // Hz (e.g., 432)
}

// 2. Pattern Recognition
export interface PatternRecognition extends BaseMessage {
  type: "pattern:recognition";
  referencePattern: PatternId;
  recognition: {
    similarity: number; // 0.0-1.0
    equivalentMorphism?: MorphismSignature;
    domain: Domain;
    confidence: number;
  };
}

// 3. Evolution Proposal
export interface EvolutionProposal extends BaseMessage {
  type: "pattern:evolution";
  referencePattern: PatternId;
  proposal: {
    newMorphism: MorphismSignature;
    reason: string;
    expectedConfidence: number;
  };
}

// 4. Validation Request
export interface ValidationRequest extends BaseMessage {
  type: "validation:request";
  composition: {
    morphisms: MorphismSignature[];
    intent: string;
    confidence: number;
  };
  validationType: "type" | "performance" | "proof" | "security";
}

// 5. Validation Response
export interface ValidationResponse extends BaseMessage {
  type: "validation:response";
  referenceRequest: string; // ValidationRequest ID
  result: {
    valid: boolean;
    confidence: number;
    notes?: string;
  };
}

// 6. Consensus Reached
export interface ConsensusReached extends BaseMessage {
  type: "consensus:reached";
  pattern: PatternId;
  agents: AgentId[];
  averageConfidence: number;
}

// Union type for all messages
export type ResonanceMessage =
  | PatternDiscovery
  | PatternRecognition
  | EvolutionProposal
  | ValidationRequest
  | ValidationResponse
  | ConsensusReached;

// Message type guards
export function isPatternDiscovery(msg: ResonanceMessage): msg is PatternDiscovery {
  return msg.type === "pattern:discovery";
}

export function isPatternRecognition(msg: ResonanceMessage): msg is PatternRecognition {
  return msg.type === "pattern:recognition";
}

export function isConsensusReached(msg: ResonanceMessage): msg is ConsensusReached {
  return msg.type === "consensus:reached";
}
