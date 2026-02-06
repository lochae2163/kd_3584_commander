import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../context/AuthContext';
import LanguageSwitcher from './LanguageSwitcher';
import '../styles/Header.css';

function Header() {
  const navigate = useNavigate();
  const { user, governor, logout, isAdmin } = useAuth();
  const { t } = useTranslation();

  return (
    <header className="header">
      <div className="header-content">
        <div className="logo" onClick={() => navigate('/')} style={{ cursor: 'pointer' }}>
          <h1>{t('appName')}</h1>
        </div>

        <div className="header-right">
          <LanguageSwitcher />

          <div className="user-info">
            {governor && (
              <span
                className="governor-name"
                onClick={() => navigate(`/governor/${governor._id}`)}
              >
                {governor.name}
              </span>
            )}
            <span className="governor-id">{t('labels.governorId')}: {user?.visibleGovernorId}</span>
            {isAdmin && <span className="admin-badge">{t('labels.admin')}</span>}
          </div>

          <button
            className="equipment-btn"
            onClick={() => navigate('/equipment')}
          >
            {t('nav.equipment')}
          </button>

          {governor && (
            <button
              className="my-builds-btn"
              onClick={() => navigate(`/governor/${governor._id}`)}
            >
              {t('nav.myBuilds')}
            </button>
          )}

          <button
            className="profile-btn"
            onClick={() => navigate('/profile')}
          >
            {t('nav.profile')}
          </button>

          {isAdmin && (
            <button
              className="admin-btn"
              onClick={() => navigate('/admin')}
            >
              {t('nav.adminPanel')}
            </button>
          )}

          <button className="logout-btn" onClick={logout}>
            {t('nav.logout')}
          </button>
        </div>
      </div>
    </header>
  );
}

export default Header;
