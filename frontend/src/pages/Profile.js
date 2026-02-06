import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../context/AuthContext';
import { authService, governorService } from '../services/api';
import '../styles/Profile.css';

function Profile() {
  const { t, i18n } = useTranslation('profile');
  const { user, governor, logout, updateGovernor } = useAuth();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState('info');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  // Change password form
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false
  });

  // Change name form
  const [nameForm, setNameForm] = useState({
    newName: ''
  });

  // Delete account form
  const [deleteForm, setDeleteForm] = useState({
    password: '',
    deleteGovernor: false,
    confirmText: ''
  });

  // Total marches
  const [totalMarches, setTotalMarches] = useState(governor?.totalMarches || 1);
  const [savingMarches, setSavingMarches] = useState(false);

  useEffect(() => {
    document.title = t('pageTitle');
  }, [t]);

  useEffect(() => {
    if (governor) {
      setNameForm({ newName: governor.name });
      setTotalMarches(governor.totalMarches || 1);
    }
  }, [governor]);

  const handleMarchesChange = async (newValue) => {
    const value = parseInt(newValue, 10);
    setTotalMarches(value);
    setSavingMarches(true);
    try {
      const response = await governorService.update(governor._id, { totalMarches: value });
      updateGovernor(response.data.governor);
      showMessage('success', t('messages.marchesUpdated'));
    } catch (err) {
      showMessage('error', t('errors.failedToUpdateMarches'));
      setTotalMarches(governor?.totalMarches || 1);
    } finally {
      setSavingMarches(false);
    }
  };

  const showMessage = (type, text) => {
    setMessage({ type, text });
    setTimeout(() => setMessage({ type: '', text: '' }), 5000);
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    setMessage({ type: '', text: '' });

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      showMessage('error', t('errors.passwordsMismatch'));
      return;
    }

    if (passwordForm.newPassword.length < 6) {
      showMessage('error', t('errors.passwordTooShort'));
      return;
    }

    setLoading(true);
    try {
      await authService.changePassword(passwordForm.currentPassword, passwordForm.newPassword);
      showMessage('success', t('messages.passwordChanged'));
      setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (err) {
      showMessage('error', err.response?.data?.error || t('errors.failedToChangePassword'));
    } finally {
      setLoading(false);
    }
  };

  const handleChangeName = async (e) => {
    e.preventDefault();
    setMessage({ type: '', text: '' });

    if (nameForm.newName.trim().length < 2) {
      showMessage('error', t('errors.nameTooShort'));
      return;
    }

    setLoading(true);
    try {
      const response = await authService.updateGovernorName(nameForm.newName);
      updateGovernor(response.data.governor);
      showMessage('success', t('messages.nameUpdated'));
    } catch (err) {
      showMessage('error', err.response?.data?.error || t('errors.failedToUpdateName'));
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteAccount = async (e) => {
    e.preventDefault();
    setMessage({ type: '', text: '' });

    if (deleteForm.confirmText !== 'DELETE') {
      showMessage('error', t('errors.typeDeleteToConfirm'));
      return;
    }

    setLoading(true);
    try {
      await authService.deleteAccount(deleteForm.password, deleteForm.deleteGovernor);
      logout();
      navigate('/');
    } catch (err) {
      showMessage('error', err.response?.data?.error || t('errors.failedToDeleteAccount'));
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return t('info.na');
    const date = new Date(dateString);
    return date.toLocaleDateString(i18n.language === 'ja' ? 'ja-JP' : 'en-US');
  };

  const PasswordToggle = ({ field, show, onToggle }) => (
    <button
      type="button"
      className="password-toggle"
      onClick={() => onToggle(field)}
      tabIndex={-1}
    >
      {show ? (
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
  );

  return (
    <div className="profile-page">
      <button className="back-btn" onClick={() => navigate('/')}>
        &larr; {t('backToDashboard')}
      </button>

      <h1>{t('title')}</h1>

      {message.text && (
        <div className={`message ${message.type}`}>
          {message.text}
        </div>
      )}

      <div className="profile-tabs">
        <button
          className={`tab-btn ${activeTab === 'info' ? 'active' : ''}`}
          onClick={() => setActiveTab('info')}
        >
          {t('tabs.info')}
        </button>
        <button
          className={`tab-btn ${activeTab === 'password' ? 'active' : ''}`}
          onClick={() => setActiveTab('password')}
        >
          {t('tabs.password')}
        </button>
        <button
          className={`tab-btn ${activeTab === 'name' ? 'active' : ''}`}
          onClick={() => setActiveTab('name')}
        >
          {t('tabs.name')}
        </button>
        <button
          className={`tab-btn ${activeTab === 'delete' ? 'active' : ''}`}
          onClick={() => setActiveTab('delete')}
        >
          {t('tabs.danger')}
        </button>
      </div>

      <div className="profile-content">
        {/* Account Info Tab */}
        {activeTab === 'info' && (
          <div className="profile-section">
            <h2>{t('info.title')}</h2>
            <div className="info-grid">
              <div className="info-item">
                <label>{t('info.governorId')}</label>
                <span>{user?.visibleGovernorId}</span>
              </div>
              <div className="info-item">
                <label>{t('info.governorName')}</label>
                <span>{governor?.name || t('info.notLinked')}</span>
              </div>
              <div className="info-item">
                <label>{t('info.accountType')}</label>
                <span className={`role-badge ${user?.role}`}>{t(`roles.${user?.role}`)}</span>
              </div>
              <div className="info-item">
                <label>{t('info.accountCreated')}</label>
                <span>{formatDate(user?.createdAt)}</span>
              </div>
            </div>

            <div className="marches-section">
              <h3>{t('marches.title')}</h3>
              <p className="help-text">{t('marches.help')}</p>
              <div className="marches-select-wrapper">
                <select
                  value={totalMarches}
                  onChange={(e) => handleMarchesChange(e.target.value)}
                  disabled={savingMarches}
                  className="marches-select"
                >
                  {[1, 2, 3, 4, 5, 6, 7].map(num => (
                    <option key={num} value={num}>
                      {num > 1 ? t('marches.marches', { count: num }) : t('marches.march', { count: num })}
                    </option>
                  ))}
                </select>
                {savingMarches && <span className="saving-indicator">{t('common:status.saving')}</span>}
              </div>
            </div>
          </div>
        )}

        {/* Change Password Tab */}
        {activeTab === 'password' && (
          <div className="profile-section">
            <h2>{t('password.title')}</h2>
            <form onSubmit={handleChangePassword}>
              <div className="form-group">
                <label>{t('password.current')}</label>
                <div className="password-input-wrapper">
                  <input
                    type={showPasswords.current ? 'text' : 'password'}
                    value={passwordForm.currentPassword}
                    onChange={(e) => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })}
                    required
                    disabled={loading}
                  />
                  <PasswordToggle
                    field="current"
                    show={showPasswords.current}
                    onToggle={(f) => setShowPasswords({ ...showPasswords, [f]: !showPasswords[f] })}
                  />
                </div>
              </div>

              <div className="form-group">
                <label>{t('password.new')}</label>
                <div className="password-input-wrapper">
                  <input
                    type={showPasswords.new ? 'text' : 'password'}
                    value={passwordForm.newPassword}
                    onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                    required
                    minLength={6}
                    disabled={loading}
                  />
                  <PasswordToggle
                    field="new"
                    show={showPasswords.new}
                    onToggle={(f) => setShowPasswords({ ...showPasswords, [f]: !showPasswords[f] })}
                  />
                </div>
                <p className="help-text">{t('password.minLength')}</p>
              </div>

              <div className="form-group">
                <label>{t('password.confirm')}</label>
                <div className="password-input-wrapper">
                  <input
                    type={showPasswords.confirm ? 'text' : 'password'}
                    value={passwordForm.confirmPassword}
                    onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
                    required
                    disabled={loading}
                  />
                  <PasswordToggle
                    field="confirm"
                    show={showPasswords.confirm}
                    onToggle={(f) => setShowPasswords({ ...showPasswords, [f]: !showPasswords[f] })}
                  />
                </div>
              </div>

              <button type="submit" className="btn-primary" disabled={loading}>
                {loading ? t('common:status.saving') : t('password.submit')}
              </button>
            </form>
          </div>
        )}

        {/* Change Name Tab */}
        {activeTab === 'name' && (
          <div className="profile-section">
            <h2>{t('name.title')}</h2>
            <form onSubmit={handleChangeName}>
              <div className="form-group">
                <label>{t('name.new')}</label>
                <input
                  type="text"
                  value={nameForm.newName}
                  onChange={(e) => setNameForm({ newName: e.target.value })}
                  required
                  minLength={2}
                  maxLength={50}
                  disabled={loading}
                />
                <p className="help-text">{t('name.help')}</p>
              </div>

              <button type="submit" className="btn-primary" disabled={loading}>
                {loading ? t('common:status.saving') : t('name.submit')}
              </button>
            </form>
          </div>
        )}

        {/* Delete Account Tab */}
        {activeTab === 'delete' && (
          <div className="profile-section danger-zone">
            <h2>{t('danger.title')}</h2>
            <div className="warning-box">
              <strong>{t('danger.warning')}</strong>
            </div>

            <form onSubmit={handleDeleteAccount}>
              <div className="form-group">
                <label>{t('danger.password')}</label>
                <input
                  type="password"
                  value={deleteForm.password}
                  onChange={(e) => setDeleteForm({ ...deleteForm, password: e.target.value })}
                  required
                  disabled={loading}
                  placeholder={t('danger.passwordPlaceholder')}
                />
              </div>

              <div className="form-group checkbox-group">
                <label>
                  <input
                    type="checkbox"
                    checked={deleteForm.deleteGovernor}
                    onChange={(e) => setDeleteForm({ ...deleteForm, deleteGovernor: e.target.checked })}
                    disabled={loading}
                  />
                  <span>{t('danger.deleteGovernor')}</span>
                </label>
                <p className="help-text">{t('danger.deleteGovernorHelp')}</p>
              </div>

              <div className="form-group">
                <label>{t('danger.confirmText')}</label>
                <input
                  type="text"
                  value={deleteForm.confirmText}
                  onChange={(e) => setDeleteForm({ ...deleteForm, confirmText: e.target.value })}
                  required
                  disabled={loading}
                  placeholder="DELETE"
                />
              </div>

              <button
                type="submit"
                className="btn-danger"
                disabled={loading || deleteForm.confirmText !== 'DELETE'}
              >
                {loading ? t('common:status.deleting') : t('danger.submit')}
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}

export default Profile;
