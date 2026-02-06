import React from 'react';
import '../styles/GovernorCard.css';

function GovernorCard({ governor, onClick, onDelete }) {
  const handleDelete = (e) => {
    e.stopPropagation();
    onDelete();
  };

  return (
    <div className="governor-card" onClick={onClick}>
      <div className="governor-card-header">
        <h3>{governor.name}</h3>
        <span className="vip-badge">VIP {governor.vipLevel}</span>
      </div>
      <div className="governor-card-body">
        <span className="build-count">
          {governor.buildCount || 0} build{governor.buildCount !== 1 ? 's' : ''}
        </span>
        <span className="marches-count">
          {governor.totalMarches || 1} march{(governor.totalMarches || 1) !== 1 ? 'es' : ''}
        </span>
      </div>
      <button className="delete-btn" onClick={handleDelete} title="Delete">
        &times;
      </button>
    </div>
  );
}

export default GovernorCard;
