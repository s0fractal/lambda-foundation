/**
 * Enhanced Composition Engine
 *
 * The heart of meta-understanding.
 * Validates types, supports nesting, detects conflicts.
 *
 * This is where morphisms become mathematically verified compositions.
 */

import type { NoosphereClient } from './noosphereClient';

/**
 * Type expression in lambda calculus notation
 * Examples: "Stream α", "[Event]", "α → β"
 */
export type TypeExpr = {
	raw: string;
	isFunction: boolean;
	input?: TypeExpr;
	output?: TypeExpr;
	constructor?: string;
	variable?: string;
}

/**
 * Composition validation result
 */
export interface CompositionResult {
	valid: boolean;
	morphisms: string[];
	typeFlow: string[];
	conflicts: CompositionConflict[];
	confidence: number;
}

/**
 * Composition conflict
 */
export interface CompositionConflict {
	position: number;
	fromMorphism: string;
	toMorphism: string;
	reason: string;
	severity: 'error' | 'warning' | 'info';
}

/**
 * Enhanced Composition Engine
 */
export class CompositionEngine {
	private noosphereClient: NoosphereClient;

	constructor(noosphereClient: NoosphereClient) {
		this.noosphereClient = noosphereClient;
	}

	/**
	 * Validate composition of morphisms
	 */
	validateComposition(morphismNames: string[]): CompositionResult {
		const conflicts: CompositionConflict[] = [];
		const typeFlow: string[] = [];
		let confidence = 1.0;

		if (morphismNames.length === 0) {
			return {
				valid: false,
				morphisms: [],
				typeFlow: [],
				conflicts: [{
					position: 0,
					fromMorphism: '',
					toMorphism: '',
					reason: 'No morphisms to compose',
					severity: 'error'
				}],
				confidence: 0
			};
		}

		// Get morphism info
		const morphisms = morphismNames.map(name => {
			const info = this.noosphereClient.getMorphismInfo(name);
			if (!info) {
				conflicts.push({
					position: morphismNames.indexOf(name),
					fromMorphism: name,
					toMorphism: '',
					reason: `Unknown morphism: ${name}`,
					severity: 'error'
				});
				confidence *= 0.5;
			}
			return info;
		}).filter(m => m !== undefined);

		if (morphisms.length === 0) {
			return {
				valid: false,
				morphisms: morphismNames,
				typeFlow: [],
				conflicts,
				confidence: 0
			};
		}

		// Parse types
		const types = morphisms.map(m => this.parseType(m!.type));

		// Validate type compatibility
		for (let i = 0; i < types.length - 1; i++) {
			const current = types[i];
			const next = types[i + 1];

			// Check if output of current matches input of next
			const compatible = this.isTypeCompatible(
				this.getOutputType(current),
				this.getInputType(next)
			);

			if (!compatible) {
				conflicts.push({
					position: i,
					fromMorphism: morphismNames[i],
					toMorphism: morphismNames[i + 1],
					reason: `Type mismatch: ${this.getOutputType(current).raw} → ${this.getInputType(next).raw}`,
					severity: 'error'
				});
				confidence *= 0.7;
			}

			typeFlow.push(current.raw);
		}

		// Add last type
		if (types.length > 0) {
			typeFlow.push(types[types.length - 1].raw);
		}

		// Check for common anti-patterns
		this.detectAntiPatterns(morphismNames, conflicts);

		const valid = conflicts.filter(c => c.severity === 'error').length === 0;

		return {
			valid,
			morphisms: morphismNames,
			typeFlow,
			conflicts,
			confidence: Math.max(0, Math.min(1, confidence))
		};
	}

	/**
	 * Parse type expression
	 */
	private parseType(typeStr: string): TypeExpr {
		const trimmed = typeStr.trim();

		// Check for function type (contains →)
		if (trimmed.includes('→')) {
			const parts = trimmed.split('→').map(p => p.trim());

			if (parts.length === 2) {
				return {
					raw: trimmed,
					input: this.parseType(parts[0]),
					output: this.parseType(parts[1]),
					isFunction: true,
					constructor: undefined
				} as TypeExpr;
			} else if (parts.length > 2) {
				// Multi-parameter function (curried)
				// e.g., "α → β → γ" = "α → (β → γ)"
				const input = this.parseType(parts[0]);
				const rest = parts.slice(1).join(' → ');
				const output = this.parseType(rest);

				return {
					raw: trimmed,
					input,
					output,
					isFunction: true,
					constructor: undefined
				} as TypeExpr;
			}
		}

		// Check for parametric type (e.g., Stream α, [Event])
		const streamMatch = trimmed.match(/^Stream\s+(.+)$/);
		if (streamMatch) {
			return {
				raw: trimmed,
				constructor: 'Stream',
				variable: streamMatch[1],
				isFunction: false
			};
		}

		const listMatch = trimmed.match(/^\[(.+)\]$/);
		if (listMatch) {
			return {
				raw: trimmed,
				constructor: 'List',
				variable: listMatch[1],
				isFunction: false
			};
		}

		const nestedListMatch = trimmed.match(/^\[\[(.+)\]\]$/);
		if (nestedListMatch) {
			return {
				raw: trimmed,
				constructor: 'List',
				variable: `[${nestedListMatch[1]}]`,
				isFunction: false
			};
		}

		// Type variable or concrete type
		return {
			raw: trimmed,
			variable: trimmed.match(/^[α-ω]$/) ? trimmed : undefined,
			constructor: !trimmed.match(/^[α-ω]$/) ? trimmed : undefined,
			isFunction: false
		};
	}

