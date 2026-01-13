import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Dashboard from './components/layout/Dashboard';

// Chef pages
import Calendar from './pages/chef/Calendar';
import Clients from './pages/chef/Clients';
import Recipes from './pages/chef/Recipes';
import Ingredients from './pages/chef/Ingredients';
import UnitConversion from './pages/chef/UnitConversion';
import RecipeScaling from './pages/chef/RecipeScaling';
import Costs from './pages/chef/Costs';
import ChefQuotes from './pages/chef/Quotes';  

// Client pages
import RecipesMenus from './pages/client/RecipesMenus';
import ClientQuotes from './pages/client/Quotes';


function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Login Route */}
        <Route path="/login" element={<Login />} />
        
        {/* Dashboard with nested routes */}
        <Route path="/" element={<Dashboard />}>
          {/* Chef Routes */}
          <Route path="calendar" element={<Calendar />} />
          <Route path="clients" element={<Clients />} />
          <Route path="recipes" element={<Recipes />} />
          <Route path="ingredients" element={<Ingredients />} />
          <Route path="unit-conversion" element={<UnitConversion />} />
          <Route path="recipe-scaling" element={<RecipeScaling />} />
          <Route path="costs" element={<Costs />} />
          <Route path="quotes-chef" element={<ChefQuotes />} />
          
          {/* Client Routes */}
          <Route path="recipes-menus" element={<RecipesMenus />} />
          <Route path="quotes-client" element={<ClientQuotes />} />
          
          {/* Default redirect */}
          <Route index element={<Navigate to="/calendar" replace />} />
        </Route>
        
        {/* Catch all - redirect to login */}
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;