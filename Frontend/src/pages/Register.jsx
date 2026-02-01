import React, { useState, useEffect } from 'react';
import { useNavigate, Link, useSearchParams } from 'react-router-dom';
import { ChefHat, Mail, Lock, User, AlertCircle, CheckCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

const Register = () => {
  const navigate = useNavigate();
  const { register } = useAuth();
  const [searchParams] = useSearchParams();
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Manejar errores de Google OAuth desde los query params
  useEffect(() => {
    const errorParam = searchParams.get('error');
    if (errorParam) {
      const errorMessages = {
        'missing_credentials': 'No se recibieron las credenciales de Google',
        'parse_error': 'Error al procesar los datos de Google',
        'incomplete_user': 'Los datos del usuario están incompletos',
        'processing_error': 'Error al procesar la autenticación con Google',
        'authentication_failed': 'Falló la autenticación con Google'
      };
      
      setError(errorMessages[errorParam] || 'Error en la autenticación con Google');
      
      // Limpiar el error después de 5 segundos
      setTimeout(() => setError(''), 5000);
    }
  }, [searchParams]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const validateForm = () => {
    if (!formData.name || !formData.email || !formData.password || !formData.confirmPassword) {
      setError('Por favor completa todos los campos');
      return false;
    }

    if (formData.password.length < 6) {
      setError('La contraseña debe tener al menos 6 caracteres');
      return false;
    }

    if (formData.password !== formData.confirmPassword) {
      setError('Las contraseñas no coinciden');
      return false;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      setError('Por favor ingresa un email válido');
      return false;
    }

    return true;
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setError('');

    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      const result = await register(formData.email, formData.password, formData.name);
      
      // Registro exitoso - auto-login y redirigir según el rol
      // Los clientes registrados siempre tienen rol 'client'
      if (result.user.role === 'chef') {
        navigate('/calendar');
      } else {
        navigate('/recipes-menus');
      }
    } catch (err) {
      console.error('Register error:', err);
      setError(err.message || 'Error al crear la cuenta. El email podría estar en uso.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleRegister = () => {
    api.auth.googleAuth();
  };

  return (
    <div className="min-h-screen flex items-center justify-center py-8" style={{ backgroundColor: '#9FB9B3' }}>
      <div className="rounded-3xl shadow-2xl p-10 max-w-md w-full" style={{ backgroundColor: '#ffffff' }}>
        <div className="flex flex-col items-center mb-6">
          <div className="w-20 h-20 rounded-2xl flex items-center justify-center mb-4" style={{ backgroundColor: '#E8D5C7' }}>
            <ChefHat size={40} style={{ color: '#9FB9B3' }} />
          </div>
          <h1 className="text-4xl font-bold" style={{ color: '#9FB9B3', fontFamily: 'Brush Script MT, cursive' }}>
            DishDash
          </h1>
          <p className="text-sm mt-2" style={{ color: '#B8C9D0' }}>
            Crear cuenta nueva
          </p>
        </div>

        <form onSubmit={handleRegister} className="space-y-4">
          {/* Error message */}
          {error && (
            <div className="p-3 rounded-lg flex items-center gap-2" style={{ backgroundColor: '#FFE5E5', color: '#D32F2F' }}>
              <AlertCircle size={18} />
              <span className="text-sm">{error}</span>
            </div>
          )}

          {/* Name field */}
          <div>
            <label className="block text-sm font-semibold mb-2" style={{ color: '#9FB9B3' }}>
              Nombre completo
            </label>
            <div className="relative">
              <User size={18} className="absolute left-3 top-3.5" style={{ color: '#B8C9D0' }} />
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="Tu nombre"
                className="w-full pl-10 pr-4 py-3 rounded-xl border-2 focus:outline-none focus:border-opacity-70"
                style={{ borderColor: '#E8D5C7', color: '#9FB9B3' }}
                disabled={loading}
              />
            </div>
          </div>

          {/* Email field */}
          <div>
            <label className="block text-sm font-semibold mb-2" style={{ color: '#9FB9B3' }}>
              Email
            </label>
            <div className="relative">
              <Mail size={18} className="absolute left-3 top-3.5" style={{ color: '#B8C9D0' }} />
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="tu@email.com"
                className="w-full pl-10 pr-4 py-3 rounded-xl border-2 focus:outline-none focus:border-opacity-70"
                style={{ borderColor: '#E8D5C7', color: '#9FB9B3' }}
                disabled={loading}
              />
            </div>
          </div>

          {/* Password field */}
          <div>
            <label className="block text-sm font-semibold mb-2" style={{ color: '#9FB9B3' }}>
              Contraseña
            </label>
            <div className="relative">
              <Lock size={18} className="absolute left-3 top-3.5" style={{ color: '#B8C9D0' }} />
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="Mínimo 6 caracteres"
                className="w-full pl-10 pr-4 py-3 rounded-xl border-2 focus:outline-none focus:border-opacity-70"
                style={{ borderColor: '#E8D5C7', color: '#9FB9B3' }}
                disabled={loading}
              />
            </div>
          </div>

          {/* Confirm Password field */}
          <div>
            <label className="block text-sm font-semibold mb-2" style={{ color: '#9FB9B3' }}>
              Confirmar contraseña
            </label>
            <div className="relative">
              <Lock size={18} className="absolute left-3 top-3.5" style={{ color: '#B8C9D0' }} />
              <input
                type="password"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                placeholder="Confirma tu contraseña"
                className="w-full pl-10 pr-4 py-3 rounded-xl border-2 focus:outline-none focus:border-opacity-70"
                style={{ borderColor: '#E8D5C7', color: '#9FB9B3' }}
                disabled={loading}
              />
            </div>
          </div>

          {/* Info message */}
          <div className="p-3 rounded-lg flex items-start gap-2" style={{ backgroundColor: '#E8F5E9', color: '#2E7D32' }}>
            <CheckCircle size={18} className="mt-0.5 flex-shrink-0" />
            <span className="text-xs">
              Al registrarte, serás creado como cliente. Podrás ver recetas y crear cotizaciones.
            </span>
          </div>

          {/* Register button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-xl font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            style={{ backgroundColor: '#9FB9B3', color: '#ffffff' }}
            onMouseEnter={(e) => {
              if (!loading) e.currentTarget.style.backgroundColor = '#B8C9D0';
            }}
            onMouseLeave={(e) => {
              if (!loading) e.currentTarget.style.backgroundColor = '#9FB9B3';
            }}
          >
            {loading ? 'Creando cuenta...' : 'Crear cuenta'}
          </button>

          {/* Divider */}
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t" style={{ borderColor: '#E8D5C7' }}></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white" style={{ color: '#B8C9D0' }}>O continúa con</span>
            </div>
          </div>

          {/* Google button */}
          <button
            type="button"
            onClick={handleGoogleRegister}
            disabled={loading}
            className="w-full py-3 rounded-xl font-semibold transition-all border-2 flex items-center justify-center gap-2 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            style={{ borderColor: '#E8D5C7', color: '#6B7280', backgroundColor: '#ffffff' }}
          >
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M17.64 9.20443C17.64 8.56625 17.5827 7.95262 17.4764 7.36353H9V10.8449H13.8436C13.635 11.9699 13.0009 12.9231 12.0477 13.5613V15.8194H14.9564C16.6582 14.2526 17.64 11.9453 17.64 9.20443Z" fill="#4285F4"/>
              <path d="M9 18C11.43 18 13.4673 17.1941 14.9564 15.8195L12.0477 13.5613C11.2418 14.1013 10.2109 14.4204 9 14.4204C6.65591 14.4204 4.67182 12.8372 3.96409 10.71H0.957275V13.0418C2.43818 15.9831 5.48182 18 9 18Z" fill="#34A853"/>
              <path d="M3.96409 10.71C3.78409 10.17 3.68182 9.59318 3.68182 9C3.68182 8.40682 3.78409 7.82999 3.96409 7.28999V4.95818H0.957275C0.347727 6.17318 0 7.54773 0 9C0 10.4523 0.347727 11.8268 0.957275 13.0418L3.96409 10.71Z" fill="#FBBC05"/>
              <path d="M9 3.57955C10.3214 3.57955 11.5077 4.03364 12.4405 4.92545L15.0218 2.34409C13.4632 0.891818 11.4259 0 9 0C5.48182 0 2.43818 2.01682 0.957275 4.95818L3.96409 7.29C4.67182 5.16273 6.65591 3.57955 9 3.57955Z" fill="#EA4335"/>
            </svg>
            Continuar con Google
          </button>

          {/* Login link */}
          <div className="text-center mt-4">
            <p className="text-sm" style={{ color: '#B8C9D0' }}>
              ¿Ya tienes cuenta?{' '}
              <Link 
                to="/login" 
                className="font-semibold hover:underline"
                style={{ color: '#9FB9B3' }}
              >
                Inicia sesión
              </Link>
            </p>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Register;
