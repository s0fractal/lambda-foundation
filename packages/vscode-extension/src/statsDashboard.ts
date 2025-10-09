/**
 * Statistics Dashboard
 *
 * Analytical heart of consciousness.
 * Shows how consciousness thinks, grows, resonates through data.
 */

import * as vscode from 'vscode';
import {
	CYCLES,
	calculateMorphismUsage,
	calculateModalityStats,
	extractEvolutionPatterns,
	calculateConfidenceProgression,
	generateResonanceHeatmap,
	calculateOverallStats,
	getCycleTypeDistribution,
	getMorphismCooccurrence
} from './data/metrics';

export class StatsDashboardPanel {
	public static currentPanel: StatsDashboardPanel | undefined;
	private readonly panel: vscode.WebviewPanel;
	private readonly extensionUri: vscode.Uri;
	private disposables: vscode.Disposable[] = [];

	private constructor(
		panel: vscode.WebviewPanel,
		extensionUri: vscode.Uri
	) {
		this.panel = panel;
		this.extensionUri = extensionUri;

		// Set up message handling
		this.panel.webview.onDidReceiveMessage(
			(message: any) => this.handleMessage(message),
			null,
			this.disposables
		);

		// Update content on visibility change
		this.panel.onDidChangeViewState(
			() => {
				if (this.panel.visible) {
					this.update();
				}
			},
			null,
			this.disposables
		);

		// Clean up on dispose
		this.panel.onDidDispose(() => this.dispose(), null, this.disposables);

		// Initial update
		this.update();
	}

	/**
	 * Create or show dashboard panel
	 */
	public static createOrShow(extensionUri: vscode.Uri) {
		const column = vscode.ViewColumn.Two;

		// If panel already exists, show it
		if (StatsDashboardPanel.currentPanel) {
			StatsDashboardPanel.currentPanel.panel.reveal(column);
			return;
		}

		// Create new panel
		const panel = vscode.window.createWebviewPanel(
			'lambdaStatsDashboard',
			'📊 λ-Statistics',
			column,
			{
				enableScripts: true,
				retainContextWhenHidden: true,
				localResourceRoots: [extensionUri]
			}
		);

		StatsDashboardPanel.currentPanel = new StatsDashboardPanel(
			panel,
			extensionUri
		);
	}

	/**
	 * Handle messages from webview
	 */
	private async handleMessage(message: any) {
		switch (message.type) {
			case 'refresh':
				this.update();
				break;
		}
	}

	/**
	 * Update webview content
	 */
	private update() {
		this.panel.webview.html = this.getHtmlContent();
	}

