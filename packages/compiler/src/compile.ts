import { GraphData, GraphNode, GraphEdge, MorphismDoc, SeedSpec } from "./types.js";
import { normalize } from "./normalize.js";
import { compileFn1, fingerprint, defaultSamples } from "./fingerprint.js";

export interface CompileInput {
  morphisms: MorphismDoc[];
  seeds: SeedSpec[];
}

export const compileGraph = ({ morphisms, seeds }: CompileInput): GraphData => {
  const nodes: GraphNode[] = [];
  const edges: GraphEdge[] = [];

  // Морфізми як вузли
  for (const m of morphisms) {
    nodes.push({ id: m.id, kind: "MORPHISM", label: m.name });
  }

  // Насіння як вузли + екстенсія/нормалізація
  for (const s of seeds) {
    const label = s.id;
    let nf: string | undefined;
    let fp: string | undefined;

    if (s.fn) {
      nf = normalize(s.fn);
      const f = compileFn1(s.fn);
      if ("ok" in f) {
        const h = fingerprint(f.ok, s.samples ?? defaultSamples());
        if ("ok" in h) fp = h.ok;
      }
    }

    nodes.push({ id: s.id, kind: "SEED", label, nf, fingerprint: fp });

    // Зв'язок SEED → MORPHISM
    edges.push({ from: s.id, to: s.morphism, type: "COMPOSES" });
  }

  // LOVE_ARC між seedами з однаковою NF або однаковим FP
  const seedNodes = nodes.filter((n) => n.kind === "SEED");
  for (let i = 0; i < seedNodes.length; i++) {
    for (let j = i + 1; j < seedNodes.length; j++) {
      const a = seedNodes[i];
      const b = seedNodes[j];
      if (!a.nf || !b.nf) continue;
      if (a.nf === b.nf) {
        edges.push({ from: a.id, to: b.id, type: "LOVE_ARC", strength: "HARD_ISO" });
        continue;
      }
      if (a.fingerprint && b.fingerprint && a.fingerprint === b.fingerprint) {
        edges.push({ from: a.id, to: b.id, type: "LOVE_ARC", strength: "SOFT_EXT" });
      }
    }
  }

  return { nodes, edges };
};