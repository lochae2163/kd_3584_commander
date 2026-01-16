import React, { useState } from 'react';
import '../styles/InscriptionSelector.css';

function InscriptionSelector({
  allInscriptions,
  specialInscriptions,
  rareInscriptions,
  commonInscriptions,
  onSpecialChange,
  onRareChange,
  onCommonChange,
}) {
  const [searchTerm, setSearchTerm] = useState('');

  // Since all inscriptions are marked as COMMON in the data,
  // we'll show them all and let users select any for any category
  const filteredInscriptions = allInscriptions.filter(insc =>
    insc.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleToggle = (inscriptionId, currentList, setList) => {
    if (currentList.includes(inscriptionId)) {
      setList(currentList.filter(id => id !== inscriptionId));
    } else {
      setList([...currentList, inscriptionId]);
    }
  };

  const getSelectionCategory = (inscriptionId) => {
    if (specialInscriptions.includes(inscriptionId)) return 'special';
    if (rareInscriptions.includes(inscriptionId)) return 'rare';
    if (commonInscriptions.includes(inscriptionId)) return 'common';
    return null;
  };

  return (
    <div className="inscription-selector">
      {/* Search */}
      <div className="inscription-search">
        <input
          type="text"
          placeholder="Search inscriptions..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="search-input"
        />
      </div>

      {/* Selected counts */}
      <div className="selection-summary">
        <span className="summary-item special">Special: {specialInscriptions.length}</span>
        <span className="summary-item rare">Rare: {rareInscriptions.length}</span>
        <span className="summary-item common">Common: {commonInscriptions.length}</span>
      </div>

      {/* All Inscriptions */}
      <div className="inscription-category">
        <h4>Select Inscriptions <span className="count">({filteredInscriptions.length} available)</span></h4>
        <p className="category-hint">Click to add to Special, Shift+Click for Rare, Ctrl+Click for Common</p>
        <div className="inscription-chips">
          {filteredInscriptions.map(insc => {
            const category = getSelectionCategory(insc.inscription_id);
            return (
              <button
                key={insc.inscription_id}
                className={`inscription-chip ${category || ''} ${category ? 'selected' : ''}`}
                onClick={(e) => {
                  if (category) {
                    // Remove from current category
                    if (category === 'special') {
                      handleToggle(insc.inscription_id, specialInscriptions, onSpecialChange);
                    } else if (category === 'rare') {
                      handleToggle(insc.inscription_id, rareInscriptions, onRareChange);
                    } else {
                      handleToggle(insc.inscription_id, commonInscriptions, onCommonChange);
                    }
                  } else {
                    // Add to category based on modifier key
                    if (e.shiftKey) {
                      handleToggle(insc.inscription_id, rareInscriptions, onRareChange);
                    } else if (e.ctrlKey || e.metaKey) {
                      handleToggle(insc.inscription_id, commonInscriptions, onCommonChange);
                    } else {
                      handleToggle(insc.inscription_id, specialInscriptions, onSpecialChange);
                    }
                  }
                }}
                title={`${insc.name}\nClick: Special | Shift+Click: Rare | Ctrl+Click: Common`}
              >
                {insc.name}
                {category && <span className="category-badge">{category[0].toUpperCase()}</span>}
              </button>
            );
          })}
        </div>
      </div>

      {/* Selected Lists */}
      {specialInscriptions.length > 0 && (
        <div className="selected-list">
          <h5>Special ({specialInscriptions.length})</h5>
          <div className="selected-chips">
            {specialInscriptions.map(id => {
              const insc = allInscriptions.find(i => i.inscription_id === id);
              return insc ? (
                <span key={id} className="selected-chip special" onClick={() => handleToggle(id, specialInscriptions, onSpecialChange)}>
                  {insc.name} ×
                </span>
              ) : null;
            })}
          </div>
        </div>
      )}

      {rareInscriptions.length > 0 && (
        <div className="selected-list">
          <h5>Rare ({rareInscriptions.length})</h5>
          <div className="selected-chips">
            {rareInscriptions.map(id => {
              const insc = allInscriptions.find(i => i.inscription_id === id);
              return insc ? (
                <span key={id} className="selected-chip rare" onClick={() => handleToggle(id, rareInscriptions, onRareChange)}>
                  {insc.name} ×
                </span>
              ) : null;
            })}
          </div>
        </div>
      )}

      {commonInscriptions.length > 0 && (
        <div className="selected-list">
          <h5>Common ({commonInscriptions.length})</h5>
          <div className="selected-chips">
            {commonInscriptions.map(id => {
              const insc = allInscriptions.find(i => i.inscription_id === id);
              return insc ? (
                <span key={id} className="selected-chip common" onClick={() => handleToggle(id, commonInscriptions, onCommonChange)}>
                  {insc.name} ×
                </span>
              ) : null;
            })}
          </div>
        </div>
      )}
    </div>
  );
}

export default InscriptionSelector;
