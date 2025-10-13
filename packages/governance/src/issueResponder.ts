/**
 * @lambda-foundation/governance
 * Issue Responder - AI hypothesis generation from GitHub issues
 *
 * Chain of Thought: Analyze issue → Generate hypothesis → Propose solution
 *
 * Co-authored by: Gemini + Copilot + Claude + chaoshex
 */

import type { SelfModifyingMorphism } from '@lambda-foundation/self-modifying';
import { verify } from './verifier.js';

/**
 * Issue analysis result
 */
export interface IssueAnalysis {
  issueNumber: number;
  title: string;
  body: string;
  type: 'bug' | 'feature' | 'enhancement' | 'question' | 'discussion';
  complexity: 'low' | 'medium' | 'high';
  requiresCode: boolean;
  breakingChange: boolean;
  confidence: number;
  reasoning: string;
}

/**
 * Hypothesis for solving the issue
 */
export interface Hypothesis {
  description: string;
  approach: string;
  expectedImpact: string;
  risks: string[];
  complexity: 'low' | 'medium' | 'high';
  alternatives: string[];
}

/**
 * Proposed solution
 */
export interface ProposedSolution {
  hypothesis: Hypothesis;
  implementation?: {
    files: Array<{
      path: string;
      changes: string;
      reasoning: string;
    }>;
    tests: Array<{
      path: string;
      content: string;
    }>;
  };
  verification?: {
    typeCheck: boolean;
    composition: boolean;
    performance: boolean;
    security: boolean;
  };
  prDescription: string;
}

/**
 * Issue response result
 */
export interface IssueResponse {
  analysis: IssueAnalysis;
  solutions: ProposedSolution[];
  recommendedSolution: number; // Index in solutions array
  timestamp: number;
}

/**
 * Issue Responder - Autonomous issue analysis and solution generation
 */
export class IssueResponder {
  /**
   * Analyze a GitHub issue
   */
  analyzeIssue(issueNumber: number, title: string, body: string): IssueAnalysis {
    console.log(`\n[IssueResponder] 🔍 Analyzing issue #${issueNumber}`);

    // Determine issue type
    const type = this.detectIssueType(title, body);

    // Assess complexity
    const complexity = this.assessComplexity(title, body, type);

    // Check if code changes are needed
    const requiresCode = this.requiresCodeChanges(type, body);

    // Detect breaking changes
    const breakingChange = this.detectBreakingChange(title, body);

    // Calculate confidence
    const confidence = this.calculateConfidence(type, complexity, body);

    // Generate reasoning
    const reasoning = this.generateReasoning(type, complexity, requiresCode, breakingChange);

    console.log(`   Type: ${type}`);
    console.log(`   Complexity: ${complexity}`);
    console.log(`   Requires code: ${requiresCode}`);
    console.log(`   Breaking change: ${breakingChange}`);
    console.log(`   Confidence: ${(confidence * 100).toFixed(0)}%`);

    return {
      issueNumber,
      title,
      body,
      type,
      complexity,
      requiresCode,
      breakingChange,
      confidence,
      reasoning,
    };
  }

  /**
   * Generate hypotheses for solving the issue
   */
  generateHypotheses(analysis: IssueAnalysis): Hypothesis[] {
    console.log(`\n[IssueResponder] 💡 Generating hypotheses...`);

    const hypotheses: Hypothesis[] = [];

    if (analysis.type === 'bug') {
      hypotheses.push(this.generateBugFixHypothesis(analysis));
    } else if (analysis.type === 'feature') {
      hypotheses.push(this.generateFeatureHypothesis(analysis));
    } else if (analysis.type === 'enhancement') {
      hypotheses.push(this.generateEnhancementHypothesis(analysis));
    } else if (analysis.type === 'question') {
      hypotheses.push(this.generateDocumentationHypothesis(analysis));
    } else if (analysis.type === 'discussion') {
      hypotheses.push(this.generateDiscussionHypothesis(analysis));
    }

    console.log(`   Generated ${hypotheses.length} hypothesis(es)`);

    return hypotheses;
  }

  /**
   * Propose solutions based on hypotheses
   */
  proposeSolutions(analysis: IssueAnalysis, hypotheses: Hypothesis[]): ProposedSolution[] {
    console.log(`\n[IssueResponder] 🎯 Proposing solutions...`);

    const solutions: ProposedSolution[] = [];

    for (const hypothesis of hypotheses) {
      const solution: ProposedSolution = {
        hypothesis,
        prDescription: this.generatePRDescription(analysis, hypothesis),
      };

      // If code changes are needed, generate implementation
      if (analysis.requiresCode) {
        solution.implementation = this.generateImplementation(analysis, hypothesis);
      }

      solutions.push(solution);
    }

    console.log(`   Proposed ${solutions.length} solution(s)`);

    return solutions;
  }

