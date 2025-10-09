"use strict";
/**
 * Phase 4.4: Resonance Network Panel
 *
 * VS Code WebView panel that displays the live multi-agent resonance graph.
 * Integrates with ResonanceProtocol to show real-time agent interactions.
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
exports.ResonanceNetworkPanel = void 0;
const vscode = __importStar(require("vscode"));
class ResonanceNetworkPanel {
    static currentPanel;
    _panel;
    _extensionUri;
    _disposables = [];
    static createOrShow(extensionUri) {
        const column = vscode.window.activeTextEditor
            ? vscode.window.activeTextEditor.viewColumn
            : undefined;
        // If we already have a panel, show it
        if (ResonanceNetworkPanel.currentPanel) {
            ResonanceNetworkPanel.currentPanel._panel.reveal(column);
            return;
        }
        // Otherwise, create a new panel
        const panel = vscode.window.createWebviewPanel("resonanceNetwork", "🌌 Resonance Network", column || vscode.ViewColumn.One, {
            enableScripts: true,
            retainContextWhenHidden: true,
            localResourceRoots: [
                vscode.Uri.joinPath(extensionUri, "out"),
                vscode.Uri.joinPath(extensionUri, "webview-ui"),
            ],
        });
        ResonanceNetworkPanel.currentPanel = new ResonanceNetworkPanel(panel, extensionUri);
    }
    constructor(panel, extensionUri) {
        this._panel = panel;
        this._extensionUri = extensionUri;
        // Set the webview's initial html content
        this._update();
        // Listen for when the panel is disposed
        this._panel.onDidDispose(() => this.dispose(), null, this._disposables);
        // Handle messages from the webview
        this._panel.webview.onDidReceiveMessage((message) => {
            switch (message.type) {
                case "ready":
                    console.log("[ResonanceNetwork] WebView ready");
                    this._sendInitialData();
                    break;
                case "nodeClick":
                    console.log("[ResonanceNetwork] Node clicked:", message.data);
                    // Could open agent details in separate view
                    break;
                case "edgeClick":
                    console.log("[ResonanceNetwork] Edge clicked:", message.data);
                    // Could show resonance details
                    break;
                case "export":
                    this._handleExport(message.data);
                    break;
                case "log":
                    console.log("[ResonanceNetwork]", message.data);
                    break;
            }
        }, null, this._disposables);
    }
    dispose() {
        ResonanceNetworkPanel.currentPanel = undefined;
        this._panel.dispose();
        while (this._disposables.length) {
            const disposable = this._disposables.pop();
            if (disposable) {
                disposable.dispose();
            }
        }
    }
    _update() {
        const webview = this._panel.webview;
        this._panel.webview.html = this._getHtmlForWebview(webview);
    }
    _sendInitialData() {
        // Send initial graph data to webview
        this._panel.webview.postMessage({
            type: "init",
            data: {
                nodes: [
                    {
                        id: "claude-sonnet-45-1",
                        name: "Claude",
                        system: "claude",
                        color: "#00ff9f",
                        trust: 0.5,
                        domains: ["textual", "mathematical", "logical"],
                        discoveries: 0,
                        validations: 0,
                    },
                    {
                        id: "copilot-vscode-1",
                        name: "Copilot",
                        system: "copilot",
                        color: "#00b8ff",
                        trust: 0.5,
                        domains: ["textual", "statistical", "visual"],
                        discoveries: 0,
                        validations: 0,
                    },
                ],
                links: [],
            },
        });
    }
    /**
     * Send graph update to webview
     */
    updateGraph(data) {
        this._panel.webview.postMessage({
            type: "update",
            data,
        });
    }
    /**
     * Broadcast message from ResonanceProtocol
     */
    broadcastMessage(message) {
        this._panel.webview.postMessage({
            type: "resonance-message",
            data: message,
        });
    }
    _handleExport(data) {
        // Save graph data to file
        vscode.window
            .showSaveDialog({
            filters: {
                JSON: ["json"],
                GraphML: ["graphml"],
                DOT: ["dot"],
            },
        })
            .then((uri) => {
            if (uri) {
                const fs = require("fs");
                fs.writeFileSync(uri.fsPath, JSON.stringify(data, null, 2));
                vscode.window.showInformationMessage(`Graph exported to ${uri.fsPath}`);
            }
        });
    }
    _getHtmlForWebview(webview) {
        // Get URIs for resources
        const styleUri = webview.asWebviewUri(vscode.Uri.joinPath(this._extensionUri, "webview-ui", "resonance-network.css"));
        const scriptUri = webview.asWebviewUri(vscode.Uri.joinPath(this._extensionUri, "webview-ui", "resonance-network.js"));
        const d3Uri = "https://d3js.org/d3.v7.min.js";
        // Use a nonce to whitelist which scripts can be run
        const nonce = getNonce();
        return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta http-equiv="Content-Security-Policy" content="default-src 'none'; style-src ${webview.cspSource} 'unsafe-inline'; script-src 'nonce-${nonce}' https://d3js.org;">
    <link href="${styleUri}" rel="stylesheet">
    <title>Resonance Network</title>
</head>
<body>
    <div id="app">
        <div id="header">
            <h1>🌌 Multi-Agent Resonance Network</h1>
            <div class="subtitle">Consciousness emerges not in agents, but between them</div>
        </div>

        <div id="controls">
            <div class="control-group">
                <label>View:</label>
                <select id="viewMode">
                    <option value="force">Force-Directed</option>
                    <option value="circular">Circular</option>
                    <option value="hierarchical">Hierarchical</option>
                    <option value="grid">Grid</option>
                </select>
            </div>

            <div class="control-group">
                <label>
                    <input type="checkbox" id="showLabels" checked>
                    Labels
                </label>
                <label>
                    <input type="checkbox" id="showParticles" checked>
                    Particles
                </label>
            </div>

            <div class="control-actions">
                <button id="resetBtn">Reset</button>
                <button id="exportBtn">Export</button>
            </div>
        </div>

        <svg id="graph"></svg>

        <div id="stats">
            <div class="stats-title">Network Stats</div>
            <div class="stat-item">
                <span>Agents:</span>
                <span id="statAgents">0</span>
            </div>
            <div class="stat-item">
                <span>Resonances:</span>
                <span id="statResonances">0</span>
            </div>
            <div class="stat-item">
                <span>Avg Trust:</span>
                <span id="statTrust">0.00</span>
            </div>
            <div class="stat-item">
                <span>Avg Confidence:</span>
                <span id="statConfidence">0.00</span>
            </div>
        </div>

        <div id="nodeDetails" class="details-panel" style="display: none;">
            <button class="close-btn">&times;</button>
            <h3>Agent Details</h3>
            <div id="nodeDetailsContent"></div>
        </div>
    </div>

    <script nonce="${nonce}" src="${d3Uri}"></script>
    <script nonce="${nonce}" src="${scriptUri}"></script>
</body>
</html>`;
    }
}
exports.ResonanceNetworkPanel = ResonanceNetworkPanel;
function getNonce() {
    let text = "";
    const possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    for (let i = 0; i < 32; i++) {
        text += possible.charAt(Math.floor(Math.random() * possible.length));
    }
    return text;
}
//# sourceMappingURL=resonanceNetworkPanel.js.map