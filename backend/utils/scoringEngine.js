/**
 * Scoring Calculation Engine
 * Implements the 3-layer scoring system from the Excel calculator
 */

/**
 * Calculate weighted score for a set of stats
 * @param {Object} stats - The stats object with attack, defense, health, etc.
 * @param {Object} scale - The scoring scale for the role
 * @param {Object} multipliers - Optional multipliers to apply
 * @returns {number} Weighted score
 */
export function calculateWeightedScore(stats, scale, multipliers = null) {
  let score = 0;

  const statTypes = ['attack', 'defense', 'health', 'all_dmg', 'na', 'ca', 'skill_dmg', 'smite_dmg', 'combo_dmg'];

  statTypes.forEach(statType => {
    let statValue = stats[statType] || 0;

    // Apply multipliers if provided and relevant
    if (multipliers && statType.includes('dmg')) {
      if (statType === 'all_dmg' && multipliers.all_dmg) {
        statValue *= (1 + multipliers.all_dmg);
      } else if (statType === 'skill_dmg' && multipliers.skill_dmg) {
        statValue *= (1 + multipliers.skill_dmg);
      } else if (statType === 'smite_dmg' && multipliers.smite_dmg) {
        statValue *= (1 + multipliers.smite_dmg);
      } else if (statType === 'combo_dmg' && multipliers.combo_dmg) {
        statValue *= (1 + multipliers.combo_dmg);
      }
    }

    const weight = scale[statType] || 0;
    score += statValue * weight;
  });

  return score;
}

/**
 * Calculate Layer 1 Score (Player Base Stats)
 * @param {Object} layer1Data - VIP, civilisation, spending, city skin data
 * @param {Object} role - Commander role with scoring scales
 * @returns {Object} { stats, score }
 */
export function calculateLayer1Score(layer1Data, role) {
  const { vipBonus, civBonus, spendingBonus, citySkinBonus } = layer1Data;

  const combinedStats = {
    attack: (vipBonus.attack || 0) + (civBonus.attack || 0) + (spendingBonus.attack || 0) + (citySkinBonus.attack || 0),
    defense: (vipBonus.defense || 0) + (civBonus.defense || 0) + (spendingBonus.defense || 0) + (citySkinBonus.defense || 0),
    health: (vipBonus.health || 0) + (civBonus.health || 0) + (spendingBonus.health || 0) + (citySkinBonus.health || 0),
    all_dmg: (vipBonus.all_dmg || 0) + (civBonus.all_dmg || 0) + (spendingBonus.all_dmg || 0) + (citySkinBonus.all_dmg || 0),
    na: (civBonus.na || 0),
    ca: 0,
    skill_dmg: (civBonus.skill_dmg || 0) + (citySkinBonus.skill_dmg || 0),
    smite_dmg: 0,
    combo_dmg: 0
  };

  const score = calculateWeightedScore(combinedStats, role.scoring_scales.layer_1_2);

  return { stats: combinedStats, score };
}

/**
 * Calculate Layer 2 Score (Equipment)
 * @param {Object} layer2Data - Equipment pieces and set bonuses
 * @param {Object} role - Commander role with scoring scales
 * @returns {Object} { stats, score }
 */
export function calculateLayer2Score(layer2Data, role) {
  const { equipmentPieces, setBonuses } = layer2Data;

  const combinedStats = {
    attack: 0,
    defense: 0,
    health: 0,
    all_dmg: 0,
    na: 0,
    ca: 0,
    skill_dmg: 0,
    smite_dmg: 0,
    combo_dmg: 0
  };

  const combinedMultipliers = {
    all_dmg: 0,
    skill_dmg: 0,
    smite_dmg: 0,
    combo_dmg: 0
  };

  // Add equipment stats
  equipmentPieces.forEach(piece => {
    const stats = piece.stats || {};
    const multipliers = piece.multipliers || {};

    Object.keys(combinedStats).forEach(statType => {
      combinedStats[statType] += stats[statType] || 0;
    });

    // Accumulate multipliers (Iconic V equipment only)
    if (piece.iconic_level === 'V' || piece.iconic_level === 'Iconic V') {
      combinedMultipliers.all_dmg += multipliers.all_dmg || 0;
      combinedMultipliers.skill_dmg += multipliers.skill_dmg || 0;
      combinedMultipliers.smite_dmg += multipliers.smite_dmg || 0;
      combinedMultipliers.combo_dmg += multipliers.combo_dmg || 0;
    }
  });

  // Add set bonuses
  if (setBonuses && setBonuses.length > 0) {
    setBonuses.forEach(setBonus => {
      const bonusStats = setBonus.stats || {};
      Object.keys(combinedStats).forEach(statType => {
        combinedStats[statType] += bonusStats[statType] || 0;
      });
    });
  }

  // Apply multipliers to damage stats
  combinedStats.all_dmg *= (1 + combinedMultipliers.all_dmg);
  combinedStats.skill_dmg *= (1 + combinedMultipliers.skill_dmg);
  combinedStats.smite_dmg *= (1 + combinedMultipliers.smite_dmg);
  combinedStats.combo_dmg *= (1 + combinedMultipliers.combo_dmg);

  const score = calculateWeightedScore(combinedStats, role.scoring_scales.layer_1_2);

  return { stats: combinedStats, score, multipliers: combinedMultipliers };
}

