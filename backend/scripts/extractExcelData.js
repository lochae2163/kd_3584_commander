import xlsx from 'xlsx';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Path to Excel file
const EXCEL_FILE = path.join(__dirname, '../../..', '[TKC] NEW TECH - RALLY_GARRISON Leaders Calculator - By Davor.xlsx');
const OUTPUT_DIR = path.join(__dirname, '../data');

// Ensure output directory exists
if (!fs.existsSync(OUTPUT_DIR)) {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
}

console.log('Reading Excel file:', EXCEL_FILE);
const workbook = xlsx.readFile(EXCEL_FILE);

/**
 * Extract Commander Roles with Scoring Scales
 */
function extractCommanderRoles() {
  const scalesSheet = workbook.Sheets['SCALES OF VALUES'];
  const referencesSheet = workbook.Sheets['REFERENCES'];

  if (!scalesSheet || !referencesSheet) {
    console.error('Required sheets not found');
    return [];
  }

  // Read raw data without headers
  const scalesRaw = xlsx.utils.sheet_to_json(scalesSheet, { header: 1 });
  const referencesData = xlsx.utils.sheet_to_json(referencesSheet);

  const roles = [];
  const rolesMap = {};

  // First row is headers, data starts from row 2 (index 1)
  for (let i = 1; i < scalesRaw.length; i++) {
    const row = scalesRaw[i];

    // Column 0: Role ID
    // Column 1: Attack (Layer 1-2) or empty
    // Columns 2-9: Defense, Health, All DMG, NA, CA, Skill DMG, Smite DMG, Combo DMG

    const roleId = row[0];
    if (!roleId) continue;

    // Check if this is Layer 1-2 or Layer 3
    const layerMarker = row[1];
    const isLayer3 = (typeof layerMarker === 'string' && layerMarker.includes('LAYER 3'));

    if (!rolesMap[roleId]) {
      rolesMap[roleId] = {
        role_id: roleId,
        scoring_scales: {
          layer_1_2: null,
          layer_3: null
        }
      };
    }

    const scale = {
      attack: parseFloat(row[1]) || 0,
      defense: parseFloat(row[2]) || 0,
      health: parseFloat(row[3]) || 0,
      all_dmg: parseFloat(row[4]) || 0,
      na: parseFloat(row[5]) || 0,
      ca: parseFloat(row[6]) || 0,
      skill_dmg: parseFloat(row[7]) || 0,
      smite_dmg: parseFloat(row[8]) || 0,
      combo_dmg: parseFloat(row[9]) || 0
    };

    if (isLayer3) {
      rolesMap[roleId].scoring_scales.layer_3 = scale;
    } else {
      rolesMap[roleId].scoring_scales.layer_1_2 = scale;
    }
  }

  // Add reference scores and extract troop type and role type
  Object.keys(rolesMap).forEach(roleId => {
    const role = rolesMap[roleId];

    // Parse role_id to extract troop type, role type, and damage focus
    const parts = roleId.split(' - ');
    const firstPart = parts[0];
    const damageFocus = parts.slice(1).join(' - ') || 'STANDARD';

    let troopType = 'CAVALRY';
    let roleType = 'RALLY';

    if (firstPart.includes('ARCHER')) {
      troopType = 'ARCHER';
    } else if (firstPart.includes('INFANTRY')) {
      troopType = 'INFANTRY';
    } else if (firstPart.includes('LEADERSHIP')) {
      troopType = 'LEADERSHIP';
    } else if (firstPart.includes('CAV')) {
      troopType = 'CAVALRY';
    }

    if (firstPart.includes('GARRISON')) {
      roleType = 'GARRISON';
    } else if (firstPart.includes('RALLY')) {
      roleType = 'RALLY';
    }

    role.troop_type = troopType;
    role.role_type = roleType;
    role.damage_focus = damageFocus;

    // Find reference score (using the __EMPTY column which has the role ID)
    const refRow = referencesData.find(r => r['__EMPTY'] === roleId);
    role.highest_score_reference = refRow ? (refRow['HIGHEST SCORE'] || 500) : 500;

    roles.push(role);
  });

  return roles;
}

/**
 * Extract Equipment Library
 */
