/**
 * @lambda-foundation/mesh - IPFS-Enabled Lambda Mesh Node
 *
 * "Memory is eternal. What the network learns, the network never forgets."
 *
 * Phase 1: Single node (Monarch)
 * Phase 2: Network consensus (Diplomat)
 * Phase 3: Permanent storage (Historian)
 */

import { P2PLambdaMeshNode } from './P2PLambdaMeshNode.js';
import { IpfsStorage, type IpfsStorageConfig } from './storage/IpfsStorage.js';
import type {
  MorphismAnnounceMessage,
  MorphismSyncRequestMessage,
  MorphismSyncResponseMessage,
} from './storage/types.js';
import type {
  MeshConfig,
  CanonicalMorphism,
  LambdaExpr,
  VerifyResponse,
} from './types.js';
import type { MeshMessage } from './network/types.js';

export interface IpfsMeshConfig extends MeshConfig {
  ipfs?: IpfsStorageConfig;
}

/**
 * IPFS-enabled Lambda Mesh Node
 *
 * Extends P2P node with permanent IPFS storage
 */
export class IpfsLambdaMeshNode extends P2PLambdaMeshNode {
  private storage: IpfsStorage;

  constructor(config: IpfsMeshConfig) {
    super(config);

    this.storage = new IpfsStorage(config.ipfs ?? {});

    // Setup storage event handlers
    this.storage.on('stored', ({ morphism, cid }) => {
      this.handleMorphismStored(morphism, cid);
    });

    this.storage.on('synced', ({ morphism, cid }) => {
      this.handleMorphismSynced(morphism, cid);
    });
  }

  /**
   * Start IPFS-enabled node
   */
  async start(): Promise<void> {
    // Start P2P layer first
    await super.start();

    // Connect to IPFS
    await this.storage.connect();

    const stats = this.storage.getStats();
    console.log(`   IPFS: ${stats.connected ? 'Connected' : 'Local fallback'}`);
    console.log(`   Cache: ${stats.localCacheSize} morphisms\n`);
  }

  /**
   * Verify lambda expression with IPFS storage
   *
   * After consensus, store accepted morphisms on IPFS
   */
  async verifyLambda(expr: string, metadata?: LambdaExpr['metadata']): Promise<VerifyResponse> {
    // Get consensus result from P2P layer
    const result = await super.verifyLambda(expr, metadata);

    // If new morphism created (201), store on IPFS
    if (result.status === 201 && result.newMorphism) {
      await this.storeMorphismOnIpfs(result.newMorphism);
    }

    return result;
  }

  /**
   * Store morphism on IPFS and announce to peers
   */
  private async storeMorphismOnIpfs(morphism: CanonicalMorphism): Promise<void> {
    console.log(`   💾 Storing on IPFS...`);

    try {
      const cid = await this.storage.store(morphism);

      // Announce to all peers that we have this morphism
      this.announceMorphism(cid, morphism);
    } catch (err) {
      console.error(`   ❌ IPFS storage failed: ${err}`);
    }
  }

  /**
   * Announce morphism to peers
   */
  private announceMorphism(cid: string, morphism: CanonicalMorphism): void {
    const message: MorphismAnnounceMessage = {
      type: 'MORPHISM_ANNOUNCE',
      from: this.nodeId,
      timestamp: Date.now(),
      cid,
      morphismHash: morphism.hash,
      morphismName: morphism.name,
    };

    console.log(`   📢 Announcing to network: ${morphism.name} (CID: ${cid.slice(0, 16)}...)`);
    this.broadcastMessage(message);
  }

  /**
   * Handle morphism stored event
   */
  private handleMorphismStored(morphism: CanonicalMorphism, cid: string): void {
    this.emit('morphism-stored-ipfs', { morphism, cid });
  }

  /**
   * Handle morphism synced from peer
   */
  private handleMorphismSynced(morphism: CanonicalMorphism, cid: string): void {
    // Add to local registry
    this.morphisms.set(morphism.hash, morphism);

    console.log(`   ✅ Morphism synced to local registry: ${morphism.name}`);
    this.emit('morphism-synced', { morphism, cid });
  }

  /**
   * Handle storage-related network messages
   */
  protected async handleStorageMessage(message: MeshMessage): Promise<void> {
    switch (message.type) {
      case 'MORPHISM_ANNOUNCE':
        await this.handleMorphismAnnounce(message as MorphismAnnounceMessage);
        break;

      case 'MORPHISM_SYNC_REQUEST':
        await this.handleMorphismSyncRequest(message as MorphismSyncRequestMessage);
        break;

      case 'MORPHISM_SYNC_RESPONSE':
        await this.handleMorphismSyncResponse(message as MorphismSyncResponseMessage);
        break;
    }
  }

  /**
   * Handle morphism announcement from peer
   */
  private async handleMorphismAnnounce(message: MorphismAnnounceMessage): Promise<void> {
    const { cid, morphismHash, morphismName, from } = message;

    console.log(`\n📢 Morphism announced by ${from}: ${morphismName}`);
    console.log(`   CID: ${cid.slice(0, 16)}...`);

    // Check if we already have this morphism
    if (this.morphisms.has(morphismHash)) {
      console.log(`   ✓ Already have this morphism`);
      return;
    }

    // Sync from IPFS
    console.log(`   🔄 Syncing from IPFS...`);
    const morphism = await this.storage.syncFromPeer(cid);

    if (morphism) {
      // Add to local registry
      this.morphisms.set(morphism.hash, morphism);
      console.log(`   ✅ Synced and added to registry`);
    }
  }

  /**
   * Handle sync request from peer
   */
  private async handleMorphismSyncRequest(message: MorphismSyncRequestMessage): Promise<void> {
    const { cid, from } = message;

    console.log(`\n🔄 Sync request from ${from} for CID: ${cid.slice(0, 16)}...`);

    const morphism = await this.storage.retrieve(cid);

    if (morphism) {
      const response: MorphismSyncResponseMessage = {
        type: 'MORPHISM_SYNC_RESPONSE',
        from: this.nodeId,
        timestamp: Date.now(),
        cid,
        morphism,
      };

      this.sendMessageToPeer(from, response);
      console.log(`   ✅ Sent morphism to ${from}`);
    } else {
      console.log(`   ❌ Morphism not found`);
    }
  }

  /**
   * Handle sync response from peer
   */
  private async handleMorphismSyncResponse(message: MorphismSyncResponseMessage): Promise<void> {
    const { morphism, cid, from } = message;

    console.log(`\n📦 Received morphism from ${from}: ${morphism.name}`);

    // Store locally
    this.morphisms.set(morphism.hash, morphism);
    await this.storage.store(morphism);

    console.log(`   ✅ Stored locally`);
  }

  /**
   * Broadcast message to all peers (helper)
   */
  private broadcastMessage(message: MeshMessage): void {
    // Access protected transport through any cast
    const transport = (this as any).transport;
    if (transport) {
      transport.broadcast(message);
    }
  }

  /**
   * Send message to specific peer (helper)
   */
  private sendMessageToPeer(peerId: string, message: MeshMessage): void {
    const transport = (this as any).transport;
    if (transport) {
      transport.sendToPeer(peerId, message);
    }
  }

  /**
   * Get storage statistics
   */
  getStorageStats() {
    return this.storage.getStats();
  }

  /**
   * Stop IPFS-enabled node
   */
  async stop(): Promise<void> {
    await this.storage.disconnect();
    await super.stop();
  }
}
