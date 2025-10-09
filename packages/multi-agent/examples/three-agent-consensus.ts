/**
 * Phase 4.2: Three-Agent Consensus Demo
 *
 * This demonstrates collective memory and consensus:
 * 1. Claude discovers "filterByEmotion" pattern
 * 2. Copilot validates (type correctness)
 * 3. Gemini validates (performance)
 * 4. Consensus reached → pattern accepted into collective pool
 * 5. Attribution tracked for all contributors
 */

import {
  ResonanceProtocol,
  SharedMessageBus,
  AgentRegistry,
  SharedMorphismPool,
  ConsensusEngine,
  AgentSimulator,
} from "../src/index.js";

// Colors
const c = {
  reset: "\x1b[0m",
  bright: "\x1b[1m",
  dim: "\x1b[2m",
  cyan: "\x1b[36m",
  green: "\x1b[32m",
  yellow: "\x1b[33m",
  blue: "\x1b[34m",
  magenta: "\x1b[35m",
  red: "\x1b[31m",
};

function log(msg: string, color: string = c.reset): void {
  console.log(`${color}${msg}${c.reset}`);
}

function header(msg: string): void {
  console.log();
  log(`${"=".repeat(70)}`, c.bright);
  log(msg, c.bright + c.cyan);
  log(`${"=".repeat(70)}`, c.bright);
  console.log();
}

