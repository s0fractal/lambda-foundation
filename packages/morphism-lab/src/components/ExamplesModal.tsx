import { EXAMPLE_PIPELINES, type ExamplePipeline } from '../examples/examplePipelines';
import './ExamplesModal.css';

interface ExamplesModalProps {
  onClose: () => void;
  onLoadExample: (example: ExamplePipeline) => void;
}

export function ExamplesModal({ onClose, onLoadExample }: ExamplesModalProps) {
  const handleLoad = (example: ExamplePipeline) => {
    onLoadExample(example);
    onClose();
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content examples-modal" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h2>📖 Example Pipelines</h2>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>

        <div className="modal-body">
          <p style={{ color: '#888', marginBottom: '20px' }}>
            Load a pre-built pipeline to see λ-Foundation in action
          </p>

          <div className="examples-grid">
            {EXAMPLE_PIPELINES.map(example => (
              <div key={example.id} className="example-card">
                <div className="example-icon">{example.icon}</div>
                <h3>{example.name}</h3>
                <p>{example.description}</p>
                <div className="example-meta">
                  {example.nodes.length} morphisms
                </div>
                <button
                  className="btn-primary full-width"
                  onClick={() => handleLoad(example)}
                >
                  Load Pipeline
                </button>
              </div>
            ))}
          </div>
        </div>

        <div className="modal-footer">
          <button className="btn-secondary" onClick={onClose}>
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
