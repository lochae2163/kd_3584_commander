import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { governorService, buildService, dataService } from '../services/api';
import CommanderSelect from '../components/CommanderSelect';
import EquipmentSlot from '../components/EquipmentSlot';
import '../styles/BuildForm.css';

const EQUIPMENT_SLOTS = ['weapon', 'helmet', 'chest', 'gloves', 'legs', 'boots', 'accessory'];

function BuildForm() {
  const { id, buildId } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const troopType = searchParams.get('troopType');
  const buildType = searchParams.get('buildType');

  const [governor, setGovernor] = useState(null);
  const [commanders, setCommanders] = useState([]);
  const [equipment, setEquipment] = useState([]);
  const [armaments, setArmaments] = useState([]);
  const [allInscriptions, setAllInscriptions] = useState([]);
  const [filteredInscriptions, setFilteredInscriptions] = useState({ special: [], rare: [], common: [] });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const [formData, setFormData] = useState({
    primaryCommander: '',
    secondaryCommander: '',
    equipment: {
      weapon: { equipmentId: null, name: null, iconicLevel: null, hasCrit: false },
      helmet: { equipmentId: null, name: null, iconicLevel: null, hasCrit: false },
      chest: { equipmentId: null, name: null, iconicLevel: null, hasCrit: false },
      gloves: { equipmentId: null, name: null, iconicLevel: null, hasCrit: false },
      legs: { equipmentId: null, name: null, iconicLevel: null, hasCrit: false },
      boots: { equipmentId: null, name: null, iconicLevel: null, hasCrit: false },
      accessory: { equipmentId: null, name: null, iconicLevel: null, hasCrit: false },
    },
    armament: {
      armamentType: null,
      attack: null,
      defense: null,
      marchSpeed: null,
      allDamage: null,
    },
    inscriptions: {
      special: [],
      rare: [],
      common: [],
    },
  });

  useEffect(() => {
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, buildId, troopType]);

  // Filter inscriptions when armament type changes
  useEffect(() => {
    if (formData.armament.armamentType && allInscriptions.length > 0) {
      const filtered = allInscriptions.filter(
        (insc) => insc.armamentType === formData.armament.armamentType
      );
      setFilteredInscriptions({
        special: filtered.filter((i) => i.rarity === 'SPECIAL'),
        rare: filtered.filter((i) => i.rarity === 'RARE'),
        common: filtered.filter((i) => i.rarity === 'COMMON'),
      });
    } else {
      setFilteredInscriptions({ special: [], rare: [], common: [] });
    }
  }, [formData.armament.armamentType, allInscriptions]);

  const loadData = async () => {
    try {
      setLoading(true);

      const [govRes, commandersRes, equipmentRes, inscriptionsRes, armamentsRes] = await Promise.all([
        governorService.getById(id),
        dataService.getCommanders(troopType),
        dataService.getEquipment(),
        dataService.getInscriptions(),
        dataService.getArmaments(),
      ]);

      setGovernor(govRes.data.governor);
      setCommanders(commandersRes.data.commanders || []);
      setEquipment(equipmentRes.data.equipment || []);
      setAllInscriptions(inscriptionsRes.data.inscriptions || []);
      setArmaments(armamentsRes.data.armaments || []);

      // If editing, load existing build
      if (buildId) {
        const buildRes = await buildService.getById(id, buildId);
        const build = buildRes.data.build;
        setFormData({
          primaryCommander: build.primaryCommander || '',
          secondaryCommander: build.secondaryCommander || '',
          equipment: build.equipment || formData.equipment,
          armament: build.armament || formData.armament,
          inscriptions: build.inscriptions || formData.inscriptions,
        });
      }
    } catch (err) {
      setError('Failed to load data');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCommanderChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleEquipmentChange = (slot, data) => {
    setFormData((prev) => ({
      ...prev,
      equipment: { ...prev.equipment, [slot]: data },
    }));
  };

  const handleArmamentTypeChange = (armamentType) => {
    // When armament type changes, clear selected inscriptions
    setFormData((prev) => ({
      ...prev,
      armament: { ...prev.armament, armamentType: armamentType || null },
      inscriptions: { special: [], rare: [], common: [] },
    }));
  };

  const handleArmamentStatChange = (field, value) => {
    const numValue = value === '' ? null : parseFloat(value);
    setFormData((prev) => ({
      ...prev,
      armament: { ...prev.armament, [field]: numValue },
    }));
  };

  const handleInscriptionToggle = (rarity, inscriptionName) => {
    setFormData((prev) => {
      const current = prev.inscriptions[rarity] || [];
      const updated = current.includes(inscriptionName)
        ? current.filter((n) => n !== inscriptionName)
        : [...current, inscriptionName];
      return {
        ...prev,
        inscriptions: { ...prev.inscriptions, [rarity]: updated },
      };
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');

    try {
      if (buildId) {
        await buildService.update(id, buildId, formData);
      } else {
        await buildService.create(id, {
          troopType,
          buildType,
          ...formData,
        });
      }
      navigate(`/governor/${id}`);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to save build');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="loading">Loading...</div>;
  }

  const getLabel = () => {
    const tt = troopType.charAt(0).toUpperCase() + troopType.slice(1);
    const bt = buildType.charAt(0).toUpperCase() + buildType.slice(1);
    return `${tt} ${bt}`;
  };

  const selectedArmament = armaments.find((a) => a.armamentId === formData.armament.armamentType);

  return (
    <div className="build-form-page">
      <button className="back-btn" onClick={() => navigate(`/governor/${id}`)}>
        &larr; Back to {governor?.name}
      </button>

      <h1>{buildId ? 'Edit' : 'Create'} {getLabel()} Build</h1>

      {error && <div className="error-message">{error}</div>}

      <form onSubmit={handleSubmit}>
        <section className="form-section">
          <h2>Commanders</h2>
          <div className="commanders-row">
            <CommanderSelect
              label="Primary Commander"
              commanders={commanders}
              value={formData.primaryCommander}
              onChange={(v) => handleCommanderChange('primaryCommander', v)}
              filterRole="primary"
              buildType={buildType}
            />
            <CommanderSelect
              label="Secondary Commander"
              commanders={commanders}
              value={formData.secondaryCommander}
              onChange={(v) => handleCommanderChange('secondaryCommander', v)}
              filterRole="secondary"
              buildType={buildType}
            />
          </div>
        </section>

        <section className="form-section">
          <h2>Equipment</h2>
          <div className="equipment-grid">
            {EQUIPMENT_SLOTS.map((slot) => (
              <EquipmentSlot
                key={slot}
                slot={slot}
                equipment={equipment}
                value={formData.equipment[slot]}
                onChange={(data) => handleEquipmentChange(slot, data)}
              />
            ))}
          </div>
        </section>

        <section className="form-section">
          <h2>Armament</h2>

          <div className="armament-type-selector">
            <label>Formation Type</label>
            <select
              value={formData.armament.armamentType || ''}
              onChange={(e) => handleArmamentTypeChange(e.target.value)}
            >
              <option value="">Select Armament Type</option>
              {armaments.map((arm) => (
                <option key={arm.armamentId} value={arm.armamentId}>
                  {arm.name} - {arm.description}
                </option>
              ))}
            </select>
          </div>

          {selectedArmament && (
            <p className="armament-description">
              <strong>{selectedArmament.name}:</strong> {selectedArmament.description}
            </p>
          )}

          <h3>Armament Stats</h3>
          <p className="hint">Only 3 of 4 stats can have values</p>
          <div className="armament-grid">
            <div className="armament-field">
              <label>Attack %</label>
              <input
                type="number"
                step="0.1"
                value={formData.armament.attack ?? ''}
                onChange={(e) => handleArmamentStatChange('attack', e.target.value)}
              />
            </div>
            <div className="armament-field">
              <label>Defense %</label>
              <input
                type="number"
                step="0.1"
                value={formData.armament.defense ?? ''}
                onChange={(e) => handleArmamentStatChange('defense', e.target.value)}
              />
            </div>
            <div className="armament-field">
              <label>March Speed %</label>
              <input
                type="number"
                step="0.1"
                value={formData.armament.marchSpeed ?? ''}
                onChange={(e) => handleArmamentStatChange('marchSpeed', e.target.value)}
              />
            </div>
            <div className="armament-field">
              <label>All Damage %</label>
              <input
                type="number"
                step="0.1"
                value={formData.armament.allDamage ?? ''}
                onChange={(e) => handleArmamentStatChange('allDamage', e.target.value)}
              />
            </div>
          </div>
        </section>

        <section className="form-section">
          <h2>Inscriptions</h2>

          {!formData.armament.armamentType ? (
            <p className="hint">Select an armament type above to see available inscriptions</p>
          ) : (
            <>
              <p className="hint">
                Showing inscriptions for <strong>{selectedArmament?.name}</strong> formation
              </p>

              <div className="inscription-category">
                <h3>Special (up to 2)</h3>
                <div className="inscription-options">
                  {filteredInscriptions.special.length === 0 ? (
                    <span className="no-inscriptions">No special inscriptions available</span>
                  ) : (
                    filteredInscriptions.special.map((insc) => (
                      <label key={insc.inscriptionId} className="inscription-checkbox" title={insc.effect}>
                        <input
                          type="checkbox"
                          checked={formData.inscriptions.special.includes(insc.name)}
                          onChange={() => handleInscriptionToggle('special', insc.name)}
                        />
                        <span className="inscription-name">{insc.name}</span>
                        <span className="inscription-effect">{insc.effect}</span>
                      </label>
                    ))
                  )}
                </div>
              </div>

              <div className="inscription-category">
                <h3>Rare (up to 4)</h3>
                <div className="inscription-options">
                  {filteredInscriptions.rare.length === 0 ? (
                    <span className="no-inscriptions">No rare inscriptions available</span>
                  ) : (
                    filteredInscriptions.rare.map((insc) => (
                      <label key={insc.inscriptionId} className="inscription-checkbox" title={insc.effect}>
                        <input
                          type="checkbox"
                          checked={formData.inscriptions.rare.includes(insc.name)}
                          onChange={() => handleInscriptionToggle('rare', insc.name)}
                        />
                        <span className="inscription-name">{insc.name}</span>
                        <span className="inscription-effect">{insc.effect}</span>
                      </label>
                    ))
                  )}
                </div>
              </div>

              <div className="inscription-category">
                <h3>Common (up to 8)</h3>
                <div className="inscription-options">
                  {filteredInscriptions.common.length === 0 ? (
                    <span className="no-inscriptions">No common inscriptions available</span>
                  ) : (
                    filteredInscriptions.common.map((insc) => (
                      <label key={insc.inscriptionId} className="inscription-checkbox" title={insc.effect}>
                        <input
                          type="checkbox"
                          checked={formData.inscriptions.common.includes(insc.name)}
                          onChange={() => handleInscriptionToggle('common', insc.name)}
                        />
                        <span className="inscription-name">{insc.name}</span>
                        <span className="inscription-effect">{insc.effect}</span>
                      </label>
                    ))
                  )}
                </div>
              </div>
            </>
          )}
        </section>

        <div className="form-actions">
          <button type="button" className="btn-secondary" onClick={() => navigate(`/governor/${id}`)}>
            Cancel
          </button>
          <button type="submit" className="btn-primary" disabled={saving}>
            {saving ? 'Saving...' : 'Save Build'}
          </button>
        </div>
      </form>
    </div>
  );
}

export default BuildForm;
