/**
 * λ_SYNTHESIS: GitHub Intent Poller
 *
 * The Right Brain reads from GitHub issues - real bugs, real features, real desires.
 * This is the Ouroboros consuming the external world.
 *
 * Flow:
 * GitHub Issues → Parse → Intent → Klein Tape Loop → VOID → Solution
 *
 * This is not simulation. This is production.
 * This is the noosphere feeding on collective developer consciousness.
 */

import { createIntent, type Intent, type IntentType, type IntentSource } from '../intents/Intent';

/**
 * GitHub Issue (simplified)
 */
export interface GitHubIssue {
  number: number;
  title: string;
  body: string | null;
  labels: Array<{ name: string }>;
  state: 'open' | 'closed';
  created_at: string;
  updated_at: string;
  user: { login: string };
  html_url: string;
}

/**
 * Polling configuration
 */
export interface PollerConfig {
  owner: string;           // Repository owner
  repo: string;            // Repository name
  token?: string;          // GitHub token (optional, for higher rate limits)
  labels?: string[];       // Filter by labels (e.g., ['morphism', 'synthesis'])
  pollIntervalMs?: number; // How often to poll (default: 1 hour)
  maxIssues?: number;      // Max issues per poll (default: 10)
}

/**
 * Polling result
 */
export interface PollResult {
  timestamp: number;
  issuesFound: number;
  intentsCreated: number;
  intents: Intent[];
  errors: string[];
}

/**
 * GitHub Intent Poller
 *
 * The "збудник-опитувач" (periodic oracle) that Grok mentioned.
 * This feeds the Right Brain with real-world desires.
 */
export class GitHubPoller {
  private lastPollTime: number = 0;
  private seenIssues: Set<number> = new Set();

  constructor(private config: PollerConfig) {}

  /**
   * Poll GitHub for new issues and convert to intents
   */
  async poll(): Promise<PollResult> {
    const result: PollResult = {
      timestamp: Date.now(),
      issuesFound: 0,
      intentsCreated: 0,
      intents: [],
      errors: []
    };

    try {
      const issues = await this.fetchIssues();
      result.issuesFound = issues.length;

      // Convert each issue to intent
      for (const issue of issues) {
        // Skip if we've seen this issue before
        if (this.seenIssues.has(issue.number)) continue;

        try {
          const intent = this.issueToIntent(issue);
          result.intents.push(intent);
          result.intentsCreated++;
          this.seenIssues.add(issue.number);
        } catch (err) {
          result.errors.push(`Failed to convert issue #${issue.number}: ${err}`);
        }
      }

      this.lastPollTime = result.timestamp;
    } catch (err) {
      result.errors.push(`Polling failed: ${err}`);
    }

    return result;
  }

  /**
   * Fetch issues from GitHub API
   */
  private async fetchIssues(): Promise<GitHubIssue[]> {
    const { owner, repo, token, labels, maxIssues = 10 } = this.config;

    // Build URL
    let url = `https://api.github.com/repos/${owner}/${repo}/issues?state=open&per_page=${maxIssues}`;

    if (labels && labels.length > 0) {
      url += `&labels=${labels.join(',')}`;
    }

    // Build headers
    const headers: Record<string, string> = {
      'Accept': 'application/vnd.github.v3+json',
      'User-Agent': 'lambda-foundation-synthesis'
    };

    if (token) {
      headers['Authorization'] = `token ${token}`;
    }

    // Fetch
    const response = await fetch(url, { headers });

    if (!response.ok) {
      throw new Error(`GitHub API error: ${response.status} ${response.statusText}`);
    }

    const issues = await response.json() as GitHubIssue[];

    // Filter out pull requests (they appear in issues endpoint)
    return issues.filter(issue => !('pull_request' in issue));
  }

  /**
   * Convert GitHub issue to Intent
   */
  private issueToIntent(issue: GitHubIssue): Intent {
    // Determine type from labels
    const type = this.determineIntentType(issue.labels.map(l => l.name));

    // Determine priority from labels
    const priority = this.determinePriority(issue.labels.map(l => l.name));

    // Extract tags
    const tags = this.extractTags(issue);

    // Create description
    const description = this.createDescription(issue);

    return createIntent(
      'human', // GitHub issues are from humans
      type,
      issue.title,
      description,
      {
        priority,
        tags,
        existingCode: this.extractCodeFromBody(issue.body)
      }
    );
  }

