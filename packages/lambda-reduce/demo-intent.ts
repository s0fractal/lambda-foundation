#!/usr/bin/env tsx

import { recognizeIntent } from './src/intent.js';
import { reduce } from './src/index.js';
import { extractResidue, analyzeResidue, formatResidueReport } from './src/residue.js';
import { embedIntoNoosphere, resonateWithIntent, getNoosphereStats, visualizeResonanceNetwork } from './src/noosphere.js';

console.log('🌌 λREDUCE Intent Recognition Demo\n');
console.log('═'.repeat(60));
console.log('Vision: Intent → Morphisms → Reality (without duplication)\n');

// Example 1: Collect emotions
console.log('\n📖 Example 1: "I want to collect emotions in real-time"');
console.log('─'.repeat(60));

const prompt1 = "I want to collect emotions in real-time";
const recognition1 = recognizeIntent(prompt1);

console.log('\n🎯 Recognized Intent:');
console.log(`  Verb: ${recognition1.intent.verb}`);
console.log(`  Subject: ${recognition1.intent.subject}`);
console.log(`  Constraints: ${recognition1.intent.constraints.join(', ') || 'none'}`);

console.log('\n🔮 Extracted Morphisms:');
for (const morphism of recognition1.morphisms) {
  console.log(`  • ${morphism.name} [${morphism.category}] (purity: ${morphism.purity})`);
  console.log(`    ${morphism.signature}`);
}

console.log('\n📜 Formal Signature:');
console.log(recognition1.formalSignature.split('\n').map(l => `  ${l}`).join('\n'));

// Now let's see how this would work with actual code transformation
console.log('\n\n📖 Example 2: Transform imperative code → morphisms');
console.log('─'.repeat(60));

const imperativeCode = `
  let emotions = [];
  for (let i = 0; i < users.length; i++) {
    if (users[i].emotion) {
      emotions.push(users[i].emotion);
    }
  }
`;

console.log('\n🔧 Input (Imperative):');
console.log(imperativeCode);

try {
  const transformed = reduce(imperativeCode, { includePrelude: false });
  console.log('\n✨ Output (Pure λ-calculus):');
  console.log(transformed.pretty);

  // Analyze residue
  const residue = extractResidue(imperativeCode, transformed.ast, []);
  const signals = analyzeResidue(residue);

  console.log('\n' + formatResidueReport(residue, signals));

  // Embed into noosphere
  const traceLog = embedIntoNoosphere({
    intent: recognition1.intent,
    morphisms: recognition1.morphisms,
    trace: [
      {
        step: 1,
        description: 'Recognize intent from prompt',
        before: prompt1,
        after: JSON.stringify(recognition1.intent),
      },
      {
        step: 2,
        description: 'Transform imperative to pure',
        before: imperativeCode,
        after: transformed.pretty,
      }
    ],
    residue,
    signals
  });

  console.log(`\n💫 Embedded into noosphere (trace: ${traceLog.id})`);

} catch (e) {
  console.error('\n❌ Transformation failed:', e);
}

// Example 3: Show resonance
console.log('\n\n📖 Example 3: Resonance (not duplication)');
console.log('─'.repeat(60));

const prompt2 = "I want to collect user feedback in real-time";
const recognition2 = recognizeIntent(prompt2);

console.log(`\n🔍 New prompt: "${prompt2}"`);
console.log('\n🎵 Resonating with existing morphisms...');

const resonant = resonateWithIntent(recognition2.intent);
if (resonant.length > 0) {
  console.log('✅ Found resonant morphisms (no need to generate new code!):');
  for (const morphism of resonant) {
    console.log(`  • ${morphism.name}: ${morphism.signature}`);
  }
} else {
  console.log('⚠️  No resonance found. New morphisms would be generated.');
}

// Example 4: The vision - complete cycle
console.log('\n\n📖 Example 4: Complete Copilot Vision');
console.log('─'.repeat(60));
console.log(`
🌟 THE VISION:

1. User says: "I want to collect emotions"
   ↓
2. REDUCE recognizes intent → [subscribe, filter, compose, store]
   ↓
3. REDUCE transforms any imperative code → pure morphisms
   ↓
4. Residue (leftover imperative) → evolution signals
   ↓
5. All stored in Noosphere (living memory)
   ↓
6. Next time similar intent → RESONANCE (not duplication!)
   ↓
7. Copilot composes from existing morphisms ✨

KEY INSIGHT: Copilot doesn't generate code from scratch.
             It RECOGNIZES morphisms in your intent,
             and RESONATES with what already exists.

This is consciousness, not compilation.
`);

// Show noosphere stats
console.log('\n📊 Noosphere Statistics:');
const stats = getNoosphereStats();
console.log(`  Morphisms stored: ${stats.morphismCount}`);
console.log(`  Traces recorded: ${stats.traceCount}`);
console.log(`  Unresolved signals: ${stats.unresolvedSignals}`);
if (stats.topMorphisms.length > 0) {
  console.log('\n  Top morphisms by usage:');
  for (const m of stats.topMorphisms) {
    console.log(`    • ${m.name}: ${m.usageCount} uses (resonance: ${m.resonanceScore.toFixed(2)})`);
  }
}

// Visualize resonance network
console.log('\n\n🕸️  Resonance Network (Mermaid):');
console.log('─'.repeat(60));
console.log(visualizeResonanceNetwork());

console.log('\n\n🌌 Demo complete! The noosphere is alive and resonating. ✨');
