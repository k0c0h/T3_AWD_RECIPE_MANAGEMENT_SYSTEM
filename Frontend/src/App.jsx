import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Login from './pages/Login';
import Register from './pages/Register';
import GoogleCallback from './pages/GoogleCallback';
import Dashboard from './components/layout/Dashboard';

// Chef pages
import Calendar from './pages/chef/Calendar';
import Recipes from './pages/chef/Recipes';
import Ingredients from './pages/chef/Ingredients';
import UnitConversion from './pages/chef/UnitConversion';
import ConversionsHistoryPage from './pages/chef/ConversionsHistoryPage';
import RecipeScaling from './pages/chef/RecipeScaling';
import Costs from './pages/chef/Costs';
import ChefQuotes from './pages/chef/Quotes';  

// Client pages
import RecipesMenus from './pages/client/RecipesMenus';
import ClientQuotes from './pages/client/Quotes';


function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Public Routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/auth/callback" element={<GoogleCallback />} />
          
          {/* Protected Routes - Dashboard with nested routes */}
          <Route path="/" element={<ProtectedRoute allowedRoles={['chef', 'client']} />}>
            <Route element={<Dashboard />}>
              {/* Chef Only Routes */}
              <Route element={<ProtectedRoute allowedRoles={['chef']} />}>
                <Route path="calendar" element={<Calendar />} />
                <Route path="recipes" element={<Recipes />} />
                <Route path="ingredients" element={<Ingredients />} />
                <Route path="unit-conversion" element={<UnitConversion />} />
                <Route path="unit-conversion/history" element={<ConversionsHistoryPage />} />
                <Route path="recipe-scaling" element={<RecipeScaling />} />
                <Route path="costs" element={<Costs />} />
                <Route path="quotes-chef" element={<ChefQuotes />} />
              </Route>
              
              {/* Chef and Client Routes */}
              <Route element={<ProtectedRoute allowedRoles={['chef', 'client']} />}>
                <Route path="recipes-menus" element={<RecipesMenus />} />
                <Route path="quotes-client" element={<ClientQuotes />} />
              </Route>
              
              {/* Default redirect based on role handled by ProtectedRoute */}
              <Route index element={<Navigate to="/calendar" replace />} />
            </Route>
          </Route>
          
          {/* Catch all - redirect to login */}
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;