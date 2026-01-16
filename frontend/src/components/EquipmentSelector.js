import React from 'react';
import '../styles/EquipmentSelector.css';

const SLOTS = [
  { key: 'WEAPON', label: 'Weapon' },
  { key: 'HELM', label: 'Helm' },
  { key: 'CHEST', label: 'Chest' },
  { key: 'GLOVES', label: 'Gloves' },
  { key: 'PANTS', label: 'Pants' },
  { key: 'BOOTS', label: 'Boots' },
  { key: 'ACCESSORY1', label: 'Accessory 1' },
  { key: 'ACCESSORY2', label: 'Accessory 2' },
];

const ICONIC_LEVELS = ['I', 'II', 'IV', 'V'];

function EquipmentSelector({ equipment, allEquipment, onChange }) {
  return (
    <div className="equipment-selector">
      {SLOTS.map(slot => {
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
                {allEquipment.map(eq => (
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
