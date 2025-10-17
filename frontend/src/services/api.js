import axios from 'axios';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

export const api = {
  // CSV Upload
  uploadCSV: async (file) => {
    const formData = new FormData();
    formData.append('file', file);
    const response = await axios.post(`${API}/upload-csv`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    return response.data;
  },

  // Get campaigns
  getCampaigns: async () => {
    const response = await axios.get(`${API}/campaigns`);
    return response.data;
  },

  // Analyze campaigns
  analyzeCampaigns: async () => {
    const response = await axios.post(`${API}/analyze`);
    return response.data;
  },

  // Get recommendations
  getRecommendations: async () => {
    const response = await axios.get(`${API}/recommendations`);
    return response.data;
  },

  // Get benchmarks
  getBenchmarks: async (platform = null, metricType = null) => {
    const params = {};
    if (platform) params.platform = platform;
    if (metricType) params.metric_type = metricType;
    const response = await axios.get(`${API}/benchmarks`, { params });
    return response.data;
  },

  // Get benchmark by ID
  getBenchmarkById: async (id) => {
    const response = await axios.get(`${API}/benchmarks/${id}`);
    return response.data;
  },

  // Submit feedback
  submitFeedback: async (recommendationId, recommendationType, isUseful) => {
    const response = await axios.post(`${API}/feedback`, {
      recommendation_id: recommendationId,
      recommendation_type: recommendationType,
      is_useful: isUseful
    });
    return response.data;
  },

  // Get evaluation metrics
  getEvaluationMetrics: async () => {
    const response = await axios.get(`${API}/evaluation/metrics`);
    return response.data;
  },

  // Simulate impact
  simulateImpact: async (campaignName, action) => {
    const response = await axios.post(`${API}/simulate`, null, {
      params: { campaign_name: campaignName, action }
    });
    return response.data;
  }
};
