import React from 'react';
import '../styles/Header.css';

function Header({ activeTab, setActiveTab }) {
  return (
    <header className="header">
      <div className="header-content">
        <div className="logo">
          <h1>ROK Commander Calculator</h1>
          <span className="subtitle">Rally & Garrison Leaders Ranking</span>
        </div>

        <nav className="nav-tabs">
          <button
            className={`nav-tab ${activeTab === 'calculator' ? 'active' : ''}`}
            onClick={() => setActiveTab('calculator')}
          >
            Calculator
          </button>
          <button
            className={`nav-tab ${activeTab === 'leaderboard' ? 'active' : ''}`}
            onClick={() => setActiveTab('leaderboard')}
          >
            Leaderboard
          </button>
        </nav>
      </div>
    </header>
  );
}

export default Header;