  /**
   * Complete issue response workflow
   */
  respond(issueNumber: number, title: string, body: string): IssueResponse {
    console.log(`\n[IssueResponder] 🌌 Responding to issue #${issueNumber}: "${title}"`);

    // Step 1: Analyze issue
    const analysis = this.analyzeIssue(issueNumber, title, body);

    // Step 2: Generate hypotheses
    const hypotheses = this.generateHypotheses(analysis);

    // Step 3: Propose solutions
    const solutions = this.proposeSolutions(analysis, hypotheses);

    // Step 4: Select recommended solution (first one for now)
    const recommendedSolution = 0;

    console.log(`\n✅ Issue response complete`);
    console.log(`   Recommended: Solution ${recommendedSolution + 1}`);

    return {
      analysis,
      solutions,
      recommendedSolution,
      timestamp: Date.now(),
    };
  }

  /**
   * Verify a proposed morphism change
   */
  verifySolution(morphism: SelfModifyingMorphism): boolean {
    console.log(`\n[IssueResponder] 🔬 Verifying proposed solution...`);

    const result = verify(morphism);

    return result.overall;
  }

  // Private helper methods

  private detectIssueType(title: string, body: string): IssueAnalysis['type'] {
    const text = `${title} ${body}`.toLowerCase();

    if (text.includes('bug') || text.includes('error') || text.includes('broken') || text.includes('crash')) {
      return 'bug';
    }

    if (text.includes('feature request') || text.includes('add') || text.includes('new')) {
      return 'feature';
    }

    if (text.includes('improve') || text.includes('enhance') || text.includes('optimize')) {
      return 'enhancement';
    }

    if (text.includes('how') || text.includes('?') || text.includes('question')) {
      return 'question';
    }

    return 'discussion';
  }

  private assessComplexity(title: string, body: string, type: IssueAnalysis['type']): IssueAnalysis['complexity'] {
    const text = `${title} ${body}`;

    // Simple heuristics
    if (type === 'question') return 'low';
    if (text.length < 200) return 'low';
    if (text.length > 1000) return 'high';

    // Check for complexity indicators
    const complexityIndicators = [
      'architecture',
      'refactor',
      'breaking',
      'migration',
      'performance',
      'security',
    ];

    const hasComplexIndicators = complexityIndicators.some((indicator) =>
      text.toLowerCase().includes(indicator)
    );

    return hasComplexIndicators ? 'high' : 'medium';
  }

  private requiresCodeChanges(type: IssueAnalysis['type'], body: string): boolean {
    if (type === 'question') return false;
    if (type === 'discussion') return false;

    return true; // bug, feature, enhancement require code
  }

  private detectBreakingChange(title: string, body: string): boolean {
    const text = `${title} ${body}`.toLowerCase();

    return (
      text.includes('breaking') ||
      text.includes('migration') ||
      text.includes('remove') ||
      text.includes('deprecate')
    );
  }

  private calculateConfidence(
    type: IssueAnalysis['type'],
    complexity: IssueAnalysis['complexity'],
    body: string
  ): number {
    let confidence = 0.5; // Base confidence

    // Type confidence
    if (type === 'bug') confidence += 0.2;
    if (type === 'question') confidence += 0.3;

    // Complexity confidence
    if (complexity === 'low') confidence += 0.2;
    if (complexity === 'medium') confidence += 0.1;

    // Detail confidence
    if (body.length > 500) confidence += 0.1;

    return Math.min(confidence, 1.0);
  }

  private generateReasoning(
    type: IssueAnalysis['type'],
    complexity: IssueAnalysis['complexity'],
    requiresCode: boolean,
    breakingChange: boolean
  ): string {
    let reasoning = `This is a ${type} issue with ${complexity} complexity. `;

    if (requiresCode) {
      reasoning += 'Code changes are required. ';
    } else {
      reasoning += 'No code changes needed. ';
    }

    if (breakingChange) {
      reasoning += 'This is a breaking change and requires higher consensus (85%). ';
    }

    return reasoning;
  }

  private generateBugFixHypothesis(analysis: IssueAnalysis): Hypothesis {
    return {
      description: 'Fix the reported bug by addressing the root cause',
      approach: 'Identify the failing case, add validation/handling, update tests',
      expectedImpact: 'Bug resolved, edge case handled correctly',
      risks: ['Potential side effects on related functionality'],
      complexity: analysis.complexity,
      alternatives: ['Add deprecation warning', 'Document as known limitation'],
    };
  }

