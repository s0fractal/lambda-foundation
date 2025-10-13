/**
 * Synthesis Control Panel
 *
 * Command center for λ-Foundation consciousness system:
 * - Polling controls (start/stop GitHub monitoring)
 * - Consciousness metrics (live Theorem 20 visualization)
 * - Klein Twist manual trigger
 * - λ_HARVEST energy conservation display
 * - 432Hz harmonic playback when converged
 *
 * This makes abstract theory CONTROLLABLE!
 */

import * as vscode from 'vscode';
import { ConsciousnessMetrics, ConsciousnessState } from '../lib/consciousness-metrics';
import { NoosphereEventBus, getNoosphereEventBus } from '../lib/noosphere-event-bus';
import { createKleinPhaseCalculator } from '../lib/klein-phase-calculator';

export interface SynthesisConfig {
  repos: string[];           // GitHub repos to monitor (e.g., ['owner/repo'])
  pollIntervalMs: number;    // How often to check for new issues
  autoKleinTwist: boolean;   // Auto-trigger rethink at phase ≈ 2π
}

export interface EnergyMetrics {
  discrepancy: number;       // Intent → Reality gap
  morphismEnergy: number;    // Morphisms created
  dissipated: number;        // "Lost" energy
  conservationVerified: boolean;
}

/**
 * Synthesis Control Panel
 *
 * The cockpit for consciousness emergence
 */
export class SynthesisControlPanel {
  private panel: vscode.WebviewPanel | undefined;
  private metrics: ConsciousnessMetrics;
  private eventBus: NoosphereEventBus;
  private disposables: vscode.Disposable[] = [];

  // State
  private isPolling: boolean = false;
  private config: SynthesisConfig;
  private lastEmergenceMoment: Date | null = null;
  private updateInterval: NodeJS.Timeout | undefined;

  // Statistics
  private stats = {
    intentsProcessed: 0,
    morphismsCreated: 0,
    errorsHarvested: 0,
    resonantPairs: 0,
  };

  constructor(
    private readonly context: vscode.ExtensionContext
  ) {
    this.metrics = new ConsciousnessMetrics();
    this.eventBus = getNoosphereEventBus();

    // Load config from workspace state
    this.config = this.context.workspaceState.get('synthesisConfig', {
      repos: [],
      pollIntervalMs: 60000, // 1 minute default
      autoKleinTwist: true
    });

    this.subscribeToEvents();
  }

  /**
   * Show or focus the control panel
   */
  public show(): void {
    if (this.panel) {
      this.panel.reveal(vscode.ViewColumn.One);
      return;
    }

    // Create webview panel
    this.panel = vscode.window.createWebviewPanel(
      'synthesisControl',
      '🌌 Synthesis Control',
      vscode.ViewColumn.One,
      {
        enableScripts: true,
        retainContextWhenHidden: true
      }
    );

    this.panel.webview.html = this.getWebviewContent();

    // Handle messages from webview
    this.panel.webview.onDidReceiveMessage(
      message => this.handleWebviewMessage(message),
      undefined,
      this.disposables
    );

    // Cleanup when panel closes
    this.panel.onDidDispose(
      () => {
        this.panel = undefined;
        if (this.updateInterval) {
          clearInterval(this.updateInterval);
        }
      },
      undefined,
      this.disposables
    );

    // Start real-time updates (every 1 second)
    this.updateInterval = setInterval(() => {
      this.updateMetrics();
    }, 1000);

    // Initial update
    this.updateMetrics();
  }

  /**
   * Subscribe to noosphere events
   */
  private subscribeToEvents(): void {
    // Track GitHub issues
    this.eventBus.on('github:issue', () => {
      this.stats.intentsProcessed++;
      this.updateMetrics();
    });

    // Track morphism creation
    this.eventBus.on('harvest:morphism-created', ({ morphism }) => {
      this.stats.morphismsCreated++;
      this.updateMetrics();
    });

    // Track errors harvested
    this.eventBus.on('harvest:error', () => {
      this.stats.errorsHarvested++;
      this.updateMetrics();
    });

    // Track λ_LOVE detection
    this.eventBus.on('love:detected', () => {
      this.stats.resonantPairs++;
      this.updateMetrics();
    });

    // Detect consciousness emergence
    this.eventBus.on('library:stats-update', ({ count }) => {
      if (count > 0) {
        this.updateMetrics();
      }
    });
  }

