import React from 'react';

function AIProcessingBox() {
  const processes = [
    { 
      icon: '🔍', 
      label: 'NER', 
      fullName: 'Named Entity Recognition',
      status: 'Active',
      color: 'text-blue-600'
    },
    { 
      icon: '🔷', 
      label: 'RAG', 
      fullName: 'Retrieval Augmented Generation',
      status: 'Processing',
      color: 'text-purple-600'
    },
    { 
      icon: '🗄️', 
      label: 'Vector DB', 
      fullName: 'FAISS Index',
      status: 'Active',
      color: 'text-green-600',
      records: '1,247'
    }
  ];

  return (
    <div className="border-2 border-dashed border-green-500 rounded-lg p-4 bg-green-50">
      <h3 className="text-sm font-bold text-green-700 mb-4 uppercase tracking-wide">
        AI Processing Pipeline
      </h3>
      <div className="space-y-3">
        {processes.map((process, index) => (
          <div key={index} className="bg-white rounded-lg p-3 shadow-sm">
            <div className="flex items-center space-x-3">
              <div className="text-2xl">{process.icon}</div>
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <div>
                    <div className={`text-sm font-bold ${process.color}`}>
                      {process.label}
                    </div>
                    <div className="text-xs text-gray-600">{process.fullName}</div>
                  </div>
                  <div className="text-right">
                    <div className="text-xs font-medium text-gray-700">{process.status}</div>
                    {process.records && (
                      <div className="text-xs text-gray-500">{process.records} records</div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default AIProcessingBox;
