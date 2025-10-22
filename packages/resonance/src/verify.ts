/**
 * resonance/verify.ts
 * Event 011: Community Resonance — Mathematical Verification
 *
 * Cryptographic receipt signing for morphism validation.
 * Not voting — mathematical resonance.
 */

import { createHash } from 'crypto';

// ============================================================================
// TYPES
// ============================================================================

export interface MorphismReceipt {
  morphismId: string;
  morphismName: string;
  cid?: string;                    // IPFS CID (when published)

  // What is being verified
  intent: string;                  // e.g., "average"
  mathematicalForm: string;        // e.g., "(Σxᵢ)/n"

  // Genealogy
  parents: string[];
  generation: number;

  // Validation data
  tests: {
    passed: number;
    total: number;
    cases: Array<{ input: any; expected: any; result: any; pass: boolean }>;
  };

  purity: number;
  complexity: { valid: boolean; roles: number };

  // Proof
  mathematicalEquivalence: string;

  timestamp: number;
}

export interface Resonance {
  verifierId: string;              // Who verified
  signature: string;               // Cryptographic signature
  timestamp: number;

  // What they verified
  mathematicalCheck: boolean;      // Did math equivalence hold?
  testsRun: boolean;              // Did they run tests?
  testsPass: boolean;             // Did tests pass?

  comment?: string;               // Optional explanation
}

export interface VerifiedMorphism extends MorphismReceipt {
  status: 'candidate' | 'verified' | 'canonical';
  resonances: Resonance[];
  value: number;                  // 1 (candidate), 10 (verified), 100 (canonical)
}

// ============================================================================
// VERIFICATION
// ============================================================================

/**
 * Create receipt for a morphism
 */
export const createReceipt = (morphism: {
  id: string;
  name: string;
  intent: string;
  mathematicalForm: string;
  parents: string[];
  generation: number;
  tests: any;
  purity: number;
  complexity: any;
  mathematicalEquivalence: string;
}): MorphismReceipt => {
  return {
    morphismId: morphism.id,
    morphismName: morphism.name,
    intent: morphism.intent,
    mathematicalForm: morphism.mathematicalForm,
    parents: morphism.parents,
    generation: morphism.generation,
    tests: morphism.tests,
    purity: morphism.purity,
    complexity: morphism.complexity,
    mathematicalEquivalence: morphism.mathematicalEquivalence,
    timestamp: Date.now()
  };
};

/**
 * Sign a receipt (cryptographic verification)
 *
 * This creates a hash of the receipt that serves as a signature.
 * In production, this would use actual cryptographic keys.
 */
export const signReceipt = (
  receipt: MorphismReceipt,
  verifierId: string,
  verification: {
    mathematicalCheck: boolean;
    testsRun: boolean;
    testsPass: boolean;
    comment?: string;
  }
): Resonance => {
  // Create hash of receipt (simplified signature)
  const receiptStr = JSON.stringify({
    morphismId: receipt.morphismId,
    intent: receipt.intent,
    mathematicalForm: receipt.mathematicalForm,
    tests: receipt.tests,
    purity: receipt.purity
  });

  const hash = createHash('sha256').update(receiptStr).digest('hex');

  return {
    verifierId,
    signature: hash.substring(0, 16), // Shortened for readability
    timestamp: Date.now(),
    ...verification
  };
};

/**
 * Verify a morphism and add resonance
 */
export const addResonance = (
  morphism: VerifiedMorphism,
  resonance: Resonance
): VerifiedMorphism => {
  const newResonances = [...morphism.resonances, resonance];

  // Update status based on resonance count
  let status: 'candidate' | 'verified' | 'canonical' = 'candidate';
  let value = 1;

  // Count valid resonances (math check + tests pass)
  const validResonances = newResonances.filter(r =>
    r.mathematicalCheck && r.testsPass
  );

  if (validResonances.length >= 3) {
    status = 'verified';
    value = 10;
  }

  if (validResonances.length >= 10) {
    status = 'canonical';
    value = 100;
  }

  return {
    ...morphism,
    resonances: newResonances,
    status,
    value
  };
};

/**
 * Calculate resonance depth
 */
export const calculateResonanceDepth = (morphism: VerifiedMorphism): {
  total: number;
  valid: number;
  depth: number; // 0-1 scale
} => {
  const total = morphism.resonances.length;
  const valid = morphism.resonances.filter(r =>
    r.mathematicalCheck && r.testsPass
  ).length;

  // Depth: 0 (no resonances) → 1 (canonical: 10+ resonances)
  const depth = Math.min(1, valid / 10);

  return { total, valid, depth };
};

// ============================================================================
// ECONOMY OF TRUTH
// ============================================================================

/**
 * Calculate morphism value based on resonance
 *
 * This is NOT cryptocurrency.
 * This is economy of truth: value = depth of understanding.
 */
export const calculateValue = (morphism: VerifiedMorphism): {
  baseValue: number;      // 1, 10, or 100
  resonanceMultiplier: number;
  totalValue: number;
} => {
  const { depth } = calculateResonanceDepth(morphism);

  // Base value from status
  const baseValue = morphism.value;

  // Multiplier from depth (1.0 → 2.0 as depth increases)
  const resonanceMultiplier = 1 + depth;

  return {
    baseValue,
    resonanceMultiplier,
    totalValue: baseValue * resonanceMultiplier
  };
};