function extractEquipment() {
  const sheet = workbook.Sheets['EQUIPMENT LIBRARY'];
  if (!sheet) {
    console.error('EQUIPMENT LIBRARY sheet not found');
    return [];
  }

  // Read raw data - headers are in row 1, data starts from row 2
  const rawData = xlsx.utils.sheet_to_json(sheet, { header: 1 });
  const equipmentMap = {};

  // Skip first row (headers) and start from row 2 (index 1)
  for (let i = 1; i < rawData.length; i++) {
    const row = rawData[i];

    // Column layout based on debug output:
    // 0: Equipment name
    // 1: Iconic level
    // 2: Attack
    // 3: Defense
    // 4: Health
    // 5: All DMG
    // 6: NA
    // 7: CA
    // 8: Skill DMG
    // 9: Smite DMG
    // 10: Combo DMG
    // 11: (skip)
    // 12: All DMG multiplier
    // 13: NA multiplier
    // 14: Skill DMG multiplier
    // 15: Smite multiplier
    // 16: Combo multiplier

    const name = row[0];
    const iconicLevel = row[1];

    if (!name || !iconicLevel) continue;

    const equipmentId = name.toLowerCase().replace(/\s+/g, '_').replace(/[^a-z0-9_]/g, '');

    if (!equipmentMap[equipmentId]) {
      equipmentMap[equipmentId] = {
        equipment_id: equipmentId,
        name: name,
        type: 'WEAPON', // Will need to determine from data or hardcode
        set_name: null,
        iconic_levels: [],
        special_talent_available: true
      };
    }

    const stats = {
      attack: parseFloat(row[2]) || 0,
      defense: parseFloat(row[3]) || 0,
      health: parseFloat(row[4]) || 0,
      all_dmg: parseFloat(row[5]) || 0,
      na: parseFloat(row[6]) || 0,
      ca: parseFloat(row[7]) || 0,
      skill_dmg: parseFloat(row[8]) || 0,
      smite_dmg: parseFloat(row[9]) || 0,
      combo_dmg: parseFloat(row[10]) || 0
    };

    const multipliers = {
      all_dmg: parseFloat(row[12]) || 0,
      na: parseFloat(row[13]) || 0,
      skill_dmg: parseFloat(row[14]) || 0,
      smite_dmg: parseFloat(row[15]) || 0,
      combo_dmg: parseFloat(row[16]) || 0
    };

    equipmentMap[equipmentId].iconic_levels.push({
      level: iconicLevel,
      stats: stats,
      multipliers: multipliers
    });
  }

  return Object.values(equipmentMap);
}

/**
 * Extract Inscriptions Library
 */
function extractInscriptions() {
  const sheet = workbook.Sheets['INSCRIPTIONS LIBRARY'];
  if (!sheet) {
    console.error('INSCRIPTIONS LIBRARY sheet not found');
    return [];
  }

  // Read raw data - headers are in row 1, data starts from row 2
  const rawData = xlsx.utils.sheet_to_json(sheet, { header: 1 });
  const inscriptions = [];

  // Skip first row (headers) and start from row 2 (index 1)
  for (let i = 1; i < rawData.length; i++) {
    const row = rawData[i];

    // Column layout based on debug output:
    // 0: Inscription name
    // 1: Attack (BONUSES header)
    // 2: Defense
    // 3: Health
    // 4: All DMG
    // 5: NA
    // 6: CA
    // 7: Skill DMG
    // 8: Smite DMG
    // 9: Combo DMG
    // 10: (skip)
    // 11: All DMG multiplier
    // 12: NA multiplier
    // 13: Skill DMG multiplier
    // 14: Smite multiplier
    // 15: Combo multiplier

    const name = row[0];
    if (!name) continue;

    const inscriptionId = name.toLowerCase().replace(/\s+/g, '_').replace(/[^a-z0-9_]/g, '');

    const stats = {
      attack: parseFloat(row[1]) || 0,
      defense: parseFloat(row[2]) || 0,
      health: parseFloat(row[3]) || 0,
      all_dmg: parseFloat(row[4]) || 0,
      na: parseFloat(row[5]) || 0,
      ca: parseFloat(row[6]) || 0,
      skill_dmg: parseFloat(row[7]) || 0,
      smite_dmg: parseFloat(row[8]) || 0,
      combo_dmg: parseFloat(row[9]) || 0
    };

    const multipliers = {
      all_dmg: parseFloat(row[11]) || 0,
      na: parseFloat(row[12]) || 0,
      skill_dmg: parseFloat(row[13]) || 0,
      smite_dmg: parseFloat(row[14]) || 0,
      combo_dmg: parseFloat(row[15]) || 0
    };

    inscriptions.push({
      inscription_id: inscriptionId,
      name: name,
      rarity: 'COMMON', // Not available in sheet, default to COMMON
      stats: stats,
      multipliers: multipliers,
      context_specific: false,
      context_bonuses: [],
      negative_effects: {}
    });
  }

  return inscriptions;
}

