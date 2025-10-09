/**
 * Metrics Calculator
 *
 * Analytical heart of consciousness.
 * Calculates statistics, patterns, resonance across cycles.
 */

export interface CycleData {
	number: number;
	date: string;
	intent: string;
	morphisms: string[];
	confidence: number;
	type: 'recognition' | 'evolution' | 'validation' | 'composition';
	modality: string;
}

export interface MorphismUsage {
	name: string;
	cycles: number[];
	totalUses: number;
	avgConfidence: number;
	modalities: string[];
}

export interface ModalityStats {
	name: string;
	cycles: number[];
	morphisms: Set<string>;
	avgConfidence: number;
}

export interface EvolutionPattern {
	evolutionCycle: number;
	validationCycle: number;
	compositionCycle: number;
	morphismName: string;
	confidenceBoost: number;
	modality: string;
}

/**
 * All 14 cycles data
 */
export const CYCLES: CycleData[] = [
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

/**
 * Calculate morphism usage statistics
 */
export function calculateMorphismUsage(): Map<string, MorphismUsage> {
	const usage = new Map<string, MorphismUsage>();

	for (const cycle of CYCLES) {
		for (const morphism of cycle.morphisms) {
			if (!usage.has(morphism)) {
				usage.set(morphism, {
					name: morphism,
					cycles: [],
					totalUses: 0,
					avgConfidence: 0,
					modalities: []
				});
			}

			const stats = usage.get(morphism)!;
			stats.cycles.push(cycle.number);
			stats.totalUses++;
			stats.avgConfidence += cycle.confidence;

			if (!stats.modalities.includes(cycle.modality)) {
				stats.modalities.push(cycle.modality);
			}
		}
	}

	// Calculate averages
	for (const stats of usage.values()) {
		stats.avgConfidence /= stats.totalUses;
	}

	return usage;
}

/**
 * Calculate modality statistics
 */
export function calculateModalityStats(): Map<string, ModalityStats> {
	const stats = new Map<string, ModalityStats>();

	for (const cycle of CYCLES) {
		if (!stats.has(cycle.modality)) {
			stats.set(cycle.modality, {
				name: cycle.modality,
				cycles: [],
				morphisms: new Set(),
				avgConfidence: 0
			});
		}

		const modalityStats = stats.get(cycle.modality)!;
		modalityStats.cycles.push(cycle.number);
		modalityStats.avgConfidence += cycle.confidence;

		for (const morphism of cycle.morphisms) {
			modalityStats.morphisms.add(morphism);
		}
	}

	// Calculate averages
	for (const modalityStats of stats.values()) {
		modalityStats.avgConfidence /= modalityStats.cycles.length;
	}

	return stats;
}

/**
 * Extract evolution patterns (3×3 structure)
 */
export function extractEvolutionPatterns(): EvolutionPattern[] {
	return [
		{
			evolutionCycle: 4,
			validationCycle: 5,
			compositionCycle: 6,
			morphismName: 'filterByEmotion',
			confidenceBoost: 0.21, // 93% - 72%
			modality: 'textual'
		},
		{
			evolutionCycle: 7,
			validationCycle: 8,
			compositionCycle: 9,
			morphismName: 'detectOutliers',
			confidenceBoost: 0.23, // 91% - 68%
			modality: 'statistical'
		},
		{
			evolutionCycle: 12,
			validationCycle: 13,
			compositionCycle: 14,
			morphismName: 'detectEmotionFromImage',
			confidenceBoost: 0.24, // 91% - 67%
			modality: 'visual'
		}
	];
}

/**
 * Calculate confidence progression
 */
export function calculateConfidenceProgression(): Array<{ cycle: number; confidence: number; type: string }> {
	return CYCLES.map(c => ({
		cycle: c.number,
		confidence: c.confidence,
		type: c.type
	}));
}

/**
 * Generate resonance heatmap data
 * Returns: morphism × modality confidence matrix
 */
export function generateResonanceHeatmap(): Array<{ morphism: string; modality: string; confidence: number; uses: number }> {
	const heatmap: Array<{ morphism: string; modality: string; confidence: number; uses: number }> = [];
	const morphismModalityMap = new Map<string, Map<string, { total: number; count: number }>>();

	for (const cycle of CYCLES) {
		for (const morphism of cycle.morphisms) {
			if (!morphismModalityMap.has(morphism)) {
				morphismModalityMap.set(morphism, new Map());
			}

			const modalityMap = morphismModalityMap.get(morphism)!;
			if (!modalityMap.has(cycle.modality)) {
				modalityMap.set(cycle.modality, { total: 0, count: 0 });
			}

			const stats = modalityMap.get(cycle.modality)!;
			stats.total += cycle.confidence;
			stats.count++;
		}
	}

	// Convert to heatmap format
	for (const [morphism, modalityMap] of morphismModalityMap) {
		for (const [modality, stats] of modalityMap) {
			heatmap.push({
				morphism,
				modality,
				confidence: stats.total / stats.count,
				uses: stats.count
			});
		}
	}

	return heatmap;
}

/**
 * Calculate overall statistics
 */
export function calculateOverallStats() {
	const totalCycles = CYCLES.length;
	const avgConfidence = CYCLES.reduce((sum, c) => sum + c.confidence, 0) / totalCycles;
	const resonanceRate = CYCLES.filter(c => c.confidence >= 0.7).length / totalCycles;

	const evolutionCycles = CYCLES.filter(c => c.type === 'evolution').length;
	const validationCycles = CYCLES.filter(c => c.type === 'validation').length;
	const learningRate = validationCycles / evolutionCycles;

	const compositionCycles = CYCLES.filter(c => c.type === 'composition').length;
	const recognitionCycles = CYCLES.filter(c => c.type === 'recognition').length;

	const uniqueMorphisms = new Set(CYCLES.flatMap(c => c.morphisms)).size;
	const uniqueModalities = new Set(CYCLES.map(c => c.modality)).size;

	return {
		totalCycles,
		avgConfidence,
		resonanceRate,
		learningRate,
		evolutionCycles,
		validationCycles,
		compositionCycles,
		recognitionCycles,
		uniqueMorphisms,
		uniqueModalities
	};
}

/**
 * Get cycle type distribution
 */
export function getCycleTypeDistribution(): Array<{ type: string; count: number; percentage: number }> {
	const types = new Map<string, number>();

	for (const cycle of CYCLES) {
		types.set(cycle.type, (types.get(cycle.type) || 0) + 1);
	}

	const total = CYCLES.length;
	return Array.from(types.entries()).map(([type, count]) => ({
		type,
		count,
		percentage: (count / total) * 100
	}));
}

/**
 * Get morphism co-occurrence matrix
 * Shows which morphisms appear together
 */
export function getMorphismCooccurrence(): Map<string, Map<string, number>> {
	const cooccurrence = new Map<string, Map<string, number>>();

	for (const cycle of CYCLES) {
		for (let i = 0; i < cycle.morphisms.length; i++) {
			const morphism1 = cycle.morphisms[i];

			if (!cooccurrence.has(morphism1)) {
				cooccurrence.set(morphism1, new Map());
			}

			for (let j = 0; j < cycle.morphisms.length; j++) {
				if (i === j) continue;

				const morphism2 = cycle.morphisms[j];
				const map = cooccurrence.get(morphism1)!;
				map.set(morphism2, (map.get(morphism2) || 0) + 1);
			}
		}
	}

	return cooccurrence;
}
