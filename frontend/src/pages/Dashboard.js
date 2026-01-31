import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { governorService, buildService, dataService } from '../services/api';
import GovernorForm from '../components/GovernorForm';
import GovernorCard from '../components/GovernorCard';
import { calculateEquipmentStats, calculateArmamentStats, formatStat } from '../utils/statsCalculator';
import '../styles/Dashboard.css';

const TROOP_TYPES = ['infantry', 'cavalry', 'archer', 'leadership'];
const BUILD_TYPES = ['rally', 'garrison'];

function Dashboard() {
  // Set page title
  useEffect(() => {
    document.title = '3584 Commanders - Dashboard';
  }, []);

  const [activeTab, setActiveTab] = useState('builds');  // Default to builds tab
  const [builds, setBuilds] = useState([]);
  const [governors, setGovernors] = useState([]);
  const [equipment, setEquipment] = useState([]);
  const [inscriptions, setInscriptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [troopFilter, setTroopFilter] = useState('');
  const [buildTypeFilter, setBuildTypeFilter] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      setError('');
      const [buildsRes, governorsRes, equipmentRes, inscriptionsRes] = await Promise.all([
        buildService.getAll(troopFilter || null, buildTypeFilter || null),
        governorService.getAll(),
        dataService.getEquipment(),
        dataService.getInscriptions()
      ]);
      setBuilds(buildsRes.data.builds || []);
      setGovernors(governorsRes.data.governors || []);
      setEquipment(equipmentRes.data.equipment || []);
      setInscriptions(inscriptionsRes.data.inscriptions || []);
    } catch (err) {
      setError('Failed to load data. Please try again.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [troopFilter, buildTypeFilter]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleCreateGovernor = async (data) => {
    try {
      await governorService.create(data);
      setShowForm(false);
      loadData();
    } catch (err) {
      throw err;
    }
  };

  const handleDeleteGovernor = async (governorId) => {
    if (!window.confirm('Delete this governor and all their builds?')) return;

    try {
      await governorService.delete(governorId);
      loadData();
    } catch (err) {
      setError('Failed to delete governor');
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const countEquipment = (equipment) => {
    if (!equipment) return 0;
    // Check for both 'id' (new) and 'equipmentId' (old) for backwards compatibility
    return Object.values(equipment).filter(e => e && (e.id || e.equipmentId)).length;
  };

  const countIconicEquipment = (equipment) => {
    if (!equipment) return 0;
    return Object.values(equipment).filter(e => e && e.iconicLevel && e.iconicLevel > 0).length;
  };

  const countCritEquipment = (equipment) => {
    if (!equipment) return 0;
    // Check for both 'hasSpecialTalent' (new) and 'hasCrit' (old) for backwards compatibility
    return Object.values(equipment).filter(e => e && (e.hasSpecialTalent || e.hasCrit)).length;
  };

  const getAverageIconicLevel = (equipment) => {
    if (!equipment) return 0;
    const iconicItems = Object.values(equipment).filter(e => e && e.iconicLevel && e.iconicLevel > 0);
    if (iconicItems.length === 0) return 0;
    const sum = iconicItems.reduce((acc, e) => acc + e.iconicLevel, 0);
    return (sum / iconicItems.length).toFixed(1);
  };

  // Filter governors by search query
  const filteredGovernors = governors.filter(g =>
    g.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <h1>3584 Commanders</h1>
        <button className="btn-primary" onClick={() => setShowForm(true)}>
          + Add Governor
        </button>
      </div>

      {/* Tab Navigation - Builds first, Governors second */}
      <div className="tabs">
        <button
          className={`tab ${activeTab === 'builds' ? 'active' : ''}`}
          onClick={() => setActiveTab('builds')}
        >
          All Builds ({builds.length})
        </button>
        <button
          className={`tab ${activeTab === 'governors' ? 'active' : ''}`}
          onClick={() => setActiveTab('governors')}
        >
          Governors ({governors.length})
        </button>
      </div>

      {error && <div className="error-message">{error}</div>}

      {/* All Builds Tab - Now First */}
      {activeTab === 'builds' && (
        <>
          <div className="filters-bar">
            <div className="filter-group">
              <label>Troop Type</label>
              <select value={troopFilter} onChange={(e) => setTroopFilter(e.target.value)}>
                <option value="">All Troops</option>
                {TROOP_TYPES.map((type) => (
                  <option key={type} value={type}>
                    {type.charAt(0).toUpperCase() + type.slice(1)}
                  </option>
                ))}
              </select>
            </div>

            <div className="filter-group">
              <label>Build Type</label>
              <select value={buildTypeFilter} onChange={(e) => setBuildTypeFilter(e.target.value)}>
                <option value="">All Types</option>
                {BUILD_TYPES.map((type) => (
                  <option key={type} value={type}>
                    {type.charAt(0).toUpperCase() + type.slice(1)}
                  </option>
                ))}
              </select>
            </div>

            <div className="filter-stats">
              <span>{builds.length} builds</span>
            </div>
          </div>

          {loading ? (
            <div className="loading">
              <div className="loading-spinner"></div>
              <span>Loading builds...</span>
            </div>
          ) : builds.length === 0 ? (
            <div className="no-results">
              {troopFilter || buildTypeFilter
                ? 'No builds match your filters'
                : 'No builds yet. Add a governor and create builds to get started!'}
            </div>
          ) : (
            <div className="builds-table-container">
              <table className="builds-table">
                <thead>
                  <tr>
                    <th>Governor</th>
                    <th>Build</th>
                    <th>Commanders</th>
                    <th className="stat-header attack">ATK</th>
                    <th className="stat-header defense">DEF</th>
                    <th className="stat-header health">HP</th>
                    <th>Equipment</th>
                    <th>Iconic</th>
                    <th>Crit</th>
                    <th>Updated</th>
                  </tr>
                </thead>
                <tbody>
                  {builds.map((build) => {
                    const equipCount = countEquipment(build.equipment);
                    const iconicCount = countIconicEquipment(build.equipment);
                    const critCount = countCritEquipment(build.equipment);
                    const avgIconic = getAverageIconicLevel(build.equipment);

                    // Calculate equipment stats
                    const equipStats = calculateEquipmentStats(build.equipment || {}, equipment, build.troopType);

                    // Calculate armament stats
                    const armStats = calculateArmamentStats(build.armament || {}, inscriptions);

                    // Get manual stats
                    const manualStats = build.manualStats || {};

                    // Calculate total stats (equipment + armament + manual)
                    const stats = {
                      attack: (equipStats.attack || 0) + (armStats.attack || 0) + (manualStats.attack || 0),
                      defense: (equipStats.defense || 0) + (armStats.defense || 0) + (manualStats.defense || 0),
                      health: (equipStats.health || 0) + (armStats.health || 0) + (manualStats.health || 0),
                    };

                    return (
                      <tr
                        key={build._id}
                        onClick={() => navigate(`/governor/${build.governorId}/build/${build._id}?troopType=${build.troopType}&buildType=${build.buildType}`)}
                        className="build-row"
                      >
                        <td className="governor-name">{build.governorName}</td>
                        <td>
                          <div className="build-type-cell">
                            <span className={`troop-badge ${build.troopType}`}>
                              {build.troopType}
                            </span>
                            <span className={`build-type-badge ${build.buildType}`}>
                              {build.buildType}
                            </span>
                          </div>
                        </td>
                        <td className="commanders-cell">
                          <div className="commander-pair">
                            <span className="primary">{build.primaryCommander || '-'}</span>
                            <span className="separator">/</span>
                            <span className="secondary">{build.secondaryCommander || '-'}</span>
                          </div>
                        </td>
                        <td className="stat-cell attack">{formatStat(stats.attack) || '0%'}</td>
                        <td className="stat-cell defense">{formatStat(stats.defense) || '0%'}</td>
                        <td className="stat-cell health">{formatStat(stats.health) || '0%'}</td>
                        <td className="count-cell">{equipCount}/8</td>
                        <td className="count-cell">
                          {iconicCount > 0 ? (
                            <span className="iconic-info">
                              {iconicCount} <span className="avg-level">(avg {avgIconic})</span>
                            </span>
                          ) : '-'}
                        </td>
                        <td className="count-cell">
                          {critCount > 0 ? (
                            <span className="crit-badge">{critCount}</span>
                          ) : '-'}
                        </td>
                        <td className="date-cell">{formatDate(build.updatedAt)}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}

      {/* Governors Tab */}
      {activeTab === 'governors' && (
        <>
          <div className="search-bar">
            <input
              type="text"
              placeholder="Search governors..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          {loading ? (
            <div className="loading">
              <div className="loading-spinner"></div>
              <span>Loading governors...</span>
            </div>
          ) : filteredGovernors.length === 0 ? (
            <div className="no-results">
              {searchQuery
                ? `No governors found matching "${searchQuery}"`
                : 'No governors yet. Click "Add Governor" to get started!'}
            </div>
          ) : (
            <div className="governors-grid">
              {filteredGovernors.map((governor) => (
                <GovernorCard
                  key={governor._id}
                  governor={governor}
                  onClick={() => navigate(`/governor/${governor._id}`)}
                  onDelete={() => handleDeleteGovernor(governor._id)}
                />
              ))}
            </div>
          )}
        </>
      )}

      {showForm && (
        <GovernorForm
          onSubmit={handleCreateGovernor}
          onCancel={() => setShowForm(false)}
        />
      )}
    </div>
  );
}

export default Dashboard;