/**
 * Extract VIP Bonuses
 */
function extractVIPBonuses() {
  const sheet = workbook.Sheets['VIP'];
  if (!sheet) {
    console.error('VIP sheet not found');
    return [];
  }

  const data = xlsx.utils.sheet_to_json(sheet);
  const vipBonuses = [];

  data.forEach(row => {
    // VIP level is in __EMPTY column
    const vipLevel = row['__EMPTY'];
    if (!vipLevel) return;

    // Extract number from VIP string (e.g., "VIP10" -> 10)
    const level = parseInt(vipLevel.replace('VIP', ''));

    vipBonuses.push({
      vip_level: level,
      attack: parseFloat(row['ATTACK']) || 0,
      defense: parseFloat(row['DEFENSE']) || 0,
      health: parseFloat(row['HEALTH']) || 0,
      all_dmg: parseFloat(row['ALL DMG']) || 0
    });
  });

  return vipBonuses;
}

/**
 * Extract Civilisations
 */
function extractCivilisations() {
  const sheet = workbook.Sheets['CIVILISATION'];
  if (!sheet) {
    console.error('CIVILISATION sheet not found');
    return [];
  }

  const data = xlsx.utils.sheet_to_json(sheet);
  const civsMap = {};

  data.forEach(row => {
    // Role ID is in __EMPTY column, Civ name is in __EMPTY_1
    const roleId = row['__EMPTY'];
    const civName = row['__EMPTY_1'];

    if (!civName || !roleId) return;

    if (!civsMap[civName]) {
      civsMap[civName] = {
        name: civName,
        bonuses_by_role: []
      };
    }

    civsMap[civName].bonuses_by_role.push({
      role_id: roleId,
      attack: parseFloat(row['ATTACK']) || 0,
      defense: parseFloat(row['DEFENSE']) || 0,
      health: parseFloat(row['HEALTH']) || 0,
      all_dmg: parseFloat(row['ALL DMG']) || 0,
      na: parseFloat(row['NA ']) || 0,
      skill_dmg: parseFloat(row['SKILL DMG']) || 0
    });
  });

  return Object.values(civsMap);
}

/**
 * Extract Spending Tiers
 */
function extractSpendingTiers() {
  const sheet = workbook.Sheets['SPENDING'];
  if (!sheet) {
    console.error('SPENDING sheet not found');
    return [];
  }

  const data = xlsx.utils.sheet_to_json(sheet);
  const tiers = [];

  data.forEach(row => {
    // Spending tier name is in __EMPTY column
    const tierName = row['__EMPTY'];
    if (!tierName) return;

    tiers.push({
      tier_name: tierName,
      attack: parseFloat(row['ATTACK']) || 0,
      defense: parseFloat(row['DEFENSE']) || 0,
      health: parseFloat(row['HEALTH']) || 0,
      all_dmg: parseFloat(row['ALL DMG']) || 0
    });
  });

  return tiers;
}

/**
 * Extract City Skins
 */
function extractCitySkins() {
  const sheet = workbook.Sheets['CITY SKIN LIBRARY'];
  if (!sheet) {
    console.error('CITY SKIN LIBRARY sheet not found');
    return [];
  }

  const data = xlsx.utils.sheet_to_json(sheet);
  const skinsMap = {};

  data.forEach(row => {
    // Role ID is in __EMPTY column, Skin name is in __EMPTY_1
    const roleId = row['__EMPTY'];
    const skinName = row['__EMPTY_1'];

    if (!skinName || !roleId) return;

    if (!skinsMap[skinName]) {
      skinsMap[skinName] = {
        name: skinName,
        bonuses_by_role: []
      };
    }

    skinsMap[skinName].bonuses_by_role.push({
      role_id: roleId,
      attack: parseFloat(row['ATTACK']) || 0,
      defense: parseFloat(row['DEFENSE']) || 0,
      health: parseFloat(row['HEALTH']) || 0,
      all_dmg: parseFloat(row['ALL DMG']) || 0,
      skill_dmg: parseFloat(row['SKILL DMG']) || 0
    });
  });

  return Object.values(skinsMap);
}

/**
 * Extract Set Bonuses
 */
