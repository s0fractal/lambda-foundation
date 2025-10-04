export type Result<T, E = string> = { ok: T } | { err: { code: E; ctx?: unknown } };

export type Fn1 = (x: number) => number;

export interface MorphismDoc {
  id: string;
  name: string;
  signature: string;
  tags?: string[];
  axioms?: string[];
  // В ідеалі: λ-терм/AST/NF
}

export interface SeedSpec {
  id: string;
  morphism: string; // ref → MorphismDoc.id
  fn?: string;      // унарна функція як джерельний рядок
  fn2?: string;     // приклад розширення (бінарна), на майбутнє
  samples?: number[];
}

export type LoveStrength = "HARD_ISO" | "SOFT_EXT";

export interface GraphNode {
  id: string;            // seed id або morphism id
  kind: "SEED" | "MORPHISM";
  label: string;
  nf?: string;           // нормалізована форма (рядок)
  fingerprint?: string;  // екстенсіональний відбиток
}

export interface GraphEdge {
  from: string;
  to: string;
  type: "LOVE_ARC" | "EVOLVES_FROM" | "COMPOSES" | "DUAL" | "ADJOINT";
  strength?: LoveStrength;
}

export interface GraphData {
  nodes: GraphNode[];
  edges: GraphEdge[];
}