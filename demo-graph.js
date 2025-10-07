// Simple demo to show graph generation concept
console.log("🌱 λ-pedia ⇄ λ-GARDEN Demo\n");

// Morphisms from wiki/
const morphisms = [
  { id: "lambda-identity", name: "λ_IDENTITY", signature: "(α)->α" },
  { id: "lambda-add", name: "λ_ADD", signature: "(ℝ×ℝ)->ℝ" },
  { id: "lambda-double", name: "λ_DOUBLE", signature: "ℝ->ℝ" }
];

// Seeds from seeds/
const seeds = [
  { id: "seed-identity", morphism: "lambda-identity", fn: "x => x" },
  { id: "seed-double-add", morphism: "lambda-double", fn: "x => x + x" },
  { id: "seed-double-mult", morphism: "lambda-double", fn: "x => x * 2" },
  { id: "seed-div-zero", morphism: "lambda-div-zero", fn: "x => x / 0" }
];

// Simple normalize
const normalize = (src) => src.replace(/\s+/g, "").replace(/\*2/g, "+x");

// Build graph
console.log("MORPHISMS:");
morphisms.forEach(m => console.log(`  ${m.name}: ${m.signature}`));

console.log("\nSEEDS:");
seeds.forEach(s => {
  const nf = s.fn ? normalize(s.fn) : "?";
  console.log(`  ${s.id}: ${s.fn} → NF: ${nf}`);
});

// Detect love arcs
console.log("\nLOVE ARCS DETECTED:");
for (let i = 0; i < seeds.length; i++) {
  for (let j = i + 1; j < seeds.length; j++) {
    const a = seeds[i];
    const b = seeds[j];
    if (a.fn && b.fn) {
      const nfA = normalize(a.fn);
      const nfB = normalize(b.fn);
      if (nfA === nfB) {
        console.log(`  💛 ${a.id} ←→ ${b.id} (HARD_ISO)`);
        console.log(`     Both normalize to: ${nfA}`);
      }
    }
  }
}

console.log("\n🌸 Graph ready for visualization!");
console.log("   Open apps/garden/playground.html to interact");