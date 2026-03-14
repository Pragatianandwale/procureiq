import React from 'react';

function FeedbackLoops() {
  return (
    <div className="grid grid-cols-2 gap-4">
      {/* SGDRegressor Online Learning */}
      <div className="bg-white rounded-lg shadow-lg p-4">
        <div className="flex items-center space-x-3 mb-3">
          <span className="text-2xl">🧠</span>
          <div>
            <h4 className="text-sm font-bold text-gray-700">SGDRegressor Online Learning</h4>
            <div className="text-xs text-gray-500">Continuous Model Updates</div>
          </div>
        </div>
        
        <div className="space-y-2 text-xs">
          <div className="flex justify-between">
            <span className="text-gray-600">Last Updated:</span>
            <span className="font-medium text-gray-800">2 hours ago</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Overrides This Week:</span>
            <span className="font-medium text-blue-600">3</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Training Examples:</span>
            <span className="font-medium text-green-600">127</span>
          </div>
        </div>

        {/* Animated arrow indicator */}
        <div className="mt-3 flex items-center justify-center">
          <div className="text-blue-500 animate-pulse">
            ↑ Feeding back to AI
          </div>
        </div>
      </div>

      {/* Model Feedback and Learning */}
      <div className="bg-white rounded-lg shadow-lg p-4">
        <div className="flex items-center space-x-3 mb-3">
          <span className="text-2xl">🔄</span>
          <div>
            <h4 className="text-sm font-bold text-gray-700">Model Feedback & Learning</h4>
            <div className="text-xs text-gray-500">Decision Loop</div>
          </div>
        </div>
        
        <div className="space-y-2 text-xs">
          <div className="flex justify-between">
            <span className="text-gray-600">Feedback Entries Today:</span>
            <span className="font-medium text-gray-800">5</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Accuracy Improvement:</span>
            <span className="font-medium text-green-600">+2.3%</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Loop Status:</span>
            <span className="font-medium text-green-600">Active</span>
          </div>
        </div>

        {/* Animated arrow indicator */}
        <div className="mt-3 flex items-center justify-center">
          <div className="text-purple-500 animate-pulse">
            ← Learning from decisions
          </div>
        </div>
      </div>
    </div>
  );
}

export default FeedbackLoops;
