import CommanderRole from '../models/CommanderRole.js';
import Equipment from '../models/Equipment.js';
import Inscription from '../models/Inscription.js';
import SetBonus from '../models/SetBonus.js';
import { VIPBonus, Civilisation, SpendingTier, CitySkin } from '../models/PlayerProfile.js';
import CommanderBuild from '../models/CommanderBuild.js';
import {
  calculateLayer1Score,
  calculateLayer2Score,
  calculateLayer3Score,
  calculateTotalScore,
  detectSetBonuses
} from '../utils/scoringEngine.js';

/**
 * Calculate commander build score
 */
export const calculateBuildScore = async (req, res) => {
  try {
    const {
      player_name,
      role,
      vip_level,
      civilisation,
      spending_tier,
      city_skin,
      equipment_pieces,
      formation,
      special_inscriptions,
      rare_inscriptions,
      common_inscriptions,
      armament_attributes
    } = req.body;

    // Validate required fields
    if (!player_name || !role) {
      return res.status(400).json({ error: 'Player name and role are required' });
    }

    // Get role data with scoring scales
    const roleData = await CommanderRole.findOne({ role_id: role });
    if (!roleData) {
      return res.status(404).json({ error: 'Role not found' });
    }

    // === LAYER 1: Player Base Stats ===
    const vipBonus = await VIPBonus.findOne({ vip_level });
    const civData = await Civilisation.findOne({ name: civilisation });
    const spendingData = await SpendingTier.findOne({ tier_name: spending_tier });
    const citySkinData = await CitySkin.findOne({ name: city_skin });

    // Get role-specific bonuses
    const civBonus = civData?.bonuses_by_role?.find(b => b.role_id === role) || {};
    const citySkinBonus = citySkinData?.bonuses_by_role?.find(b => b.role_id === role) || {};

    const layer1Result = calculateLayer1Score(
      {
        vipBonus: vipBonus || {},
        civBonus,
        spendingBonus: spendingData || {},
        citySkinBonus
      },
      roleData
    );

    // === LAYER 2: Equipment ===
    const allSetBonuses = await SetBonus.find({});

    // Fetch equipment details and build stats
    const equipmentWithStats = await Promise.all(
      (equipment_pieces || []).map(async (piece) => {
        const equipment = await Equipment.findOne({ equipment_id: piece.equipment_id });
        if (!equipment) return null;

        // Handle both "V" and "Iconic V" formats
        const levelSearch = piece.iconic_level.startsWith('Iconic')
          ? piece.iconic_level
          : `Iconic ${piece.iconic_level}`;

        const iconicLevel = equipment.iconic_levels.find(il =>
          il.level === piece.iconic_level || il.level === levelSearch
        );
        if (!iconicLevel) return null;

        return {
          ...piece,
          stats: iconicLevel.stats,
          multipliers: iconicLevel.multipliers,
          set_name: equipment.set_name
        };
      })
    );

    const validEquipment = equipmentWithStats.filter(e => e !== null);
    const activeSets = detectSetBonuses(validEquipment, allSetBonuses);

    const layer2Result = calculateLayer2Score(
      {
        equipmentPieces: validEquipment,
        setBonuses: activeSets
      },
      roleData
    );

    // === LAYER 3: Formation & Inscriptions ===

    // Get formation bonus (inscriptions table includes formations)
    const formationData = await Inscription.findOne({
      name: formation,
      rarity: 'FORMATION'
    });

    // Get all inscription details
    const allInscriptionIds = [
      ...(special_inscriptions || []),
      ...(rare_inscriptions || []),
      ...(common_inscriptions || [])
    ];

    const inscriptionDetails = await Inscription.find({
      inscription_id: { $in: allInscriptionIds }
    });

    const layer3Result = calculateLayer3Score(
      {
        formationBonus: formationData?.stats || {},
        inscriptions: inscriptionDetails,
        armamentAttributes: armament_attributes || {}
      },
      roleData
    );

    // === Calculate Total Score ===
    const { totalScore, tier, percentageOfMax } = calculateTotalScore(
      layer1Result.score,
      layer2Result.score,
      layer3Result.score,
      roleData
    );

    // Create build object
    const build = {
      player_name,
      role,
      layer_1: {
        vip_level,
        civilisation,
        spending_tier,
        city_skin,
        calculated_stats: layer1Result.stats,
        score: layer1Result.score
      },
      layer_2: {
        equipment_pieces,
        set_bonuses: activeSets,
        calculated_stats: layer2Result.stats,
        score: layer2Result.score
      },
      layer_3: {
        formation,
        special_inscriptions: special_inscriptions || [],
        rare_inscriptions: rare_inscriptions || [],
        common_inscriptions: common_inscriptions || [],
        armament_attributes: armament_attributes || {},
        calculated_stats: layer3Result.stats,
        multipliers: layer3Result.multipliers,
        score: layer3Result.score
      },
      total_score: totalScore,
      tier,
      percentage_of_max: percentageOfMax
    };

    // Save to database
    const savedBuild = await CommanderBuild.create(build);

    res.status(200).json({
      success: true,
      build: savedBuild,
      breakdown: {
        layer_1: layer1Result,
        layer_2: layer2Result,
        layer_3: layer3Result,
        total: { totalScore, tier, percentageOfMax }
      }
    });

  } catch (error) {
    console.error('Error calculating build score:', error);
    res.status(500).json({ error: 'Failed to calculate build score' });
  }
};

/**
 * Get leaderboard for a specific role
 */
export const getLeaderboard = async (req, res) => {
  try {
    const { role } = req.params;
    const limit = parseInt(req.query.limit) || 50;

    const builds = await CommanderBuild.find({ role })
      .sort({ total_score: -1 })
      .limit(limit)
      .select('player_name total_score tier percentage_of_max createdAt');

    res.status(200).json({
      success: true,
      role,
      count: builds.length,
      builds
    });
  } catch (error) {
    console.error('Error fetching leaderboard:', error);
    res.status(500).json({ error: 'Failed to fetch leaderboard' });
  }
};

/**
 * Get all builds for a player
 */
export const getPlayerBuilds = async (req, res) => {
  try {
    const { player_name } = req.params;

    const builds = await CommanderBuild.find({ player_name })
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      player_name,
      count: builds.length,
      builds
    });
  } catch (error) {
    console.error('Error fetching player builds:', error);
    res.status(500).json({ error: 'Failed to fetch player builds' });
  }
};

/**
 * Get a specific build by ID
 */
export const getBuildById = async (req, res) => {
  try {
    const { id } = req.params;

    const build = await CommanderBuild.findById(id);
    if (!build) {
      return res.status(404).json({ error: 'Build not found' });
    }

    res.status(200).json({
      success: true,
      build
    });
  } catch (error) {
    console.error('Error fetching build:', error);
    res.status(500).json({ error: 'Failed to fetch build' });
  }
};

/**
 * Delete a build
 */
export const deleteBuild = async (req, res) => {
  try {
    const { id } = req.params;

    const build = await CommanderBuild.findByIdAndDelete(id);
    if (!build) {
      return res.status(404).json({ error: 'Build not found' });
    }

    res.status(200).json({
      success: true,
      message: 'Build deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting build:', error);
    res.status(500).json({ error: 'Failed to delete build' });
  }
};
