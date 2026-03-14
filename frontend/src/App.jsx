import { useState } from 'react';
import Dashboard from './pages/Dashboard';
import ArchitectureDashboard from './pages/ArchitectureDashboard';
import PipelineDemo from './pages/PipelineDemo';
import DataSourcesDemo from './pages/DataSourcesDemo';
import History from './pages/History';
import Settings from './pages/Settings';

function App() {
  const [currentPage, setCurrentPage] = useState('pipeline-demo');

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top Navbar */}
      <nav className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold text-blue-600">ProcureIQ</h1>
              <span className="ml-3 text-sm text-gray-500">Natural Rubber Procurement Intelligence</span>
            </div>
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setCurrentPage('pipeline-demo')}
                className={`px-4 py-2 rounded-md ${
                  currentPage === 'pipeline-demo'
                    ? 'bg-blue-100 text-blue-700'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                🔬 Live Demo
              </button>
              <button
                onClick={() => setCurrentPage('data-sources')}
                className={`px-4 py-2 rounded-md ${
                  currentPage === 'data-sources'
                    ? 'bg-blue-100 text-blue-700'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                📡 Data Sources
              </button>
              <button
                onClick={() => setCurrentPage('architecture')}
                className={`px-4 py-2 rounded-md ${
                  currentPage === 'architecture'
                    ? 'bg-blue-100 text-blue-700'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                Architecture
              </button>
              <button
                onClick={() => setCurrentPage('dashboard')}
                className={`px-4 py-2 rounded-md ${
                  currentPage === 'dashboard'
                    ? 'bg-blue-100 text-blue-700'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                📊 Dashboard
              </button>
              <button
                onClick={() => setCurrentPage('history')}
                className={`px-4 py-2 rounded-md ${
                  currentPage === 'history'
                    ? 'bg-blue-100 text-blue-700'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                History
              </button>
              <button
                onClick={() => setCurrentPage('settings')}
                className={`px-4 py-2 rounded-md ${
                  currentPage === 'settings'
                    ? 'bg-blue-100 text-blue-700'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                Settings
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Page Content */}
      <main>
        {currentPage === 'pipeline-demo' && <PipelineDemo />}
        {currentPage === 'data-sources' && <DataSourcesDemo />}
        {currentPage === 'architecture' && <ArchitectureDashboard />}
        {currentPage === 'dashboard' && <Dashboard />}
        {currentPage === 'history' && <History />}
        {currentPage === 'settings' && <Settings />}
      </main>
    </div>
  );
}

export default App;
