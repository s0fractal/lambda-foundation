import { useState } from 'react';
import { DEFAULT_MORPHISMS, type Morphism, type ComposedPipeline, type PipelineNode } from './types/morphisms';
import { Canvas } from './components/Canvas';
import { CodeGenerator } from './components/CodeGenerator';
import { ExamplesModal } from './components/ExamplesModal';
import { executePipeline, type ExecutionResult } from './demo/pipelineRunner';
import type { ExamplePipeline } from './examples/examplePipelines';
import './App.css';

function App() {
  const [availableMorphisms] = useState<Morphism[]>(DEFAULT_MORPHISMS);
  const [pipelineNodes, setPipelineNodes] = useState<PipelineNode[]>([]);
  const [selectedMorphism, setSelectedMorphism] = useState<Morphism | null>(null);
  const [draggedMorphism, setDraggedMorphism] = useState<Morphism | null>(null);
  const [showCodeGenerator, setShowCodeGenerator] = useState(false);
  const [showExamples, setShowExamples] = useState(false);
  const [executionResult, setExecutionResult] = useState<ExecutionResult | null>(null);
  const [isExecuting, setIsExecuting] = useState(false);

  const handlePipelineChange = (nodes: PipelineNode[]) => {
    setPipelineNodes(nodes);
  };

  const handleDragStart = (morphism: Morphism) => (e: React.DragEvent) => {
    setDraggedMorphism(morphism);
    e.dataTransfer.effectAllowed = 'copy';
    e.dataTransfer.setData('application/json', JSON.stringify(morphism));
  };

  const handleDragEnd = () => {
    setDraggedMorphism(null);
  };

  const handleRunPipeline = async () => {
    if (pipelineNodes.length === 0) return;

    setIsExecuting(true);
    setExecutionResult(null);

    try {
      const result = await executePipeline(pipelineNodes);
      setExecutionResult(result);
    } catch (error) {
      console.error('Pipeline execution failed:', error);
    } finally {
      setIsExecuting(false);
    }
  };

  const handleLoadExample = (example: ExamplePipeline) => {
    setPipelineNodes(example.nodes);
    setExecutionResult(null); // Reset execution when loading new pipeline
  };

  return (
    <div className="app">
      {/* Header */}
      <header className="app-header">
        <h1>🔬 Morphism Laboratory</h1>
        <p className="subtitle">Where morphisms become tangible. Where proofs become playful.</p>
        <div className="header-actions">
          <button className="btn-secondary" onClick={() => setShowExamples(true)}>📖 Examples</button>
          <button className="btn-secondary">❓ Help</button>
          <button className="btn-primary">💾 Save</button>
        </div>
      </header>

      {/* Main Content */}
      <div className="app-content">
        {/* Left Panel: Morphism Palette */}
        <aside className="morphism-palette">
          <div className="palette-header">
            <h2>📦 Available Morphisms</h2>
            <span className="morphism-count">{availableMorphisms.length} proven</span>
          </div>

          <div className="morphism-list">
            {availableMorphisms.map(morphism => (
              <div
                key={morphism.id}
                className={`morphism-card ${selectedMorphism?.id === morphism.id ? 'selected' : ''} ${draggedMorphism?.id === morphism.id ? 'dragging' : ''}`}
                draggable
                onDragStart={handleDragStart(morphism)}
                onDragEnd={handleDragEnd}
                onClick={() => setSelectedMorphism(morphism)}
              >
                <div className="morphism-card-header">
                  <span className="morphism-symbol">{morphism.symbol}</span>
                  <span className="morphism-name">{morphism.name}</span>
                  {morphism.proven && <span className="proof-badge">✓</span>}
                </div>
                <p className="morphism-description">{morphism.description}</p>
                <div className="morphism-meta">
                  <span className="type-signature">{morphism.input} → {morphism.output}</span>
                  <span className="usage-count">Used {morphism.usageCount}×</span>
                </div>
                <div className="morphism-actions">
                  <button className="btn-xs">📜 Proof</button>
                  <button className="btn-xs">ℹ️ Info</button>
                </div>
              </div>
            ))}
          </div>

          <button className="btn-evolve">
            🌱 Evolve New Morphism
          </button>
        </aside>

        {/* Center Panel: Composition Canvas */}
        <main className="composition-canvas">
          <div className="canvas-header">
            <h2>Your Pipeline</h2>
            {pipelineNodes.length > 0 && (
              <div className="pipeline-stats">
                <span className="fitness">
                  Nodes: {pipelineNodes.length}
                </span>
                <span className="badge-typed">🔗 Interactive</span>
              </div>
            )}
          </div>

          <div className="canvas-area">
            <Canvas onPipelineChange={handlePipelineChange} />
          </div>

          <div className="canvas-actions">
            <button
              className="btn-secondary"
              onClick={() => setPipelineNodes([])}
              disabled={pipelineNodes.length === 0}
            >
              🗑️ Clear
            </button>
            <button className="btn-secondary" disabled={pipelineNodes.length === 0}>
              ✓ Validate
            </button>
            <button
              className="btn-primary"
              disabled={pipelineNodes.length === 0}
              onClick={() => setShowCodeGenerator(true)}
            >
              💻 Generate Code
            </button>
          </div>
        </main>

        {/* Right Panel: Live Preview */}
        <aside className="live-preview">
          <div className="preview-header">
            <h2>📊 Live Execution</h2>
          </div>

          <div className="preview-content">
            {pipelineNodes.length === 0 ? (
              <div className="preview-empty">
                <p>No pipeline to preview</p>
                <p className="preview-hint">Create a pipeline to see real-time execution</p>
              </div>
            ) : (
              <div className="preview-active">
                {!executionResult ? (
                  <div className="preview-ready">
                    <p style={{ color: '#888', marginBottom: '15px' }}>
                      Pipeline ready with {pipelineNodes.length} morphism{pipelineNodes.length > 1 ? 's' : ''}
                    </p>
                    <button
                      className="btn-primary full-width"
                      onClick={handleRunPipeline}
                      disabled={isExecuting}
                    >
                      {isExecuting ? '⏳ Running...' : '▶️ Run Pipeline'}
                    </button>
                  </div>
                ) : (
                  <>
                    <div className="preview-section">
                      <h3>Input ({executionResult.input.length} events)</h3>
                      <div className="code-block" style={{ maxHeight: '120px', overflow: 'auto' }}>
                        <code>{JSON.stringify(executionResult.input.slice(0, 3), null, 2)}...</code>
                      </div>
                    </div>

                    <div className="preview-arrow">↓ {executionResult.steps.length} steps</div>

                    <div className="preview-section">
                      <h3>Output ({executionResult.output.length} events)</h3>
                      <div className="code-block" style={{ maxHeight: '120px', overflow: 'auto' }}>
                        <code>{JSON.stringify(executionResult.output.slice(0, 3), null, 2)}...</code>
                      </div>
                    </div>

                    <div className="preview-metrics">
                      <div className="metric">
                        <span className="metric-label">⏱️ Duration</span>
                        <span className="metric-value">{executionResult.totalDuration.toFixed(1)}ms</span>
                      </div>
                      <div className="metric">
                        <span className="metric-label">🔄 Steps</span>
                        <span className="metric-value">{executionResult.steps.length}</span>
                      </div>
                      <div className="metric">
                        <span className="metric-label">✅ Status</span>
                        <span className="metric-value">Success</span>
                      </div>
                    </div>

                    <button
                      className="btn-secondary full-width"
                      onClick={handleRunPipeline}
                      disabled={isExecuting}
                    >
                      {isExecuting ? '⏳ Running...' : '🔄 Run Again'}
                    </button>
                  </>
                )}
              </div>
            )}
          </div>
        </aside>
      </div>

      {/* Morphism Detail Modal (when selectedMorphism is set) */}
      {selectedMorphism && (
        <div className="modal-overlay" onClick={() => setSelectedMorphism(null)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2>
                <span className="morphism-symbol-large">{selectedMorphism.symbol}</span>
                {selectedMorphism.name}
              </h2>
              <button className="modal-close" onClick={() => setSelectedMorphism(null)}>
                ✕
              </button>
            </div>

            <div className="modal-body">
              <p className="morphism-description-full">{selectedMorphism.description}</p>

              <div className="morphism-details">
                <h3>Type Signature</h3>
                <div className="code-block">
                  <code>{selectedMorphism.input} → {selectedMorphism.output}</code>
                </div>

                <h3>Properties</h3>
                <ul className="properties-list">
                  <li>✓ Proven correct</li>
                  {selectedMorphism.composable && <li>✓ Composable</li>}
                  {selectedMorphism.associative && <li>✓ Associative</li>}
                  {selectedMorphism.hasIdentity && <li>✓ Has identity</li>}
                </ul>

                <h3>Performance</h3>
                <div className="performance-grid">
                  <div>
                    <strong>Time Complexity:</strong> {selectedMorphism.complexity}
                  </div>
                  <div>
                    <strong>Space Complexity:</strong> {selectedMorphism.memory}
                  </div>
                </div>

                <h3>Proof</h3>
                <p>
                  Formally verified in {selectedMorphism.proofLines} lines.
                  <br />
                  <a href={selectedMorphism.proofUrl} className="proof-link">
                    📜 View Full Proof
                  </a>
                </p>
              </div>
            </div>

            <div className="modal-footer">
              <button className="btn-secondary" onClick={() => setSelectedMorphism(null)}>
                Close
              </button>
              <button className="btn-primary">
                Add to Pipeline
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Code Generator Modal */}
      {showCodeGenerator && (
        <CodeGenerator
          nodes={pipelineNodes}
          onClose={() => setShowCodeGenerator(false)}
        />
      )}

      {/* Examples Modal */}
      {showExamples && (
        <ExamplesModal
          onClose={() => setShowExamples(false)}
          onLoadExample={handleLoadExample}
        />
      )}
    </div>
  );
}

export default App;
