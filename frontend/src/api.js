const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

export const api = {
  runPipeline: async (brokerText = null) => {
    const response = await fetch(`${API_BASE_URL}/api/pipeline/run`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: brokerText ? JSON.stringify({ text: brokerText }) : null
    });
    return response.json();
  },

  getLatestRecommendation: async () => {
    const response = await fetch(`${API_BASE_URL}/api/recommendation/latest`);
    return response.json();
  },

  submitOverride: async (overrideData) => {
    const response = await fetch(`${API_BASE_URL}/api/override`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(overrideData)
    });
    return response.json();
  },

  getSuppliers: async () => {
    const response = await fetch(`${API_BASE_URL}/api/suppliers`);
    return response.json();
  },

  getSignals: async () => {
    const response = await fetch(`${API_BASE_URL}/api/signals`);
    return response.json();
  },

  getHistory: async (days = 30) => {
    const response = await fetch(`${API_BASE_URL}/api/history?days=${days}`);
    return response.json();
  },

  updateWeights: async (weights) => {
    const response = await fetch(`${API_BASE_URL}/api/settings/weights`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(weights)
    });
    return response.json();
  },

  getAuditLog: async (limit = 100) => {
    const response = await fetch(`${API_BASE_URL}/api/audit?limit=${limit}`);
    return response.json();
  },

  getSystemStatus: async () => {
    const response = await fetch(`${API_BASE_URL}/api/status`);
    return response.json();
  }
};
