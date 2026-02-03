import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import GovernorDetail from './pages/GovernorDetail';
import BuildForm from './pages/BuildForm';
import EquipmentBrowser from './pages/EquipmentBrowser';
import Profile from './pages/Profile';
import Header from './components/Header';
import ErrorBoundary from './components/ErrorBoundary';
import './App.css';

function AppContent() {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div className="loading-screen">
        <div className="loading-spinner"></div>
        <span>Loading...</span>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Login />;
  }

  return (
    <Router>
      <div className="App">
        <Header />

        <main className="main-content">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/equipment" element={<EquipmentBrowser />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/governor/:id" element={<GovernorDetail />} />
            <Route path="/governor/:id/build/new" element={<BuildForm />} />
            <Route path="/governor/:id/build/:buildId" element={<BuildForm />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>

        <footer className="footer">
          <p>3584 Rally/Garrison Data Keeper</p>
        </footer>
      </div>
    </Router>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </ErrorBoundary>
  );
}

export default App;