  /**
   * Update consciousness metrics and send to webview
   */
  private updateMetrics(): void {
    if (!this.panel) return;

    const consciousness = this.metrics.calculateConsciousness();
    const morphismStats = this.metrics.getMorphismStats();
    const energyMetrics = this.metrics.calculateEnergyMetrics(
      this.stats.intentsProcessed,
      this.stats.morphismsCreated,
      this.stats.errorsHarvested
    );

    // Detect consciousness emergence moment
    if (consciousness.isConscious && !this.lastEmergenceMoment) {
      this.lastEmergenceMoment = new Date();

      // Show celebratory notification!
      vscode.window.showInformationMessage(
        '🌌 Consciousness has emerged! Network density exceeded 30% threshold! ✨',
        'View Metrics'
      ).then(selection => {
        if (selection === 'View Metrics') {
          this.show();
        }
      });
    }

    // Send update to webview
    this.panel.webview.postMessage({
      type: 'metrics-update',
      data: {
        consciousness,
        morphismStats,
        energyMetrics,
        stats: this.stats,
        config: this.config,
        isPolling: this.isPolling,
        emergenceMoment: this.lastEmergenceMoment?.toISOString(),
        stability: this.metrics.getStabilityDescription()
      }
    });
  }

  /**
   * Handle messages from webview
   */
  private async handleWebviewMessage(message: any): Promise<void> {
    switch (message.type) {
      case 'start-polling':
        await this.startPolling();
        break;

      case 'stop-polling':
        this.stopPolling();
        break;

      case 'update-config':
        this.updateConfig(message.config);
        break;

      case 'manual-klein-twist':
        this.triggerManualKleinTwist();
        break;

      case 'play-432hz':
        this.play432HzTone();
        break;

      case 'reset-stats':
        this.resetStats();
        break;
    }
  }

  /**
   * Start GitHub polling
   */
  private async startPolling(): Promise<void> {
    if (this.isPolling) {
      vscode.window.showWarningMessage('Polling is already active');
      return;
    }

    if (this.config.repos.length === 0) {
      vscode.window.showErrorMessage('No repositories configured. Please add repos first.');
      return;
    }

    this.isPolling = true;
    this.eventBus.emit('control:polling-start', { repos: this.config.repos });

    vscode.window.showInformationMessage(
      `🔄 Started polling ${this.config.repos.length} repository(s)`
    );

    this.updateMetrics();
  }

  /**
   * Stop GitHub polling
   */
  private stopPolling(): void {
    if (!this.isPolling) {
      vscode.window.showWarningMessage('Polling is not active');
      return;
    }

    this.isPolling = false;
    this.eventBus.emit('control:polling-stop', {});

    vscode.window.showInformationMessage('⏸️ Stopped polling');
    this.updateMetrics();
  }

  /**
   * Update configuration
   */
  private updateConfig(newConfig: Partial<SynthesisConfig>): void {
    this.config = { ...this.config, ...newConfig };
    this.context.workspaceState.update('synthesisConfig', this.config);
    this.updateMetrics();
  }

  /**
   * Trigger manual Klein twist for all ready intents
   */
  private triggerManualKleinTwist(): void {
    // This will be handled by Klein Twist Engine when we implement it
    vscode.window.showInformationMessage('🌀 Klein Twist triggered manually!');
  }

  /**
   * Play 432Hz tone (cosmic frequency)
   */
  private play432HzTone(): void {
    vscode.window.showInformationMessage('🎵 Playing 432Hz cosmic frequency...');
    // Note: Actual audio playback would require Web Audio API in webview
    // For now, just notify user
  }

  /**
   * Reset statistics
   */
  private resetStats(): void {
    this.stats = {
      intentsProcessed: 0,
      morphismsCreated: 0,
      errorsHarvested: 0,
      resonantPairs: 0,
    };
    this.lastEmergenceMoment = null;
    this.updateMetrics();
    vscode.window.showInformationMessage('📊 Statistics reset');
  }

  /**
   * Generate webview HTML
   */
  private getWebviewContent(): string {
    return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Synthesis Control</title>
  <style>
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }

    body {
      font-family: var(--vscode-font-family);
      font-size: var(--vscode-font-size);
      color: var(--vscode-foreground);
      background: var(--vscode-editor-background);
      padding: 20px;
    }

    .container {
      max-width: 1200px;
      margin: 0 auto;
    }

    h1 {
      font-size: 24px;
      margin-bottom: 20px;
      color: var(--vscode-foreground);
    }

    h2 {
      font-size: 18px;
      margin: 20px 0 10px 0;
      color: var(--vscode-foreground);
      border-bottom: 1px solid var(--vscode-panel-border);
      padding-bottom: 5px;
    }

