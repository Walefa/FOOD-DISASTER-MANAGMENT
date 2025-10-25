import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import ErrorBoundary from './components/ErrorBoundary';
import Dashboard from './pages/Dashboard';
import Login from './pages/Login';
import { NotificationProvider } from './contexts/NotificationContext';
import ToastContainer from './components/notifications/ToastContainer';
import WebSocketProvider from './components/WebSocketProvider';

import Disasters from './pages/Disasters';
import DisasterDetail from './pages/DisasterDetail';
import FoodSecurity from './pages/FoodSecurity';
import VulnerabilityAssessment from './pages/VulnerabilityAssessment';
import Analytics from './pages/Analytics';
import EmergencyCoordination from './pages/EmergencyCoordination';
import Maps from './pages/SimpleMap';
import Debug from './pages/Debug';







// Protected Route component
const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const token = localStorage.getItem('access_token');
  console.log('ProtectedRoute check, token exists:', !!token);
  return token ? <>{children}</> : <Navigate to="/login" />;
};

function App() {
  return (
    <ErrorBoundary>
      <NotificationProvider>
        <WebSocketProvider>
          <Router>
        <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/debug" element={<Debug />} />
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <Layout>
                <Dashboard />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/disasters"
          element={
            <ProtectedRoute>
              <Layout>
                <Disasters />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/disasters/:id"
          element={
            <ProtectedRoute>
              <Layout>
                <DisasterDetail />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/food"
          element={
            <ProtectedRoute>
              <Layout>
                <FoodSecurity />
              </Layout>
            </ProtectedRoute>
          }
        />
        { /* Food Donations feature temporarily disabled */ }
        <Route
          path="/vulnerability"
          element={
            <ProtectedRoute>
              <Layout>
                <VulnerabilityAssessment />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/analytics"
          element={
            <ProtectedRoute>
              <Layout>
                <Analytics />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/coordination"
          element={
            <ProtectedRoute>
              <Layout>
                <EmergencyCoordination />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/maps"
          element={
            <ProtectedRoute>
              <Layout>
                <Maps />
              </Layout>
            </ProtectedRoute>
          }
        />
      </Routes>
        <ToastContainer />
          </Router>
        </WebSocketProvider>
      </NotificationProvider>
    </ErrorBoundary>
  );
}

export default App;
