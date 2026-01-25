import Governor from '../models/Governor.js';
import GovernorBuild from '../models/GovernorBuild.js';
import User from '../models/User.js';

/**
 * Check if user owns the governor or is admin
 */
const checkOwnership = (governor, user) => {
  if (!user) return false;
  // Admins can do anything
  if (user.role === 'admin') return true;
  // User must own the governor
  return governor.userId && governor.userId.toString() === user._id.toString();
};

/**
 * Get all builds across all governors (with optional filters)
 */
export const getAllBuilds = async (req, res) => {
  try {
    const { troopType, buildType } = req.query;

    let query = {};
    if (troopType) {
      query.troopType = troopType.toLowerCase();
    }
    if (buildType) {
      query.buildType = buildType.toLowerCase();
    }

    const builds = await GovernorBuild.find(query)
      .sort({ updatedAt: -1 })
      .lean();

    // Get governor names for each build
    const governorIds = [...new Set(builds.map(b => b.governorId.toString()))];
    const governors = await Governor.find({ _id: { $in: governorIds } }).lean();
    const governorMap = governors.reduce((acc, g) => {
      acc[g._id.toString()] = g.name;
      return acc;
    }, {});

    const buildsWithGovernor = builds.map(build => ({
      ...build,
      governorName: governorMap[build.governorId.toString()] || 'Unknown'
    }));

    res.status(200).json({
      success: true,
      count: buildsWithGovernor.length,
      builds: buildsWithGovernor
    });
  } catch (error) {
    console.error('Error fetching all builds:', error);
    res.status(500).json({ error: 'Failed to fetch builds' });
  }
};

/**
 * Get all governors
 */
export const getAllGovernors = async (req, res) => {
  try {
    const { search, sortBy = 'name', order = 'asc' } = req.query;

    let query = {};
    if (search) {
      query.name = { $regex: search, $options: 'i' };
    }

    const sortOrder = order === 'desc' ? -1 : 1;
    const governors = await Governor.find(query)
      .sort({ [sortBy]: sortOrder })
      .lean();

    // Get build counts for each governor
    const governorsWithCounts = await Promise.all(
      governors.map(async (governor) => {
        const buildCount = await GovernorBuild.countDocuments({ governorId: governor._id });
        return { ...governor, buildCount };
      })
    );

    res.status(200).json({
      success: true,
      count: governorsWithCounts.length,
      governors: governorsWithCounts
    });
  } catch (error) {
    console.error('Error fetching governors:', error);
    res.status(500).json({ error: 'Failed to fetch governors' });
  }
};

/**
 * Get a single governor by ID
 */
export const getGovernorById = async (req, res) => {
  try {
    const { id } = req.params;

    const governor = await Governor.findById(id);
    if (!governor) {
      return res.status(404).json({ error: 'Governor not found' });
    }

    res.status(200).json({
      success: true,
      governor
    });
  } catch (error) {
    console.error('Error fetching governor:', error);
    res.status(500).json({ error: 'Failed to fetch governor' });
  }
};

/**
 * Create a new governor
 */
export const createGovernor = async (req, res) => {
  try {
    const { name, vipLevel } = req.body;

    if (!name) {
      return res.status(400).json({ error: 'Governor name is required' });
    }

    // Check if user already has a governor (non-admins can only have one)
    if (req.user.role !== 'admin' && req.user.governorId) {
      return res.status(400).json({ error: 'You already have a governor profile' });
    }

    // Check if governor already exists
    const existing = await Governor.findOne({ name: { $regex: `^${name}$`, $options: 'i' } });
    if (existing) {
      return res.status(400).json({ error: 'Governor with this name already exists' });
    }

    const governor = await Governor.create({
      name,
      vipLevel: vipLevel || 0,
      userId: req.user._id  // Link to current user
    });

    // Update user's governorId (for non-admins)
    if (req.user.role !== 'admin') {
      await User.findByIdAndUpdate(req.user._id, { governorId: governor._id });
    }

    res.status(201).json({
      success: true,
      governor
    });
  } catch (error) {
    console.error('Error creating governor:', error);
    res.status(500).json({ error: 'Failed to create governor' });
  }
};

