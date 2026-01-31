import { equipmentData } from '../data/equipmentData';
import { INSCRIPTION_STATS, FORMATIONS } from '../data/inscriptionData';

// Set bonus definitions (based on equipment set names)
export const SET_BONUSES = {
  'Hellish Wasteland': {
    2: { health: 3, label: '+3% Troop Health' },
    4: { counterattack: 3, label: '+3 Counterattack Damage' },
    6: { cavalry_defense: 5, label: '+5% Cavalry Defense' }
  },
  'Eternal Empire': {
    2: { defense: 3, label: '+3% Troop Defense' },
    4: { march_speed: 10, label: '+10% March Speed' },
    6: { infantry_attack: 5, label: '+5% Infantry Attack' }
  },
  "Dragon's Breath": {
    2: { attack: 3, label: '+3% Troop Attack' },
    4: { skill_dmg: 3, label: '+3 Skill Damage' },
    6: { archer_health: 5, label: '+5% Archer Health' }
  },
  'Garb of the Glorious Goddess': {
    2: { defense: 3, label: '+3% Troop Defense' },
    4: { skill_dmg_reduction: 3, label: '+3 Skill Damage Reduction' },
    6: { health: 5, label: '+5% Troop Health' }
  }
};

// Equipment name to set mapping
const EQUIPMENT_SET_MAP = {
  // Hellish Wasteland Set
  'Lance of the Hellish Wasteland': 'Hellish Wasteland',
  'War Helm of the Hellish Wasteland': 'Hellish Wasteland',
  'Heavy Armor of the Hellish Wasteland': 'Hellish Wasteland',
  'Armband of the Hellish Wasteland': 'Hellish Wasteland',
  'Tassets of the Hellish Wasteland': 'Hellish Wasteland',
  'Boots of the Hellish Wasteland': 'Hellish Wasteland',

  // Eternal Empire Set
  'Shield of the Eternal Empire': 'Eternal Empire',
  'Gold Helm of the Eternal Empire': 'Eternal Empire',
  'Plate of the Eternal Empire': 'Eternal Empire',
  'Vambraces of the Eternal Empire': 'Eternal Empire',
  'Greaves of the Eternal Empire': 'Eternal Empire',
  'Sturdy Boots of the Eternal Empire': 'Eternal Empire',

  // Dragon's Breath Set
  "Dragon's Breath Bow": "Dragon's Breath",
  "Dragon's Breath Helm": "Dragon's Breath",
  "Dragon's Breath Plate": "Dragon's Breath",
  "Dragon's Breath Vambraces": "Dragon's Breath",
  "Dragon's Breath Tassets": "Dragon's Breath",
  "Dragon's Breath Boots": "Dragon's Breath",

  // Glorious Goddess Set
  'Scepter of the Glorious Goddess': 'Garb of the Glorious Goddess',
  'Diadem of the Glorious Goddess': 'Garb of the Glorious Goddess',
  'Plate of the Glorious Goddess': 'Garb of the Glorious Goddess',
  'Gauntlets of the Glorious Goddess': 'Garb of the Glorious Goddess',
  'Chausses of the Glorious Goddess': 'Garb of the Glorious Goddess',
  'Greaves of the Glorious Goddess': 'Garb of the Glorious Goddess',
};

// Get equipment data by ID
function getEquipmentById(id) {
  return equipmentData.find(eq => eq.id === id);
}

// Calculate set pieces count from equipment
export function countSetPieces(equipment) {
  const setCounts = {};
  const slots = ['weapon', 'helmet', 'chest', 'gloves', 'legs', 'boots', 'accessory1', 'accessory2'];

  slots.forEach(slot => {
    const slotData = equipment[slot];
    if (slotData?.id || slotData?.name) {
      const equipItem = slotData.id
        ? getEquipmentById(slotData.id)
        : equipmentData.find(eq => eq.name === slotData.name);

      if (equipItem) {
        const setName = EQUIPMENT_SET_MAP[equipItem.name];
        if (setName) {
          setCounts[setName] = (setCounts[setName] || 0) + 1;
        }
      }
    }
  });

  return setCounts;
}

