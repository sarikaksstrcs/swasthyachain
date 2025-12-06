// ============================================
// FILE: src/App.js
// ============================================
import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';

import Login from './components/auth/Login';
import Register from './components/auth/Register';
import ProtectedRoute from './components/auth/ProtectedRoute';

import MedicalRecords from './pages/MedicalRecords';
import ConsentManagement from './pages/ConsentManagement';
import AIInsights from './pages/AIInsights';
import Profile from './pages/Profile';
import NotFound from './pages/NotFound';
import Navbar from './components/layout/Navbar';
import './App.css';
import { AuthProvider } from './context/authContext';
import Dashboard from './pages/DashBoard';

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <div className="app">
          <Routes>
            {/* Public Routes */}
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            
            {/* Protected Routes */}
            <Route
              path="/*"
              element={
                <ProtectedRoute>
                  <div className="app-container">
                    <Navbar />
                    <main className="main-content">
                      <Routes>
                        <Route path="/" element={<Navigate to="/dashboard" replace />} />
                        <Route path="/dashboard" element={<Dashboard />} />
                        <Route path="/records" element={<MedicalRecords />} />
                        <Route path="/consents" element={<ConsentManagement />} />
                        <Route path="/ai-insights" element={<AIInsights />} />
                        <Route path="/profile" element={<Profile />} />
                        <Route path="*" element={<NotFound />} />
                      </Routes>
                    </main>
                  </div>
                </ProtectedRoute>
              }
            />
          </Routes>
        </div>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
