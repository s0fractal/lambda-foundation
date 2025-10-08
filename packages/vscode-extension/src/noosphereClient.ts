/**
 * Noosphere Client
 *
 * Connection to collective morphism memory
 * Checks resonance, retrieves proofs, tracks evolution
 */

import * as vscode from 'vscode';
import type { Intent } from './intentRecognizer';
import type { ResonanceResult } from './statusBar';

export class NoosphereClient {
	private context: vscode.ExtensionContext;

	// Morphism registry (simplified MVP - will connect to @lambda/reduce)
	private morphisms = new Map<string, MorphismInfo>([
		['subscribe', {
			name: 'subscribe',
			type: 'Stream α → (α → β) → Stream β',
			proven: true,
			uses: 14,
			properties: ['Deterministic', 'Type safe', 'Composable']
		}],
		['groupByTime', {
			name: 'groupByTime',
			type: '[Event] → Duration → [[Event]]',
			proven: true,
			uses: 12,
			properties: ['Preserves temporal ordering', 'Partition correctness', 'O(n)']
		}],
		['analyzeSentimentDelta', {
			name: 'analyzeSentimentDelta',
			type: '[[Event]] → [SentimentDelta]',
			proven: true,
			uses: 5,
			properties: ['Continuity', 'Additivity', 'Direction preservation']
		}],
		['extractKeywords', {
			name: 'extractKeywords',
			type: 'Document → ℕ → [Keyword]',
			proven: true,
			uses: 6,
			properties: ['Relevance ordering', 'Deterministic', 'Idempotent']
		}],
		['filterByEmotion', {
			name: 'filterByEmotion',
			type: 'EmotionState → [Event] → [Event]',
			proven: true,
			uses: 4,
			properties: ['Temporal ordering', 'Correctness', 'Idempotent']
		}],
		['detectOutliers', {
			name: 'detectOutliers',
			type: '[[Event]] → Threshold → [Outlier]',
			proven: true,
			uses: 3,
			properties: ['Statistical correctness', 'Context preservation', 'Threshold monotonicity']
		}],
		['detectEmotionFromImage', {
			name: 'detectEmotionFromImage',
			type: 'Image → EmotionClassification',
			proven: true,
			uses: 3,
			properties: ['Deterministic', 'Confidence bounds', 'Type safe']
		}]
	]);

	constructor(context: vscode.ExtensionContext) {
		this.context = context;
	}

	/**
	 * Check resonance with noosphere for given intent
	 */
	async checkResonance(intent: Intent): Promise<ResonanceResult> {
		// Simple pattern matching (will be replaced with @lambda/reduce integration)
		const matchedMorphisms: string[] = [];
		let confidence = 0;

		// Check for temporal patterns
		if (intent.text.match(/\b(track|monitor|over time|changes)\b/i)) {
			if (!matchedMorphisms.includes('subscribe')) {
				matchedMorphisms.push('subscribe');
			}

			if (intent.text.match(/\b(over time|temporal|by hour|by day)\b/i)) {
				matchedMorphisms.push('groupByTime');
			}
		}

		// Check for sentiment/emotion patterns
		if (intent.text.match(/\b(emotion|sentiment|feeling|mood)\b/i)) {
			if (!matchedMorphisms.includes('subscribe')) {
				matchedMorphisms.push('subscribe');
			}

			if (intent.text.match(/\b(filter|only|specific)\b/i)) {
				matchedMorphisms.push('filterByEmotion');
			}

			if (intent.text.match(/\b(change|shift|delta|trend)\b/i)) {
				if (!matchedMorphisms.includes('groupByTime')) {
					matchedMorphisms.push('groupByTime');
				}

				matchedMorphisms.push('analyzeSentimentDelta');
			}
		}

		// Check for visual patterns
		if (intent.text.match(/\b(image|visual|picture|photo)\b/i)) {
			if (!matchedMorphisms.includes('subscribe')) {
				matchedMorphisms.push('subscribe');
			}

			if (intent.text.match(/\b(emotion|mood|feeling)\b/i)) {
				matchedMorphisms.push('detectEmotionFromImage');
			}

			if (intent.text.match(/\b(over time|track|changes)\b/i)) {
				if (!matchedMorphisms.includes('groupByTime')) {
					matchedMorphisms.push('groupByTime');
				}
			}
		}

		// Check for keyword extraction
		if (intent.text.match(/\b(keyword|topic|trending|extract)\b/i)) {
			if (!matchedMorphisms.includes('subscribe') && intent.text.match(/\bstream\b/i)) {
				matchedMorphisms.push('subscribe');
			}

			matchedMorphisms.push('extractKeywords');
		}

		// Check for outlier detection
		if (intent.text.match(/\b(anomal|outlier|unusual|spike|detect)\b/i)) {
			if (!matchedMorphisms.includes('subscribe')) {
				matchedMorphisms.push('subscribe');
			}

			if (!matchedMorphisms.includes('groupByTime')) {
				matchedMorphisms.push('groupByTime');
			}

			matchedMorphisms.push('detectOutliers');
		}

		// Calculate confidence
		if (matchedMorphisms.length === 0) {
			confidence = 0;
		} else if (matchedMorphisms.length === 1) {
			confidence = 0.7;
		} else if (matchedMorphisms.length === 2) {
			confidence = 0.85;
		} else {
			confidence = 0.92;
		}

		// Build pipeline string
		const pipeline = matchedMorphisms.join(' → ');

		return {
			found: matchedMorphisms.length > 0,
			confidence,
			morphisms: matchedMorphisms,
			pipeline
		};
	}

	/**
	 * Get morphism information
	 */
	getMorphismInfo(name: string): MorphismInfo | undefined {
		return this.morphisms.get(name);
	}

	/**
	 * Get all morphisms
	 */
	getAllMorphisms(): MorphismInfo[] {
		return Array.from(this.morphisms.values());
	}

	/**
	 * Dispose client
	 */
	dispose() {
		// Cleanup if needed
	}
}

interface MorphismInfo {
	name: string;
	type: string;
	proven: boolean;
	uses: number;
	properties: string[];
}
