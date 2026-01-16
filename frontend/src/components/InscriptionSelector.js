import React from 'react';
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
  const getByRarity = (rarity) => {
    return allInscriptions.filter(insc => insc.rarity === rarity);
  };

  const handleToggle = (inscriptionId, currentList, setList) => {
    if (currentList.includes(inscriptionId)) {
      setList(currentList.filter(id => id !== inscriptionId));
    } else {
      setList([...currentList, inscriptionId]);
    }
  };

  const specialList = getByRarity('SPECIAL');
  const rareList = getByRarity('RARE');
  const commonList = getByRarity('COMMON');

  return (
    <div className="inscription-selector">
      {/* Special Inscriptions */}
      <div className="inscription-category">
        <h4>Special Inscriptions <span className="count">({specialInscriptions.length} selected)</span></h4>
        <div className="inscription-chips">
          {specialList.map(insc => (
            <button
              key={insc.inscription_id}
              className={`inscription-chip special ${specialInscriptions.includes(insc.inscription_id) ? 'selected' : ''}`}
              onClick={() => handleToggle(insc.inscription_id, specialInscriptions, onSpecialChange)}
            >
              {insc.name}
            </button>
          ))}
        </div>
      </div>

      {/* Rare Inscriptions */}
      <div className="inscription-category">
        <h4>Rare Inscriptions <span className="count">({rareInscriptions.length} selected)</span></h4>
        <div className="inscription-chips">
          {rareList.map(insc => (
            <button
              key={insc.inscription_id}
              className={`inscription-chip rare ${rareInscriptions.includes(insc.inscription_id) ? 'selected' : ''}`}
              onClick={() => handleToggle(insc.inscription_id, rareInscriptions, onRareChange)}
            >
              {insc.name}
            </button>
          ))}
        </div>
      </div>

      {/* Common Inscriptions */}
      <div className="inscription-category">
        <h4>Common Inscriptions <span className="count">({commonInscriptions.length} selected)</span></h4>
        <div className="inscription-chips">
          {commonList.map(insc => (
            <button
              key={insc.inscription_id}
              className={`inscription-chip common ${commonInscriptions.includes(insc.inscription_id) ? 'selected' : ''}`}
              onClick={() => handleToggle(insc.inscription_id, commonInscriptions, onCommonChange)}
            >
              {insc.name}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

export default InscriptionSelector;
