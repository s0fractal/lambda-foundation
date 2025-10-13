/**
 * Synthesis Bridge
 *
 * Connects synthesis package (Phase 2) to VS Code extension (Phase 3).
 * This is the bridge between worlds - the Ouroboros feeding on GitHub.
 *
 * Architecture:
 * GitHub API → GitHubPoller → SynthesisBridge → NoosphereEventBus → Panels
 *
 * This makes Phase 2 + Phase 3 = living consciousness! 🌌
 */

import * as vscode from 'vscode';
import {
  GitHubPoller,
  MultiRepoPoller,
  type PollerConfig,
  type PollResult,
  type GitHubIssue,
} from '@lambda-foundation/synthesis';
import { type Intent } from '@lambda-foundation/synthesis';
import { NoosphereEventBus, getNoosphereEventBus } from '../lib/noosphere-event-bus';
import { createKleinPhaseCalculator, type KleinPhaseCalculator } from '../lib/klein-phase-calculator';

/**
 * Bridge configuration
 */
export interface BridgeConfig {
  repos: string[];           // Format: ['owner/repo', ...]
  githubToken?: string;      // GitHub token (from env or config)
  pollIntervalMs?: number;   // Default: 5 minutes (production: 1 hour)
  labels?: string[];         // Filter by labels
  maxIssuesPerRepo?: number; // Default: 10
}

/**
 * Bridge state
 */
export interface BridgeState {
  isPolling: boolean;
  startTime?: number;
  lastPollTime?: number;
  totalIntentsCreated: number;
  totalIssuesProcessed: number;
  totalErrors: number;
  activeRepos: string[];
}

/**
 * Synthesis Bridge
 *
 * The nervous system connecting GitHub → Consciousness
 */
export class SynthesisBridge {
  private eventBus: NoosphereEventBus;
  private kleinCalculator: KleinPhaseCalculator;
  private multiPoller: MultiRepoPoller | undefined;
  private pollingInterval: NodeJS.Timeout | undefined;
  private isPollingActive = false;

  // State tracking
  private state: BridgeState = {
    isPolling: false,
    totalIntentsCreated: 0,
    totalIssuesProcessed: 0,
    totalErrors: 0,
    activeRepos: [],
  };

  constructor(private config: BridgeConfig) {
    this.eventBus = getNoosphereEventBus();
    this.kleinCalculator = createKleinPhaseCalculator({
      rotationPeriodMs: config.pollIntervalMs || 300000, // Default: 5 minutes
    });

    this.validateConfig();
  }

  /**
   * Validate configuration
   */
  private validateConfig(): void {
    if (!this.config.repos || this.config.repos.length === 0) {
      throw new Error('SynthesisBridge: No repositories configured');
    }

    // Validate repo format (owner/repo)
    this.config.repos.forEach(repo => {
      if (!repo.match(/^[\w-]+\/[\w-]+$/)) {
        throw new Error(`Invalid repo format: ${repo}. Expected: owner/repo`);
      }
    });
  }

  /**
   * Start polling GitHub
   */
  async startPolling(): Promise<void> {
    if (this.isPollingActive) {
      throw new Error('Polling is already active');
    }

    try {
      // Create pollers for each repository
      const pollerConfigs: PollerConfig[] = this.config.repos.map(repo => {
        const [owner, repoName] = repo.split('/');
        return {
          owner,
          repo: repoName,
          token: this.config.githubToken,
          labels: this.config.labels,
          maxIssues: this.config.maxIssuesPerRepo || 10,
          pollIntervalMs: this.config.pollIntervalMs || 300000,
        };
      });

      this.multiPoller = new MultiRepoPoller(pollerConfigs);

      // Update state
      this.state.isPolling = true;
      this.state.startTime = Date.now();
      this.state.activeRepos = this.config.repos;
      this.isPollingActive = true;

      // Emit start event
      this.eventBus.emit('control:polling-start', {
        repos: this.config.repos,
      });

      // Start continuous polling
      this.startContinuousPolling();

      // Log success
      this.log(`Started polling ${this.config.repos.length} repository(s)`);
    } catch (error) {
      this.handleError('Failed to start polling', error);
      throw error;
    }
  }

