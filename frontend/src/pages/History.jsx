import { useState, useEffect } from 'react';
import { api } from '../api';

function History() {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [days, setDays] = useState(30);

  useEffect(() => {
    loadHistory();
  }, [days]);

  const loadHistory = async () => {
    setLoading(true);
    try {
      const data = await api.getHistory(days);
      setHistory(data.history || []);
    } catch (error) {
      console.error('Error loading history:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-xl text-gray-600">Loading history...</div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Decision History</h2>
        
        <div className="flex items-center space-x-2">
          <label className="text-sm text-gray-600">Show last:</label>
          <select
            value={days}
            onChange={(e) => setDays(parseInt(e.target.value))}
            className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
          >
            <option value={7}>7 days</option>
            <option value={30}>30 days</option>
            <option value={90}>90 days</option>
            <option value={365}>1 year</option>
          </select>
        </div>
      </div>

      {history.length === 0 ? (
        <div className="bg-white rounded-lg shadow p-8 text-center">
          <div className="text-gray-400 text-lg">No decision history available</div>
          <div className="text-gray-500 text-sm mt-2">
            Decisions will appear here once the pipeline runs
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          {history.map((entry, index) => (
            <div key={index} className="bg-white rounded-lg shadow p-6">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <div className="text-lg font-semibold text-gray-800">
                    {entry.supplier_name || entry.top_supplier}
                  </div>
                  <div className="text-sm text-gray-500">
                    {new Date(entry.timestamp || entry.created_at).toLocaleString()}
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                    entry.manager_decision === 'approved' || entry.status === 'approved'
                      ? 'bg-green-100 text-green-800'
                      : entry.manager_decision === 'override' || entry.status === 'override'
                      ? 'bg-yellow-100 text-yellow-800'
                      : 'bg-gray-100 text-gray-800'
                  }`}>
                    {entry.manager_decision || entry.status || 'Pending'}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                <div>
                  <div className="text-xs text-gray-500">Confidence</div>
                  <div className="text-sm font-semibold text-gray-800">
                    {((entry.confidence || entry.confidence_score || 0) * 100).toFixed(1)}%
                  </div>
                </div>
                <div>
                  <div className="text-xs text-gray-500">IBN Score</div>
                  <div className="text-sm font-semibold text-gray-800">
                    {((entry.ibn_score || 0) * 100).toFixed(1)}%
                  </div>
                </div>
                <div>
                  <div className="text-xs text-gray-500">Quality</div>
                  <div className="text-sm font-semibold text-gray-800">
                    {entry.quality_score || 'N/A'}
                  </div>
                </div>
                <div>
                  <div className="text-xs text-gray-500">Cost</div>
                  <div className="text-sm font-semibold text-gray-800">
                    ${entry.cost || 'N/A'}
                  </div>
                </div>
              </div>

              {entry.recommendation && (
                <div className="mb-3">
                  <div className="text-xs text-gray-500 mb-1">Recommendation</div>
                  <div className="text-sm text-gray-700">{entry.recommendation}</div>
                </div>
              )}

              {entry.reason && (
                <div className="mb-3">
                  <div className="text-xs text-gray-500 mb-1">Reason</div>
                  <div className="text-sm text-gray-700">{entry.reason}</div>
                </div>
              )}

              {entry.outcome && (
                <div>
                  <div className="text-xs text-gray-500 mb-1">Outcome</div>
                  <div className="text-sm text-gray-700">{entry.outcome}</div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default History;