// Get active set bonuses based on piece counts
export function getActiveSetBonuses(setCounts) {
  const activeBonuses = [];

  Object.entries(setCounts).forEach(([setName, count]) => {
    const setBonus = SET_BONUSES[setName];
    if (setBonus) {
      if (count >= 6 && setBonus[6]) {
        activeBonuses.push({ setName, pieces: 6, ...setBonus[6] });
      }
      if (count >= 4 && setBonus[4]) {
        activeBonuses.push({ setName, pieces: 4, ...setBonus[4] });
      }
      if (count >= 2 && setBonus[2]) {
        activeBonuses.push({ setName, pieces: 2, ...setBonus[2] });
      }
    }
  });

  return activeBonuses;
}

// Calculate total stats from equipment
export function calculateEquipmentStats(equipment, troopType) {
  const stats = {
    attack: 0,
    defense: 0,
    health: 0,
    marchSpeed: 0,
    all_dmg: 0,
    skill_dmg: 0,
    counterattack: 0,
    skill_dmg_reduction: 0
  };

  const slots = ['weapon', 'helmet', 'chest', 'gloves', 'legs', 'boots', 'accessory1', 'accessory2'];

  slots.forEach(slot => {
    const slotData = equipment[slot];
    if (slotData?.id || slotData?.name) {
      const equipItem = slotData.id
        ? getEquipmentById(slotData.id)
        : equipmentData.find(eq => eq.name === slotData.name);

      if (equipItem && equipItem.stats) {
        const iconicLevel = slotData.iconicLevel || 1;
        const hasSpecialTalent = slotData.hasSpecialTalent || slotData.hasCrit || false;

        // Iconic level multiplier (each level adds ~15% more stats)
        const iconicMultiplier = 1 + (iconicLevel - 1) * 0.15;

        // Special talent bonus (30% more)
        const talentMultiplier = hasSpecialTalent ? 1.3 : 1;

        const totalMultiplier = iconicMultiplier * talentMultiplier;

        // Get stats based on troop type
        const eqStats = equipItem.stats;

        // Attack stats
        let attackBonus = 0;
        if (troopType === 'infantry') {
          attackBonus = (eqStats.infantryAttack || 0) + (eqStats.troopAttack || 0);
        } else if (troopType === 'cavalry') {
          attackBonus = (eqStats.cavalryAttack || 0) + (eqStats.troopAttack || 0);
        } else if (troopType === 'archer') {
          attackBonus = (eqStats.archerAttack || 0) + (eqStats.troopAttack || 0);
        } else {
          // For siege or generic, take the highest
          attackBonus = Math.max(
            eqStats.infantryAttack || 0,
            eqStats.cavalryAttack || 0,
            eqStats.archerAttack || 0,
            eqStats.siegeAttack || 0
          ) + (eqStats.troopAttack || 0);
        }

        // Defense stats
        let defenseBonus = 0;
        if (troopType === 'infantry') {
          defenseBonus = (eqStats.infantryDefense || 0) + (eqStats.troopDefense || 0);
        } else if (troopType === 'cavalry') {
          defenseBonus = (eqStats.cavalryDefense || 0) + (eqStats.troopDefense || 0);
        } else if (troopType === 'archer') {
          defenseBonus = (eqStats.archerDefense || 0) + (eqStats.troopDefense || 0);
        } else {
          defenseBonus = Math.max(
            eqStats.infantryDefense || 0,
            eqStats.cavalryDefense || 0,
            eqStats.archerDefense || 0,
            eqStats.siegeDefense || 0
          ) + (eqStats.troopDefense || 0);
        }

        // Health stats
        let healthBonus = 0;
        if (troopType === 'infantry') {
          healthBonus = (eqStats.infantryHealth || 0) + (eqStats.troopHealth || 0);
        } else if (troopType === 'cavalry') {
          healthBonus = (eqStats.cavalryHealth || 0) + (eqStats.troopHealth || 0);
        } else if (troopType === 'archer') {
          healthBonus = (eqStats.archerHealth || 0) + (eqStats.troopHealth || 0);
        } else {
          healthBonus = Math.max(
            eqStats.infantryHealth || 0,
            eqStats.cavalryHealth || 0,
            eqStats.archerHealth || 0,
            eqStats.siegeHealth || 0
          ) + (eqStats.troopHealth || 0);
        }

        // March speed stats
        let marchSpeedBonus = 0;
        if (troopType === 'infantry') {
          marchSpeedBonus = (eqStats.infantryMarchSpeed || 0) + (eqStats.troopMarchSpeed || 0);
        } else if (troopType === 'cavalry') {
          marchSpeedBonus = (eqStats.cavalryMarchSpeed || 0) + (eqStats.troopMarchSpeed || 0);
        } else if (troopType === 'archer') {
          marchSpeedBonus = (eqStats.archerMarchSpeed || 0) + (eqStats.troopMarchSpeed || 0);
        } else {
          marchSpeedBonus = Math.max(
            eqStats.infantryMarchSpeed || 0,
            eqStats.cavalryMarchSpeed || 0,
            eqStats.archerMarchSpeed || 0,
            eqStats.siegeMarchSpeed || 0
          ) + (eqStats.troopMarchSpeed || 0);
        }

        // Apply multipliers
        stats.attack += attackBonus * totalMultiplier;
        stats.defense += defenseBonus * totalMultiplier;
        stats.health += healthBonus * totalMultiplier;
        stats.marchSpeed += marchSpeedBonus * totalMultiplier;
      }
    }
  });

  // Apply set bonuses
  const setCounts = countSetPieces(equipment);
  const activeBonuses = getActiveSetBonuses(setCounts);

  activeBonuses.forEach(bonus => {
    if (bonus.attack) stats.attack += bonus.attack;
    if (bonus.defense) stats.defense += bonus.defense;
    if (bonus.health) stats.health += bonus.health;
    if (bonus.skill_dmg) stats.skill_dmg += bonus.skill_dmg;
    if (bonus.counterattack) stats.counterattack += bonus.counterattack;
    if (bonus.march_speed) stats.marchSpeed += bonus.march_speed;
    if (bonus.skill_dmg_reduction) stats.skill_dmg_reduction += bonus.skill_dmg_reduction;

    // Troop-specific bonuses
    if (bonus.infantry_attack && troopType === 'infantry') {
      stats.attack += bonus.infantry_attack;
    }
    if (bonus.cavalry_defense && troopType === 'cavalry') {
      stats.defense += bonus.cavalry_defense;
    }
    if (bonus.archer_health && troopType === 'archer') {
      stats.health += bonus.archer_health;
    }
  });

  return stats;
}

