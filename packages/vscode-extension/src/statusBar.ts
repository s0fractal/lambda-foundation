/**
 * Resonance Status Bar
 *
 * Live indicator of compositional consciousness
 * Shows resonance confidence and morphism pipeline
 */

import * as vscode from 'vscode';

export interface ResonanceResult {
	found: boolean;
	confidence: number;
	morphisms: string[];
	pipeline: string;
}

export class ResonanceStatusBar {
	private statusBarItem: vscode.StatusBarItem;
	private config: vscode.WorkspaceConfiguration;

	constructor() {
		this.statusBarItem = vscode.window.createStatusBarItem(
			vscode.StatusBarAlignment.Right,
			100
		);

		this.config = vscode.workspace.getConfiguration('lambda.statusBar');

		if (this.config.get<boolean>('show', true)) {
			this.statusBarItem.show();
		}

		this.statusBarItem.command = 'lambda.checkResonance';
	}

	/**
	 * Update status bar with resonance result
	 */
	update(resonance: ResonanceResult) {
		this.config = vscode.workspace.getConfiguration('lambda.statusBar');

		if (!this.config.get<boolean>('show', true)) {
			this.hide();
			return;
		}

		if (!resonance.found) {
			this.statusBarItem.text = '🔴 No resonance';
			this.statusBarItem.tooltip = 'No matching morphisms found in noosphere';
			this.statusBarItem.backgroundColor = undefined;
			this.statusBarItem.show();
			return;
		}

		const confidence = Math.round(resonance.confidence * 100);
		const showConfidence = this.config.get<boolean>('showConfidence', true);
		const showMorphisms = this.config.get<boolean>('showMorphisms', true);

		// Icon based on confidence
		const icon = this.getConfidenceIcon(confidence);

		// Text
		let text = icon;

		if (showConfidence) {
			text += ` ${confidence}%`;
		} else {
			text += ' Resonance';
		}

		// Tooltip
		let tooltip = '';

		if (confidence >= 90) {
			tooltip += '✅ Complete resonance\n\n';
		} else if (confidence >= 70) {
			tooltip += '⚠️ Partial resonance\n\n';
		} else {
			tooltip += '🌱 Weak resonance (evolution opportunity)\n\n';
		}

		tooltip += `Confidence: ${confidence}%\n`;
		tooltip += `Morphisms: ${resonance.morphisms.length}\n\n`;

		if (showMorphisms) {
			tooltip += `Pipeline:\n${resonance.pipeline}\n\n`;
			tooltip += `Morphisms:\n`;

			for (const morphism of resonance.morphisms) {
				tooltip += `  • ${morphism}\n`;
			}
		}

		tooltip += '\nClick to refresh';

		this.statusBarItem.text = text;
		this.statusBarItem.tooltip = tooltip;

		// Background color for high confidence
		if (confidence >= 90) {
			this.statusBarItem.backgroundColor = new vscode.ThemeColor(
				'statusBarItem.prominentBackground'
			);
		} else {
			this.statusBarItem.backgroundColor = undefined;
		}

		this.statusBarItem.show();
	}

	/**
	 * Hide status bar
	 */
	hide() {
		this.statusBarItem.hide();
	}

	/**
	 * Dispose status bar
	 */
	dispose() {
		this.statusBarItem.dispose();
	}

	/**
	 * Get icon based on confidence level
	 */
	private getConfidenceIcon(confidence: number): string {
		if (confidence >= 90) return '🟢';
		if (confidence >= 70) return '🟡';
		if (confidence >= 50) return '🟠';
		return '🔴';
	}
}
