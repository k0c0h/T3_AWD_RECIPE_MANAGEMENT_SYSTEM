import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ProtectedRoute = ({ allowedRoles = [] }) => {
  const { isAuthenticated, user, loading } = useAuth();

  // Esperar a que termine de cargar el estado de autenticación
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: '#9FB9B3' }}>
        <div className="text-white text-xl">Cargando...</div>
      </div>
    );
  }

  // Si no está autenticado, redirigir a login
  if (!isAuthenticated || !user) {
    return <Navigate to="/login" replace />;
  }

  // Si allowedRoles está vacío, permitir acceso (no se verifica rol)
  if (allowedRoles.length === 0) {
    return <Outlet />;
  }

  // Verificar si el rol del usuario está en allowedRoles
  if (!allowedRoles.includes(user.role)) {
    // Redirigir según el rol del usuario
    if (user.role === 'chef') {
      return <Navigate to="/calendar" replace />;
    } else if (user.role === 'client') {
      return <Navigate to="/recipes-menus" replace />;
    } else {
      return <Navigate to="/login" replace />;
    }
  }

  // Si todo está OK, renderizar las rutas hijas
  return <Outlet />;
};

export default ProtectedRoute;
