/**
 * Network types for Lambda Mesh P2P
 */

import type { Socket } from 'net';
import type { LambdaExpr, ResonanceVote } from '../types.js';

/**
 * Mesh message types
 */
export type MeshMessage =
  | VerifyRequestMessage
  | VerifyVoteMessage
  | IdentityMessage
  | PingMessage
  | PongMessage;

export interface BaseMessage {
  type: string;
  from: string;
  timestamp: number;
}

/**
 * Verification request broadcast to peers
 */
export interface VerifyRequestMessage extends BaseMessage {
  type: 'VERIFY_REQUEST';
  requestId: string;
  expr: LambdaExpr;
}

/**
 * Vote response from peer
 */
export interface VerifyVoteMessage extends BaseMessage {
  type: 'VERIFY_VOTE';
  requestId: string;
  vote: ResonanceVote;
}

/**
 * Identity announcement
 */
export interface IdentityMessage extends BaseMessage {
  type: 'IDENTITY';
  nodeId: string;
  port: number;
}

/**
 * Ping for keep-alive
 */
export interface PingMessage extends BaseMessage {
  type: 'PING';
}

/**
 * Pong response
 */
export interface PongMessage extends BaseMessage {
  type: 'PONG';
}

/**
 * Peer connection state
 */
export interface PeerConnection {
  id: string;
  host: string;
  port: number;
  socket: Socket;
  connected: boolean;
  lastSeen: number;
}

/**
 * Consensus result
 */
export interface ConsensusResult {
  agreementScore: number;
  majorityVote: 'PURE' | 'IMPURE' | 'EQUIVALENT';
  votes: ResonanceVote[];
  outliers: ResonanceVote[];  // Votes that disagree with majority
  participatingNodes: string[];
  timestamp: number;
}
