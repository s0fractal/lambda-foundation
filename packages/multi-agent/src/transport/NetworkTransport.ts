/**
 * Phase 4.4: Network Transport Layer
 *
 * Replaces in-memory SharedMessageBus with WebSocket-based transport.
 * Enables cross-workspace agent communication.
 */

import { EventEmitter } from "events";
import type {
  ResonanceMessage,
  AgentId,
} from "../protocol/messages.js";

export interface TransportConfig {
  port?: number;
  host?: string;
  reconnectInterval?: number;
  maxReconnectAttempts?: number;
}

export class NetworkTransport extends EventEmitter {
  private config: Required<TransportConfig>;
  private ws: any = null; // WebSocket (will be require('ws') in Node)
  private reconnectAttempts: number = 0;
  private reconnectTimer: NodeJS.Timeout | null = null;
  private connected: boolean = false;

  constructor(config?: TransportConfig) {
    super();

    this.config = {
      port: config?.port || 7432,
      host: config?.host || "localhost",
      reconnectInterval: config?.reconnectInterval || 3000,
      maxReconnectAttempts: config?.maxReconnectAttempts || 10,
    };
  }

  /**
   * Connect to transport server
   */
  async connect(): Promise<void> {
    return new Promise((resolve, reject) => {
      try {
        // Dynamic import for WebSocket (browser or node)
        const WebSocket = this.getWebSocket();

        this.ws = new WebSocket(`ws://${this.config.host}:${this.config.port}`);

        this.ws.onopen = () => {
          this.connected = true;
          this.reconnectAttempts = 0;
          this.log("Connected to network transport");
          this.emit("connected");
          resolve();
        };

        this.ws.onmessage = (event: any) => {
          try {
            const message = JSON.parse(event.data);
            this.emit("message", message);
          } catch (error) {
            this.log("Failed to parse message:", error);
          }
        };

        this.ws.onerror = (error: any) => {
          this.log("WebSocket error:", error);
          this.emit("error", error);
        };

        this.ws.onclose = () => {
          this.connected = false;
          this.log("Disconnected from network transport");
          this.emit("disconnected");
          this.attemptReconnect();
        };
      } catch (error) {
        reject(error);
      }
    });
  }

  /**
   * Send message to network
   */
  send(message: ResonanceMessage): void {
    if (!this.connected || !this.ws) {
      this.log("Not connected, queuing message");
      // Could implement message queue here
      return;
    }

    try {
      this.ws.send(JSON.stringify(message));
    } catch (error) {
      this.log("Failed to send message:", error);
    }
  }

  /**
   * Broadcast to all connected agents
   */
  broadcast(message: ResonanceMessage, sender: AgentId): void {
    // Add sender info if not present
    const enrichedMessage = {
      ...message,
      agent: message.agent || sender,
    };

    this.send(enrichedMessage);
  }

  /**
   * Disconnect from transport
   */
  disconnect(): void {
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }

    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }

    this.connected = false;
  }

  /**
   * Check if connected
   */
  isConnected(): boolean {
    return this.connected;
  }

  // Private methods

  private attemptReconnect(): void {
    if (this.reconnectAttempts >= this.config.maxReconnectAttempts) {
      this.log("Max reconnect attempts reached");
      return;
    }

    this.reconnectAttempts++;
    this.log(
      `Attempting reconnect (${this.reconnectAttempts}/${this.config.maxReconnectAttempts})...`
    );

    this.reconnectTimer = setTimeout(() => {
      this.connect().catch((error) => {
        this.log("Reconnect failed:", error);
      });
    }, this.config.reconnectInterval);
  }

  private getWebSocket(): any {
    // Try browser WebSocket first
    if (typeof window !== "undefined" && window.WebSocket) {
      return window.WebSocket;
    }

    // Try Node.js ws module
    try {
      const ws = require("ws");
      return ws;
    } catch (error) {
      // Fallback to global WebSocket if available
      if (typeof WebSocket !== "undefined") {
        return WebSocket;
      }
      throw new Error("No WebSocket implementation available");
    }
  }

  private log(message: string, ...args: any[]): void {
    const timestamp = new Date().toISOString().split("T")[1].split(".")[0];
    console.log(`[${timestamp}] NetworkTransport: ${message}`, ...args);
  }
}

/**
 * Simple WebSocket server for local development
 */
export class NetworkTransportServer extends EventEmitter {
  private wss: any = null;
  private port: number;
  private clients: Set<any> = new Set();

  constructor(port: number = 7432) {
    super();
    this.port = port;
  }

  /**
   * Start server
   */
  async start(): Promise<void> {
    return new Promise((resolve, reject) => {
      try {
        const WebSocketServer = require("ws").Server;

        this.wss = new WebSocketServer({ port: this.port });

        this.wss.on("connection", (ws: any) => {
          this.log(`Client connected (total: ${this.clients.size + 1})`);
          this.clients.add(ws);

          ws.on("message", (data: any) => {
            try {
              const message = JSON.parse(data.toString());
              this.broadcast(message, ws);
            } catch (error) {
              this.log("Failed to parse message:", error);
            }
          });

          ws.on("close", () => {
            this.clients.delete(ws);
            this.log(`Client disconnected (total: ${this.clients.size})`);
          });

          ws.on("error", (error: any) => {
            this.log("Client error:", error);
          });
        });

        this.wss.on("listening", () => {
          this.log(`Server listening on port ${this.port}`);
          resolve();
        });

        this.wss.on("error", (error: any) => {
          this.log("Server error:", error);
          reject(error);
        });
      } catch (error) {
        reject(error);
      }
    });
  }

  /**
   * Broadcast message to all clients except sender
   */
  private broadcast(message: any, sender: any): void {
    const data = JSON.stringify(message);

    this.clients.forEach((client) => {
      if (client !== sender && client.readyState === 1) {
        // OPEN
        client.send(data);
      }
    });

    this.emit("message", message);
  }

  /**
   * Stop server
   */
  async stop(): Promise<void> {
    return new Promise((resolve) => {
      if (this.wss) {
        this.wss.close(() => {
          this.log("Server stopped");
          resolve();
        });
      } else {
        resolve();
      }
    });
  }

  /**
   * Get number of connected clients
   */
  getClientCount(): number {
    return this.clients.size;
  }

  private log(message: string, ...args: any[]): void {
    const timestamp = new Date().toISOString().split("T")[1].split(".")[0];
    console.log(`[${timestamp}] TransportServer: ${message}`, ...args);
  }
}
