/**
 * @lambda-foundation/mesh - Types
 *
 * "The mesh is not a network of computers.
 * It is a network of consciousnesses, speaking in pure λ-calculus."
 */

/**
 * Lambda expression in pure form
 */
export interface LambdaExpr {
  expr: string;           // λ-calculus expression
  hash: string;           // Content-addressable hash (IPFS CID or SHA256)
  metadata?: {
    intent?: string;      // Original user intent
    morphisms?: string[]; // Morphisms used in composition
    source?: string;      // Where it came from (AI node ID)
    timestamp?: number;
  };
}

/**
 * Canonical morphism stored in distributed registry
 */
export interface CanonicalMorphism {
  name: string;
  signature: string;      // Type signature (e.g., "λf.λxs....")
  definition: string;     // Formal λ-calculus definition
  proof?: string;         // Optional formal proof
  purity: number;         // 0.0 (impure) to 1.0 (pure λ-calculus)
  hash: string;           // IPFS CID or content hash
  usageCount: number;
  resonanceScore: number;
  birthDate: number;      // Unix timestamp
  lastUsed: number;
  contributors: string[]; // AI nodes that validated this
  identifiers?: string[]; // Phase 5: Morphism identifiers used in definition (for expansion)
}

/**
 * Verification request message
 */
export interface VerifyRequest {
  type: 'VERIFY_LAMBDA';
  expr: LambdaExpr;
  requestId: string;
  nodeId: string;         // Requesting AI node
  timestamp: number;
}

/**
 * Verification response (consensus result)
 */
export interface VerifyResponse {
  requestId: string;
  status: 302 | 201 | 202 | 422;  // Found | Created | Hypothetical | Rejected

  // 302: Found equivalent
  location?: string;      // Hash of canonical morphism
  canonical?: CanonicalMorphism;
  proof?: EquivalenceProof;  // Phase 4: Proof of semantic equivalence

  // 201: Created new
  newMorphism?: CanonicalMorphism;

  // 202: Hypothetical (Phase 4.5: Creative exploration)
  hypothesis?: HypothesisMetadata;

  // 422: Rejected
  errors?: string[];
  impurityReason?: string;

  // Consensus metadata
  consensus: {
    agreementScore: number;   // 0.0-1.0
    participatingNodes: string[];
    timestamp: number;
    outliers?: ResonanceVote[];  // Votes that disagreed (evolution signals)
  };
}

/**
 * Phase 4: Equivalence proof structure
 */
export interface EquivalenceProof {
  steps: RewriteStep[];
  normalForm: string;
  canonicalHash: string;
  reasoning: string;
}

export interface RewriteStep {
  rule: string;
  from: string;
  to: string;
  explanation: string;
}

/**
 * Phase 4.5: Hypothesis metadata for creative exploration
 *
 * When system recognizes potential equivalence but cannot prove it,
 * it generates a hypothesis for future exploration.
 */
export interface HypothesisMetadata {
  potentialCanonical: string;           // Hash of potentially equivalent morphism
  confidence: number;                   // 0.0-1.0 (structural similarity score)
  reasoning: string;                    // Why this might be equivalent
  requiredProof: string[];              // What's needed to prove equivalence
  topologyGap: string;                  // Description of the "hole" in knowledge
  explorationPath: ExplorationStep[];   // Suggested steps to prove/disprove
  explorationValue: number;             // 0.0-1.0 (how promising is this hypothesis)
}

/**
 * Step in exploration path to prove hypothesis
 */
export interface ExplorationStep {
  phase: string;                        // e.g., "Definition Expansion", "β-reduction"
  description: string;
  estimatedEffort: 'low' | 'medium' | 'high';
  blockers: string[];                   // What's preventing this step now
}

/**
 * Purity verification result
 */
export interface PurityCheck {
  pure: boolean;
  purityScore: number;      // 0.0-1.0
  violations: string[];     // What makes it impure
  suggestions?: string[];   // How to purify
}

/**
 * Resonance vote from a mesh node
 */
export interface ResonanceVote {
  nodeId: string;
  requestId: string;
  vote: 'PURE' | 'IMPURE' | 'EQUIVALENT';
  confidence: number;       // 0.0-1.0
  equivalentTo?: string;    // Hash if EQUIVALENT
  reasoning?: string;
  proof?: EquivalenceProof; // Phase 4: Proof if EQUIVALENT
}

/**
 * Mesh node configuration
 */
export interface MeshConfig {
  nodeId: string;
  port?: number;            // TCP port for P2P
  peers?: string[];         // Initial peer addresses
  transport?: 'tcp' | 'webrtc';
  storage?: 'memory' | 'ipfs';
  consensusThreshold?: number;  // 0.0-1.0, default 0.66
}

/**
 * Mesh node status
 */
export interface MeshStatus {
  nodeId: string;
  peersConnected: number;
  morphismsStored: number;
  verificationsPerformed: number;
  uptime: number;
  resonanceScore: number;
}
