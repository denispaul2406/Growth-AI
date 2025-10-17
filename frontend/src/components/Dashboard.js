import React, { useState } from 'react';
import CsvUploader from './CsvUploader';
import RecommendationCard from './RecommendationCard';
import EvaluationPanel from './EvaluationPanel';
import SimulatorModal from './SimulatorModal';
import Navbar from './Navbar';
import Stepper from './Stepper';
import { api } from '../services/api';

const Dashboard = () => {
  const [step, setStep] = useState('upload'); // 'upload', 'recommendations', 'evaluation'
  const [uploadedData, setUploadedData] = useState(null);
  const [recommendations, setRecommendations] = useState([]);
  const [benchmarks, setBenchmarks] = useState([]);
  const [analyzing, setAnalyzing] = useState(false);
  const [error, setError] = useState(null);
  const [selectedRecommendation, setSelectedRecommendation] = useState(null);
  const [refreshMetrics, setRefreshMetrics] = useState(false);
  const [filterPlatform, setFilterPlatform] = useState('all');
  const [filterType, setFilterType] = useState('all');
  const [minConfidence, setMinConfidence] = useState(0);

  const handleUploadSuccess = async (data) => {
    setUploadedData(data);
    setError(null);
  };

  const handleAnalyze = async () => {
    setAnalyzing(true);
    setError(null);

    try {
      // Fetch benchmarks first
      const benchData = await api.getBenchmarks();
      setBenchmarks(benchData);

      // Analyze campaigns
      await api.analyzeCampaigns();

      // IMPORTANT: fetch stored recommendations (with IDs) for rendering & feedback
      const stored = await api.getRecommendations();
      setRecommendations(stored || []);
      setStep('recommendations');
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to analyze campaigns');
      console.error('Analysis error:', err);
    } finally {
      setAnalyzing(false);
    }
  };

  const handleFeedbackSubmit = () => {
    setRefreshMetrics(true);
  };

  const handleRefreshComplete = () => {
    setRefreshMetrics(false);
  };

  return (
    <div className="dashboard" data-testid="dashboard">
      <Navbar />
      <div className="ga-shell">
        <Stepper current={step} onNavigate={setStep} />
        <div className="ga-content">
          <header className="dashboard-header">
        <div className="header-content">
          <h1>GrowthAI</h1>
          <p className="tagline">Explainable D2C Ad Spend Optimization</p>
        </div>
        <div className="header-nav">
          <button
            onClick={() => setStep('upload')}
            className={step === 'upload' ? 'active' : ''}
            data-testid="nav-upload"
          >
            📤 Upload
          </button>
          <button
            onClick={() => setStep('recommendations')}
            disabled={recommendations.length === 0}
            className={step === 'recommendations' ? 'active' : ''}
            data-testid="nav-recommendations"
          >
            💡 Recommendations
          </button>
          <button
            onClick={() => setStep('evaluation')}
            disabled={recommendations.length === 0}
            className={step === 'evaluation' ? 'active' : ''}
            data-testid="nav-evaluation"
          >
            📊 Evaluation
          </button>
        </div>
        </header>

        <main className="dashboard-main">
        {step === 'upload' && (
          <div className="step-container">
            <CsvUploader onUploadSuccess={handleUploadSuccess} />
            
            {uploadedData && (
              <div className="action-section">
                <button
                  onClick={handleAnalyze}
                  disabled={analyzing}
                  className="analyze-button"
                  data-testid="analyze-button"
                >
                  {analyzing ? 'Analyzing...' : '🔍 Generate Recommendations'}
                </button>
              </div>
            )}

            {error && (
              <div className="error-message" data-testid="error-message">
                <span className="error-icon">⚠️</span>
                {error}
              </div>
            )}
          </div>
        )}

        {step === 'recommendations' && (
          <div className="step-container">
            <div className="recommendations-header">
              <h2>💡 Recommendations</h2>
              <p className="subtitle">
                Found {recommendations.length} optimization opportunities
              </p>
            </div>

            <div className="recommendations-filters">
              <div className="filter-group">
                <label>Platform</label>
                <select value={filterPlatform} onChange={(e) => setFilterPlatform(e.target.value)}>
                  <option value="all">All</option>
                  <option value="meta">Meta</option>
                  <option value="google">Google</option>
                </select>
              </div>
              <div className="filter-group">
                <label>Type</label>
                <select value={filterType} onChange={(e) => setFilterType(e.target.value)}>
                  <option value="all">All</option>
                  <option value="fatigue">Creative Fatigue</option>
                  <option value="reallocation">Budget Reallocation</option>
                </select>
              </div>
              <div className="filter-group">
                <label>Min Confidence: {minConfidence}%</label>
                <input type="range" min="0" max="100" value={minConfidence} onChange={(e) => setMinConfidence(Number(e.target.value))} />
              </div>
            </div>

            <div className="recommendations-grid" data-testid="recommendations-list">
              {recommendations
                .filter((rec) => {
                  if (filterType !== 'all' && rec.type !== filterType) return false;
                  const confPct = Math.round((rec.confidence || 0) * 100);
                  if (confPct < minConfidence) return false;
                  if (filterPlatform === 'all') return true;
                  const plat = rec?.details?.platform;
                  return plat === filterPlatform;
                })
                .map((rec) => (
                <div key={rec.id}>
                  <RecommendationCard
                    recommendation={rec}
                    benchmarks={benchmarks}
                    onFeedbackSubmit={handleFeedbackSubmit}
                  />
                  <button
                    onClick={() => setSelectedRecommendation(rec)}
                    className="simulate-button"
                    data-testid="simulate-button"
                  >
                    🔮 Simulate Impact
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {step === 'evaluation' && (
          <div className="step-container">
            <EvaluationPanel
              shouldRefresh={refreshMetrics}
              onRefreshComplete={handleRefreshComplete}
            />
          </div>
        )}
        </main>
        </div>
      </div>

      {selectedRecommendation && (
        <SimulatorModal
          recommendation={selectedRecommendation}
          onClose={() => setSelectedRecommendation(null)}
        />
      )}
    </div>
  );
};

export default Dashboard;
