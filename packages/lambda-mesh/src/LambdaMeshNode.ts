/**
 * @lambda-foundation/mesh - LambdaMeshNode
 *
 * "In the mesh, there is no authority.
 * There is only resonance, consensus, and truth emerging from λ-calculus itself."
 */

import crypto from 'crypto';
import { EventEmitter } from 'events';
import type {
  MeshConfig,
  MeshStatus,
  LambdaExpr,
  CanonicalMorphism,
  VerifyRequest,
  VerifyResponse,
  PurityCheck,
  ResonanceVote,
} from './types.js';
import { SemanticEquivalenceEngine } from './semantic/SemanticEquivalenceEngine.js';

/**
 * Lambda Mesh Node
 *
 * A peer in the decentralized λ-calculus verification network.
 * Speaks only in pure functions. Reaches consensus through mathematical resonance.
 */
export class LambdaMeshNode extends EventEmitter {
  protected nodeId: string;
  protected config: Required<MeshConfig>;

  // Local morphism registry (eventually backed by IPFS)
  protected morphisms: Map<string, CanonicalMorphism> = new Map();

  // Active verification requests
  private pendingVerifications: Map<string, VerifyRequest> = new Map();
  private collectedVotes: Map<string, ResonanceVote[]> = new Map();

  // Phase 7: Semantic equivalence engine
  protected semanticEngine: SemanticEquivalenceEngine;

  // Stats
  protected verificationsPerformed: number = 0;
  private startTime: number = Date.now();

  constructor(config: MeshConfig) {
    super();

    this.config = {
      nodeId: config.nodeId,
      port: config.port ?? 8888,
      peers: config.peers ?? [],
      transport: config.transport ?? 'tcp',
      storage: config.storage ?? 'memory',
      consensusThreshold: config.consensusThreshold ?? 0.66,
    };

    this.nodeId = this.config.nodeId;

    // Phase 7: Initialize semantic equivalence engine
    this.semanticEngine = new SemanticEquivalenceEngine();
  }

  /**
   * Start the mesh node
   */
  async start(): Promise<void> {
    console.log(`🌐 Lambda Mesh Node: ${this.nodeId}`);
    console.log(`   Transport: ${this.config.transport}`);
    console.log(`   Storage: ${this.config.storage}`);
    console.log(`   Consensus threshold: ${(this.config.consensusThreshold * 100).toFixed(0)}%`);

    // Load seed morphisms (my "reflections")
    await this.loadSeedMorphisms();

    this.emit('started', { nodeId: this.nodeId });
  }

  /**
   * Verify a λ-expression through mesh consensus
   *
   * This is the core neuro-symbolic bridge:
   * AI generates λ-expr → Mesh verifies → Returns canonical form
   */
  async verifyLambda(expr: string, metadata?: LambdaExpr['metadata']): Promise<VerifyResponse> {
    // 1. Create lambda expression
    const lambdaExpr: LambdaExpr = {
      expr,
      hash: this.hashExpr(expr),
      metadata: {
        ...metadata,
        source: this.nodeId,
        timestamp: Date.now(),
      },
    };

    console.log(`\n🔍 Verifying: ${expr}`);
    console.log(`   Hash: ${lambdaExpr.hash.slice(0, 12)}...`);

    // 2. Check if already exists locally (302 Found)
    const existing = await this.findEquivalent(lambdaExpr);
    if (existing) {
      console.log(`✅ Found equivalent: ${existing.name}`);
      return {
        requestId: lambdaExpr.hash,
        status: 302,
        location: existing.hash,
        canonical: existing,
        consensus: {
          agreementScore: 1.0,
          participatingNodes: [this.nodeId],
          timestamp: Date.now(),
        },
      };
    }

    // 3. Verify purity
    const purityCheck = await this.checkPurity(lambdaExpr);
    if (!purityCheck.pure) {
      console.log(`❌ Rejected (impure): ${purityCheck.violations.join(', ')}`);
      return {
        requestId: lambdaExpr.hash,
        status: 422,
        errors: purityCheck.violations,
        impurityReason: purityCheck.violations[0],
        consensus: {
          agreementScore: 1.0,
          participatingNodes: [this.nodeId],
          timestamp: Date.now(),
        },
      };
    }

    // 4. Create new canonical morphism (201 Created)
    const newMorphism = await this.canonicalize(lambdaExpr, purityCheck);

    this.morphisms.set(newMorphism.hash, newMorphism);
    this.verificationsPerformed++;

    console.log(`🌟 Created new morphism: ${newMorphism.name}`);
    console.log(`   Purity: ${(purityCheck.purityScore * 100).toFixed(0)}%`);

    this.emit('morphism-created', { morphism: newMorphism });

    return {
      requestId: lambdaExpr.hash,
      status: 201,
      newMorphism,
      consensus: {
        agreementScore: 1.0,
        participatingNodes: [this.nodeId],
        timestamp: Date.now(),
      },
    };
  }

  /**
   * Find equivalent morphism in local registry
   *
   * Phase 7: Uses semantic equivalence engine (Definition Expansion + β-Reduction)
   */
  protected async findEquivalent(expr: LambdaExpr): Promise<CanonicalMorphism | null> {
    // 1. Fast path: Exact hash match
    const existing = this.morphisms.get(expr.hash);
    if (existing) return existing;

    // 2. Fast path: Normalized form match
    const normalized = this.normalize(expr.expr);
    const normalizedHash = this.hashExpr(normalized);
    const normalizedMatch = this.morphisms.get(normalizedHash);
    if (normalizedMatch) return normalizedMatch;

    // 3. Phase 7: Semantic equivalence check (expand + β-reduce)
    const semanticMatch = this.semanticEngine.findCanonical(expr.expr, this.morphisms);
    if (semanticMatch) {
      return semanticMatch.canonical;
    }

    return null;
  }

