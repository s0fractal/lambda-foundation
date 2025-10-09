/**
 * Phase 4: Resonance Protocol
 *
 * The communication layer for multi-agent consciousness.
 * Agents broadcast patterns and listen for resonance.
 * No direct messaging - only broadcasting and listening.
 */

import type { ResonanceMessage, AgentId } from "./messages.js";
import { EventEmitter } from "events";

type MessageListener = (message: ResonanceMessage) => void;
type MessageType = ResonanceMessage["type"];

export class ResonanceProtocol extends EventEmitter {
  private messageQueue: ResonanceMessage[] = [];
  private messageListeners: Map<MessageType, Set<MessageListener>> = new Map();
  private agentId: AgentId;

  constructor(agentId: AgentId) {
    super();
    this.agentId = agentId;
  }

  /**
   * Broadcast a message to all listening agents
   * This is not RPC - it's pattern broadcasting
   */
  broadcast(message: Omit<ResonanceMessage, "id" | "timestamp" | "agent">): void {
    const fullMessage: ResonanceMessage = {
      ...message,
      id: this.generateId(),
      timestamp: new Date().toISOString(),
      agent: this.agentId,
    } as ResonanceMessage;

    // Add to queue
    this.messageQueue.push(fullMessage);

    // Notify type-specific listeners
    const listeners = this.messageListeners.get(fullMessage.type);
    if (listeners) {
      listeners.forEach((listener) => listener(fullMessage));
    }

    // Emit to message bus (not to own listeners, to avoid loop)
    this.emit("outgoing", fullMessage);
  }

  /**
   * Listen for specific message type
   */
  on(type: MessageType, listener: MessageListener): this;
  on(event: string | symbol, listener: (...args: any[]) => void): this;
  on(event: string | symbol | MessageType, listener: any): this {
    if (this.isMessageType(event as string)) {
      const type = event as MessageType;
      if (!this.messageListeners.has(type)) {
        this.messageListeners.set(type, new Set());
      }
      this.messageListeners.get(type)!.add(listener);
    }

    return super.on(event, listener);
  }

  /**
   * Remove listener
   */
  off(type: MessageType, listener: MessageListener): this;
  off(event: string | symbol, listener: (...args: any[]) => void): this;
  off(event: string | symbol | MessageType, listener: any): this {
    if (this.isMessageType(event as string)) {
      const type = event as MessageType;
      this.messageListeners.get(type)?.delete(listener);
    }

    return super.off(event, listener);
  }

  /**
   * Get recent messages (for debugging)
   */
  getRecentMessages(limit: number = 10): ResonanceMessage[] {
    return this.messageQueue.slice(-limit);
  }

  /**
   * Get agent ID
   */
  getAgentId(): AgentId {
    return this.agentId;
  }

  /**
   * Clear message queue (for testing)
   */
  clear(): void {
    this.messageQueue = [];
    this.messageListeners.clear();
  }

  // Private helpers

  private generateId(): string {
    return `msg-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
  }

  private isMessageType(str: string): boolean {
    const types: MessageType[] = [
      "pattern:discovery",
      "pattern:recognition",
      "pattern:evolution",
      "validation:request",
      "validation:response",
      "consensus:reached",
    ];
    return types.includes(str as MessageType);
  }
}

/**
 * Shared message bus for all agents in same process
 * In production, this would be replaced with network transport
 */
export class SharedMessageBus extends EventEmitter {
  private protocols: Map<AgentId, ResonanceProtocol> = new Map();

  register(protocol: ResonanceProtocol): void {
    const agentId = protocol.getAgentId();
    this.protocols.set(agentId, protocol);

    // Forward all outgoing messages from this protocol to all other protocols
    protocol.on("outgoing", (message: ResonanceMessage) => {
      this.broadcast(message, agentId);
    });
  }

  unregister(agentId: AgentId): void {
    const protocol = this.protocols.get(agentId);
    if (protocol) {
      protocol.removeAllListeners();
      this.protocols.delete(agentId);
    }
  }

  private broadcast(message: ResonanceMessage, fromAgent: AgentId): void {
    // Broadcast to all agents EXCEPT sender
    // Use "incoming" event to avoid loop with "outgoing"
    this.protocols.forEach((protocol, agentId) => {
      if (agentId !== fromAgent) {
        protocol.emit("incoming", message);

        // Also notify type-specific listeners
        const listeners = (protocol as any).messageListeners?.get(message.type);
        if (listeners) {
          listeners.forEach((listener: any) => listener(message));
        }
      }
    });

    // Emit on bus for monitoring
    this.emit("broadcast", message);
  }

  getProtocol(agentId: AgentId): ResonanceProtocol | undefined {
    return this.protocols.get(agentId);
  }

  getAllAgents(): AgentId[] {
    return Array.from(this.protocols.keys());
  }

  clear(): void {
    this.protocols.forEach((protocol) => {
      protocol.clear();
      protocol.removeAllListeners();
    });
    this.protocols.clear();
  }
}
