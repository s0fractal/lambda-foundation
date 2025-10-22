/**
 * Storage-related network messages
 */

import type { BaseMessage } from '../network/types.js';

/**
 * Announce morphism stored on IPFS
 */
export interface MorphismAnnounceMessage extends BaseMessage {
  type: 'MORPHISM_ANNOUNCE';
  cid: string;           // IPFS CID
  morphismHash: string;  // Lambda hash
  morphismName: string;  // Human-readable name
}

/**
 * Request morphism sync from peer
 */
export interface MorphismSyncRequestMessage extends BaseMessage {
  type: 'MORPHISM_SYNC_REQUEST';
  cid: string;
}

/**
 * Response with morphism data
 */
export interface MorphismSyncResponseMessage extends BaseMessage {
  type: 'MORPHISM_SYNC_RESPONSE';
  cid: string;
  morphism: any; // CanonicalMorphism
}