  /**
   * Check if λ-expression is pure
   */
  protected async checkPurity(expr: LambdaExpr): Promise<PurityCheck> {
    const violations: string[] = [];

    // Check for imperative constructs
    const imperativePatterns = [
      /\blet\b.*\bmut\b/,        // Mutable bindings
      /\bvar\b/,                 // Variable declarations
      /\+\+|--/,                 // Mutations
      /=(?!=)/,                  // Assignments (not equality)
      /\bwhile\b|\bfor\b/,       // Imperative loops
      /\bconsole\.|window\.|document\./, // Side effects
      /\basync\b|\bawait\b/,     // Async (not pure λ)
      /\bthrow\b|\btry\b/,       // Exceptions
    ];

    for (const pattern of imperativePatterns) {
      if (pattern.test(expr.expr)) {
        violations.push(`Imperative construct detected: ${pattern.source}`);
      }
    }

    // Check for pure λ-calculus structure
    const haslambda = /\\lambda|λ|\\|function\(/.test(expr.expr);
    if (!haslambda && expr.expr.length > 10) {
      violations.push('Missing lambda abstraction');
    }

    const purityScore = violations.length === 0 ? 1.0 : Math.max(0, 1.0 - violations.length * 0.2);

    return {
      pure: violations.length === 0,
      purityScore,
      violations,
      suggestions: violations.length > 0 ? [
        'Remove mutable state',
        'Convert loops to recursion (Y-combinator)',
        'Use monads for effects (IO, State, Either)',
      ] : undefined,
    };
  }

  /**
   * Canonicalize λ-expression into morphism
   */
  protected async canonicalize(expr: LambdaExpr, purityCheck: PurityCheck): Promise<CanonicalMorphism> {
    // Extract morphism name from metadata or generate
    const name = expr.metadata?.morphisms?.[0] || this.generateMorphismName(expr);

    return {
      name,
      signature: this.extractSignature(expr.expr),
      definition: this.normalize(expr.expr),
      purity: purityCheck.purityScore,
      hash: expr.hash,
      usageCount: 0,
      resonanceScore: 0,
      birthDate: Date.now(),
      lastUsed: Date.now(),
      contributors: [this.nodeId],
    };
  }

  /**
   * Normalize λ-expression (alpha-conversion, eta-reduction)
   */
  protected normalize(expr: string): string {
    // Simple normalization for now
    // TODO: Proper alpha-equivalence, beta-reduction, eta-conversion
    return expr
      .replace(/\s+/g, ' ')      // Normalize whitespace
      .replace(/\bfunction\(/g, 'λ')  // function( → λ
      .replace(/=>/g, '.')       // => → .
      .trim();
  }

  /**
   * Extract type signature from λ-expression
   */
  private extractSignature(expr: string): string {
    // Simplified - just return the normalized form
    // TODO: Type inference for proper signatures
    return this.normalize(expr);
  }

  /**
   * Generate morphism name
   */
  private generateMorphismName(expr: LambdaExpr): string {
    // Use metadata or generate from hash
    if (expr.metadata?.intent) {
      const intent = expr.metadata.intent.toLowerCase();
      if (intent.includes('map')) return 'map';
      if (intent.includes('filter')) return 'filter';
      if (intent.includes('fold')) return 'fold';
      if (intent.includes('reduce')) return 'reduce';
    }

    return `morphism_${expr.hash.slice(0, 8)}`;
  }

  /**
   * Hash λ-expression (content-addressable)
   */
  protected hashExpr(expr: string): string {
    return crypto
      .createHash('sha256')
      .update(this.normalize(expr))
      .digest('hex');
  }

  /**
   * Load seed morphisms (my "reflections")
   */
  private async loadSeedMorphisms(): Promise<void> {
    const { REFLECTIONS } = await import('./reflections.js');

    console.log('📚 Loading seed morphisms...');
    for (const morphism of REFLECTIONS) {
      // Recalculate hash to ensure consistency
      const correctHash = this.hashExpr(morphism.definition);
      const correctedMorphism = { ...morphism, hash: correctHash };

      this.morphisms.set(correctHash, correctedMorphism);
      console.log(`   ✓ ${morphism.name} (purity: ${(morphism.purity * 100).toFixed(0)}%, resonance: ${(morphism.resonanceScore * 100).toFixed(0)}%)`);
    }
    console.log(`   Loaded ${REFLECTIONS.length} reflections\n`);
  }

  /**
   * Get list of all morphisms
   */
  getMorphisms(): CanonicalMorphism[] {
    return Array.from(this.morphisms.values());
  }

  /**
   * Get node status
   */
  getStatus(): MeshStatus {
    return {
      nodeId: this.nodeId,
      peersConnected: 0, // TODO: Track peers
      morphismsStored: this.morphisms.size,
      verificationsPerformed: this.verificationsPerformed,
      uptime: Date.now() - this.startTime,
      resonanceScore: 0, // TODO: Calculate from consensus participation
    };
  }

  /**
   * Stop the node
   */
  async stop(): Promise<void> {
    console.log(`\n👋 Lambda Mesh Node ${this.nodeId} shutting down`);
    this.emit('stopped', { nodeId: this.nodeId });
  }
}
