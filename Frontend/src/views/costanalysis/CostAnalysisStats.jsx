import React from 'react';

const CostAnalysisStats = ({
  totalAnalyses = 0,
  totalProductCost = 0,
  averageCost = 0
}) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
      
      <div className="rounded-lg p-4 shadow-sm" style={{ backgroundColor: '#adc4bc' }}>
        <p className="text-sm font-medium text-white/80">Total Análisis</p>
        <p className="text-2xl font-bold text-white mt-1">
          {totalAnalyses}
        </p>
      </div>

      <div className="rounded-lg p-4 shadow-sm" style={{ backgroundColor: '#e7c78a' }}>
        <p className="text-sm font-medium text-gray-700">Costo Total</p>
        <p className="text-2xl font-bold text-gray-800 mt-1">
          ${(Number(totalProductCost) || 0).toFixed(2)}
        </p>
      </div>

      <div className="rounded-lg p-4 shadow-sm" style={{ backgroundColor: '#c8d0d2' }}>
        <p className="text-sm font-medium text-white/80">Costo Promedio</p>
        <p className="text-2xl font-bold text-white mt-1">
          ${(Number(averageCost) || 0).toFixed(2)}
        </p>
      </div>

    </div>
  );
};

export default CostAnalysisStats;
