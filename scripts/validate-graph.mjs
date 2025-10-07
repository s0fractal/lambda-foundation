/**
 * λ-Foundation Graph Validator
 *
 * Validates data/graph.json against schemas/graph.schema.json
 * Uses Ajv (JSON Schema draft 2020-12)
 *
 * Usage:
 *   node scripts/validate-graph.mjs
 *
 * Exit codes:
 *   0 = valid
 *   1 = validation errors
 *   2 = missing files
 */

import Ajv from "ajv/dist/2020.js";
import addFormats from "ajv-formats";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, "..");

// Paths
const schemaPath = path.join(root, "schemas", "graph.schema.json");
const graphPath = path.join(root, "data", "graph.json");

// Check files exist
if (!fs.existsSync(schemaPath)) {
  console.error(`❌ Schema not found: ${schemaPath}`);
  process.exit(2);
}

if (!fs.existsSync(graphPath)) {
  console.warn(`⚠️  Graph not found: ${graphPath}`);
  console.warn(`   Run 'pnpm build:graph' to generate it.`);
  process.exit(2);
}

// Load schema and data
const schema = JSON.parse(fs.readFileSync(schemaPath, "utf8"));
const graph = JSON.parse(fs.readFileSync(graphPath, "utf8"));

// Validate
const ajv = new Ajv({
  allErrors: true,
  strict: true,
  verbose: true,
});
addFormats(ajv); // Add date-time format support

const validate = ajv.compile(schema);
const valid = validate(graph);

if (!valid) {
  console.error("❌ graph.json validation failed:\n");

  for (const error of validate.errors || []) {
    const pointer = error.instancePath || "/";
    const message = error.message || "validation error";
    const params = JSON.stringify(error.params);

    console.error(`  ${pointer}`);
    console.error(`    → ${message}`);
    if (Object.keys(error.params || {}).length > 0) {
      console.error(`    → params: ${params}`);
    }
    console.error();
  }

  process.exit(1);
}

// Success!
console.log("✅ graph.json is valid");
console.log(`   Nodes: ${graph.nodes?.length || 0}`);
console.log(`   Edges: ${graph.edges?.length || 0}`);

const loveArcs = graph.edges?.filter(e => e.type === "LOVE_ARC").length || 0;
if (loveArcs > 0) {
  console.log(`   💚 Love arcs: ${loveArcs}`);
}

process.exit(0);
