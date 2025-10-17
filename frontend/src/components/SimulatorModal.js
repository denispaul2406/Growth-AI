import React, { useState, useEffect } from 'react';
import { api } from '../services/api';

const SimulatorModal = ({ recommendation, onClose }) => {
  const [simulation, setSimulation] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const runSimulation = async () => {
      try {
        let campaignName, action;
        
        if (recommendation.type === 'fatigue') {
          campaignName = recommendation.details.campaign_name;
          action = 'refresh_creative';
        } else if (recommendation.type === 'reallocation') {
          campaignName = recommendation.details.from_campaign;
          action = 'reallocate_budget';
        }

        const result = await api.simulateImpact(campaignName, action);
        setSimulation(result);
      } catch (err) {
        setError(err.response?.data?.detail || 'Failed to run simulation');
        console.error('Simulation error:', err);
      } finally {
        setLoading(false);
      }
    };

    runSimulation();
  }, [recommendation]);

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()} data-testid="simulator-modal">
        <div className="modal-header">
          <h3>🔮 Impact Simulation</h3>
          <button onClick={onClose} className="modal-close" data-testid="close-modal-button">
            ✕
          </button>
        </div>

        <div className="modal-body">
          {loading && <div className="loading">Running bootstrap simulation...</div>}
          
          {error && (
            <div className="error-message">
              <span className="error-icon">⚠️</span>
              {error}
            </div>
          )}

          {simulation && (
            <div className="simulation-results">
              <div className="sim-section">
                <h4>Current Performance</h4>
                <div className="metrics-grid">
                  <div className="metric-box">
                    <div className="metric-label">Avg Daily Spend</div>
                    <div className="metric-value">₹{simulation.current_metrics.avg_daily_spend.toLocaleString()}</div>
                  </div>
                  <div className="metric-box">
                    <div className="metric-label">Avg ROAS</div>
                    <div className="metric-value">{simulation.current_metrics.avg_roas}x</div>
                  </div>
                  {simulation.current_metrics.avg_cpa !== 'N/A' && (
                    <div className="metric-box">
                      <div className="metric-label">Avg CPA</div>
                      <div className="metric-value">₹{simulation.current_metrics.avg_cpa}</div>
                    </div>
                  )}
                </div>
              </div>

              <div className="sim-section">
                <h4>Projected After Action</h4>
                <div className="projection-card">
                  <div className="projection-main">
                    <div className="projection-label">Projected ROAS</div>
                    <div className="projection-value">
                      {simulation.projected_metrics.roas.median}x
                    </div>
                    <div className="projection-range">
                      90% CI: {simulation.projected_metrics.roas.p5}x - {simulation.projected_metrics.roas.p95}x
                    </div>
                    <div className="range-bar">
                      {(() => {
                        const p5 = simulation.projected_metrics.roas.p5;
                        const p95 = simulation.projected_metrics.roas.p95;
                        const median = simulation.projected_metrics.roas.median;
                        const min = Math.max(0, Math.min(p5, median, p95) * 0.8);
                        const max = Math.max(p5, median, p95) * 1.2;
                        const span = max - min || 1;
                        const left = ((Math.min(p5, p95) - min) / span) * 100;
                        const width = (Math.abs(p95 - p5) / span) * 100;
                        const dot = ((median - min) / span) * 100;
                        return (
                          <div className="range-track">
                            <div className="range-ci" style={{ left: `${left}%`, width: `${width}%` }} />
                            <div className="range-dot" style={{ left: `${dot}%` }} title={`Median ${median}x`} />
                          </div>
                        );
                      })()}
                    </div>
                  </div>

                  <div className="projection-main">
                    <div className="projection-label">Daily Revenue Lift</div>
                    <div className="projection-value positive">
                      +₹{simulation.projected_metrics.daily_revenue_lift.median.toLocaleString()}
                    </div>
                    <div className="projection-range">
                      {simulation.confidence_interval}
                    </div>
                    <div className="range-bar">
                      {(() => {
                        const m = simulation.projected_metrics.daily_revenue_lift.median;
                        const p5 = simulation.projected_metrics.daily_revenue_lift.p5;
                        const p95 = simulation.projected_metrics.daily_revenue_lift.p95;
                        const min = Math.min(p5, m) * 0.8;
                        const max = Math.max(p95, m) * 1.2 || 1;
                        const span = max - min || 1;
                        const left = ((Math.min(p5, p95) - min) / span) * 100;
                        const width = (Math.abs(p95 - p5) / span) * 100;
                        const dot = ((m - min) / span) * 100;
                        return (
                          <div className="range-track">
                            <div className="range-ci" style={{ left: `${left}%`, width: `${width}%` }} />
                            <div className="range-dot" style={{ left: `${dot}%` }} title={`Median ₹${m}`} />
                          </div>
                        );
                      })()}
                    </div>
                  </div>

                  {simulation.projected_metrics.cpa && (
                    <div className="projection-main">
                      <div className="projection-label">CPA Reduction</div>
                      <div className="projection-value positive">
                        -{simulation.projected_metrics.cpa.reduction_pct}%
                      </div>
                      <div className="projection-range">
                        New CPA: ₹{simulation.projected_metrics.cpa.median}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div className="sim-section">
                <div className="impact-summary">
                  <strong>Summary:</strong> {simulation.impact_summary}
                </div>
              </div>

              <div className="sim-footer">
                <p className="sim-note">
                  📊 Based on 1,000 bootstrap iterations using last 28 days of campaign data
                </p>
              </div>
            </div>
          )}
        </div>

        <div className="modal-actions">
          <button onClick={onClose} className="btn-secondary">
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default SimulatorModal;
