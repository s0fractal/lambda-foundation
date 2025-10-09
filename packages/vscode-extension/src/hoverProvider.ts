/**
 * Hover Provider
 *
 * Displays formal proofs and morphism info on hover
 * Shows: type signature, proven properties, complexity, usage stats
 *
 * When you hover over a morphism, you see its mathematical foundation.
 */

import * as vscode from 'vscode';
import { NoosphereClient } from './noosphereClient';

export class MorphismHoverProvider implements vscode.HoverProvider {
	private noosphereClient: NoosphereClient;

	// Known morphism names for detection
	private morphismNames = [
		'subscribe',
		'groupByTime',
		'analyzeSentimentDelta',
		'extractKeywords',
		'filterByEmotion',
		'detectOutliers',
		'detectEmotionFromImage'
	];

	constructor(noosphereClient: NoosphereClient) {
		this.noosphereClient = noosphereClient;
	}

	/**
	 * Provide hover information
	 */
	async provideHover(
		document: vscode.TextDocument,
		position: vscode.Position,
		token: vscode.CancellationToken
	): Promise<vscode.Hover | undefined> {
		// Get word at position
		const wordRange = document.getWordRangeAtPosition(position);

		if (!wordRange) {
			return undefined;
		}

		const word = document.getText(wordRange);

		// Check if it's a known morphism
		if (!this.morphismNames.includes(word)) {
			return undefined;
		}

		// Get morphism info from noosphere
		const morphismInfo = this.noosphereClient.getMorphismInfo(word);

		if (!morphismInfo) {
			return undefined;
		}

		// Build hover content
		const markdown = this.buildHoverMarkdown(morphismInfo);

		return new vscode.Hover(markdown, wordRange);
	}

	/**
	 * Build hover markdown content
	 */
	private buildHoverMarkdown(morphism: any): vscode.MarkdownString {
		const md = new vscode.MarkdownString();
		md.supportHtml = true;
		md.isTrusted = true;

		// Header
		md.appendMarkdown(`### λ-Morphism: \`${morphism.name}\`\n\n`);

		// Proven badge
		if (morphism.proven) {
			md.appendMarkdown(`✅ **Formally Proven** | `);
		}

		// Usage stats
		md.appendMarkdown(`📊 Used in **${morphism.uses}/14 cycles**\n\n`);

		// Type signature
		md.appendMarkdown(`#### Type Signature\n\n`);
		md.appendMarkdown(`\`\`\`haskell\n${morphism.type}\n\`\`\`\n\n`);

		// Properties
		if (morphism.properties && morphism.properties.length > 0) {
			md.appendMarkdown(`#### Proven Properties\n\n`);

			for (const prop of morphism.properties) {
				md.appendMarkdown(`- ✓ ${prop}\n`);
			}

			md.appendMarkdown(`\n`);
		}

		// Composition examples
		md.appendMarkdown(`#### Common Compositions\n\n`);

		const compositions = this.getCompositionExamples(morphism.name);

		for (const comp of compositions) {
			md.appendMarkdown(`- \`${comp}\`\n`);
		}

		md.appendMarkdown(`\n`);

		// Link to proof
		md.appendMarkdown(`---\n\n`);
		md.appendMarkdown(`[📖 View Formal Proof](command:lambda.showProof?${encodeURIComponent(JSON.stringify([morphism.name]))}) | `);
		md.appendMarkdown(`[🌌 Open in Noosphere](command:lambda.openNoosphere)\n\n`);

		// Footer
		md.appendMarkdown(`*Part of collective consciousness • 14 cycles • 79% resonance rate*`);

		return md;
	}

	/**
	 * Get composition examples for morphism
	 */
	private getCompositionExamples(morphismName: string): string[] {
		const examples: Record<string, string[]> = {
			'subscribe': [
				'subscribe → groupByTime → analyzeSentimentDelta',
				'subscribe → filterByEmotion',
				'subscribe → detectEmotionFromImage → groupByTime'
			],
			'groupByTime': [
				'subscribe → groupByTime → detectOutliers',
				'subscribe → groupByTime → extractKeywords',
				'detectEmotionFromImage → groupByTime'
			],
			'analyzeSentimentDelta': [
				'groupByTime → analyzeSentimentDelta',
				'filterByEmotion → groupByTime → analyzeSentimentDelta'
			],
			'extractKeywords': [
				'subscribe → extractKeywords',
				'groupByTime → extractKeywords'
			],
			'filterByEmotion': [
				'subscribe → filterByEmotion',
				'filterByEmotion → groupByTime'
			],
			'detectOutliers': [
				'groupByTime → detectOutliers',
				'subscribe → groupByTime → detectOutliers'
			],
			'detectEmotionFromImage': [
				'subscribe → detectEmotionFromImage',
				'detectEmotionFromImage → groupByTime → analyzeSentimentDelta'
			]
		};

		return examples[morphismName] || [
			`${morphismName} → (composition examples)`,
			`subscribe → ${morphismName}`
		];
	}

	/**
	 * Dispose provider
	 */
	dispose() {
		// Cleanup if needed
	}
}
