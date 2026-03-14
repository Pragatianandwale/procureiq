import { useState, useEffect } from 'react';

function LiveDataBadges() {
  const [liveData, setLiveData] = useState(null);
  const [lastFetch, setLastFetch] = useState(null);

  useEffect(() => {
    fetchLiveStatus();
    const interval = setInterval(fetchLiveStatus, 10000); // Update every 10s
    return () => clearInterval(interval);
  }, []);

  const fetchLiveStatus = async () => {
    try {
      const response = await fetch('http://localhost:8000/api/data-sources/live');
      if (response.ok) {
        const data = await response.json();
        setLiveData(data);
        setLastFetch(new Date());
      }
    } catch (error) {
      console.error('Error fetching live status:', error);
    }
  };

  if (!liveData) return null;

  const weatherData = liveData.filter(d => d.type === 'weather_data');
  const exchangeData = liveData.find(d => d.type === 'exchange_rates');
  const newsData = liveData.filter(d => d.type === 'rss_feed');
  const harrisonsData = liveData.filter(d => d.type === 'internal_harvest');

  const formatTime = (date) => {
    return date.toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: true 
    });
  };

  return (
    <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold text-gray-900">Live Data Sources</h2>
        <div className="flex items-center space-x-2">
          <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
          <span className="text-sm font-medium text-green-700">ALL SYSTEMS LIVE</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Weather */}
        <div className="p-4 bg-blue-50 rounded-lg border-2 border-blue-200">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center space-x-2">
              <span className="text-2xl">☁️</span>
              <span className="font-semibold text-blue-900">Weather API</span>
            </div>
            <span className="px-2 py-1 bg-green-500 text-white text-xs font-bold rounded-full">
              🟢 LIVE
            </span>
          </div>
          <div className="text-xs text-blue-700">
            {weatherData.length} locations
          </div>
          <div className="text-xs text-blue-600 mt-1">
            Last: {lastFetch ? formatTime(lastFetch) : '--'}
          </div>
        </div>

        {/* Exchange Rates */}
        <div className="p-4 bg-green-50 rounded-lg border-2 border-green-200">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center space-x-2">
              <span className="text-2xl">💱</span>
              <span className="font-semibold text-green-900">Exchange Rates</span>
            </div>
            <span className="px-2 py-1 bg-green-500 text-white text-xs font-bold rounded-full">
              🟢 LIVE
            </span>
          </div>
          <div className="text-xs text-green-700">
            {exchangeData ? Object.keys(exchangeData.data?.rates || {}).length : 0} currencies
          </div>
          <div className="text-xs text-green-600 mt-1">
            Last: {lastFetch ? formatTime(lastFetch) : '--'}
          </div>
        </div>

        {/* News Feeds */}
        <div className="p-4 bg-orange-50 rounded-lg border-2 border-orange-200">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center space-x-2">
              <span className="text-2xl">📰</span>
              <span className="font-semibold text-orange-900">News Feeds</span>
            </div>
            <span className="px-2 py-1 bg-green-500 text-white text-xs font-bold rounded-full">
              🟢 LIVE
            </span>
          </div>
          <div className="text-xs text-orange-700">
            {newsData.length} articles
          </div>
          <div className="text-xs text-orange-600 mt-1">
            Last: {lastFetch ? formatTime(lastFetch) : '--'}
          </div>
        </div>

        {/* Harrisons */}
        <div className="p-4 bg-emerald-50 rounded-lg border-2 border-emerald-200">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center space-x-2">
              <span className="text-2xl">🌿</span>
              <span className="font-semibold text-emerald-900">Harrisons Data</span>
            </div>
            <span className="px-2 py-1 bg-green-500 text-white text-xs font-bold rounded-full">
              🟢 LIVE
            </span>
          </div>
          <div className="text-xs text-emerald-700">
            {harrisonsData.length} harvest records
          </div>
          <div className="text-xs text-emerald-600 mt-1">
            Last: {lastFetch ? formatTime(lastFetch) : '--'}
          </div>
        </div>
      </div>

      {/* Live Weather Display */}
      {weatherData.length > 0 && (
        <div className="mt-6 pt-6 border-t border-gray-200">
          <h3 className="text-sm font-bold text-gray-900 mb-3">Current Weather (Rubber Plantation Zones)</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {weatherData.map((weather, idx) => {
              const temp = weather.data?.temperature;
              const humidity = weather.data?.humidity;
              const desc = weather.data?.description;
              const location = weather.data?.location;
              
              // Determine condition
              let condition = '✅ Normal harvest conditions';
              let conditionColor = 'text-green-700';
              
              if (humidity > 90 || desc?.includes('rain')) {
                condition = '⚠️ Heavy rain — harvest risk';
                conditionColor = 'text-orange-700';
              } else if (humidity > 80 && temp > 25) {
                condition = '✅ Optimal for rubber tapping';
                conditionColor = 'text-green-700';
              }
              
              // Weather app link
              const weatherLink = `https://openweathermap.org/city/${location}`;
              
              return (
                <a
                  key={idx}
                  href={weatherLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-3 bg-gray-50 rounded-lg border border-gray-200 hover:border-blue-400 hover:shadow-md transition-all cursor-pointer"
                >
                  <div className="font-semibold text-gray-900 text-sm mb-1">{location}</div>
                  <div className="text-2xl font-bold text-blue-600">{temp}°C</div>
                  <div className="text-xs text-gray-600">Humidity {humidity}%</div>
                  <div className={`text-xs mt-2 font-medium ${conditionColor}`}>
                    {condition}
                  </div>
                  <div className="text-xs text-blue-600 mt-1">Click to verify →</div>
                </a>
              );
            })}
          </div>
        </div>
      )}

      {/* Live Exchange Rates */}
      {exchangeData && (
        <div className="mt-6 pt-6 border-t border-gray-200">
          <h3 className="text-sm font-bold text-gray-900 mb-3">Live Currency Exchange Rates (USD Base)</h3>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
            {Object.entries(exchangeData.data?.rates || {}).map(([currency, rate]) => (
              <a
                key={currency}
                href={`https://www.google.com/search?q=USD+to+${currency}`}
                target="_blank"
                rel="noopener noreferrer"
                className="p-3 bg-gray-50 rounded-lg border border-gray-200 hover:border-green-400 hover:shadow-md transition-all cursor-pointer"
              >
                <div className="text-xs text-gray-600">USD/{currency}</div>
                <div className="text-lg font-bold text-gray-900">{rate.toFixed(2)}</div>
                <div className="text-xs text-green-600 mt-1">Verify on Google →</div>
              </a>
            ))}
          </div>
          <div className="mt-2 text-xs text-gray-500">
            Updated: {exchangeData.data?.timestamp}
          </div>
        </div>
      )}

      {/* Live News Articles */}
      {newsData.length > 0 && (
        <div className="mt-6 pt-6 border-t border-gray-200">
          <h3 className="text-sm font-bold text-gray-900 mb-3">Latest News Articles (RSS Feeds)</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {newsData.slice(0, 6).map((news, idx) => {
              const title = news.data?.title || news.summary || 'News Article';
              const source = news.data?.source || news.source || 'Unknown Source';
              // Try to extract URL from data or create a search link
              const articleUrl = news.data?.link || `https://www.google.com/search?q=${encodeURIComponent(title)}`;
              
              return (
                <a
                  key={idx}
                  href={articleUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-3 bg-gray-50 rounded-lg border border-gray-200 hover:border-orange-400 hover:shadow-md transition-all cursor-pointer"
                >
                  <div className="text-xs text-orange-600 font-medium mb-1">{source}</div>
                  <div className="text-sm font-semibold text-gray-900 line-clamp-2 mb-2">
                    {title}
                  </div>
                  <div className="text-xs text-orange-600">Read article →</div>
                </a>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

export default LiveDataBadges;
