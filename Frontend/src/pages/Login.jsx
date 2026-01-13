import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChefHat } from 'lucide-react';

const Login = () => {
  const navigate = useNavigate();
  const [selectedUserType, setSelectedUserType] = useState('chef');

  const handleLogin = () => {
    // TODO: Implementar autenticación real con Google
    // Por ahora solo redirige al dashboard
    navigate('/calendar');
  };

  return (
    <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: '#9FB9B3' }}>
      <div className="rounded-3xl shadow-2xl p-10 max-w-md w-full" style={{ backgroundColor: '#ffffff' }}>
        <div className="flex flex-col items-center mb-8">
          <div className="w-20 h-20 rounded-2xl flex items-center justify-center mb-4" style={{ backgroundColor: '#E8D5C7' }}>
            <ChefHat size={40} style={{ color: '#9FB9B3' }} />
          </div>
          <h1 className="text-4xl font-bold" style={{ color: '#9FB9B3', fontFamily: 'Brush Script MT, cursive' }}>
            DishDash
          </h1>
          <p className="text-sm mt-2" style={{ color: '#B8C9D0' }}>
            Sistema de gestión de cocina
          </p>
        </div>

        <div className="space-y-4">
          <p className="text-sm font-semibold" style={{ color: '#9FB9B3' }}>
            Selecciona tu tipo de usuario (temporal):
          </p>
          
          <div className="space-y-2">
            <button
              onClick={() => setSelectedUserType('chef')}
              className="w-full p-4 rounded-xl transition-all"
              style={{
                backgroundColor: selectedUserType === 'chef' ? '#E8D5C7' : '#F8F9FA',
                border: `2px solid ${selectedUserType === 'chef' ? '#9FB9B3' : '#E8D5C7'}`,
                color: '#9FB9B3'
              }}
            >
              <span className="font-semibold">👨‍🍳 Chef</span>
            </button>
            
            <button
              onClick={() => setSelectedUserType('client')}
              className="w-full p-4 rounded-xl transition-all"
              style={{
                backgroundColor: selectedUserType === 'client' ? '#E8D5C7' : '#F8F9FA',
                border: `2px solid ${selectedUserType === 'client' ? '#9FB9B3' : '#E8D5C7'}`,
                color: '#9FB9B3'
              }}
            >
              <span className="font-semibold">👤 Cliente</span>
            </button>
          </div>

          <button
            onClick={handleLogin}
            className="w-full py-3 rounded-xl font-semibold transition-all mt-6"
            style={{ backgroundColor: '#9FB9B3', color: '#ffffff' }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = '#B8C9D0';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = '#9FB9B3';
            }}
          >
            Ingresar (Demo)
          </button>

          <div className="mt-6 p-4 rounded-lg" style={{ backgroundColor: '#E8D5C7' }}>
            <p className="text-xs" style={{ color: '#9FB9B3' }}>
              <strong>TODO:</strong> Reemplazar con Google OAuth cuando esté listo
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;