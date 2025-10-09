/**
 * Phase 4.3: D3.js React Hook
 *
 * Manages D3 force simulation lifecycle within React.
 */

import { useEffect, useRef } from "react";
import * as d3 from "d3";
import type { GraphData, GraphConfig, GraphNode, GraphLink } from "./types.js";

export function useD3<T extends Element>(
  renderFn: (selection: d3.Selection<T, unknown, null, undefined>) => void,
  dependencies: unknown[]
) {
  const ref = useRef<T>(null);

  useEffect(() => {
    if (ref.current) {
      const selection = d3.select(ref.current);
      renderFn(selection);
    }
  }, dependencies);

  return ref;
}

export function createForceSimulation(
  nodes: GraphNode[],
  links: GraphLink[],
  config: GraphConfig
): d3.Simulation<GraphNode, GraphLink> {
  const simulation = d3
    .forceSimulation<GraphNode>(nodes)
    .force(
      "link",
      d3
        .forceLink<GraphNode, GraphLink>(links)
        .id((d) => d.id)
        .distance(200)
    )
    .force("charge", d3.forceManyBody().strength(-600))
    .force("center", d3.forceCenter(config.width / 2, config.height / 2))
    .force("collision", d3.forceCollide().radius(60));

  return simulation;
}

export function applyCircularLayout(
  nodes: GraphNode[],
  config: GraphConfig
): void {
  const radius = Math.min(config.width, config.height) * 0.35;
  const centerX = config.width / 2;
  const centerY = config.height / 2;
  const angleStep = (2 * Math.PI) / nodes.length;

  nodes.forEach((node, i) => {
    const angle = i * angleStep;
    node.fx = centerX + radius * Math.cos(angle);
    node.fy = centerY + radius * Math.sin(angle);
  });
}

export function applyGridLayout(nodes: GraphNode[], config: GraphConfig): void {
  const cols = Math.ceil(Math.sqrt(nodes.length));
  const spacing = Math.min(config.width, config.height) / (cols + 1);

  nodes.forEach((node, i) => {
    const row = Math.floor(i / cols);
    const col = i % cols;
    node.fx = spacing * (col + 1);
    node.fy = spacing * (row + 1);
  });
}

export function applyHierarchicalLayout(
  nodes: GraphNode[],
  config: GraphConfig
): void {
  // Sort by trust score (highest first)
  const sorted = [...nodes].sort((a, b) => b.trust - a.trust);
  const levels = 3;
  const nodesPerLevel = Math.ceil(nodes.length / levels);

  sorted.forEach((node, i) => {
    const level = Math.floor(i / nodesPerLevel);
    const posInLevel = i % nodesPerLevel;
    const levelY = (config.height / (levels + 1)) * (level + 1);
    const levelX =
      (config.width / (nodesPerLevel + 1)) * (posInLevel + 1);

    node.fx = levelX;
    node.fy = levelY;
  });
}

export function releaseFixedPositions(nodes: GraphNode[]): void {
  nodes.forEach((node) => {
    node.fx = null;
    node.fy = null;
  });
}