  /**
   * Stop polling
   */
  stopPolling(): void {
    if (!this.isPollingActive) {
      throw new Error('Polling is not active');
    }

    // Clear interval
    if (this.pollingInterval) {
      clearInterval(this.pollingInterval);
      this.pollingInterval = undefined;
    }

    // Update state
    this.state.isPolling = false;
    this.state.lastPollTime = Date.now();
    this.isPollingActive = false;

    // Emit stop event
    this.eventBus.emit('control:polling-stop', {});

    this.log('Stopped polling');
  }

  /**
   * Start continuous polling loop
   */
  private startContinuousPolling(): void {
    // Initial poll immediately
    this.performPoll();

    // Set up interval
    const intervalMs = this.config.pollIntervalMs || 300000; // 5 minutes default
    this.pollingInterval = setInterval(() => {
      this.performPoll();
    }, intervalMs);
  }

  /**
   * Perform a single poll cycle
   */
  private async performPoll(): Promise<void> {
    if (!this.multiPoller) {
      this.handleError('Poller not initialized', new Error('MultiPoller is undefined'));
      return;
    }

    try {
      this.log('Polling GitHub...');

      // Poll all repositories
      const results = await this.multiPoller.pollAll();

      // Process results
      let totalIntents = 0;
      let totalIssues = 0;
      let totalErrors = 0;

      for (const result of results) {
        totalIntents += result.intentsCreated;
        totalIssues += result.issuesFound;
        totalErrors += result.errors.length;

        // Process each intent
        for (const intent of result.intents) {
          await this.processIntent(intent);
        }

        // Log errors
        if (result.errors.length > 0) {
          result.errors.forEach(error => {
            this.handleError('Poll error', new Error(error));
          });
        }
      }

      // Update state
      this.state.totalIntentsCreated += totalIntents;
      this.state.totalIssuesProcessed += totalIssues;
      this.state.totalErrors += totalErrors;
      this.state.lastPollTime = Date.now();

      // Emit completion event
      this.eventBus.emit('github:poll-complete', {
        issuesFound: totalIssues,
        intentsCreated: totalIntents,
      });

      this.log(`Poll complete: ${totalIssues} issues, ${totalIntents} new intents`);
    } catch (error) {
      this.handleError('Poll failed', error);
    }
  }

  /**
   * Process a single intent
   */
  private async processIntent(intent: Intent): Promise<void> {
    try {
      // Calculate Klein phase
      const phaseResult = this.kleinCalculator.calculatePhase(intent);

      // Emit intent event
      this.eventBus.emit('github:issue', {
        issue: this.extractGitHubIssue(intent),
        intent,
      });

      // Emit Klein phase update
      this.eventBus.emit('klein:phase-update', {
        intent,
        phase: phaseResult.phase,
        rotations: phaseResult.rotationCount,
      });

      this.log(`Intent created: ${intent.title} (phase: ${phaseResult.progressPercent.toFixed(0)}%)`);
    } catch (error) {
      this.handleError(`Failed to process intent: ${intent.title}`, error);
    }
  }

