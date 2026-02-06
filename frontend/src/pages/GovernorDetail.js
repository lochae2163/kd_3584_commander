import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { governorService, buildService } from '../services/api';
import BuildCard from '../components/BuildCard';
import GovernorForm from '../components/GovernorForm';
import '../styles/GovernorDetail.css';

function GovernorDetail() {
  const { t } = useTranslation('governor');
  const { id } = useParams();
  const navigate = useNavigate();
  const [governor, setGovernor] = useState(null);
  const [builds, setBuilds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showEditForm, setShowEditForm] = useState(false);

  const BUILD_TYPES = [
    { troopType: 'infantry', buildType: 'rally', labelKey: 'buildLabels.infantryRally' },
    { troopType: 'infantry', buildType: 'garrison', labelKey: 'buildLabels.infantryGarrison' },
    { troopType: 'cavalry', buildType: 'rally', labelKey: 'buildLabels.cavalryRally' },
    { troopType: 'cavalry', buildType: 'garrison', labelKey: 'buildLabels.cavalryGarrison' },
    { troopType: 'archer', buildType: 'rally', labelKey: 'buildLabels.archerRally' },
    { troopType: 'archer', buildType: 'garrison', labelKey: 'buildLabels.archerGarrison' },
    { troopType: 'leadership', buildType: 'garrison', labelKey: 'buildLabels.leadershipGarrison' },
  ];

  useEffect(() => {
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  // Set page title when governor loads
  useEffect(() => {
    if (governor) {
      document.title = t('pageTitle', { name: governor.name });
    }
  }, [governor, t]);

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
      setError(t('errors.failedToLoad'));
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
    if (!window.confirm(t('confirm.deleteBuild'))) return;

    try {
      await buildService.delete(id, buildId);
      loadData();
    } catch (err) {
      setError(t('errors.failedToDelete'));
    }
  };

  const getBuildForType = (troopType, buildType) => {
    return builds.find(
      (b) => b.troopType === troopType && b.buildType === buildType
    );
  };

  if (loading) {
    return (
      <div className="loading">
        <div className="loading-spinner"></div>
        <span>{t('loading')}</span>
      </div>
    );
  }

  if (!governor) {
    return <div className="error-message">{t('notFound')}</div>;
  }

  return (
    <div className="governor-detail">
      <button className="back-btn" onClick={() => navigate('/')}>
        &larr; {t('backToDashboard')}
      </button>

      <div className="governor-header">
        <div className="governor-info">
          <h1>{governor.name}</h1>
          <span className="vip-badge">{t('common:labels.vip')} {governor.vipLevel}</span>
        </div>
        <button className="btn-secondary" onClick={() => setShowEditForm(true)}>
          {t('editGovernor')}
        </button>
      </div>

      {error && <div className="error-message">{error}</div>}

      <div className="builds-section">
        <h2>{t('sections.builds')}</h2>
        <div className="builds-grid">
          {BUILD_TYPES.map(({ troopType, buildType, labelKey }) => {
            const build = getBuildForType(troopType, buildType);
            return (
              <BuildCard
                key={`${troopType}-${buildType}`}
                label={t(labelKey)}
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
