import type { GraphNode } from "@lambda/compiler";

export type LoveArc = { from: string; to: string; strength: "HARD_ISO" | "SOFT_EXT" } | null;

export const loveArcDetect = (a: GraphNode, b: GraphNode): LoveArc => {
  if (a.nf && b.nf && a.nf === b.nf) return { from: a.id, to: b.id, strength: "HARD_ISO" };
  if (a.fingerprint && b.fingerprint && a.fingerprint === b.fingerprint)
    return { from: a.id, to: b.id, strength: "SOFT_EXT" };
  return null;
};