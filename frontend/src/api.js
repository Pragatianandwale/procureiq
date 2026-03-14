const API_BASE_URL = 'http://localhost:8000';

export const api = {
  // Pipeline
  runPipeline: async (brokerText = null) => {
    const response = await fetch(`${API_BASE_URL}/api/pipeline/run`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: brokerText ? JSON.stringify({ text: brokerText }) : null
    });
    return response.json();
  },

  // Recommendations
  getLatestRecommendation: async () => {
    const response = await fetch(`${API_BASE_URL}/api/recommendation/latest`);
    return response.json();
  },

  // Override
  submitOverride: async (overrideData) => {
    const response = await fetch(`${API_BASE_URL}/api/override`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(overrideData)
    });
    return response.json();
  },

  // Suppliers
  getSuppliers: async () => {
    const response = await fetch(`${API_BASE_URL}/api/suppliers`);
    return response.json();
  },

  // Signals
  getSignals: async () => {
    const response = await fetch(`${API_BASE_URL}/api/signals`);
    return response.json();
  },

  // History
  getHistory: async (days = 30) => {
    const response = await fetch(`${API_BASE_URL}/api/history?days=${days}`);
    return response.json();
  },

  // Settings
  updateWeights: async (weights) => {
    const response = await fetch(`${API_BASE_URL}/api/settings/weights`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(weights)
    });
    return response.json();
  },

  // Audit
  getAuditLog: async (limit = 100) => {
    const response = await fetch(`${API_BASE_URL}/api/audit?limit=${limit}`);
    return response.json();
  },

  // Status
  getSystemStatus: async () => {
    const response = await fetch(`${API_BASE_URL}/api/status`);
    return response.json();
  }
};