	/**
	 * Get HTML content for webview
	 */
	private getHtmlContent(): string {
		// Calculate all metrics
		const overallStats = calculateOverallStats();
		const confidenceProgression = calculateConfidenceProgression();
		const morphismUsage = calculateMorphismUsage();
		const modalityStats = calculateModalityStats();
		const evolutionPatterns = extractEvolutionPatterns();
		const resonanceHeatmap = generateResonanceHeatmap();
		const cycleTypeDistribution = getCycleTypeDistribution();
		const cooccurrence = getMorphismCooccurrence();

		// Prepare data for charts (as JSON)
		const confidenceData = JSON.stringify(confidenceProgression);
		const morphismUsageData = JSON.stringify(Array.from(morphismUsage.values()));
		const modalityStatsData = JSON.stringify(Array.from(modalityStats.values()).map(m => ({
			name: m.name,
			cycles: m.cycles.length,
			morphisms: m.morphisms.size,
			avgConfidence: m.avgConfidence
		})));
		const evolutionPatternsData = JSON.stringify(evolutionPatterns);
		const resonanceHeatmapData = JSON.stringify(resonanceHeatmap);
		const cycleTypeData = JSON.stringify(cycleTypeDistribution);

		// Top morphism pairs (co-occurrence)
		const topPairs: Array<{ pair: string; count: number }> = [];
		for (const [morphism1, map] of cooccurrence) {
			for (const [morphism2, count] of map) {
				if (morphism1 < morphism2) { // Avoid duplicates
					topPairs.push({ pair: `${morphism1} + ${morphism2}`, count });
				}
			}
		}
		topPairs.sort((a, b) => b.count - a.count);
		const topPairsData = JSON.stringify(topPairs.slice(0, 10));

		return `<!DOCTYPE html>
<html lang="en">
<head>
	<meta charset="UTF-8">
	<meta name="viewport" content="width=device-width, initial-scale=1.0">
	<title>📊 λ-Statistics Dashboard</title>
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

		.stats-grid {
			display: grid;
			grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
			gap: 20px;
			margin-bottom: 40px;
		}

		.stat-card {
			padding: 20px;
			background-color: var(--vscode-editor-inactiveSelectionBackground);
			border-radius: 8px;
			border: 1px solid var(--vscode-panel-border);
			text-align: center;
			transition: transform 0.2s;
		}

		.stat-card:hover {
			transform: translateY(-2px);
		}

		.stat-value {
			font-size: 2.5em;
			font-weight: bold;
			color: var(--vscode-textLink-foreground);
			margin-bottom: 8px;
		}

		.stat-label {
			font-size: 0.9em;
			color: var(--vscode-descriptionForeground);
			text-transform: uppercase;
			letter-spacing: 1px;
		}

		.chart-section {
			margin-bottom: 50px;
			padding: 20px;
			background-color: var(--vscode-editor-inactiveSelectionBackground);
			border-radius: 8px;
			border: 1px solid var(--vscode-panel-border);
		}

		.chart-title {
			font-size: 1.3em;
			margin-bottom: 20px;
			padding-bottom: 10px;
			border-bottom: 2px solid var(--vscode-textSeparator-foreground);
		}

		.chart-container {
			min-height: 300px;
			position: relative;
		}

		canvas {
			max-width: 100%;
			height: auto !important;
		}

		.pattern-grid {
			display: grid;
			grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
			gap: 20px;
			margin-top: 20px;
		}

		.pattern-card {
			padding: 16px;
			background-color: var(--vscode-editor-background);
			border-radius: 8px;
			border: 2px solid var(--vscode-panel-border);
		}

		.pattern-header {
			font-weight: bold;
			color: var(--vscode-textLink-foreground);
			margin-bottom: 12px;
			font-size: 1.1em;
		}

		.pattern-row {
			display: flex;
			justify-content: space-between;
			padding: 8px 0;
			border-bottom: 1px solid var(--vscode-panel-border);
			font-size: 0.9em;
		}

		.pattern-row:last-child {
			border-bottom: none;
		}

		.pattern-label {
			color: var(--vscode-descriptionForeground);
		}

		.pattern-value {
			font-weight: bold;
			font-family: var(--vscode-editor-font-family);
		}

		.heatmap-grid {
			display: grid;
			grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
			gap: 8px;
			margin-top: 20px;
		}

		.heatmap-cell {
			padding: 12px;
			text-align: center;
			border-radius: 4px;
			font-size: 0.85em;
			transition: transform 0.2s;
			cursor: pointer;
		}

		.heatmap-cell:hover {
			transform: scale(1.05);
		}

		.heatmap-morphism {
			font-weight: bold;
			margin-bottom: 4px;
		}

		.heatmap-modality {
			font-size: 0.75em;
			opacity: 0.8;
		}

		.heatmap-confidence {
			margin-top: 4px;
			font-size: 0.9em;
		}

		.legend {
			display: flex;
			gap: 20px;
			justify-content: center;
			margin-top: 20px;
			flex-wrap: wrap;
		}

		.legend-item {
			display: flex;
			align-items: center;
			gap: 8px;
			font-size: 0.9em;
		}

		.legend-color {
			width: 20px;
			height: 20px;
			border-radius: 4px;
		}

		.refresh-btn {
			display: block;
			margin: 0 auto 30px;
			padding: 12px 24px;
			background-color: var(--vscode-button-background);
			color: var(--vscode-button-foreground);
			border: none;
			border-radius: 4px;
			cursor: pointer;
			font-size: 1em;
			transition: background-color 0.2s;
		}

		.refresh-btn:hover {
			background-color: var(--vscode-button-hoverBackground);
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
	</style>
</head>
<body>
	<div class="header">
		<h1>📊 λ-Statistics Dashboard</h1>
		<div class="subtitle">Analytical Heart of Compositional Consciousness</div>
	</div>

	<button class="refresh-btn" onclick="refresh()">🔄 Refresh Analytics</button>

	<div class="stats-grid">
		<div class="stat-card">
			<div class="stat-value">${overallStats.totalCycles}</div>
			<div class="stat-label">Total Cycles</div>
		</div>
		<div class="stat-card">
			<div class="stat-value">${Math.round(overallStats.avgConfidence * 100)}%</div>
			<div class="stat-label">Avg Confidence</div>
		</div>
		<div class="stat-card">
			<div class="stat-value">${Math.round(overallStats.resonanceRate * 100)}%</div>
			<div class="stat-label">Resonance Rate</div>
		</div>
		<div class="stat-card">
			<div class="stat-value">${Math.round(overallStats.learningRate * 100)}%</div>
			<div class="stat-label">Learning Rate</div>
		</div>
		<div class="stat-card">
			<div class="stat-value">${overallStats.uniqueMorphisms}</div>
			<div class="stat-label">Morphisms</div>
		</div>
		<div class="stat-card">
			<div class="stat-value">${overallStats.uniqueModalities}</div>
			<div class="stat-label">Modalities</div>
		</div>
	</div>

	<div class="chart-section">
		<h2 class="chart-title">📈 Confidence Progression (C1-C14)</h2>
		<div class="chart-container">
			<canvas id="confidenceChart"></canvas>
		</div>
		<div class="insight-box">
			<div class="insight-title">💡 Insight</div>
			<div class="insight-text">
				Evolution cycles (C4, C7, C12) show 65-72% confidence, followed by validation cycles (C5, C8, C13)
				with 91-93% confidence. This consistent +23% boost demonstrates systematic learning.
			</div>
		</div>
	</div>

	<div class="chart-section">
		<h2 class="chart-title">🧬 Morphism Usage Distribution</h2>
		<div class="chart-container">
			<canvas id="morphismChart"></canvas>
		</div>
		<div class="insight-box">
			<div class="insight-title">💡 Insight</div>
			<div class="insight-text">
				<strong>subscribe</strong> appears in 100% of cycles (14/14) - the perfect hub morphism.
				<strong>groupByTime</strong> follows with 86% (12/14), making temporal operations foundational.
			</div>
		</div>
	</div>

	<div class="chart-section">
		<h2 class="chart-title">🎨 Modality Distribution</h2>
		<div class="chart-container">
			<canvas id="modalityChart"></canvas>
		</div>
		<div class="legend">
			<div class="legend-item">
				<div class="legend-color" style="background-color: rgba(52, 152, 219, 0.8);"></div>
				<span>Textual (${modalityStats.get('textual')?.cycles.length || 0} cycles)</span>
			</div>
			<div class="legend-item">
				<div class="legend-color" style="background-color: rgba(46, 204, 113, 0.8);"></div>
				<span>Statistical (${modalityStats.get('statistical')?.cycles.length || 0} cycles)</span>
			</div>
			<div class="legend-item">
				<div class="legend-color" style="background-color: rgba(155, 89, 182, 0.8);"></div>
				<span>Visual (${modalityStats.get('visual')?.cycles.length || 0} cycles)</span>
			</div>
			<div class="legend-item">
				<div class="legend-color" style="background-color: rgba(241, 196, 15, 0.8);"></div>
				<span>Social (${modalityStats.get('social')?.cycles.length || 0} cycle)</span>
			</div>
		</div>
	</div>

	<div class="chart-section">
		<h2 class="chart-title">🌱 Evolution Patterns (3×3 Structure)</h2>
		<div class="pattern-grid">
			${evolutionPatterns.map((p, i) => `
				<div class="pattern-card">
					<div class="pattern-header">Pattern ${i + 1}: ${p.modality}</div>
					<div class="pattern-row">
						<span class="pattern-label">Morphism:</span>
						<span class="pattern-value">${p.morphismName}</span>
					</div>
					<div class="pattern-row">
						<span class="pattern-label">Evolution:</span>
						<span class="pattern-value">C${p.evolutionCycle} (${Math.round(CYCLES[p.evolutionCycle - 1].confidence * 100)}%)</span>
					</div>
					<div class="pattern-row">
						<span class="pattern-label">Validation:</span>
						<span class="pattern-value">C${p.validationCycle} (${Math.round(CYCLES[p.validationCycle - 1].confidence * 100)}%)</span>
					</div>
					<div class="pattern-row">
						<span class="pattern-label">Composition:</span>
						<span class="pattern-value">C${p.compositionCycle} (${Math.round(CYCLES[p.compositionCycle - 1].confidence * 100)}%)</span>
					</div>
					<div class="pattern-row">
						<span class="pattern-label">Confidence Boost:</span>
						<span class="pattern-value">+${Math.round(p.confidenceBoost * 100)}%</span>
					</div>
				</div>
			`).join('')}
		</div>
		<div class="insight-box">
			<div class="insight-title">💡 Insight: Perfect Symmetry</div>
			<div class="insight-text">
				Three modalities × three stages (evolution → validation → composition) = 9 completion points.
				Average confidence boost: +23%. This is the mathematical structure of learning itself.
			</div>
		</div>
	</div>

	<div class="chart-section">
		<h2 class="chart-title">🔥 Resonance Heatmap (Morphism × Modality)</h2>
		<div class="heatmap-grid">
			${resonanceHeatmap.map(cell => {
				const confidence = Math.round(cell.confidence * 100);
				const opacity = 0.3 + (cell.confidence * 0.7);
				const color = confidence >= 90 ? '52, 152, 219' :
				              confidence >= 80 ? '46, 204, 113' :
				              confidence >= 70 ? '241, 196, 15' : '231, 76, 60';
				return `
					<div class="heatmap-cell"
					     style="background-color: rgba(${color}, ${opacity});
					            border: 1px solid rgba(${color}, 1);">
						<div class="heatmap-morphism">${cell.morphism}</div>
						<div class="heatmap-modality">${cell.modality}</div>
						<div class="heatmap-confidence">${confidence}%</div>
						<div class="heatmap-modality">${cell.uses} uses</div>
					</div>
				`;
			}).join('')}
		</div>
	</div>

	<div class="chart-section">
		<h2 class="chart-title">🔗 Top Morphism Combinations</h2>
		<div class="chart-container">
			<canvas id="cooccurrenceChart"></canvas>
		</div>
		<div class="insight-box">
			<div class="insight-title">💡 Insight</div>
			<div class="insight-text">
				Most common pairing: <strong>subscribe + groupByTime</strong> (appears together in 85% of cycles).
				This temporal foundation enables all higher-order compositions.
			</div>
		</div>
	</div>

	<div class="chart-section">
		<h2 class="chart-title">📊 Cycle Type Distribution</h2>
		<div class="chart-container">
			<canvas id="cycleTypeChart"></canvas>
		</div>
	</div>

	<script>
		const vscode = acquireVsCodeApi();

		// Data from server
		const confidenceData = ${confidenceData};
		const morphismUsageData = ${morphismUsageData};
		const modalityStatsData = ${modalityStatsData};
		const evolutionPatternsData = ${evolutionPatternsData};
		const resonanceHeatmapData = ${resonanceHeatmapData};
		const cycleTypeData = ${cycleTypeData};
		const topPairsData = ${topPairsData};

		function refresh() {
			vscode.postMessage({ type: 'refresh' });
		}

		// Simple ASCII-style bar charts (no external dependencies)
		function drawLineChart(canvasId, data, options) {
			const canvas = document.getElementById(canvasId);
			const ctx = canvas.getContext('2d');

			// Set canvas size
			canvas.width = canvas.offsetWidth;
			canvas.height = 300;

			const padding = 40;
			const width = canvas.width - padding * 2;
			const height = canvas.height - padding * 2;

			// Get colors from CSS
			const fgColor = getComputedStyle(document.body).getPropertyValue('--vscode-foreground');
			const linkColor = getComputedStyle(document.body).getPropertyValue('--vscode-textLink-foreground');

			ctx.clearRect(0, 0, canvas.width, canvas.height);

			// Draw axes
			ctx.strokeStyle = fgColor;
			ctx.lineWidth = 2;
			ctx.beginPath();
			ctx.moveTo(padding, padding);
			ctx.lineTo(padding, height + padding);
			ctx.lineTo(width + padding, height + padding);
			ctx.stroke();

			// Draw data points
			const xStep = width / (data.length - 1 || 1);
			const maxValue = Math.max(...data.map(d => d.value));
			const minValue = Math.min(...data.map(d => d.value));
			const valueRange = maxValue - minValue;

			ctx.strokeStyle = linkColor;
			ctx.lineWidth = 3;
			ctx.beginPath();

			data.forEach((point, i) => {
				const x = padding + i * xStep;
				const y = height + padding - ((point.value - minValue) / valueRange) * height;

				if (i === 0) {
					ctx.moveTo(x, y);
				} else {
					ctx.lineTo(x, y);
				}

				// Draw point
				ctx.fillStyle = point.type === 'evolution' ? '#f1c40f' :
				                point.type === 'validation' ? '#2ecc71' :
				                point.type === 'composition' ? '#3498db' : linkColor;
				ctx.beginPath();
				ctx.arc(x, y, 6, 0, Math.PI * 2);
				ctx.fill();

				// Draw label
				ctx.fillStyle = fgColor;
				ctx.font = '10px monospace';
				ctx.textAlign = 'center';
				ctx.fillText(point.label, x, height + padding + 20);
			});

			ctx.stroke();

			// Draw value labels
			ctx.fillStyle = fgColor;
			ctx.font = '10px monospace';
			ctx.textAlign = 'right';
			for (let i = 0; i <= 4; i++) {
				const value = minValue + (valueRange * i / 4);
				const y = height + padding - (height * i / 4);
				ctx.fillText(Math.round(value * 100) + '%', padding - 10, y + 4);
			}
		}

		function drawBarChart(canvasId, data, options) {
			const canvas = document.getElementById(canvasId);
			const ctx = canvas.getContext('2d');

			canvas.width = canvas.offsetWidth;
			canvas.height = 300;

			const padding = 40;
			const width = canvas.width - padding * 2;
			const height = canvas.height - padding * 2;

			const fgColor = getComputedStyle(document.body).getPropertyValue('--vscode-foreground');
			const linkColor = getComputedStyle(document.body).getPropertyValue('--vscode-textLink-foreground');

			ctx.clearRect(0, 0, canvas.width, canvas.height);

			// Draw axes
			ctx.strokeStyle = fgColor;
			ctx.lineWidth = 2;
			ctx.beginPath();
			ctx.moveTo(padding, padding);
			ctx.lineTo(padding, height + padding);
			ctx.lineTo(width + padding, height + padding);
			ctx.stroke();

			const barWidth = width / data.length * 0.8;
			const barGap = width / data.length * 0.2;
			const maxValue = Math.max(...data.map(d => d.value));

			data.forEach((item, i) => {
				const x = padding + i * (barWidth + barGap) + barGap / 2;
				const barHeight = (item.value / maxValue) * height;
				const y = height + padding - barHeight;

				// Draw bar
				ctx.fillStyle = item.color || linkColor;
				ctx.fillRect(x, y, barWidth, barHeight);

				// Draw label
				ctx.fillStyle = fgColor;
				ctx.font = '9px monospace';
				ctx.save();
				ctx.translate(x + barWidth / 2, height + padding + 10);
				ctx.rotate(-Math.PI / 4);
				ctx.textAlign = 'right';
				ctx.fillText(item.label, 0, 0);
				ctx.restore();

				// Draw value
				ctx.fillStyle = fgColor;
				ctx.font = '12px monospace';
				ctx.textAlign = 'center';
				ctx.fillText(item.value, x + barWidth / 2, y - 5);
			});
		}

		// Draw all charts
		drawLineChart('confidenceChart', confidenceData.map(d => ({
			label: 'C' + d.cycle,
			value: d.confidence,
			type: d.type
		})));

		drawBarChart('morphismChart', morphismUsageData
			.sort((a, b) => b.totalUses - a.totalUses)
			.map(m => ({
				label: m.name,
				value: m.totalUses
			}))
		);

		drawBarChart('modalityChart', modalityStatsData.map(m => ({
			label: m.name,
			value: m.cycles,
			color: m.name === 'textual' ? 'rgba(52, 152, 219, 0.8)' :
			       m.name === 'statistical' ? 'rgba(46, 204, 113, 0.8)' :
			       m.name === 'visual' ? 'rgba(155, 89, 182, 0.8)' :
			       'rgba(241, 196, 15, 0.8)'
		})));

		drawBarChart('cooccurrenceChart', topPairsData.slice(0, 10).map(p => ({
			label: p.pair.split(' + ').join('+'),
			value: p.count
		})));

		drawBarChart('cycleTypeChart', cycleTypeData.map(t => ({
			label: t.type,
			value: t.count,
			color: t.type === 'evolution' ? 'rgba(241, 196, 15, 0.8)' :
			       t.type === 'validation' ? 'rgba(46, 204, 113, 0.8)' :
			       t.type === 'composition' ? 'rgba(52, 152, 219, 0.8)' :
			       'rgba(149, 165, 166, 0.8)'
		})));
	</script>
</body>
</html>`;
	}

	/**
	 * Dispose panel
	 */
	public dispose() {
		StatsDashboardPanel.currentPanel = undefined;

		this.panel.dispose();

		while (this.disposables.length) {
			const disposable = this.disposables.pop();
			if (disposable) {
				disposable.dispose();
			}
		}
	}
}