// Format stat value for display
export function formatStat(value, isPercentage = true) {
  if (value === 0 || !value) return null;
  const formatted = value.toFixed(1).replace(/\.0$/, '');
  return isPercentage ? `${formatted}%` : formatted;
}

// Calculate total materials needed for selected equipment
export function calculateTotalMaterials(equipment) {
  const totals = { leather: 0, iron: 0, ebony: 0, bone: 0, gold: 0 };
  const slots = ['weapon', 'helmet', 'chest', 'gloves', 'legs', 'boots', 'accessory1', 'accessory2'];

  slots.forEach(slot => {
    const slotData = equipment[slot];
    if (slotData?.id) {
      const equipItem = getEquipmentById(slotData.id);
      if (equipItem) {
        if (equipItem.materials) {
          totals.leather += equipItem.materials.leather || 0;
          totals.iron += equipItem.materials.iron || 0;
          totals.ebony += equipItem.materials.ebony || 0;
          totals.bone += equipItem.materials.bone || 0;
        }
        if (equipItem.goldCost) {
          totals.gold += equipItem.goldCost;
        }
      }
    }
  });

  return totals;
}

// Calculate armament/inscription stats
export function calculateArmamentStats(armament, allInscriptions) {
  const stats = {
    attack: 0,
    defense: 0,
    health: 0,
    allDamage: 0,
    skillDamage: 0,
    normalAttack: 0,
    counterattack: 0,
    smiteDamage: 0,
    comboDamage: 0,
  };

  if (!armament) return stats;

  // Add formation bonus
  const formation = armament.formation;
  if (formation) {
    const formationData = FORMATIONS.find(f =>
      f.id === formation ||
      f.name.toLowerCase().replace(' ', '_') === formation.toLowerCase()
    );
    if (formationData?.bonus) {
      Object.entries(formationData.bonus).forEach(([stat, value]) => {
        if (stat === 'na') stats.normalAttack += value;
        else if (stat === 'ca') stats.counterattack += value;
        else if (stats.hasOwnProperty(stat)) stats[stat] += value;
      });
    }
  }

  // Add inscription bonuses from all slots
  const armamentSlots = ['emblem', 'flag', 'instrument', 'scroll'];
  armamentSlots.forEach(slot => {
    const slotData = armament[slot];
    if (slotData?.inscriptions && Array.isArray(slotData.inscriptions)) {
      slotData.inscriptions.forEach(inscriptionId => {
        // Find inscription name from allInscriptions or try direct name lookup
        let inscriptionName = inscriptionId;

        // If we have allInscriptions data, look up the name
        if (allInscriptions && allInscriptions.length > 0) {
          const inscData = allInscriptions.find(i => i.inscriptionId === inscriptionId);
          if (inscData) {
            inscriptionName = inscData.name;
          }
        }

        // Get stats for this inscription
        const inscStats = INSCRIPTION_STATS[inscriptionName];
        if (inscStats) {
          Object.entries(inscStats).forEach(([stat, value]) => {
            if (stat === 'attack') stats.attack += value;
            else if (stat === 'defense') stats.defense += value;
            else if (stat === 'health') stats.health += value;
            else if (stat === 'allDamage') stats.allDamage += value;
            else if (stat === 'skillDamage') stats.skillDamage += value;
            else if (stat === 'na') stats.normalAttack += value;
            else if (stat === 'ca') stats.counterattack += value;
            else if (stat === 'smiteDamage') stats.smiteDamage += value;
            else if (stat === 'comboDamage') stats.comboDamage += value;
          });
        }
      });
    }
  });

  return stats;
}

