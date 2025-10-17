import React, { useState } from 'react';
import { api } from '../services/api';
import { toast } from 'sonner';

const RecommendationCard = ({ recommendation, benchmarks, onFeedbackSubmit }) => {
  const [showDetails, setShowDetails] = useState(false);
  const [feedback, setFeedback] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleFeedback = async (isUseful) => {
    setLoading(true);
    try {
      await api.submitFeedback(
        recommendation.id,
        recommendation.type,
        isUseful
      );
      setFeedback(isUseful);
      toast.success(isUseful ? 'Thanks for the feedback!' : 'Feedback noted');
      if (onFeedbackSubmit) {
        onFeedbackSubmit();
      }
    } catch (err) {
      console.error('Failed to submit feedback:', err);
      toast.error('Failed to submit feedback');
    } finally {
      setLoading(false);
    }
  };

  const getRecommendationIcon = (type) => {
    return type === 'fatigue' ? '⚠️' : '💰';
  };

  const getConfidenceColor = (confidence) => {
    if (confidence >= 0.8) return 'high';
    if (confidence >= 0.6) return 'medium';
    return 'low';
  };

  // Get relevant benchmarks
  const relevantBenchmarks = benchmarks.filter(b => 
    recommendation.source_ids.includes(b.id)
  );

  const platform = recommendation?.details?.platform || 'all';
  const typeBadge = recommendation.type === 'fatigue' ? 'Creative Fatigue' : 'Budget Reallocation';

  return (
    <div className="recommendation-card" data-testid="recommendation-card">
      <div className="card-header">
        <div className="title-row">
          <span className="icon">{getRecommendationIcon(recommendation.type)}</span>
          <h3>{recommendation.title}</h3>
          <span className={`confidence-badge ${getConfidenceColor(recommendation.confidence)}`}>
            {Math.round(recommendation.confidence * 100)}% confidence
          </span>
        </div>
        <p className="description">{recommendation.description}</p>
        <div className="badge-row">
          <span className={`platform-badge ${platform}`}>{platform}</span>
          <span className="type-badge">{typeBadge}</span>
        </div>
      </div>

      <div className="card-body">
        <div className="why-section">
          <h4>🎯 WHY THIS FIRED</h4>
          <pre>{recommendation.why_fired}</pre>
        </div>

        <div className="metrics-section">
          <h4>📊 Trigger Metrics</h4>
          <div className="metrics-grid">
            {Object.entries(recommendation.trigger_metrics).map(([key, value]) => (
              <div key={key} className="metric-item">
                <span className="metric-label">{key.replace(/_/g, ' ')}:</span>
                <span className="metric-value">{value}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="impact-section">
          <h4>💡 Projected Impact</h4>
          <p>{recommendation.projected_impact}</p>
        </div>

        {relevantBenchmarks.length > 0 && (
          <div className="sources-section">
            <h4>📚 Supporting Research</h4>
            <div className="sources-list">
              {relevantBenchmarks.map((bench) => (
                <div key={bench.id} className="source-item">
                  <div className="source-header">
                    <strong>{bench.title}</strong>
                    <span className="source-badge">{bench.year}</span>
                  </div>
                  <p className="source-finding">{bench.key_finding}</p>
                  <a 
                    href={bench.source_url} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="source-link"
                  >
                    {bench.source} →
                  </a>
                </div>
              ))}
            </div>
          </div>
        )}

        <button
          onClick={() => setShowDetails(!showDetails)}
          className="details-toggle"
        >
          {showDetails ? '▼ Hide Details' : '▶ Show Full Details'}
        </button>

        {showDetails && (
          <div className="full-details">
            <pre>{JSON.stringify(recommendation.details, null, 2)}</pre>
          </div>
        )}
      </div>

      <div className="card-footer">
        <div className="feedback-section" data-testid="feedback-section">
          <span>Was this recommendation useful?</span>
          <div className="feedback-buttons">
            <button
              onClick={() => handleFeedback(true)}
              disabled={loading || feedback !== null}
              className={`feedback-btn thumbs-up ${feedback === true ? 'active' : ''}`}
              data-testid="thumbs-up-button"
            >
              👍 Useful
            </button>
            <button
              onClick={() => handleFeedback(false)}
              disabled={loading || feedback !== null}
              className={`feedback-btn thumbs-down ${feedback === false ? 'active' : ''}`}
              data-testid="thumbs-down-button"
            >
              👎 Not Useful
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RecommendationCard;
