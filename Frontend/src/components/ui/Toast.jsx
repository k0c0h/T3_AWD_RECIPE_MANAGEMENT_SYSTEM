import React, { useEffect } from 'react';

const Toast = ({ toast, onClose, duration = 3000 }) => {
  useEffect(() => {
    if (!toast) return;
    const id = setTimeout(() => onClose && onClose(toast.id), duration);
    return () => clearTimeout(id);
  }, [toast, duration, onClose]);

  if (!toast) return null;

  const bg = toast.type === 'error' ? 'bg-red-500' : toast.type === 'warn' ? 'bg-yellow-500' : 'bg-green-500';

  return (
    <div className="fixed top-4 right-4 z-50">
      <div className={`text-white px-4 py-2 rounded shadow ${bg}`}>
        <div className="text-sm">{toast.message}</div>
      </div>
    </div>
  );
};

export default Toast;