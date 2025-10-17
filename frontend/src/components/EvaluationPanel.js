import React, { useEffect, useState } from 'react';
import { api } from '../services/api';
import { toast } from 'sonner';

const EvaluationPanel = ({ shouldRefresh, onRefreshComplete }) => {
  const [metrics, setMetrics] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchMetrics = async () => {
    try {
      const data = await api.getEvaluationMetrics();
      setMetrics(data);
    } catch (err) {
      console.error('Failed to fetch metrics:', err);
      toast.error('Failed to fetch evaluation metrics');
    } finally {
      setLoading(false);
      if (onRefreshComplete) {
        onRefreshComplete();
      }
    }
  };

  useEffect(() => {
    fetchMetrics();
  }, []);

  useEffect(() => {
    if (shouldRefresh) {
      fetchMetrics();
    }
  }, [shouldRefresh]);

  if (loading) {
    return <div className="loading">Loading evaluation metrics...</div>;
  }

  if (!metrics || metrics.total_feedback === 0) {
    return (
      <div className="evaluation-panel" data-testid="evaluation-panel">
        <h3>📊 Evaluation Metrics</h3>
        <p className="no-data">No feedback data yet. Rate some recommendations to see precision metrics.</p>
      </div>
    );
  }

  return (
    <div className="evaluation-panel" data-testid="evaluation-panel">
      <h3>📊 Evaluation Metrics</h3>
      
      <div className="overall-metrics">
        <div className="metric-card main-metric">
          <div className="metric-value-large">
            {Math.round(metrics.overall_precision * 100)}%
          </div>
          <div className="metric-label">Overall Precision</div>
          <div className="metric-subtext">
            {metrics.useful_count} useful / {metrics.total_feedback} total
          </div>
        </div>
      </div>

      <div className="type-metrics">
        <h4>Precision by Rule Type:</h4>
        <div className="type-metrics-grid">
          {Object.entries(metrics.by_type).map(([type, data]) => (
            <div key={type} className="type-metric-card">
              <div className="type-header">
                <span className="type-icon">
                  {type === 'fatigue' ? '⚠️' : '💰'}
                </span>
                <span className="type-name">
                  {type === 'fatigue' ? 'Creative Fatigue' : 'Budget Reallocation'}
                </span>
              </div>
              <div className="type-precision">{Math.round(data.precision * 100)}%</div>
              <div className="precision-bar">
                <div className="precision-fill" style={{ width: `${Math.round(data.precision * 100)}%` }} />
              </div>
              <div className="type-stats">
                {data.useful} useful / {data.total} total
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="insights">
        <h4>Insights</h4>
        {(() => {
          const entries = Object.entries(metrics.by_type || {});
          const best = entries.sort((a, b) => (b[1]?.precision || 0) - (a[1]?.precision || 0))[0];
          const bestName = best ? (best[0] === 'fatigue' ? 'Creative Fatigue' : 'Budget Reallocation') : 'N/A';
          const bestPrec = best ? Math.round((best[1]?.precision || 0) * 100) : 0;
          const needsData = entries.filter(([_, v]) => (v?.total || 0) < 5).map(([k]) => k === 'fatigue' ? 'Creative Fatigue' : 'Budget Reallocation');
          return (
            <ul>
              <li><strong>Top performing rule:</strong> {bestName} ({bestPrec}% precision)</li>
              {needsData.length > 0 && (
                <li><strong>Low sample size:</strong> Collect more feedback for {needsData.join(', ')}.</li>
              )}
              <li><strong>Next step:</strong> Continue rating recommendations to refine precision estimates.</li>
            </ul>
          );
        })()}
      </div>
    </div>
  );
};

export default EvaluationPanel;
