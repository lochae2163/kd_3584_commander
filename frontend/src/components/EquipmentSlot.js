import React, { useState, useMemo } from 'react';
import { equipmentData, QUALITY_COLORS } from '../data/equipmentData';
import '../styles/EquipmentSlot.css';

const SLOT_LABELS = {
  weapon: 'Weapon',
  helmet: 'Helmet',
  chest: 'Chest',
  gloves: 'Gloves',
  legs: 'Legs',
  boots: 'Boots',
  accessory1: 'Accessory 1',
  accessory2: 'Accessory 2',
};

const SLOT_TYPE_MAP = {
  weapon: 'WEAPON',
  helmet: 'HELMET',
  chest: 'CHEST',
  gloves: 'GLOVES',
  legs: 'LEGS',
  boots: 'BOOTS',
  accessory1: 'ACCESSORY',
  accessory2: 'ACCESSORY',
};

const SLOT_ICONS = {
  weapon: '/images/equipment/hammer_of_the_sun_and_moon.webp',
  helmet: '/images/equipment/gold_helm_of_the_eternal_empire.webp',
  chest: '/images/equipment/hope_cloak.webp',
  gloves: '/images/equipment/vambraces_of_the_eternal_empire.webp',
  legs: '/images/equipment/eternal_night.webp',
  boots: '/images/equipment/sturdy_boots_of_the_eternal_empire.webp',
  accessory1: '/images/equipment/horn_of_fury.webp',
  accessory2: '/images/equipment/karuaks_war_drums.webp',
};

