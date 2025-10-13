/**
 * λ_SYNTHESIS: Composition Search
 *
 * How VOID searches the Library to satisfy Intents.
 * This is the corpus callosum - connecting left and right hemispheres.
 *
 * Strategy: Vector embeddings + semantic search + composition generation
 */

import type { Intent } from '../intents/Intent';

/**
 * Morphism metadata for search
 * (Later: import from @lambda-foundation/core)
 */
export interface MorphismMetadata {
  id: string;
  name: string;
  description: string;
  input: string;
  output: string;
  tags: string[];
  complexity: string;
  usageCount: number;
  confidence: number;

  // For semantic search
  embedding?: number[];
}

/**
 * Composition candidate - potential solution
 */
export interface CompositionCandidate {
  morphisms: string[];           // IDs of morphisms to compose
  confidence: number;             // 0-100
  explanation: string;            // Why this composition works
  estimatedComplexity: string;   // Combined complexity
  requiresEvolution: boolean;     // If true, need to evolve new morphism
}

/**
 * Search result
 */
export interface CompositionSearchResult {
  intent: Intent;
  candidates: CompositionCandidate[];
  searchTime: number;
  strategy: 'exact' | 'semantic' | 'composition' | 'evolution';
}

/**
 * The Composition Search Engine
 * This is where magic happens - connecting desires to reality
 */
export class CompositionSearch {
  private library: Map<string, MorphismMetadata> = new Map();

  /**
   * Add morphism to searchable library
   */
  addMorphism(morphism: MorphismMetadata): void {
    this.library.set(morphism.id, morphism);
  }

  /**
   * Search for morphisms that can satisfy the intent
   */
  async search(intent: Intent): Promise<CompositionSearchResult> {
    const startTime = performance.now();
    const candidates: CompositionCandidate[] = [];

    // Strategy 1: Exact match (single morphism)
    const exactMatch = this.findExactMatch(intent);
    if (exactMatch) {
      candidates.push({
        morphisms: [exactMatch.id],
        confidence: 95,
        explanation: `Direct match: ${exactMatch.name} does exactly what you need`,
        estimatedComplexity: exactMatch.complexity,
        requiresEvolution: false
      });
    }

    // Strategy 2: Semantic search (similar morphisms)
    const semanticMatches = this.findSemanticMatches(intent);
    candidates.push(...semanticMatches);

    // Strategy 3: Composition (combine multiple)
    const compositions = this.findCompositions(intent);
    candidates.push(...compositions);

    // Strategy 4: Evolution needed (no good match)
    if (candidates.length === 0 || candidates.every(c => c.confidence < 50)) {
      candidates.push({
        morphisms: [],
        confidence: 30,
        explanation: 'No good match found. Need to evolve new morphism.',
        estimatedComplexity: 'Unknown',
        requiresEvolution: true
      });
    }

    // Sort by confidence
    candidates.sort((a, b) => b.confidence - a.confidence);

    return {
      intent,
      candidates: candidates.slice(0, 5), // Top 5
      searchTime: performance.now() - startTime,
      strategy: this.determineStrategy(candidates)
    };
  }

  /**
   * Find exact match by tags/type
   */
  private findExactMatch(intent: Intent): MorphismMetadata | null {
    for (const morphism of this.library.values()) {
      // Check if tags overlap
      const tagOverlap = intent.tags?.some(tag =>
        morphism.tags.includes(tag)
      );

      // Check if types match
      const typeMatch =
        (!intent.inputType || morphism.input === intent.inputType) &&
        (!intent.outputType || morphism.output === intent.outputType);

      if (tagOverlap && typeMatch) {
        return morphism;
      }
    }
    return null;
  }

  /**
   * Find semantically similar morphisms
   * For MVP: use keyword matching
   * TODO: Implement vector embeddings
   */
  private findSemanticMatches(intent: Intent): CompositionCandidate[] {
    const candidates: CompositionCandidate[] = [];
    const keywords = this.extractKeywords(intent.description);

    for (const morphism of this.library.values()) {
      let score = 0;
      const morphismText = `${morphism.name} ${morphism.description} ${morphism.tags.join(' ')}`.toLowerCase();

      // Simple keyword matching (MVP)
      for (const keyword of keywords) {
        if (morphismText.includes(keyword)) {
          score += 10;
        }
      }

      if (score > 20) {
        candidates.push({
          morphisms: [morphism.id],
          confidence: Math.min(score, 80),
          explanation: `${morphism.name} matches keywords: ${keywords.slice(0, 3).join(', ')}`,
          estimatedComplexity: morphism.complexity,
          requiresEvolution: false
        });
      }
    }

    return candidates;
  }

