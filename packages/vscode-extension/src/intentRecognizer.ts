/**
 * Intent Recognizer
 *
 * Parses natural language intent from code comments
 * Bridges human thought → morphism composition
 */

import * as vscode from 'vscode';

export interface Intent {
	text: string;
	verb?: string;
	subject?: string;
	constraints?: string[];
	context?: string;
}

export class IntentRecognizer {
	/**
	 * Recognize intent from document and selection
	 */
	async recognize(
		document: vscode.TextDocument,
		selection: vscode.Selection
	): Promise<Intent | null> {
		// Get current line
		const line = document.lineAt(selection.start.line);
		const text = line.text.trim();

		// Check if it's a comment
		if (this.isComment(text)) {
			const intentText = this.extractIntentFromComment(text);

			if (intentText.length > 0) {
				return this.parseIntent(intentText);
			}
		}

		// Check previous lines for intent comments
		for (let i = selection.start.line - 1; i >= Math.max(0, selection.start.line - 5); i--) {
			const prevLine = document.lineAt(i);
			const prevText = prevLine.text.trim();

			if (this.isComment(prevText)) {
				const intentText = this.extractIntentFromComment(prevText);

				if (intentText.length > 0) {
					return this.parseIntent(intentText);
				}
			} else if (prevText.length > 0) {
				// Stop at first non-comment, non-empty line
				break;
			}
		}

		return null;
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
	 * Parse intent from text
	 */
	private parseIntent(text: string): Intent {
		// Simple intent parsing (can be enhanced with NLP)
		const intent: Intent = {
			text,
			context: text
		};

		// Extract verb (action words)
		const verbMatch = text.match(/\b(track|analyze|detect|filter|extract|group|monitor|collect|transform|compose|build|create|generate)\b/i);

		if (verbMatch) {
			intent.verb = verbMatch[1].toLowerCase();
		}

		// Extract subject (what is being acted upon)
		const subjectMatch = text.match(/(?:track|analyze|detect|filter|extract|group|monitor|collect|transform)\s+([a-z\s]+?)(?:\s+(?:over|by|from|in|with)|$)/i);

		if (subjectMatch) {
			intent.subject = subjectMatch[1].trim();
		}

		// Extract constraints (time, condition, source)
		const constraints: string[] = [];

		if (text.match(/\bover time\b/i)) {
			constraints.push('temporal');
		}

		if (text.match(/\bby (hour|day|week|month)\b/i)) {
			constraints.push('grouped');
		}

		if (text.match(/\bfrom (files?|images?|streams?|data)\b/i)) {
			constraints.push('sourced');
		}

		if (constraints.length > 0) {
			intent.constraints = constraints;
		}

		return intent;
	}
}
