import React, { useEffect, useState } from 'react';
import serverStatus from '../services/serverStatus';

const ServerAlert = () => {
  const [status, setStatus] = useState(serverStatus.getServerStatus());
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const unsub = serverStatus.subscribeServerStatus((s) => {
      setStatus(s);
      const anyDown = !s.crud || !s.business;
      setVisible(anyDown);
    });

    // Hacemos una comprobación al montarse
    serverStatus.checkServers();

    return () => unsub();
  }, []);

  const handleRetry = async () => {
    await serverStatus.checkServers();
  };

  if (!visible) return null;

  const downServers = [];
  if (!status.crud) downServers.push('CRUD');
  if (!status.business) downServers.push('BUSINESS');

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center" style={{ backgroundColor: 'rgba(0,0,0,0.45)' }}>
      <div className="max-w-md w-full bg-white rounded-lg shadow-lg border p-6" style={{ borderColor: '#e5dfd8', backgroundColor: '#f5f2eb' }}>
        <h3 className="text-lg font-semibold" style={{ color: '#9b2c2c' }}>Error de servidor</h3>
        <p className="mt-2 text-sm text-gray-700">No se pudo conectar con los siguientes servicios: <strong>{downServers.join(', ')}</strong></p>
        <p className="mt-2 text-sm text-gray-700">Es posible que los cambios no se guarden. Por favor intente nuevamente más tarde.</p>

        <div className="mt-4 flex gap-2 justify-end">
          <button
            onClick={handleRetry}
            className="px-4 py-2 rounded-md text-white font-medium"
            style={{ backgroundColor: '#9FB9B3' }}
          >
            Reintentar
          </button>
          <button
            onClick={() => setVisible(false)}
            className="px-4 py-2 rounded-md font-medium border"
            style={{ borderColor: '#e5dfd8' }}
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
};

export default ServerAlert;