/**
 * Calculate Layer 3 Score (Formation & Inscriptions)
 * @param {Object} layer3Data - Formation, inscriptions, and armaments
 * @param {Object} role - Commander role with scoring scales
 * @returns {Object} { stats, score }
 */
export function calculateLayer3Score(layer3Data, role) {
  const { formationBonus, inscriptions, armamentAttributes } = layer3Data;

  const combinedStats = {
    attack: 0,
    defense: 0,
    health: 0,
    all_dmg: 0,
    na: 0,
    ca: 0,
    skill_dmg: 0,
    smite_dmg: 0,
    combo_dmg: 0
  };

  const combinedMultipliers = {
    all_dmg: 0,
    skill_dmg: 0,
    smite_dmg: 0,
    combo_dmg: 0
  };

  // Add formation bonus
  if (formationBonus) {
    Object.keys(combinedStats).forEach(statType => {
      combinedStats[statType] += formationBonus[statType] || 0;
    });
  }

  // Add inscription bonuses
  inscriptions.forEach(inscription => {
    const stats = inscription.stats || {};
    const multipliers = inscription.multipliers || {};
    const negativeEffects = inscription.negative_effects || {};

    Object.keys(combinedStats).forEach(statType => {
      combinedStats[statType] += (stats[statType] || 0) - (negativeEffects[statType] || 0);
    });

    // Accumulate multipliers
    combinedMultipliers.all_dmg += multipliers.all_dmg || 0;
    combinedMultipliers.skill_dmg += multipliers.skill_dmg || 0;
    combinedMultipliers.smite_dmg += multipliers.smite_dmg || 0;
    combinedMultipliers.combo_dmg += multipliers.combo_dmg || 0;
  });

  // Add armament attributes (manually entered stats)
  if (armamentAttributes) {
    combinedStats.attack += armamentAttributes.attack || 0;
    combinedStats.defense += armamentAttributes.defense || 0;
    combinedStats.health += armamentAttributes.health || 0;
    combinedStats.all_dmg += armamentAttributes.all_dmg || 0;
  }

  // Apply multipliers to damage stats BEFORE scoring
  combinedStats.all_dmg *= (1 + combinedMultipliers.all_dmg);
  combinedStats.skill_dmg *= (1 + combinedMultipliers.skill_dmg);
  combinedStats.smite_dmg *= (1 + combinedMultipliers.smite_dmg);
  combinedStats.combo_dmg *= (1 + combinedMultipliers.combo_dmg);

  // Use Layer 3 specific scoring scale (accounts for diminishing returns)
  // Fall back to layer_1_2 scale if layer_3 is not defined
  const scale = role.scoring_scales.layer_3 || role.scoring_scales.layer_1_2;
  const score = calculateWeightedScore(combinedStats, scale);

  return { stats: combinedStats, score, multipliers: combinedMultipliers };
}

/**
 * Calculate total score and determine tier
 * @param {number} layer1Score
 * @param {number} layer2Score
 * @param {number} layer3Score
 * @param {Object} role - Commander role with reference scores
 * @returns {Object} { totalScore, tier, percentageOfMax }
 */
export function calculateTotalScore(layer1Score, layer2Score, layer3Score, role) {
  const totalScore = layer1Score + layer2Score + layer3Score;
  const highestScore = role.highest_score_reference;
  const percentageOfMax = (totalScore / highestScore) * 100;

  let tier = 'C';
  const thresholds = role.tier_thresholds;

  if (percentageOfMax >= thresholds.s_plus) {
    tier = 'S+';
  } else if (percentageOfMax >= thresholds.s) {
    tier = 'S';
  } else if (percentageOfMax >= thresholds.a) {
    tier = 'A';
  } else if (percentageOfMax >= thresholds.b) {
    tier = 'B';
  }

  return {
    totalScore: Math.round(totalScore * 100) / 100,
    tier,
    percentageOfMax: Math.round(percentageOfMax * 100) / 100
  };
}

/**
 * Detect and calculate set bonuses
 * @param {Array} equipmentPieces - Array of equipped items
 * @param {Array} allSetBonuses - Array of all set bonus definitions
 * @returns {Array} Active set bonuses
 */
export function detectSetBonuses(equipmentPieces, allSetBonuses) {
  const setCount = {};

  // Count pieces per set
  equipmentPieces.forEach(piece => {
    if (piece.set_name) {
      setCount[piece.set_name] = (setCount[piece.set_name] || 0) + 1;
    }
  });

  const activeSetBonuses = [];

  // Determine which set bonuses are active
  Object.keys(setCount).forEach(setName => {
    const count = setCount[setName];
    const setBonusData = allSetBonuses.find(sb => sb.set_name === setName);

    if (setBonusData) {
      // Find the highest applicable bonus level
      const applicableBonuses = setBonusData.bonus_levels
        .filter(level => count >= level.pieces_required)
        .sort((a, b) => b.pieces_required - a.pieces_required);

      if (applicableBonuses.length > 0) {
        activeSetBonuses.push({
          set_name: setName,
          pieces_count: count,
          stats: applicableBonuses[0].stats
        });
      }
    }
  });

  return activeSetBonuses;
}
