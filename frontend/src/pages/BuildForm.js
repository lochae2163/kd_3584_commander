import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { governorService, buildService, dataService } from '../services/api';
import CommanderSelect from '../components/CommanderSelect';
import EquipmentSlot from '../components/EquipmentSlot';
import { calculateEquipmentStats, countSetPieces, getActiveSetBonuses, formatStat } from '../utils/statsCalculator';
import '../styles/BuildForm.css';

const EQUIPMENT_SLOTS = ['weapon', 'helmet', 'chest', 'gloves', 'legs', 'boots', 'accessory1', 'accessory2'];
const ARMAMENT_SLOTS = ['emblem', 'flag', 'instrument', 'scroll'];
const TIER_ORDER = ['S', 'A', 'B', 'C'];

function BuildForm() {
  const { id, buildId } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const troopType = searchParams.get('troopType');
  const buildType = searchParams.get('buildType');

  const [governor, setGovernor] = useState(null);
  const [commanders, setCommanders] = useState([]);  // Filtered by troopType for primary
  const [allCommanders, setAllCommanders] = useState([]);  // All commanders for secondary
  const [equipment, setEquipment] = useState([]);
  const [armaments, setArmaments] = useState([]);
  const [allInscriptions, setAllInscriptions] = useState([]);
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
      accessory1: { equipmentId: null, name: null, iconicLevel: null, hasCrit: false },
      accessory2: { equipmentId: null, name: null, iconicLevel: null, hasCrit: false },
    },
    armament: {
      formation: null,
      emblem: { inscriptions: [] },
      flag: { inscriptions: [] },
      instrument: { inscriptions: [] },
      scroll: { inscriptions: [] },
    },
  });

  useEffect(() => {
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, buildId, troopType]);

  // Set page title
  useEffect(() => {
    const action = buildId ? 'Edit' : 'Create';
    const tt = troopType ? troopType.charAt(0).toUpperCase() + troopType.slice(1) : '';
    const bt = buildType ? buildType.charAt(0).toUpperCase() + buildType.slice(1) : '';
    document.title = `${action} ${tt} ${bt} Build - 3584 Commanders`;
  }, [buildId, troopType, buildType]);

  const loadData = async () => {
    try {
      setLoading(true);

      const [govRes, commandersRes, allCommandersRes, equipmentRes, inscriptionsRes, armamentsRes] = await Promise.all([
        governorService.getById(id),
        dataService.getCommanders(troopType),  // Filtered by troopType for primary
        dataService.getCommanders(),  // All commanders for secondary
        dataService.getEquipment(),
        dataService.getInscriptions(),
        dataService.getArmaments(),
      ]);

      setGovernor(govRes.data.governor);
      setCommanders(commandersRes.data.commanders || []);
      setAllCommanders(allCommandersRes.data.commanders || []);
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

  const handleFormationChange = (formation) => {
    // When formation changes, clear all inscriptions
    setFormData((prev) => ({
      ...prev,
      armament: {
        formation: formation || null,
        emblem: { inscriptions: [] },
        flag: { inscriptions: [] },
        instrument: { inscriptions: [] },
        scroll: { inscriptions: [] },
      },
    }));
  };

  const handleInscriptionToggle = (slot, inscriptionId) => {
    setFormData((prev) => {
      const current = prev.armament[slot]?.inscriptions || [];
      const updated = current.includes(inscriptionId)
        ? current.filter((id) => id !== inscriptionId)
        : [...current, inscriptionId];
      return {
        ...prev,
        armament: {
          ...prev.armament,
          [slot]: { inscriptions: updated },
        },
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

  // Get inscriptions for a specific formation and slot
  const getSlotInscriptions = (slot) => {
    if (!formData.armament.formation) return [];
    return allInscriptions.filter(
      (insc) => insc.formation === formData.armament.formation && insc.slot === slot
    );
  };

  // Group inscriptions by tier
  const groupByTier = (inscriptions) => {
    const grouped = {};
    TIER_ORDER.forEach((tier) => {
      grouped[tier] = inscriptions.filter((i) => i.tier === tier);
    });
    return grouped;
  };

  // Calculate equipment stats - must be before any conditional returns
  const equipmentStats = useMemo(() => {
    return calculateEquipmentStats(formData.equipment, equipment, troopType);
  }, [formData.equipment, equipment, troopType]);

  // Calculate set bonuses - must be before any conditional returns
  const { setCounts, activeBonuses } = useMemo(() => {
    const counts = countSetPieces(formData.equipment, equipment);
    const bonuses = getActiveSetBonuses(counts);
    return { setCounts: counts, activeBonuses: bonuses };
  }, [formData.equipment, equipment]);

  if (loading) {
    return <div className="loading">Loading...</div>;
  }

  const getLabel = () => {
    const tt = troopType.charAt(0).toUpperCase() + troopType.slice(1);
    const bt = buildType.charAt(0).toUpperCase() + buildType.slice(1);
    return `${tt} ${bt}`;
  };

  const selectedFormation = armaments.find((a) => a.armamentId === formData.armament.formation);

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
              commanders={allCommanders}
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

          {/* Stats Summary Box */}
          <div className="stats-summary-box">
            <h3>Equipment Stats Summary</h3>
            <div className="stats-grid">
              <div className="stat-item">
                <span className="stat-label">Attack</span>
                <span className="stat-value attack">{formatStat(equipmentStats.attack) || '0%'}</span>
              </div>
              <div className="stat-item">
                <span className="stat-label">Defense</span>
                <span className="stat-value defense">{formatStat(equipmentStats.defense) || '0%'}</span>
              </div>
              <div className="stat-item">
                <span className="stat-label">Health</span>
                <span className="stat-value health">{formatStat(equipmentStats.health) || '0%'}</span>
              </div>
              {equipmentStats.all_dmg > 0 && (
                <div className="stat-item">
                  <span className="stat-label">All Damage</span>
                  <span className="stat-value damage">{formatStat(equipmentStats.all_dmg)}</span>
                </div>
              )}
              {equipmentStats.skill_dmg > 0 && (
                <div className="stat-item">
                  <span className="stat-label">Skill Damage</span>
                  <span className="stat-value damage">{formatStat(equipmentStats.skill_dmg, false)}</span>
                </div>
              )}
              {equipmentStats.counterattack > 0 && (
                <div className="stat-item">
                  <span className="stat-label">Counterattack</span>
                  <span className="stat-value damage">{formatStat(equipmentStats.counterattack, false)}</span>
                </div>
              )}
              {equipmentStats.march_speed > 0 && (
                <div className="stat-item">
                  <span className="stat-label">March Speed</span>
                  <span className="stat-value">{formatStat(equipmentStats.march_speed)}</span>
                </div>
              )}
              {equipmentStats.skill_dmg_reduction > 0 && (
                <div className="stat-item">
                  <span className="stat-label">Skill Dmg Reduction</span>
                  <span className="stat-value">{formatStat(equipmentStats.skill_dmg_reduction, false)}</span>
                </div>
              )}
            </div>

            {/* Set Bonuses */}
            {activeBonuses.length > 0 && (
              <div className="set-bonuses">
                <h4>Active Set Bonuses</h4>
                {activeBonuses.map((bonus, idx) => (
                  <div key={idx} className="set-bonus-item">
                    <span className="set-name">{bonus.setName} ({bonus.pieces}pc):</span>
                    <span className="set-effect">{bonus.label}</span>
                  </div>
                ))}
              </div>
            )}

            {/* Set Piece Counts */}
            {Object.keys(setCounts).length > 0 && (
              <div className="set-counts">
                <h4>Set Pieces</h4>
                <div className="set-count-list">
                  {Object.entries(setCounts).map(([setName, count]) => (
                    <span key={setName} className="set-count-badge">
                      {setName}: {count}/6
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </section>

        <section className="form-section">
          <h2>Armament</h2>

          <div className="armament-type-selector">
            <label>Formation</label>
            <select
              value={formData.armament.formation || ''}
              onChange={(e) => handleFormationChange(e.target.value)}
            >
              <option value="">Select Formation</option>
              {armaments.map((arm) => (
                <option key={arm.armamentId} value={arm.armamentId}>
                  {arm.name}
                </option>
              ))}
            </select>
          </div>

          {selectedFormation && (
            <p className="armament-description">
              Selected: <strong>{selectedFormation.name}</strong> formation with 4 slots: Emblem, Flag, Instrument, Scroll
            </p>
          )}
        </section>

        <section className="form-section">
          <h2>Inscriptions</h2>

          {!formData.armament.formation ? (
            <p className="hint">Select a formation above to see available inscriptions for each slot</p>
          ) : (
            <div className="inscription-slots">
              {ARMAMENT_SLOTS.map((slot) => {
                const slotInscriptions = getSlotInscriptions(slot);
                const groupedInscriptions = groupByTier(slotInscriptions);
                const selectedCount = formData.armament[slot]?.inscriptions?.length || 0;

                return (
                  <div key={slot} className="inscription-slot">
                    <h3 className="slot-title">
                      {slot.charAt(0).toUpperCase() + slot.slice(1)}
                      <span className="selected-count">({selectedCount} selected)</span>
                    </h3>

                    {TIER_ORDER.map((tier) => {
                      const tierInscriptions = groupedInscriptions[tier];
                      if (tierInscriptions.length === 0) return null;

                      return (
                        <div key={tier} className={`tier-group tier-${tier.toLowerCase()}`}>
                          <h4 className="tier-label">{tier}-Tier</h4>
                          <div className="inscription-options">
                            {tierInscriptions.map((insc) => (
                              <label key={insc.inscriptionId} className="inscription-checkbox">
                                <input
                                  type="checkbox"
                                  checked={formData.armament[slot]?.inscriptions?.includes(insc.inscriptionId)}
                                  onChange={() => handleInscriptionToggle(slot, insc.inscriptionId)}
                                />
                                <span className={`inscription-name tier-${tier.toLowerCase()}`}>{insc.name}</span>
                              </label>
                            ))}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                );
              })}
            </div>
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
