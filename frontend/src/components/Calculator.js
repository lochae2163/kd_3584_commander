import React, { useState, useEffect } from 'react';
import { dataService, calculatorService } from '../services/api';
import ScoreDisplay from './ScoreDisplay';
import EquipmentSelector from './EquipmentSelector';
import InscriptionSelector from './InscriptionSelector';
import '../styles/Calculator.css';

function Calculator() {
  // Form state
  const [playerName, setPlayerName] = useState('');
  const [selectedRole, setSelectedRole] = useState('');
  const [vipLevel, setVipLevel] = useState(17);
  const [civilisation, setCivilisation] = useState('');
  const [spendingTier, setSpendingTier] = useState('');
  const [citySkin, setCitySkin] = useState('');
  const [formation, setFormation] = useState('WEDGE');
  const [equipment, setEquipment] = useState({
    WEAPON: { equipment_id: '', iconic_level: 'V', special_talent: true },
    HELM: { equipment_id: '', iconic_level: 'V', special_talent: true },
    CHEST: { equipment_id: '', iconic_level: 'V', special_talent: true },
    GLOVES: { equipment_id: '', iconic_level: 'V', special_talent: true },
    PANTS: { equipment_id: '', iconic_level: 'V', special_talent: true },
    BOOTS: { equipment_id: '', iconic_level: 'V', special_talent: true },
    ACCESSORY1: { equipment_id: '', iconic_level: 'V', special_talent: true },
    ACCESSORY2: { equipment_id: '', iconic_level: 'V', special_talent: true },
  });
  const [specialInscriptions, setSpecialInscriptions] = useState([]);
  const [rareInscriptions, setRareInscriptions] = useState([]);
  const [commonInscriptions, setCommonInscriptions] = useState([]);
  const [armamentAttributes, setArmamentAttributes] = useState({
    attack: 0,
    defense: 0,
    health: 0,
    all_dmg: 0,
  });

  // Reference data
  const [roles, setRoles] = useState([]);
  const [civilisations, setCivilisations] = useState([]);
  const [spendingTiers, setSpendingTiers] = useState([]);
  const [citySkins, setCitySkins] = useState([]);
  const [allEquipment, setAllEquipment] = useState([]);
  const [allInscriptions, setAllInscriptions] = useState([]);

  // Result state
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [dataLoading, setDataLoading] = useState(true);

  // Load reference data on mount
  useEffect(() => {
    const loadData = async () => {
      try {
        setDataLoading(true);
        const [
          rolesRes,
          civsRes,
          spendingRes,
          skinsRes,
          equipRes,
          inscRes,
        ] = await Promise.all([
          dataService.getRoles(),
          dataService.getCivilisations(),
          dataService.getSpendingTiers(),
          dataService.getCitySkins(),
          dataService.getEquipment(),
          dataService.getInscriptions(),
        ]);

        setRoles(rolesRes.data.roles || []);
        setCivilisations(civsRes.data.civilisations || []);
        setSpendingTiers(spendingRes.data.tiers || []);
        setCitySkins(skinsRes.data.citySkins || []);
        setAllEquipment(equipRes.data.equipment || []);
        setAllInscriptions(inscRes.data.inscriptions || []);

        // Set defaults
        if (rolesRes.data.roles?.length > 0) {
          setSelectedRole(rolesRes.data.roles[0].role_id);
        }
        if (civsRes.data.civilisations?.length > 0) {
          setCivilisation(civsRes.data.civilisations[0].name);
        }
        if (spendingRes.data.tiers?.length > 0) {
          setSpendingTier(spendingRes.data.tiers[0].tier_name);
        }
        if (skinsRes.data.citySkins?.length > 0) {
          setCitySkin(skinsRes.data.citySkins[0].name);
        }
      } catch (err) {
        console.error('Error loading data:', err);
        setError('Failed to load reference data. Make sure the backend is running.');
      } finally {
        setDataLoading(false);
      }
    };

    loadData();
  }, []);

  const handleEquipmentChange = (slot, field, value) => {
    setEquipment(prev => ({
      ...prev,
      [slot]: {
        ...prev[slot],
        [field]: value,
      },
    }));
  };

  const handleArmamentChange = (field, value) => {
    setArmamentAttributes(prev => ({
      ...prev,
      [field]: parseFloat(value) || 0,
    }));
  };

  const handleCalculate = async () => {
    if (!playerName.trim()) {
      setError('Please enter a player name');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const equipmentPieces = Object.entries(equipment)
        .filter(([_, piece]) => piece.equipment_id)
        .map(([slot, piece]) => ({
          slot,
          equipment_id: piece.equipment_id,
          iconic_level: piece.iconic_level,
          special_talent: piece.special_talent,
        }));

      const buildData = {
        player_name: playerName,
        role: selectedRole,
        vip_level: vipLevel,
        civilisation,
        spending_tier: spendingTier,
        city_skin: citySkin,
        equipment_pieces: equipmentPieces,
        formation,
        special_inscriptions: specialInscriptions,
        rare_inscriptions: rareInscriptions,
        common_inscriptions: commonInscriptions,
        armament_attributes: armamentAttributes,
      };

      const response = await calculatorService.calculateBuild(buildData);
      setResult(response.data);
    } catch (err) {
      console.error('Error calculating:', err);
      setError(err.response?.data?.error || 'Failed to calculate build score');
    } finally {
      setLoading(false);
    }
  };

  if (dataLoading) {
    return (
      <div className="calculator loading-state">
        <div className="loading-spinner"></div>
        <p>Loading data...</p>
      </div>
    );
  }

  return (
    <div className="calculator">
      <div className="calculator-grid">
        {/* Left Column - Form */}
        <div className="form-section">
          {/* Player Info */}
          <div className="form-card">
            <h2>Player Information</h2>
            <div className="form-group">
              <label>Player Name</label>
              <input
                type="text"
                value={playerName}
                onChange={(e) => setPlayerName(e.target.value)}
                placeholder="Enter your name"
              />
            </div>

            <div className="form-group">
              <label>Commander Role</label>
              <select value={selectedRole} onChange={(e) => setSelectedRole(e.target.value)}>
                {roles.map(role => (
                  <option key={role.role_id} value={role.role_id}>
                    {role.role_id}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Layer 1 - Player Stats */}
          <div className="form-card">
            <h2>Layer 1: Player Base Stats</h2>

            <div className="form-row">
              <div className="form-group">
                <label>VIP Level</label>
                <select value={vipLevel} onChange={(e) => setVipLevel(parseInt(e.target.value))}>
                  {[10, 11, 12, 13, 14, 15, 16, 17, 18, 19].map(level => (
                    <option key={level} value={level}>VIP {level}</option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label>Civilisation</label>
                <select value={civilisation} onChange={(e) => setCivilisation(e.target.value)}>
                  {civilisations.map(civ => (
                    <option key={civ.name} value={civ.name}>{civ.name}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Spending Level</label>
                <select value={spendingTier} onChange={(e) => setSpendingTier(e.target.value)}>
                  {spendingTiers.map(tier => (
                    <option key={tier.tier_name} value={tier.tier_name}>{tier.tier_name}</option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label>City Skin</label>
                <select value={citySkin} onChange={(e) => setCitySkin(e.target.value)}>
                  {citySkins.map(skin => (
                    <option key={skin.name} value={skin.name}>{skin.name}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Layer 2 - Equipment */}
          <div className="form-card">
            <h2>Layer 2: Equipment</h2>
            <EquipmentSelector
              equipment={equipment}
              allEquipment={allEquipment}
              onChange={handleEquipmentChange}
            />
          </div>

          {/* Layer 3 - Formations & Inscriptions */}
          <div className="form-card">
            <h2>Layer 3: Formation & Inscriptions</h2>

            <div className="form-group">
              <label>Formation</label>
              <select value={formation} onChange={(e) => setFormation(e.target.value)}>
                <option value="ARCH">ARCH</option>
                <option value="WEDGE">WEDGE</option>
                <option value="HOLLOW SQUARE">HOLLOW SQUARE</option>
                <option value="DELTA">DELTA</option>
                <option value="PINCER">PINCER</option>
              </select>
            </div>

            <InscriptionSelector
              allInscriptions={allInscriptions}
              specialInscriptions={specialInscriptions}
              rareInscriptions={rareInscriptions}
              commonInscriptions={commonInscriptions}
              onSpecialChange={setSpecialInscriptions}
              onRareChange={setRareInscriptions}
              onCommonChange={setCommonInscriptions}
            />

            <h3>Armament Attributes</h3>
            <div className="armament-grid">
              <div className="form-group">
                <label>Attack</label>
                <input
                  type="number"
                  value={armamentAttributes.attack}
                  onChange={(e) => handleArmamentChange('attack', e.target.value)}
                  min="0"
                  step="0.5"
                />
              </div>
              <div className="form-group">
                <label>Defense</label>
                <input
                  type="number"
                  value={armamentAttributes.defense}
                  onChange={(e) => handleArmamentChange('defense', e.target.value)}
                  min="0"
                  step="0.5"
                />
              </div>
              <div className="form-group">
                <label>Health</label>
                <input
                  type="number"
                  value={armamentAttributes.health}
                  onChange={(e) => handleArmamentChange('health', e.target.value)}
                  min="0"
                  step="0.5"
                />
              </div>
              <div className="form-group">
                <label>All Damage</label>
                <input
                  type="number"
                  value={armamentAttributes.all_dmg}
                  onChange={(e) => handleArmamentChange('all_dmg', e.target.value)}
                  min="0"
                  step="0.5"
                />
              </div>
            </div>
          </div>

          {/* Calculate Button */}
          <button
            className="calculate-btn"
            onClick={handleCalculate}
            disabled={loading}
          >
            {loading ? 'Calculating...' : 'Calculate Score'}
          </button>

          {error && <div className="error-message">{error}</div>}
        </div>

        {/* Right Column - Results */}
        <div className="results-section">
          <ScoreDisplay result={result} />
        </div>
      </div>
    </div>
  );
}

export default Calculator;
