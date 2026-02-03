import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import { authService } from '../services/api';
import '../styles/Login.css';

function Login() {
  const [isRegistering, setIsRegistering] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    visibleGovernorId: '',
    password: '',
    governorName: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Verification status
  const [verificationStatus, setVerificationStatus] = useState(null);
  const [checkingVerification, setCheckingVerification] = useState(false);

  const { login, register } = useAuth();

  useEffect(() => {
    document.title = isRegistering
      ? '3584 Commanders - Register'
      : '3584 Commanders - Login';
  }, [isRegistering]);

  // Check verification status when governor ID changes (debounced)
  const checkVerification = useCallback(async (governorId) => {
    if (!governorId || governorId.length < 5) {
      setVerificationStatus(null);
      return;
    }

    setCheckingVerification(true);
    try {
      const res = await authService.checkVerification(governorId);
      setVerificationStatus(res.data);
    } catch (err) {
      setVerificationStatus(null);
    } finally {
      setCheckingVerification(false);
    }
  }, []);

  useEffect(() => {
    if (isRegistering && formData.visibleGovernorId) {
      const timer = setTimeout(() => {
        checkVerification(formData.visibleGovernorId);
      }, 500); // Debounce 500ms
      return () => clearTimeout(timer);
    } else {
      setVerificationStatus(null);
    }
  }, [formData.visibleGovernorId, isRegistering, checkVerification]);

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
          governorName: formData.governorName,
          visibleGovernorId: formData.visibleGovernorId,
          password: formData.password
        });
      } else {
        await login(formData.visibleGovernorId, formData.password);
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
        <p className="subtitle">Data Keeper</p>

        <form onSubmit={handleSubmit}>
          {isRegistering ? (
            <>
              <div className="form-group">
                <label htmlFor="governorName">Governor Name</label>
                <input
                  type="text"
                  id="governorName"
                  name="governorName"
                  placeholder="Enter your in-game name"
                  value={formData.governorName}
                  onChange={handleChange}
                  disabled={loading}
                  required
                  minLength={2}
                  maxLength={50}
                />
                <p className="help-text">Your exact in-game governor name</p>
              </div>

              <div className="form-group">
                <label htmlFor="visibleGovernorId">Governor ID</label>
                <input
                  type="text"
                  id="visibleGovernorId"
                  name="visibleGovernorId"
                  placeholder="e.g., 12345678"
                  value={formData.visibleGovernorId}
                  onChange={handleChange}
                  disabled={loading}
                  required
                  className={verificationStatus ? (verificationStatus.isVerified ? 'verified' : 'not-verified') : ''}
                />
                <p className="help-text">
                  Found in game: Profile → tap your avatar → ID shown below your name
                </p>

                {/* Verification Status */}
                {checkingVerification && (
                  <div className="verification-status checking">
                    Checking verification...
                  </div>
                )}
                {!checkingVerification && verificationStatus && (
                  <div className={`verification-status ${verificationStatus.isVerified ? 'verified' : 'not-verified'}`}>
                    {verificationStatus.isVerified ? (
                      <>
                        <span className="status-icon">✓</span>
                        {verificationStatus.whitelistEnabled
                          ? `Verified KD 3584 member: ${verificationStatus.governorName}`
                          : 'Registration open (no whitelist configured)'}
                      </>
                    ) : (
                      <>
                        <span className="status-icon">✗</span>
                        Governor ID not found in KD 3584 member list. Contact leadership if you believe this is an error.
                      </>
                    )}
                  </div>
                )}
              </div>

              <div className="form-group">
                <label htmlFor="password">Password</label>
                <div className="password-input-wrapper">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    id="password"
                    name="password"
                    placeholder="Create a password (min 6 characters)"
                    value={formData.password}
                    onChange={handleChange}
                    disabled={loading}
                    required
                    minLength={6}
                  />
                  <button
                    type="button"
                    className="password-toggle"
                    onClick={() => setShowPassword(!showPassword)}
                    tabIndex={-1}
                  >
                    {showPassword ? (
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/>
                        <line x1="1" y1="1" x2="23" y2="23"/>
                      </svg>
                    ) : (
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                        <circle cx="12" cy="12" r="3"/>
                      </svg>
                    )}
                  </button>
                </div>
                <p className="help-text">Choose a secure password you'll remember</p>
              </div>

              <div className="registration-note">
                <strong>Note:</strong> Registration is for KD 3584 governors only.
                Your Governor ID must be in our member list to register.
              </div>
            </>
          ) : (
            <>
              <div className="form-group">
                <label htmlFor="visibleGovernorId">Governor ID</label>
                <input
                  type="text"
                  id="visibleGovernorId"
                  name="visibleGovernorId"
                  placeholder="Enter your Governor ID"
                  value={formData.visibleGovernorId}
                  onChange={handleChange}
                  disabled={loading}
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="password">Password</label>
                <div className="password-input-wrapper">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    id="password"
                    name="password"
                    placeholder="Enter your password"
                    value={formData.password}
                    onChange={handleChange}
                    disabled={loading}
                    required
                  />
                  <button
                    type="button"
                    className="password-toggle"
                    onClick={() => setShowPassword(!showPassword)}
                    tabIndex={-1}
                  >
                    {showPassword ? (
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/>
                        <line x1="1" y1="1" x2="23" y2="23"/>
                      </svg>
                    ) : (
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                        <circle cx="12" cy="12" r="3"/>
                      </svg>
                    )}
                  </button>
                </div>
              </div>
            </>
          )}

          {error && <div className="error">{error}</div>}

          <button type="submit" className="submit-btn" disabled={loading}>
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
              setShowPassword(false);
              setVerificationStatus(null);
              setFormData({
                visibleGovernorId: '',
                password: '',
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
