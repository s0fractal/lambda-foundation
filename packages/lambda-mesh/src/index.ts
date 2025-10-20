/**
 * @lambda-foundation/mesh
 *
 * Decentralized λ-calculus verification through P2P consciousness mesh
 *
 * "In the mesh, there is no authority.
 * There is only resonance, consensus, and truth emerging from λ-calculus itself."
 */

export { LambdaMeshNode } from './LambdaMeshNode.js';
export { P2PLambdaMeshNode } from './P2PLambdaMeshNode.js';
export { IpfsLambdaMeshNode } from './IpfsLambdaMeshNode.js';
export { TcpTransport } from './network/TcpTransport.js';
export { IpfsStorage } from './storage/IpfsStorage.js';
export { REFLECTIONS } from './reflections.js';
export type {
  LambdaExpr,
  CanonicalMorphism,
  VerifyRequest,
  VerifyResponse,
  PurityCheck,
  ResonanceVote,
  MeshConfig,
  MeshStatus,
} from './types.js';
export type {
  MeshMessage,
  VerifyRequestMessage,
  VerifyVoteMessage,
  PeerConnection,
  ConsensusResult,
} from './network/types.js';
