import React, { useState, useEffect } from 'react';

function DataSourcesPanel() {
  const [sources, setSources] = useState([
    { icon: '☁️', name: 'Weather API', status: 'offline', lastUpdated: 'N/A' },
    { icon: '💱', name: 'Exchange Rates', status: 'live', lastUpdated: '2 min ago' },
    { icon: '📰', name: 'News Feeds', status: 'live', lastUpdated: '5 min ago' },
    { icon: '🌿', name: 'Plantation Data', status: 'live', lastUpdated: '1 min ago' },
    { icon: '🗄️', name: 'Harrisons Malayalam', status: 'live', lastUpdated: 'Just now' }
  ]);

  return (
    <div className="bg-white rounded-lg shadow-lg p-4 h-full">
      <h3 className="text-sm font-bold text-gray-700 mb-4 uppercase tracking-wide">
        External Data Sources
      </h3>
      <div className="space-y-3">
        {sources.map((source, index) => (
          <div key={index} className="flex items-start space-x-3 p-3 rounded-lg hover:bg-gray-50 transition">
            <div className="text-2xl">{source.icon}</div>
            <div className="flex-1">
              <div className="flex items-center space-x-2">
                <span className="text-sm font-medium text-gray-800">{source.name}</span>
                <div className={`w-2 h-2 rounded-full ${
                  source.status === 'live' ? 'bg-green-500' : 'bg-gray-400'
                }`}></div>
              </div>
              <div className="text-xs text-gray-500 mt-1">
                Last: {source.lastUpdated}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default DataSourcesPanel;