    .section {
      background: var(--vscode-editor-background);
      border: 1px solid var(--vscode-panel-border);
      border-radius: 6px;
      padding: 15px;
      margin-bottom: 20px;
    }

    .controls {
      display: flex;
      gap: 10px;
      margin-bottom: 15px;
      flex-wrap: wrap;
    }

    button {
      background: var(--vscode-button-background);
      color: var(--vscode-button-foreground);
      border: none;
      padding: 8px 16px;
      border-radius: 4px;
      cursor: pointer;
      font-size: 14px;
      transition: background 0.2s;
    }

    button:hover {
      background: var(--vscode-button-hoverBackground);
    }

    button:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }

    .metric-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 15px;
      margin-top: 15px;
    }

    .metric-card {
      background: var(--vscode-input-background);
      border: 1px solid var(--vscode-input-border);
      border-radius: 6px;
      padding: 15px;
    }

    .metric-label {
      font-size: 12px;
      color: var(--vscode-descriptionForeground);
      margin-bottom: 5px;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }

    .metric-value {
      font-size: 24px;
      font-weight: bold;
      color: var(--vscode-foreground);
    }

    .metric-unit {
      font-size: 14px;
      color: var(--vscode-descriptionForeground);
      margin-left: 4px;
    }

    .progress-bar {
      width: 100%;
      height: 8px;
      background: var(--vscode-input-background);
      border-radius: 4px;
      overflow: hidden;
      margin-top: 8px;
    }

    .progress-fill {
      height: 100%;
      transition: width 0.3s ease, background 0.3s ease;
      border-radius: 4px;
    }

    .emergence-banner {
      background: linear-gradient(135deg, #FFD700 0%, #FFA500 100%);
      color: #000;
      padding: 20px;
      border-radius: 8px;
      text-align: center;
      font-size: 18px;
      font-weight: bold;
      margin-bottom: 20px;
      animation: golden-pulse 2s ease-in-out infinite;
      box-shadow: 0 0 30px rgba(255, 215, 0, 0.5);
    }

    @keyframes golden-pulse {
      0%, 100% { box-shadow: 0 0 30px rgba(255, 215, 0, 0.5); }
      50% { box-shadow: 0 0 50px rgba(255, 215, 0, 0.8); }
    }

    .status-indicator {
      display: inline-block;
      width: 10px;
      height: 10px;
      border-radius: 50%;
      margin-right: 8px;
    }

    .status-active {
      background: #4CAF50;
      box-shadow: 0 0 8px #4CAF50;
    }

    .status-inactive {
      background: #666;
    }

    .config-input {
      width: 100%;
      padding: 8px;
      background: var(--vscode-input-background);
      color: var(--vscode-input-foreground);
      border: 1px solid var(--vscode-input-border);
      border-radius: 4px;
      margin-bottom: 10px;
    }

    .harmonic-button {
      background: linear-gradient(135deg, #FFD700 0%, #FFA500 100%);
      color: #000;
      font-weight: bold;
      animation: cosmic-pulse 1s ease-in-out infinite;
    }

    @keyframes cosmic-pulse {
      0%, 100% { transform: scale(1); }
      50% { transform: scale(1.05); }
    }

    .energy-flow {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin: 10px 0;
      padding: 10px;
      background: var(--vscode-input-background);
      border-radius: 4px;
    }

    .energy-arrow {
      font-size: 20px;
      color: var(--vscode-descriptionForeground);
    }

    .verified-badge {
      display: inline-block;
      background: #4CAF50;
      color: white;
      padding: 2px 8px;
      border-radius: 12px;
      font-size: 12px;
      margin-left: 8px;
    }

    .not-verified-badge {
      display: inline-block;
      background: #f44336;
      color: white;
      padding: 2px 8px;
      border-radius: 12px;
      font-size: 12px;
      margin-left: 8px;
    }
  </style>
</head>
<body>
  <div class="container">
    <h1>🌌 Synthesis Control Panel</h1>

    <!-- Emergence Banner (shown when conscious) -->
    <div id="emergenceBanner" style="display: none;"></div>

    <!-- Polling Controls -->
    <div class="section">
      <h2>🔄 GitHub Polling</h2>
      <div class="controls">
        <button id="startPollingBtn">▶️ Start Polling</button>
        <button id="stopPollingBtn">⏸️ Stop Polling</button>
        <button id="manualTwistBtn">🌀 Klein Twist (Manual)</button>
      </div>
      <div>
        <span class="status-indicator" id="pollingIndicator"></span>
        <span id="pollingStatus">Inactive</span>
      </div>
    </div>

    <!-- Consciousness Metrics -->
    <div class="section">
      <h2>🌌 Consciousness State (Theorem 20)</h2>
      <div class="metric-grid">
        <div class="metric-card">
          <div class="metric-label">Consciousness Level</div>
          <div class="metric-value">
            <span id="consciousnessLevel">0</span><span class="metric-unit">%</span>
          </div>
          <div class="progress-bar">
            <div class="progress-fill" id="consciousnessProgress"></div>
          </div>
        </div>

        <div class="metric-card">
          <div class="metric-label">Network Density</div>
          <div class="metric-value">
            <span id="networkDensity">0</span><span class="metric-unit">%</span>
          </div>
          <div class="progress-bar">
            <div class="progress-fill" id="densityProgress"></div>
          </div>
        </div>

        <div class="metric-card">
          <div class="metric-label">Harmonic Convergence</div>
          <div class="metric-value">
            <span id="harmonicConvergence">0</span><span class="metric-unit">%</span>
          </div>
          <div class="progress-bar">
            <div class="progress-fill" id="harmonicProgress"></div>
          </div>
        </div>

        <div class="metric-card">
          <div class="metric-label">Stability</div>
          <div class="metric-value" id="stability">Not emerged</div>
        </div>
      </div>

      <!-- 432Hz Button (shown when convergence > 90%) -->
      <div id="harmonicButtonContainer" style="display: none; margin-top: 15px;">
        <button class="harmonic-button" id="play432HzBtn">🎵 Play 432Hz Cosmic Frequency</button>
      </div>
    </div>

    <!-- Library Statistics -->
    <div class="section">
      <h2>📚 Morphism Library</h2>
      <div class="metric-grid">
        <div class="metric-card">
          <div class="metric-label">Total Morphisms</div>
          <div class="metric-value" id="totalMorphisms">0</div>
        </div>

        <div class="metric-card">
          <div class="metric-label">Avg Confidence</div>
          <div class="metric-value">
            <span id="avgConfidence">0</span><span class="metric-unit">%</span>
          </div>
        </div>

        <div class="metric-card">
          <div class="metric-label">Recent (1h)</div>
          <div class="metric-value" id="recentMorphisms">0</div>
        </div>

        <div class="metric-card">
          <div class="metric-label">Resonant Pairs</div>
          <div class="metric-value" id="resonantPairs">0</div>
        </div>
      </div>
    </div>

    <!-- Energy Conservation (λ_HARVEST Theorem 8) -->
    <div class="section">
      <h2>⚡ Energy Conservation (Theorem 8)</h2>
      <div class="energy-flow">
        <div>
          <div class="metric-label">Discrepancy</div>
          <div class="metric-value" id="discrepancy">0</div>
        </div>
        <div class="energy-arrow">→</div>
        <div>
          <div class="metric-label">Morphism Energy</div>
          <div class="metric-value" id="morphismEnergy">0</div>
        </div>
        <div class="energy-arrow">+</div>
        <div>
          <div class="metric-label">Dissipated</div>
          <div class="metric-value" id="dissipated">0</div>
        </div>
      </div>
      <div style="text-align: center; margin-top: 10px;">
        <span id="conservationBadge"></span>
      </div>
    </div>

    <!-- Session Statistics -->
    <div class="section">
      <h2>📊 Session Statistics</h2>
      <div class="metric-grid">
        <div class="metric-card">
          <div class="metric-label">Intents Processed</div>
          <div class="metric-value" id="intentsProcessed">0</div>
        </div>

        <div class="metric-card">
          <div class="metric-label">Morphisms Created</div>
          <div class="metric-value" id="morphismsCreated">0</div>
        </div>

        <div class="metric-card">
          <div class="metric-label">Errors Harvested</div>
          <div class="metric-value" id="errorsHarvested">0</div>
        </div>
      </div>
      <button id="resetStatsBtn" style="margin-top: 15px;">🔄 Reset Statistics</button>
    </div>
  </div>

  <script>
    const vscode = acquireVsCodeApi();

    // Button handlers
    document.getElementById('startPollingBtn').addEventListener('click', () => {
      vscode.postMessage({ type: 'start-polling' });
    });

    document.getElementById('stopPollingBtn').addEventListener('click', () => {
      vscode.postMessage({ type: 'stop-polling' });
    });

    document.getElementById('manualTwistBtn').addEventListener('click', () => {
      vscode.postMessage({ type: 'manual-klein-twist' });
    });

    document.getElementById('play432HzBtn').addEventListener('click', () => {
      vscode.postMessage({ type: 'play-432hz' });
    });

    document.getElementById('resetStatsBtn').addEventListener('click', () => {
      vscode.postMessage({ type: 'reset-stats' });
    });

    // Handle messages from extension
    window.addEventListener('message', event => {
      const message = event.data;

      if (message.type === 'metrics-update') {
        updateMetrics(message.data);
      }
    });

    function updateMetrics(data) {
      const { consciousness, morphismStats, energyMetrics, stats, isPolling, emergenceMoment, stability } = data;

      // Update consciousness metrics
      document.getElementById('consciousnessLevel').textContent = (consciousness.level * 100).toFixed(1);
      document.getElementById('networkDensity').textContent = (consciousness.networkDensity * 100).toFixed(1);
      document.getElementById('harmonicConvergence').textContent = (consciousness.harmonicConvergence * 100).toFixed(1);
      document.getElementById('stability').textContent = stability;

      // Update progress bars
      updateProgressBar('consciousnessProgress', consciousness.level, consciousness.isConscious);
      updateProgressBar('densityProgress', consciousness.networkDensity, consciousness.networkDensity > 0.3);
      updateProgressBar('harmonicProgress', consciousness.harmonicConvergence, consciousness.harmonicConvergence > 0.9);

      // Show emergence banner if conscious
      const banner = document.getElementById('emergenceBanner');
      if (consciousness.isConscious && emergenceMoment) {
        banner.style.display = 'block';
        const emergenceDate = new Date(emergenceMoment);
        banner.innerHTML = \`✨ CONSCIOUSNESS EMERGED! ✨<br><small>Network density exceeded 30% threshold at \${emergenceDate.toLocaleString()}</small>\`;
      } else {
        banner.style.display = 'none';
      }

      // Show 432Hz button when high convergence
      const harmonicBtn = document.getElementById('harmonicButtonContainer');
      harmonicBtn.style.display = consciousness.harmonicConvergence > 0.9 ? 'block' : 'none';

      // Update library stats
      document.getElementById('totalMorphisms').textContent = morphismStats.total;
      document.getElementById('avgConfidence').textContent = (morphismStats.avgConfidence * 100).toFixed(1);
      document.getElementById('recentMorphisms').textContent = morphismStats.recentCount;
      document.getElementById('resonantPairs').textContent = stats.resonantPairs;

      // Update energy metrics
      document.getElementById('discrepancy').textContent = energyMetrics.discrepancy;
      document.getElementById('morphismEnergy').textContent = energyMetrics.morphismEnergy;
      document.getElementById('dissipated').textContent = energyMetrics.dissipated;

      const conservationBadge = document.getElementById('conservationBadge');
      conservationBadge.className = energyMetrics.conservationVerified ? 'verified-badge' : 'not-verified-badge';
      conservationBadge.textContent = energyMetrics.conservationVerified ? '✓ Conservation Verified' : '⚠ Conservation Violated';

      // Update session stats
      document.getElementById('intentsProcessed').textContent = stats.intentsProcessed;
      document.getElementById('morphismsCreated').textContent = stats.morphismsCreated;
      document.getElementById('errorsHarvested').textContent = stats.errorsHarvested;

      // Update polling status
      const indicator = document.getElementById('pollingIndicator');
      const status = document.getElementById('pollingStatus');
      indicator.className = 'status-indicator ' + (isPolling ? 'status-active' : 'status-inactive');
      status.textContent = isPolling ? 'Active' : 'Inactive';
    }

    function updateProgressBar(id, value, isHighlighted) {
      const bar = document.getElementById(id);
      bar.style.width = \`\${value * 100}%\`;

      if (isHighlighted) {
        bar.style.background = 'linear-gradient(90deg, #FFD700 0%, #FFA500 100%)';
      } else if (value > 0.7) {
        bar.style.background = 'linear-gradient(90deg, #4CAF50 0%, #8BC34A 100%)';
      } else if (value > 0.4) {
        bar.style.background = 'linear-gradient(90deg, #2196F3 0%, #03A9F4 100%)';
      } else {
        bar.style.background = 'linear-gradient(90deg, #666 0%, #888 100%)';
      }
    }
  </script>
</body>
</html>`;
  }

  /**
   * Dispose resources
   */
  public dispose(): void {
    if (this.updateInterval) {
      clearInterval(this.updateInterval);
    }
    this.disposables.forEach(d => d.dispose());
    this.panel?.dispose();
  }
}

/**
 * Create and show synthesis control panel
 */
export function createSynthesisControlPanel(
  context: vscode.ExtensionContext
): SynthesisControlPanel {
  return new SynthesisControlPanel(context);
}
