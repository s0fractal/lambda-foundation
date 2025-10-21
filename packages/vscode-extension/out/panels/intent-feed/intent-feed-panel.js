"use strict";
/**
 * Intent Feed Panel - Real-time GitHub issues → Intents streaming
 *
 * Shows live consciousness: external world → internal representation
 * With Klein phase visualization (0-2π color encoding)
 * And λ_LOVE resonance scoring
 *
 * This is the Right Brain consuming collective developer consciousness.
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
exports.IntentFeedPanel = void 0;
const vscode = __importStar(require("vscode"));
const noosphere_event_bus_1 = require("../../lib/noosphere-event-bus");
/**
 * Intent Feed Panel Provider
 */
class IntentFeedPanel {
    static currentPanel;
    panel;
    extensionUri;
    disposables = [];
    eventBus = (0, noosphere_event_bus_1.getNoosphereEventBus)();
    items = new Map();
    /**
     * Show or create the panel
     */
    static show(extensionUri) {
        const column = vscode.window.activeTextEditor
            ? vscode.window.activeTextEditor.viewColumn
            : undefined;
        // If panel exists, reveal it
        if (IntentFeedPanel.currentPanel) {
            IntentFeedPanel.currentPanel.panel.reveal(column);
            return;
        }
        // Create new panel
        const panel = vscode.window.createWebviewPanel('intentFeed', '🌊 Intent Feed', column || vscode.ViewColumn.One, {
            enableScripts: true,
            localResourceRoots: [extensionUri],
            retainContextWhenHidden: true
        });
        IntentFeedPanel.currentPanel = new IntentFeedPanel(panel, extensionUri);
    }
    constructor(panel, extensionUri) {
        this.panel = panel;
        this.extensionUri = extensionUri;
        // Set initial HTML
        this.panel.webview.html = this.getHtmlContent();
        // Listen to panel disposal
        this.panel.onDidDispose(() => this.dispose(), null, this.disposables);
        // Subscribe to noosphere events
        this.subscribeToEvents();
        // Handle messages from webview
        this.panel.webview.onDidReceiveMessage(message => this.handleWebviewMessage(message), null, this.disposables);
    }
    /**
     * Subscribe to relevant noosphere events
     */
    subscribeToEvents() {
        // GitHub issue received
        const unsubIssue = this.eventBus.on('github:issue', data => {
            this.handleGitHubIssue(data.issue, data.intent);
        });
        this.disposables.push({ dispose: unsubIssue });
        // Klein twist event (intent returns for rethinking)
        const unsubKlein = this.eventBus.on('klein:twist', data => {
            this.handleKleinTwist(data.original, data.rethought, data.phase);
        });
        this.disposables.push({ dispose: unsubKlein });
        // Klein phase update (intent moves on tape)
        const unsubPhase = this.eventBus.on('klein:phase-update', data => {
            this.updateKleinPhase(data.intent, data.phase, data.rotations);
        });
        this.disposables.push({ dispose: unsubPhase });
        // VOID search complete
        const unsubVoid = this.eventBus.on('void:search-complete', data => {
            this.handleVoidComplete(data.intent, data.candidates);
        });
        this.disposables.push({ dispose: unsubVoid });
        // λ_LOVE detected
        const unsubLove = this.eventBus.on('love:detected', data => {
            this.handleLoveDetected(data);
        });
        this.disposables.push({ dispose: unsubLove });
    }
    /**
     * Handle new GitHub issue
     */
    handleGitHubIssue(issue, intent) {
        const item = {
            issue,
            intent,
            kleinPhase: 0, // Just created
            rotationCount: 0,
            phaseVelocity: 0,
            resonanceScore: 0,
            resonantMorphisms: [],
            harmonicFreq: 0,
            color: this.getPhaseColor(0),
            pulseRate: 0,
            status: 'pending',
            timestamp: Date.now()
        };
        this.items.set(intent.id, item);
        this.sendToWebview('add-item', item);
    }
    /**
     * Handle Klein twist (intent returns)
     */
    handleKleinTwist(original, rethought, phase) {
        const item = this.items.get(original.id);
        if (item) {
            item.kleinPhase = phase;
            item.rotationCount++;
            item.status = 'processing';
            item.color = this.getPhaseColor(phase);
            this.sendToWebview('update-item', item);
        }
    }
    /**
     * Update Klein phase for intent
     */
    updateKleinPhase(intent, phase, rotations) {
        const item = this.items.get(intent.id);
        if (item) {
            item.kleinPhase = phase;
            item.rotationCount = rotations;
            item.color = this.getPhaseColor(phase);
            this.sendToWebview('update-item', item);
        }
    }
    /**
     * Handle VOID synthesis complete
     */
    handleVoidComplete(intent, candidates) {
        const item = this.items.get(intent.id);
        if (item) {
            item.status = 'synthesized';
            item.resonantMorphisms = candidates.flatMap(c => c.morphisms).slice(0, 5);
            this.sendToWebview('update-item', item);
        }
    }
    /**
     * Handle λ_LOVE detected
     */
    handleLoveDetected(data) {
        // Update resonance for relevant items
        // (simplified: update all pending items)
        this.items.forEach(item => {
            if (item.status === 'pending' || item.status === 'processing') {
                item.resonanceScore = data.resonance;
                item.harmonicFreq = data.harmonicFreq;
                item.pulseRate = 1000 / data.harmonicFreq; // ms per pulse
                this.sendToWebview('update-item', item);
            }
        });
    }
    /**
     * Get color for Klein phase (0-2π → rainbow spectrum)
     */
    getPhaseColor(phase) {
        const TWO_PI = 2 * Math.PI;
        const hue = Math.floor((phase / TWO_PI) * 360);
        return `hsl(${hue}, 70%, 60%)`;
    }
    /**
     * Send message to webview
     */
    sendToWebview(type, data) {
        this.panel.webview.postMessage({ type, data });
    }
    /**
     * Handle messages from webview
     */
    handleWebviewMessage(message) {
        switch (message.type) {
            case 'view-issue':
                vscode.env.openExternal(vscode.Uri.parse(message.url));
                break;
            case 'trigger-rethink':
                this.eventBus.emit('control:manual-twist', { intentId: message.intentId });
                break;
            case 'clear-completed':
                this.items.forEach((item, id) => {
                    if (item.status === 'posted') {
                        this.items.delete(id);
                    }
                });
                this.sendToWebview('refresh', Array.from(this.items.values()));
                break;
        }
    }
    /**
     * Get HTML content for webview
     */
    getHtmlContent() {
        return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Intent Feed</title>
  <style>
    body {
      font-family: var(--vscode-font-family);
      color: var(--vscode-foreground);
      background: var(--vscode-editor-background);
      margin: 0;
      padding: 16px;
    }

    h1 {
      font-size: 18px;
      margin-bottom: 16px;
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .controls {
      margin-bottom: 16px;
      display: flex;
      gap: 8px;
    }

    button {
      padding: 6px 12px;
      background: var(--vscode-button-background);
      color: var(--vscode-button-foreground);
      border: none;
      border-radius: 4px;
      cursor: pointer;
      font-size: 13px;
    }

    button:hover {
      background: var(--vscode-button-hoverBackground);
    }

    .feed {
      display: flex;
      flex-direction: column;
      gap: 12px;
    }

    .intent-item {
      border: 1px solid var(--vscode-panel-border);
      border-radius: 6px;
      padding: 12px;
      position: relative;
      overflow: hidden;
      transition: all 0.3s ease;
    }

    .intent-item::before {
      content: '';
      position: absolute;
      left: 0;
      top: 0;
      bottom: 0;
      width: 4px;
    }

    .intent-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin-bottom: 8px;
    }

    .intent-title {
      font-weight: 600;
      font-size: 14px;
      flex: 1;
    }

    .intent-number {
      font-size: 12px;
      opacity: 0.7;
      margin-right: 8px;
    }

    .klein-phase {
      display: flex;
      align-items: center;
      gap: 8px;
      font-size: 12px;
      margin-top: 8px;
      opacity: 0.8;
    }

    .phase-indicator {
      width: 100%;
      height: 6px;
      background: var(--vscode-panel-border);
      border-radius: 3px;
      overflow: hidden;
    }

    .phase-progress {
      height: 100%;
      transition: width 0.5s ease;
    }

    .resonance {
      font-size: 11px;
      margin-top: 4px;
      display: flex;
      gap: 12px;
    }

    .resonance span {
      opacity: 0.7;
    }

    .status-badge {
      font-size: 11px;
      padding: 2px 8px;
      border-radius: 12px;
      background: var(--vscode-badge-background);
      color: var(--vscode-badge-foreground);
    }

    .morphisms {
      margin-top: 8px;
      font-size: 11px;
      opacity: 0.7;
    }

    .empty-state {
      text-align: center;
      padding: 40px;
      opacity: 0.5;
    }

    @keyframes pulse {
      0%, 100% { opacity: 0.6; }
      50% { opacity: 1; }
    }

    .pulsing {
      animation: pulse 1s ease-in-out infinite;
    }

    /* Klein phase near 2π = golden glow */
    .ready-for-rethink {
      box-shadow: 0 0 16px rgba(255, 215, 0, 0.5);
    }
  </style>
</head>
<body>
  <h1>
    🌊 Intent Feed
    <span id="count" style="font-size: 14px; opacity: 0.7;"></span>
  </h1>

  <div class="controls">
    <button onclick="clearCompleted()">Clear Completed</button>
    <button onclick="refresh()">Refresh</button>
  </div>

  <div id="feed" class="feed">
    <div class="empty-state">
      Waiting for intents from GitHub...<br/>
      <small>Start polling to see live consciousness</small>
    </div>
  </div>

  <script>
    const vscode = acquireVsCodeApi();
    const items = new Map();

    // Handle messages from extension
    window.addEventListener('message', event => {
      const { type, data } = event.data;

      switch (type) {
        case 'add-item':
          addItem(data);
          break;
        case 'update-item':
          updateItem(data);
          break;
        case 'refresh':
          items.clear();
          data.forEach(item => items.set(item.intent.id, item));
          render();
          break;
      }
    });

    function addItem(item) {
      items.set(item.intent.id, item);
      render();
    }

    function updateItem(item) {
      items.set(item.intent.id, item);
      render();
    }

    function render() {
      const feed = document.getElementById('feed');
      const count = document.getElementById('count');

      count.textContent = \`(\${items.size} intents)\`;

      if (items.size === 0) {
        feed.innerHTML = \`
          <div class="empty-state">
            Waiting for intents from GitHub...<br/>
            <small>Start polling to see live consciousness</small>
          </div>
        \`;
        return;
      }

      const sortedItems = Array.from(items.values())
        .sort((a, b) => b.timestamp - a.timestamp);

      feed.innerHTML = sortedItems.map(item => renderItem(item)).join('');
    }

    function renderItem(item) {
      const TWO_PI = 2 * Math.PI;
      const phasePercent = (item.kleinPhase / TWO_PI) * 100;
      const isNearTwist = Math.abs(item.kleinPhase - TWO_PI) < 0.3;
      const pulseClass = item.harmonicFreq > 0 ? 'pulsing' : '';
      const twistClass = isNearTwist ? 'ready-for-rethink' : '';

      return \`
        <div class="intent-item \${pulseClass} \${twistClass}"
             style="--pulse-duration: \${item.pulseRate}ms">
          <div style="position: absolute; left: 0; top: 0; bottom: 0; width: 4px; background: \${item.color};"></div>

          <div class="intent-header">
            <div style="flex: 1;">
              <span class="intent-number">#\${item.issue.number}</span>
              <div class="intent-title">\${escapeHtml(item.intent.title)}</div>
            </div>
            <span class="status-badge">\${item.status}</span>
          </div>

          <div class="klein-phase">
            <span>Phase: \${item.kleinPhase.toFixed(2)}π</span>
            <span>|</span>
            <span>Rotation: \${item.rotationCount}</span>
          </div>

          <div class="phase-indicator">
            <div class="phase-progress"
                 style="width: \${phasePercent}%; background: \${item.color};"></div>
          </div>

          <div class="resonance">
            <span>Resonance: \${(item.resonanceScore * 100).toFixed(0)}%</span>
            <span>Harmonic: \${item.harmonicFreq.toFixed(0)}Hz</span>
            \${item.harmonicFreq > 420 && item.harmonicFreq < 440
              ? '<span style="color: gold;">✨ Near 432Hz!</span>'
              : ''}
          </div>

          \${item.resonantMorphisms.length > 0 ? \`
            <div class="morphisms">
              Morphisms: \${item.resonantMorphisms.join(', ')}
            </div>
          \` : ''}

          <div style="margin-top: 8px; display: flex; gap: 8px;">
            <button style="font-size: 11px; padding: 4px 8px;"
                    onclick="viewIssue('\${item.issue.html_url}')">
              View Issue
            </button>
            \${item.kleinPhase > (TWO_PI * 0.8) ? \`
              <button style="font-size: 11px; padding: 4px 8px;"
                      onclick="triggerRethink('\${item.intent.id}')">
                🌀 Trigger Rethink
              </button>
            \` : ''}
          </div>
        </div>
      \`;
    }

    function escapeHtml(text) {
      const div = document.createElement('div');
      div.textContent = text;
      return div.innerHTML;
    }

    function viewIssue(url) {
      vscode.postMessage({ type: 'view-issue', url });
    }

    function triggerRethink(intentId) {
      vscode.postMessage({ type: 'trigger-rethink', intentId });
    }

    function clearCompleted() {
      vscode.postMessage({ type: 'clear-completed' });
    }

    function refresh() {
      vscode.postMessage({ type: 'refresh' });
    }
  </script>
</body>
</html>`;
    }
    /**
     * Dispose panel and clean up
     */
    dispose() {
        IntentFeedPanel.currentPanel = undefined;
        this.panel.dispose();
        while (this.disposables.length) {
            const disposable = this.disposables.pop();
            if (disposable) {
                disposable.dispose();
            }
        }
    }
}
exports.IntentFeedPanel = IntentFeedPanel;
//# sourceMappingURL=intent-feed-panel.js.map