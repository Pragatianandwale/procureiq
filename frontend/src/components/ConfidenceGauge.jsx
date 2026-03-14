import React from 'react';

function ConfidenceGauge({ confidence = 0.76 }) {
  const percentage = Math.round(confidence * 100);
  const angle = (percentage / 100) * 180 - 90; // -90 to 90 degrees
  
  const getColor = () => {
    if (percentage < 40) return '#ef4444'; // red
    if (percentage < 55) return '#eab308'; // yellow
    return '#22c55e'; // green
  };

  const shouldPulse = percentage < 55;

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <h3 className="text-sm font-bold text-gray-700 mb-4 text-center uppercase tracking-wide">
        Confidence Gate
      </h3>
      
      <div className={`relative w-48 h-24 mx-auto ${shouldPulse ? 'animate-pulse' : ''}`}>
        {/* Background arc */}
        <svg className="w-full h-full" viewBox="0 0 200 100">
          {/* Red zone */}
          <path
            d="M 20 90 A 80 80 0 0 1 80 10"
            fill="none"
            stroke="#ef4444"
            strokeWidth="20"
            opacity="0.3"
          />
          {/* Yellow zone */}
          <path
            d="M 80 10 A 80 80 0 0 1 120 10"
            fill="none"
            stroke="#eab308"
            strokeWidth="20"
            opacity="0.3"
          />
          {/* Green zone */}
          <path
            d="M 120 10 A 80 80 0 0 1 180 90"
            fill="none"
            stroke="#22c55e"
            strokeWidth="20"
            opacity="0.3"
          />
          
          {/* Needle */}
          <line
            x1="100"
            y1="90"
            x2="100"
            y2="30"
            stroke={getColor()}
            strokeWidth="3"
            strokeLinecap="round"
            transform={`rotate(${angle} 100 90)`}
            style={{ transition: 'transform 0.5s ease-out' }}
          />
          
          {/* Center dot */}
          <circle cx="100" cy="90" r="5" fill={getColor()} />
        </svg>
        
        {/* Percentage display */}
        <div className="absolute inset-0 flex items-end justify-center pb-2">
          <div className="text-center">
            <div className="text-3xl font-bold" style={{ color: getColor() }}>
              {percentage}%
            </div>
          </div>
        </div>
      </div>
      
      <div className="text-center mt-4">
        <div className="text-xs text-gray-600">Threshold: 55%</div>
        {percentage < 55 && (
          <div className="text-xs text-red-600 font-medium mt-1">
            ⚠️ Below Threshold
          </div>
        )}
      </div>
    </div>
  );
}

export default ConfidenceGauge;
