/**
 * Simple pipeline runner for demo purposes
 * Simulates morphism execution with sample data
 */

import type { PipelineNode } from '../types/morphisms';
import { sampleEvents, type Event } from './sampleData';

export interface ExecutionResult {
  input: any[];
  output: any[];
  steps: Array<{
    morphism: string;
    input: any[];
    output: any[];
    duration: number;
  }>;
  totalDuration: number;
}

/**
 * Execute a pipeline with sample data
 */
export async function executePipeline(nodes: PipelineNode[]): Promise<ExecutionResult> {
  const startTime = performance.now();
  const steps: ExecutionResult['steps'] = [];

  // Start with sample data
  let data: any[] = [...sampleEvents];
  const input = [...data];

  // Find execution order (topological sort)
  const executionOrder = getExecutionOrder(nodes);

  // Execute each morphism in order
  for (const nodeIdx of executionOrder) {
    const node = nodes[nodeIdx];
    const stepStart = performance.now();

    // Apply morphism transformation
    const output = await applyMorphism(node.morphismId, data);

    steps.push({
      morphism: node.morphismId,
      input: [...data],
      output: [...output],
      duration: performance.now() - stepStart
    });

    data = output;
  }

  return {
    input,
    output: data,
    steps,
    totalDuration: performance.now() - startTime
  };
}

/**
 * Get execution order from pipeline nodes
 */
function getExecutionOrder(nodes: PipelineNode[]): number[] {
  // Simple approach: find nodes with no incoming connections first
  const hasIncoming = new Set(
    nodes.flatMap((_, idx) => {
      const node = nodes[idx];
      return node.connections.map(c => parseInt(c));
    })
  );

  const order: number[] = [];
  const visited = new Set<number>();

  // Start with nodes that have no incoming connections
  const startNodes = nodes
    .map((_, idx) => idx)
    .filter(idx => !hasIncoming.has(idx));

  // Simple DFS to build order
  function visit(idx: number) {
    if (visited.has(idx)) return;
    visited.add(idx);
    order.push(idx);

    const node = nodes[idx];
    node.connections.forEach(connStr => {
      const connIdx = parseInt(connStr);
      if (!visited.has(connIdx)) {
        visit(connIdx);
      }
    });
  }

  startNodes.forEach(visit);

  // If no clear order, just use array order
  if (order.length === 0) {
    return nodes.map((_, idx) => idx);
  }

  return order;
}

/**
 * Apply a morphism transformation to data
 */
async function applyMorphism(morphismId: string, data: any[]): Promise<any[]> {
  // Simulate async execution
  await new Promise(resolve => setTimeout(resolve, 50 + Math.random() * 100));

  switch (morphismId) {
    case 'subscribe':
      // Just return data as-is (already subscribed)
      return data;

    case 'map':
      // Transform each item
      return data.map((item: Event) => ({
        ...item,
        text: item.text.toUpperCase()
      }));

    case 'filter':
      // Keep only some items
      return data.filter((item: Event) => item.value && item.value > 5);

    case 'filterByEmotion':
      // Keep only joyful events
      return data.filter((item: Event) => item.emotion === 'joy');

    case 'merge':
      // Merge with additional data (simplified)
      return [...data, ...data.slice(0, 2)];

    case 'groupByTime':
      // Group into chunks
      const grouped = [];
      for (let i = 0; i < data.length; i += 3) {
        grouped.push(data.slice(i, i + 3));
      }
      return grouped;

    case 'analyzeSentimentDelta':
      // Analyze sentiment changes
      return data.map((item: Event, idx) => ({
        ...item,
        sentimentScore: item.emotion === 'joy' ? 1 : item.emotion === 'sadness' ? -1 : 0,
        delta: idx > 0 ? (item.value || 0) - (data[idx - 1].value || 0) : 0
      }));

    case 'extractKeywords':
      // Extract keywords from text
      return data.map((item: Event) => ({
        ...item,
        keywords: item.text.toLowerCase().match(/\b\w{4,}\b/g) || []
      }));

    default:
      return data;
  }
}
