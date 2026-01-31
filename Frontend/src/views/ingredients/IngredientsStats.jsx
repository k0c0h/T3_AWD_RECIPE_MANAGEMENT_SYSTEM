import React from 'react';

const IngredientsStats = ({ totalProducts, totalValue, totalCategories }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
      <div className="rounded-lg p-4 shadow-sm" style={{ backgroundColor: '#adc4bc' }}>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-white/80">Total Productos</p>
            <p className="text-2xl font-bold text-white mt-1">{totalProducts}</p>
          </div>
        </div>
      </div>
      
      <div className="rounded-lg p-4 shadow-sm" style={{ backgroundColor: '#e7c78a' }}>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-700">Valor Inventario</p>
            <p className="text-2xl font-bold text-gray-800 mt-1">
              ${totalValue.toFixed(2)}
            </p>
          </div>
        </div>
      </div>

      <div className="rounded-lg p-4 shadow-sm" style={{ backgroundColor: '#c8d0d2' }}>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-white/80">Categorías</p>
            <p className="text-2xl font-bold text-white mt-1">{totalCategories}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default IngredientsStats;