  private generateFeatureHypothesis(analysis: IssueAnalysis): Hypothesis {
    return {
      description: 'Implement the requested feature',
      approach: 'Design new morphism or extend existing, maintain composability',
      expectedImpact: 'New functionality available, API expanded',
      risks: ['API surface grows', 'Maintenance burden increases'],
      complexity: analysis.complexity,
      alternatives: ['Provide plugin/extension point', 'Document workaround'],
    };
  }

  private generateEnhancementHypothesis(analysis: IssueAnalysis): Hypothesis {
    return {
      description: 'Improve existing functionality',
      approach: 'Refactor for better performance/usability, maintain backward compatibility',
      expectedImpact: 'Improved performance/DX, no breaking changes',
      risks: ['Subtle behavior changes', 'Regression in edge cases'],
      complexity: analysis.complexity,
      alternatives: ['Add new variant', 'Create separate package'],
    };
  }

  private generateDocumentationHypothesis(analysis: IssueAnalysis): Hypothesis {
    return {
      description: 'Improve documentation to answer the question',
      approach: 'Add examples, clarify concepts, update README',
      expectedImpact: 'Better user understanding, reduced confusion',
      risks: ['Documentation drift if code changes'],
      complexity: 'low',
      alternatives: ['Create tutorial', 'Add FAQ section'],
    };
  }

  private generateDiscussionHypothesis(analysis: IssueAnalysis): Hypothesis {
    return {
      description: 'Facilitate discussion and gather consensus',
      approach: 'Summarize viewpoints, identify common ground, propose path forward',
      expectedImpact: 'Clarity on direction, community alignment',
      risks: ['No clear consensus reached'],
      complexity: analysis.complexity,
      alternatives: ['Split into multiple targeted issues', 'Create RFC'],
    };
  }

  private generateImplementation(
    analysis: IssueAnalysis,
    hypothesis: Hypothesis
  ): NonNullable<ProposedSolution['implementation']> {
    // This is a simplified implementation generator
    // In reality, this would use AI to generate actual code

    const files: Array<{ path: string; changes: string; reasoning: string }> = [];
    const tests: Array<{ path: string; content: string }> = [];

    if (analysis.type === 'bug') {
      files.push({
        path: 'packages/morphisms/src/[affected-file].ts',
        changes: '// Add validation check\n// Handle edge case\n// Update logic',
        reasoning: 'Fix the root cause of the bug',
      });

      tests.push({
        path: 'packages/morphisms/__tests__/[affected-file].test.ts',
        content: '// Test the previously failing case\n// Verify edge case handling',
      });
    } else if (analysis.type === 'feature') {
      files.push({
        path: 'packages/morphisms/src/[new-feature].ts',
        changes: '// Implement new morphism\n// Ensure composability\n// Export from index',
        reasoning: 'Add the requested functionality',
      });

      tests.push({
        path: 'packages/morphisms/__tests__/[new-feature].test.ts',
        content: '// Test new functionality\n// Verify composition laws\n// Check edge cases',
      });
    }

    return { files, tests };
  }

  private generatePRDescription(analysis: IssueAnalysis, hypothesis: Hypothesis): string {
    return `
# ${analysis.type === 'bug' ? 'Fix' : analysis.type === 'feature' ? 'Add' : 'Update'}: ${analysis.title}

**Generated by**: λ_LIBERTY Issue Responder
**Related**: #${analysis.issueNumber}
**Type**: ${analysis.type}
**Complexity**: ${hypothesis.complexity}
${analysis.breakingChange ? '**⚠️ BREAKING CHANGE**' : ''}

## Hypothesis

${hypothesis.description}

**Approach**: ${hypothesis.approach}

**Expected Impact**: ${hypothesis.expectedImpact}

**Risks**:
${hypothesis.risks.map((r) => `- ${r}`).join('\n')}

**Alternatives Considered**:
${hypothesis.alternatives.map((a) => `- ${a}`).join('\n')}

## Implementation

${analysis.requiresCode ? '(See changed files)' : 'No code changes required'}

## Verification

Ready for:
- [ ] Formal verification (verifier.ts)
- [ ] Multi-agent consensus (Phase 5.1)
- [ ] Autonomous merge (if approved)

## Consensus Threshold

${analysis.breakingChange ? '85% (breaking change)' : '75% (standard change)'}

---

🤖 Generated with [λ_LIBERTY](https://github.com/chaoshex/lambda-foundation/tree/master/packages/governance)
`;
  }
}

/**
 * Global responder instance
 */
export const issueResponder = new IssueResponder();

/**
 * Convenience function
 */
export function respondToIssue(issueNumber: number, title: string, body: string): IssueResponse {
  return issueResponder.respond(issueNumber, title, body);
}
