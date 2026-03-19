import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import RoutesPage from './pages/Routes';
import Drivers from './pages/Drivers';
import Buses from './pages/Buses';
import Reports from './pages/Reports';
import LiveTracking from './pages/LiveTracking';
import Settings from './pages/Settings';
import Layout from './components/Layout';
import ProtectedRoute from './components/ProtectedRoute';

function App() {
  return (
    <Router>
      <Routes>
        {/* Public Route */}
        <Route path="/login" element={<Login />} />
        
        {/* Protected Routes */}
        <Route path="/dashboard" element={
          <ProtectedRoute>
            <Layout>
              <Dashboard />
            </Layout>
          </ProtectedRoute>
        } />
        
        <Route path="/routes" element={
          <ProtectedRoute>
            <Layout>
              <RoutesPage />
            </Layout>
          </ProtectedRoute>
        } />
        
        <Route path="/drivers" element={
          <ProtectedRoute>
            <Layout>
              <Drivers />
            </Layout>
          </ProtectedRoute>
        } />
        
        <Route path="/buses" element={
          <ProtectedRoute>
            <Layout>
              <Buses />
            </Layout>
          </ProtectedRoute>
        } />
        
        <Route path="/live-tracking" element={
          <ProtectedRoute>
            <Layout>
              <LiveTracking />
            </Layout>
          </ProtectedRoute>
        } />
        
        <Route path="/reports" element={
          <ProtectedRoute>
            <Layout>
              <Reports />
            </Layout>
          </ProtectedRoute>
        } />
        
        <Route path="/settings" element={
          <ProtectedRoute>
            <Layout>
              <Settings />
            </Layout>
          </ProtectedRoute>
        } />
        
        {/* Default redirect */}
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        
        {/* Catch all - redirect to dashboard */}
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </Router>
  );
}

export default App;