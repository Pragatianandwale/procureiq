import React, { useState, useEffect } from 'react';
import { api } from '../api';

function SignalFeed() {
  const [signals, setSignals] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadSignals();
    const interval = setInterval(loadSignals, 60000); // Refresh every minute
    return () => clearInterval(interval);
  }, []);

  const loadSignals = async () => {
    try {
      const data = await api.getSignals();
      setSignals(data.signals || []);
      setLoading(false);
    } catch (error) {
      console.error('Error loading signals:', error);
      setLoading(false);
    }
  };

  const getLanguageFlag = (lang) => {
    const flags = {
      en: '🇬🇧',
      th: '🇹🇭',
      vi: '🇻🇳',
      hi: '🇮🇳',
      id: '🇮🇩'
    };
    return flags[lang] || '🌐';
  };

  const getSentimentDot = (sentiment) => {
    const colors = {
      positive: 'bg-green-500',
      negative: 'bg-red-500',
      neutral: 'bg-gray-400'
    };
    return colors[sentiment] || 'bg-gray-400';
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold mb-4">Signal Feed</h3>
        <div className="text-center text-gray-400">Loading signals...</div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow h-full flex flex-col">
      <div className="px-6 py-4 border-b border-gray-200">
        <h3 className="text-lg font-semibold text-gray-800">Live Signal Feed</h3>
        <div className="text-xs text-gray-500 mt-1">Real-time commodity intelligence</div>
      </div>
      
      <div className="flex-1 overflow-y-auto p-4 space-y-3" style={{ maxHeight: '600px' }}>
        {signals.length === 0 ? (
          <div className="text-center text-gray-400 py-8">No signals available</div>
        ) : (
          signals.map((signal, index) => (
            <div key={index} className="border border-gray-200 rounded-lg p-3 hover:bg-gray-50 transition">
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center space-x-2">
                  <span className="text-xl">{getLanguageFlag(signal.language)}</span>
                  <span className="text-xs text-gray-500">{signal.source}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className={`w-2 h-2 rounded-full ${getSentimentDot(signal.sentiment)}`}></div>
                  <span className="text-xs text-gray-400">{signal.timestamp}</span>
                </div>
              </div>
              <div className="text-sm font-medium text-gray-800 mb-1">{signal.title}</div>
              <div className="text-xs text-gray-600">{signal.summary}</div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default SignalFeed;
