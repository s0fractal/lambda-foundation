import { useState } from 'react';
import { DEFAULT_MORPHISMS, type Morphism, type ComposedPipeline } from './types/morphisms';
import './App.css';

function App() {
  const [availableMorphisms] = useState<Morphism[]>(DEFAULT_MORPHISMS);
  const [currentPipeline, setCurrentPipeline] = useState<ComposedPipeline | null>(null);
  const [selectedMorphism, setSelectedMorphism] = useState<Morphism | null>(null);

  return (
    <div className="app">
      {/* Header */}
      <header className="app-header">
        <h1>🔬 Morphism Laboratory</h1>
        <p className="subtitle">Where morphisms become tangible. Where proofs become playful.</p>
        <div className="header-actions">
          <button className="btn-secondary">📖 Examples</button>
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
                className={`morphism-card ${selectedMorphism?.id === morphism.id ? 'selected' : ''}`}
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
            {currentPipeline && (
              <div className="pipeline-stats">
                <span className="fitness">
                  Fitness: {currentPipeline.fitness}%
                </span>
                {currentPipeline.proven && <span className="badge-proven">✓ Proven</span>}
                {currentPipeline.typeChecked && <span className="badge-typed">🔗 Type Safe</span>}
              </div>
            )}
          </div>

          <div className="canvas-area">
            {!currentPipeline ? (
              <div className="canvas-empty">
                <div className="empty-state">
                  <div className="empty-icon">🎨</div>
                  <h3>Start Composing</h3>
                  <p>Drag morphisms from the left panel to build your pipeline</p>
                  <p className="empty-hint">
                    Or try: <button className="link-btn">📖 Load Example</button>
                  </p>
                </div>
              </div>
            ) : (
              <div className="canvas-content">
                {/* Pipeline visualization will go here */}
                <div className="pipeline-flow">
                  <div className="pipeline-node">
                    <span className="node-symbol">🔔</span>
                    <span className="node-name">subscribe</span>
                  </div>
                  <div className="pipeline-arrow">→</div>
                  <div className="pipeline-node">
                    <span className="node-symbol">🗺️</span>
                    <span className="node-name">map</span>
                  </div>
                  <div className="pipeline-arrow">→</div>
                  <div className="pipeline-node">
                    <span className="node-symbol">🔍</span>
                    <span className="node-name">filter</span>
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="canvas-actions">
            <button className="btn-secondary">🗑️ Clear</button>
            <button className="btn-secondary">✓ Validate</button>
            <button className="btn-primary">💻 Generate Code</button>
          </div>
        </main>

        {/* Right Panel: Live Preview */}
        <aside className="live-preview">
          <div className="preview-header">
            <h2>📊 Live Execution</h2>
          </div>

          <div className="preview-content">
            {!currentPipeline ? (
              <div className="preview-empty">
                <p>No pipeline to preview</p>
                <p className="preview-hint">Create a pipeline to see real-time execution</p>
              </div>
            ) : (
              <div className="preview-active">
                <div className="preview-section">
                  <h3>Input</h3>
                  <div className="code-block">
                    <code>{'[ event1, event2, event3, ... ]'}</code>
                  </div>
                </div>

                <div className="preview-arrow">↓</div>

                <div className="preview-section">
                  <h3>Output</h3>
                  <div className="code-block">
                    <code>{'[ filtered_event1, filtered_event2, ... ]'}</code>
                  </div>
                </div>

                <div className="preview-metrics">
                  <div className="metric">
                    <span className="metric-label">⏱️ Latency</span>
                    <span className="metric-value">12ms</span>
                  </div>
                  <div className="metric">
                    <span className="metric-label">📈 Throughput</span>
                    <span className="metric-value">1,234 ops/s</span>
                  </div>
                  <div className="metric">
                    <span className="metric-label">✅ Correctness</span>
                    <span className="metric-value">Proven</span>
                  </div>
                </div>

                <button className="btn-secondary full-width">🎯 Change Input</button>
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
    </div>
  );
}

export default App;
