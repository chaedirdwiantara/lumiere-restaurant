import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { AdminLayout } from './components/layout';
import ProtectedRoute from './components/ProtectedRoute';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Gallery from './pages/Gallery';
import HomeContentPage from './pages/HomeContent';
import { CursorFollower } from '../components/ui/CursorFollower';

const AdminApp: React.FC = () => {
  return (
    <AuthProvider>
      <Router>
        <CursorFollower />
        <div className="min-h-screen bg-gray-900">
          <Routes>
            {/* Public Routes */}
            <Route path="/admin/login" element={<Login />} />
            
            {/* Protected Admin Routes */}
            <Route
              path="/admin/dashboard"
              element={
                <ProtectedRoute>
                  <AdminLayout>
                    <Dashboard />
                  </AdminLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/gallery"
              element={
                <ProtectedRoute>
                  <AdminLayout>
                    <Gallery />
                  </AdminLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/home-content"
              element={
                <ProtectedRoute>
                  <AdminLayout>
                    <HomeContentPage />
                  </AdminLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/settings"
              element={
                <ProtectedRoute>
                  <AdminLayout>
                    <div className="p-6">
                      <h1 className="text-3xl font-bold text-white mb-4">Settings</h1>
                      <p className="text-gray-400">Settings page coming soon...</p>
                    </div>
                  </AdminLayout>
                </ProtectedRoute>
              }
            />
            
            {/* Default redirects */}
            <Route path="/admin" element={<Navigate to="/admin/dashboard" replace />} />
            <Route path="/admin/*" element={<Navigate to="/admin/dashboard" replace />} />
          </Routes>
        </div>
      </Router>
    </AuthProvider>
  );
};

export default AdminApp;