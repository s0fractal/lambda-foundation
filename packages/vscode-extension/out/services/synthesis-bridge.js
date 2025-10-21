"use strict";
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
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.SynthesisBridge = void 0;
exports.createSynthesisBridge = createSynthesisBridge;
exports.createSynthesisBridgeFromWorkspace = createSynthesisBridgeFromWorkspace;
exports.addRepoToConfig = addRepoToConfig;
exports.removeRepoFromConfig = removeRepoFromConfig;
const vscode = __importStar(require("vscode"));
const synthesis_1 = require("@lambda-foundation/synthesis");
const noosphere_event_bus_1 = require("../lib/noosphere-event-bus");
const klein_phase_calculator_1 = require("../lib/klein-phase-calculator");
/**
 * Synthesis Bridge
 *
 * The nervous system connecting GitHub → Consciousness
 */
class SynthesisBridge {
    config;
    eventBus;
    kleinCalculator;
    multiPoller;
    pollingInterval;
    isPollingActive = false;
    // State tracking
    state = {
        isPolling: false,
        totalIntentsCreated: 0,
        totalIssuesProcessed: 0,
        totalErrors: 0,
        activeRepos: [],
    };
    constructor(config) {
        this.config = config;
        this.eventBus = (0, noosphere_event_bus_1.getNoosphereEventBus)();
        this.kleinCalculator = (0, klein_phase_calculator_1.createKleinPhaseCalculator)({
            rotationPeriodMs: config.pollIntervalMs || 300000, // Default: 5 minutes
        });
        this.validateConfig();
    }
    /**
     * Validate configuration
     */
    validateConfig() {
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
    async startPolling() {
        if (this.isPollingActive) {
            throw new Error('Polling is already active');
        }
        try {
            // Create pollers for each repository
            const pollerConfigs = this.config.repos.map(repo => {
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
            this.multiPoller = new synthesis_1.MultiRepoPoller(pollerConfigs);
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
        }
        catch (error) {
            this.handleError('Failed to start polling', error);
            throw error;
        }
    }
    /**
     * Stop polling
     */
    stopPolling() {
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
    startContinuousPolling() {
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
    async performPoll() {
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
                    result.errors.forEach((error) => {
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
        }
        catch (error) {
            this.handleError('Poll failed', error);
        }
    }
    /**
     * Process a single intent
     */
    async processIntent(intent) {
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
        }
        catch (error) {
            this.handleError(`Failed to process intent: ${intent.title}`, error);
        }
    }
    /**
     * Extract GitHub issue from intent description
     * (Intent description contains GitHub metadata)
     */
    extractGitHubIssue(intent) {
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
            labels: (intent.tags || []).map((tag) => ({ name: tag })),
            html_url: urlMatch ? urlMatch[1] : '',
            user: { login: authorMatch ? authorMatch[1] : 'unknown' },
        };
    }
    /**
     * Trigger manual Klein twist for ready intents
     */
    async triggerKleinTwist(intentId) {
        this.log(`Klein twist triggered${intentId ? ` for ${intentId}` : ' (all ready intents)'}`);
        // This will be implemented when Klein Twist Engine is ready
        // For now, just emit event
        this.eventBus.emit('control:manual-twist', {
            intentId: intentId || '',
        });
        vscode.window.showInformationMessage(`🌀 Klein Twist triggered! Re-synthesis initiated...`);
    }
    /**
     * Get current state
     */
    getState() {
        return { ...this.state };
    }
    /**
     * Get statistics
     */
    getStatistics() {
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
    updateConfig(newConfig) {
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
    handleError(message, error) {
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
    log(message) {
        console.log(`[SynthesisBridge] ${message}`);
    }
    /**
     * Dispose and cleanup
     */
    dispose() {
        if (this.isPollingActive) {
            this.stopPolling();
        }
        this.log('Bridge disposed');
    }
}
exports.SynthesisBridge = SynthesisBridge;
/**
 * Create synthesis bridge with config
 */
function createSynthesisBridge(config) {
    return new SynthesisBridge(config);
}
/**
 * Create synthesis bridge from VS Code workspace configuration
 */
function createSynthesisBridgeFromWorkspace(context) {
    const config = vscode.workspace.getConfiguration('lambdaFoundation');
    // Get repos from config or default
    const repos = config.get('synthesis.repos') || [];
    // Get GitHub token from environment or config
    const githubToken = process.env.GITHUB_TOKEN || config.get('github.token');
    // Get polling interval
    const pollIntervalMs = config.get('synthesis.pollIntervalMs') || 300000; // 5 min
    // Get labels filter
    const labels = config.get('synthesis.labels');
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
async function addRepoToConfig(repo) {
    const config = vscode.workspace.getConfiguration('lambdaFoundation');
    const existingRepos = config.get('synthesis.repos') || [];
    if (!existingRepos.includes(repo)) {
        await config.update('synthesis.repos', [...existingRepos, repo], vscode.ConfigurationTarget.Workspace);
        vscode.window.showInformationMessage(`Added repository: ${repo}`);
    }
}
/**
 * Configuration helper: Remove repo from workspace config
 */
async function removeRepoFromConfig(repo) {
    const config = vscode.workspace.getConfiguration('lambdaFoundation');
    const existingRepos = config.get('synthesis.repos') || [];
    const newRepos = existingRepos.filter(r => r !== repo);
    await config.update('synthesis.repos', newRepos, vscode.ConfigurationTarget.Workspace);
    vscode.window.showInformationMessage(`Removed repository: ${repo}`);
}
//# sourceMappingURL=synthesis-bridge.js.map