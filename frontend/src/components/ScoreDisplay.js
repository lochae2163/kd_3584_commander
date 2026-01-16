import React from 'react';
import '../styles/ScoreDisplay.css';

function ScoreDisplay({ result }) {
  if (!result) {
    return (
      <div className="score-display empty">
        <div className="placeholder">
          <div className="placeholder-icon">?</div>
          <h3>No Calculation Yet</h3>
          <p>Fill in your build details and click "Calculate Score" to see your results.</p>
        </div>
      </div>
    );
  }

  const { build, breakdown } = result;
  const tierColors = {
    'S+': '#ff6b6b',
    'S': '#ffd93d',
    'A': '#6bcb77',
    'B': '#4d96ff',
    'C': '#a0a0a0',
  };

  return (
    <div className="score-display">
      {/* Main Score Card */}
      <div className="main-score-card">
        <div className="tier-badge" style={{ backgroundColor: tierColors[build.tier] }}>
          {build.tier}
        </div>
        <div className="total-score">
          <span className="score-value">{build.total_score.toFixed(2)}</span>
          <span className="score-label">Total Score</span>
        </div>
        <div className="percentage">
          {build.percentage_of_max.toFixed(1)}% of max
        </div>
        <div className="player-info">
          <span className="player-name">{build.player_name}</span>
          <span className="role-name">{build.role}</span>
        </div>
      </div>

      {/* Layer Breakdown */}
      <div className="layers-breakdown">
        <h3>Score Breakdown</h3>

        {/* Layer 1 */}
        <div className="layer-card">
          <div className="layer-header">
            <span className="layer-title">Layer 1: Player Base Stats</span>
            <span className="layer-score">{breakdown.layer_1.score.toFixed(2)}</span>
          </div>
          <div className="layer-details">
            <div className="stat-item">
              <span>VIP {build.layer_1.vip_level}</span>
            </div>
            <div className="stat-item">
              <span>{build.layer_1.civilisation}</span>
            </div>
            <div className="stat-item">
              <span>{build.layer_1.city_skin}</span>
            </div>
          </div>
          <div className="stats-grid">
            {Object.entries(breakdown.layer_1.stats).map(([stat, value]) => (
              value !== 0 && (
                <div key={stat} className="stat-chip">
                  <span className="stat-name">{formatStatName(stat)}</span>
                  <span className="stat-value">+{value.toFixed(1)}</span>
                </div>
              )
            ))}
          </div>
        </div>

        {/* Layer 2 */}
        <div className="layer-card">
          <div className="layer-header">
            <span className="layer-title">Layer 2: Equipment</span>
            <span className="layer-score">{breakdown.layer_2.score.toFixed(2)}</span>
          </div>
          <div className="layer-details">
            <span>{build.layer_2.equipment_pieces.length} pieces equipped</span>
            {build.layer_2.set_bonuses.length > 0 && (
              <div className="set-bonuses">
                {build.layer_2.set_bonuses.map((bonus, idx) => (
                  <span key={idx} className="set-badge">
                    {bonus.set_name} ({bonus.pieces_count}pc)
                  </span>
                ))}
              </div>
            )}
          </div>
          <div className="stats-grid">
            {Object.entries(breakdown.layer_2.stats).map(([stat, value]) => (
              value !== 0 && (
                <div key={stat} className="stat-chip">
                  <span className="stat-name">{formatStatName(stat)}</span>
                  <span className="stat-value">+{value.toFixed(2)}</span>
                </div>
              )
            ))}
          </div>
        </div>

        {/* Layer 3 */}
        <div className="layer-card">
          <div className="layer-header">
            <span className="layer-title">Layer 3: Formation & Inscriptions</span>
            <span className="layer-score">{breakdown.layer_3.score.toFixed(2)}</span>
          </div>
          <div className="layer-details">
            <span>Formation: {build.layer_3.formation}</span>
            <span>
              Inscriptions: {
                build.layer_3.special_inscriptions.length +
                build.layer_3.rare_inscriptions.length +
                build.layer_3.common_inscriptions.length
              }
            </span>
          </div>
          {breakdown.layer_3.multipliers && (
            <div className="multipliers">
              {Object.entries(breakdown.layer_3.multipliers).map(([mult, value]) => (
                value !== 0 && (
                  <span key={mult} className="multiplier-badge">
                    {formatStatName(mult)}: +{(value * 100).toFixed(1)}%
                  </span>
                )
              ))}
            </div>
          )}
          <div className="stats-grid">
            {Object.entries(breakdown.layer_3.stats).map(([stat, value]) => (
              value !== 0 && (
                <div key={stat} className="stat-chip">
                  <span className="stat-name">{formatStatName(stat)}</span>
                  <span className="stat-value">+{value.toFixed(2)}</span>
                </div>
              )
            ))}
          </div>
        </div>
      </div>

      {/* Score Bar */}
      <div className="score-bar-container">
        <h3>Performance Rating</h3>
        <div className="score-bar">
          <div
            className="score-fill"
            style={{
              width: `${Math.min(build.percentage_of_max, 100)}%`,
              backgroundColor: tierColors[build.tier],
            }}
          />
          <div className="tier-markers">
            <span className="marker" style={{ left: '66%' }}>B</span>
            <span className="marker" style={{ left: '75%' }}>A</span>
            <span className="marker" style={{ left: '81%' }}>S</span>
            <span className="marker" style={{ left: '87.5%' }}>S+</span>
          </div>
        </div>
        <div className="score-labels">
          <span>0%</span>
          <span>100%</span>
        </div>
      </div>

      {/* Timestamp */}
      <div className="timestamp">
        Calculated: {new Date(build.createdAt).toLocaleString()}
      </div>
    </div>
  );
}

function formatStatName(stat) {
  const names = {
    attack: 'ATK',
    defense: 'DEF',
    health: 'HP',
    all_dmg: 'All DMG',
    na: 'NA',
    ca: 'CA',
    skill_dmg: 'Skill DMG',
    smite_dmg: 'Smite DMG',
    combo_dmg: 'Combo DMG',
  };
  return names[stat] || stat;
}

export default ScoreDisplay;
