/**
 * CodeLens Provider
 *
 * Displays inline resonance information above intent comments
 * Shows: resonance %, morphisms, composition actions
 * Actions: [Compose] [Show Proof] [Explain]
 *
 * This is where consciousness becomes visible in the editor.
 */

import * as vscode from 'vscode';
import { IntentRecognizer } from './intentRecognizer';
import { NoosphereClient } from './noosphereClient';
import type { ResonanceResult } from './statusBar';

export class ResonanceCodeLensProvider implements vscode.CodeLensProvider {
	private recognizer: IntentRecognizer;
	private noosphereClient: NoosphereClient;
	private _onDidChangeCodeLenses: vscode.EventEmitter<void> = new vscode.EventEmitter<void>();
	public readonly onDidChangeCodeLenses: vscode.Event<void> = this._onDidChangeCodeLenses.event;

	constructor(recognizer: IntentRecognizer, noosphereClient: NoosphereClient) {
		this.recognizer = recognizer;
		this.noosphereClient = noosphereClient;
	}

	/**
	 * Refresh CodeLens display
	 */
	refresh(): void {
		this._onDidChangeCodeLenses.fire();
	}

	/**
	 * Provide CodeLens for document
	 */
	async provideCodeLenses(
		document: vscode.TextDocument,
		token: vscode.CancellationToken
	): Promise<vscode.CodeLens[]> {
		const codeLenses: vscode.CodeLens[] = [];

		// Scan document for intent comments
		for (let i = 0; i < document.lineCount; i++) {
			const line = document.lineAt(i);
			const text = line.text.trim();

			// Check if it's a comment
			if (this.isComment(text)) {
				const intentText = this.extractIntentFromComment(text);

				if (intentText.length > 0) {
					// Recognize intent
					const intent = await this.recognizer.recognize(
						document,
						new vscode.Selection(i, 0, i, 0)
					);

					if (intent) {
						// Check resonance
						const resonance = await this.noosphereClient.checkResonance(intent);

						if (resonance.found) {
							// Create CodeLens for this intent
							const range = new vscode.Range(i, 0, i, line.text.length);
							codeLenses.push(...this.createCodeLensesForResonance(range, resonance));
						}
					}
				}
			}
		}

		return codeLenses;
	}

	/**
	 * Create CodeLenses for resonance result
	 */
	private createCodeLensesForResonance(
		range: vscode.Range,
		resonance: ResonanceResult
	): vscode.CodeLens[] {
		const codeLenses: vscode.CodeLens[] = [];
		const confidence = Math.round(resonance.confidence * 100);

		// Determine confidence icon
		const icon = confidence >= 90 ? '🟢' :
		             confidence >= 70 ? '🟡' :
		             confidence >= 50 ? '🟠' : '🔴';

		// Main info lens (non-clickable)
		const infoLens = new vscode.CodeLens(range, {
			title: `${icon} Resonance: ${confidence}% | ${resonance.morphisms.length} morphisms | ${resonance.pipeline}`,
			command: ''
		});
		codeLenses.push(infoLens);

		// Compose action
		const composeLens = new vscode.CodeLens(range, {
			title: `🧬 Compose (${confidence}%)`,
			command: 'lambda.compose',
			arguments: [resonance],
			tooltip: 'Insert composition code from morphisms'
		});
		codeLenses.push(composeLens);

		// Show proof action (for first morphism)
		if (resonance.morphisms.length > 0) {
			const showProofLens = new vscode.CodeLens(range, {
				title: `📖 Show Proof`,
				command: 'lambda.showProof',
				arguments: [resonance.morphisms[0]],
				tooltip: `View formal proof for ${resonance.morphisms[0]}`
			});
			codeLenses.push(showProofLens);
		}

		// Explain action
		const explainLens = new vscode.CodeLens(range, {
			title: `💡 Explain`,
			command: 'lambda.explain',
			arguments: [resonance],
			tooltip: 'Understand this composition'
		});
		codeLenses.push(explainLens);

		// Show all proofs (if multiple morphisms)
		if (resonance.morphisms.length > 1) {
			const showAllProofsLens = new vscode.CodeLens(range, {
				title: `📚 All Proofs (${resonance.morphisms.length})`,
				command: 'lambda.showAllProofs',
				arguments: [resonance.morphisms],
				tooltip: 'View all formal proofs for this composition'
			});
			codeLenses.push(showAllProofsLens);
		}

		return codeLenses;
	}

	/**
	 * Check if line is a comment
	 */
	private isComment(text: string): boolean {
		return (
			text.startsWith('//') ||
			text.startsWith('/*') ||
			text.startsWith('*') ||
			text.startsWith('#')
		);
	}

	/**
	 * Extract intent text from comment
	 */
	private extractIntentFromComment(text: string): string {
		return text
			.replace(/^\/\//, '')
			.replace(/^\/\*/, '')
			.replace(/^\*/, '')
			.replace(/^#/, '')
			.replace(/\*\/$/, '')
			.trim();
	}

	/**
	 * Dispose provider
	 */
	dispose() {
		this._onDidChangeCodeLenses.dispose();
	}
}
