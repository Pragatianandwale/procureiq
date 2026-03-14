import React, { useState, useEffect } from 'react';
import { api } from '../api';
import APICallLog from '../components/APICallLog';

function Settings() {
  const [weights, setWeights] = useState({
    quality: 0.40,
    cost: 0.30,
    lead_time: 0.20,
    carbon: 0.10
  });
  const [auditLog, setAuditLog] = useState([]);
  const [systemStatus, setSystemStatus] = useState(null);
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const [suppData, auditData, statusData] = await Promise.all([
        api.getSuppliers(),
        api.getAuditLog(50),
        api.getSystemStatus()
      ]);
      
      if (suppData.weights) {
        setWeights(suppData.weights);
      }
      setAuditLog(auditData.database_audit || []);
      setSystemStatus(statusData);
    } catch (error) {
      console.error('Error loading settings:', error);
    }
  };

  const handleWeightChange = (key, value) => {
    setWeights({ ...weights, [key]: parseFloat(value) });
  };

  const handleSaveWeights = async () => {
    setUpdating(true);
    try {
      await api.updateWeights(weights);
      alert('Weights updated successfully!');
      loadSettings();
    } catch (error) {
      console.error('Error updating weights:', error);
      alert('Error updating weights');
    } finally {
      setUpdating(false);
    }
  };

  const handleManualPipeline = async () => {
    if (!confirm('Run pipeline manually? This will generate a new recommendation.')) {
      return;
    }
    
    try {
      await api.runPipeline();
      alert('Pipeline executed successfully!');
    } catch (error) {
      console.error('Error running pipeline:', error);
      alert('Error running pipeline');
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">Settings</h2>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* IBN Weights */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">IBN Weight Configuration</h3>
          
          <div className="space-y-4">
            {Object.entries(weights).map(([key, value]) => (
              <div key={key}>
                <div className="flex justify-between items-center mb-2">
                  <label className="text-sm font-medium text-gray-700 capitalize">
                    {key.replace('_', ' ')}
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="1"
                    step="0.05"
                    value={value}
                    onChange={(e) => handleWeightChange(key, e.target.value)}
                    className="w-20 px-2 py-1 border border-gray-300 rounded text-sm"
                  />
                </div>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.05"
                  value={value}
                  onChange={(e) => handleWeightChange(key, e.target.value)}
                  className="w-full"
                />
              </div>
            ))}
          </div>

          <button
            onClick={handleSaveWeights}
            disabled={updating}
            className={`w-full mt-4 py-2 px-4 rounded-lg font-medium ${
              updating
                ? 'bg-gray-300 text-gray-500'
                : 'bg-blue-600 text-white hover:bg-blue-700'
            }`}
          >
            {updating ? 'Saving...' : 'Save Weights'}
          </button>
        </div>

        {/* System Status */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">System Status</h3>
          
          {systemStatus && (
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">System Health</span>
                <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                  systemStatus.system_healthy
                    ? 'bg-green-100 text-green-800'
                    : 'bg-red-100 text-red-800'
                }`}>
                  {systemStatus.system_healthy ? 'Healthy' : 'Issues Detected'}
                </span>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Ollama Status</span>
                <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                  systemStatus.ollama?.ollama_running
                    ? 'bg-green-100 text-green-800'
                    : 'bg-yellow-100 text-yellow-800'
                }`}>
                  {systemStatus.ollama?.ollama_running ? 'Running' : 'Not Running'}
                </span>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">SGD Model</span>
                <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                  systemStatus.sgd_model?.is_fitted
                    ? 'bg-green-100 text-green-800'
                    : 'bg-yellow-100 text-yellow-800'
                }`}>
                  {systemStatus.sgd_model?.is_fitted ? 'Trained' : 'Not Trained'}
                </span>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Training Examples</span>
                <span className="text-sm font-semibold text-gray-800">
                  {systemStatus.sgd_model?.total_training_examples || 0}
                </span>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Suppliers Loaded</span>
                <span className="text-sm font-semibold text-gray-800">
                  {systemStatus.suppliers?.total_suppliers || 0}
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Pipeline Control */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Pipeline Control</h3>
          
          <div className="space-y-4">
            <div className="p-4 bg-blue-50 rounded-lg">
              <div className="text-sm font-medium text-blue-800 mb-2">Scheduled Run</div>
              <div className="text-xs text-blue-600">Daily at 5:00 AM IST</div>
            </div>

            <button
              onClick={handleManualPipeline}
              className="w-full py-2 px-4 rounded-lg font-medium bg-green-600 text-white hover:bg-green-700"
            >
              Run Pipeline Manually
            </button>

            <div className="text-xs text-gray-500">
              Manual pipeline execution will generate a new recommendation based on current market signals.
            </div>
          </div>
        </div>

        {/* API Call Log */}
        <div className="mt-8">
          <APICallLog />
        </div>

        {/* Audit Log */}
        <div className="bg-white rounded-lg shadow p-6 mt-8">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Recent Audit Log</h3>
          
          <div className="space-y-2 max-h-96 overflow-y-auto">
            {auditLog.length === 0 ? (
              <div className="text-center text-gray-400 py-4">No audit entries</div>
            ) : (
              auditLog.map((entry, index) => (
                <div key={index} className="border-l-2 border-blue-500 pl-3 py-2">
                  <div className="text-xs font-medium text-gray-800">{entry.action}</div>
                  <div className="text-xs text-gray-600">{entry.details}</div>
                  <div className="text-xs text-gray-400">{entry.timestamp}</div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Settings;
