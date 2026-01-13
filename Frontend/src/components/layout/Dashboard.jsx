import React, { useState } from 'react';
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
        { id: 'clients', label: 'Clientes', icon: Users, path: '/clients' },
        { id: 'recipes', label: 'Recetas', icon: ChefHat, path: '/recipes' },
        { id: 'ingredients', label: 'Ingredientes', icon: Carrot, path: '/ingredients' }
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

  const [userType, setUserType] = useState('chef');
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const currentMenu = menuConfig[userType] || [];

  const handleLogout = () => {
    navigate('/login');
  };

  return (
    <div className="flex h-screen bg-white">
      
      {/* Sidebar */}
      <aside 
        className={`${sidebarOpen ? 'w-64' : 'w-20'} transition-all duration-300 flex flex-col border-r bg-white`}
        style={{ borderColor: '#F1F1F1' }}
      >
        {/* Logo + toggle */}
        <div className="flex items-center justify-between px-4 py-4 border-b" style={{ borderColor: '#F1F1F1' }}>
          {sidebarOpen && (
            <h1 className="text-2xl font-semibold" style={{ color: '#D4B5A5', fontFamily: 'Brush Script MT, cursive' }}>
              DishDash
            </h1>
          )}
          {!sidebarOpen && (
            <ChefHat size={22} style={{ color: '#D4B5A5' }} />
          )}
          <button onClick={() => setSidebarOpen(!sidebarOpen)} className="p-2 rounded-md hover:bg-gray-100">
            {sidebarOpen ? <X size={18} /> : <Menu size={18} />}
          </button>
        </div>

        {/* Menu */}
        <nav className="flex-1 px-3 py-4 overflow-y-auto">
          {currentMenu.map((section, i) => (
            <div key={i} className="mb-5">
              {sidebarOpen && (
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
                        {sidebarOpen && <span>{item.label}</span>}
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
          <div className={`flex items-center ${sidebarOpen ? 'gap-3' : 'justify-center'}`}>
            <div className="w-10 h-10 rounded-full flex items-center justify-center font-semibold" style={{ backgroundColor: '#D4B5A5', color: 'white' }}>
              {userType === 'chef' ? 'C' : 'U'}
            </div>
            {sidebarOpen && (
              <div>
                <p className="text-sm font-medium" style={{ color: '#6B7280' }}>Usuario Demo</p>
                <p className="text-xs" style={{ color: '#9FB9B3' }}>
                  {userType === 'chef' ? 'Chef' : 'Cliente'}
                </p>
              </div>
            )}
          </div>
        </div>
      </aside>

      {/* Main */}
      <main className="flex-1 flex flex-col">
        
        {/* Header */}
        <header className="flex items-center justify-between px-6 py-4 border-b bg-white" style={{ borderColor: '#E8D5C7' }}>
          <div>
            <h2 className="text-xl font-semibold" style={{ color: '#9FB9B3' }}>
              {currentMenu.flatMap(s => s.items).find(m => m.path === location.pathname)?.label || 'Dashboard'}
            </h2>
            <button
              onClick={() => setUserType(userType === 'chef' ? 'client' : 'chef')}
              className="mt-1 text-xs px-2 py-1 rounded"
              style={{ backgroundColor: '#E8D5C7', color: '#9FB9B3' }}
            >
              Cambiar a {userType === 'chef' ? 'Cliente' : 'Chef'}
            </button>
          </div>

          <button
            onClick={handleLogout}
            className="flex items-center gap-2 px-4 py-2 rounded-md text-white"
            style={{ backgroundColor: '#D4B5A5' }}
          >
            <LogOut size={16} />
            Salir
          </button>
        </header>

        {/* Content */}
        <div className="flex-1 p-6 bg-white overflow-auto">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
