/**
 * Phase 4.3: Graph Controls Component
 *
 * Interactive controls for graph visualization.
 */

import React from "react";
import type { ViewMode, FilterMode, GraphConfig } from "./types.js";

export interface GraphControlsProps {
  config: GraphConfig;
  onConfigChange: (config: Partial<GraphConfig>) => void;
  onReset: () => void;
  onExport: () => void;
}

export const GraphControls: React.FC<GraphControlsProps> = ({
  config,
  onConfigChange,
  onReset,
  onExport,
}) => {
  return (
    <div className="graph-controls">
      <div className="control-section">
        <label>View Mode:</label>
        <select
          value={config.viewMode}
          onChange={(e) =>
            onConfigChange({ viewMode: e.target.value as ViewMode })
          }
        >
          <option value="force">Force-Directed</option>
          <option value="circular">Circular</option>
          <option value="hierarchical">Hierarchical</option>
          <option value="grid">Grid</option>
        </select>
      </div>

      <div className="control-section">
        <label>Filter:</label>
        <select
          value={config.filterMode}
          onChange={(e) =>
            onConfigChange({ filterMode: e.target.value as FilterMode })
          }
        >
          <option value="all">All Agents</option>
          <option value="high-trust">High Trust (0.8+)</option>
          <option value="recent">Recently Active</option>
          <option value="active">Currently Active</option>
        </select>
      </div>

      <div className="control-section">
        <label>
          <input
            type="checkbox"
            checked={config.showLabels}
            onChange={(e) =>
              onConfigChange({ showLabels: e.target.checked })
            }
          />
          Show Labels
        </label>
      </div>

      <div className="control-section">
        <label>
          <input
            type="checkbox"
            checked={config.showStats}
            onChange={(e) =>
              onConfigChange({ showStats: e.target.checked })
            }
          />
          Show Stats
        </label>
      </div>

      <div className="control-section">
        <label>
          <input
            type="checkbox"
            checked={config.showParticles}
            onChange={(e) =>
              onConfigChange({ showParticles: e.target.checked })
            }
          />
          Show Particles
        </label>
      </div>

      <div className="control-section">
        <label>
          <input
            type="checkbox"
            checked={config.autoLayout}
            onChange={(e) =>
              onConfigChange({ autoLayout: e.target.checked })
            }
          />
          Auto Layout
        </label>
      </div>

      <div className="control-actions">
        <button onClick={onReset} className="btn-secondary">
          Reset View
        </button>
        <button onClick={onExport} className="btn-primary">
          Export Graph
        </button>
      </div>
    </div>
  );
};
