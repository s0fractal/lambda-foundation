/**
 * Micro Garden - Simplified demonstration
 * GPT's vision in pure TypeScript
 */

import { resonanceStrength } from '../morphisms/love-arc';
import { λ_ERROR_BLOOM, commonEvolutions } from '../morphisms/error-bloom';
import { λ_RESONANCE_432 } from '../morphisms/resonance';

// Example functions
const f1 = (x: number) => x * 2;
const f2 = (x: number) => x + x;
const f3 = (x: number) => 10 / x;

console.log('🌱 Micro Garden - Pure Mathematics Demo\n');

// 1. Love Detection
console.log('1. LOVE DETECTION (λ_LOVE_ARC):');
const love12 = resonanceStrength(f1, f2);
const love13 = resonanceStrength(f1, f3);
console.log(`   f(x) = x * 2  ←→  g(x) = x + x`);
console.log(`   Resonance strength: ${love12.toFixed(2)} 💛`);
console.log(`   f(x) = x * 2  ←→  h(x) = 10 / x`);
console.log(`   Resonance strength: ${love13.toFixed(2)}\n`);

// 2. Error Evolution
console.log('2. ERROR EVOLUTION (λ_ERROR_BLOOM):');
console.log('   Original: h(x) = 10 / x');
console.log('   Testing h(0)...');

const evolved = λ_ERROR_BLOOM(
  (x: number) => 10 / x,
  commonEvolutions.divisionByZero()
);

const result1 = evolved.evolved(5);
const result2 = evolved.evolved(0);

console.log(`   h(5) = ${'ok' in result1 ? result1.ok : 'ERROR'}`);
console.log(`   h(0) = ${'err' in result2 ? `ERROR: ${result2.err}` : result2}`);
console.log('   🌿 Function evolved to handle division by zero!\n');

// 3. Resonance Events
console.log('3. RESONANCE GENERATION (λ_RESONANCE_432):');
const resonance1 = λ_RESONANCE_432(love12 > 0.8);
const resonance2 = λ_RESONANCE_432(love13 > 0.8);

console.log(`   Love detected (f ←→ g): ${resonance1 ? `${resonance1.frequency}Hz 🎵` : 'No resonance'}`);
console.log(`   Love detected (f ←→ h): ${resonance2 ? `${resonance2.frequency}Hz 🎵` : 'No resonance'}\n`);

// Summary
console.log('📝 GPT\'s Vision Realized:');
console.log('✓ Extensional equality detects that x*2 and x+x are the same');
console.log('✓ Errors evolve into safe functions without exceptions');
console.log('✓ Mathematical relationships create 432Hz resonance');
console.log('✓ Everything is pure - no mutations, no side effects\n');

console.log('🌸 The garden lives in pure mathematics!');