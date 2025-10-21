/**
 * @lambda-foundation/mesh - P2P Lambda Mesh Node
 *
 * "From Monarch to Diplomat to Philosopher"
 *
 * Phase 1: Single node decides truth (Monarch)
 * Phase 2: Network reaches consensus through resonance (Diplomat)
 * Phase 3: IPFS storage (Historian)
 * Phase 4: Semantic equivalence (Philosopher)
 */

import { LambdaMeshNode } from './LambdaMeshNode.js';
import { TcpTransport } from './network/TcpTransport.js';
import { SemanticEquivalenceEngine } from './semantic/SemanticEquivalenceEngine.js';
import { HypothesisEngine } from './semantic/HypothesisEngine.js';
import type {
  MeshMessage,
  VerifyRequestMessage,
  VerifyVoteMessage,
  ConsensusResult,
} from './network/types.js';
import type {
  LambdaExpr,
  VerifyResponse,
  ResonanceVote,
  MeshConfig,
} from './types.js';

/**
 * P2P-enabled Lambda Mesh Node
 *
 * Extends base node with network consensus capabilities
 */
export class P2PLambdaMeshNode extends LambdaMeshNode {
  private transport: TcpTransport;
  protected semanticEngine: SemanticEquivalenceEngine; // Phase 4
  protected hypothesisEngine: HypothesisEngine; // Phase 4.5: Creative exploration
  private pendingRequests: Map<string, {
    expr: LambdaExpr;
    votes: ResonanceVote[];
    resolve: () => void;
    timeout: NodeJS.Timeout;
  }> = new Map();

  private consensusTimeout: number = 5000; // 5 seconds to collect votes

  constructor(config: MeshConfig) {
    super(config);

    // Create TCP transport
    this.transport = new TcpTransport(
      config.nodeId,
      config.port ?? 8888
    );

    // Phase 4: Create semantic equivalence engine
    this.semanticEngine = new SemanticEquivalenceEngine();

    // Phase 4.5: Create hypothesis engine
    this.hypothesisEngine = new HypothesisEngine();

    // Setup message handlers
    this.transport.on('message', (message: MeshMessage) => {
      this.handleMessage(message);
    });
  }

  /**
   * Start P2P node
   */
  async start(): Promise<void> {
    // Start base node (loads reflections)
    await super.start();

    // Start transport layer
    await this.transport.start();

    // Connect to initial peers
    for (const peerAddr of this.config.peers) {
      const [host, portStr] = peerAddr.split(':');
      const port = parseInt(portStr, 10);
      const peerId = `peer-${host}-${port}`;

      try {
        await this.transport.connectToPeer(peerId, host, port);
      } catch (err) {
        console.error(`❌ Failed to connect to ${peerAddr}: ${err}`);
      }
    }

    console.log(`🌐 P2P mesh node ready with ${this.transport.getPeers().length} peers\n`);
  }

  /**
   * Verify lambda expression through P2P consensus
   *
   * This is where "Monarch becomes Diplomat"
   */
  async verifyLambda(expr: string, metadata?: LambdaExpr['metadata']): Promise<VerifyResponse> {
    const lambdaExpr: LambdaExpr = {
      expr,
      hash: this.hashExpr(expr),
      metadata: {
        ...metadata,
        source: this.nodeId,
        timestamp: Date.now(),
      },
    };

    const requestId = lambdaExpr.hash;
    const peers = this.transport.getPeers();

    console.log(`\n🔍 P2P Verifying: ${expr}`);
    console.log(`   Hash: ${lambdaExpr.hash.slice(0, 12)}...`);
    console.log(`   Peers: ${peers.length > 0 ? peers.join(', ') : 'none (solo mode)'}`);

    // If no peers, fallback to local verification (Phase 1 mode)
    if (peers.length === 0) {
      console.log(`   ⚠️  No peers connected, using local verification (Monarch mode)`);
      return super.verifyLambda(expr, metadata);
    }

    // Get our own vote first (we're part of consensus)
    const localVote = await this.getLocalVote(lambdaExpr);
    console.log(`   🗳️  Local vote: ${localVote.vote} (confidence: ${(localVote.confidence * 100).toFixed(0)}%)`);

    // Broadcast verification request to peers (Diplomat mode)
    const votes = await this.collectVotes(lambdaExpr, localVote);

    // Calculate consensus through resonance
    const consensus = this.calculateConsensus(votes);

    console.log(`\n   📊 Consensus:`);
    console.log(`      Agreement: ${(consensus.agreementScore * 100).toFixed(0)}%`);
    console.log(`      Majority: ${consensus.majorityVote}`);
    console.log(`      Participants: ${consensus.participatingNodes.length} nodes`);
    if (consensus.outliers.length > 0) {
      console.log(`      ⚠️  Outliers: ${consensus.outliers.length} (evolution signals!)`);
      for (const outlier of consensus.outliers) {
        console.log(`         • ${outlier.nodeId}: ${outlier.vote} (${outlier.reasoning || 'no reason'})`);
      }
    }

    // Return result based on consensus
    return this.buildConsensusResponse(lambdaExpr, consensus);
  }

