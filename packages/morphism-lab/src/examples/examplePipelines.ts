/**
 * Pre-built example pipelines
 * These help users understand the system quickly
 */

import type { PipelineNode } from '../types/morphisms';

export interface ExamplePipeline {
  id: string;
  name: string;
  description: string;
  icon: string;
  nodes: PipelineNode[];
}

export const EXAMPLE_PIPELINES: ExamplePipeline[] = [
  {
    id: 'joy-filter',
    name: 'Joy Filter',
    description: 'Keep only joyful events',
    icon: '😊',
    nodes: [
      {
        morphismId: 'subscribe',
        position: { x: 100, y: 150 },
        connections: ['1']
      },
      {
        morphismId: 'filterByEmotion',
        position: { x: 300, y: 150 },
        connections: []
      }
    ]
  },
  {
    id: 'text-analysis',
    name: 'Text Analysis',
    description: 'Extract keywords and analyze sentiment',
    icon: '🔍',
    nodes: [
      {
        morphismId: 'subscribe',
        position: { x: 80, y: 100 },
        connections: ['1']
      },
      {
        morphismId: 'extractKeywords',
        position: { x: 280, y: 100 },
        connections: ['2']
      },
      {
        morphismId: 'analyzeSentimentDelta',
        position: { x: 480, y: 100 },
        connections: []
      }
    ]
  },
  {
    id: 'high-value-filter',
    name: 'High Value Filter',
    description: 'Keep events with value > 5',
    icon: '📊',
    nodes: [
      {
        morphismId: 'subscribe',
        position: { x: 100, y: 150 },
        connections: ['1']
      },
      {
        morphismId: 'filter',
        position: { x: 300, y: 150 },
        connections: []
      }
    ]
  },
  {
    id: 'data-transformation',
    name: 'Data Pipeline',
    description: 'Complete data transformation flow',
    icon: '⚡',
    nodes: [
      {
        morphismId: 'subscribe',
        position: { x: 60, y: 150 },
        connections: ['1']
      },
      {
        morphismId: 'map',
        position: { x: 220, y: 150 },
        connections: ['2']
      },
      {
        morphismId: 'filter',
        position: { x: 380, y: 150 },
        connections: ['3']
      },
      {
        morphismId: 'groupByTime',
        position: { x: 540, y: 150 },
        connections: []
      }
    ]
  }
];
