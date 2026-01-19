import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { governorService, buildService } from '../services/api';
import GovernorForm from '../components/GovernorForm';
import '../styles/Dashboard.css';

const TROOP_TYPES = ['infantry', 'cavalry', 'archer', 'leadership'];
const BUILD_TYPES = ['rally', 'garrison'];

function Dashboard() {
  const [builds, setBuilds] = useState([]);
  const [governors, setGovernors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [troopFilter, setTroopFilter] = useState('');
  const [buildTypeFilter, setBuildTypeFilter] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    loadData();
  }, [troopFilter, buildTypeFilter]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [buildsRes, governorsRes] = await Promise.all([
        buildService.getAll(troopFilter || null, buildTypeFilter || null),
        governorService.getAll()
      ]);
      setBuilds(buildsRes.data.builds || []);
      setGovernors(governorsRes.data.governors || []);
    } catch (err) {
      setError('Failed to load data');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateGovernor = async (data) => {
    try {
      await governorService.create(data);
      setShowForm(false);
      loadData();
    } catch (err) {
      throw err;
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

  const getArmamentName = (armamentType) => {
    const names = {
      arch: 'Arch',
      wedge: 'Wedge',
      hollow_square: 'Hollow Square',
      delta: 'Delta',
      pincer: 'Pincer'
    };
    return names[armamentType] || '-';
  };

  const countEquipment = (equipment) => {
    if (!equipment) return 0;
    return Object.values(equipment).filter(e => e && e.equipmentId).length;
  };

  const countInscriptions = (inscriptions) => {
    if (!inscriptions) return 0;
    return (inscriptions.special?.length || 0) +
           (inscriptions.rare?.length || 0) +
           (inscriptions.common?.length || 0);
  };

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <h1>All Builds</h1>
        <button className="btn-primary" onClick={() => setShowForm(true)}>
          + Add Governor
        </button>
      </div>

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
          <span>{governors.length} governors</span>
        </div>
      </div>

      {error && <div className="error-message">{error}</div>}

      {loading ? (
        <div className="loading">Loading...</div>
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
                <th>Troop Type</th>
                <th>Build Type</th>
                <th>Primary</th>
                <th>Secondary</th>
                <th>Armament</th>
                <th>Equipment</th>
                <th>Inscriptions</th>
                <th>Updated</th>
              </tr>
            </thead>
            <tbody>
              {builds.map((build) => (
                <tr
                  key={build._id}
                  onClick={() => navigate(`/governor/${build.governorId}/build/${build._id}?troopType=${build.troopType}&buildType=${build.buildType}`)}
                  className="build-row"
                >
                  <td className="governor-name">{build.governorName}</td>
                  <td>
                    <span className={`troop-badge ${build.troopType}`}>
                      {build.troopType}
                    </span>
                  </td>
                  <td>
                    <span className={`build-type-badge ${build.buildType}`}>
                      {build.buildType}
                    </span>
                  </td>
                  <td>{build.primaryCommander || '-'}</td>
                  <td>{build.secondaryCommander || '-'}</td>
                  <td>{getArmamentName(build.armament?.armamentType)}</td>
                  <td className="count-cell">{countEquipment(build.equipment)}/7</td>
                  <td className="count-cell">{countInscriptions(build.inscriptions)}</td>
                  <td className="date-cell">{formatDate(build.updatedAt)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
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
