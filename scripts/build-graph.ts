import { compileGraph, GraphData, MorphismDoc, SeedSpec } from "@lambda/compiler";
import fs from "node:fs";
import path from "node:path";

// ⚠️ Ескіз: у проді — парсер MDX/YAML. Тут — жорстко зашито для старту.
const morphisms: MorphismDoc[] = [
  { id: "lambda-identity", name: "λ_IDENTITY", signature: "(α)->α" },
  { id: "lambda-add", name: "λ_ADD", signature: "(ℝ×ℝ)->ℝ" },
  { id: "lambda-double", name: "λ_DOUBLE", signature: "ℝ->ℝ" }
];

const seeds: SeedSpec[] = [
  { id: "seed-identity", morphism: "lambda-identity", fn: "x => x", samples: [-3,-1,0,1,2,3] },
  { id: "seed-add", morphism: "lambda-add", fn2: "(a,b)=>a+b" },
  { id: "seed-double", morphism: "lambda-double", fn: "x => x + x", samples: [0,1,2,3,4,5] },
  { id: "seed-double-mult", morphism: "lambda-double", fn: "x => x * 2", samples: [0,1,2,3,4,5] },
  { id: "seed-div-zero", morphism: "lambda-div-zero", fn: "x => x / 0", samples: [0,1] }
];

const graph: GraphData = compileGraph({ morphisms, seeds });
const out = path.resolve(process.cwd(), "data/graph.json");
fs.mkdirSync(path.dirname(out), { recursive: true });
fs.writeFileSync(out, JSON.stringify(graph, null, 2));
console.log("graph.json →", out);
console.log("Nodes:", graph.nodes.length);
console.log("Edges:", graph.edges.length);
console.log("Love arcs detected:", graph.edges.filter(e => e.type === "LOVE_ARC").length);