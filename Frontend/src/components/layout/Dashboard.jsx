import React, { useState, useEffect } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { 
  Calendar, 
  Users, 
  ChefHat, 
  Carrot, 
  Calculator, 
  Scale, 
  DollarSign, 
  FileCheck, 
  Menu, 
  X, 
  LogOut,
  BookOpen
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import ServerAlert from '../ServerAlert';

const menuConfig = {
  chef: [
    {
      category: 'Planificación',
      items: [
        { id: 'calendar', label: 'Calendario', icon: Calendar, path: '/calendar' }
      ]
    },
    {
      category: 'Gestión de Contenido',
      items: [
        { id: 'recipes', label: 'Gestión de Recetas', icon: ChefHat, path: '/recipes' },
        { id: 'ingredients', label: 'Gestión de Ingredientes', icon: Carrot, path: '/ingredients' }
      ]
    },
    {
      category: 'Herramientas y Utilidades',
      items: [
        { id: 'unit-conversion', label: 'Conversión de Unidades', icon: Calculator, path: '/unit-conversion' },
        { id: 'recipe-scaling', label: 'Escalado de Recetas', icon: Scale, path: '/recipe-scaling' }
      ]
    },
    {
      category: 'Finanzas',
      items: [
        { id: 'costs', label: 'Costos', icon: DollarSign, path: '/costs' },
        { id: 'quotes', label: 'Cotizaciones', icon: FileCheck, path: '/quotes-chef' }
      ]
    }
  ],
  client: [
    {
      category: 'Recetas y Menús',
      items: [
        { id: 'recipes-menus', label: 'Recetas y Menús', icon: BookOpen, path: '/recipes-menus' }
      ]
    },
    {
      category: 'Finanzas',
      items: [
        { id: 'quotes', label: 'Cotizaciones', icon: FileCheck, path: '/quotes-client' }
      ]
    }
  ]
};

const Dashboard = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();

  const [sidebarOpen, setSidebarOpen] = useState(true); // Abierto por defecto en desktop
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
      // En desktop, siempre debe estar abierto
      if (!mobile) {
        setSidebarOpen(true);
      }
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, [isMobile]);

  useEffect(() => {
    // Solo cerrar el sidebar en móvil cuando cambias de ruta
    if (isMobile) {
      setSidebarOpen(false);
    }
  }, [location.pathname, isMobile]);

  const userType = user?.role || 'client';
  const currentMenu = menuConfig[userType] || [];

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="flex h-screen bg-white overflow-hidden">
      
      {/* Overlay para móvil */}
      {isMobile && sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside 
        className={`
          ${isMobile ? 'fixed inset-y-0 left-0 z-50' : 'relative'}
          ${isMobile && !sidebarOpen ? '-translate-x-full' : 'translate-x-0'}
          ${isMobile ? 'w-64' : (sidebarOpen ? 'w-64' : 'w-20')}
          transition-all duration-300 flex flex-col border-r bg-white
        `}
        style={{ borderColor: '#F1F1F1' }}
      >
        {/* Logo + toggle */}
        <div className="flex items-center justify-between px-4 py-4 border-b" style={{ borderColor: '#F1F1F1' }}>
          {(sidebarOpen || isMobile) && (
            <h1 className="text-2xl font-semibold" style={{ color: '#D4B5A5', fontFamily: 'Brush Script MT, cursive' }}>
              DishDash
            </h1>
          )}
          {!sidebarOpen && !isMobile && (
            <ChefHat size={22} style={{ color: '#D4B5A5' }} />
          )}
          {!isMobile && (
            <button onClick={() => setSidebarOpen(!sidebarOpen)} className="p-2 rounded-md hover:bg-gray-100 ml-auto">
              <Menu size={18} />
            </button>
          )}
          {isMobile && (
            <button onClick={() => setSidebarOpen(false)} className="p-2 rounded-md hover:bg-gray-100 ml-auto">
              <X size={18} />
            </button>
          )}
        </div>

        {/* Menu */}
        <nav className="flex-1 px-3 py-4 overflow-y-auto">
          {currentMenu.map((section, i) => (
            <div key={i} className="mb-5">
              {(sidebarOpen || isMobile) && (
                <h3 className="text-xs uppercase font-semibold mb-2 tracking-wide" style={{ color: '#D4B5A5' }}>
                  {section.category}
                </h3>
              )}
              <ul className="space-y-1">
                {section.items.map(item => {
                  const Icon = item.icon;
                  const active = location.pathname === item.path;
                  return (
                    <li key={item.id}>
                      <button
                        onClick={() => navigate(item.path)}
                        className="w-full flex items-center gap-3 px-3 py-2 rounded-md transition-colors text-sm"
                        style={{
                          backgroundColor: active ? '#E8D5C7' : 'transparent',
                          color: active ? '#9FB9B3' : '#6B7280'
                        }}
                      >
                        <Icon size={18} />
                        {(sidebarOpen || isMobile) && <span>{item.label}</span>}
                      </button>
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </nav>

        {/* Footer user */}
        <div className="p-4 border-t" style={{ borderColor: '#F1F1F1' }}>
          <div className={`flex items-center ${(sidebarOpen || isMobile) ? 'gap-3' : 'justify-center'}`}>
            <div className="w-10 h-10 rounded-full flex items-center justify-center font-semibold" style={{ backgroundColor: '#D4B5A5', color: 'white' }}>
              {user?.name?.charAt(0).toUpperCase() || 'U'}
            </div>
            {(sidebarOpen || isMobile) && (
              <div>
                <p className="text-sm font-medium" style={{ color: '#6B7280' }}>{user?.name || 'Usuario'}</p>
                <p className="text-xs" style={{ color: '#9FB9B3' }}>
                  {userType === 'chef' ? 'Chef' : 'Cliente'}
                </p>
              </div>
            )}
          </div>
        </div>
      </aside>

      {/* Main */}
      <main className="flex-1 flex flex-col overflow-hidden">
        {/* Server status alert */}
        
        {/* Header */}
        <header className="flex items-center justify-between px-4 md:px-6 py-3 md:py-4 border-b bg-white" style={{ borderColor: '#E8D5C7' }}>
          <ServerAlert />
          <div className="flex items-center gap-3">
            {/* Botón hamburguesa solo en móvil */}
            {isMobile && (
              <button
                onClick={() => setSidebarOpen(true)}
                className="p-2 rounded-md hover:bg-gray-100"
              >
                <Menu size={20} />
              </button>
            )}
            <h2 className="text-lg md:text-2xl font-bold truncate" style={{ color: '#9FB9B3' }}>
              {currentMenu.flatMap(s => s.items).find(m => m.path === location.pathname)?.label || 'Dashboard'}
            </h2>
          </div>

          <button
            onClick={handleLogout}
            className="flex items-center gap-2 px-3 md:px-4 py-2 rounded-md text-white hover:opacity-90 transition-opacity text-sm md:text-base"
            style={{ backgroundColor: '#D4B5A5' }}
          >
            <LogOut size={16} />
            <span className="hidden sm:inline">Salir</span>
          </button>
        </header>

        {/* Content */}
        <div className="flex-1 p-4 md:p-6 bg-white overflow-auto">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default Dashboard;