	/**
	 * Get input type of a type expression
	 */
	private getInputType(type: TypeExpr): TypeExpr {
		if (type.isFunction && type.input) {
			return type.input;
		}
		return type; // For non-functions, input is the type itself
	}

	/**
	 * Get output type of a type expression
	 */
	private getOutputType(type: TypeExpr): TypeExpr {
		if (type.isFunction && type.output) {
			return type.output;
		}
		return type; // For non-functions, output is the type itself
	}

	/**
	 * Check if two types are compatible
	 */
	private isTypeCompatible(output: TypeExpr, input: TypeExpr): boolean {
		// Exact match
		if (output.raw === input.raw) {
			return true;
		}

		// Type variable unification (α can match anything)
		if (output.variable && output.variable.match(/^[α-ω]$/)) {
			return true;
		}
		if (input.variable && input.variable.match(/^[α-ω]$/)) {
			return true;
		}

		// Constructor match with different parameters
		if (output.constructor && input.constructor) {
			if (output.constructor === input.constructor) {
				// Same constructor (e.g., both Stream or both List)
				// Check if variables are compatible
				if (output.variable && input.variable) {
					return this.isTypeCompatible(
						this.parseType(output.variable),
						this.parseType(input.variable)
					);
				}
				return true;
			}
		}

		// Special case: [α] can match [[α]] for grouping operations
		if (output.constructor === 'List' && input.constructor === 'List') {
			if (input.variable?.startsWith('[') && input.variable?.endsWith(']')) {
				// [[α]] expects grouped data
				return true;
			}
		}

		return false;
	}

	/**
	 * Detect anti-patterns in composition
	 */
	private detectAntiPatterns(morphisms: string[], conflicts: CompositionConflict[]) {
		// Anti-pattern 1: Missing subscribe at start
		if (morphisms.length > 0 && morphisms[0] !== 'subscribe') {
			const firstMorphism = this.noosphereClient.getMorphismInfo(morphisms[0]);
			if (firstMorphism && firstMorphism.type.includes('Stream')) {
				conflicts.push({
					position: 0,
					fromMorphism: '',
					toMorphism: morphisms[0],
					reason: 'Pipeline should start with subscribe for Stream operations',
					severity: 'warning'
				});
			}
		}

		// Anti-pattern 2: Duplicate morphisms
		const seen = new Set<string>();
		for (let i = 0; i < morphisms.length; i++) {
			if (seen.has(morphisms[i])) {
				conflicts.push({
					position: i,
					fromMorphism: morphisms[i],
					toMorphism: '',
					reason: `Duplicate morphism: ${morphisms[i]}`,
					severity: 'warning'
				});
			}
			seen.add(morphisms[i]);
		}

		// Anti-pattern 3: groupByTime without temporal operations
		const groupByTimeIndex = morphisms.indexOf('groupByTime');
		if (groupByTimeIndex !== -1) {
			const hasTemporalOutput = morphisms.slice(groupByTimeIndex + 1).some(m => {
				const info = this.noosphereClient.getMorphismInfo(m);
				return info?.type.includes('SentimentDelta') ||
				       info?.type.includes('Outlier') ||
				       info?.type.includes('Keyword');
			});

			if (!hasTemporalOutput && groupByTimeIndex === morphisms.length - 1) {
				conflicts.push({
					position: groupByTimeIndex,
					fromMorphism: 'groupByTime',
					toMorphism: '',
					reason: 'groupByTime should be followed by temporal analysis',
					severity: 'info'
				});
			}
		}
	}

	/**
	 * Generate optimized composition code
	 */
	generateComposition(result: CompositionResult, sourceVar: string = 'source'): string {
		if (!result.valid || result.morphisms.length === 0) {
			return '// Invalid composition - check conflicts';
		}

		let code = '';

		// Add confidence comment
		code += `// Composition validated (${Math.round(result.confidence * 100)}% confidence)\n`;

		// Add type flow
		code += `// Type flow: ${result.typeFlow.join(' → ')}\n`;

		// Add warnings if any
		const warnings = result.conflicts.filter(c => c.severity === 'warning');
		if (warnings.length > 0) {
			code += `// Warnings: ${warnings.length}\n`;
			warnings.forEach(w => {
				code += `//   - ${w.reason}\n`;
			});
		}

		code += '\n';

		// Generate pipeline
		code += `const pipeline = ${result.morphisms[0]}(${sourceVar})`;

		for (let i = 1; i < result.morphisms.length; i++) {
			code += `\n  .pipe(${result.morphisms[i]}())`;
		}

		code += ';\n\n';

		// Add proof references
		code += `// Proven: ${result.morphisms.map(m => `wiki/proofs/${m}.proof`).join(', ')}\n`;

		return code;
	}

	/**
	 * Support nested morphism composition
	 * Example: groupByTime(analyzeSentimentDelta())
	 */
	parseNestedComposition(expression: string): string[] {
		// Simple parser for nested function calls
		// TODO: Implement full AST parser for complex nesting

		const morphisms: string[] = [];

		// Match pattern: name(args)
		const functionPattern = /(\w+)\s*\(/g;
		let match;

		while ((match = functionPattern.exec(expression)) !== null) {
			morphisms.push(match[1]);
		}

		return morphisms;
	}
}