/**
 * Update a governor
 */
export const updateGovernor = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, vipLevel } = req.body;

    const governor = await Governor.findById(id);
    if (!governor) {
      return res.status(404).json({ error: 'Governor not found' });
    }

    // Check ownership
    if (!checkOwnership(governor, req.user)) {
      return res.status(403).json({ error: 'You can only edit your own governor' });
    }

    // If name is changing, check it doesn't conflict
    if (name && name !== governor.name) {
      const existing = await Governor.findOne({
        name: { $regex: `^${name}$`, $options: 'i' },
        _id: { $ne: id }
      });
      if (existing) {
        return res.status(400).json({ error: 'Governor with this name already exists' });
      }
      governor.name = name;
    }

    if (vipLevel !== undefined) {
      governor.vipLevel = vipLevel;
    }

    await governor.save();

    res.status(200).json({
      success: true,
      governor
    });
  } catch (error) {
    console.error('Error updating governor:', error);
    res.status(500).json({ error: 'Failed to update governor' });
  }
};

/**
 * Delete a governor and all their builds
 */
export const deleteGovernor = async (req, res) => {
  try {
    const { id } = req.params;

    const governor = await Governor.findById(id);
    if (!governor) {
      return res.status(404).json({ error: 'Governor not found' });
    }

    // Check ownership
    if (!checkOwnership(governor, req.user)) {
      return res.status(403).json({ error: 'You can only delete your own governor' });
    }

    // Delete all builds for this governor
    await GovernorBuild.deleteMany({ governorId: id });

    // Clear user's governorId if linked
    if (governor.userId) {
      await User.findByIdAndUpdate(governor.userId, { governorId: null });
    }

    // Delete the governor
    await Governor.findByIdAndDelete(id);

    res.status(200).json({
      success: true,
      message: 'Governor and all builds deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting governor:', error);
    res.status(500).json({ error: 'Failed to delete governor' });
  }
};

/**
 * Get all builds for a governor
 */
export const getGovernorBuilds = async (req, res) => {
  try {
    const { id } = req.params;

    const governor = await Governor.findById(id);
    if (!governor) {
      return res.status(404).json({ error: 'Governor not found' });
    }

    const builds = await GovernorBuild.find({ governorId: id })
      .sort({ troopType: 1, buildType: 1 });

    res.status(200).json({
      success: true,
      governorId: id,
      governorName: governor.name,
      count: builds.length,
      builds
    });
  } catch (error) {
    console.error('Error fetching builds:', error);
    res.status(500).json({ error: 'Failed to fetch builds' });
  }
};

/**
 * Get a specific build
 */
export const getBuildById = async (req, res) => {
  try {
    const { id, buildId } = req.params;

    const build = await GovernorBuild.findOne({ _id: buildId, governorId: id });
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

// Validation helpers
const INSCRIPTION_LIMITS = {
  S: 1,
  A: 3,
  B: 4,
  C: 4
};

const validateBuildType = (troopType, buildType) => {
  // Leadership only supports garrison
  if (troopType === 'leadership' && buildType === 'rally') {
    return 'Leadership troop type only supports garrison builds';
  }
  return null;
};

const validateArmamentInscriptions = (armament) => {
  if (!armament) return null;

  const slots = ['emblem', 'flag', 'instrument', 'scroll'];

  for (const slot of slots) {
    if (armament[slot]?.inscriptions) {
      const inscriptions = armament[slot].inscriptions;

      // Count inscriptions by tier
      const tierCounts = { S: 0, A: 0, B: 0, C: 0 };
      for (const inscription of inscriptions) {
        if (inscription.tier && tierCounts[inscription.tier] !== undefined) {
          tierCounts[inscription.tier]++;
        }
      }

      // Check limits
      for (const [tier, count] of Object.entries(tierCounts)) {
        if (count > INSCRIPTION_LIMITS[tier]) {
          return `${slot} slot exceeds maximum ${tier}-tier inscriptions (max ${INSCRIPTION_LIMITS[tier]}, got ${count})`;
        }
      }
    }
  }

  return null;
};

/**
 * Create a build for a governor
 */
export const createBuild = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      troopType,
      buildType,
      primaryCommander,
      secondaryCommander,
      equipment,
      armament,
      inscriptions
    } = req.body;

    const governor = await Governor.findById(id);
    if (!governor) {
      return res.status(404).json({ error: 'Governor not found' });
    }

    // Check ownership
    if (!checkOwnership(governor, req.user)) {
      return res.status(403).json({ error: 'You can only create builds for your own governor' });
    }

    if (!troopType || !buildType) {
      return res.status(400).json({ error: 'Troop type and build type are required' });
    }

    // Validate build type for troop type
    const buildTypeError = validateBuildType(troopType, buildType);
    if (buildTypeError) {
      return res.status(400).json({ error: buildTypeError });
    }

    // Validate armament inscriptions
    const inscriptionError = validateArmamentInscriptions(armament);
    if (inscriptionError) {
      return res.status(400).json({ error: inscriptionError });
    }

    // Check if build already exists for this type
    const existingBuild = await GovernorBuild.findOne({
      governorId: id,
      troopType,
      buildType
    });

    if (existingBuild) {
      return res.status(400).json({
        error: `A ${buildType} build for ${troopType} already exists. Use update instead.`
      });
    }

    const build = await GovernorBuild.create({
      governorId: id,
      troopType,
      buildType,
      primaryCommander,
      secondaryCommander,
      equipment: equipment || {},
      armament: armament || {},
      inscriptions: inscriptions || { special: [], rare: [], common: [] }
    });

    res.status(201).json({
      success: true,
      build
    });
  } catch (error) {
    console.error('Error creating build:', error);
    res.status(500).json({ error: 'Failed to create build' });
  }
};

