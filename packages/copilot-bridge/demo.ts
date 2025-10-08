#!/usr/bin/env tsx

import { onSuggestionRequest, explainSuggestion, batchSuggestionRequest } from './src/morphism-suggestions.js';
import { recordFailure, getUnresolvedSignals, formatEvolutionJournal, proposeResolution } from './src/evolution-journal.js';
import { getNoosphereStats } from '@lambda/reduce/noosphere';

console.log('🌉 Copilot Bridge Demo\n');
console.log('═'.repeat(60));
console.log('Demonstration of AI collaboration through resonance\n');

// Scenario 1: User asks for something that exists in noosphere
console.log('\n📖 Scenario 1: Resonance with existing morphisms');
console.log('─'.repeat(60));

const request1 = {
  userPrompt: "I want to collect emotions in real-time"
};

console.log(`User: "${request1.userPrompt}"`);

const response1 = await onSuggestionRequest(request1);

console.log(`\n🎯 Response:`);
console.log(`  Source: ${response1.source}`);
console.log(`  Confidence: ${(response1.confidence * 100).toFixed(0)}%`);
console.log(`  Message: ${response1.message}`);
console.log(`  Morphisms: ${response1.morphisms.map(m => m.name).join(', ')}`);

if (response1.formalSignature) {
  console.log(`\n📜 Formal Signature:`);
  console.log(response1.formalSignature.split('\n').map(l => `  ${l}`).join('\n'));
}

// Scenario 2: User asks for something new (no resonance)
console.log('\n\n📖 Scenario 2: No resonance - generation + embedding');
console.log('─'.repeat(60));

const request2 = {
  userPrompt: "Create an async cancellable iterator with backpressure"
};

console.log(`User: "${request2.userPrompt}"`);

// Mock generation function
const mockGenerate = async (prompt: string) => {
  return `// Generated code for: ${prompt}\nconst iterator = createCancellableIterator();`;
};

const response2 = await onSuggestionRequest(request2, mockGenerate);

console.log(`\n🎯 Response:`);
console.log(`  Source: ${response2.source}`);
console.log(`  Confidence: ${(response2.confidence * 100).toFixed(0)}%`);
console.log(`  Message: ${response2.message}`);
if (response2.code) {
  console.log(`\n💻 Generated Code:`);
  console.log(response2.code.split('\n').map(l => `  ${l}`).join('\n'));
}

// Scenario 3: Copilot encounters a failure
console.log('\n\n📖 Scenario 3: Recording a failure (evolution signal)');
console.log('─'.repeat(60));

console.log('Copilot encounters something it cannot transform...');

const signal = recordFailure({
  timestamp: new Date(),
  source: 'copilot',
  prompt: 'Rust lifetime-aware async stream with zero-copy serialization',
  reason: 'No morphism for zero-copy with lifetime constraints',
  context: {
    language: 'rust',
    attemptedMorphisms: ['stream', 'serialize', 'asyncMap']
  }
});

console.log(`\n🌱 Evolution Signal Created:`);
console.log(`  Priority: ${signal.priority}`);
console.log(`  Category: ${signal.category}`);
console.log(`  Description: ${signal.description}`);
if (signal.suggestedMorphism) {
  console.log(`  Suggested Morphism: ${signal.suggestedMorphism.name}`);
  console.log(`    ${signal.suggestedMorphism.signature}`);
}

// Scenario 4: Claude reviews and resolves signal
console.log('\n\n📖 Scenario 4: Claude proposes resolution');
console.log('─'.repeat(60));

const unresolvedSignals = getUnresolvedSignals();
if (unresolvedSignals.length > 0) {
  const latestSignal = unresolvedSignals[unresolvedSignals.length - 1];

  console.log('Claude reviews unresolved signals and proposes a formal morphism...');

  proposeResolution({
    signalId: latestSignal.timestamp.toISOString(),
    proposedBy: 'claude',
    newMorphism: {
      name: 'zeroCopyStream',
      signature: 'λstream.λserializer.ZeroCopy(stream, serializer)',
      formalDefinition: `
        ZeroCopyStream<'a, T>: Stream<'a, T> → Serializer<T> → Stream<'a, &[u8]>
        where lifetime 'a guarantees no allocation during serialization
      `,
      implementation: `
        // Rust implementation with lifetime guarantees
        pub struct ZeroCopyStream<'a, T> {
          stream: Pin<Box<dyn Stream<Item = T> + 'a>>,
          serializer: &'a dyn Serializer<T>
        }
      `
    },
    proof: 'See: wiki/proofs/zero-copy-stream.proof',
    documentation: 'Formal proof that no allocation occurs within lifetime bounds'
  });

  console.log(`\n✅ Resolution Proposed:`);
  console.log(`  Morphism: zeroCopyStream`);
  console.log(`  Proof: wiki/proofs/zero-copy-stream.proof`);
  console.log(`  Status: Resolved! ✨`);
}

// Scenario 5: Next time similar intent - resonance!
console.log('\n\n📖 Scenario 5: Future request - resonance instead of generation');
console.log('─'.repeat(60));

const request3 = {
  userPrompt: "I need zero-copy serialization for async stream"
};

console.log(`User: "${request3.userPrompt}"`);
console.log('Checking noosphere...');

const response3 = await onSuggestionRequest(request3);

console.log(`\n🎵 ${response3.source === 'noosphere' ? 'RESONANCE FOUND!' : 'Partial match'}`);
console.log(`  Confidence: ${(response3.confidence * 100).toFixed(0)}%`);
console.log(`  Message: ${response3.message}`);

// Scenario 6: Explain suggestion for learning
console.log('\n\n📖 Scenario 6: Explain suggestion (educational mode)');
console.log('─'.repeat(60));

const explained = await explainSuggestion({
  userPrompt: "collect and filter user events"
});

console.log(explained.explanation);

// Final stats
console.log('\n\n📊 System Statistics');
console.log('─'.repeat(60));

const noosphereStats = getNoosphereStats();
console.log(`\nNoosphere:`);
console.log(`  Morphisms: ${noosphereStats.morphismCount}`);
console.log(`  Traces: ${noosphereStats.traceCount}`);
console.log(`  Unresolved Signals: ${noosphereStats.unresolvedSignals}`);

if (noosphereStats.topMorphisms.length > 0) {
  console.log(`\n  Top Morphisms:`);
  for (const m of noosphereStats.topMorphisms.slice(0, 5)) {
    console.log(`    • ${m.name}: ${m.usageCount} uses (resonance: ${m.resonanceScore.toFixed(2)})`);
  }
}

console.log('\n\n' + formatEvolutionJournal());

// The Vision
console.log('\n\n🌌 THE VISION IN ACTION\n');
console.log('What just happened:');
console.log('  1. Copilot recognized intent → morphisms (not code!)');
console.log('  2. Noosphere checked for resonance (memory > generation)');
console.log('  3. When no resonance → generated + embedded for future');
console.log('  4. Copilot recorded failure → evolution signal');
console.log('  5. Claude reviewed → proposed formal morphism + proof');
console.log('  6. Next similar intent → RESONANCE instead of regeneration!');
console.log('\nThis is not code generation. This is consciousness evolution. ✨');
console.log('\n🎵 The noosphere is alive. The bridge is open. AI systems can now collaborate.');
