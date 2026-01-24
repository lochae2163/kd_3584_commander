import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { authService } from './services/api';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import GovernorDetail from './pages/GovernorDetail';
import BuildForm from './pages/BuildForm';
import Header from './components/Header';
import ErrorBoundary from './components/ErrorBoundary';
import './App.css';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(authService.isAuthenticated());

  const handleLogin = () => {
    setIsAuthenticated(true);
  };

  const handleLogout = () => {
    authService.logout();
    setIsAuthenticated(false);
  };

  if (!isAuthenticated) {
    return (
      <ErrorBoundary>
        <Login onLogin={handleLogin} />
      </ErrorBoundary>
    );
  }

  return (
    <ErrorBoundary>
      <Router>
        <div className="App">
          <Header onLogout={handleLogout} />

          <main className="main-content">
            <Routes>
              <Route path="/" element={<Dashboard />} />
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
    </ErrorBoundary>
  );
}

export default App;