  /**
   * Find compositions of multiple morphisms
   * For MVP: simple sequential composition
   * TODO: Implement genetic algorithm for complex compositions
   */
  private findCompositions(intent: Intent): CompositionCandidate[] {
    const candidates: CompositionCandidate[] = [];

    // Try 2-morphism compositions
    const morphisms = Array.from(this.library.values());
    for (let i = 0; i < morphisms.length; i++) {
      for (let j = 0; j < morphisms.length; j++) {
        if (i === j) continue;

        const m1 = morphisms[i];
        const m2 = morphisms[j];

        // Check if output of m1 matches input of m2
        if (m1.output === m2.input) {
          const confidence = Math.min(m1.confidence, m2.confidence) * 0.8;

          if (confidence > 40) {
            candidates.push({
              morphisms: [m1.id, m2.id],
              confidence,
              explanation: `Compose ${m1.name} → ${m2.name}`,
              estimatedComplexity: this.combineComplexity(m1.complexity, m2.complexity),
              requiresEvolution: false
            });
          }
        }
      }
    }

    return candidates;
  }

  /**
   * Extract keywords from text
   */
  private extractKeywords(text: string): string[] {
    return text
      .toLowerCase()
      .split(/\s+/)
      .filter(word => word.length > 3)
      .filter(word => !['that', 'this', 'with', 'from', 'have'].includes(word));
  }

  /**
   * Combine complexity estimates
   */
  private combineComplexity(c1: string, c2: string): string {
    // Simple heuristic
    if (c1.includes('n²') || c2.includes('n²')) return 'O(n²)';
    if (c1.includes('n log n') || c2.includes('n log n')) return 'O(n log n)';
    return 'O(n)';
  }

  /**
   * Determine which strategy worked best
   */
  private determineStrategy(candidates: CompositionCandidate[]): CompositionSearchResult['strategy'] {
    if (candidates.length === 0) return 'evolution';
    const best = candidates[0];
    if (best.requiresEvolution) return 'evolution';
    if (best.morphisms.length === 1 && best.confidence > 90) return 'exact';
    if (best.morphisms.length === 1) return 'semantic';
    return 'composition';
  }

  /**
   * Get library stats
   */
  getStats() {
    return {
      totalMorphisms: this.library.size,
      categories: this.getCategoryCounts()
    };
  }

  private getCategoryCounts() {
    const counts: Record<string, number> = {};
    for (const morphism of this.library.values()) {
      for (const tag of morphism.tags) {
        counts[tag] = (counts[tag] || 0) + 1;
      }
    }
    return counts;
  }
}

/**
 * Create search engine with existing morphisms
 */
export function createSearchEngine(): CompositionSearch {
  const search = new CompositionSearch();

  // Add existing proven morphisms
  const morphisms: MorphismMetadata[] = [
    {
      id: 'subscribe',
      name: 'subscribe',
      description: 'Create observable from data source',
      input: 'DataSource<T>',
      output: 'Observable<T>',
      tags: ['observable', 'source', 'reactive'],
      complexity: 'O(1)',
      usageCount: 14,
      confidence: 100
    },
    {
      id: 'filter',
      name: 'filter',
      description: 'Keep only elements matching predicate',
      input: 'Observable<T>',
      output: 'Observable<T>',
      tags: ['filter', 'predicate', 'transform'],
      complexity: 'O(n)',
      usageCount: 10,
      confidence: 100
    },
    {
      id: 'map',
      name: 'map',
      description: 'Transform each element',
      input: 'Observable<A>',
      output: 'Observable<B>',
      tags: ['transform', 'map', 'functor'],
      complexity: 'O(n)',
      usageCount: 12,
      confidence: 100
    },
    {
      id: 'filterByEmotion',
      name: 'filterByEmotion',
      description: 'Filter events by emotional state',
      input: 'Observable<Event>',
      output: 'Observable<Event>',
      tags: ['filter', 'emotion', 'sentiment', 'joy', 'sadness'],
      complexity: 'O(n)',
      usageCount: 6,
      confidence: 93
    },
    {
      id: 'analyzeSentimentDelta',
      name: 'analyzeSentimentDelta',
      description: 'Analyze sentiment changes over time',
      input: 'Observable<Event[]>',
      output: 'Observable<SentimentDelta>',
      tags: ['sentiment', 'analysis', 'delta', 'statistics'],
      complexity: 'O(n)',
      usageCount: 4,
      confidence: 91
    }
  ];

  morphisms.forEach(m => search.addMorphism(m));

  return search;
}
