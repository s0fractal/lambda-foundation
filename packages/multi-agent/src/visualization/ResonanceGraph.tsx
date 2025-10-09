/**
 * Phase 4.3: Resonance Graph Component
 *
 * Interactive D3.js force-directed graph for multi-agent resonance visualization.
 * Real-time updates, draggable nodes, and detailed inspections.
 */

import React, { useEffect, useRef, useState, useCallback } from "react";
import * as d3 from "d3";
import type {
  GraphData,
  GraphConfig,
  GraphNode,
  GraphLink,
  NodeSelection,
  EdgeSelection,
  GraphStats,
} from "./types.js";
import {
  createForceSimulation,
  applyCircularLayout,
  applyGridLayout,
  applyHierarchicalLayout,
  releaseFixedPositions,
} from "./useD3.js";

export interface ResonanceGraphProps {
  data: GraphData;
  config: GraphConfig;
  onNodeClick?: (node: GraphNode) => void;
  onEdgeClick?: (link: GraphLink) => void;
  onStatsUpdate?: (stats: GraphStats) => void;
}

export const ResonanceGraph: React.FC<ResonanceGraphProps> = ({
  data,
  config,
  onNodeClick,
  onEdgeClick,
  onStatsUpdate,
}) => {
  const svgRef = useRef<SVGSVGElement>(null);
  const simulationRef = useRef<d3.Simulation<GraphNode, GraphLink> | null>(
    null
  );
  const [particlesEnabled, setParticlesEnabled] = useState(config.showParticles);

  // Calculate stats
  useEffect(() => {
    if (onStatsUpdate && data.nodes.length > 0) {
      const stats: GraphStats = {
        totalAgents: data.nodes.length,
        totalResonances: data.links.length,
        averageTrust:
          data.nodes.reduce((sum, n) => sum + n.trust, 0) / data.nodes.length,
        averageConfidence:
          data.links.length > 0
            ? data.links.reduce((sum, l) => sum + l.confidence, 0) /
              data.links.length
            : 0,
        consensusReached:
          data.links.length >= 3 &&
          data.links.reduce((sum, l) => sum + l.confidence, 0) /
            data.links.length >=
            0.8,
      };
      onStatsUpdate(stats);
    }
  }, [data, onStatsUpdate]);

  // Initialize and update D3 visualization
  useEffect(() => {
    if (!svgRef.current || data.nodes.length === 0) return;

    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove();

    const width = config.width;
    const height = config.height;

    // Create groups
    const g = svg.append("g").attr("class", "graph-container");

    const linkGroup = g.append("g").attr("class", "links");
    const nodeGroup = g.append("g").attr("class", "nodes");
    const labelGroup = g.append("g").attr("class", "labels");

    // Define arrow markers
    const defs = svg.append("defs");
    ["discovery", "validation", "resonance", "proposal"].forEach((type) => {
      defs
        .append("marker")
        .attr("id", `arrow-${type}`)
        .attr("viewBox", "0 -5 10 10")
        .attr("refX", 35)
        .attr("refY", 0)
        .attr("markerWidth", 6)
        .attr("markerHeight", 6)
        .attr("orient", "auto")
        .append("path")
        .attr("d", "M0,-5L10,0L0,5")
        .attr("fill", "#fff")
        .attr("opacity", 0.6);
    });

    // Create force simulation
    const simulation = createForceSimulation(
      data.nodes,
      data.links,
      config
    );
    simulationRef.current = simulation;

    // Apply layout based on view mode
    if (config.viewMode === "circular") {
      applyCircularLayout(data.nodes, config);
      simulation.alpha(0.3).restart();
    } else if (config.viewMode === "grid") {
      applyGridLayout(data.nodes, config);
      simulation.alpha(0.3).restart();
    } else if (config.viewMode === "hierarchical") {
      applyHierarchicalLayout(data.nodes, config);
      simulation.alpha(0.3).restart();
    } else {
      releaseFixedPositions(data.nodes);
      simulation.alpha(1).restart();
    }

    // Draw links
    const link = linkGroup
      .selectAll<SVGLineElement, GraphLink>("line")
      .data(data.links)
      .join("line")
      .attr("class", "resonance-edge")
      .attr("stroke", "#fff")
      .attr("stroke-width", (d) => d.confidence * 5)
      .attr("stroke-opacity", (d) => d.confidence * 0.7)
      .attr("marker-end", (d) => `url(#arrow-${d.type})`)
      .style("cursor", "pointer")
      .on("click", (event, d) => {
        event.stopPropagation();
        onEdgeClick?.(d);
      });

    // Draw nodes
    const node = nodeGroup
      .selectAll<SVGCircleElement, GraphNode>("circle")
      .data(data.nodes)
      .join("circle")
      .attr("r", (d) => 15 + d.trust * 25)
      .attr("fill", (d) => d.color)
      .attr("opacity", 0.85)
      .style("cursor", "pointer")
      .call(
        d3
          .drag<SVGCircleElement, GraphNode>()
          .on("start", (event, d) => {
            if (!event.active) simulation.alphaTarget(0.3).restart();
            d.fx = d.x;
            d.fy = d.y;
          })
          .on("drag", (event, d) => {
            d.fx = event.x;
            d.fy = event.y;
          })
          .on("end", (event, d) => {
            if (!event.active) simulation.alphaTarget(0);
            if (!config.autoLayout) {
              d.fx = null;
              d.fy = null;
            }
          })
      )
      .on("click", (event, d) => {
        event.stopPropagation();
        onNodeClick?.(d);
      })
      .on("mouseover", function (event, d) {
        d3.select(this)
          .transition()
          .duration(200)
          .attr("r", 15 + d.trust * 30)
          .attr("opacity", 1);
      })
      .on("mouseout", function (event, d) {
        d3.select(this)
          .transition()
          .duration(200)
          .attr("r", 15 + d.trust * 25)
          .attr("opacity", 0.85);
      });

    // Draw labels
    let labels: d3.Selection<
      SVGTextElement,
      GraphNode,
      SVGGElement,
      unknown
    > | null = null;

    if (config.showLabels) {
      labels = labelGroup
        .selectAll<SVGTextElement, GraphNode>("text")
        .data(data.nodes)
        .join("text")
        .attr("class", "agent-label")
        .attr("text-anchor", "middle")
        .attr("dy", -35)
        .style("fill", (d) => d.color)
        .style("font-size", "14px")
        .style("font-weight", "600")
        .style("pointer-events", "none")
        .text((d) => d.name);
    }

    // Particle animation
    let particleInterval: NodeJS.Timeout | null = null;

    if (config.showParticles) {
      particleInterval = setInterval(() => {
        data.links.forEach((linkData) => {
          if (Math.random() > 0.7) {
            const source = linkData.source as GraphNode;
            const target = linkData.target as GraphNode;

            if (source.x && source.y && target.x && target.y) {
              const particle = g
                .append("circle")
                .attr("r", 3)
                .attr("fill", "#00ff9f")
                .attr("opacity", 0.8)
                .attr("cx", source.x)
                .attr("cy", source.y);

              particle
                .transition()
                .duration(2000)
                .ease(d3.easeLinear)
                .attr("cx", target.x)
                .attr("cy", target.y)
                .attr("opacity", 0)
                .remove();
            }
          }
        });
      }, 500);
    }

    // Update positions on tick
    simulation.on("tick", () => {
      link
        .attr("x1", (d) => (d.source as GraphNode).x || 0)
        .attr("y1", (d) => (d.source as GraphNode).y || 0)
        .attr("x2", (d) => (d.target as GraphNode).x || 0)
        .attr("y2", (d) => (d.target as GraphNode).y || 0);

      node
        .attr("cx", (d) => d.x || 0)
        .attr("cy", (d) => d.y || 0);

      if (labels) {
        labels
          .attr("x", (d) => d.x || 0)
          .attr("y", (d) => d.y || 0);
      }
    });

    // Add zoom behavior
    const zoom = d3
      .zoom<SVGSVGElement, unknown>()
      .scaleExtent([0.1, 4])
      .on("zoom", (event) => {
        g.attr("transform", event.transform);
      });

    svg.call(zoom);

    // Cleanup
    return () => {
      simulation.stop();
      if (particleInterval) clearInterval(particleInterval);
    };
  }, [data, config, onNodeClick, onEdgeClick]);

  return (
    <svg
      ref={svgRef}
      width={config.width}
      height={config.height}
      style={{
        background: "radial-gradient(ellipse at center, #0f0f1e 0%, #0a0a0a 100%)",
        cursor: "grab",
      }}
    />
  );
};
