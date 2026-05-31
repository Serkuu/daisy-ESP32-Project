import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import AddPlant from './pages/AddPlant';
import AddGarden from './pages/AddGarden';
import GardenView from './pages/GardenView';
import PlantView from './pages/PlantView';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/add-plant" element={<AddPlant />} />
        <Route path="/add-garden" element={<AddGarden />} />
        <Route path="/garden/:id" element={<GardenView />} />
        <Route path="/plant/:id" element={<PlantView />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
