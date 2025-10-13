import { useState, useRef, useEffect } from 'react';
import type { Morphism, PipelineNode } from '../types/morphisms';
import './Canvas.css';

interface CanvasProps {
  onPipelineChange: (nodes: PipelineNode[]) => void;
}

export function Canvas({ onPipelineChange }: CanvasProps) {
  const [nodes, setNodes] = useState<PipelineNode[]>([]);
  const [connections, setConnections] = useState<Array<{ from: string; to: string }>>([]);
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [connectingFrom, setConnectingFrom] = useState<string | null>(null);

  const canvasRef = useRef<HTMLDivElement>(null);

  // Handle drop on canvas
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();

    if (!canvasRef.current) return;

    // Get morphism from dataTransfer
    const morphismData = e.dataTransfer.getData('morphism');
    if (!morphismData) return;

    const morphism = JSON.parse(morphismData);

    const rect = canvasRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const newNode: PipelineNode = {
      morphismId: morphism.id,
      position: { x, y },
      connections: []
    };

    const updatedNodes = [...nodes, newNode];
    setNodes(updatedNodes);
    onPipelineChange(updatedNodes);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  // Remove node
  const removeNode = (nodeId: string) => {
    const updatedNodes = nodes.filter((_, i) => i !== parseInt(nodeId));
    const updatedConnections = connections.filter(
      c => c.from !== nodeId && c.to !== nodeId
    );

    setNodes(updatedNodes);
    setConnections(updatedConnections);
    onPipelineChange(updatedNodes);
  };

  // Start connection
  const startConnection = (nodeId: string) => {
    setConnectingFrom(nodeId);
  };

  // Complete connection
  const completeConnection = (toNodeId: string) => {
    if (connectingFrom && connectingFrom !== toNodeId) {
      const newConnection = {
        from: connectingFrom,
        to: toNodeId
      };

      setConnections([...connections, newConnection]);

      // Update nodes with connection info
      const updatedNodes = nodes.map((node, idx) => {
        if (idx.toString() === connectingFrom) {
          return {
            ...node,
            connections: [...node.connections, toNodeId]
          };
        }
        return node;
      });

      setNodes(updatedNodes);
      onPipelineChange(updatedNodes);
    }

    setConnectingFrom(null);
  };

  // Cancel connection
  const cancelConnection = () => {
    setConnectingFrom(null);
  };

  // Draw connections
  useEffect(() => {
    const canvas = document.getElementById('connection-canvas') as HTMLCanvasElement;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas size
    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw connections
    ctx.strokeStyle = '#667eea';
    ctx.lineWidth = 2;

    connections.forEach(conn => {
      const fromNode = nodes[parseInt(conn.from)];
      const toNode = nodes[parseInt(conn.to)];

      if (!fromNode || !toNode) return;

      const fromX = fromNode.position.x + 60; // center of node
      const fromY = fromNode.position.y + 40;
      const toX = toNode.position.x + 60;
      const toY = toNode.position.y + 40;

      // Draw curved line
      ctx.beginPath();
      ctx.moveTo(fromX, fromY);

      const midX = (fromX + toX) / 2;
      ctx.bezierCurveTo(
        fromX + 50, fromY,
        toX - 50, toY,
        toX, toY
      );

      ctx.stroke();

      // Draw arrow
      const angle = Math.atan2(toY - fromY, toX - fromX);
      ctx.beginPath();
      ctx.moveTo(toX, toY);
      ctx.lineTo(
        toX - 10 * Math.cos(angle - Math.PI / 6),
        toY - 10 * Math.sin(angle - Math.PI / 6)
      );
      ctx.moveTo(toX, toY);
      ctx.lineTo(
        toX - 10 * Math.cos(angle + Math.PI / 6),
        toY - 10 * Math.sin(angle + Math.PI / 6)
      );
      ctx.stroke();
    });
  }, [nodes, connections]);

  return (
    <div className="canvas-container">
      <div
        ref={canvasRef}
        className="canvas-drop-zone"
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onClick={cancelConnection}
      >
        {/* Connection canvas (behind nodes) */}
        <canvas id="connection-canvas" className="connection-canvas" />

        {/* Nodes */}
        {nodes.length === 0 ? (
          <div className="canvas-empty-state">
            <div className="empty-icon">🎨</div>
            <h3>Start Composing</h3>
            <p>Drag morphisms from the left panel to build your pipeline</p>
          </div>
        ) : (
          nodes.map((node, idx) => (
            <CanvasNode
              key={idx}
              nodeId={idx.toString()}
              node={node}
              isSelected={selectedNodeId === idx.toString()}
              isConnecting={connectingFrom === idx.toString()}
              onSelect={() => setSelectedNodeId(idx.toString())}
              onRemove={() => removeNode(idx.toString())}
              onStartConnection={() => startConnection(idx.toString())}
              onCompleteConnection={() => completeConnection(idx.toString())}
            />
          ))
        )}

        {/* Connecting hint */}
        {connectingFrom && (
          <div className="connecting-hint">
            Click target node to connect, or click canvas to cancel
          </div>
        )}
      </div>
    </div>
  );
}

