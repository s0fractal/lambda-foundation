/**
 * λ_SYNTHESIS: Intent Format
 *
 * The language through which the world speaks to us.
 * This is the Right Hemisphere - desires, creativity, exploration.
 */

/**
 * Source of the intent - who is asking?
 */
export type IntentSource =
  | 'ai-claude'      // Claude (me!)
  | 'ai-copilot'     // GitHub Copilot
  | 'ai-gemini'      // Google Gemini
  | 'ai-grok'        // Grok
  | 'ai-void'        // λVOID
  | 'human'          // Human developers
  | 'code'           // Extracted from existing code
  | 'community'      // GitHub issues, forums, etc.
  | 'system';        // Automated system detection

/**
 * Type of intent - what is being asked?
 */
export type IntentType =
  | 'bug'            // Something is broken
  | 'feature'        // New capability needed
  | 'refactor'       // Improve existing code
  | 'question'       // How to do X?
  | 'optimize'       // Performance improvement
  | 'convert'        // lodash/react → morphism
  | 'compose'        // Combine existing morphisms
  | 'evolve';        // Create completely new morphism

/**
 * Priority level
 */
export type IntentPriority = 'critical' | 'high' | 'medium' | 'low';

/**
 * Example input/output for intent
 */
export interface IntentExample {
  input: any;
  output: any;
  description?: string;
}

/**
 * The core Intent structure
 * This is how desires are expressed
 */
export interface Intent {
  // Metadata
  id: string;
  timestamp: number;
  source: IntentSource;
  type: IntentType;
  priority: IntentPriority;

  // Core content
  title: string;
  description: string;

  // Context
  examples?: IntentExample[];
  existingCode?: string;
  relatedIntents?: string[];
  tags?: string[];

  // Constraints
  inputType?: string;
  outputType?: string;
  maxComplexity?: string; // e.g., "O(n log n)"

  // Status tracking
  status: 'open' | 'processing' | 'resolved' | 'rejected';
  attempts?: number;
  confidence?: number;

  // Resolution (if resolved)
  resolution?: {
    morphismIds: string[];
    explanation: string;
    code?: string;
    timestamp: number;
  };
}

/**
 * Intent queue for processing
 */
export interface IntentQueue {
  intents: Intent[];
  processing: Intent[];
  resolved: Intent[];
  rejected: Intent[];
}

/**
 * Create a new intent
 */
export function createIntent(
  source: IntentSource,
  type: IntentType,
  title: string,
  description: string,
  options?: Partial<Intent>
): Intent {
  return {
    id: `intent-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    timestamp: Date.now(),
    source,
    type,
    priority: options?.priority || 'medium',
    title,
    description,
    status: 'open',
    attempts: 0,
    ...options
  };
}

/**
 * Example intents for testing
 */
export const EXAMPLE_INTENTS: Intent[] = [
  createIntent(
    'human',
    'feature',
    'Need async stream processing',
    'I want to process data from Kafka streams with backpressure support',
    {
      priority: 'high',
      examples: [{
        input: 'KafkaStream<Event>',
        output: 'Observable<ProcessedEvent>',
        description: 'Convert Kafka to Observable with error handling'
      }],
      tags: ['async', 'streams', 'kafka'],
      inputType: 'KafkaStream<T>',
      outputType: 'Observable<T>'
    }
  ),

  createIntent(
    'ai-copilot',
    'convert',
    'Convert lodash chain to morphisms',
    'I have lodash code that can be made pure and proven',
    {
      priority: 'medium',
      existingCode: `_.chain(data)
  .filter(x => x.value > 5)
  .map(x => x.name)
  .uniq()
  .value()`,
      tags: ['lodash', 'refactor', 'purity'],
      type: 'convert'
    }
  ),

  createIntent(
    'human',
    'bug',
    'filterByEmotion misses neutral events',
    'When filtering by joy, neutral events are incorrectly included',
    {
      priority: 'critical',
      examples: [{
        input: [
          { text: 'Happy!', emotion: 'joy' },
          { text: 'Okay', emotion: 'neutral' }
        ],
        output: [
          { text: 'Happy!', emotion: 'joy' }
        ]
      }],
      tags: ['filterByEmotion', 'bug', 'neutral']
    }
  ),

  createIntent(
    'ai-gemini',
    'compose',
    'Real-time sentiment dashboard',
    'Compose existing morphisms to build live sentiment analysis',
    {
      priority: 'medium',
      description: 'subscribe → groupByTime → analyzeSentimentDelta → visualize',
      tags: ['composition', 'sentiment', 'dashboard']
    }
  )
];