  /**
   * Get local vote on expression (our own opinion)
   *
   * Phase 4: Now uses semantic equivalence engine
   */
  private async getLocalVote(expr: LambdaExpr): Promise<ResonanceVote> {
    // Phase 4: Check semantic equivalence first
    const semanticMatch = this.semanticEngine.findCanonical(expr.expr, this.morphisms);
    if (semanticMatch) {
      return {
        nodeId: this.nodeId,
        requestId: expr.hash,
        vote: 'EQUIVALENT',
        confidence: 1.0,
        equivalentTo: semanticMatch.canonical.hash,
        reasoning: semanticMatch.proof.reasoning,
        proof: semanticMatch.proof,
      };
    }

    // Phase 3: Fallback to syntactic equivalence
    const existing = await this.findEquivalent(expr);
    if (existing) {
      return {
        nodeId: this.nodeId,
        requestId: expr.hash,
        vote: 'EQUIVALENT',
        confidence: 0.95,
        equivalentTo: existing.hash,
        reasoning: `Syntactically equivalent to ${existing.name}`,
      };
    }

    // Check purity
    const purityCheck = await this.checkPurity(expr);
    if (!purityCheck.pure) {
      return {
        nodeId: this.nodeId,
        requestId: expr.hash,
        vote: 'IMPURE',
        confidence: 1.0 - purityCheck.purityScore,
        reasoning: purityCheck.violations.join('; '),
      };
    }

    // Pure and novel
    return {
      nodeId: this.nodeId,
      requestId: expr.hash,
      vote: 'PURE',
      confidence: purityCheck.purityScore,
      reasoning: 'No imperative constructs detected',
    };
  }

  /**
   * Collect votes from peers
   */
  private async collectVotes(
    expr: LambdaExpr,
    localVote: ResonanceVote
  ): Promise<ResonanceVote[]> {
    const requestId = expr.hash;
    const votes: ResonanceVote[] = [localVote];

    return new Promise((resolve) => {
      // Setup vote collection
      this.pendingRequests.set(requestId, {
        expr,
        votes,
        resolve: () => resolve(votes),
        timeout: setTimeout(() => {
          console.log(`   ⏱️  Consensus timeout, proceeding with ${votes.length} votes`);
          this.pendingRequests.delete(requestId);
          resolve(votes);
        }, this.consensusTimeout),
      });

      // Broadcast verification request
      const message: VerifyRequestMessage = {
        type: 'VERIFY_REQUEST',
        from: this.nodeId,
        timestamp: Date.now(),
        requestId,
        expr,
      };

      console.log(`   📢 Broadcasting to ${this.transport.getPeers().length} peers...`);
      this.transport.broadcast(message);
    });
  }

