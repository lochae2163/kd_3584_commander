import React from 'react';
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

function EquipmentSlot({ slot, equipment, value, onChange }) {
  const slotType = SLOT_TYPE_MAP[slot];
  const slotEquipment = equipment.filter((eq) => eq.type === slotType);

  const handleEquipmentChange = (e) => {
    const selectedName = e.target.value;
    if (!selectedName) {
      onChange({ equipmentId: null, name: null, iconicLevel: null, hasCrit: false });
      return;
    }
    const selected = slotEquipment.find((eq) => eq.name === selectedName);
    onChange({
      equipmentId: selected?.equipment_id || null,
      name: selectedName,
      iconicLevel: value.iconicLevel || 1,
      hasCrit: value.hasCrit || false,
    });
  };

  const handleIconicChange = (e) => {
    onChange({
      ...value,
      iconicLevel: Number(e.target.value),
    });
  };

  const handleCritChange = (e) => {
    onChange({
      ...value,
      hasCrit: e.target.checked,
    });
  };

  return (
    <div className="equipment-slot">
      <label className="slot-label">{SLOT_LABELS[slot]}</label>

      <select
        className="equipment-select"
        value={value.name || ''}
        onChange={handleEquipmentChange}
      >
        <option value="">-- None --</option>
        {slotEquipment.map((eq) => (
          <option key={eq.equipment_id} value={eq.name}>
            {eq.name}
          </option>
        ))}
      </select>

      {value.name && (
        <div className="equipment-details">
          <div className="iconic-select">
            <label>Iconic</label>
            <select value={value.iconicLevel || 1} onChange={handleIconicChange}>
              {[1, 2, 3, 4, 5].map((level) => (
                <option key={level} value={level}>
                  {level}
                </option>
              ))}
            </select>
          </div>

          <label className="crit-checkbox">
            <input
              type="checkbox"
              checked={value.hasCrit || false}
              onChange={handleCritChange}
            />
            Crit
          </label>
        </div>
      )}
    </div>
  );
}

export default EquipmentSlot;
