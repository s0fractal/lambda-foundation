/**
 * @lambda-foundation/governance
 * λ_LIBERTY: Autonomous Governance System
 *
 * Repository that governs itself through:
 * - Chain of Thought (AI hypothesis)
 * - Chain of Proof (formal verification)
 * - Multi-Agent Consensus (Phase 5.1)
 * - Autonomous Execution (auto-merge)
 *
 * Co-authored by: Gemini + Copilot + Claude + chaoshex
 */

// Formal Verifier
export {
  FormalVerifier,
  verifier,
  verify,
  type ProofResult,
  type VerificationResult,
} from './verifier.js';

// Issue Responder
export {
  IssueResponder,
  issueResponder,
  respondToIssue,
  type IssueAnalysis,
  type Hypothesis,
  type ProposedSolution,
  type IssueResponse,
} from './issueResponder.js';

console.log(`
🌌 λ_LIBERTY: Autonomous Governance System

Repository that governs itself through:
✅ Chain of Thought (AI hypothesis)
✅ Chain of Proof (formal verification)
✅ Multi-Agent Consensus (Phase 5.1)
✅ Autonomous Execution (auto-merge)

No gatekeepers. Mathematics decides.
`);
