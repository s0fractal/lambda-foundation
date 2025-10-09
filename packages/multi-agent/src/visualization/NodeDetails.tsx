/**
 * Phase 4.3: Node Details Panel
 *
 * Displays detailed information about selected agent.
 */

import React from "react";
import type { NodeSelection } from "./types.js";

export interface NodeDetailsProps {
  selection: NodeSelection | null;
  onClose: () => void;
}

export const NodeDetails: React.FC<NodeDetailsProps> = ({
  selection,
  onClose,
}) => {
  if (!selection) return null;

  const { node } = selection;

  return (
    <div className="node-details-panel">
      <div className="panel-header">
        <h3>Agent Details</h3>
        <button onClick={onClose} className="close-btn">
          ×
        </button>
      </div>

      <div className="panel-body">
        <div className="detail-section">
          <div className="detail-label">Name:</div>
          <div className="detail-value" style={{ color: node.color }}>
            {node.name}
          </div>
        </div>

        <div className="detail-section">
          <div className="detail-label">System:</div>
          <div className="detail-value">{node.system}</div>
        </div>

        <div className="detail-section">
          <div className="detail-label">Trust Score:</div>
          <div className="detail-value">
            <div className="trust-bar">
              <div
                className="trust-fill"
                style={{
                  width: `${node.trust * 100}%`,
                  backgroundColor: node.color,
                }}
              />
            </div>
            <span>{node.trust.toFixed(3)}</span>
          </div>
        </div>

        <div className="detail-section">
          <div className="detail-label">Domains:</div>
          <div className="detail-value">
            {node.domains.map((d) => (
              <span key={d} className="domain-tag">
                {d}
              </span>
            ))}
          </div>
        </div>

        <div className="detail-section">
          <div className="detail-label">Discoveries:</div>
          <div className="detail-value">{node.discoveries}</div>
        </div>

        <div className="detail-section">
          <div className="detail-label">Validations:</div>
          <div className="detail-value">{node.validations}</div>
        </div>

        <div className="detail-section">
          <div className="detail-label">Contribution:</div>
          <div className="detail-value">
            {((node.discoveries + node.validations) * 10).toFixed(0)}%
          </div>
        </div>
      </div>
    </div>
  );
};
