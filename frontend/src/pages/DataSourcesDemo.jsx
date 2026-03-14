import { useState, useEffect } from 'react';
import { api } from '../api';

function DataSourcesDemo() {
  const [loading, setLoading] = useState(false);
  const [sources, setSources] = useState(null);
  const [lastFetch, setLastFetch] = useState(null);

  const fetchLiveData = async () => {
    setLoading(true);
    try {
      const response = await fetch('http://localhost:8000/api/data-sources/live');
      if (response.ok) {
        const data = await response.json();
        setSources(data);
        setLastFetch(new Date().toLocaleTimeString());
      }
    } catch (error) {
      console.error('Error fetching live data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLiveData();
  }, []);

  const getSourceIcon = (type) => {
    const icons = {
      weather_data: '🌤️',
      exchange_rates: '💱',
      price_index: '📊',
      rss_feed: '📰',
      internal_harvest: '🌿',
      broker_data: '🔒'
    };
    return icons[type] || '📡';
  };

  const getSourceColor = (type) => {
    const colors = {
      weather_data: 'bg-blue-50 border-blue-200',
      exchange_rates: 'bg-green-50 border-green-200',
      price_index: 'bg-purple-50 border-purple-200',
      rss_feed: 'bg-orange-50 border-orange-200',
      internal_harvest: 'bg-emerald-50 border-emerald-200',
      broker_data: 'bg-red-50 border-red-200'
    };
    return colors[type] || 'bg-gray-50 border-gray-200';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-8">
      <div className="max-w-7xl mx-auto px-6">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Live Data Sources</h1>
          <p className="text-gray-600 mt-2">
            Real-time data ingestion from 6 different sources
          </p>
        </div>

        {/* Refresh Button */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold text-gray-900">Data Ingestion Status</h2>
              {lastFetch && (
                <p className="text-sm text-gray-600 mt-1">
                  Last fetched: {lastFetch}
                </p>
              )}
            </div>
            <button
              onClick={fetchLiveData}
              disabled={loading}
              className={`px-6 py-3 rounded-lg font-bold text-white ${
                loading
                  ? 'bg-gray-400 cursor-not-allowed'
                  : 'bg-blue-600 hover:bg-blue-700'
              }`}
            >
              {loading ? '🔄 Fetching...' : '🔄 Refresh Live Data'}
            </button>
          </div>
        </div>

        {/* Data Sources Grid */}
        {sources && (
          <div className="grid grid-cols-1 gap-6">
            {/* Summary Stats */}
            <div className="grid grid-cols-2 md:grid-cols-6 gap-4 mb-4">
              <div className="bg-blue-100 rounded-lg p-4 text-center">
                <div className="text-3xl mb-1">🌤️</div>
                <div className="text-2xl font-bold text-blue-900">
                  {sources.filter(s => s.type === 'weather_data').length}
                </div>
                <div className="text-xs text-blue-700">Weather</div>
              </div>
              <div className="bg-green-100 rounded-lg p-4 text-center">
                <div className="text-3xl mb-1">💱</div>
                <div className="text-2xl font-bold text-green-900">
                  {sources.filter(s => s.type === 'exchange_rates').length}
                </div>
                <div className="text-xs text-green-700">Exchange</div>
              </div>
              <div className="bg-purple-100 rounded-lg p-4 text-center">
                <div className="text-3xl mb-1">📊</div>
                <div className="text-2xl font-bold text-purple-900">
                  {sources.filter(s => s.type === 'price_index').length}
                </div>
                <div className="text-xs text-purple-700">Price Index</div>
              </div>
              <div className="bg-orange-100 rounded-lg p-4 text-center">
                <div className="text-3xl mb-1">📰</div>
                <div className="text-2xl font-bold text-orange-900">
                  {sources.filter(s => s.type === 'rss_feed').length}
                </div>
                <div className="text-xs text-orange-700">News Feeds</div>
              </div>
              <div className="bg-emerald-100 rounded-lg p-4 text-center">
                <div className="text-3xl mb-1">🌿</div>
                <div className="text-2xl font-bold text-emerald-900">
                  {sources.filter(s => s.type === 'internal_harvest').length}
                </div>
                <div className="text-xs text-emerald-700">Harrisons</div>
              </div>
              <div className="bg-gray-100 rounded-lg p-4 text-center">
                <div className="text-3xl mb-1">📡</div>
                <div className="text-2xl font-bold text-gray-900">
                  {sources.length}
                </div>
                <div className="text-xs text-gray-700">Total Signals</div>
              </div>
            </div>

            {/* Individual Source Cards */}
            {sources.map((source, idx) => {
              const isNewsArticle = source.type === 'rss_feed';
              const articleLink = source.data?.link || `https://www.google.com/search?q=${encodeURIComponent(source.title)}`;
              
              const CardWrapper = isNewsArticle ? 'a' : 'div';
              const cardProps = isNewsArticle ? {
                href: articleLink,
                target: '_blank',
                rel: 'noopener noreferrer',
                className: `rounded-xl shadow-lg p-6 border-2 ${getSourceColor(source.type)} hover:shadow-2xl transition-all cursor-pointer`
              } : {
                className: `rounded-xl shadow-lg p-6 border-2 ${getSourceColor(source.type)}`
              };
              
              return (
                <CardWrapper key={idx} {...cardProps}>
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      <div className="text-4xl">{getSourceIcon(source.type)}</div>
                      <div>
                        <h3 className="text-lg font-bold text-gray-900">{source.title}</h3>
                        <p className="text-sm text-gray-600">{source.source}</p>
                      </div>
                    </div>
                    <div className="flex flex-col items-end">
                      <span className="px-3 py-1 bg-white rounded-full text-xs font-medium text-gray-700 border border-gray-300">
                        {source.type.replace('_', ' ').toUpperCase()}
                      </span>
                      {source.is_internal && (
                        <span className="mt-2 px-3 py-1 bg-red-100 text-red-800 rounded-full text-xs font-medium">
                          🔒 Internal Only
                        </span>
                      )}
                      {isNewsArticle && (
                        <span className="mt-2 px-3 py-1 bg-orange-100 text-orange-800 rounded-full text-xs font-medium">
                          📰 Click to read
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="mb-4">
                    <p className="text-gray-800">{source.summary}</p>
                  </div>

                  {/* Additional Data */}
                  {source.data && (
                    <div className="mt-4 p-4 bg-white rounded-lg border border-gray-200">
                      <div className="text-xs font-semibold text-gray-700 mb-2">Raw Data:</div>
                      <pre className="text-xs text-gray-600 overflow-x-auto">
                        {JSON.stringify(source.data, null, 2)}
                      </pre>
                    </div>
                  )}

                  <div className="mt-4 flex items-center justify-between text-xs text-gray-500">
                    <span>Language: {source.language.toUpperCase()}</span>
                    <span>Published: {new Date(source.published).toLocaleString()}</span>
                  </div>
                </CardWrapper>
              );
            })}
          </div>
        )}

        {!sources && !loading && (
          <div className="bg-white rounded-xl shadow-lg p-12 text-center">
            <div className="text-6xl mb-4">📡</div>
            <p className="text-gray-600">Click "Refresh Live Data" to fetch from all sources</p>
          </div>
        )}

        {loading && (
          <div className="bg-white rounded-xl shadow-lg p-12 text-center">
            <div className="text-6xl mb-4 animate-pulse">🔄</div>
            <p className="text-gray-600">Fetching live data from all sources...</p>
          </div>
        )}

        {/* API Info */}
        <div className="mt-8 bg-white rounded-xl shadow-lg p-6">
          <h3 className="text-xl font-bold text-gray-900 mb-4">Connected APIs</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 bg-blue-50 rounded-lg">
              <div className="font-semibold text-blue-900 mb-2">🌤️ OpenWeatherMap</div>
              <div className="text-sm text-blue-700">
                Live weather data from Bangkok, Ho Chi Minh, Jakarta, Kochi
              </div>
            </div>
            <div className="p-4 bg-green-50 rounded-lg">
              <div className="font-semibold text-green-900 mb-2">💱 ExchangeRate-API</div>
              <div className="text-sm text-green-700">
                Real-time currency rates: THB, VND, IDR, INR, SGD
              </div>
            </div>
            <div className="p-4 bg-purple-50 rounded-lg">
              <div className="font-semibold text-purple-900 mb-2">📊 World Bank</div>
              <div className="text-sm text-purple-700">
                Global rubber price index (PNRUBBUSGM indicator)
              </div>
            </div>
            <div className="p-4 bg-orange-50 rounded-lg">
              <div className="font-semibold text-orange-900 mb-2">📰 RSS Feeds</div>
              <div className="text-sm text-orange-700">
                Thai News, Antara (Indonesia), Vietnam News, Economic Times, Reuters
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default DataSourcesDemo;
