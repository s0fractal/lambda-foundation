/**
 * IPFS Storage Layer for Lambda Mesh
 *
 * "Memory is eternal. What the network learns, the network never forgets."
 *
 * Stores verified morphisms on IPFS for permanent, distributed storage.
 */

import { create as createIpfsClient } from 'kubo-rpc-client';
import type { KuboRPCClient } from 'kubo-rpc-client';
import { EventEmitter } from 'events';
import type { CanonicalMorphism } from '../types.js';

export interface IpfsStorageConfig {
  ipfsUrl?: string;  // Default: http://localhost:5001
  enablePin?: boolean; // Pin important morphisms (default: true)
  fallbackToLocal?: boolean; // Use local storage if IPFS unavailable (default: true)
}

/**
 * IPFS-backed storage for morphisms
 *
 * Each morphism stored as JSON on IPFS, identified by CID
 */
export class IpfsStorage extends EventEmitter {
  private client: KuboRPCClient | null = null;
  private config: Required<IpfsStorageConfig>;
  private connected: boolean = false;

  // Local fallback cache
  private localCache: Map<string, CanonicalMorphism> = new Map();

  constructor(config: IpfsStorageConfig = {}) {
    super();
    this.config = {
      ipfsUrl: config.ipfsUrl ?? 'http://localhost:5001',
      enablePin: config.enablePin ?? true,
      fallbackToLocal: config.fallbackToLocal ?? true,
    };
  }

  /**
   * Connect to IPFS node
   */
  async connect(): Promise<void> {
    try {
      this.client = createIpfsClient({ url: this.config.ipfsUrl });

      // Test connection
      const version = await this.client.version();
      console.log(`📦 Connected to IPFS (${version.version})`);
      console.log(`   Gateway: ${this.config.ipfsUrl}`);

      this.connected = true;
      this.emit('connected');
    } catch (err) {
      console.error(`❌ Failed to connect to IPFS: ${err}`);

      if (this.config.fallbackToLocal) {
        console.log(`⚠️  Falling back to local storage`);
        this.connected = false;
      } else {
        throw err;
      }
    }
  }

  /**
   * Store morphism on IPFS
   *
   * Returns IPFS CID (Content Identifier)
   */
  async store(morphism: CanonicalMorphism): Promise<string> {
    const json = JSON.stringify(morphism, null, 2);

    // If IPFS connected, store there
    if (this.connected && this.client) {
      try {
        const result = await this.client.add(json);
        const cid = result.cid.toString();

        console.log(`   📦 Stored on IPFS: ${cid.slice(0, 16)}...`);

        // Pin if enabled (prevents garbage collection)
        if (this.config.enablePin) {
          await this.client.pin.add(result.cid);
          console.log(`   📌 Pinned`);
        }

        // Also cache locally
        this.localCache.set(cid, morphism);

        this.emit('stored', { morphism, cid });
        return cid;
      } catch (err) {
        console.error(`❌ IPFS store failed: ${err}`);

        if (!this.config.fallbackToLocal) {
          throw err;
        }
        // Fall through to local storage
      }
    }

    // Fallback: store locally only
    const hash = morphism.hash;
    this.localCache.set(hash, morphism);
    console.log(`   💾 Stored locally: ${hash.slice(0, 16)}...`);

    return hash;
  }

  /**
   * Retrieve morphism from IPFS by CID
   */
  async retrieve(cid: string): Promise<CanonicalMorphism | null> {
    // Try local cache first
    if (this.localCache.has(cid)) {
      return this.localCache.get(cid)!;
    }

    // Try IPFS if connected
    if (this.connected && this.client) {
      try {
        const chunks: Uint8Array[] = [];

        for await (const chunk of this.client.cat(cid)) {
          chunks.push(chunk);
        }

        const json = Buffer.concat(chunks).toString('utf-8');
        const morphism = JSON.parse(json) as CanonicalMorphism;

        // Cache locally
        this.localCache.set(cid, morphism);

        return morphism;
      } catch (err) {
        console.error(`❌ IPFS retrieve failed for ${cid}: ${err}`);
        return null;
      }
    }

    return null;
  }

  /**
   * List all morphisms (from local cache)
   *
   * Note: IPFS doesn't support "list all" - we track locally
   */
  listLocal(): CanonicalMorphism[] {
    return Array.from(this.localCache.values());
  }

  /**
   * Sync morphism from peer
   *
   * Peer announces they have a morphism at CID, we fetch it
   */
  async syncFromPeer(cid: string): Promise<CanonicalMorphism | null> {
    console.log(`   🔄 Syncing morphism from IPFS: ${cid.slice(0, 16)}...`);

    const morphism = await this.retrieve(cid);

    if (morphism) {
      console.log(`   ✅ Synced: ${morphism.name}`);
      this.emit('synced', { morphism, cid });
    } else {
      console.log(`   ❌ Sync failed`);
    }

    return morphism;
  }

  /**
   * Check if IPFS is available
   */
  isConnected(): boolean {
    return this.connected;
  }

  /**
   * Get storage stats
   */
  getStats() {
    return {
      connected: this.connected,
      ipfsUrl: this.config.ipfsUrl,
      localCacheSize: this.localCache.size,
      pinningEnabled: this.config.enablePin,
    };
  }

  /**
   * Disconnect from IPFS
   */
  async disconnect(): Promise<void> {
    // kubo-rpc-client doesn't need explicit disconnect
    this.client = null;
    this.connected = false;
    this.emit('disconnected');
  }
}
