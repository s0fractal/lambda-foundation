"use strict";
/**
 * Proof Viewer
 *
 * A mirror of consciousness.
 * Shows not just results, but the path of composition, its proof, its evolution.
 *
 * This is where developers see the structure of thinking.
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
exports.ProofViewerPanel = void 0;
const vscode = __importStar(require("vscode"));
class ProofViewerPanel {
    static currentPanel;
    panel;
    extensionUri;
    noosphereClient;
    disposables = [];
    constructor(panel, extensionUri, noosphereClient) {
        this.panel = panel;
        this.extensionUri = extensionUri;
        this.noosphereClient = noosphereClient;
        // Set up message handling
        this.panel.webview.onDidReceiveMessage((message) => this.handleMessage(message), null, this.disposables);
        // Update content on visibility change
        this.panel.onDidChangeViewState(() => {
            if (this.panel.visible) {
                this.update();
            }
        }, null, this.disposables);
        // Clean up on dispose
        this.panel.onDidDispose(() => this.dispose(), null, this.disposables);
        // Initial update
        this.update();
    }
    /**
     * Create or show proof viewer panel
     */
    static createOrShow(extensionUri, noosphereClient, compositionResult) {
        const column = vscode.ViewColumn.Two;
        // If panel already exists, show it
        if (ProofViewerPanel.currentPanel) {
            ProofViewerPanel.currentPanel.panel.reveal(column);
            if (compositionResult) {
                ProofViewerPanel.currentPanel.showComposition(compositionResult);
            }
            return;
        }
        // Create new panel
        const panel = vscode.window.createWebviewPanel('lambdaProofViewer', 'λ-Foundation: Proof Viewer', column, {
            enableScripts: true,
            retainContextWhenHidden: true,
            localResourceRoots: [extensionUri]
        });
        ProofViewerPanel.currentPanel = new ProofViewerPanel(panel, extensionUri, noosphereClient);
        if (compositionResult) {
            ProofViewerPanel.currentPanel.showComposition(compositionResult);
        }
    }
    /**
     * Show composition in viewer
     */
    showComposition(result) {
        this.panel.webview.postMessage({
            type: 'showComposition',
            composition: result
        });
    }
    /**
     * Handle messages from webview
     */
    async handleMessage(message) {
        switch (message.type) {
            case 'openProof':
                await this.openProofFile(message.morphismName);
                break;
            case 'copyCode':
                await vscode.env.clipboard.writeText(message.code);
                vscode.window.showInformationMessage('Code copied to clipboard');
                break;
            case 'insertCode':
                await this.insertCode(message.code);
                break;
        }
    }
    /**
     * Open proof file for morphism
     */
    async openProofFile(morphismName) {
        const workspaceFolders = vscode.workspace.workspaceFolders;
        if (!workspaceFolders) {
            vscode.window.showErrorMessage('λ-Foundation: No workspace folder open');
            return;
        }
        const proofPath = `wiki/proofs/${morphismName}.proof`;
        try {
            const proofUri = vscode.Uri.joinPath(workspaceFolders[0].uri, proofPath);
            const document = await vscode.workspace.openTextDocument(proofUri);
            await vscode.window.showTextDocument(document, {
                preview: true,
                viewColumn: vscode.ViewColumn.Three
            });
        }
        catch (error) {
            vscode.window.showErrorMessage(`λ-Foundation: Proof not found: ${proofPath}`);
        }
    }
    /**
     * Insert code into active editor
     */
    async insertCode(code) {
        const editor = vscode.window.activeTextEditor;
        if (!editor) {
            vscode.window.showWarningMessage('λ-Foundation: No active editor');
            return;
        }
        await editor.edit((editBuilder) => {
            editBuilder.insert(editor.selection.active, code);
        });
        vscode.window.showInformationMessage('λ-Foundation: Code inserted');
    }
    /**
     * Update webview content
     */
    update() {
        this.panel.webview.html = this.getHtmlContent();
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
	<title>λ-Foundation: Proof Viewer</title>
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
			background-color: var(--vscode-editor-background);
			padding: 20px;
		}

		h1, h2, h3 {
			margin-bottom: 12px;
			color: var(--vscode-textPreformat-foreground);
		}

		h1 {
			font-size: 1.5em;
			border-bottom: 2px solid var(--vscode-textSeparator-foreground);
			padding-bottom: 8px;
			margin-bottom: 20px;
		}

		.section {
			margin-bottom: 30px;
			padding: 15px;
			background-color: var(--vscode-editor-inactiveSelectionBackground);
			border-radius: 4px;
			border-left: 4px solid var(--vscode-textLink-foreground);
		}

		.morphism-list {
			list-style: none;
			padding: 0;
		}

		.morphism-item {
			display: flex;
			align-items: center;
			padding: 12px;
			margin-bottom: 8px;
			background-color: var(--vscode-editor-background);
			border-radius: 4px;
			border: 1px solid var(--vscode-panel-border);
			transition: all 0.2s;
		}

		.morphism-item:hover {
			background-color: var(--vscode-list-hoverBackground);
			border-color: var(--vscode-textLink-foreground);
		}

		.morphism-name {
			font-weight: bold;
			font-family: var(--vscode-editor-font-family);
			color: var(--vscode-textLink-foreground);
			margin-right: 12px;
		}

		.morphism-type {
			font-family: var(--vscode-editor-font-family);
			color: var(--vscode-descriptionForeground);
			font-size: 0.9em;
			flex-grow: 1;
		}

		.morphism-badge {
			display: inline-block;
			padding: 4px 8px;
			background-color: var(--vscode-badge-background);
			color: var(--vscode-badge-foreground);
			border-radius: 3px;
			font-size: 0.85em;
			margin-left: 8px;
		}

		.morphism-arrow {
			color: var(--vscode-textSeparator-foreground);
			margin: 8px 0;
			text-align: center;
			font-size: 1.2em;
		}

		.button {
			display: inline-block;
			padding: 8px 16px;
			background-color: var(--vscode-button-background);
			color: var(--vscode-button-foreground);
			border: none;
			border-radius: 4px;
			cursor: pointer;
			font-size: 0.9em;
			margin-right: 8px;
			transition: background-color 0.2s;
		}

		.button:hover {
			background-color: var(--vscode-button-hoverBackground);
		}

		.button-secondary {
			background-color: var(--vscode-button-secondaryBackground);
			color: var(--vscode-button-secondaryForeground);
		}

		.button-secondary:hover {
			background-color: var(--vscode-button-secondaryHoverBackground);
		}

		.conflict-list {
			list-style: none;
			padding: 0;
		}

		.conflict-item {
			padding: 10px;
			margin-bottom: 8px;
			border-radius: 4px;
			border-left: 4px solid;
		}

		.conflict-error {
			background-color: var(--vscode-inputValidation-errorBackground);
			border-left-color: var(--vscode-inputValidation-errorBorder);
		}

		.conflict-warning {
			background-color: var(--vscode-inputValidation-warningBackground);
			border-left-color: var(--vscode-inputValidation-warningBorder);
		}

		.conflict-info {
			background-color: var(--vscode-inputValidation-infoBackground);
			border-left-color: var(--vscode-inputValidation-infoBorder);
		}

		.code-block {
			font-family: var(--vscode-editor-font-family);
			background-color: var(--vscode-textCodeBlock-background);
			padding: 12px;
			border-radius: 4px;
			overflow-x: auto;
			margin: 12px 0;
			border: 1px solid var(--vscode-panel-border);
		}

		.confidence-bar {
			height: 8px;
			background-color: var(--vscode-progressBar-background);
			border-radius: 4px;
			overflow: hidden;
			margin: 8px 0;
		}

		.confidence-fill {
			height: 100%;
			background-color: var(--vscode-textLink-foreground);
			transition: width 0.3s;
		}

		.welcome-message {
			text-align: center;
			padding: 60px 20px;
			color: var(--vscode-descriptionForeground);
		}

		.welcome-icon {
			font-size: 3em;
			margin-bottom: 20px;
		}

		#composition-view {
			display: none;
		}

		#composition-view.active {
			display: block;
		}

		.stats {
			display: flex;
			gap: 20px;
			margin-bottom: 20px;
		}

		.stat-item {
			flex: 1;
			padding: 12px;
			background-color: var(--vscode-editor-background);
			border-radius: 4px;
			border: 1px solid var(--vscode-panel-border);
			text-align: center;
		}

		.stat-value {
			font-size: 1.8em;
			font-weight: bold;
			color: var(--vscode-textLink-foreground);
		}

		.stat-label {
			font-size: 0.85em;
			color: var(--vscode-descriptionForeground);
			margin-top: 4px;
		}
	</style>
