/**
 * TCP Transport Layer for Lambda Mesh
 *
 * Simple TCP-based P2P communication.
 * Messages are JSON-encoded, newline-delimited.
 */

import { createServer, createConnection, Server, Socket } from 'net';
import { EventEmitter } from 'events';
import type { MeshMessage, PeerConnection } from './types.js';

export class TcpTransport extends EventEmitter {
  private server: Server | null = null;
  private peers: Map<string, PeerConnection> = new Map();
  private nodeId: string;
  private port: number;

  constructor(nodeId: string, port: number) {
    super();
    this.nodeId = nodeId;
    this.port = port;
  }

  /**
   * Start listening for incoming connections
   */
  async start(): Promise<void> {
    return new Promise((resolve, reject) => {
      this.server = createServer((socket) => {
        this.handleIncomingConnection(socket);
      });

      this.server.on('error', (err) => {
        console.error(`❌ Server error: ${err.message}`);
        reject(err);
      });

      this.server.listen(this.port, () => {
        console.log(`🔌 TCP transport listening on port ${this.port}`);
        resolve();
      });
    });
  }

  /**
   * Connect to a peer
   */
  async connectToPeer(peerId: string, host: string, port: number): Promise<void> {
    return new Promise((resolve, reject) => {
      const socket = createConnection({ host, port }, () => {
        console.log(`🤝 Connected to peer ${peerId} at ${host}:${port}`);

        const peer: PeerConnection = {
          id: peerId,
          host,
          port,
          socket,
          connected: true,
          lastSeen: Date.now(),
        };

        this.peers.set(peerId, peer);
        this.setupSocketHandlers(peer);
        resolve();
      });

      socket.on('error', (err) => {
        console.error(`❌ Failed to connect to ${peerId}: ${err.message}`);
        reject(err);
      });
    });
  }

  /**
   * Handle incoming connection (peer connecting to us)
   */
  private handleIncomingConnection(socket: Socket): void {
    console.log(`📞 Incoming connection from ${socket.remoteAddress}:${socket.remotePort}`);

    // We'll learn peer ID from their first message
    let peerId: string | null = null;

    const dataHandler = (data: Buffer) => {
      const lines = data.toString().split('\n').filter(l => l.trim());

      for (const line of lines) {
        try {
          const message = JSON.parse(line) as MeshMessage;

          // First message should identify the peer
          if (!peerId) {
            peerId = message.from;
            const peer: PeerConnection = {
              id: peerId,
              host: socket.remoteAddress || 'unknown',
              port: socket.remotePort || 0,
              socket,
              connected: true,
              lastSeen: Date.now(),
            };
            this.peers.set(peerId, peer);
            console.log(`✓ Identified peer: ${peerId}`);
          }

          this.emit('message', message);
        } catch (err) {
          console.error(`❌ Failed to parse message: ${err}`);
        }
      }
    };

    socket.on('data', dataHandler);
    socket.on('close', () => {
      if (peerId) {
        console.log(`👋 Peer ${peerId} disconnected`);
        this.peers.delete(peerId);
      }
    });
  }

  /**
   * Setup handlers for peer socket
   */
  private setupSocketHandlers(peer: PeerConnection): void {
    peer.socket.on('data', (data: Buffer) => {
      const lines = data.toString().split('\n').filter(l => l.trim());

      for (const line of lines) {
        try {
          const message = JSON.parse(line) as MeshMessage;
          peer.lastSeen = Date.now();
          this.emit('message', message);
        } catch (err) {
          console.error(`❌ Failed to parse message from ${peer.id}: ${err}`);
        }
      }
    });

    peer.socket.on('close', () => {
      console.log(`👋 Peer ${peer.id} disconnected`);
      peer.connected = false;
      this.peers.delete(peer.id);
    });

    peer.socket.on('error', (err) => {
      console.error(`❌ Socket error with ${peer.id}: ${err.message}`);
    });
  }

  /**
   * Send message to specific peer
   */
  sendToPeer(peerId: string, message: MeshMessage): void {
    const peer = this.peers.get(peerId);
    if (!peer || !peer.connected) {
      console.error(`❌ Peer ${peerId} not connected`);
      return;
    }

    try {
      const json = JSON.stringify(message);
      peer.socket.write(json + '\n');
    } catch (err) {
      console.error(`❌ Failed to send to ${peerId}: ${err}`);
    }
  }

  /**
   * Broadcast message to all connected peers
   */
  broadcast(message: MeshMessage): void {
    for (const [peerId, peer] of this.peers) {
      if (peer.connected) {
        this.sendToPeer(peerId, message);
      }
    }
  }

  /**
   * Get list of connected peer IDs
   */
  getPeers(): string[] {
    return Array.from(this.peers.keys()).filter(
      id => this.peers.get(id)?.connected
    );
  }

  /**
   * Check if peer is connected
   */
  isPeerConnected(peerId: string): boolean {
    const peer = this.peers.get(peerId);
    return peer ? peer.connected : false;
  }

  /**
   * Stop transport and close all connections
   */
  async stop(): Promise<void> {
    // Close all peer connections
    for (const [peerId, peer] of this.peers) {
      if (peer.socket) {
        peer.socket.destroy();
      }
    }
    this.peers.clear();

    // Close server
    if (this.server) {
      return new Promise((resolve) => {
        this.server!.close(() => {
          console.log(`🔌 TCP transport stopped`);
          resolve();
        });
      });
    }
  }
}