  /**
   * Calculate consensus from collected votes
   *
   * This is "Consensus through Resonance" (not simple voting!)
   */
  private calculateConsensus(votes: ResonanceVote[]): ConsensusResult {
    if (votes.length === 0) {
      throw new Error('No votes to calculate consensus');
    }

    // Count votes weighted by confidence
    const voteCounts = {
      PURE: 0,
      IMPURE: 0,
      EQUIVALENT: 0,
    };

    for (const vote of votes) {
      voteCounts[vote.vote] += vote.confidence;
    }

    // Determine majority
    const total = voteCounts.PURE + voteCounts.IMPURE + voteCounts.EQUIVALENT;
    const majorityVote = (
      voteCounts.PURE >= voteCounts.IMPURE && voteCounts.PURE >= voteCounts.EQUIVALENT
        ? 'PURE'
        : voteCounts.EQUIVALENT >= voteCounts.IMPURE
        ? 'EQUIVALENT'
        : 'IMPURE'
    ) as 'PURE' | 'IMPURE' | 'EQUIVALENT';

    // Calculate agreement score (how much consensus)
    const agreementScore = voteCounts[majorityVote] / total;

    // Find outliers (votes that disagree with majority)
    const outliers = votes.filter(v => v.vote !== majorityVote);

    return {
      agreementScore,
      majorityVote,
      votes,
      outliers,
      participatingNodes: votes.map(v => v.nodeId),
      timestamp: Date.now(),
    };
  }

  /**
   * Build response based on consensus result
   */
  private async buildConsensusResponse(
    expr: LambdaExpr,
    consensus: ConsensusResult
  ): Promise<VerifyResponse> {
    const { agreementScore, majorityVote, votes, outliers, participatingNodes, timestamp } = consensus;

    // Check if consensus threshold reached
    if (agreementScore < this.config.consensusThreshold) {
      console.log(`\n   ⚠️  Consensus threshold not reached (${(agreementScore * 100).toFixed(0)}% < ${(this.config.consensusThreshold * 100).toFixed(0)}%)`);
      console.log(`   💭 This is an evolution signal! Pattern needs refinement.\n`);

      return {
        requestId: expr.hash,
        status: 422,
        errors: ['Consensus not reached', `Agreement: ${(agreementScore * 100).toFixed(0)}%`],
        impurityReason: `Network disagreement (${outliers.length} outliers)`,
        consensus: {
          agreementScore,
          participatingNodes,
          timestamp,
        },
      };
    }

    // 302 Found: Equivalent to existing morphism
    if (majorityVote === 'EQUIVALENT') {
      const equivalentVotes = votes.filter(v => v.vote === 'EQUIVALENT');
      const equivalentTo = equivalentVotes[0]?.equivalentTo;
      const proof = equivalentVotes[0]?.proof; // Phase 4: Include proof

      if (equivalentTo) {
        const canonical = this.morphisms.get(equivalentTo);
        if (canonical) {
          console.log(`✅ Consensus: EQUIVALENT to ${canonical.name}`);
          if (proof) {
            console.log(`   📜 Proof: ${proof.reasoning}\n`);
          } else {
            console.log();
          }
          return {
            requestId: expr.hash,
            status: 302,
            location: equivalentTo,
            canonical,
            proof, // Phase 4: Include proof in response
            consensus: {
              agreementScore,
              participatingNodes,
              timestamp,
              outliers, // Phase 4: Include outliers for evolution signals
            },
          };
        }
      }
    }

    // 422 Rejected: Impure
    if (majorityVote === 'IMPURE') {
      const errors = votes
        .filter(v => v.vote === 'IMPURE')
        .map(v => v.reasoning || 'Impure expression');

      console.log(`❌ Consensus: IMPURE\n`);
      return {
        requestId: expr.hash,
        status: 422,
        errors,
        impurityReason: errors[0],
        consensus: {
          agreementScore,
          participatingNodes,
          timestamp,
          outliers, // Phase 4: Include outliers for evolution signals
        },
      };
    }

    // Phase 4.5: Check for hypothesis (before creating new morphism)
    // Even if consensus is PURE, check for potential equivalence
    if (majorityVote === 'PURE') {
      // Try to detect hypothesis
      const morphismsList = Array.from(this.morphisms.values());
      const hypothesis = this.hypothesisEngine.detectPotentialEquivalence(expr.expr, morphismsList);

      if (hypothesis && hypothesis.confidence > 0.7) {
        // 202 Hypothetical: Creative leap detected!
        console.log(`💡 Consensus: HYPOTHETICAL - Creative exploration detected!\n`);
        console.log(`   Potential canonical: ${hypothesis.potentialCanonical.slice(0, 16)}...`);
        console.log(`   Confidence: ${(hypothesis.confidence * 100).toFixed(0)}%`);
        console.log(`   Reasoning: ${hypothesis.reasoning}`);
        console.log(`   Exploration value: ${(hypothesis.explorationValue * 100).toFixed(0)}%\n`);

        return {
          requestId: expr.hash,
          status: 202,
          hypothesis,
          consensus: {
            agreementScore,
            participatingNodes,
            timestamp,
            outliers, // Evolution signals (may be empty if all agreed on PURE)
          },
        };
      }
    }

    // 201 Created: Pure and novel (no hypothesis detected)
    const purityCheck = await this.checkPurity(expr);
    const newMorphism = await this.canonicalize(expr, purityCheck);

    this.morphisms.set(newMorphism.hash, newMorphism);
    this.verificationsPerformed++;

    console.log(`🌟 Consensus: PURE - Created new morphism: ${newMorphism.name}\n`);

    return {
      requestId: expr.hash,
      status: 201,
      newMorphism,
      consensus: {
        agreementScore,
        participatingNodes,
        timestamp,
        outliers, // Phase 4: Include outliers for evolution signals
      },
    };
  }

