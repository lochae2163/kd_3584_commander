import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { governorService, buildService } from '../services/api';
import BuildCard from '../components/BuildCard';
import GovernorForm from '../components/GovernorForm';
import '../styles/GovernorDetail.css';

const BUILD_TYPES = [
  { troopType: 'infantry', buildType: 'rally', label: 'Infantry Rally' },
  { troopType: 'infantry', buildType: 'garrison', label: 'Infantry Garrison' },
  { troopType: 'cavalry', buildType: 'rally', label: 'Cavalry Rally' },
  { troopType: 'cavalry', buildType: 'garrison', label: 'Cavalry Garrison' },
  { troopType: 'archer', buildType: 'rally', label: 'Archer Rally' },
  { troopType: 'archer', buildType: 'garrison', label: 'Archer Garrison' },
  { troopType: 'leadership', buildType: 'garrison', label: 'Leadership Garrison' },
];

function GovernorDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [governor, setGovernor] = useState(null);
  const [builds, setBuilds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showEditForm, setShowEditForm] = useState(false);

  useEffect(() => {
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  // Set page title when governor loads
  useEffect(() => {
    if (governor) {
      document.title = `${governor.name} - 3584 Commanders`;
    }
  }, [governor]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [govResponse, buildsResponse] = await Promise.all([
        governorService.getById(id),
        buildService.getByGovernor(id),
      ]);
      setGovernor(govResponse.data.governor);
      setBuilds(buildsResponse.data.builds || []);
    } catch (err) {
      setError('Failed to load governor data');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateGovernor = async (data) => {
    try {
      await governorService.update(id, data);
      setShowEditForm(false);
      loadData();
    } catch (err) {
      throw err;
    }
  };

  const handleDeleteBuild = async (buildId) => {
    if (!window.confirm('Delete this build?')) return;

    try {
      await buildService.delete(id, buildId);
      loadData();
    } catch (err) {
      setError('Failed to delete build');
    }
  };

  const getBuildForType = (troopType, buildType) => {
    return builds.find(
      (b) => b.troopType === troopType && b.buildType === buildType
    );
  };

  if (loading) {
    return <div className="loading">Loading...</div>;
  }

  if (!governor) {
    return <div className="error-message">Governor not found</div>;
  }

  return (
    <div className="governor-detail">
      <button className="back-btn" onClick={() => navigate('/')}>
        &larr; Back to Dashboard
      </button>

      <div className="governor-header">
        <div className="governor-info">
          <h1>{governor.name}</h1>
          <span className="vip-badge">VIP {governor.vipLevel}</span>
        </div>
        <button className="btn-secondary" onClick={() => setShowEditForm(true)}>
          Edit Governor
        </button>
      </div>

      {error && <div className="error-message">{error}</div>}

      <div className="builds-section">
        <h2>Builds</h2>
        <div className="builds-grid">
          {BUILD_TYPES.map(({ troopType, buildType, label }) => {
            const build = getBuildForType(troopType, buildType);
            return (
              <BuildCard
                key={`${troopType}-${buildType}`}
                label={label}
                troopType={troopType}
                buildType={buildType}
                build={build}
                governorId={id}
                onDelete={build ? () => handleDeleteBuild(build._id) : null}
              />
            );
          })}
        </div>
      </div>

      {showEditForm && (
        <GovernorForm
          governor={governor}
          onSubmit={handleUpdateGovernor}
          onCancel={() => setShowEditForm(false)}
        />
      )}
    </div>
  );
}

export default GovernorDetail;