function EquipmentSlot({ slot, value, onChange }) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [qualityFilter, setQualityFilter] = useState('');

  const slotType = SLOT_TYPE_MAP[slot];

  // Get equipment for this slot from our static data
  const slotEquipment = useMemo(() => {
    return equipmentData
      .filter(eq => eq.type === slotType)
      .sort((a, b) => {
        const qualityOrder = ['legendary', 'epic', 'elite', 'advanced', 'normal'];
        return qualityOrder.indexOf(a.quality) - qualityOrder.indexOf(b.quality);
      });
  }, [slotType]);

  // Filter equipment by search and quality
  const filteredEquipment = useMemo(() => {
    return slotEquipment.filter(eq => {
      if (searchTerm && !eq.name.toLowerCase().includes(searchTerm.toLowerCase())) return false;
      if (qualityFilter && eq.quality !== qualityFilter) return false;
      return true;
    });
  }, [slotEquipment, searchTerm, qualityFilter]);

  // Get selected equipment data
  const selectedEquipment = useMemo(() => {
    if (!value?.id) return null;
    return equipmentData.find(eq => eq.id === value.id);
  }, [value?.id]);

  const handleEquipmentSelect = (eq) => {
    onChange({
      id: eq.id,
      name: eq.name,
      iconicLevel: value?.iconicLevel || 1,
      hasSpecialTalent: false,
    });
    setIsModalOpen(false);
    setSearchTerm('');
    setQualityFilter('');
  };

  const handleClear = (e) => {
    e.stopPropagation();
    onChange({ id: null, name: null, iconicLevel: null, hasSpecialTalent: false });
  };

  const handleIconicChange = (level) => {
    onChange({
      ...value,
      iconicLevel: level,
    });
  };

  const handleSpecialTalentChange = (e) => {
    onChange({
      ...value,
      hasSpecialTalent: e.target.checked,
    });
  };

  // Calculate stats for display
  const currentStats = useMemo(() => {
    if (!selectedEquipment) return null;
    const stats = selectedEquipment.stats;
    const iconicLevel = value?.iconicLevel || 1;
    const hasSpecialTalent = value?.hasSpecialTalent || false;

    // Apply iconic level multiplier (each level adds ~10% more)
    const iconicMultiplier = 1 + (iconicLevel - 1) * 0.15;

    // Apply special talent bonus (30% more)
    const talentMultiplier = hasSpecialTalent ? 1.3 : 1;

    const displayStats = {};
    Object.entries(stats).forEach(([key, val]) => {
      if (val > 0) {
        displayStats[key] = (val * iconicMultiplier * talentMultiplier).toFixed(1);
      }
    });

    return displayStats;
  }, [selectedEquipment, value?.iconicLevel, value?.hasSpecialTalent]);

  const getStatColor = (key) => {
    if (key.includes('Attack')) return '#ff6b6b';
    if (key.includes('Defense')) return '#60a5fa';
    if (key.includes('Health')) return '#4ade80';
    if (key.includes('MarchSpeed')) return '#fbbf24';
    return '#94a3b8';
  };

  return (
    <div className="equipment-slot-new">
      <label className="slot-label">{SLOT_LABELS[slot]}</label>

      {/* Slot Button - shows selected equipment or placeholder */}
      <div
        className={`slot-button ${selectedEquipment ? 'has-equipment' : ''}`}
        onClick={() => setIsModalOpen(true)}
        style={selectedEquipment ? { borderColor: QUALITY_COLORS[selectedEquipment.quality] } : {}}
      >
        {selectedEquipment ? (
          <>
            <img
              src={selectedEquipment.image}
              alt={selectedEquipment.name}
              className="slot-equipment-image"
              onError={(e) => { e.target.src = SLOT_ICONS[slot]; }}
            />
            <button className="clear-btn" onClick={handleClear}>×</button>
          </>
        ) : (
          <img
            src={SLOT_ICONS[slot]}
            alt={SLOT_LABELS[slot]}
            className="slot-placeholder-image"
          />
        )}
      </div>

      {/* Equipment Name */}
      {selectedEquipment && (
        <div className="selected-equipment-info">
          <span
            className="equipment-name-label"
            style={{ color: QUALITY_COLORS[selectedEquipment.quality] }}
          >
            {selectedEquipment.name}
          </span>
        </div>
      )}

      {/* Iconic Level & Special Talent */}
      {selectedEquipment && (
        <div className="equipment-options">
          <div className="iconic-selector">
            <span className="option-label">Iconic</span>
            <div className="iconic-buttons">
              {[1, 2, 3, 4, 5].map(level => (
                <button
                  key={level}
                  type="button"
                  className={`iconic-btn ${value?.iconicLevel === level ? 'active' : ''}`}
                  onClick={() => handleIconicChange(level)}
                >
                  {level}
                </button>
              ))}
            </div>
          </div>

          <label className="special-talent-toggle">
            <input
              type="checkbox"
              checked={value?.hasSpecialTalent || false}
              onChange={handleSpecialTalentChange}
            />
            <span>Special Talent (+30%)</span>
          </label>
        </div>
      )}

      {/* Stats Preview */}
      {currentStats && Object.keys(currentStats).length > 0 && (
        <div className="slot-stats-preview">
          {Object.entries(currentStats).slice(0, 4).map(([key, val]) => (
            <div key={key} className="stat-mini">
              <span style={{ color: getStatColor(key) }}>+{val}%</span>
            </div>
          ))}
        </div>
      )}

      {/* Special Stats */}
      {selectedEquipment?.specialStats?.length > 0 && (
        <div className="slot-special-stats">
          {selectedEquipment.specialStats.map((special, idx) => (
            <span key={idx} className="special-stat-badge">{special}</span>
          ))}
        </div>
      )}

      {/* Equipment Selection Modal */}
      {isModalOpen && (
        <div className="equipment-modal-overlay" onClick={() => setIsModalOpen(false)}>
          <div className="equipment-modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Select {SLOT_LABELS[slot]}</h3>
              <button className="modal-close" onClick={() => setIsModalOpen(false)}>×</button>
            </div>

            <div className="modal-filters">
              <input
                type="text"
                placeholder="Search equipment..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="modal-search"
              />
              <select
                value={qualityFilter}
                onChange={e => setQualityFilter(e.target.value)}
                className="modal-quality-filter"
              >
                <option value="">All Quality</option>
                <option value="legendary">Legendary</option>
                <option value="epic">Epic</option>
                <option value="elite">Elite</option>
                <option value="advanced">Advanced</option>
                <option value="normal">Normal</option>
              </select>
            </div>

            <div className="modal-equipment-grid">
              {/* None option */}
              <div
                className="modal-equipment-item none-option"
                onClick={() => {
                  onChange({ id: null, name: null, iconicLevel: null, hasSpecialTalent: false });
                  setIsModalOpen(false);
                }}
              >
                <div className="equipment-item-image">
                  <span className="none-icon">✕</span>
                </div>
                <span className="equipment-item-name">None</span>
              </div>

              {filteredEquipment.map(eq => (
                <div
                  key={eq.id}
                  className={`modal-equipment-item ${value?.id === eq.id ? 'selected' : ''}`}
                  onClick={() => handleEquipmentSelect(eq)}
                  style={{ borderColor: QUALITY_COLORS[eq.quality] }}
                >
                  <div className="equipment-item-image">
                    <img
                      src={eq.image}
                      alt={eq.name}
                      onError={(e) => { e.target.style.display = 'none'; }}
                    />
                  </div>
                  <span
                    className="equipment-item-name"
                    style={{ color: QUALITY_COLORS[eq.quality] }}
                  >
                    {eq.name}
                  </span>
                  <div className="equipment-item-stats">
                    {Object.entries(eq.stats).filter(([_, v]) => v > 0).slice(0, 2).map(([key, val]) => (
                      <span key={key} className="mini-stat" style={{ color: getStatColor(key) }}>
                        +{val}%
                      </span>
                    ))}
                  </div>
                  {eq.specialStats?.length > 0 && (
                    <span className="has-special-badge">★</span>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default EquipmentSlot;