interface CanvasNodeProps {
  nodeId: string;
  node: PipelineNode;
  isSelected: boolean;
  isConnecting: boolean;
  onSelect: () => void;
  onRemove: () => void;
  onStartConnection: () => void;
  onCompleteConnection: () => void;
}

function CanvasNode({
  nodeId,
  node,
  isSelected,
  isConnecting,
  onSelect,
  onRemove,
  onStartConnection,
  onCompleteConnection
}: CanvasNodeProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });

  // Get morphism data
  const morphismData = getMorphismById(node.morphismId);
  if (!morphismData) return null;

  const handleMouseDown = (e: React.MouseEvent) => {
    if ((e.target as HTMLElement).classList.contains('node-action-btn')) return;

    setIsDragging(true);
    setDragOffset({
      x: e.clientX - node.position.x,
      y: e.clientY - node.position.y
    });
    onSelect();
  };

  const handleMouseMove = (e: MouseEvent) => {
    if (!isDragging) return;

    // Update node position would go here
    // For now, nodes stay in place once dropped
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  useEffect(() => {
    if (isDragging) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);

      return () => {
        window.removeEventListener('mousemove', handleMouseMove);
        window.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [isDragging]);

  const handleNodeClick = (e: React.MouseEvent) => {
    e.stopPropagation();

    if (isConnecting) {
      onCompleteConnection();
    } else {
      onSelect();
    }
  };

  return (
    <div
      className={`canvas-node ${isSelected ? 'selected' : ''} ${isConnecting ? 'connecting' : ''}`}
      style={{
        left: node.position.x,
        top: node.position.y
      }}
      onClick={handleNodeClick}
      onMouseDown={handleMouseDown}
    >
      <div className="node-header">
        <span className="node-symbol">{morphismData.symbol}</span>
        <span className="node-name">{morphismData.name}</span>
      </div>

      <div className="node-type">
        {morphismData.input} → {morphismData.output}
      </div>

      {isSelected && (
        <div className="node-actions">
          <button
            className="node-action-btn"
            onClick={(e) => {
              e.stopPropagation();
              onStartConnection();
            }}
            title="Connect to another node"
          >
            🔗
          </button>
          <button
            className="node-action-btn delete"
            onClick={(e) => {
              e.stopPropagation();
              onRemove();
            }}
            title="Remove node"
          >
            🗑️
          </button>
        </div>
      )}
    </div>
  );
}

// Helper to get morphism by ID
function getMorphismById(id: string) {
  const morphisms = {
    subscribe: { id: 'subscribe', name: 'subscribe', symbol: '🔔', input: 'DataSource<T>', output: 'Observable<T>' },
    map: { id: 'map', name: 'map', symbol: '🗺️', input: 'Observable<A>', output: 'Observable<B>' },
    filter: { id: 'filter', name: 'filter', symbol: '🔍', input: 'Observable<T>', output: 'Observable<T>' },
    merge: { id: 'merge', name: 'merge', symbol: '⚡', input: 'Observable<T>[]', output: 'Observable<T>' },
    groupByTime: { id: 'groupByTime', name: 'groupByTime', symbol: '📊', input: 'Observable<T>', output: 'Observable<T[]>' },
    analyzeSentimentDelta: { id: 'analyzeSentimentDelta', name: 'analyzeSentimentDelta', symbol: '💭', input: 'Observable<Event[]>', output: 'Observable<SentimentDelta>' },
    extractKeywords: { id: 'extractKeywords', name: 'extractKeywords', symbol: '🔑', input: 'Observable<string>', output: 'Observable<string[]>' },
    filterByEmotion: { id: 'filterByEmotion', name: 'filterByEmotion', symbol: '😊', input: 'Observable<Event>', output: 'Observable<Event>' }
  };

  return morphisms[id as keyof typeof morphisms];
}
