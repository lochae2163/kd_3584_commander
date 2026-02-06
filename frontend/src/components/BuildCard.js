import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import '../styles/BuildCard.css';

function BuildCard({ label, troopType, buildType, build, governorId, onDelete }) {
  const navigate = useNavigate();
  const { t } = useTranslation('build');

  const handleClick = () => {
    if (build) {
      navigate(`/governor/${governorId}/build/${build._id}?troopType=${troopType}&buildType=${buildType}`);
    } else {
      navigate(`/governor/${governorId}/build/new?troopType=${troopType}&buildType=${buildType}`);
    }
  };

  const handleDelete = (e) => {
    e.stopPropagation();
    onDelete();
  };

  const getTroopTypeClass = () => {
    return `troop-${troopType}`;
  };

  const equipmentCount = Object.entries(build?.equipment || {}).filter(([_, eq]) => eq?.name).length;

  return (
    <div className={`build-card ${getTroopTypeClass()} ${build ? 'has-build' : 'empty'}`} onClick={handleClick}>
      <div className="build-card-header">
        <h3>{label}</h3>
        {build && onDelete && (
          <button className="delete-btn" onClick={handleDelete} title={t('common:buttons.delete')}>
            &times;
          </button>
        )}
      </div>

      {build ? (
        <div className="build-card-content">
          <div className="commanders">
            <div className="commander primary">
              <span className="commander-label">{t('card.primary')}</span>
              <span className="commander-name">{build.primaryCommander || t('card.notSet')}</span>
            </div>
            <div className="commander secondary">
              <span className="commander-label">{t('card.secondary')}</span>
              <span className="commander-name">{build.secondaryCommander || t('card.notSet')}</span>
            </div>
          </div>

          <div className="equipment-summary">
            {t('card.equipmentCount', { count: equipmentCount })}
          </div>
        </div>
      ) : (
        <div className="build-card-empty">
          <span className="plus-icon">+</span>
          <span>{t('card.addBuild')}</span>
        </div>
      )}
    </div>
  );
}

export default BuildCard;
