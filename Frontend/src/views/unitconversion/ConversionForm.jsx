import React, { useState, useEffect } from 'react';
import { RefreshCw } from 'lucide-react';
import unitConversionService from '../../services/unitconversion';
import SearchableSelect from '../../components/ui/SearchableSelect';

const ConversionForm = ({ ingredients, units, onSuccess, onSaveSuccess }) => {
  const [formData, setFormData] = useState({
    value: '',
    fromUnit: '',
    toUnit: '',
    density: '',
    ingredientId: '',
    conversionType: 'standard'
  });
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Realiza la conversión automáticamente cuando cambian los valores relevantes
  useEffect(() => {
    performConversion();
  }, [formData.value, formData.fromUnit, formData.toUnit, formData.conversionType, formData.density, formData.ingredientId]);

  const performConversion = async () => {
    setError(null);
    
    // Validar que hay valores para convertir
    if (!formData.value || parseFloat(formData.value) <= 0 || !formData.fromUnit) {
      setResult(null);
      return;
    }

    if (formData.conversionType === 'standard' && !formData.toUnit) {
      setResult(null);
      return;
    }

    setLoading(true);

    try {
      // Calcular sin guardar - solo para mostrar resultado
      const data = {
        value: parseFloat(formData.value),
        fromUnit: formData.fromUnit,
        density: formData.density ? parseFloat(formData.density) : 1,
        ingredientId: formData.ingredientId || undefined
      };

      let result = null;

      if (formData.conversionType === 'kitchen') {
        // Para conversión de cocina, intentar calcularlo
        try {
          result = await unitConversionService.kitchenConversion(data);
        } catch (err) {
          // Ignorar errores de guardado
          console.log('Kitchen conversion error:', err.message);
        }
      } else {
        // Para conversión estándar, calcular manualmente
        data.toUnit = formData.toUnit;
        
        // Buscar unidades en la lista
        const findUnit = (unitName) => {
          const allUnits = [...units.weight, ...units.volume];
          return allUnits.find(u => u.name === unitName);
        };

        const fromUnit = findUnit(formData.fromUnit);
        const toUnit = findUnit(formData.toUnit);

        if (fromUnit && toUnit && fromUnit.type === toUnit.type) {
          // Mismo tipo de unidad - cálculo simple
          const resultValue = (data.value * (fromUnit.toBase || 1)) / (toUnit.toBase || 1);
          result = {
            from: `${data.value} ${data.fromUnit}`,
            to: `${resultValue.toFixed(2)} ${data.toUnit}`,
            densityUsed: data.density
          };
        } else if (fromUnit && toUnit) {
          // Diferentes tipos - usar el backend para calcular
          try {
            result = await unitConversionService.convert(data);
          } catch (err) {
            console.log('Conversion error:', err.message);
          }
        }
      }

      setResult(result);
    } catch (err) {
      setResult(null);
      setError(err.message || 'Error en la conversión');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    console.log(`📝 Campo ${name} cambió a:`, value);
    
    if (name === 'ingredientId' && value) {
      const ingredient = ingredients.find(i => i._id === value);
      if (ingredient) {
        console.log('🥕 Ingrediente seleccionado:', ingredient);
        setFormData(prev => ({ ...prev, density: ingredient.density?.toString() || '1' }));
      }
    }
  };

  const handleIngredientSelect = (ingredient) => {
    if (ingredient) {
      setFormData(prev => ({ 
        ...prev, 
        ingredientId: ingredient._id,
        density: ingredient.density?.toString() || '1'
      }));
    } else {
      setFormData(prev => ({ 
        ...prev, 
        ingredientId: '',
        density: ''
      }));
    }
  };

  const calculateResult = (value, fromUnitName, toUnitName, density = 1) => {
    if (!fromUnitName || !toUnitName || !value) return null;

    const findUnit = (unitName) => {
      const allUnits = [...units.weight, ...units.volume];
      return allUnits.find(u => u.name === unitName);
    };

    const fromUnit = findUnit(fromUnitName);
    const toUnit = findUnit(toUnitName);

    if (!fromUnit || !toUnit) return null;

    // Mismo tipo
    if (fromUnit.type === toUnit.type) {
      return (value * (fromUnit.toBase || 1)) / (toUnit.toBase || 1);
    }

    // Diferentes tipos - usar densidad
    if (fromUnit.type === 'weight' && toUnit.type === 'volume') {
      const grams = value * (fromUnit.toBase || 1);
      const ml = grams / density;
      return ml / (toUnit.toBase || 1);
    }

    if (fromUnit.type === 'volume' && toUnit.type === 'weight') {
      const ml = value * (fromUnit.toBase || 1);
      const grams = ml * density;
      return grams / (toUnit.toBase || 1);
    }

    return null;
  };

  const handleSave = async (e) => {
    e.preventDefault();

    if (!formData.value || !formData.fromUnit) {
      onSuccess({ type: 'error', message: 'Completa los campos requeridos' });
      return;
    }

    if (formData.conversionType === 'standard' && !formData.toUnit) {
      onSuccess({ type: 'error', message: 'Selecciona la unidad de destino' });
      return;
    }

    try {
      const value = parseFloat(formData.value);
      const density = formData.density ? parseFloat(formData.density) : 1;

      // Calcular el resultado
      let resultValue = null;
      
      if (formData.conversionType === 'standard') {
        resultValue = calculateResult(value, formData.fromUnit, formData.toUnit, density);
        
        if (resultValue === null) {
          onSuccess({ type: 'error', message: 'No se pudo calcular la conversión' });
          return;
        }
      } else if (formData.conversionType === 'kitchen') {
        // Para kitchen, el backend lo calcula
        resultValue = null; // Se calculará en el backend
      }

      const data = {
        value: value,
        fromUnit: formData.fromUnit,
        density: density,
        result: resultValue // ✅ Enviar el resultado calculado
      };

      // Agregar toUnit para conversión estándar
      if (formData.conversionType === 'standard') {
        data.toUnit = formData.toUnit;
      }

      // Agregar ingredientId y nombre si existe
      if (formData.ingredientId) {
        const ingredient = ingredients.find(i => i._id === formData.ingredientId);
        if (ingredient) {
          data.ingredientId = formData.ingredientId;
          data.ingredientName = ingredient.name; // ✅ Enviar nombre del ingrediente
        }
      }

      console.log('📤 Guardando conversión con resultado:', data);

      let response;
      if (formData.conversionType === 'kitchen') {
        response = await unitConversionService.kitchenConversion(data);
      } else {
        response = await unitConversionService.convertAndSave(data);
      }

      console.log('✅ Respuesta del servidor:', response);

      onSuccess({ type: 'success', message: 'Conversión guardada exitosamente' });
      
      // Llamar callback si existe
      if (onSaveSuccess) {
        onSaveSuccess();
      }
      
      handleReset();
    } catch (err) {
      console.error('❌ Error al guardar:', err);
      const errorMsg = err.message || err.data?.message || 'Error al guardar la conversión';
      onSuccess({ type: 'error', message: errorMsg });
    }
  };

  const handleReset = () => {
    setFormData({
      value: '',
      fromUnit: '',
      toUnit: '',
      density: '',
      ingredientId: '',
      conversionType: 'standard'
    });
    setResult(null);
    setError(null);
  };

  return (
    <div className="space-y-6">
      {/* Tipo de Conversión */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Tipo de Conversión
        </label>
        <div className="grid grid-cols-2 gap-4">
          <label className="flex items-center cursor-pointer">
            <input
              type="radio"
              name="conversionType"
              value="standard"
              checked={formData.conversionType === 'standard'}
              onChange={handleChange}
              className="w-4 h-4 text-[#9FB9B3]"
            />
            <span className="ml-2 text-gray-700">Conversión Estándar</span>
          </label>
        </div>
      </div>

      {/* Ingrediente (Opcional) */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Ingrediente (Opcional)
        </label>
        <SearchableSelect
          items={ingredients}
          getLabel={(item) => item.name}
          getValue={(item) => item._id}
          value={formData.ingredientId ? ingredients.find(i => i._id === formData.ingredientId) : null}
          onChange={handleIngredientSelect}
          placeholder="Busca un ingrediente..."
          emptyMessage="No se encontraron ingredientes"
        />
      </div>

      {/* Cantidad y Unidad Origen */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Cantidad
          </label>
          <input
            type="number"
            name="value"
            value={formData.value}
            onChange={handleChange}
            step="0.01"
            min="0"
            placeholder="Ej: 250"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#9FB9B3] focus:border-transparent"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Desde Unidad
          </label>
          <select
            name="fromUnit"
            value={formData.fromUnit}
            onChange={handleChange}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#9FB9B3] focus:border-transparent"
          >
            <option value="">Seleccionar...</option>
            {units.weight.length > 0 && (
              <optgroup label="Peso">
                {units.weight.map(u => (
                  <option key={u.name} value={u.name}>{u.name}</option>
                ))}
              </optgroup>
            )}
            {units.volume.length > 0 && (
              <optgroup label="Volumen">
                {units.volume.map(u => (
                  <option key={u.name} value={u.name}>{u.name}</option>
                ))}
              </optgroup>
            )}
          </select>
        </div>
      </div>

      {/* Unidad Destino (solo para conversión estándar) */}
      {formData.conversionType === 'standard' && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Hacia Unidad
          </label>
          <select
            name="toUnit"
            value={formData.toUnit}
            onChange={handleChange}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#9FB9B3] focus:border-transparent"
          >
            <option value="">Seleccionar...</option>
            {units.weight.length > 0 && (
              <optgroup label="Peso">
                {units.weight.map(u => (
                  <option key={u.name} value={u.name}>{u.name}</option>
                ))}
              </optgroup>
            )}
            {units.volume.length > 0 && (
              <optgroup label="Volumen">
                {units.volume.map(u => (
                  <option key={u.name} value={u.name}>{u.name}</option>
                ))}
              </optgroup>
            )}
          </select>
        </div>
      )}

      {/* Densidad (Opcional - siempre editable) */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Densidad (g/ml) {formData.ingredientId && '- del ingrediente'}
        </label>
        <input
          type="number"
          name="density"
          value={formData.density}
          onChange={handleChange}
          step="0.01"
          min="0"
          placeholder="Ej: 1.2 (opcional)"
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#9FB9B3] focus:border-transparent"
        />
        <p className="text-xs text-gray-500 mt-1">
          {formData.ingredientId 
            ? 'Auto-completada del ingrediente. Edita si necesitas cambiarla.'
            : 'Usa 1 para ingredientes sin densidad especial, o ingresa la densidad real.'}
        </p>
      </div>

      {/* Resultado */}
      {result && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <p className="text-sm text-gray-600 mb-2">Resultado de la conversión:</p>
          <div className="flex items-center justify-between">
            <div className="text-center flex-1">
              <p className="text-gray-600 text-sm">De</p>
              <p className="text-xl font-semibold text-gray-800">{result.from}</p>
            </div>
            <div className="flex items-center justify-center px-4">
              <RefreshCw className="w-5 h-5 text-[#9FB9B3]" />
            </div>
            <div className="text-center flex-1">
              <p className="text-gray-600 text-sm">A</p>
              <p className="text-xl font-semibold text-gray-800">{result.to}</p>
            </div>
          </div>
          {result.densityUsed && (
            <p className="text-xs text-gray-500 mt-3 text-center">
              Densidad utilizada: {result.densityUsed} g/ml
            </p>
          )}
        </div>
      )}

      {/* Botones */}
      <div className="flex gap-3 pt-4">
        <button
          type="button"
          onClick={handleSave}
          disabled={!result || loading}
          className="flex-1 px-6 py-3 bg-[#9FB9B3] text-white rounded-lg hover:bg-[#8FA3A0] disabled:opacity-50 disabled:cursor-not-allowed font-medium transition"
        >
          {loading ? 'Guardando...' : 'Guardar Conversión'}
        </button>
        <button
          type="button"
          onClick={handleReset}
          className="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 font-medium transition"
        >
          Limpiar
        </button>
      </div>

      {/* Mensaje de error si hay */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-3">
          <p className="text-sm text-red-700">{error}</p>
        </div>
      )}
    </div>
  );
};

export default ConversionForm;
