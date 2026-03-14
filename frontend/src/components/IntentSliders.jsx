import React, { useState, useEffect } from 'react';
import { api } from '../api';

function IntentSliders({ onWeightsChange }) {
  const [weights, setWeights] = useState({
    quality: 0.40,
    cost: 0.30,
    lead_time: 0.20,
    carbon: 0.10
  });
  const [updating, setUpdating] = useState(false);

  const handleSliderChange = (key, value) => {
    const newWeights = { ...weights, [key]: value };
    
    // Normalize weights to sum to 1.0
    const total = Object.values(newWeights).reduce((sum, val) => sum + val, 0);
    const normalized = {};
    Object.keys(newWeights).forEach(k => {
      normalized[k] = newWeights[k] / total;
    });
    
    setWeights(normalized);
  };

  const applyWeights = async () => {
    setUpdating(true);
    try {
      const result = await api.updateWeights(weights);
      if (onWeightsChange) {
        onWeightsChange(result.updated_rankings);
      }
    } catch (error) {
      console.error('Error updating weights:', error);
    } finally {
      setUpdating(false);
    }
  };

  const sliderConfig = [
    { key: 'quality', label: 'Quality', color: 'blue' },
    { key: 'cost', label: 'Cost', color: 'green' },
    { key: 'lead_time', label: 'Lead Time', color: 'yellow' },
    { key: 'carbon', label: 'Carbon', color: 'purple' }
  ];

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h3 className="text-lg font-semibold text-gray-800 mb-4">IBN Intent Weights</h3>
      <div className="text-xs text-gray-500 mb-6">Adjust priorities for supplier ranking</div>
      
      <div className="space-y-6">
        {sliderConfig.map(({ key, label, color }) => (
          <div key={key}>
            <div className="flex justify-between items-center mb-2">
              <label className="text-sm font-medium text-gray-700">{label}</label>
              <span className="text-sm font-semibold text-gray-900">
                {(weights[key] * 100).toFixed(0)}%
              </span>
            </div>
            <input
              type="range"
              min="0"
              max="1"
              step="0.05"
              value={weights[key]}
              onChange={(e) => handleSliderChange(key, parseFloat(e.target.value))}
              className={`w-full h-2 rounded-lg appearance-none cursor-pointer bg-${color}-200`}
              style={{
                background: `linear-gradient(to right, rgb(59, 130, 246) 0%, rgb(59, 130, 246) ${weights[key] * 100}%, rgb(229, 231, 235) ${weights[key] * 100}%, rgb(229, 231, 235) 100%)`
              }}
            />
          </div>
        ))}
      </div>

      <button
        onClick={applyWeights}
        disabled={updating}
        className={`w-full mt-6 py-2 px-4 rounded-lg font-medium ${
          updating
            ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
            : 'bg-blue-600 text-white hover:bg-blue-700'
        }`}
      >
        {updating ? 'Updating...' : 'Apply Weights'}
      </button>

      <div className="mt-4 p-3 bg-blue-50 rounded-lg">
        <div className="text-xs text-blue-800">
          <strong>Note:</strong> Weights are automatically normalized to sum to 100%
        </div>
      </div>
    </div>
  );
}

export default IntentSliders;