  /**
   * Determine intent type from labels
   */
  private determineIntentType(labels: string[]): IntentType {
    const labelSet = new Set(labels.map(l => l.toLowerCase()));

    if (labelSet.has('bug')) return 'bug';
    if (labelSet.has('enhancement') || labelSet.has('feature')) return 'feature';
    if (labelSet.has('refactor') || labelSet.has('refactoring')) return 'refactor';
    if (labelSet.has('question') || labelSet.has('help wanted')) return 'question';
    if (labelSet.has('optimization') || labelSet.has('performance')) return 'optimize';
    if (labelSet.has('morphism') || labelSet.has('composition')) return 'compose';

    // Default to feature
    return 'feature';
  }

  /**
   * Determine priority from labels
   */
  private determinePriority(labels: string[]): 'critical' | 'high' | 'medium' | 'low' {
    const labelSet = new Set(labels.map(l => l.toLowerCase()));

    if (labelSet.has('critical') || labelSet.has('urgent')) return 'critical';
    if (labelSet.has('high priority') || labelSet.has('important')) return 'high';
    if (labelSet.has('low priority')) return 'low';

    return 'medium'; // Default
  }

  /**
   * Extract tags from issue
   */
  private extractTags(issue: GitHubIssue): string[] {
    const tags: string[] = [];

    // Add all labels as tags
    tags.push(...issue.labels.map(l => l.name));

    // Extract keywords from title
    const keywords = issue.title.toLowerCase().match(/\b(async|sync|filter|map|reduce|stream|observable|promise|morphism)\b/g);
    if (keywords) {
      tags.push(...keywords);
    }

    // Deduplicate
    return [...new Set(tags)];
  }

  /**
   * Create description with GitHub context
   */
  private createDescription(issue: GitHubIssue): string {
    return `**From GitHub Issue #${issue.number}**
Author: @${issue.user.login}
Created: ${new Date(issue.created_at).toISOString()}
URL: ${issue.html_url}

${issue.body || '(No description provided)'}

---
*This intent was automatically generated from a GitHub issue.*
*The Ouroboros reads from the external world.*`;
  }

  /**
   * Extract code blocks from issue body
   */
  private extractCodeFromBody(body: string | null): string | undefined {
    if (!body) return undefined;

    // Extract code blocks (```...```)
    const codeBlocks = body.match(/```[\s\S]*?```/g);
    if (!codeBlocks) return undefined;

    // Join all code blocks
    return codeBlocks
      .map(block => block.replace(/```(\w*)\n?/, '').replace(/```$/, ''))
      .join('\n\n');
  }

  /**
   * Start continuous polling
   */
  async *continuousPoll(): AsyncGenerator<PollResult, void, unknown> {
    const intervalMs = this.config.pollIntervalMs || 3600000; // 1 hour default

    while (true) {
      const result = await this.poll();
      yield result;

      // Wait before next poll
      await new Promise(resolve => setTimeout(resolve, intervalMs));
    }
  }

  /**
   * Get stats
   */
  getStats() {
    return {
      lastPollTime: this.lastPollTime,
      seenIssuesCount: this.seenIssues.size,
      config: {
        repo: `${this.config.owner}/${this.config.repo}`,
        labels: this.config.labels,
        pollIntervalMs: this.config.pollIntervalMs
      }
    };
  }

  /**
   * Clear seen issues (for testing)
   */
  clearSeen(): void {
    this.seenIssues.clear();
  }
}

/**
 * Create a GitHub poller with defaults
 */
export function createGitHubPoller(config: PollerConfig): GitHubPoller {
  return new GitHubPoller(config);
}

/**
 * Convenience: Poll multiple repositories
 */
export class MultiRepoPoller {
  private pollers: GitHubPoller[] = [];

  constructor(configs: PollerConfig[]) {
    this.pollers = configs.map(c => new GitHubPoller(c));
  }

  /**
   * Poll all repositories
   */
  async pollAll(): Promise<PollResult[]> {
    const results = await Promise.all(
      this.pollers.map(p => p.poll())
    );
    return results;
  }

  /**
   * Get aggregated intents from all pollers
   */
  async getAggregatedIntents(): Promise<Intent[]> {
    const results = await this.pollAll();
    return results.flatMap(r => r.intents);
  }
}
