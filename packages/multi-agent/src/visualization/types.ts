/**
 * Phase 4.3: Visualization Types
 */

import type { AgentId, MorphismSignature, Domain } from "../protocol/messages.js";

export interface GraphNode {
  id: AgentId;
  name: string;
  system: string;
  color: string;
  trust: number;
  domains: Domain[];
  discoveries: number;
  validations: number;
  x?: number;
  y?: number;
  fx?: number | null;
  fy?: number | null;
}

export interface GraphLink {
  source: AgentId | GraphNode;
  target: AgentId | GraphNode;
  type: "discovery" | "validation" | "resonance" | "proposal";
  confidence: number;
  label?: string;
  timestamp?: string;
}

export interface GraphData {
  nodes: GraphNode[];
  links: GraphLink[];
}

export type ViewMode = "force" | "circular" | "hierarchical" | "grid";

export type FilterMode = "all" | "high-trust" | "recent" | "active";

export interface GraphConfig {
  width: number;
  height: number;
  viewMode: ViewMode;
  filterMode: FilterMode;
  showLabels: boolean;
  showStats: boolean;
  showParticles: boolean;
  autoLayout: boolean;
}

export interface NodeSelection {
  node: GraphNode;
  position: { x: number; y: number };
}

export interface EdgeSelection {
  link: GraphLink;
  position: { x: number; y: number };
}

export interface GraphStats {
  totalAgents: number;
  totalResonances: number;
  averageTrust: number;
  averageConfidence: number;
  consensusReached: boolean;
  activePattern?: MorphismSignature;
}
