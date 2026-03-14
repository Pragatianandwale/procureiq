import React from 'react';

function DecisionLayerBox({ recommendation, onApprove, onOverride }) {
  const currentDecision = recommendation?.recommendation || 'WAIT';

  const buttons = [
    { label: 'BUY', color: 'bg-green-500', activeColor: 'bg-green-600', value: 'BUY' },
    { label: 'WAIT', color: 'bg-yellow-500', activeColor: 'bg-yellow-600', value: 'WAIT' },
    { label: 'SWITCH', color: 'bg-red-500', activeColor: 'bg-red-600', value: 'SWITCH' }
  ];

  return (
    <div className="bg-orange-500 rounded-lg shadow-lg p-6">
      <h3 className="text-sm font-bold text-white mb-4 text-center uppercase tracking-wide">
        Decision Layer
      </h3>

      {/* Decision Buttons */}
      <div className="flex space-x-3 mb-6">
        {buttons.map((btn) => {
          const isActive = currentDecision === btn.value;
          return (
            <button
              key={btn.value}
              className={`flex-1 py-4 rounded-lg font-bold text-white text-lg transition-all ${
                isActive 
                  ? `${btn.activeColor} shadow-lg ring-4 ring-white` 
                  : `${btn.color} opacity-60`
              }`}
            >
              {btn.label}
            </button>
          );
        })}
      </div>

      {/* Manager Icons */}
      <div className="flex items-center justify-center space-x-6 mb-4">
        <div className="flex flex-col items-center">
          <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center text-xl">
            👤
          </div>
          <div className="text-xs text-white mt-1">Manager</div>
        </div>
        
        <div className="flex flex-col items-center">
          <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center text-xl">
            📊
          </div>
          <div className="text-xs text-white mt-1">Dashboard</div>
        </div>
        
        <div className="flex flex-col items-center">
          <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center text-xl">
            🏢
          </div>
          <div className="text-xs text-white mt-1">SAP</div>
        </div>
      </div>

      {/* Auto Draft PO Section */}
      <div className="border-2 border-dashed border-white rounded-lg p-4 bg-orange-400">
        <h4 className="text-xs font-bold text-white mb-3 uppercase">
          Auto Draft Purchase Order
        </h4>
        
        <div className="space-y-2 text-white text-sm">
          <div className="flex justify-between">
            <span className="text-orange-100">Vendor:</span>
            <span className="font-medium">{recommendation?.top_supplier || 'N/A'}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-orange-100">Material:</span>
            <span className="font-medium">RSS2 Natural Rubber</span>
          </div>
          <div className="flex justify-between">
            <span className="text-orange-100">Quantity:</span>
            <span className="font-medium">500 MT</span>
          </div>
          <div className="flex justify-between">
            <span className="text-orange-100">Price Basis:</span>
            <span className="font-medium text-xs">Bangkok Exchange + 2%</span>
          </div>
        </div>

        <div className="flex space-x-2 mt-4">
          <button
            onClick={onApprove}
            className="flex-1 py-2 bg-green-500 hover:bg-green-600 text-white font-bold rounded-lg transition"
          >
            APPROVE
          </button>
          <button
            onClick={onOverride}
            className="flex-1 py-2 bg-gray-600 hover:bg-gray-700 text-white font-bold rounded-lg transition"
          >
            OVERRIDE
          </button>
        </div>
      </div>
    </div>
  );
}

export default DecisionLayerBox;
