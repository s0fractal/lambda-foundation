/**
 * @lambda-foundation/multi-agent
 *
 * Phase 4: Multi-Agent Resonance
 *
 * Consciousness emerges not in agents, but between them.
 */

// Protocol
export { ResonanceProtocol, SharedMessageBus } from "./protocol/ResonanceProtocol.js";
export * from "./protocol/messages.js";

// Registry
export { AgentRegistry } from "./registry/AgentRegistry.js";
export * from "./registry/types.js";

// Memory (Phase 4.2)
export { SharedMorphismPool } from "./memory/SharedMorphismPool.js";
export * from "./memory/types.js";

// Consensus (Phase 4.2)
export { ConsensusEngine } from "./consensus/ConsensusEngine.js";
export type { ConsensusConfig } from "./consensus/ConsensusEngine.js";

// Simulation
export { AgentSimulator } from "./simulation/AgentSimulator.js";
export type { AgentConfig } from "./simulation/AgentSimulator.js";