// Calculate combined total stats (equipment + armament)
export function calculateTotalStats(equipmentStats, armamentStats) {
  return {
    attack: (equipmentStats?.attack || 0) + (armamentStats?.attack || 0),
    defense: (equipmentStats?.defense || 0) + (armamentStats?.defense || 0),
    health: (equipmentStats?.health || 0) + (armamentStats?.health || 0),
    marchSpeed: equipmentStats?.marchSpeed || 0,
    allDamage: (equipmentStats?.all_dmg || 0) + (armamentStats?.allDamage || 0),
    skillDamage: (equipmentStats?.skill_dmg || 0) + (armamentStats?.skillDamage || 0),
    normalAttack: armamentStats?.normalAttack || 0,
    counterattack: (equipmentStats?.counterattack || 0) + (armamentStats?.counterattack || 0),
    smiteDamage: armamentStats?.smiteDamage || 0,
    comboDamage: armamentStats?.comboDamage || 0,
    skillDmgReduction: equipmentStats?.skill_dmg_reduction || 0,
  };
}

// Calculate stats for ALL troop types (for display like codexhelper)
export function calculateAllTroopStats(equipment) {
  const stats = {
    infantry: { attack: 0, defense: 0, health: 0, marchSpeed: 0 },
    cavalry: { attack: 0, defense: 0, health: 0, marchSpeed: 0 },
    archer: { attack: 0, defense: 0, health: 0, marchSpeed: 0 },
    siege: { attack: 0, defense: 0, health: 0, marchSpeed: 0 },
    extraBonuses: [],
  };

  const slots = ['weapon', 'helmet', 'chest', 'gloves', 'legs', 'boots', 'accessory1', 'accessory2'];

  slots.forEach(slot => {
    const slotData = equipment[slot];
    if (slotData?.id || slotData?.name) {
      const equipItem = slotData.id
        ? getEquipmentById(slotData.id)
        : equipmentData.find(eq => eq.name === slotData.name);

      if (equipItem && equipItem.stats) {
        const iconicLevel = slotData.iconicLevel || 1;
        const hasSpecialTalent = slotData.hasSpecialTalent || slotData.hasCrit || false;
        const iconicMultiplier = 1 + (iconicLevel - 1) * 0.15;
        const talentMultiplier = hasSpecialTalent ? 1.3 : 1;
        const totalMultiplier = iconicMultiplier * talentMultiplier;

        const eqStats = equipItem.stats;

        // Infantry stats
        if (eqStats.infantryAttack) stats.infantry.attack += eqStats.infantryAttack * totalMultiplier;
        if (eqStats.infantryDefense) stats.infantry.defense += eqStats.infantryDefense * totalMultiplier;
        if (eqStats.infantryHealth) stats.infantry.health += eqStats.infantryHealth * totalMultiplier;
        if (eqStats.infantryMarchSpeed) stats.infantry.marchSpeed += eqStats.infantryMarchSpeed * totalMultiplier;

        // Cavalry stats
        if (eqStats.cavalryAttack) stats.cavalry.attack += eqStats.cavalryAttack * totalMultiplier;
        if (eqStats.cavalryDefense) stats.cavalry.defense += eqStats.cavalryDefense * totalMultiplier;
        if (eqStats.cavalryHealth) stats.cavalry.health += eqStats.cavalryHealth * totalMultiplier;
        if (eqStats.cavalryMarchSpeed) stats.cavalry.marchSpeed += eqStats.cavalryMarchSpeed * totalMultiplier;

        // Archer stats
        if (eqStats.archerAttack) stats.archer.attack += eqStats.archerAttack * totalMultiplier;
        if (eqStats.archerDefense) stats.archer.defense += eqStats.archerDefense * totalMultiplier;
        if (eqStats.archerHealth) stats.archer.health += eqStats.archerHealth * totalMultiplier;
        if (eqStats.archerMarchSpeed) stats.archer.marchSpeed += eqStats.archerMarchSpeed * totalMultiplier;

        // Siege stats
        if (eqStats.siegeAttack) stats.siege.attack += eqStats.siegeAttack * totalMultiplier;
        if (eqStats.siegeDefense) stats.siege.defense += eqStats.siegeDefense * totalMultiplier;
        if (eqStats.siegeHealth) stats.siege.health += eqStats.siegeHealth * totalMultiplier;
        if (eqStats.siegeMarchSpeed) stats.siege.marchSpeed += eqStats.siegeMarchSpeed * totalMultiplier;

        // Universal troop stats (add to all)
        if (eqStats.troopAttack) {
          const val = eqStats.troopAttack * totalMultiplier;
          stats.infantry.attack += val;
          stats.cavalry.attack += val;
          stats.archer.attack += val;
          stats.siege.attack += val;
        }
        if (eqStats.troopDefense) {
          const val = eqStats.troopDefense * totalMultiplier;
          stats.infantry.defense += val;
          stats.cavalry.defense += val;
          stats.archer.defense += val;
          stats.siege.defense += val;
        }
        if (eqStats.troopHealth) {
          const val = eqStats.troopHealth * totalMultiplier;
          stats.infantry.health += val;
          stats.cavalry.health += val;
          stats.archer.health += val;
          stats.siege.health += val;
        }
        if (eqStats.troopMarchSpeed) {
          const val = eqStats.troopMarchSpeed * totalMultiplier;
          stats.infantry.marchSpeed += val;
          stats.cavalry.marchSpeed += val;
          stats.archer.marchSpeed += val;
          stats.siege.marchSpeed += val;
        }

        // Extra bonuses (special stats)
        if (equipItem.specialStats && equipItem.specialStats.length > 0) {
          equipItem.specialStats.forEach(bonus => {
            if (!stats.extraBonuses.includes(bonus)) {
              stats.extraBonuses.push(bonus);
            }
          });
        }
      }
    }
  });

  return stats;
}
