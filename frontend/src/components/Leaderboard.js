import React, { useState, useEffect } from 'react';
import { dataService, calculatorService } from '../services/api';
import '../styles/Leaderboard.css';

function Leaderboard() {
  const [roles, setRoles] = useState([]);
  const [selectedRole, setSelectedRole] = useState('');
  const [builds, setBuilds] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Load roles on mount
  useEffect(() => {
    const loadRoles = async () => {
      try {
        const response = await dataService.getRoles();
        const rolesList = response.data.roles || [];
        setRoles(rolesList);
        if (rolesList.length > 0) {
          setSelectedRole(rolesList[0].role_id);
        }
      } catch (err) {
        console.error('Error loading roles:', err);
        setError('Failed to load roles');
      }
    };
    loadRoles();
  }, []);

  // Load leaderboard when role changes
  useEffect(() => {
    if (!selectedRole) return;

    const loadLeaderboard = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await calculatorService.getLeaderboard(selectedRole, 100);
        setBuilds(response.data.builds || []);
      } catch (err) {
        console.error('Error loading leaderboard:', err);
        setError('Failed to load leaderboard');
        setBuilds([]);
      } finally {
        setLoading(false);
      }
    };
    loadLeaderboard();
  }, [selectedRole]);

  const tierColors = {
    'S+': '#ff6b6b',
    'S': '#ffd93d',
    'A': '#6bcb77',
    'B': '#4d96ff',
    'C': '#a0a0a0',
  };

  const getRankMedal = (index) => {
    if (index === 0) return { emoji: '1st', color: '#ffd700' };
    if (index === 1) return { emoji: '2nd', color: '#c0c0c0' };
    if (index === 2) return { emoji: '3rd', color: '#cd7f32' };
    return null;
  };

  return (
    <div className="leaderboard">
      <div className="leaderboard-header">
        <h2>Leaderboard</h2>
        <p>See how your friends rank in each commander role</p>
      </div>

      <div className="role-selector">
        <label>Select Role:</label>
        <select
          value={selectedRole}
          onChange={(e) => setSelectedRole(e.target.value)}
        >
          {roles.map(role => (
            <option key={role.role_id} value={role.role_id}>
              {role.role_id}
            </option>
          ))}
        </select>
      </div>

      {error && <div className="error-message">{error}</div>}

      {loading ? (
        <div className="loading-state">
          <div className="loading-spinner"></div>
          <p>Loading leaderboard...</p>
        </div>
      ) : builds.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">-</div>
          <h3>No Builds Yet</h3>
          <p>Be the first to calculate a build for this role!</p>
        </div>
      ) : (
        <div className="leaderboard-table-container">
          <table className="leaderboard-table">
            <thead>
              <tr>
                <th>Rank</th>
                <th>Player</th>
                <th>Score</th>
                <th>Tier</th>
                <th>% of Max</th>
                <th>Date</th>
              </tr>
            </thead>
            <tbody>
              {builds.map((build, index) => {
                const medal = getRankMedal(index);
                return (
                  <tr key={build._id} className={medal ? 'top-three' : ''}>
                    <td className="rank-cell">
                      {medal ? (
                        <span className="rank-medal" style={{ color: medal.color }}>
                          {medal.emoji}
                        </span>
                      ) : (
                        <span className="rank-number">{index + 1}</span>
                      )}
                    </td>
                    <td className="player-cell">
                      <span className="player-name">{build.player_name}</span>
                    </td>
                    <td className="score-cell">
                      <span className="score-value">{build.total_score.toFixed(2)}</span>
                    </td>
                    <td className="tier-cell">
                      <span
                        className="tier-badge"
                        style={{ backgroundColor: tierColors[build.tier] }}
                      >
                        {build.tier}
                      </span>
                    </td>
                    <td className="percentage-cell">
                      <div className="percentage-bar">
                        <div
                          className="percentage-fill"
                          style={{
                            width: `${Math.min(build.percentage_of_max, 100)}%`,
                            backgroundColor: tierColors[build.tier],
                          }}
                        />
                        <span className="percentage-text">
                          {build.percentage_of_max.toFixed(1)}%
                        </span>
                      </div>
                    </td>
                    <td className="date-cell">
                      {new Date(build.createdAt).toLocaleDateString()}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Role Stats Summary */}
      {builds.length > 0 && (
        <div className="role-stats">
          <h3>Role Statistics</h3>
          <div className="stats-cards">
            <div className="stat-card">
              <span className="stat-label">Total Builds</span>
              <span className="stat-value">{builds.length}</span>
            </div>
            <div className="stat-card">
              <span className="stat-label">Highest Score</span>
              <span className="stat-value">{builds[0]?.total_score.toFixed(2) || '-'}</span>
            </div>
            <div className="stat-card">
              <span className="stat-label">Average Score</span>
              <span className="stat-value">
                {(builds.reduce((sum, b) => sum + b.total_score, 0) / builds.length).toFixed(2)}
              </span>
            </div>
            <div className="stat-card">
              <span className="stat-label">S+ Tier Builds</span>
              <span className="stat-value">
                {builds.filter(b => b.tier === 'S+').length}
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Leaderboard;