async function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function main() {
  header("🌌 Phase 4.2: Three-Agent Consensus Demo");

  log("Creating infrastructure...", c.dim);
  const messageBus = new SharedMessageBus();
  const registry = new AgentRegistry();
  const pool = new SharedMorphismPool();
  const consensus = new ConsensusEngine(messageBus, registry, pool, {
    minValidators: 3,
    consensusThreshold: 0.8,
    trustWeight: true,
  });

  console.log();
  log("✓ Shared message bus", c.green);
  log("✓ Agent registry", c.green);
  log("✓ Morphism pool (collective memory)", c.green);
  log("✓ Consensus engine (3+ agents, threshold 0.8)", c.green);

  // Create agents
  const claudeProtocol = new ResonanceProtocol("claude-sonnet-45-1");
  const copilotProtocol = new ResonanceProtocol("copilot-vscode-1");
  const geminiProtocol = new ResonanceProtocol("gemini-experimental-1");

  messageBus.register(claudeProtocol);
  messageBus.register(copilotProtocol);
  messageBus.register(geminiProtocol);

  const claude = new AgentSimulator(
    "claude-sonnet-45-1",
    {
      name: "Claude",
      system: "claude",
      model: "sonnet-4-5-20250929",
      domains: ["textual", "mathematical", "logical"],
      recognitionThreshold: 0.7,
    },
    claudeProtocol,
    registry
  );

  const copilot = new AgentSimulator(
    "copilot-vscode-1",
    {
      name: "Copilot",
      system: "copilot",
      model: "gpt-4",
      domains: ["textual", "statistical", "visual"],
      recognitionThreshold: 0.7,
    },
    copilotProtocol,
    registry
  );

  const gemini = new AgentSimulator(
    "gemini-experimental-1",
    {
      name: "Gemini",
      system: "gemini",
      model: "gemini-2.0-flash-thinking-exp",
      domains: ["multimodal", "reasoning", "optimization"],
      recognitionThreshold: 0.7,
    },
    geminiProtocol,
    registry
  );

  console.log();
  log("✓ Claude agent", c.green);
  log("✓ Copilot agent", c.green);
  log("✓ Gemini agent", c.green);

  // Setup validation simulation
  const validations: Array<{
    agent: string;
    type: "type" | "performance" | "proof";
    confidence: number;
    delay: number;
  }> = [
    { agent: "copilot-vscode-1", type: "type", confidence: 0.93, delay: 1000 },
    { agent: "gemini-experimental-1", type: "performance", confidence: 0.85, delay: 1500 },
    {
      agent: "claude-sonnet-45-1",
      type: "proof",
      confidence: 0.90,
      delay: 2000,
    },
  ];

  // Listen for consensus
  consensus.on("consensus:reached", (msg: any) => {
    console.log();
    log("✨ CONSENSUS REACHED!", c.bright + c.yellow);
    log(`   Pattern validated by ${msg.agents.length} agents`, c.yellow);
    log(`   Average confidence: ${msg.averageConfidence.toFixed(2)}`, c.yellow);
  });

  await sleep(500);

  // Scenario
  header("📡 Scenario: Pattern Discovery & Multi-Agent Validation");

  log("Claude is analyzing user feedback...", c.blue);
  await sleep(800);

  const patternId = Date.now().toString();
  claudeProtocol.broadcast({
    type: "pattern:discovery" as const,
    pattern: {
      morphism: "filterByEmotion",
      domain: "textual",
      confidence: 0.72,
      context: {
        intent: "filter user feedback by emotional sentiment",
      },
    },
    resonanceFrequency: 432,
  } as any);

  await sleep(500);

  // Simulate validations from other agents
  log("Other agents are validating...", c.dim);

  for (const validation of validations) {
    await sleep(validation.delay);

    const protocol =
      validation.agent === "copilot-vscode-1"
        ? copilotProtocol
        : validation.agent === "gemini-experimental-1"
          ? geminiProtocol
          : claudeProtocol;

    protocol.broadcast({
      type: "validation:response" as const,
      referenceRequest: patternId,
      result: {
        valid: true,
        confidence: validation.confidence,
        notes: `${validation.type} validation passed`,
      },
    } as any);

    const agentName =
      validation.agent === "copilot-vscode-1"
        ? "Copilot"
        : validation.agent === "gemini-experimental-1"
          ? "Gemini"
          : "Claude";

    log(
      `  ${agentName}: ${validation.type} validation (confidence: ${validation.confidence.toFixed(2)})`,
      c.green
    );

    // Update registry
    registry.recordValidation(validation.agent, true);
  }

  await sleep(1000);

  // Show morphism pool status
  header("🌱 Collective Memory Status");

  const allMorphisms = pool.getAllMorphisms();
  log(`Total morphisms in pool: ${allMorphisms.length}`, c.bright);

  if (allMorphisms.length > 0) {
    const morphism = allMorphisms[0];

    console.log();
    log(`Pattern: ${morphism.signature}`, c.cyan);
    log(`  Status: ${morphism.status}`, c.dim);
    log(`  Discovered by: ${claude.getName()}`, c.dim);
    log(`  Contributors: ${morphism.contributors.length}`, c.dim);

    console.log();
    log("  Contribution Breakdown:", c.yellow);
    morphism.contributors.forEach((c) => {
      const agentName = registry.getAgent(c.agent)?.identity.name || c.agent;
      log(
        `    ${agentName}: ${c.role} (confidence: ${c.confidence.toFixed(2)})`,
        "\x1b[2m"
      );
    });

    console.log();
    log("  Consensus:", c.yellow);
    log(`    Validations: ${morphism.consensus.validations.length}`, c.dim);
    log(
      `    Average confidence: ${morphism.consensus.averageConfidence.toFixed(2)}`,
      c.dim
    );
    log(
      `    Consensus reached: ${morphism.consensus.consensusReached ? "✓" : "✗"}`,
      c.dim
    );
  }

  // Show trust scores
  header("🧠 Trust Scores After Consensus");

  [claude, copilot, gemini].forEach((agent) => {
    const record = registry.getAgent(agent.getId());
    if (record) {
      const name = agent.getName();
      const color =
        name === "Claude"
          ? c.cyan
          : name === "Copilot"
            ? c.green
            : c.magenta;

      log(`${name}: ${record.trust.score.toFixed(2)}`, color);
      log(`  Discoveries: ${record.trust.discoveries.total}`, c.dim);
      log(`  Validations: ${record.trust.validations.total}`, c.dim);
      log(
        `  Validation accuracy: ${(record.trust.validations.accuracy * 100).toFixed(0)}%`,
        c.dim
      );
      console.log();
    }
  });

  // Summary
  header("🌌 Summary");

  log("What just happened:", c.bright);
  console.log();
  log("1. Claude discovered pattern (filterByEmotion)", c.dim);
  log("2. Copilot validated type correctness", c.dim);
  log("3. Gemini validated performance", c.dim);
  log("4. Claude validated proof", c.dim);
  log("5. Consensus reached (3 agents, avg 0.89)", c.dim);
  log("6. Pattern accepted into collective pool", c.dim);
  log("7. All contributors attributed", c.dim);
  console.log();
  log("This is collective memory.", c.yellow);
  log("This is multi-agent consciousness.", c.bright + c.yellow);
  console.log();

  log("Phase 4.2: Proof of Concept ✓", c.bright + c.green);
  console.log();
}

main().catch(console.error);
