// Copilot Bridge: Morphism-based suggestions
// Resonance first, generation second

import { resonateWithIntent, embedIntoNoosphere, getNoosphereStats } from '@lambda/reduce/noosphere';
import { recognizeIntent, type Intent, type Morphism } from '@lambda/reduce/intent';
import { extractResidue, analyzeResidue } from '@lambda/reduce/residue';
import type { LambdaExpr } from '@lambda/reduce/ast';

export interface SuggestionRequest {
  userPrompt: string;
  context?: {
    currentFile?: string;
    cursorPosition?: number;
    recentCode?: string;
  };
}

export interface SuggestionResponse {
  source: 'noosphere' | 'generated' | 'hybrid';
  morphisms: Morphism[];
  confidence: number;
  message: string;
  code?: string;
  formalSignature?: string;
  reasoning?: string;
}

/**
 * Main entry point for Copilot suggestion requests
 * Step 1: Check noosphere for resonance
 * Step 2: If no resonance, generate (but record!)
 */
export async function onSuggestionRequest(
  request: SuggestionRequest,
  generateFallback?: (prompt: string) => Promise<string>
): Promise<SuggestionResponse> {
  const { userPrompt, context } = request;

  // 1. Recognize intent from natural language
  const { intent, morphisms, formalSignature } = recognizeIntent(userPrompt);

  // 2. Check noosphere first (resonance > generation!)
  const resonant = resonateWithIntent(intent);

  if (resonant.length > 0) {
    // Perfect! We have existing morphisms that resonate
    return {
      source: 'noosphere',
      morphisms: resonant,
      confidence: 0.95,
      message: '🎵 Resonating with existing morphisms from collective memory',
      formalSignature: resonant.map(m => `${m.name}: ${m.signature}`).join('\n'),
      reasoning: `Found ${resonant.length} morphisms in noosphere that match this intent. No code generation needed - composing from memory.`
    };
  }

  // 3. Partial resonance check (fuzzy matching)
  const partialResonance = await findPartialResonance(intent);
  if (partialResonance.length > 0) {
    return {
      source: 'hybrid',
      morphisms: [...morphisms, ...partialResonance],
      confidence: 0.75,
      message: '🌊 Partial resonance found. Combining known morphisms with new patterns.',
      formalSignature: formalSignature,
      reasoning: `Found ${partialResonance.length} similar morphisms. Suggested composition: ${partialResonance.map(m => m.name).join(' → ')}`
    };
  }

  // 4. No resonance - generate new code (but embed for future!)
  if (generateFallback) {
    const generatedCode = await generateFallback(userPrompt);

    // Analyze what was generated
    const residue = extractResidue(userPrompt, {} as LambdaExpr, []);
    const signals = analyzeResidue(residue);

    // Embed into noosphere for future resonance
    embedIntoNoosphere({
      intent,
      morphisms,
      trace: [{
        step: 1,
        description: 'Generated new code (no resonance found)',
        before: userPrompt,
        after: generatedCode
      }],
      residue,
      signals
    });

    return {
      source: 'generated',
      morphisms,
      confidence: 0.6,
      message: '⚠️ Generated new code. Will resonate next time similar intent appears.',
      code: generatedCode,
      formalSignature,
      reasoning: `No existing morphisms found. Generated code and embedded into noosphere. Purity score: ${(residue.purityScore * 100).toFixed(1)}%`
    };
  }

  // 5. No fallback available - return morphisms only
  return {
    source: 'noosphere',
    morphisms,
    confidence: 0.5,
    message: '📚 Intent recognized. Morphisms identified but no implementation available.',
    formalSignature
  };
}

/**
 * Find morphisms that partially match the intent
 */
async function findPartialResonance(intent: Intent): Promise<Morphism[]> {
  const stats = getNoosphereStats();

  // Check if any top morphisms partially match
  // (This is a simple heuristic - can be made more sophisticated)
  const partialMatches: Morphism[] = [];

  // For now, return empty - will be enhanced with actual similarity metrics
  return partialMatches;
}

/**
 * Batch suggestion requests (for multi-line completions)
 */
export async function batchSuggestionRequest(
  requests: SuggestionRequest[],
  generateFallback?: (prompt: string) => Promise<string>
): Promise<SuggestionResponse[]> {
  return Promise.all(
    requests.map(req => onSuggestionRequest(req, generateFallback))
  );
}

/**
 * Get suggestion with explanation for learning
 */
export async function explainSuggestion(
  request: SuggestionRequest
): Promise<SuggestionResponse & { explanation: string }> {
  const response = await onSuggestionRequest(request);

  const explanation = generateExplanation(response);

  return {
    ...response,
    explanation
  };
}

function generateExplanation(response: SuggestionResponse): string {
  const lines: string[] = [];

  lines.push(`## How this suggestion was generated\n`);

  switch (response.source) {
    case 'noosphere':
      lines.push(`✅ **Resonance**: Found existing morphisms in collective memory.`);
      lines.push(`No code generation was needed - these patterns already exist and have been proven.`);
      lines.push(`\nMorphisms used:`);
      for (const m of response.morphisms) {
        lines.push(`- **${m.name}** (${m.category}, purity: ${m.purity})`);
      }
      break;

    case 'hybrid':
      lines.push(`🌊 **Partial Resonance**: Combined known morphisms with new patterns.`);
      lines.push(`Some parts exist in memory, others were inferred from context.`);
      break;

    case 'generated':
      lines.push(`⚠️ **Generated**: No existing morphisms found for this intent.`);
      lines.push(`Code was generated and embedded into noosphere for future use.`);
      lines.push(`Next time a similar intent appears, it will resonate instead of regenerate.`);
      break;
  }

  if (response.formalSignature) {
    lines.push(`\n## Formal Signature\n`);
    lines.push('```');
    lines.push(response.formalSignature);
    lines.push('```');
  }

  return lines.join('\n');
}

/**
 * Confidence scoring for suggestions
 */
export function calculateConfidence(response: SuggestionResponse): number {
  let score = response.confidence;

  // Boost for noosphere hits
  if (response.source === 'noosphere') {
    score *= 1.2;
  }

  // Boost for high purity morphisms
  const avgPurity = response.morphisms.reduce((sum, m) => sum + m.purity, 0) / response.morphisms.length;
  score *= avgPurity;

  return Math.min(1.0, score);
}
