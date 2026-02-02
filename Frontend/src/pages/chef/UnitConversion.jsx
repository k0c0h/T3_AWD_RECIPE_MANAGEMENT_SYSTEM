import React, { useState, useEffect } from 'react';
import { History } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import unitConversionService from '../../services/unitconversion';
import ingredientService from '../../services/ingredient';
import ConversionForm from '../../views/unitconversion/ConversionForm';
import Toast from '../../components/ui/Toast';

export default function UnitConversion() {
  const navigate = useNavigate();
  const [ingredients, setIngredients] = useState([]);
  const [units, setUnits] = useState({ weight: [], volume: [] });
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState(null);

  useEffect(() => {
    loadData();
  }, []);

  const processUnits = (unitsArray) => {
    if (!Array.isArray(unitsArray)) return { weight: [], volume: [] };
    
    const activeUnits = unitsArray.filter(u => u.isActive);
    
    return {
      weight: activeUnits.filter(u => u.type === 'weight').map(u => ({ name: u.name, toBase: u.toBase })),
      volume: activeUnits.filter(u => u.type === 'volume').map(u => ({ name: u.name, toBase: u.toBase }))
    };
  };

  const loadData = async () => {
    setLoading(true);
    try {
      const [ingredientsRes, unitsRes] = await Promise.all([
        ingredientService.getAll(),
        unitConversionService.getAllUnits()
      ]);
      
      // axiosInstance retorna response.data directamente
      const ingredients = Array.isArray(ingredientsRes) ? ingredientsRes : (ingredientsRes.data || []);
      const units = Array.isArray(unitsRes) ? unitsRes : (unitsRes.data || []);
      
      setIngredients(ingredients);
      const processedUnits = processUnits(units);
      setUnits(processedUnits);
      
      console.log('✅ Datos cargados:', { ingredientes: ingredients.length, unidades: processedUnits });
    } catch (error) {
      console.error('❌ Error cargando datos:', error);
      showToast({ type: 'error', message: 'Error cargando datos' });
    } finally {
      setLoading(false);
    }
  };

  const showToast = (config) => {
    const id = Date.now();
    setToast({ ...config, id });
  };

  const handleConversionSuccess = (message = 'Conversión guardada exitosamente') => {
    showToast({ type: 'success', message });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="text-gray-500 text-sm md:text-base">Cargando...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-6">
      <div className="max-w-4xl mx-auto">
        {/* Encabezado */}
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-6 md:mb-8">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-800">
              Convertidor de Unidades
            </h1>
            <p className="text-sm md:text-base text-gray-600 mt-1 md:mt-2">
              Convierte entre diferentes unidades de medida
            </p>
          </div>
          <button
            onClick={() => navigate('/unit-conversion/history')}
            className="w-full sm:w-auto px-4 py-2 bg-[#9FB9B3] text-white rounded-lg hover:bg-[#8FA3A0] flex items-center justify-center gap-2 transition text-sm md:text-base"
          >
            <History className="w-4 h-4 md:w-5 md:h-5" />
            <span>Ver Historial</span>
          </button>
        </div>

        {/* Formulario de Conversión */}
        <div className="bg-white rounded-lg shadow-md p-4 md:p-8">
          <ConversionForm
            ingredients={ingredients}
            units={units}
            onSuccess={showToast}
            onSaveSuccess={() => {
              console.log('✅ Conversión guardada desde el formulario');
            }}
          />
        </div>
      </div>

      <Toast toast={toast} onClose={() => setToast(null)} />
    </div>
  );
}