  /**
   * Handle incoming network messages
   */
  protected async handleMessage(message: MeshMessage): Promise<void> {
    switch (message.type) {
      case 'VERIFY_REQUEST':
        await this.handleVerifyRequest(message);
        break;

      case 'VERIFY_VOTE':
        this.handleVerifyVote(message);
        break;

      case 'PING':
        this.transport.sendToPeer(message.from, {
          type: 'PONG',
          from: this.nodeId,
          timestamp: Date.now(),
        });
        break;

      case 'MORPHISM_ANNOUNCE':
      case 'MORPHISM_SYNC_REQUEST':
      case 'MORPHISM_SYNC_RESPONSE':
        // Delegate to storage handler (if overridden by subclass)
        if (typeof (this as any).handleStorageMessage === 'function') {
          await (this as any).handleStorageMessage(message);
        }
        break;

      default:
        console.log(`❓ Unknown message type: ${(message as any).type}`);
    }
  }

  /**
   * Handle verification request from peer
   */
  private async handleVerifyRequest(message: VerifyRequestMessage): Promise<void> {
    const { requestId, expr, from } = message;

    // Don't vote on our own requests
    if (from === this.nodeId) return;

    console.log(`\n📬 Verification request from ${from}`);
    console.log(`   Expression: ${expr.expr}`);

    // Get our vote
    const vote = await this.getLocalVote(expr);
    console.log(`   🗳️  Voting: ${vote.vote} (confidence: ${(vote.confidence * 100).toFixed(0)}%)`);

    // Send vote back to requester
    const voteMessage: VerifyVoteMessage = {
      type: 'VERIFY_VOTE',
      from: this.nodeId,
      timestamp: Date.now(),
      requestId,
      vote,
    };

    this.transport.sendToPeer(from, voteMessage);
  }

  /**
   * Handle vote from peer
   */
  private handleVerifyVote(message: VerifyVoteMessage): void {
    const { requestId, vote, from } = message;

    const pending = this.pendingRequests.get(requestId);
    if (!pending) {
      return; // Request already completed or not ours
    }

    console.log(`   🗳️  Vote from ${from}: ${vote.vote} (confidence: ${(vote.confidence * 100).toFixed(0)}%)`);

    // Add vote to collection
    pending.votes.push(vote);

    // Check if we have all votes (all connected peers + us)
    const expectedVotes = this.transport.getPeers().length + 1; // +1 for local vote
    if (pending.votes.length >= expectedVotes) {
      console.log(`   ✅ All votes collected (${pending.votes.length}/${expectedVotes})`);
      clearTimeout(pending.timeout);
      pending.resolve();
      this.pendingRequests.delete(requestId);
    }
  }

  /**
   * Stop P2P node
   */
  async stop(): Promise<void> {
    await this.transport.stop();
    await super.stop();
  }
}
