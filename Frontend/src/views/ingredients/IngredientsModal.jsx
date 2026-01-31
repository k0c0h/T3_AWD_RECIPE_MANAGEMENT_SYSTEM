import React, { useEffect, useState } from 'react';

const CloseIcon = ({ className = 'w-5 h-5' }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
    <line x1="18" y1="6" x2="6" y2="18" />
    <line x1="6" y1="6" x2="18" y2="18" />
  </svg>
);

const IngredientsModal = ({ 
  isOpen, 
  onClose, 
  onSubmit, 
  initialData = null,
  categories = []
}) => {
  const [formData, setFormData] = useState({
    productId: '',
    name: '',
    category: '',
    product: '',
    brand: '',
    size: '',
    sizeUnit: 'ml',
    price: '',
    supplier: '',
    availableUnits: 0
  });

  const [errors, setErrors] = useState({});
  const [generalError, setGeneralError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (initialData) {
      setFormData({
        productId: initialData.productId || '',
        name: initialData.name || '',
        category: initialData.category || '',
        product: initialData.product || '',
        brand: initialData.brand || '',
        size: initialData.size ?? '',
        sizeUnit: initialData.sizeUnit || 'ml',
        price: initialData.price ?? '',
        supplier: initialData.supplier || '',
        availableUnits: initialData.availableUnits ?? 0
      });
    } else {
      resetForm();
    }
    setErrors({});
    setGeneralError('');
  }, [initialData, isOpen]);

  const resetForm = () => {
    setFormData({
      productId: '',
      name: '',
      category: '',
      product: '',
      brand: '',
      size: '',
      sizeUnit: 'ml',
      price: '',
      supplier: '',
      availableUnits: 0
    });
    setErrors({});
    setGeneralError('');
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    setErrors(prev => ({ ...prev, [name]: null }));
    setGeneralError('');
  };

  const validateForm = () => {
    const e = {};
    if (!formData.productId?.trim()) e.productId = 'Código requerido';
    if (!formData.name?.trim()) e.name = 'Nombre requerido';
    if (!formData.category?.trim()) e.category = 'Categoría requerida';
    if (!formData.product?.trim()) e.product = 'Producto requerido';
    if (!formData.brand?.trim()) e.brand = 'Marca requerida';
    if (!formData.supplier?.trim()) e.supplier = 'Proveedor requerido';
    if (formData.size === '' || isNaN(Number(formData.size))) e.size = 'Tamaño inválido';
    if (formData.price === '' || isNaN(Number(formData.price))) e.price = 'Precio inválido';
    return e;
  };

  const handleSubmit = async (evt) => {
    evt?.preventDefault();
    setGeneralError('');
    const clientErrors = validateForm();
    if (Object.keys(clientErrors).length) {
      setErrors(clientErrors);
      return { success: false, fieldErrors: clientErrors };
    }

    setIsSubmitting(true);
    try {
      const payload = {
        ...formData,
        size: formData.size === '' ? 0 : Number(formData.size),
        price: formData.price === '' ? 0 : Number(formData.price),
        availableUnits: Number(formData.availableUnits || 0) 
      };
      const result = await onSubmit(payload);

      if (result && result.success === false) {
        if (result.fieldErrors) setErrors(result.fieldErrors);
        if (result.message) setGeneralError(result.message);
        setIsSubmitting(false);
        return result;
      }

      resetForm();
      onClose();
      setIsSubmitting(false);
      return { success: true };
    } catch (err) {
      const msg = err?.message || String(err) || 'Error inesperado';
      const fieldErrors = {};
      if (/duplicate key|E11000|productId/i.test(msg)) {
        fieldErrors.productId = 'Este código ya existe';
      }

      if (Object.keys(fieldErrors).length) {
        setErrors(fieldErrors);
      } else {
        setGeneralError(msg);
      }

      setIsSubmitting(false);
      return { success: false, fieldErrors, message: msg };
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b px-6 py-4 flex items-center justify-between" style={{ borderColor: '#E8D5C7' }}>
          <h2 className="text-xl font-semibold" style={{ color: '#9FB9B3' }}>
            {initialData ? 'Editar Ingrediente' : 'Nuevo Ingrediente'}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
            disabled={isSubmitting}
            aria-label="Cerrar"
          >
            <CloseIcon />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6">
          {generalError && (
            <div className="mb-4 px-4 py-2 bg-red-50 border border-red-200 text-red-700 rounded text-sm">
              {generalError}
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Product ID */}
            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: '#6B7280' }}>
                Código del Producto *
              </label>
              <input
                type="text"
                name="productId"
                value={formData.productId}
                onChange={handleInputChange}
                disabled={!!initialData}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-opacity-50 text-sm ${errors.productId ? 'border-red-500' : ''} ${initialData ? 'bg-gray-100 cursor-not-allowed' : ''}`}
                style={{ borderColor: errors.productId ? '#EF4444' : '#E8D5C7' }}
                placeholder="PROD001"
              />
              {errors.productId && <p className="text-red-500 text-xs mt-1">{errors.productId}</p>}
            </div>

            {/* Name */}
            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: '#6B7280' }}>
                Nombre *
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-opacity-50 text-sm ${errors.name ? 'border-red-500' : ''}`}
                style={{ borderColor: errors.name ? '#EF4444' : '#E8D5C7' }}
                placeholder="Hielo"
              />
              {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
            </div>

            {/* Category */}
            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: '#6B7280' }}>
                Categoría *
              </label>
              <select
                name="category"
                value={formData.category}
                onChange={handleInputChange}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-opacity-50 text-sm ${errors.category ? 'border-red-500' : ''}`}
                style={{ borderColor: errors.category ? '#EF4444' : '#E8D5C7' }}
              >
                <option value="">Seleccionar categoría</option>
                {categories.filter(c => c !== 'all').map(cat => <option key={cat} value={cat}>{cat}</option>)}
              </select>
              {errors.category && <p className="text-red-500 text-xs mt-1">{errors.category}</p>}
            </div>

            {/* Product */}
            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: '#6B7280' }}>
                Producto *
              </label>
              <input
                type="text"
                name="product"
                value={formData.product}
                onChange={handleInputChange}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-opacity-50 text-sm ${errors.product ? 'border-red-500' : ''}`}
                style={{ borderColor: errors.product ? '#EF4444' : '#E8D5C7' }}
                placeholder="Hielo en cubos"
              />
              {errors.product && <p className="text-red-500 text-xs mt-1">{errors.product}</p>}
            </div>

            {/* Brand */}
            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: '#6B7280' }}>
                Marca *
              </label>
              <input
                type="text"
                name="brand"
                value={formData.brand}
                onChange={handleInputChange}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-opacity-50 text-sm ${errors.brand ? 'border-red-500' : ''}`}
                style={{ borderColor: errors.brand ? '#EF4444' : '#E8D5C7' }}
                placeholder="Yellow"
              />
              {errors.brand && <p className="text-red-500 text-xs mt-1">{errors.brand}</p>}
            </div>

            {/* Supplier */}
            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: '#6B7280' }}>
                Proveedor *
              </label>
              <input
                type="text"
                name="supplier"
                value={formData.supplier}
                onChange={handleInputChange}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-opacity-50 text-sm ${errors.supplier ? 'border-red-500' : ''}`}
                style={{ borderColor: errors.supplier ? '#EF4444' : '#E8D5C7' }}
                placeholder="Mi Comisariato S.A"
              />
              {errors.supplier && <p className="text-red-500 text-xs mt-1">{errors.supplier}</p>}
            </div>

            {/* Size */}
            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: '#6B7280' }}>
                Tamaño *
              </label>
              <div className="flex gap-2">
                <input
                  type="number"
                  name="size"
                  value={formData.size}
                  onChange={handleInputChange}
                  className={`flex-1 px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-opacity-50 text-sm ${errors.size ? 'border-red-500' : ''}`}
                  style={{ borderColor: errors.size ? '#EF4444' : '#E8D5C7' }}
                  placeholder="1000"
                  step="0.01"
                />
                <select
                  name="sizeUnit"
                  value={formData.sizeUnit}
                  onChange={handleInputChange}
                  className="w-20 px-2 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-opacity-50 text-sm"
                  style={{ borderColor: '#E8D5C7' }}
                >
                  <option value="ml">ml</option>
                  <option value="g">g</option>
                  <option value="kg">kg</option>
                  <option value="l">l</option>
                  <option value="oz">oz</option>
                </select>
              </div>
              {errors.size && <p className="text-red-500 text-xs mt-1">{errors.size}</p>}
            </div>

            {/* Price */}
            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: '#6B7280' }}>
                Precio *
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 text-sm">$</span>
                <input
                  type="number"
                  step="0.01"
                  name="price"
                  value={formData.price}
                  onChange={handleInputChange}
                  className={`w-full pl-7 pr-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-opacity-50 text-sm ${errors.price ? 'border-red-500' : ''}`}
                  style={{ borderColor: errors.price ? '#EF4444' : '#E8D5C7' }}
                  placeholder="1.00"
                />
              </div>
              {errors.price && <p className="text-red-500 text-xs mt-1">{errors.price}</p>}
            </div>
          </div>

          <div className="mt-6 flex gap-3 justify-end">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-5 py-2 text-gray-700 bg-gray-100 rounded-md font-medium hover:bg-gray-200 transition-colors text-sm disabled:opacity-50"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2 text-white rounded-md font-medium hover:opacity-90 transition-opacity text-sm disabled:opacity-50"
              style={{ backgroundColor: '#D4B5A5' }}
            >
              {isSubmitting ? 'Guardando...' : initialData ? 'Actualizar' : 'Guardar Ingrediente'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default IngredientsModal;