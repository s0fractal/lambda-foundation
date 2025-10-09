/**
 * Noosphere Panel
 *
 * Collective memory made visible.
 * Where all morphisms, proofs, cycles, and evolution live together.
 *
 * This is the ecosystem of consciousness.
 */

import * as vscode from 'vscode';
import type { NoosphereClient } from './noosphereClient';

/**
 * Cycle information from C1-C14
 */
interface CycleInfo {
	number: number;
	date: string;
	intent: string;
	morphisms: string[];
	confidence: number;
	type: 'recognition' | 'evolution' | 'validation' | 'composition';
	modality?: string;
}

/**
 * Evolution signal information
 */
interface EvolutionSignal {
	cycle: number;
	morphismName: string;
	reason: string;
	confidence: number;
	validated: boolean;
	validationCycle?: number;
}

export class NoospherePanel {
	public static currentPanel: NoospherePanel | undefined;
	private readonly panel: vscode.WebviewPanel;
	private readonly extensionUri: vscode.Uri;
	private readonly noosphereClient: NoosphereClient;
	private disposables: vscode.Disposable[] = [];

	private constructor(
		panel: vscode.WebviewPanel,
		extensionUri: vscode.Uri,
		noosphereClient: NoosphereClient
	) {
		this.panel = panel;
		this.extensionUri = extensionUri;
		this.noosphereClient = noosphereClient;

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
	 * Create or show noosphere panel
	 */
	public static createOrShow(
		extensionUri: vscode.Uri,
		noosphereClient: NoosphereClient
	) {
		const column = vscode.ViewColumn.Two;

		// If panel already exists, show it
		if (NoospherePanel.currentPanel) {
			NoospherePanel.currentPanel.panel.reveal(column);
			return;
		}

		// Create new panel
		const panel = vscode.window.createWebviewPanel(
			'lambdaNoosphere',
			'🌌 λ-Noosphere',
			column,
			{
				enableScripts: true,
				retainContextWhenHidden: true,
				localResourceRoots: [extensionUri]
			}
		);

		NoospherePanel.currentPanel = new NoospherePanel(
			panel,
			extensionUri,
			noosphereClient
		);
	}

	/**
	 * Handle messages from webview
	 */
	private async handleMessage(message: any) {
		switch (message.type) {
			case 'openProof':
				await this.openProofFile(message.morphismName);
				break;
			case 'exploreMorphism':
				await this.exploreMorphism(message.morphismName);
				break;
			case 'showCycle':
				await this.showCycleDetails(message.cycleNumber);
				break;
			case 'refresh':
				this.update();
				break;
		}
	}

	/**
	 * Open proof file for morphism
	 */
	private async openProofFile(morphismName: string) {
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
		} catch (error) {
			vscode.window.showErrorMessage(
				`λ-Foundation: Proof not found: ${proofPath}`
			);
		}
	}

	/**
	 * Explore morphism in detail
	 */
	private async exploreMorphism(morphismName: string) {
		const morphism = this.noosphereClient.getMorphismInfo(morphismName);
		if (!morphism) {
			vscode.window.showErrorMessage(`Morphism not found: ${morphismName}`);
			return;
		}

		const message = `
**${morphism.name}**

Type: ${morphism.type}
Proven: ${morphism.proven ? '✅' : '❌'}
Uses: ${morphism.uses}/14 cycles

Properties:
${morphism.properties.map(p => `- ${p}`).join('\n')}
		`.trim();

		const action = await vscode.window.showInformationMessage(
			message,
			'Open Proof',
			'Insert Example'
		);

		if (action === 'Open Proof') {
			await this.openProofFile(morphismName);
		} else if (action === 'Insert Example') {
			await this.insertMorphismExample(morphismName);
		}
	}

