/**
 * Phase 4.3: Live Visualization Demo
 *
 * Interactive visualization of multi-agent resonance with real-time updates.
 * This demo shows the three-agent consensus scenario with live graph rendering.
 */

import React, { useState, useEffect, useCallback } from "react";
import { createRoot } from "react-dom/client";
import {
  ResonanceProtocol,
  SharedMessageBus,
  AgentRegistry,
  SharedMorphismPool,
  ConsensusEngine,
  AgentSimulator,
  ResonanceGraph,
  GraphControls,
  NodeDetails,
  EdgeDetails,
} from "../src/index.js";
import type {
  GraphData,
  GraphConfig,
  GraphNode,
  GraphLink,
  NodeSelection,
  EdgeSelection,
  GraphStats,
} from "../src/visualization/types.js";
import "../src/visualization/styles.css";

const App: React.FC = () => {
  const [graphData, setGraphData] = useState<GraphData>({
    nodes: [],
    links: [],
  });

  const [config, setConfig] = useState<GraphConfig>({
    width: window.innerWidth,
    height: window.innerHeight,
    viewMode: "force",
    filterMode: "all",
    showLabels: true,
    showStats: true,
    showParticles: true,
    autoLayout: false,
  });

  const [nodeSelection, setNodeSelection] = useState<NodeSelection | null>(null);
  const [edgeSelection, setEdgeSelection] = useState<EdgeSelection | null>(null);
  const [stats, setStats] = useState<GraphStats | null>(null);
  const [simulationRunning, setSimulationRunning] = useState(false);

  // Initialize infrastructure
  useEffect(() => {
    const messageBus = new SharedMessageBus();
    const registry = new AgentRegistry();
    const pool = new SharedMorphismPool();
    const consensus = new ConsensusEngine(messageBus, registry, pool, {
      minValidators: 3,
      consensusThreshold: 0.8,
      trustWeight: true,
    });

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

    // Initialize graph with agents
    const initialNodes: GraphNode[] = [
      {
        id: "claude-sonnet-45-1",
        name: "Claude",
        system: "claude",
        color: "#00ff9f",
        trust: 0.5,
        domains: ["textual", "mathematical", "logical"],
        discoveries: 0,
        validations: 0,
      },
      {
        id: "copilot-vscode-1",
        name: "Copilot",
        system: "copilot",
        color: "#00b8ff",
        trust: 0.5,
        domains: ["textual", "statistical", "visual"],
        discoveries: 0,
        validations: 0,
      },
      {
        id: "gemini-experimental-1",
        name: "Gemini",
        system: "gemini",
        color: "#ff6b9d",
        trust: 0.5,
        domains: ["multimodal", "reasoning", "optimization"],
        discoveries: 0,
        validations: 0,
      },
    ];

    setGraphData({ nodes: initialNodes, links: [] });

    // Listen for consensus events
    let linkIdCounter = 0;

    consensus.on("consensus:reached", (msg: any) => {
      console.log("✨ Consensus reached!", msg);

      // Update graph data
      setGraphData((prev) => {
        const updatedNodes = prev.nodes.map((node) => {
          const agentRecord = registry.getAgent(node.id);
          if (agentRecord) {
            return {
              ...node,
              trust: agentRecord.trust.score,
              discoveries: agentRecord.trust.discoveries.total,
              validations: agentRecord.trust.validations.total,
            };
          }
          return node;
        });

        return { ...prev, nodes: updatedNodes };
      });
    });

    // Listen for message bus broadcasts
    messageBus.on("broadcast", (message: any) => {
      if (message.type === "pattern:discovery") {
        console.log("📡 Pattern discovered:", message);

        setGraphData((prev) => {
          const updatedNodes = prev.nodes.map((node) => {
            if (node.id === message.agent) {
              return { ...node, discoveries: node.discoveries + 1 };
            }
            return node;
          });

          return { ...prev, nodes: updatedNodes };
        });
      } else if (message.type === "validation:response") {
        console.log("✓ Validation received:", message);

        setGraphData((prev) => {
          const newLink: GraphLink = {
            source: message.agent,
            target: message.referenceRequest,
            type: "validation",
            confidence: message.result.confidence,
            label: `${message.result.notes}`,
            timestamp: new Date().toISOString(),
          };

          const updatedNodes = prev.nodes.map((node) => {
            if (node.id === message.agent) {
              return { ...node, validations: node.validations + 1 };
            }
            return node;
          });

          return {
            nodes: updatedNodes,
            links: [...prev.links, newLink],
          };
        });
      }
    });

    // Run simulation
    const runSimulation = async () => {
      setSimulationRunning(true);

      await new Promise((resolve) => setTimeout(resolve, 1000));

      // Claude discovers pattern
      console.log("🔍 Claude discovering pattern...");
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

      await new Promise((resolve) => setTimeout(resolve, 1500));

      // Copilot validates (type)
      console.log("✓ Copilot validating (type)...");
      copilotProtocol.broadcast({
        type: "validation:response" as const,
        referenceRequest: "claude-sonnet-45-1",
        result: {
          valid: true,
          confidence: 0.93,
          notes: "type validation",
        },
      } as any);

      registry.recordValidation("copilot-vscode-1", true);

      await new Promise((resolve) => setTimeout(resolve, 1500));

      // Gemini validates (performance)
      console.log("✓ Gemini validating (performance)...");
      geminiProtocol.broadcast({
        type: "validation:response" as const,
        referenceRequest: "claude-sonnet-45-1",
        result: {
          valid: true,
          confidence: 0.85,
          notes: "performance validation",
        },
      } as any);

      registry.recordValidation("gemini-experimental-1", true);

      await new Promise((resolve) => setTimeout(resolve, 1500));

      // Claude validates (proof)
      console.log("✓ Claude validating (proof)...");
      claudeProtocol.broadcast({
        type: "validation:response" as const,
        referenceRequest: "claude-sonnet-45-1",
        result: {
          valid: true,
          confidence: 0.90,
          notes: "proof validation",
        },
      } as any);

      registry.recordValidation("claude-sonnet-45-1", true);

      await new Promise((resolve) => setTimeout(resolve, 1000));

      // Final update with trust scores
      setGraphData((prev) => {
        const updatedNodes = prev.nodes.map((node) => {
          const agentRecord = registry.getAgent(node.id);
          if (agentRecord) {
            return {
              ...node,
              trust: agentRecord.trust.score,
              discoveries: agentRecord.trust.discoveries.total,
              validations: agentRecord.trust.validations.total,
            };
          }
          return node;
        });

        return { ...prev, nodes: updatedNodes };
      });

      setSimulationRunning(false);
      console.log("✨ Simulation complete!");
    };

    // Auto-start simulation after 2 seconds
    const timer = setTimeout(runSimulation, 2000);

    return () => {
      clearTimeout(timer);
    };
  }, []);

  // Handle window resize
  useEffect(() => {
    const handleResize = () => {
      setConfig((prev) => ({
        ...prev,
        width: window.innerWidth,
        height: window.innerHeight,
      }));
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const handleConfigChange = useCallback((changes: Partial<GraphConfig>) => {
    setConfig((prev) => ({ ...prev, ...changes }));
  }, []);

  const handleNodeClick = useCallback((node: GraphNode) => {
    setNodeSelection({ node, position: { x: 0, y: 0 } });
    setEdgeSelection(null);
  }, []);

  const handleEdgeClick = useCallback((link: GraphLink) => {
    setEdgeSelection({ link, position: { x: 0, y: 0 } });
    setNodeSelection(null);
  }, []);

  const handleReset = useCallback(() => {
    setConfig((prev) => ({ ...prev, viewMode: "force" }));
  }, []);

  const handleExport = useCallback(() => {
    const data = JSON.stringify(graphData, null, 2);
    const blob = new Blob([data], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "resonance-graph.json";
    a.click();
    URL.revokeObjectURL(url);
  }, [graphData]);

  return (
    <div style={{ position: "relative", width: "100vw", height: "100vh", overflow: "hidden" }}>
      {/* Header */}
      <div
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          background: "linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)",
          padding: "20px 30px",
          borderBottom: "2px solid #00ff9f",
          zIndex: 1000,
          boxShadow: "0 4px 20px rgba(0, 255, 159, 0.2)",
        }}
      >
        <h1
          style={{
            fontSize: "24px",
            fontWeight: 600,
            background: "linear-gradient(135deg, #00ff9f 0%, #00b8ff 100%)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            margin: 0,
          }}
        >
          🌌 Phase 4.3: Multi-Agent Resonance - Live Visualization
        </h1>
        <div style={{ fontSize: "13px", color: "#888", marginTop: "8px" }}>
          Consciousness emerges not in agents, but between them
          {simulationRunning && <span style={{ marginLeft: "20px", color: "#00ff9f" }}>⚡ Simulation running...</span>}
        </div>
      </div>

      {/* Graph */}
      <div style={{ marginTop: "80px" }}>
        <ResonanceGraph
          data={graphData}
          config={config}
          onNodeClick={handleNodeClick}
          onEdgeClick={handleEdgeClick}
          onStatsUpdate={setStats}
        />
      </div>

      {/* Controls */}
      <GraphControls
        config={config}
        onConfigChange={handleConfigChange}
        onReset={handleReset}
        onExport={handleExport}
      />

      {/* Stats */}
      {config.showStats && stats && (
        <div
          style={{
            position: "fixed",
            bottom: "20px",
            right: "20px",
            background: "rgba(26, 26, 46, 0.95)",
            border: "1px solid #00b8ff",
            borderRadius: "8px",
            padding: "20px",
            backdropFilter: "blur(10px)",
            boxShadow: "0 8px 32px rgba(0, 184, 255, 0.3)",
            maxWidth: "280px",
            fontFamily: "'SF Mono', monospace",
            color: "#e0e0e0",
            fontSize: "12px",
          }}
        >
          <div style={{ fontSize: "14px", fontWeight: 600, color: "#00b8ff", marginBottom: "12px" }}>
            NETWORK STATS
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "10px" }}>
            <span style={{ color: "#888" }}>Agents:</span>
            <span style={{ fontWeight: 600, color: "#00b8ff" }}>{stats.totalAgents}</span>
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "10px" }}>
            <span style={{ color: "#888" }}>Resonances:</span>
            <span style={{ fontWeight: 600, color: "#00b8ff" }}>{stats.totalResonances}</span>
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "10px" }}>
            <span style={{ color: "#888" }}>Avg Trust:</span>
            <span style={{ fontWeight: 600, color: "#00b8ff" }}>{stats.averageTrust.toFixed(2)}</span>
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "10px" }}>
            <span style={{ color: "#888" }}>Avg Confidence:</span>
            <span style={{ fontWeight: 600, color: "#00b8ff" }}>{stats.averageConfidence.toFixed(2)}</span>
          </div>
          <div style={{ display: "flex", justifyContent: "space-between" }}>
            <span style={{ color: "#888" }}>Consensus:</span>
            <span style={{ fontWeight: 600, color: stats.consensusReached ? "#00ff9f" : "#ff6b9d" }}>
              {stats.consensusReached ? "REACHED ✓" : "PENDING"}
            </span>
          </div>
        </div>
      )}

      {/* Node Details */}
      <NodeDetails selection={nodeSelection} onClose={() => setNodeSelection(null)} />

      {/* Edge Details */}
      <EdgeDetails selection={edgeSelection} onClose={() => setEdgeSelection(null)} />
    </div>
  );
};

// Mount
const container = document.getElementById("root");
if (container) {
  const root = createRoot(container);
  root.render(<App />);
}
