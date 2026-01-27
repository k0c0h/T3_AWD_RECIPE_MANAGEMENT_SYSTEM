import React from "react";

export const Modal = ({ isOpen, onClose, children }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="relative bg-white rounded-lg shadow-lg p-6 max-w-3xl w-full max-h-[90vh] overflow-auto">
        {/* Botón cerrar */}
        <button
          onClick={onClose}
          className="absolute top-2 right-2 text-gray-500 hover:text-gray-800 font-bold text-lg"
          aria-label="Cerrar modal"
        >
          ×
        </button>

        {/* Contenido del modal */}
        {children}
      </div>
    </div>
  );
};
