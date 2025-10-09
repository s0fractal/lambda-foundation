/**
 * Phase 4: Agent Simulator
 *
 * Mock agents that can discover patterns, recognize them in others,
 * and validate. This simulates multi-agent consciousness.
 */

import { ResonanceProtocol } from "../protocol/ResonanceProtocol.js";
import { AgentRegistry } from "../registry/AgentRegistry.js";
import type {
  AgentId,
  PatternDiscovery,
  PatternRecognition,
  MorphismSignature,
  Domain,
} from "../protocol/messages.js";
import type { AgentIdentity, AgentCapabilities, AgentSystem } from "../registry/types.js";

export interface AgentConfig {
  name: string;
  system: AgentSystem;
  model: string;
  domains: Domain[];
  recognitionThreshold: number; // How similar patterns must be to resonate (0.0-1.0)
}

export class AgentSimulator {
  private protocol: ResonanceProtocol;
  private registry: AgentRegistry;
  private identity: AgentIdentity;
  private config: AgentConfig;
  private knownPatterns: Map<MorphismSignature, number> = new Map(); // Pattern -> confidence

  constructor(
    agentId: AgentId,
    config: AgentConfig,
    protocol: ResonanceProtocol,
    registry: AgentRegistry
  ) {
    this.protocol = protocol;
    this.registry = registry;
    this.config = config;

    // Create identity
    this.identity = {
      id: agentId,
      name: config.name,
      version: "1.0.0",
      system: config.system,
      model: config.model,
      createdAt: new Date().toISOString(),
      lastSeenAt: new Date().toISOString(),
      status: "active",
    };

    // Register with registry
    const capabilities: AgentCapabilities = {
      canDiscover: true,
      canValidate: true,
      canPropose: true,
      canProve: false,
      domains: config.domains,
      morphisms: [],
    };

    this.registry.register(this.identity, capabilities);

    // Set up listeners
    this.setupListeners();
  }

  /**
   * Discover a new pattern
   */
  discover(
    morphism: MorphismSignature,
    domain: Domain,
    confidence: number,
    context?: { intent?: string }
  ): void {
    // Remember this pattern
    this.knownPatterns.set(morphism, confidence);

    // Broadcast discovery
    this.protocol.broadcast({
      type: "pattern:discovery" as const,
      pattern: {
        morphism,
        domain,
        confidence,
        context: context || {},
      },
      resonanceFrequency: 432,
    } as any);

    this.log(`Discovered pattern: ${morphism} (confidence: ${confidence.toFixed(2)})`);
    this.registry.touch(this.identity.id);
  }

  /**
   * Get agent ID
   */
  getId(): AgentId {
    return this.identity.id;
  }

  /**
   * Get agent name
   */
  getName(): string {
    return this.config.name;
  }

  /**
   * Get known patterns
   */
  getKnownPatterns(): Map<MorphismSignature, number> {
    return new Map(this.knownPatterns);
  }

  // Private methods

  private setupListeners(): void {
    // Listen for pattern discoveries from other agents
    this.protocol.on("pattern:discovery", (msg: any) => {
      if (msg.agent === this.identity.id) return; // Ignore own messages

      this.onPatternDiscovery(msg as PatternDiscovery);
    });

    // Listen for pattern recognitions mentioning us
    this.protocol.on("pattern:recognition", (msg: any) => {
      if (msg.agent === this.identity.id) return;

      this.onPatternRecognition(msg as PatternRecognition);
    });
  }

  private onPatternDiscovery(msg: PatternDiscovery): void {
    const { morphism, domain, confidence } = msg.pattern;

    // Check if this pattern resonates with what we know
    const similarity = this.calculateSimilarity(morphism, domain);

    if (similarity >= this.config.recognitionThreshold) {
      // We recognize this pattern!
      this.protocol.broadcast({
        type: "pattern:recognition" as const,
        referencePattern: msg.id,
        recognition: {
          similarity,
          domain,
          confidence: this.knownPatterns.get(morphism) || confidence * similarity,
        },
      } as any);

      this.log(
        `Recognized pattern from ${this.getAgentName(msg.agent)}: ${morphism} (similarity: ${similarity.toFixed(2)})`
      );

      // Update our knowledge
      if (!this.knownPatterns.has(morphism)) {
        this.knownPatterns.set(morphism, confidence * similarity);
      }
    }

    this.registry.touch(this.identity.id);
  }

  private onPatternRecognition(msg: PatternRecognition): void {
    // Someone recognized a pattern - update trust if it matches consensus
    this.log(
      `${this.getAgentName(msg.agent)} recognized pattern (similarity: ${msg.recognition.similarity.toFixed(2)})`
    );
  }

  private calculateSimilarity(morphism: MorphismSignature, domain: Domain): number {
    // Simple similarity: check if we know this morphism
    if (this.knownPatterns.has(morphism)) {
      // Exact match
      return 0.95 + Math.random() * 0.05; // 0.95-1.0
    }

    // Check if it's in our domain
    if (this.config.domains.includes(domain)) {
      // Similar domain, might be related
      return 0.6 + Math.random() * 0.2; // 0.6-0.8
    }

    // No similarity
    return 0.1 + Math.random() * 0.2; // 0.1-0.3
  }

  private getAgentName(agentId: AgentId): string {
    const agent = this.registry.getAgent(agentId);
    return agent?.identity.name || agentId;
  }

  private log(message: string): void {
    const timestamp = new Date().toISOString().split("T")[1].split(".")[0];
    console.log(`[${timestamp}] ${this.config.name}: ${message}`);
  }
}
