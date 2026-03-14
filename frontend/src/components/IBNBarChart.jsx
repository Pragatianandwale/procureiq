import React, { useState } from 'react';

function IBNBarChart({ suppliers = [] }) {
  const [hoveredIndex, setHoveredIndex] = useState(null);

  if (!suppliers || suppliers.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-lg p-6">
        <div className="text-center text-gray-400">No supplier data</div>
      </div>
    );
  }

  const maxScore = Math.max(...suppliers.map(s => s.ibn_score || 0));

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <div className="flex items-center justify-center space-x-2 mb-4">
        <span className="text-2xl">⚖️</span>
        <div>
          <h3 className="text-sm font-bold text-gray-700 uppercase tracking-wide">
            Supplier Routing Engine
          </h3>
          <div className="text-xs text-gray-500">(IBN)</div>
        </div>
      </div>

      <div className="flex items-end justify-around space-x-2 h-48">
        {suppliers.slice(0, 4).map((supplier, index) => {
          const heightPercent = (supplier.ibn_score / maxScore) * 100;
          const isTop = index === 0;
          
          return (
            <div
              key={index}
              className="flex-1 flex flex-col items-center"
              onMouseEnter={() => setHoveredIndex(index)}
              onMouseLeave={() => setHoveredIndex(null)}
            >
              <div className="relative w-full">
                <div
                  className={`w-full rounded-t-lg transition-all duration-300 ${
                    isTop ? 'bg-green-500' : 'bg-gray-400'
                  } ${hoveredIndex === index ? 'opacity-100' : 'opacity-80'}`}
                  style={{ height: `${heightPercent * 1.5}px` }}
                >
                  {hoveredIndex === index && (
                    <div className="absolute -top-24 left-1/2 transform -translate-x-1/2 bg-gray-800 text-white text-xs rounded-lg p-2 whitespace-nowrap z-10">
                      <div className="font-medium mb-1">{supplier.supplier_name}</div>
                      <div>Quality: 40%</div>
                      <div>Cost: 30%</div>
                      <div>Lead Time: 20%</div>
                      <div>Carbon: 10%</div>
                      <div className="mt-1 font-bold">Score: {(supplier.ibn_score * 100).toFixed(1)}</div>
                    </div>
                  )}
                </div>
              </div>
              
              <div className="text-xs text-center mt-2 font-medium text-gray-700">
                {supplier.supplier_name.split(' ')[0]}
              </div>
              <div className="text-xs text-gray-500">
                {(supplier.ibn_score * 100).toFixed(0)}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default IBNBarChart;
