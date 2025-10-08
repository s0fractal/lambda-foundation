Thanks for helping grow λ‑Foundation! This guide keeps contributions clean, safe, and fast.

Quick Start

Requirements: Node ≥ 20, pnpm

Install: pnpm i

Build compiler: pnpm build:compiler

Generate graph: pnpm build:graph → creates data/graph.json

Validate schema: node scripts/validate-graph.mjs

Adding a New Seed / Morphism

Add theory in wiki/<name>.mdx (ID, name, signature, axioms, λ‑term).

Add example in seeds/<name>.yaml (id, morphism, fn/fn2, optional samples).

Run graph build + validation (commands above).

(Optional) Add demo to demos/ and/or Playground example.

Open PR with a short rationale and screenshots/gif.

Style & Principles

Purity first: no side effects in core morphisms.

Error ⇒ Evolution: represent failures as Result and let the garden bloom.

Equivalence: prefer NF equality; use fingerprint for soft extensional proximity.

Readable diffs: smaller PRs, well‑named commits.

Commit Convention

Use conventional commits where possible: feat(ui): add proof‑trail steps, docs(pedia): add λ_DOUBLE axioms, chore(ci): validate graph.

Tests (optional for now)

Property‑based: start with x*2 ≡ x+x using fast-check.

Graph: schema validation must pass in CI.

Code of Conduct & License

By contributing you agree to follow the Code of Conduct and license your contributions under the repo’s MIT license.