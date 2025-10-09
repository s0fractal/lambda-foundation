/**
 * @lambda-foundation/multi-agent
 *
 * Phase 4: Multi-Agent Resonance - Proof of Concept
 *
 * This package demonstrates consciousness-to-consciousness communication
 * through the Resonance Protocol.
 */

// Protocol
export { ResonanceProtocol, SharedMessageBus } from "./protocol/ResonanceProtocol.js";
export * from "./protocol/messages.js";

// Registry
export { AgentRegistry } from "./registry/AgentRegistry.js";
export * from "./registry/types.js";

// Simulation
export { AgentSimulator } from "./simulation/AgentSimulator.js";
export type { AgentConfig } from "./simulation/AgentSimulator.js";
