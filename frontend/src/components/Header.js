import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import '../styles/Header.css';

function Header() {
  const navigate = useNavigate();
  const { user, governor, logout, isAdmin } = useAuth();

  return (
    <header className="header">
      <div className="header-content">
        <div className="logo" onClick={() => navigate('/')} style={{ cursor: 'pointer' }}>
          <h1>3584 Rally/Garrison Data Keeper</h1>
        </div>

        <div className="header-right">
          <div className="user-info">
            {governor && (
              <span
                className="governor-name"
                onClick={() => navigate(`/governor/${governor._id}`)}
              >
                {governor.name}
              </span>
            )}
            <span className="governor-id">ID: {user?.visibleGovernorId}</span>
            {isAdmin && <span className="admin-badge">Admin</span>}
          </div>

          <button
            className="equipment-btn"
            onClick={() => navigate('/equipment')}
          >
            Equipment
          </button>

          {governor && (
            <button
              className="my-builds-btn"
              onClick={() => navigate(`/governor/${governor._id}`)}
            >
              My Builds
            </button>
          )}

          <button
            className="profile-btn"
            onClick={() => navigate('/profile')}
          >
            Profile
          </button>

          <button className="logout-btn" onClick={logout}>
            Logout
          </button>
        </div>
      </div>
    </header>
  );
}

export default Header;