/**
 * Update a build
 */
export const updateBuild = async (req, res) => {
  try {
    const { id, buildId } = req.params;
    const updates = req.body;

    const governor = await Governor.findById(id);
    if (!governor) {
      return res.status(404).json({ error: 'Governor not found' });
    }

    // Check ownership
    if (!checkOwnership(governor, req.user)) {
      return res.status(403).json({ error: 'You can only update your own builds' });
    }

    const build = await GovernorBuild.findOne({ _id: buildId, governorId: id });
    if (!build) {
      return res.status(404).json({ error: 'Build not found' });
    }

    // Validate armament inscriptions if being updated
    if (updates.armament) {
      const inscriptionError = validateArmamentInscriptions(updates.armament);
      if (inscriptionError) {
        return res.status(400).json({ error: inscriptionError });
      }
    }

    // Update allowed fields
    const allowedUpdates = [
      'primaryCommander',
      'secondaryCommander',
      'equipment',
      'armament',
      'inscriptions'
    ];

    allowedUpdates.forEach(field => {
      if (updates[field] !== undefined) {
        build[field] = updates[field];
      }
    });

    await build.save();

    res.status(200).json({
      success: true,
      build
    });
  } catch (error) {
    console.error('Error updating build:', error);
    res.status(500).json({ error: 'Failed to update build' });
  }
};

/**
 * Delete a build
 */
export const deleteBuild = async (req, res) => {
  try {
    const { id, buildId } = req.params;

    const governor = await Governor.findById(id);
    if (!governor) {
      return res.status(404).json({ error: 'Governor not found' });
    }

    // Check ownership
    if (!checkOwnership(governor, req.user)) {
      return res.status(403).json({ error: 'You can only delete your own builds' });
    }

    const build = await GovernorBuild.findOneAndDelete({ _id: buildId, governorId: id });
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
