import React from 'react';
import { useTranslation } from 'react-i18next';
import '../styles/GovernorCard.css';

function GovernorCard({ governor, onClick, onDelete }) {
  const { t } = useTranslation('governor');

  const handleDelete = (e) => {
    e.stopPropagation();
    onDelete();
  };

  const buildCount = governor.buildCount || 0;
  const marchCount = governor.totalMarches || 1;

  return (
    <div className="governor-card" onClick={onClick}>
      <div className="governor-card-header">
        <h3>{governor.name}</h3>
        <span className="vip-badge">{t('common:labels.vip')} {governor.vipLevel}</span>
      </div>
      <div className="governor-card-body">
        <span className="build-count">
          {t('card.builds', { count: buildCount })}
        </span>
        <span className="marches-count">
          {t('card.marches', { count: marchCount })}
        </span>
      </div>
      <button className="delete-btn" onClick={handleDelete} title={t('common:buttons.delete')}>
        &times;
      </button>
    </div>
  );
}

export default GovernorCard;
