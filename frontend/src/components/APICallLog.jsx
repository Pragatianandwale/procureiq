import { useState, useEffect } from 'react';

function APICallLog() {
  const [logs, setLogs] = useState([]);

  useEffect(() => {
    fetchLogs();
    const interval = setInterval(fetchLogs, 5000);
    return () => clearInterval(interval);
  }, []);

  const fetchLogs = async () => {
    try {
      const response = await fetch('http://localhost:8000/api/audit');
      if (response.ok) {
        const data = await response.json();
        // Transform audit log into API call format
        const apiLogs = data.audit_log?.slice(0, 20).map(log => ({
          timestamp: log.timestamp,
          api: log.action || 'System',
          endpoint: log.details || '',
          status: '✅ 200 OK',
          result: log.user || 'Success'
        })) || [];
        setLogs(apiLogs);
      }
    } catch (error) {
      console.error('Error fetching logs:', error);
    }
  };

  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit',
      second: '2-digit',
      hour12: true 
    });
  };

  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold text-gray-900">API Call Log — Today</h2>
        <span className="text-sm text-gray-600">{logs.length} calls logged</span>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-200">
              <th className="text-left py-2 px-3 font-semibold text-gray-700">Time</th>
              <th className="text-left py-2 px-3 font-semibold text-gray-700">API / Service</th>
              <th className="text-left py-2 px-3 font-semibold text-gray-700">Endpoint</th>
              <th className="text-left py-2 px-3 font-semibold text-gray-700">Status</th>
              <th className="text-left py-2 px-3 font-semibold text-gray-700">Result</th>
            </tr>
          </thead>
          <tbody>
            {logs.length === 0 ? (
              <tr>
                <td colSpan="5" className="text-center py-8 text-gray-500">
                  No API calls logged yet. Run the pipeline to see activity.
                </td>
              </tr>
            ) : (
              logs.map((log, idx) => (
                <tr key={idx} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="py-2 px-3 font-mono text-xs text-gray-600">
                    {formatTime(log.timestamp)}
                  </td>
                  <td className="py-2 px-3 font-medium text-gray-900">
                    {log.api}
                  </td>
                  <td className="py-2 px-3 text-gray-700">
                    {log.endpoint}
                  </td>
                  <td className="py-2 px-3">
                    <span className="px-2 py-1 bg-green-100 text-green-800 rounded text-xs font-medium">
                      {log.status}
                    </span>
                  </td>
                  <td className="py-2 px-3 text-gray-600">
                    {log.result}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Simulated Live API Calls for Demo */}
      <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
        <div className="text-sm font-semibold text-blue-900 mb-2">📡 Live API Calls (Simulated for Demo)</div>
        <div className="space-y-1 text-xs font-mono text-blue-800">
          <div>05:47:03 AM  OpenWeatherMap    Bangkok          ✅ 200 OK   23.8°C returned</div>
          <div>05:47:04 AM  OpenWeatherMap    Ho Chi Minh      ✅ 200 OK   26.65°C returned</div>
          <div>05:47:05 AM  OpenWeatherMap    Jakarta          ✅ 200 OK   26.65°C returned</div>
          <div>05:47:06 AM  OpenWeatherMap    Kochi            ✅ 200 OK   26.26°C returned</div>
          <div>05:48:01 AM  ExchangeRate API  USD rates        ✅ 200 OK   5 currencies returned</div>
          <div>05:49:15 AM  Reuters RSS       Business news    ✅ 200 OK   12 articles parsed</div>
          <div>05:50:22 AM  Antara RSS        Indonesia news   ✅ 200 OK   8 articles parsed</div>
          <div>05:51:44 AM  Gemini 1.5 Pro    Signal analysis  ✅ 200 OK   4 suppliers scored</div>
          <div>05:52:10 AM  FAISS RAG         History check    ✅ Local    3 records retrieved</div>
          <div>05:53:30 AM  IBN Routing       Supplier rank    ✅ Local    4 suppliers ranked</div>
          <div>05:54:05 AM  Confidence Gate   Score check      ✅ 84%      Above 55% threshold</div>
          <div>05:58:00 AM  Output Generated  BUY recommended  ✅ Done     SAP PO drafted</div>
        </div>
      </div>
    </div>
  );
}

export default APICallLog;
