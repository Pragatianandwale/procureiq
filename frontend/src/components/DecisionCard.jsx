import React from 'react';

function DecisionCard({ recommendation, onApprove, onOverride }) {
  if (!recommendation) {
    return (
      <div className="bg-white rounded-lg shadow-lg p-8 text-center">
        <div className="text-gray-400">No recommendation available</div>
      </div>
    );
  }

  const badgeColors = {
    BUY: 'bg-green-500',
    WAIT: 'bg-yellow-500',
    SWITCH: 'bg-red-500'
  };

  const badgeColor = badgeColors[recommendation.recommendation] || 'bg-gray-500';
  const confidencePercentage = Math.round(recommendation.confidence * 100);

  return (
    <div className="bg-white rounded-lg shadow-lg p-8">
      {/* Warning Banner */}
      {recommendation.requires_human_review && (
        <div className="mb-4 p-3 bg-orange-100 border-l-4 border-orange-500 text-orange-700">
          <div className="flex items-center">
            <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
            <span className="font-medium">Human Review Required</span>
          </div>
          <div className="text-sm mt-1">{recommendation.warning_message || 'Please review before approving'}</div>
        </div>
      )}

      {/* Recommendation Badge */}
      <div className="flex items-center justify-between mb-6">
        <div className={`${badgeColor} text-white px-8 py-4 rounded-lg text-3xl font-bold`}>
          {recommendation.recommendation}
        </div>
        
        {/* Confidence Circle */}
        <div className="relative w-32 h-32">
          <svg className="transform -rotate-90 w-32 h-32">
            <circle
              cx="64"
              cy="64"
              r="56"
              stroke="#e5e7eb"
              strokeWidth="8"
              fill="none"
            />
            <circle
              cx="64"
              cy="64"
              r="56"
              stroke={badgeColor.replace('bg-', '#')}
              strokeWidth="8"
              fill="none"
              strokeDasharray={`${2 * Math.PI * 56}`}
              strokeDashoffset={`${2 * Math.PI * 56 * (1 - recommendation.confidence)}`}
              className="transition-all duration-1000"
            />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center">
              <div className="text-2xl font-bold">{confidencePercentage}%</div>
              <div className="text-xs text-gray-500">Confidence</div>
            </div>
          </div>
        </div>
      </div>

      {/* Supplier Info */}
      <div className="mb-6">
        <div className="text-sm text-gray-500">Top Supplier</div>
        <div className="text-2xl font-bold text-gray-800">{recommendation.top_supplier}</div>
        <div className="text-sm text-gray-600">IBN Score: {(recommendation.ibn_score * 100).toFixed(1)}</div>
      </div>

      {/* Signal Summary */}
      <div className="mb-6 p-4 bg-gray-50 rounded-lg">
        <div className="text-sm font-medium text-gray-700 mb-2">Analysis Summary</div>
        <div className="text-sm text-gray-600">{recommendation.reason}</div>
        {recommendation.signal_summary && (
          <div className="text-xs text-gray-500 mt-2">{recommendation.signal_summary}</div>
        )}
      </div>

      {/* Action Buttons */}
      <div className="flex space-x-4">
        <button
          onClick={onApprove}
          disabled={!recommendation.can_approve}
          className={`flex-1 py-3 px-6 rounded-lg font-medium ${
            recommendation.can_approve
              ? 'bg-blue-600 text-white hover:bg-blue-700'
              : 'bg-gray-300 text-gray-500 cursor-not-allowed'
          }`}
        >
          APPROVE
        </button>
        <button
          onClick={onOverride}
          className="flex-1 py-3 px-6 rounded-lg font-medium bg-gray-600 text-white hover:bg-gray-700"
        >
          OVERRIDE
        </button>
      </div>

      {/* Metadata */}
      <div className="mt-4 text-xs text-gray-400 text-center">
        Generated at {recommendation.generated_at}
      </div>
    </div>
  );
}

export default DecisionCard;