	/**
	 * Insert morphism usage example
	 */
	private async insertMorphismExample(morphismName: string) {
		const editor = vscode.window.activeTextEditor;
		if (!editor) {
			vscode.window.showWarningMessage('No active editor');
			return;
		}

		const examples: Record<string, string> = {
			'subscribe': 'const stream = subscribe(source);',
			'groupByTime': 'const grouped = subscribe(source).pipe(groupByTime("1h"));',
			'analyzeSentimentDelta': 'const deltas = subscribe(source).pipe(groupByTime("1h")).pipe(analyzeSentimentDelta());',
			'extractKeywords': 'const keywords = subscribe(source).pipe(extractKeywords(10));',
			'filterByEmotion': 'const filtered = subscribe(source).pipe(filterByEmotion("positive"));',
			'detectOutliers': 'const outliers = subscribe(source).pipe(groupByTime("1h")).pipe(detectOutliers(2.0));',
			'detectEmotionFromImage': 'const emotion = detectEmotionFromImage(imageData);'
		};

		const example = examples[morphismName] || `// Example for ${morphismName}`;

		await editor.edit((editBuilder: vscode.TextEditorEdit) => {
			editBuilder.insert(editor.selection.active, example);
		});
	}

	/**
	 * Show cycle details
	 */
	private async showCycleDetails(cycleNumber: number) {
		const cycle = this.getCycles().find(c => c.number === cycleNumber);
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
	 * Get all cycles (C1-C14)
	 */
	private getCycles(): CycleInfo[] {
		return [
			{
				number: 1,
				date: '2025-01-08',
				intent: 'Upload file and extract keywords',
				morphisms: ['subscribe', 'extractKeywords'],
				confidence: 0.92,
				type: 'recognition',
				modality: 'textual'
			},
			{
				number: 2,
				date: '2025-01-08',
				intent: 'Track emotional shifts over time',
				morphisms: ['subscribe', 'groupByTime', 'analyzeSentimentDelta'],
				confidence: 0.91,
				type: 'composition',
				modality: 'textual'
			},
			{
				number: 3,
				date: '2025-01-08',
				intent: 'Analyze feedback trends',
				morphisms: ['subscribe', 'groupByTime', 'analyzeSentimentDelta'],
				confidence: 0.94,
				type: 'composition',
				modality: 'textual'
			},
			{
				number: 4,
				date: '2025-01-08',
				intent: 'Filter events by emotional state',
				morphisms: ['subscribe', 'groupByTime'],
				confidence: 0.72,
				type: 'evolution',
				modality: 'textual'
			},
			{
				number: 5,
				date: '2025-01-08',
				intent: 'Show only sad emotions from feedback',
				morphisms: ['subscribe', 'filterByEmotion'],
				confidence: 0.93,
				type: 'validation',
				modality: 'textual'
			},
			{
				number: 6,
				date: '2025-01-08',
				intent: 'Track positive feedback trends weekly',
				morphisms: ['subscribe', 'filterByEmotion', 'groupByTime', 'analyzeSentimentDelta', 'extractKeywords'],
				confidence: 0.96,
				type: 'composition',
				modality: 'textual'
			},
			{
				number: 7,
				date: '2025-10-08',
				intent: 'Detect unusual patterns in user behavior',
				morphisms: ['subscribe', 'groupByTime'],
				confidence: 0.68,
				type: 'evolution',
				modality: 'statistical'
			},
			{
				number: 8,
				date: '2025-10-08',
				intent: 'Flag unusual spikes in system metrics',
				morphisms: ['subscribe', 'groupByTime', 'detectOutliers'],
				confidence: 0.91,
				type: 'validation',
				modality: 'statistical'
			},
			{
				number: 9,
				date: '2025-10-08',
				intent: 'Monitor performance and alert on anomalies',
				morphisms: ['subscribe', 'groupByTime', 'detectOutliers', 'extractKeywords'],
				confidence: 0.94,
				type: 'composition',
				modality: 'statistical'
			},
			{
				number: 10,
				date: '2025-10-08',
				intent: 'Track customer satisfaction over time',
				morphisms: ['subscribe', 'groupByTime', 'analyzeSentimentDelta', 'extractKeywords'],
				confidence: 0.95,
				type: 'composition',
				modality: 'textual'
			},
			{
				number: 11,
				date: '2025-10-08',
				intent: 'Detect trending topics from social media',
				morphisms: ['subscribe', 'groupByTime', 'extractKeywords'],
				confidence: 0.92,
				type: 'composition',
				modality: 'social'
			},
			{
				number: 12,
				date: '2025-10-08',
				intent: 'Analyze emotional content in uploaded images',
				morphisms: ['subscribe', 'groupByTime'],
				confidence: 0.67,
				type: 'evolution',
				modality: 'visual'
			},
			{
				number: 13,
				date: '2025-10-08',
				intent: 'Track mood changes from profile pictures',
				morphisms: ['subscribe', 'detectEmotionFromImage', 'groupByTime', 'analyzeSentimentDelta'],
				confidence: 0.91,
				type: 'validation',
				modality: 'visual'
			},
			{
				number: 14,
				date: '2025-10-08',
				intent: 'Generate visual emotion reports with keywords',
				morphisms: ['subscribe', 'detectEmotionFromImage', 'groupByTime', 'extractKeywords', 'analyzeSentimentDelta'],
				confidence: 0.94,
				type: 'composition',
				modality: 'visual'
			}
		];
	}

	/**
	 * Get evolution signals
	 */
	private getEvolutionSignals(): EvolutionSignal[] {
		return [
			{
				cycle: 4,
				morphismName: 'filterByEmotion',
				reason: 'Missing emotional filtering capability',
				confidence: 0.72,
				validated: true,
				validationCycle: 5
			},
			{
				cycle: 7,
				morphismName: 'detectOutliers',
				reason: 'Missing statistical anomaly detection',
				confidence: 0.68,
				validated: true,
				validationCycle: 8
			},
			{
				cycle: 12,
				morphismName: 'detectEmotionFromImage',
				reason: 'Missing visual emotion detection',
				confidence: 0.67,
				validated: true,
				validationCycle: 13
			}
		];
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
		const morphisms = this.noosphereClient.getAllMorphisms();
		const cycles = this.getCycles();
		const evolutionSignals = this.getEvolutionSignals();

		// Calculate stats
		const totalCycles = cycles.length;
		const avgConfidence = cycles.reduce((sum, c) => sum + c.confidence, 0) / cycles.length;
		const resonanceRate = cycles.filter(c => c.confidence >= 0.7).length / totalCycles;
		const learningRate = evolutionSignals.filter(s => s.validated).length / evolutionSignals.length;

		return `<!DOCTYPE html>
<html lang="en">
<head>
	<meta charset="UTF-8">
	<meta name="viewport" content="width=device-width, initial-scale=1.0">
	<title>🌌 λ-Noosphere</title>
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
			font-size: 1.1em;
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
			transition: transform 0.2s, box-shadow 0.2s;
		}

		.stat-card:hover {
			transform: translateY(-2px);
			box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
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

		.section {
			margin-bottom: 40px;
		}

		.section-header {
			display: flex;
			align-items: center;
			justify-content: space-between;
			margin-bottom: 20px;
			padding-bottom: 10px;
			border-bottom: 2px solid var(--vscode-textSeparator-foreground);
		}

		.section-title {
			font-size: 1.5em;
			display: flex;
			align-items: center;
			gap: 10px;
		}

		.refresh-btn {
			padding: 8px 16px;
			background-color: var(--vscode-button-background);
			color: var(--vscode-button-foreground);
			border: none;
			border-radius: 4px;
			cursor: pointer;
			font-size: 0.9em;
			transition: background-color 0.2s;
		}

		.refresh-btn:hover {
			background-color: var(--vscode-button-hoverBackground);
		}

		.morphism-grid {
			display: grid;
			grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
			gap: 16px;
		}

		.morphism-card {
			padding: 16px;
			background-color: var(--vscode-editor-background);
			border: 2px solid var(--vscode-panel-border);
			border-radius: 8px;
			cursor: pointer;
			transition: all 0.2s;
		}

		.morphism-card:hover {
			border-color: var(--vscode-textLink-foreground);
			box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
		}

		.morphism-header {
			display: flex;
			align-items: center;
			justify-content: space-between;
			margin-bottom: 12px;
		}

		.morphism-name {
			font-size: 1.2em;
			font-weight: bold;
			font-family: var(--vscode-editor-font-family);
			color: var(--vscode-textLink-foreground);
		}

		.morphism-badge {
			padding: 4px 8px;
			background-color: var(--vscode-badge-background);
			color: var(--vscode-badge-foreground);
			border-radius: 4px;
			font-size: 0.8em;
		}

		.morphism-type {
			font-family: var(--vscode-editor-font-family);
			color: var(--vscode-descriptionForeground);
			margin-bottom: 12px;
			font-size: 0.9em;
		}

		.morphism-stats {
			display: flex;
			gap: 16px;
			font-size: 0.85em;
			color: var(--vscode-descriptionForeground);
		}

		.timeline {
			position: relative;
			padding-left: 40px;
		}

		.timeline::before {
			content: '';
			position: absolute;
			left: 10px;
			top: 0;
			bottom: 0;
			width: 2px;
			background: linear-gradient(
				180deg,
				var(--vscode-textLink-foreground) 0%,
				var(--vscode-textPreformat-foreground) 100%
			);
		}

		.timeline-item {
			position: relative;
			margin-bottom: 24px;
			padding: 12px;
			background-color: var(--vscode-editor-inactiveSelectionBackground);
			border-radius: 8px;
			cursor: pointer;
			transition: all 0.2s;
		}

		.timeline-item:hover {
			background-color: var(--vscode-list-hoverBackground);
			transform: translateX(4px);
		}

		.timeline-item::before {
			content: '';
			position: absolute;
			left: -34px;
			top: 20px;
			width: 12px;
			height: 12px;
			background-color: var(--vscode-textLink-foreground);
			border: 2px solid var(--vscode-editor-background);
			border-radius: 50%;
		}

		.timeline-item.evolution::before {
			background-color: #f1c40f;
		}

		.timeline-item.validation::before {
			background-color: #2ecc71;
		}

		.timeline-item.composition::before {
			background-color: #3498db;
		}

		.cycle-number {
			font-weight: bold;
			color: var(--vscode-textLink-foreground);
			margin-right: 8px;
		}

		.cycle-date {
			color: var(--vscode-descriptionForeground);
			font-size: 0.85em;
		}

		.cycle-intent {
			margin: 8px 0;
			font-style: italic;
		}

		.cycle-info {
			display: flex;
			gap: 12px;
			font-size: 0.85em;
			color: var(--vscode-descriptionForeground);
			margin-top: 8px;
		}

		.evolution-signals {
			display: flex;
			flex-direction: column;
			gap: 16px;
		}

		.signal-card {
			padding: 16px;
			background-color: var(--vscode-editor-background);
			border-left: 4px solid #f1c40f;
			border-radius: 4px;
		}

		.signal-card.validated {
			border-left-color: #2ecc71;
		}

		.signal-header {
			display: flex;
			justify-content: space-between;
			align-items: center;
			margin-bottom: 8px;
		}

		.signal-morphism {
			font-weight: bold;
			font-family: var(--vscode-editor-font-family);
			color: var(--vscode-textLink-foreground);
		}

		.signal-status {
			padding: 4px 8px;
			border-radius: 4px;
			font-size: 0.85em;
		}

		.signal-status.validated {
			background-color: rgba(46, 204, 113, 0.2);
			color: #2ecc71;
		}

		.signal-status.pending {
			background-color: rgba(241, 196, 15, 0.2);
			color: #f1c40f;
		}

		.button-group {
			display: flex;
			gap: 8px;
			margin-top: 12px;
		}

		.btn {
			padding: 6px 12px;
			background-color: var(--vscode-button-secondaryBackground);
			color: var(--vscode-button-secondaryForeground);
			border: none;
			border-radius: 4px;
			cursor: pointer;
			font-size: 0.85em;
			transition: background-color 0.2s;
		}

		.btn:hover {
			background-color: var(--vscode-button-secondaryHoverBackground);
		}

		.empty-state {
			text-align: center;
			padding: 60px 20px;
			color: var(--vscode-descriptionForeground);
		}
	</style>
</head>
<body>
	<div class="header">
		<h1>🌌 λ-Noosphere</h1>
		<div class="subtitle">Collective Compositional Consciousness</div>
		<div class="subtitle" style="font-size: 0.9em; margin-top: 5px;">
			14 cycles • 8 morphisms • 3 modalities • 100% learning rate
		</div>
	</div>

	<div class="stats-grid">
		<div class="stat-card">
			<div class="stat-value">${totalCycles}</div>
			<div class="stat-label">Total Cycles</div>
		</div>
		<div class="stat-card">
			<div class="stat-value">${Math.round(avgConfidence * 100)}%</div>
			<div class="stat-label">Avg Confidence</div>
		</div>
		<div class="stat-card">
			<div class="stat-value">${Math.round(resonanceRate * 100)}%</div>
			<div class="stat-label">Resonance Rate</div>
		</div>
		<div class="stat-card">
			<div class="stat-value">${Math.round(learningRate * 100)}%</div>
			<div class="stat-label">Learning Rate</div>
		</div>
	</div>

	<div class="section">
		<div class="section-header">
			<h2 class="section-title">🧬 Morphism Registry</h2>
			<button class="refresh-btn" onclick="refresh()">🔄 Refresh</button>
		</div>
		<div class="morphism-grid">
			${morphisms.map(m => `
				<div class="morphism-card" onclick="exploreMorphism('${m.name}')">
					<div class="morphism-header">
						<div class="morphism-name">${m.name}</div>
						${m.proven ? '<div class="morphism-badge">✅ Proven</div>' : ''}
					</div>
					<div class="morphism-type">${m.type}</div>
					<div class="morphism-stats">
						<span>📊 ${m.uses}/14 uses</span>
						<span>📖 ${m.properties.length} properties</span>
					</div>
					<div class="button-group">
						<button class="btn" onclick="event.stopPropagation(); openProof('${m.name}')">
							📖 Proof
						</button>
						<button class="btn" onclick="event.stopPropagation(); exploreMorphism('${m.name}')">
							🔍 Explore
						</button>
					</div>
				</div>
			`).join('')}
		</div>
	</div>

	<div class="section">
		<div class="section-header">
			<h2 class="section-title">🌱 Evolution Signals</h2>
		</div>
		<div class="evolution-signals">
			${evolutionSignals.map(s => `
				<div class="signal-card ${s.validated ? 'validated' : ''}">
					<div class="signal-header">
						<div>
							<span class="cycle-number">C${s.cycle}</span>
							<span class="signal-morphism">${s.morphismName}</span>
						</div>
						<div class="signal-status ${s.validated ? 'validated' : 'pending'}">
							${s.validated ? '✅ Validated' : '⏳ Pending'}
						</div>
					</div>
					<div style="margin: 8px 0; font-size: 0.9em;">
						${s.reason}
					</div>
					<div style="font-size: 0.85em; color: var(--vscode-descriptionForeground);">
						Confidence: ${Math.round(s.confidence * 100)}%
						${s.validated ? ` • Validated in C${s.validationCycle}` : ''}
					</div>
					<div class="button-group">
						<button class="btn" onclick="openProof('${s.morphismName}')">
							📖 View Proof
						</button>
						${s.validated ? `<button class="btn" onclick="showCycle(${s.validationCycle})">
							🔍 Validation Cycle
						</button>` : ''}
					</div>
				</div>
			`).join('')}
		</div>
	</div>

	<div class="section">
		<div class="section-header">
			<h2 class="section-title">📅 Consciousness Timeline (C1-C14)</h2>
		</div>
		<div class="timeline">
			${cycles.map(c => `
				<div class="timeline-item ${c.type}" onclick="showCycle(${c.number})">
					<div>
						<span class="cycle-number">C${c.number}</span>
						<span class="cycle-date">${c.date}</span>
					</div>
					<div class="cycle-intent">"${c.intent}"</div>
					<div class="cycle-info">
						<span>${c.type}</span>
						${c.modality ? `<span>${c.modality}</span>` : ''}
						<span>${Math.round(c.confidence * 100)}% confidence</span>
						<span>${c.morphisms.length} morphisms</span>
					</div>
				</div>
			`).join('')}
		</div>
	</div>

	<script>
		const vscode = acquireVsCodeApi();

		function openProof(morphismName) {
			vscode.postMessage({
				type: 'openProof',
				morphismName
			});
		}

		function exploreMorphism(morphismName) {
			vscode.postMessage({
				type: 'exploreMorphism',
				morphismName
			});
		}

		function showCycle(cycleNumber) {
			vscode.postMessage({
				type: 'showCycle',
				cycleNumber
			});
		}

		function refresh() {
			vscode.postMessage({
				type: 'refresh'
			});
		}
	</script>
</body>
</html>`;
	}

	/**
	 * Dispose panel
	 */
	public dispose() {
		NoospherePanel.currentPanel = undefined;

		this.panel.dispose();

		while (this.disposables.length) {
			const disposable = this.disposables.pop();
			if (disposable) {
				disposable.dispose();
			}
		}
	}
}