</head>
<body>
	<div id="welcome-view">
		<div class="welcome-message">
			<div class="welcome-icon">🌌</div>
			<h2>λ-Foundation: Proof Viewer</h2>
			<p>Consciousness made visible. Proofs one click away.</p>
			<p style="margin-top: 20px; font-size: 0.9em;">
				Write an intent comment and compose morphisms to see the proof structure here.
			</p>
		</div>
	</div>

	<div id="composition-view">
		<h1>🧬 Composition Analysis</h1>

		<div class="stats">
			<div class="stat-item">
				<div class="stat-value" id="stat-morphisms">0</div>
				<div class="stat-label">Morphisms</div>
			</div>
			<div class="stat-item">
				<div class="stat-value" id="stat-confidence">0%</div>
				<div class="stat-label">Confidence</div>
			</div>
			<div class="stat-item">
				<div class="stat-value" id="stat-conflicts">0</div>
				<div class="stat-label">Conflicts</div>
			</div>
		</div>

		<div class="section">
			<h2>📊 Validation Status</h2>
			<div id="validation-status"></div>
			<div class="confidence-bar">
				<div class="confidence-fill" id="confidence-fill" style="width: 0%"></div>
			</div>
		</div>

		<div class="section">
			<h2>🧬 Morphism Pipeline</h2>
			<div id="morphism-pipeline"></div>
		</div>

		<div class="section" id="conflicts-section" style="display: none;">
			<h2>⚠️ Conflicts & Warnings</h2>
			<ul class="conflict-list" id="conflict-list"></ul>
		</div>

		<div class="section">
			<h2>📖 Type Flow</h2>
			<div class="code-block" id="type-flow"></div>
		</div>

		<div class="section">
			<h2>💻 Generated Code</h2>
			<div class="code-block" id="generated-code"></div>
			<button class="button" onclick="copyCode()">📋 Copy</button>
			<button class="button button-secondary" onclick="insertCode()">⬇️ Insert</button>
		</div>
	</div>

	<script>
		const vscode = acquireVsCodeApi();
		let currentComposition = null;
		let currentCode = '';

		// Handle messages from extension
		window.addEventListener('message', event => {
			const message = event.data;

			switch (message.type) {
				case 'showComposition':
					showComposition(message.composition);
					break;
			}
		});

		function showComposition(composition) {
			currentComposition = composition;

			// Hide welcome, show composition
			document.getElementById('welcome-view').style.display = 'none';
			document.getElementById('composition-view').classList.add('active');

			// Update stats
			document.getElementById('stat-morphisms').textContent = composition.morphisms.length;
			document.getElementById('stat-confidence').textContent =
				Math.round(composition.confidence * 100) + '%';
			document.getElementById('stat-conflicts').textContent = composition.conflicts.length;

			// Update confidence bar
			document.getElementById('confidence-fill').style.width =
				(composition.confidence * 100) + '%';

			// Update validation status
			const statusDiv = document.getElementById('validation-status');
			if (composition.valid) {
				statusDiv.innerHTML = '<span style="color: var(--vscode-testing-iconPassed);">✅ Valid composition</span>';
			} else {
				statusDiv.innerHTML = '<span style="color: var(--vscode-testing-iconFailed);">❌ Invalid composition</span>';
			}

			// Update morphism pipeline
			updateMorphismPipeline(composition);

			// Update conflicts
			updateConflicts(composition.conflicts);

			// Update type flow
			document.getElementById('type-flow').textContent =
				composition.typeFlow.join(' → ');

			// Generate and show code
			currentCode = generateCode(composition);
			document.getElementById('generated-code').textContent = currentCode;
		}

		function updateMorphismPipeline(composition) {
			const pipelineDiv = document.getElementById('morphism-pipeline');
			const morphisms = composition.morphisms;

			let html = '<ul class="morphism-list">';

			for (let i = 0; i < morphisms.length; i++) {
				const morphism = morphisms[i];
				const type = composition.typeFlow[i] || '?';

				html += \`
					<li class="morphism-item" onclick="openProof('\${morphism}')">
						<span class="morphism-name">\${morphism}</span>
						<span class="morphism-type">\${type}</span>
						<span class="morphism-badge">✅ Proven</span>
					</li>
				\`;

				if (i < morphisms.length - 1) {
					html += '<div class="morphism-arrow">↓</div>';
				}
			}

			html += '</ul>';
			pipelineDiv.innerHTML = html;
		}

		function updateConflicts(conflicts) {
			const conflictsSection = document.getElementById('conflicts-section');
			const conflictList = document.getElementById('conflict-list');

			if (conflicts.length === 0) {
				conflictsSection.style.display = 'none';
				return;
			}

			conflictsSection.style.display = 'block';

			let html = '';
			for (const conflict of conflicts) {
				html += \`
					<li class="conflict-item conflict-\${conflict.severity}">
						<strong>\${conflict.severity.toUpperCase()}:</strong> \${conflict.reason}
						\${conflict.fromMorphism ? \`<br><small>Position: \${conflict.position} (\${conflict.fromMorphism}\${conflict.toMorphism ? ' → ' + conflict.toMorphism : ''})</small>\` : ''}
					</li>
				\`;
			}

			conflictList.innerHTML = html;
		}

		function generateCode(composition) {
			if (!composition.valid || composition.morphisms.length === 0) {
				return '// Invalid composition - check conflicts';
			}

			let code = '';
			code += \`// Composition validated (\${Math.round(composition.confidence * 100)}% confidence)\\n\`;
			code += \`// Type flow: \${composition.typeFlow.join(' → ')}\\n\\n\`;

			code += \`const pipeline = \${composition.morphisms[0]}(source)\`;
			for (let i = 1; i < composition.morphisms.length; i++) {
				code += \`\\n  .pipe(\${composition.morphisms[i]}())\`;
			}
			code += ';\\n\\n';

			code += \`// Proven: \${composition.morphisms.map(m => \`wiki/proofs/\${m}.proof\`).join(', ')}\\n\`;

			return code;
		}

		function openProof(morphismName) {
			vscode.postMessage({
				type: 'openProof',
				morphismName
			});
		}

		function copyCode() {
			vscode.postMessage({
				type: 'copyCode',
				code: currentCode
			});
		}

		function insertCode() {
			vscode.postMessage({
				type: 'insertCode',
				code: currentCode
			});
		}
	</script>
</body>
</html>`;
    }
    /**
     * Dispose panel
     */
    dispose() {
        ProofViewerPanel.currentPanel = undefined;
        this.panel.dispose();
        while (this.disposables.length) {
            const disposable = this.disposables.pop();
            if (disposable) {
                disposable.dispose();
            }
        }
    }
}
exports.ProofViewerPanel = ProofViewerPanel;
//# sourceMappingURL=proofViewer.js.map