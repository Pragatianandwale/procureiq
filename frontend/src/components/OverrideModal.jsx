import React, { useState } from 'react';

function OverrideModal({ recommendation, onSubmit, onCancel }) {
  const [decision, setDecision] = useState('WAIT');
  const [reason, setReason] = useState('');
  const [outcome, setOutcome] = useState('');

  const handleSubmit = () => {
    if (!reason.trim()) {
      alert('Please provide a reason for the override');
      return;
    }

    onSubmit({
      recommendation_id: recommendation?.id,
      original_recommendation: recommendation?.recommendation || 'WAIT',
      manager_decision: decision,
      reason: reason.trim(),
      outcome: outcome,
      supplier_name: recommendation?.top_supplier || '',
      confidence_score: recommendation?.confidence || 0.5,
      ibn_score: recommendation?.ibn_score || 0.5
    });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-lg w-full mx-4">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-xl font-bold text-gray-800">Override Recommendation</h2>
        </div>
        
        <div className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Original Recommendation
            </label>
            <div className="px-4 py-2 bg-gray-100 rounded-lg text-gray-800 font-semibold">
              {recommendation?.recommendation || 'N/A'}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Your Decision <span className="text-red-500">*</span>
            </label>
            <select
              value={decision}
              onChange={(e) => setDecision(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="BUY">BUY</option>
              <option value="WAIT">WAIT</option>
              <option value="SWITCH">SWITCH</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Reason for Override <span className="text-red-500">*</span>
            </label>
            <textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              rows={4}
              placeholder="Explain why you're overriding the AI recommendation..."
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Outcome (Optional)
            </label>
            <select
              value={outcome}
              onChange={(e) => setOutcome(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">Select outcome...</option>
              <option value="positive">Positive</option>
              <option value="negative">Negative</option>
              <option value="pending">Pending</option>
            </select>
          </div>
        </div>

        <div className="px-6 py-4 border-t border-gray-200 flex justify-end space-x-3">
          <button
            onClick={onCancel}
            className="px-6 py-2 rounded-lg font-medium bg-gray-200 text-gray-700 hover:bg-gray-300"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            className="px-6 py-2 rounded-lg font-medium bg-blue-600 text-white hover:bg-blue-700"
          >
            Submit Override
          </button>
        </div>
      </div>
    </div>
  );
}

export default OverrideModal;
