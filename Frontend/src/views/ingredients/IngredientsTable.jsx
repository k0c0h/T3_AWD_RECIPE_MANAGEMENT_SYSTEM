import React from 'react';

const IngredientsTable = ({ 
  ingredients, 
  onEdit, 
  onArchive, 
  onRestore, 
  viewMode,
  currentPage,
  totalItems,
  itemsPerPage,
  onPageChange
}) => {

  const getCategoryStyle = (category) => {
    return { bg: '#E8D5C7', text: '#6b4e2a' };
  };

  const startItem = (currentPage - 1) * itemsPerPage + 1;
  const endItem = Math.min(currentPage * itemsPerPage, totalItems);

  return (
    <div className="bg-white rounded-lg shadow-sm overflow-hidden border" style={{ borderColor: "#e5dfd8" }}>
      {/* Vista móvil - Cards */}
      <div className="block md:hidden">
        {ingredients.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            No se encontraron ingredientes
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {ingredients.map((ingredient) => {
              const categoryStyle = getCategoryStyle(ingredient.category);
              return (
                <div key={ingredient._id} className="p-4 hover:bg-gray-50 transition-colors">
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div className="flex-1">
                      <h3 className="font-medium text-gray-900 mb-1">{ingredient.name}</h3>
                      <p className="text-xs font-mono text-gray-500">{ingredient.productId}</p>
                    </div>
                    <span
                      className="px-2 py-1 rounded-full text-xs font-medium whitespace-nowrap"
                      style={{ backgroundColor: categoryStyle.bg, color: categoryStyle.text }}
                    >
                      {ingredient.category}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-sm mb-3">
                    <div>
                      <span className="text-gray-500">Producto:</span>
                      <p className="text-gray-700 font-medium">{ingredient.product}</p>
                    </div>
                    <div>
                      <span className="text-gray-500">Marca:</span>
                      <p className="text-gray-700 font-medium">{ingredient.brand}</p>
                    </div>
                    <div>
                      <span className="text-gray-500">Tamaño:</span>
                      <p className="text-gray-700 font-medium">{ingredient.size} {ingredient.sizeUnit}</p>
                    </div>
                    <div>
                      <span className="text-gray-500">Precio:</span>
                      <p className="text-gray-900 font-bold">${ingredient.price.toFixed(2)}</p>
                    </div>
                    <div className="col-span-2">
                      <span className="text-gray-500">Proveedor:</span>
                      <p className="text-gray-700 font-medium">{ingredient.supplier}</p>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    {viewMode === 'active' ? (
                      <>
                        <button
                          onClick={() => onEdit(ingredient)}
                          className="flex-1 px-3 py-1.5 text-xs font-medium text-white rounded hover:opacity-90 transition-opacity"
                          style={{ backgroundColor: '#adc4bc' }}
                        >
                          Editar
                        </button>
                        <button
                          onClick={() => onArchive(ingredient.productId)}
                          className="flex-1 px-3 py-1.5 text-xs font-medium text-gray-700 bg-gray-100 rounded hover:bg-gray-200 transition-colors"
                        >
                          Archivar
                        </button>
                      </>
                    ) : (
                      <button
                        onClick={() => onRestore(ingredient.productId)}
                        className="flex-1 px-3 py-1.5 text-xs font-medium text-white rounded hover:opacity-90 transition-opacity"
                        style={{ backgroundColor: '#9FB9B3' }}
                      >
                        Restaurar
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Vista desktop - Tabla */}
      <div className="hidden md:block overflow-x-auto">
        <table className="w-full">
          <thead style={{ backgroundColor: '#f5f2eb' }}>
            <tr>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Código</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Nombre</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Producto</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Categoría</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Marca</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Tamaño</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Precio</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Proveedor</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Acciones</th>
            </tr>
          </thead>

          <tbody className="divide-y divide-gray-100">
            {ingredients.length === 0 ? (
              <tr>
                <td colSpan="9" className="px-4 py-8 text-center text-gray-500">
                  No se encontraron ingredientes
                </td>
              </tr>
            ) : (
              ingredients.map((ingredient) => {
                const categoryStyle = getCategoryStyle(ingredient.category);
                return (
                  <tr key={ingredient._id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3 whitespace-nowrap">
                      <span className="text-sm font-mono text-gray-600">
                        {ingredient.productId}
                      </span>
                    </td>

                    <td className="px-4 py-3 whitespace-nowrap">
                      <span className="text-sm font-medium text-gray-900">
                        {ingredient.name}
                      </span>
                    </td>

                    <td className="px-4 py-3">
                      <span className="text-sm text-gray-700">
                        {ingredient.product}
                      </span>
                    </td>

                    <td className="px-4 py-3 whitespace-nowrap">
                      <span
                        className="px-2.5 py-1 rounded-full text-xs font-medium"
                        style={{ backgroundColor: categoryStyle.bg, color: categoryStyle.text }}
                      >
                        {ingredient.category}
                      </span>
                    </td>

                    <td className="px-4 py-3 whitespace-nowrap">
                      <span className="text-sm text-gray-700">
                        {ingredient.brand}
                      </span>
                    </td>

                    <td className="px-4 py-3 whitespace-nowrap">
                      <span className="text-sm text-gray-700">
                        {ingredient.size} {ingredient.sizeUnit}
                      </span>
                    </td>

                    <td className="px-4 py-3 whitespace-nowrap">
                      <span className="text-sm font-semibold text-gray-900">
                        ${ingredient.price.toFixed(2)}
                      </span>
                    </td>

                    <td className="px-4 py-3">
                      <span className="text-sm text-gray-600">
                        {ingredient.supplier}
                      </span>
                    </td>

                    <td className="px-4 py-3 whitespace-nowrap">
                      <div className="flex gap-2">
                        {viewMode === 'active' ? (
                          <>
                            <button
                              onClick={() => onEdit(ingredient)}
                              className="px-3 py-1.5 text-xs font-medium text-white rounded hover:opacity-90 transition-opacity"
                              style={{ backgroundColor: '#adc4bc' }}
                            >
                              Editar
                            </button>
                            <button
                              onClick={() => onArchive(ingredient.productId)}
                              className="px-3 py-1.5 text-xs font-medium text-gray-700 bg-gray-100 rounded hover:bg-gray-200 transition-colors"
                            >
                              Archivar
                            </button>
                          </>
                        ) : (
                          <button
                            onClick={() => onRestore(ingredient.productId)}
                            className="px-3 py-1.5 text-xs font-medium text-white rounded hover:opacity-90 transition-opacity"
                            style={{ backgroundColor: '#9FB9B3' }}
                          >
                            Restaurar
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      <div
        className="px-4 py-3 border-t flex items-center justify-between"
        style={{ backgroundColor: '#f5f2eb', borderColor: '#e5dfd8' }}
      >
        <div className="text-sm text-gray-600">
          Mostrando <span className="font-medium">{startItem}-{endItem}</span> de <span className="font-medium">{totalItems}</span> resultados
        </div>

        <div className="flex gap-2">
          <button 
            onClick={() => onPageChange(currentPage - 1)}
            disabled={currentPage === 1}
            className="px-3 py-1.5 text-sm font-medium text-gray-700 bg-white border rounded-md hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed" 
            style={{ borderColor: '#e5dfd8' }}
          >
            Anterior
          </button>
          <button
            onClick={() => onPageChange(currentPage + 1)}
            disabled={endItem >= totalItems}
            className="px-3 py-1.5 text-sm font-medium text-white rounded-md hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
            style={{ backgroundColor: '#adc4bc' }}
          >
            Siguiente
          </button>
        </div>
      </div>
    </div>
  );
};

export default IngredientsTable;