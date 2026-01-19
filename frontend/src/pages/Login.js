import React, { useState, useEffect } from 'react';
import { authService, setAuthPassword } from '../services/api';
import '../styles/Login.css';

function Login({ onLogin }) {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Set page title
  useEffect(() => {
    document.title = '3584 Commanders - Login';
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await authService.verifyPassword(password);
      setAuthPassword(password);
      onLogin();
    } catch (err) {
      setError('Invalid password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-box">
        <h1>3584 Commanders</h1>
        <p>Alliance Build Tracker</p>

        <form onSubmit={handleSubmit}>
          <input
            type="password"
            placeholder="Enter password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            disabled={loading}
          />

          {error && <div className="error">{error}</div>}

          <button type="submit" disabled={loading || !password}>
            {loading ? 'Verifying...' : 'Enter'}
          </button>
        </form>
      </div>
    </div>
  );
}

export default Login;
