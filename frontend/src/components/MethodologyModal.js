import React from 'react';

const MethodologyModal = ({ open, onClose, section = 'methodology' }) => {
  if (!open) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()} data-testid="methodology-modal">
        <div className="modal-header">
          <h3>{section === 'ethics' ? '🛡️ Ethics & Responsible AI' : '📐 Methodology'}</h3>
          <button onClick={onClose} className="modal-close">✕</button>
        </div>
        <div className="modal-body">
          {section === 'methodology' && (
            <div className="methodology">
              <h4>Problem & Objectives</h4>
              <p>
                Fragmented cross-platform ad reporting creates blind spots for D2C teams. Our objective is to
                normalize data, generate explainable recommendations with benchmark support, quantify impact with
                uncertainty, and learn continuously via user feedback.
              </p>

              <h4>Data Pipeline</h4>
              <ul>
                <li>Header cleaning, platform inference, schema mapping</li>
                <li>Coercion for numerics and dates, drop zero-spend, deduplicate by (date, campaign, platform)</li>
                <li>Derived metrics: CTR, CPA, ROAS</li>
              </ul>

              <h4>Recommendation Rules</h4>
              <ul>
                <li>Creative fatigue: CTR drop ≥20% and CPA rise ≥15% (last 14d split weeks)</li>
                <li>Budget reallocation: low Q1 ROAS → high Q3 ROAS with headroom; suggest ~15% shift</li>
                <li>Benchmark linkage: platform/metric keyword scoring to cite relevant research</li>
              </ul>

              <h4>Impact Simulation</h4>
              <p>
                Bootstrap resampling on last ≤28 days. Action-specific uplift ranges produce median and 90% CI for ROAS
                and daily revenue lift. Not a causal model; communicates uncertainty transparently.
              </p>

              <h4>Evaluation</h4>
              <p>
                Precision is computed from user feedback overall and by rule-type. The dashboard surfaces best-performing
                rules and areas needing more feedback to improve estimates.
              </p>
            </div>
          )}

          {section === 'ethics' && (
            <div className="ethics">
              <h4>Data Privacy</h4>
              <p>Works with CSV exports; no PII required. Recommend using secure storage and access controls.</p>

              <h4>Transparency & Explainability</h4>
              <p>Rules are explicit with thresholds and metrics. Benchmarks are cited with links for review.</p>

              <h4>Bias & Limitations</h4>
              <p>
                Heuristic thresholds and historical performance may reflect channel biases. Simulation is not causal.
                Encourage human oversight and continuous validation.
              </p>

              <h4>Responsible Use</h4>
              <ul>
                <li>Use confidence bands to avoid over-confident scaling</li>
                <li>Validate with small tests before global changes</li>
                <li>Collect feedback to improve precision over time</li>
              </ul>
            </div>
          )}
        </div>
        <div className="modal-actions">
          <button onClick={onClose} className="btn-secondary">Close</button>
        </div>
      </div>
    </div>
  );
};

export default MethodologyModal;


