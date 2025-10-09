/**
 * Phase 4.3: Edge Details Panel
 *
 * Displays detailed information about selected resonance edge.
 */

import React from "react";
import type { EdgeSelection, GraphNode } from "./types.js";

export interface EdgeDetailsProps {
  selection: EdgeSelection | null;
  onClose: () => void;
}

export const EdgeDetails: React.FC<EdgeDetailsProps> = ({
  selection,
  onClose,
}) => {
  if (!selection) return null;

  const { link } = selection;
  const source = (link.source as GraphNode).name || (link.source as string);
  const target = (link.target as GraphNode).name || (link.target as string);

  return (
    <div className="edge-details-panel">
      <div className="panel-header">
        <h3>Resonance Details</h3>
        <button onClick={onClose} className="close-btn">
          ×
        </button>
      </div>

      <div className="panel-body">
        <div className="detail-section">
          <div className="detail-label">From:</div>
          <div className="detail-value">{source}</div>
        </div>

        <div className="detail-section">
          <div className="detail-label">To:</div>
          <div className="detail-value">{target}</div>
        </div>

        <div className="detail-section">
          <div className="detail-label">Type:</div>
          <div className="detail-value resonance-type">{link.type}</div>
        </div>

        <div className="detail-section">
          <div className="detail-label">Confidence:</div>
          <div className="detail-value">
            <div className="confidence-bar">
              <div
                className="confidence-fill"
                style={{
                  width: `${link.confidence * 100}%`,
                  backgroundColor:
                    link.confidence >= 0.9
                      ? "#00ff9f"
                      : link.confidence >= 0.8
                        ? "#00b8ff"
                        : "#ff6b9d",
                }}
              />
            </div>
            <span>{link.confidence.toFixed(3)}</span>
          </div>
        </div>

        {link.label && (
          <div className="detail-section">
            <div className="detail-label">Label:</div>
            <div className="detail-value">{link.label}</div>
          </div>
        )}

        {link.timestamp && (
          <div className="detail-section">
            <div className="detail-label">Timestamp:</div>
            <div className="detail-value">{link.timestamp}</div>
          </div>
        )}

        <div className="detail-section">
          <div className="detail-label">Strength:</div>
          <div className="detail-value">
            {link.confidence >= 0.9
              ? "Strong"
              : link.confidence >= 0.8
                ? "Medium"
                : "Weak"}
          </div>
        </div>
      </div>
    </div>
  );
};
