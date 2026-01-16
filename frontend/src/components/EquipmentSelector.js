import React from 'react';
import '../styles/EquipmentSelector.css';

const SLOTS = [
  { key: 'WEAPON', label: 'Weapon', type: 'WEAPON' },
  { key: 'HELM', label: 'Helm', type: 'HELM' },
  { key: 'CHEST', label: 'Chest', type: 'CHEST' },
  { key: 'GLOVES', label: 'Gloves', type: 'GLOVES' },
  { key: 'PANTS', label: 'Pants', type: 'PANTS' },
  { key: 'BOOTS', label: 'Boots', type: 'BOOTS' },
  { key: 'ACCESSORY1', label: 'Accessory 1', type: 'ACCESSORY' },
  { key: 'ACCESSORY2', label: 'Accessory 2', type: 'ACCESSORY' },
];

const ICONIC_LEVELS = ['I', 'II', 'IV', 'V'];

function EquipmentSelector({ equipment, allEquipment, onChange }) {
  const getEquipmentByType = (type) => {
    return allEquipment.filter(eq => eq.type === type);
  };

  return (
    <div className="equipment-selector">
      {SLOTS.map(slot => {
        const availableEquipment = getEquipmentByType(slot.type);
        const currentPiece = equipment[slot.key];

        return (
          <div key={slot.key} className="equipment-slot">
            <label className="slot-label">{slot.label}</label>

            <div className="slot-controls">
              <select
                className="equipment-select"
                value={currentPiece.equipment_id}
                onChange={(e) => onChange(slot.key, 'equipment_id', e.target.value)}
              >
                <option value="">-- Select {slot.label} --</option>
                {availableEquipment.map(eq => (
                  <option key={eq.equipment_id} value={eq.equipment_id}>
                    {eq.name}
                  </option>
                ))}
              </select>

              <select
                className="iconic-select"
                value={currentPiece.iconic_level}
                onChange={(e) => onChange(slot.key, 'iconic_level', e.target.value)}
              >
                {ICONIC_LEVELS.map(level => (
                  <option key={level} value={level}>Iconic {level}</option>
                ))}
              </select>

              <label className="st-checkbox">
                <input
                  type="checkbox"
                  checked={currentPiece.special_talent}
                  onChange={(e) => onChange(slot.key, 'special_talent', e.target.checked)}
                />
                <span className="checkmark"></span>
                <span className="st-label">ST</span>
              </label>
            </div>
          </div>
        );
      })}
    </div>
  );
}

export default EquipmentSelector;
