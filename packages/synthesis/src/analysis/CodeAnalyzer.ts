/**
 * λ_SYNTHESIS: Code Analyzer
 *
 * Scans existing code and automatically generates intents.
 * This feeds the Right Brain (Chain of Thoughts) from real-world codebases.
 *
 * Patterns detected:
 * - Array operations → map/filter/reduce morphisms
 * - Promise chains → async morphisms
 * - Event handlers → observable morphisms
 * - Data transformations → functor morphisms
 */

import { createIntent, type Intent, type IntentType } from '../intents/Intent';

/**
 * Code pattern that can be converted to a morphism
 */
export interface CodePattern {
  type: 'array-map' | 'array-filter' | 'array-reduce' | 'promise-chain' | 'event-handler' | 'lodash-chain';
  code: string;
  lineStart: number;
  lineEnd: number;
  description: string;
  suggestedMorphism?: string;
}

/**
 * Analysis result
 */
export interface AnalysisResult {
  file: string;
  patterns: CodePattern[];
  intents: Intent[];
  stats: {
    totalLines: number;
    patternsFound: number;
    intentsGenerated: number;
  };
}

/**
 * Code Analyzer - discovers morphism opportunities in existing code
 */
export class CodeAnalyzer {
  /**
   * Analyze JavaScript/TypeScript code and generate intents
   */
  analyze(code: string, filename: string = 'unknown.js'): AnalysisResult {
    const lines = code.split('\n');
    const patterns: CodePattern[] = [];

    // Detect patterns
    patterns.push(...this.detectArrayOperations(lines));
    patterns.push(...this.detectPromiseChains(lines));
    patterns.push(...this.detectEventHandlers(lines));
    patterns.push(...this.detectLodashChains(lines));

    // Generate intents from patterns
    const intents = patterns.map(pattern => this.patternToIntent(pattern, filename));

    return {
      file: filename,
      patterns,
      intents,
      stats: {
        totalLines: lines.length,
        patternsFound: patterns.length,
        intentsGenerated: intents.length
      }
    };
  }

  /**
   * Detect array operations (map, filter, reduce)
   */
  private detectArrayOperations(lines: string[]): CodePattern[] {
    const patterns: CodePattern[] = [];

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];

      // Detect .map()
      if (line.match(/\.map\s*\(/)) {
        patterns.push({
          type: 'array-map',
          code: line.trim(),
          lineStart: i + 1,
          lineEnd: i + 1,
          description: 'Array transformation using .map()',
          suggestedMorphism: 'map'
        });
      }

      // Detect .filter()
      if (line.match(/\.filter\s*\(/)) {
        patterns.push({
          type: 'array-filter',
          code: line.trim(),
          lineStart: i + 1,
          lineEnd: i + 1,
          description: 'Array filtering using .filter()',
          suggestedMorphism: 'filter'
        });
      }

      // Detect .reduce()
      if (line.match(/\.reduce\s*\(/)) {
        patterns.push({
          type: 'array-reduce',
          code: line.trim(),
          lineStart: i + 1,
          lineEnd: i + 1,
          description: 'Array aggregation using .reduce()',
          suggestedMorphism: 'reduce'
        });
      }

      // Detect chained operations
      if (line.match(/\.(map|filter|reduce).*\.(map|filter|reduce)/)) {
        patterns.push({
          type: 'array-map', // Generic
          code: line.trim(),
          lineStart: i + 1,
          lineEnd: i + 1,
          description: 'Chained array operations (composition opportunity!)',
          suggestedMorphism: 'compose'
        });
      }
    }

    return patterns;
  }

  /**
   * Detect Promise chains (.then(), .catch())
   */
  private detectPromiseChains(lines: string[]): CodePattern[] {
    const patterns: CodePattern[] = [];

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];

      // Detect .then() chains
      if (line.match(/\.then\s*\(/) && !line.includes('//')) {
        patterns.push({
          type: 'promise-chain',
          code: line.trim(),
          lineStart: i + 1,
          lineEnd: i + 1,
          description: 'Promise chain (could be async morphism)',
          suggestedMorphism: 'flatMap / chain'
        });
      }
    }

    return patterns;
  }

  /**
   * Detect event handlers (addEventListener, on(), etc.)
   */
  private detectEventHandlers(lines: string[]): CodePattern[] {
    const patterns: CodePattern[] = [];

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];

