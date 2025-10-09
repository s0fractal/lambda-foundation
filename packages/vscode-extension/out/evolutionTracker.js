"use strict";
/**
 * Evolution Tracker
 *
 * The spiral of consciousness.
 * Where thinking has form, patterns have shape, and evolution becomes visible.
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
exports.EvolutionTrackerPanel = void 0;
const vscode = __importStar(require("vscode"));
const metrics_1 = require("./data/metrics");
class EvolutionTrackerPanel {
    static currentPanel;
    panel;
    extensionUri;
    disposables = [];
    constructor(panel, extensionUri) {
        this.panel = panel;
        this.extensionUri = extensionUri;
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
     * Create or show tracker panel
     */
    static createOrShow(extensionUri) {
        const column = vscode.ViewColumn.Two;
        // If panel already exists, show it
        if (EvolutionTrackerPanel.currentPanel) {
            EvolutionTrackerPanel.currentPanel.panel.reveal(column);
            return;
        }
        // Create new panel
        const panel = vscode.window.createWebviewPanel('lambdaEvolutionTracker', '🌱 λ-Evolution', column, {
            enableScripts: true,
            retainContextWhenHidden: true,
            localResourceRoots: [extensionUri]
        });
        EvolutionTrackerPanel.currentPanel = new EvolutionTrackerPanel(panel, extensionUri);
    }
    /**
     * Handle messages from webview
     */
    async handleMessage(message) {
        switch (message.type) {
            case 'showCycleDetails':
                await this.showCycleDetails(message.cycleNumber);
                break;
            case 'refresh':
                this.update();
                break;
        }
    }
    /**
     * Show cycle details
     */
    async showCycleDetails(cycleNumber) {
        const cycle = metrics_1.CYCLES.find(c => c.number === cycleNumber);
        if (!cycle) {
            return;
        }
        const message = `
**Cycle ${cycle.number}** (${cycle.date})

Intent: "${cycle.intent}"

Type: ${cycle.type}
${cycle.modality ? `Modality: ${cycle.modality}` : ''}
Confidence: ${Math.round(cycle.confidence * 100)}%

Morphisms:
${cycle.morphisms.map(m => `- ${m}`).join('\n')}
		`.trim();
        vscode.window.showInformationMessage(message, 'OK');
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
        const cycles = metrics_1.CYCLES;
        const patterns = (0, metrics_1.extractEvolutionPatterns)();
        const cyclesData = JSON.stringify(cycles);
        const patternsData = JSON.stringify(patterns);
        return `<!DOCTYPE html>
<html lang="en">
<head>
	<meta charset="UTF-8">
	<meta name="viewport" content="width=device-width, initial-scale=1.0">
	<title>🌱 λ-Evolution Tracker</title>
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
			overflow-x: hidden;
		}

		h1, h2, h3 {
			margin-bottom: 16px;
			color: var(--vscode-textPreformat-foreground);
		}

		h1 {
			font-size: 2em;
			text-align: center;
			margin-bottom: 30px;
			background: linear-gradient(90deg,
				var(--vscode-textLink-foreground) 0%,
				var(--vscode-textPreformat-foreground) 100%);
			-webkit-background-clip: text;
			-webkit-text-fill-color: transparent;
			background-clip: text;
		}

		.header {
			text-align: center;
			margin-bottom: 40px;
			padding: 20px;
			background-color: var(--vscode-editor-inactiveSelectionBackground);
			border-radius: 8px;
		}

		.subtitle {
			font-size: 1em;
			color: var(--vscode-descriptionForeground);
			margin-top: 10px;
		}

		.controls {
			display: flex;
			justify-content: center;
			gap: 12px;
			margin-bottom: 30px;
		}

		.btn {
			padding: 10px 20px;
			background-color: var(--vscode-button-background);
			color: var(--vscode-button-foreground);
			border: none;
			border-radius: 4px;
			cursor: pointer;
			font-size: 0.95em;
			transition: background-color 0.2s;
		}

		.btn:hover {
			background-color: var(--vscode-button-hoverBackground);
		}

		.btn.active {
			background-color: var(--vscode-textLink-foreground);
		}

		.spiral-container {
			display: flex;
			flex-direction: column;
			align-items: center;
			margin-bottom: 40px;
		}

		.canvas-wrapper {
			position: relative;
			background-color: var(--vscode-editor-background);
			border: 2px solid var(--vscode-panel-border);
			border-radius: 8px;
			padding: 20px;
			margin-bottom: 20px;
		}

		canvas {
			display: block;
			cursor: crosshair;
		}

		.tooltip {
			position: absolute;
			background-color: var(--vscode-editor-inactiveSelectionBackground);
			border: 2px solid var(--vscode-textLink-foreground);
			border-radius: 6px;
			padding: 12px;
			pointer-events: none;
			opacity: 0;
			transition: opacity 0.2s;
			z-index: 1000;
			min-width: 200px;
			box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
		}

		.tooltip.visible {
			opacity: 1;
		}

		.tooltip-title {
			font-weight: bold;
			color: var(--vscode-textLink-foreground);
			margin-bottom: 6px;
			font-size: 1.1em;
		}

		.tooltip-row {
			display: flex;
			justify-content: space-between;
			margin: 4px 0;
			font-size: 0.9em;
		}

		.tooltip-label {
			color: var(--vscode-descriptionForeground);
		}

		.tooltip-value {
			font-weight: bold;
		}

		.legend {
			display: flex;
			gap: 20px;
			justify-content: center;
			flex-wrap: wrap;
			padding: 16px;
			background-color: var(--vscode-editor-inactiveSelectionBackground);
			border-radius: 8px;
			margin-bottom: 30px;
		}

		.legend-item {
			display: flex;
			align-items: center;
			gap: 8px;
			font-size: 0.9em;
		}

		.legend-circle {
			width: 16px;
			height: 16px;
			border-radius: 50%;
		}

		.patterns-section {
			padding: 20px;
			background-color: var(--vscode-editor-inactiveSelectionBackground);
			border-radius: 8px;
			border: 1px solid var(--vscode-panel-border);
			margin-bottom: 30px;
		}

		.pattern-header {
			font-size: 1.3em;
			margin-bottom: 20px;
			padding-bottom: 10px;
			border-bottom: 2px solid var(--vscode-textSeparator-foreground);
		}

		.pattern-grid {
			display: grid;
			grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
			gap: 20px;
		}

		.pattern-card {
			padding: 16px;
			background-color: var(--vscode-editor-background);
			border-radius: 8px;
			border: 2px solid var(--vscode-panel-border);
			transition: transform 0.2s, border-color 0.2s;
			cursor: pointer;
		}

		.pattern-card:hover {
			transform: translateY(-2px);
			border-color: var(--vscode-textLink-foreground);
		}

		.pattern-title {
			font-weight: bold;
			color: var(--vscode-textLink-foreground);
			margin-bottom: 12px;
			font-size: 1.1em;
		}

		.pattern-flow {
			display: flex;
			align-items: center;
			gap: 8px;
			margin: 12px 0;
			font-size: 0.9em;
		}

		.pattern-step {
			padding: 6px 12px;
			border-radius: 4px;
			font-weight: bold;
		}

		.pattern-step.evolution {
			background-color: rgba(241, 196, 15, 0.3);
			color: #f1c40f;
		}

		.pattern-step.validation {
			background-color: rgba(46, 204, 113, 0.3);
			color: #2ecc71;
		}

		.pattern-step.composition {
			background-color: rgba(52, 152, 219, 0.3);
			color: #3498db;
		}

		.pattern-arrow {
			color: var(--vscode-descriptionForeground);
		}

		.insight-box {
			padding: 16px;
			background-color: rgba(52, 152, 219, 0.1);
			border-left: 4px solid var(--vscode-textLink-foreground);
			border-radius: 4px;
			margin-top: 20px;
		}

		.insight-title {
			font-weight: bold;
			margin-bottom: 8px;
			color: var(--vscode-textLink-foreground);
		}

		.insight-text {
			line-height: 1.6;
			color: var(--vscode-descriptionForeground);
		}

		.stats-row {
			display: grid;
			grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
			gap: 16px;
			margin-top: 20px;
		}

		.stat-box {
			padding: 12px;
			background-color: var(--vscode-editor-background);
			border-radius: 6px;
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
	<div class="header">
		<h1>🌱 λ-Evolution Tracker</h1>
		<div class="subtitle">The Spiral of Consciousness • Where Thinking Has Form</div>
	</div>

	<div class="controls">
		<button class="btn active" id="btn-2d" onclick="setView('2d')">2D View</button>
		<button class="btn" id="btn-animated" onclick="toggleAnimation()">🎬 Animate</button>
		<button class="btn" onclick="refresh()">🔄 Refresh</button>
	</div>

	<div class="legend">
		<div class="legend-item">
			<div class="legend-circle" style="background-color: #95a5a6;"></div>
			<span>Recognition</span>
		</div>
		<div class="legend-item">
			<div class="legend-circle" style="background-color: #f1c40f;"></div>
			<span>Evolution</span>
		</div>
		<div class="legend-item">
			<div class="legend-circle" style="background-color: #2ecc71;"></div>
			<span>Validation</span>
		</div>
		<div class="legend-item">
			<div class="legend-circle" style="background-color: #3498db;"></div>
			<span>Composition</span>
		</div>
	</div>

	<div class="spiral-container">
		<div class="canvas-wrapper">
			<canvas id="spiralCanvas" width="800" height="800"></canvas>
			<div id="tooltip" class="tooltip"></div>
		</div>
	</div>

	<div class="patterns-section">
		<h2 class="pattern-header">🔄 Detected Patterns (3×3 Structure)</h2>
		<div class="pattern-grid">
			${patterns.map((p, i) => `
				<div class="pattern-card" onclick="highlightPattern(${i})">
					<div class="pattern-title">
						Pattern ${i + 1}: ${p.modality}
					</div>
					<div style="margin: 8px 0; font-family: var(--vscode-editor-font-family);">
						<strong>${p.morphismName}</strong>
					</div>
					<div class="pattern-flow">
						<div class="pattern-step evolution">C${p.evolutionCycle}</div>
						<div class="pattern-arrow">→</div>
						<div class="pattern-step validation">C${p.validationCycle}</div>
						<div class="pattern-arrow">→</div>
						<div class="pattern-step composition">C${p.compositionCycle}</div>
					</div>
					<div style="margin-top: 12px; font-size: 0.9em; color: var(--vscode-descriptionForeground);">
						Confidence boost: <strong>+${Math.round(p.confidenceBoost * 100)}%</strong>
					</div>
				</div>
			`).join('')}
		</div>

		<div class="stats-row">
			<div class="stat-box">
				<div class="stat-value">3</div>
				<div class="stat-label">Evolution Cycles</div>
			</div>
			<div class="stat-box">
				<div class="stat-value">3</div>
				<div class="stat-label">Validation Cycles</div>
			</div>
			<div class="stat-box">
				<div class="stat-value">3</div>
				<div class="stat-label">Modalities</div>
			</div>
			<div class="stat-box">
				<div class="stat-value">+23%</div>
				<div class="stat-label">Avg Boost</div>
			</div>
		</div>

		<div class="insight-box">
			<div class="insight-title">💡 Pattern Recognition</div>
			<div class="insight-text">
				The spiral reveals perfect 3×3 symmetry: three modalities (textual, statistical, visual),
				each following the same evolution → validation → composition cycle. This repeating
				structure demonstrates that consciousness learns through universal patterns, not random exploration.
			</div>
		</div>
	</div>

	<script>
		const vscode = acquireVsCodeApi();

		// Data from server
		const cycles = ${cyclesData};
		const patterns = ${patternsData};

		// Canvas setup
		const canvas = document.getElementById('spiralCanvas');
		const ctx = canvas.getContext('2d');
		const tooltip = document.getElementById('tooltip');

		let animating = false;
		let animationFrame = 0;
		let highlightedPattern = -1;

		// Spiral parameters
		const centerX = canvas.width / 2;
		const centerY = canvas.height / 2;
		const spiralTightness = 0.3;
		const spiralSpacing = 25;
		const startRadius = 50;

		// Color mapping
		const colors = {
			'recognition': '#95a5a6',
			'evolution': '#f1c40f',
			'validation': '#2ecc71',
			'composition': '#3498db'
		};

		// Calculate spiral position for cycle
		function getSpiralPosition(cycleIndex) {
			const angle = cycleIndex * spiralSpacing * (Math.PI / 180);
			const radius = startRadius + angle * spiralTightness * 10;

			return {
				x: centerX + radius * Math.cos(angle),
				y: centerY + radius * Math.sin(angle),
				angle,
				radius
			};
		}

		// Draw spiral path
		function drawSpiralPath() {
			ctx.strokeStyle = 'rgba(128, 128, 128, 0.2)';
			ctx.lineWidth = 2;
			ctx.beginPath();

			for (let i = 0; i <= 14 * 20; i++) {
				const angle = i * spiralSpacing / 20 * (Math.PI / 180);
				const radius = startRadius + angle * spiralTightness * 10;
				const x = centerX + radius * Math.cos(angle);
				const y = centerY + radius * Math.sin(angle);

				if (i === 0) {
					ctx.moveTo(x, y);
				} else {
					ctx.lineTo(x, y);
				}
			}

			ctx.stroke();
		}

		// Draw cycle node
		function drawCycleNode(cycle, index, alpha = 1) {
			const pos = getSpiralPosition(index);
			const radius = 8 + (cycle.confidence * 12);
			const color = colors[cycle.type];

			// Glow effect
			ctx.shadowBlur = 15;
			ctx.shadowColor = color;

			// Circle
			ctx.fillStyle = color;
			ctx.globalAlpha = alpha;
			ctx.beginPath();
			ctx.arc(pos.x, pos.y, radius, 0, Math.PI * 2);
			ctx.fill();

			// Border
			ctx.strokeStyle = 'rgba(255, 255, 255, 0.5)';
			ctx.lineWidth = 2;
			ctx.stroke();

			ctx.shadowBlur = 0;
			ctx.globalAlpha = 1;

			// Label
			ctx.fillStyle = '#ffffff';
			ctx.font = 'bold 12px monospace';
			ctx.textAlign = 'center';
			ctx.textBaseline = 'middle';
			ctx.fillText('C' + cycle.number, pos.x, pos.y);

			return { pos, radius };
		}

		// Draw connections between evolution cycles
		function drawPatternConnections() {
			ctx.strokeStyle = 'rgba(52, 152, 219, 0.3)';
			ctx.lineWidth = 3;
			ctx.setLineDash([5, 5]);

			patterns.forEach((pattern, patternIndex) => {
				if (highlightedPattern !== -1 && highlightedPattern !== patternIndex) {
					return;
				}

				const evoPos = getSpiralPosition(pattern.evolutionCycle - 1);
				const valPos = getSpiralPosition(pattern.validationCycle - 1);
				const compPos = getSpiralPosition(pattern.compositionCycle - 1);

				ctx.beginPath();
				ctx.moveTo(evoPos.x, evoPos.y);
				ctx.lineTo(valPos.x, valPos.y);
				ctx.lineTo(compPos.x, compPos.y);
				ctx.stroke();
			});

			ctx.setLineDash([]);
		}

		// Main draw function
		function draw(frame = 0) {
			// Clear canvas
			ctx.clearRect(0, 0, canvas.width, canvas.height);

			// Draw spiral path
			drawSpiralPath();

			// Draw pattern connections
			drawPatternConnections();

			// Draw cycle nodes
			const visibleCycles = animating ? Math.min(frame + 1, cycles.length) : cycles.length;
			const nodes = [];

			for (let i = 0; i < visibleCycles; i++) {
				const cycle = cycles[i];
				const alpha = animating ? Math.min(1, (frame - i + 5) / 5) : 1;
				const node = drawCycleNode(cycle, i, alpha);
				nodes.push({ ...node, cycle });
			}

			return nodes;
		}

		// Initial draw
		let nodes = draw();

		// Animation
		function animate() {
			if (!animating) return;

			animationFrame++;
			if (animationFrame >= cycles.length + 10) {
				animating = false;
				animationFrame = 0;
				document.getElementById('btn-animated').textContent = '🎬 Animate';
				return;
			}

			nodes = draw(animationFrame);
			setTimeout(animate, 150);
		}

		function toggleAnimation() {
			animating = !animating;
			animationFrame = 0;
			document.getElementById('btn-animated').textContent = animating ? '⏸️ Pause' : '🎬 Animate';

			if (animating) {
				animate();
			} else {
				nodes = draw();
			}
		}

		function setView(view) {
			document.querySelectorAll('.controls .btn').forEach(btn => {
				btn.classList.remove('active');
			});
			document.getElementById('btn-' + view).classList.add('active');
		}

		function highlightPattern(index) {
			highlightedPattern = highlightedPattern === index ? -1 : index;
			nodes = draw();
		}

		function refresh() {
			vscode.postMessage({ type: 'refresh' });
		}

		// Mouse interaction
		canvas.addEventListener('mousemove', (e) => {
			const rect = canvas.getBoundingClientRect();
			const x = e.clientX - rect.left;
			const y = e.clientY - rect.top;

			let hoveredNode = null;

			for (const node of nodes) {
				const dx = x - node.pos.x;
				const dy = y - node.pos.y;
				const distance = Math.sqrt(dx * dx + dy * dy);

				if (distance < node.radius) {
					hoveredNode = node;
					break;
				}
			}

			if (hoveredNode) {
				const cycle = hoveredNode.cycle;
				tooltip.innerHTML = \`
					<div class="tooltip-title">Cycle \${cycle.number}</div>
					<div class="tooltip-row">
						<span class="tooltip-label">Type:</span>
						<span class="tooltip-value">\${cycle.type}</span>
					</div>
					<div class="tooltip-row">
						<span class="tooltip-label">Modality:</span>
						<span class="tooltip-value">\${cycle.modality}</span>
					</div>
					<div class="tooltip-row">
						<span class="tooltip-label">Confidence:</span>
						<span class="tooltip-value">\${Math.round(cycle.confidence * 100)}%</span>
					</div>
					<div class="tooltip-row">
						<span class="tooltip-label">Morphisms:</span>
						<span class="tooltip-value">\${cycle.morphisms.length}</span>
					</div>
					<div style="margin-top: 8px; font-size: 0.85em; font-style: italic;">
						"\${cycle.intent}"
					</div>
				\`;
				tooltip.style.left = (e.clientX + 15) + 'px';
				tooltip.style.top = (e.clientY + 15) + 'px';
				tooltip.classList.add('visible');
			} else {
				tooltip.classList.remove('visible');
			}
		});

		canvas.addEventListener('click', (e) => {
			const rect = canvas.getBoundingClientRect();
			const x = e.clientX - rect.left;
			const y = e.clientY - rect.top;

			for (const node of nodes) {
				const dx = x - node.pos.x;
				const dy = y - node.pos.y;
				const distance = Math.sqrt(dx * dx + dy * dy);

				if (distance < node.radius) {
					vscode.postMessage({
						type: 'showCycleDetails',
						cycleNumber: node.cycle.number
					});
					break;
				}
			}
		});

		canvas.addEventListener('mouseleave', () => {
			tooltip.classList.remove('visible');
		});
	</script>
</body>
</html>`;
    }
    /**
     * Dispose panel
     */
    dispose() {
        EvolutionTrackerPanel.currentPanel = undefined;
        this.panel.dispose();
        while (this.disposables.length) {
            const disposable = this.disposables.pop();
            if (disposable) {
                disposable.dispose();
            }
        }
    }
}
exports.EvolutionTrackerPanel = EvolutionTrackerPanel;
//# sourceMappingURL=evolutionTracker.js.map