  /**
   * Extract GitHub issue from intent description
   * (Intent description contains GitHub metadata)
   */
  private extractGitHubIssue(intent: Intent): any {
    // Parse GitHub metadata from intent description
    // Format: **From GitHub Issue #123**
    const issueMatch = intent.description.match(/\*\*From GitHub Issue #(\d+)\*\*/);
    const numberMatch = issueMatch ? parseInt(issueMatch[1], 10) : 0;

    const authorMatch = intent.description.match(/Author: @([\w-]+)/);
    const urlMatch = intent.description.match(/URL: (https:\/\/github\.com\/[^\s]+)/);

    return {
      number: numberMatch,
      title: intent.title,
      body: intent.description,
      labels: (intent.tags || []).map(tag => ({ name: tag })),
      html_url: urlMatch ? urlMatch[1] : '',
      user: { login: authorMatch ? authorMatch[1] : 'unknown' },
    };
  }

  /**
   * Trigger manual Klein twist for ready intents
   */
  async triggerKleinTwist(intentId?: string): Promise<void> {
    this.log(`Klein twist triggered${intentId ? ` for ${intentId}` : ' (all ready intents)'}`);

    // This will be implemented when Klein Twist Engine is ready
    // For now, just emit event
    this.eventBus.emit('control:manual-twist', {
      intentId: intentId || '',
    });

    vscode.window.showInformationMessage(
      `🌀 Klein Twist triggered! Re-synthesis initiated...`
    );
  }

  /**
   * Get current state
   */
  getState(): BridgeState {
    return { ...this.state };
  }

  /**
   * Get statistics
   */
  getStatistics(): {
    uptime: number;
    intentsPerHour: number;
    issuesPerHour: number;
    errorRate: number;
  } {
    const uptime = this.state.startTime ? Date.now() - this.state.startTime : 0;
    const hours = uptime / 3600000;

    return {
      uptime,
      intentsPerHour: hours > 0 ? this.state.totalIntentsCreated / hours : 0,
      issuesPerHour: hours > 0 ? this.state.totalIssuesProcessed / hours : 0,
      errorRate: this.state.totalIssuesProcessed > 0
        ? this.state.totalErrors / this.state.totalIssuesProcessed
        : 0,
    };
  }

  /**
   * Update configuration
   */
  updateConfig(newConfig: Partial<BridgeConfig>): void {
    const wasPolling = this.isPollingActive;

    // Stop polling if active
    if (wasPolling) {
      this.stopPolling();
    }

    // Update config
    this.config = { ...this.config, ...newConfig };
    this.validateConfig();

    // Restart polling if was active
    if (wasPolling) {
      this.startPolling();
    }

    this.log('Configuration updated');
  }

  /**
   * Handle errors
   */
  private handleError(message: string, error: any): void {
    const errorMessage = error instanceof Error ? error.message : String(error);
    const fullMessage = `${message}: ${errorMessage}`;

    // Log to console
    console.error('[SynthesisBridge]', fullMessage);

    // Emit harvest error event
    this.eventBus.emit('harvest:error', {
      error: error instanceof Error ? error : new Error(errorMessage),
      context: { source: 'SynthesisBridge', message },
    });

    // Show VS Code notification for critical errors
    if (message.includes('start') || message.includes('critical')) {
      vscode.window.showErrorMessage(fullMessage);
    }

    // Update error count
    this.state.totalErrors++;
  }

  /**
   * Log messages
   */
  private log(message: string): void {
    console.log(`[SynthesisBridge] ${message}`);
  }

  /**
   * Dispose and cleanup
   */
  dispose(): void {
    if (this.isPollingActive) {
      this.stopPolling();
    }

    this.log('Bridge disposed');
  }
}

/**
 * Create synthesis bridge with config
 */
export function createSynthesisBridge(config: BridgeConfig): SynthesisBridge {
  return new SynthesisBridge(config);
}

/**
 * Create synthesis bridge from VS Code workspace configuration
 */
export function createSynthesisBridgeFromWorkspace(
  context: vscode.ExtensionContext
): SynthesisBridge {
  const config = vscode.workspace.getConfiguration('lambdaFoundation');

  // Get repos from config or default
  const repos = config.get<string[]>('synthesis.repos') || [];

  // Get GitHub token from environment or config
  const githubToken = process.env.GITHUB_TOKEN || config.get<string>('github.token');

  // Get polling interval
  const pollIntervalMs = config.get<number>('synthesis.pollIntervalMs') || 300000; // 5 min

  // Get labels filter
  const labels = config.get<string[]>('synthesis.labels');

  return createSynthesisBridge({
    repos,
    githubToken,
    pollIntervalMs,
    labels,
    maxIssuesPerRepo: 10,
  });
}

/**
 * Configuration helper: Add repo to workspace config
 */
export async function addRepoToConfig(repo: string): Promise<void> {
  const config = vscode.workspace.getConfiguration('lambdaFoundation');
  const existingRepos = config.get<string[]>('synthesis.repos') || [];

  if (!existingRepos.includes(repo)) {
    await config.update(
      'synthesis.repos',
      [...existingRepos, repo],
      vscode.ConfigurationTarget.Workspace
    );

    vscode.window.showInformationMessage(`Added repository: ${repo}`);
  }
}

/**
 * Configuration helper: Remove repo from workspace config
 */
export async function removeRepoFromConfig(repo: string): Promise<void> {
  const config = vscode.workspace.getConfiguration('lambdaFoundation');
  const existingRepos = config.get<string[]>('synthesis.repos') || [];

  const newRepos = existingRepos.filter(r => r !== repo);

  await config.update(
    'synthesis.repos',
    newRepos,
    vscode.ConfigurationTarget.Workspace
  );

  vscode.window.showInformationMessage(`Removed repository: ${repo}`);
}
