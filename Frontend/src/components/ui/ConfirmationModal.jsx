import React from 'react';

const ConfirmationModal = ({ isOpen, title = 'Confirmar', message, onConfirm, onCancel, confirmText = 'Aceptar', cancelText = 'Cancelar', loading = false }) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="bg-white rounded-lg shadow-lg max-w-md w-full p-6">
        <h3 className="text-lg font-semibold mb-2">{title}</h3>
        <p className="text-sm text-gray-700 mb-4">{message}</p>
        <div className="flex justify-end gap-2">
          <button onClick={onCancel} className="px-4 py-2 bg-gray-100 rounded">{cancelText}</button>
          <button onClick={onConfirm} disabled={loading} className="px-4 py-2 bg-[#9FB9B3] text-white rounded">
            {loading ? 'Procesando...' : confirmText}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmationModal;