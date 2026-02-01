import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { ChefHat, AlertCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const GoogleCallback = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { login } = useAuth();
  const [error, setError] = useState(null);

  useEffect(() => {
    const handleCallback = async () => {
      try {
        // Obtener token y user de los query params
        const token = searchParams.get('token');
        const userStr = searchParams.get('user');
        const errorParam = searchParams.get('error');

        console.log('🔍 Google Callback Iniciado');
        console.log('Token:', token ? '✅ Recibido' : '❌ No recibido');
        console.log('User:', userStr ? '✅ Recibido' : '❌ No recibido');

        // Si hay error del backend
        if (errorParam) {
          console.error('❌ Error del backend:', errorParam);
          setError(decodeURIComponent(errorParam));
          setTimeout(() => navigate('/login?error=backend_error'), 2000);
          return;
        }

        if (!token || !userStr) {
          console.error('❌ Credenciales faltantes');
          setError('No se recibieron las credenciales de autenticación');
          setTimeout(() => navigate('/login?error=missing_credentials'), 2000);
          return;
        }

        // Parsear el usuario
        let user;
        try {
          user = JSON.parse(decodeURIComponent(userStr));
          console.log('✅ Usuario parseado:', user);
          console.log('   - Email:', user.email);
          console.log('   - Name:', user.name);
          console.log('   - Role:', user.role);
          console.log('   - _id:', user._id);
          console.log('   - id:', user.id);
        } catch (parseError) {
          console.error('❌ Error al parsear usuario:', parseError);
          setError('Error al procesar los datos del usuario');
          setTimeout(() => navigate('/login?error=parse_error'), 2000);
          return;
        }

        // Validar que el usuario tenga los campos necesarios
        if (!user.email || !user.role) {
          console.error('❌ Usuario incompleto:', user);
          setError('Los datos del usuario están incompletos');
          setTimeout(() => navigate('/login?error=incomplete_user'), 2000);
          return;
        }

        // Asegurar que el usuario tenga _id (compatibilidad)
        if (!user._id && user.id) {
          user._id = user.id;
          console.log('⚠️ Agregando _id desde id:', user._id);
        }

        // Guardar en localStorage
        localStorage.setItem('token', token);
        localStorage.setItem('user', JSON.stringify(user));
        localStorage.setItem('role', user.role);
        
        console.log('✅ Datos guardados en localStorage');
        console.log('✅ Autenticación exitosa, redirigiendo...');
        
        // Redirigir según el rol
        const redirectPath = user.role === 'chef' ? '/calendar' : '/recipes-menus';
        console.log('🔄 Redirigiendo a:', redirectPath);
        
        // Usar window.location para forzar recarga completa y actualizar el contexto
        setTimeout(() => {
          window.location.href = redirectPath;
        }, 500);
        
      } catch (error) {
        console.error('❌ Error en Google callback:', error);
        console.error('Stack trace:', error.stack);
        setError('Error al procesar la autenticación');
        setTimeout(() => navigate('/login?error=processing_error'), 2000);
      }
    };

    handleCallback();
  }, [searchParams, navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: '#9FB9B3' }}>
      <div className="rounded-3xl shadow-2xl p-10 max-w-md w-full text-center" style={{ backgroundColor: '#ffffff' }}>
        <div className="flex flex-col items-center">
          <div className={`w-20 h-20 rounded-2xl flex items-center justify-center mb-4 ${!error ? 'animate-pulse' : ''}`} style={{ backgroundColor: error ? '#FEE2E2' : '#E8D5C7' }}>
            {error ? (
              <AlertCircle size={40} style={{ color: '#EF4444' }} />
            ) : (
              <ChefHat size={40} style={{ color: '#9FB9B3' }} />
            )}
          </div>
          <h2 className="text-2xl font-semibold mb-2" style={{ color: error ? '#EF4444' : '#9FB9B3' }}>
            {error ? 'Error de Autenticación' : 'Autenticando...'}
          </h2>
          <p className="text-sm" style={{ color: '#B8C9D0' }}>
            {error || 'Procesando tu inicio de sesión con Google'}
          </p>
          {error && (
            <p className="text-xs mt-4" style={{ color: '#9CA3AF' }}>
              Serás redirigido al login en un momento...
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default GoogleCallback;