function extractSetBonuses() {
  // Hardcoded based on the analysis - this data isn't directly in a sheet
  return [
    {
      set_name: 'Hellish Wasteland',
      bonus_levels: [
        { pieces_required: 2, stats: { attack: 2, defense: 0, health: 0, all_dmg: 0, skill_dmg: 0 } },
        { pieces_required: 4, stats: { attack: 3, defense: 0, health: 0, all_dmg: 0, skill_dmg: 2 } },
        { pieces_required: 6, stats: { attack: 4, defense: 0, health: 3, all_dmg: 0, skill_dmg: 3 } }
      ]
    },
    {
      set_name: 'Dragon Breath',
      bonus_levels: [
        { pieces_required: 2, stats: { attack: 2, defense: 0, health: 0, all_dmg: 0, skill_dmg: 0 } },
        { pieces_required: 4, stats: { attack: 3, defense: 0, health: 0, all_dmg: 0, skill_dmg: 3 } },
        { pieces_required: 6, stats: { attack: 4, defense: 0, health: 3, all_dmg: 0, skill_dmg: 4 } }
      ]
    },
    {
      set_name: 'Eternal Empire',
      bonus_levels: [
        { pieces_required: 2, stats: { attack: 0, defense: 2, health: 0, all_dmg: 0, skill_dmg: 0 } },
        { pieces_required: 6, stats: { attack: 0, defense: 4, health: 3, all_dmg: 0, skill_dmg: 3 } }
      ]
    },
    {
      set_name: 'Garb of the Glorious Goddess',
      bonus_levels: [
        { pieces_required: 2, stats: { attack: 2, defense: 0, health: 0, all_dmg: 0, skill_dmg: 0 } },
        { pieces_required: 4, stats: { attack: 3, defense: 0, health: 0, all_dmg: 0, skill_dmg: 3 } },
        { pieces_required: 6, stats: { attack: 4, defense: 0, health: 3, all_dmg: 0, skill_dmg: 4 } }
      ]
    }
  ];
}

// Extract all data
try {
  console.log('\n=== Extracting Commander Roles ===');
  const roles = extractCommanderRoles();
  console.log(`Extracted ${roles.length} roles`);
  fs.writeFileSync(path.join(OUTPUT_DIR, 'commanderRoles.json'), JSON.stringify(roles, null, 2));

  console.log('\n=== Extracting Equipment ===');
  const equipment = extractEquipment();
  console.log(`Extracted ${equipment.length} equipment items`);
  fs.writeFileSync(path.join(OUTPUT_DIR, 'equipment.json'), JSON.stringify(equipment, null, 2));

  console.log('\n=== Extracting Inscriptions ===');
  const inscriptions = extractInscriptions();
  console.log(`Extracted ${inscriptions.length} inscriptions`);
  fs.writeFileSync(path.join(OUTPUT_DIR, 'inscriptions.json'), JSON.stringify(inscriptions, null, 2));

  console.log('\n=== Extracting VIP Bonuses ===');
  const vipBonuses = extractVIPBonuses();
  console.log(`Extracted ${vipBonuses.length} VIP levels`);
  fs.writeFileSync(path.join(OUTPUT_DIR, 'vipBonuses.json'), JSON.stringify(vipBonuses, null, 2));

  console.log('\n=== Extracting Civilisations ===');
  const civilisations = extractCivilisations();
  console.log(`Extracted ${civilisations.length} civilisations`);
  fs.writeFileSync(path.join(OUTPUT_DIR, 'civilisations.json'), JSON.stringify(civilisations, null, 2));

  console.log('\n=== Extracting Spending Tiers ===');
  const spendingTiers = extractSpendingTiers();
  console.log(`Extracted ${spendingTiers.length} spending tiers`);
  fs.writeFileSync(path.join(OUTPUT_DIR, 'spendingTiers.json'), JSON.stringify(spendingTiers, null, 2));

  console.log('\n=== Extracting City Skins ===');
  const citySkins = extractCitySkins();
  console.log(`Extracted ${citySkins.length} city skins`);
  fs.writeFileSync(path.join(OUTPUT_DIR, 'citySkins.json'), JSON.stringify(citySkins, null, 2));

  console.log('\n=== Creating Set Bonuses ===');
  const setBonuses = extractSetBonuses();
  console.log(`Created ${setBonuses.length} set bonuses`);
  fs.writeFileSync(path.join(OUTPUT_DIR, 'setBonuses.json'), JSON.stringify(setBonuses, null, 2));

  console.log('\n✅ All data extracted successfully!');
  console.log(`Output directory: ${OUTPUT_DIR}`);
} catch (error) {
  console.error('Error extracting data:', error);
}
