import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import '../styles/Login.css';

function Login() {
  const [isRegistering, setIsRegistering] = useState(false);
  const [formData, setFormData] = useState({
    login: '',
    password: '',
    username: '',
    email: '',
    governorName: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { login, register } = useAuth();

  useEffect(() => {
    document.title = isRegistering
      ? '3584 Commanders - Register'
      : '3584 Commanders - Login';
  }, [isRegistering]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (isRegistering) {
        await register({
          username: formData.username,
          email: formData.email,
          password: formData.password,
          governorName: formData.governorName || undefined
        });
      } else {
        await login(formData.login, formData.password);
      }
    } catch (err) {
      setError(err.response?.data?.error || err.response?.data?.errors?.[0]?.msg || 'Authentication failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-box">
        <h1>3584 Rally/Garrison</h1>
        <p>Data Keeper</p>

        <form onSubmit={handleSubmit}>
          {isRegistering ? (
            <>
              <input
                type="text"
                name="username"
                placeholder="Username"
                value={formData.username}
                onChange={handleChange}
                disabled={loading}
                required
                minLength={3}
                maxLength={30}
              />
              <input
                type="email"
                name="email"
                placeholder="Email"
                value={formData.email}
                onChange={handleChange}
                disabled={loading}
                required
              />
              <input
                type="password"
                name="password"
                placeholder="Password (min 6 characters)"
                value={formData.password}
                onChange={handleChange}
                disabled={loading}
                required
                minLength={6}
              />
              <input
                type="text"
                name="governorName"
                placeholder="Governor Name (optional)"
                value={formData.governorName}
                onChange={handleChange}
                disabled={loading}
              />
              <p className="help-text">
                Enter your ROK governor name to link your account.
              </p>
            </>
          ) : (
            <>
              <input
                type="text"
                name="login"
                placeholder="Username or Email"
                value={formData.login}
                onChange={handleChange}
                disabled={loading}
                required
              />
              <input
                type="password"
                name="password"
                placeholder="Password"
                value={formData.password}
                onChange={handleChange}
                disabled={loading}
                required
              />
            </>
          )}

          {error && <div className="error">{error}</div>}

          <button type="submit" disabled={loading}>
            {loading ? 'Please wait...' : (isRegistering ? 'Register' : 'Login')}
          </button>
        </form>

        <div className="toggle-mode">
          <button
            type="button"
            className="link-button"
            onClick={() => {
              setIsRegistering(!isRegistering);
              setError('');
              setFormData({
                login: '',
                password: '',
                username: '',
                email: '',
                governorName: ''
              });
            }}
          >
            {isRegistering
              ? 'Already have an account? Login'
              : 'Need an account? Register'}
          </button>
        </div>
      </div>
    </div>
  );
}

export default Login;