      // Detect addEventListener
      if (line.match(/addEventListener\s*\(/)) {
        patterns.push({
          type: 'event-handler',
          code: line.trim(),
          lineStart: i + 1,
          lineEnd: i + 1,
          description: 'Event handler (could be observable)',
          suggestedMorphism: 'subscribe / fromEvent'
        });
      }

      // Detect .on() pattern
      if (line.match(/\.on\s*\(['"]\w+['"]/) && !line.includes('//')) {
        patterns.push({
          type: 'event-handler',
          code: line.trim(),
          lineStart: i + 1,
          lineEnd: i + 1,
          description: 'Event emitter pattern (could be observable)',
          suggestedMorphism: 'subscribe'
        });
      }
    }

    return patterns;
  }

  /**
   * Detect lodash chains (_.chain(), lodash chaining)
   */
  private detectLodashChains(lines: string[]): CodePattern[] {
    const patterns: CodePattern[] = [];

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];

      // Detect _.chain()
      if (line.match(/_\.chain\s*\(/)) {
        patterns.push({
          type: 'lodash-chain',
          code: line.trim(),
          lineStart: i + 1,
          lineEnd: i + 1,
          description: 'Lodash chain (can be converted to morphisms!)',
          suggestedMorphism: 'compose'
        });
      }

      // Detect _.map, _.filter, etc.
      if (line.match(/_\.(map|filter|reduce|groupBy|sortBy)\s*\(/)) {
        patterns.push({
          type: 'lodash-chain',
          code: line.trim(),
          lineStart: i + 1,
          lineEnd: i + 1,
          description: 'Lodash operation (pure function candidate)',
          suggestedMorphism: line.match(/_\.(\w+)/)?.[1] || 'transform'
        });
      }
    }

    return patterns;
  }

  /**
   * Convert detected pattern to an intent
   */
  private patternToIntent(pattern: CodePattern, filename: string): Intent {
    const type: IntentType = this.determineIntentType(pattern);
    const title = this.generateTitle(pattern);
    const description = this.generateDescription(pattern, filename);
    const tags = this.generateTags(pattern);

    return createIntent(
      'code', // Source: code analyzer
      type,
      title,
      description,
      {
        priority: this.determinePriority(pattern),
        tags,
        existingCode: pattern.code
      }
    );
  }

  /**
   * Determine intent type from pattern
   */
  private determineIntentType(pattern: CodePattern): IntentType {
    switch (pattern.type) {
      case 'lodash-chain':
        return 'convert';
      case 'array-map':
      case 'array-filter':
      case 'array-reduce':
        return pattern.code.includes('map') && pattern.code.includes('filter') ? 'compose' : 'refactor';
      case 'promise-chain':
        return 'refactor';
      case 'event-handler':
        return 'refactor';
      default:
        return 'refactor';
    }
  }

  /**
   * Generate intent title
   */
  private generateTitle(pattern: CodePattern): string {
    switch (pattern.type) {
      case 'array-map':
        return 'Convert array map to morphism';
      case 'array-filter':
        return 'Convert array filter to morphism';
      case 'array-reduce':
        return 'Convert array reduce to morphism';
      case 'promise-chain':
        return 'Convert promise chain to async morphism';
      case 'event-handler':
        return 'Convert event handler to observable';
      case 'lodash-chain':
        return 'Convert lodash chain to morphism composition';
      default:
        return 'Refactor to morphism';
    }
  }

  /**
   * Generate intent description
   */
  private generateDescription(pattern: CodePattern, filename: string): string {
    return `Found ${pattern.description} in ${filename}:${pattern.lineStart}\n\nCode:\n${pattern.code}\n\nThis could be replaced with the '${pattern.suggestedMorphism}' morphism for better composability and formal verification.`;
  }

  /**
   * Generate tags from pattern
   */
  private generateTags(pattern: CodePattern): string[] {
    const tags: string[] = ['refactor', 'purity'];

    switch (pattern.type) {
      case 'array-map':
        tags.push('map', 'transform', 'functor');
        break;
      case 'array-filter':
        tags.push('filter', 'predicate');
        break;
      case 'array-reduce':
        tags.push('reduce', 'aggregate', 'fold');
        break;
      case 'promise-chain':
        tags.push('async', 'promise', 'flatMap');
        break;
      case 'event-handler':
        tags.push('observable', 'reactive', 'subscribe');
        break;
      case 'lodash-chain':
        tags.push('lodash', 'composition', 'convert');
        break;
    }

    return tags;
  }

  /**
   * Determine priority based on pattern complexity
   */
  private determinePriority(pattern: CodePattern): 'critical' | 'high' | 'medium' | 'low' {
    // Lodash chains = high priority (easy wins)
    if (pattern.type === 'lodash-chain') return 'high';

    // Chained operations = medium priority (composition opportunity)
    if (pattern.code.match(/\.(map|filter|reduce).*\.(map|filter|reduce)/)) return 'medium';

    // Single operations = low priority
    return 'low';
  }
}

/**
 * Analyze a codebase directory (placeholder for future implementation)
 */
export interface CodebaseAnalysisOptions {
  includePatterns?: string[];  // e.g., ['**/*.ts', '**/*.js']
  excludePatterns?: string[];  // e.g., ['node_modules/**', 'dist/**']
  followSymlinks?: boolean;
}

/**
 * Batch analyzer for multiple files
 */
export class CodebaseAnalyzer {
  private analyzer: CodeAnalyzer;

  constructor() {
    this.analyzer = new CodeAnalyzer();
  }

  /**
   * Analyze multiple code files
   */
  analyzeFiles(files: Map<string, string>): Map<string, AnalysisResult> {
    const results = new Map<string, AnalysisResult>();

    for (const [filename, code] of files) {
      const result = this.analyzer.analyze(code, filename);
      if (result.patterns.length > 0) {
        results.set(filename, result);
      }
    }

    return results;
  }

  /**
   * Get summary statistics
   */
  getSummary(results: Map<string, AnalysisResult>) {
    let totalLines = 0;
    let totalPatterns = 0;
    let totalIntents = 0;
    const patternTypes = new Map<string, number>();

    for (const result of results.values()) {
      totalLines += result.stats.totalLines;
      totalPatterns += result.stats.patternsFound;
      totalIntents += result.stats.intentsGenerated;

      for (const pattern of result.patterns) {
        patternTypes.set(
          pattern.type,
          (patternTypes.get(pattern.type) || 0) + 1
        );
      }
    }

    return {
      filesAnalyzed: results.size,
      totalLines,
      totalPatterns,
      totalIntents,
      patternTypes: Object.fromEntries(patternTypes)
    };
  }
}
