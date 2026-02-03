import express from 'express';
import { body, validationResult } from 'express-validator';
import User from '../models/User.js';
import Governor from '../models/Governor.js';
import VerifiedGovernor from '../models/VerifiedGovernor.js';
import { generateToken, authMiddleware, adminMiddleware } from '../middleware/auth.js';

const router = express.Router();

// Validation middleware
const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  next();
};

/**
 * POST /api/auth/register
 * Register a new user with governor name, governor ID, and password
 */
router.post('/register', [
  body('governorName').trim().isLength({ min: 2, max: 50 }).withMessage('Governor name must be 2-50 characters'),
  body('visibleGovernorId').trim().notEmpty().withMessage('Governor ID is required'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters')
], validate, async (req, res) => {
  try {
    const { governorName, visibleGovernorId, password } = req.body;

    // Check if governor ID already registered
    const existingUser = await User.findOne({ visibleGovernorId });
    if (existingUser) {
      return res.status(400).json({ error: 'This Governor ID is already registered' });
    }

    // Check if governor ID is in the verified whitelist
    const verifiedCount = await VerifiedGovernor.countDocuments();
    if (verifiedCount > 0) {
      // Whitelist exists, check if this ID is verified
      const isVerified = await VerifiedGovernor.isVerified(visibleGovernorId);
      if (!isVerified) {
        return res.status(403).json({
          error: 'Governor ID not found in KD 3584 member list. Please contact leadership if you believe this is an error.',
          code: 'NOT_VERIFIED'
        });
      }
    }

    // Check if governor name already exists
    const existingGovernor = await Governor.findOne({
      name: { $regex: `^${governorName}$`, $options: 'i' }
    });

    let governor;
    let user;

    if (existingGovernor) {
      // If governor exists and is unclaimed, claim it
      if (!existingGovernor.userId) {
        user = await User.create({ visibleGovernorId, password });
        existingGovernor.userId = user._id;
        await existingGovernor.save();
        user.governorId = existingGovernor._id;
        await user.save();
        governor = existingGovernor;
      } else {
        return res.status(400).json({ error: 'Governor name already claimed by another user' });
      }
    } else {
      // Create new user and governor
      user = await User.create({ visibleGovernorId, password });
      governor = await Governor.create({ name: governorName, userId: user._id });
      user.governorId = governor._id;
      await user.save();
    }

    const token = generateToken(user._id);

    res.status(201).json({
      success: true,
      token,
      user: {
        id: user._id,
        visibleGovernorId: user.visibleGovernorId,
        role: user.role,
        governorId: user.governorId
      },
      governor
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ error: 'Registration failed' });
  }
});

/**
 * GET /api/auth/check-verification/:governorId
 * Check if a governor ID is in the verified whitelist (public endpoint)
 */
router.get('/check-verification/:governorId', async (req, res) => {
  try {
    const { governorId } = req.params;

    // Check if whitelist is enabled (has any entries)
    const verifiedCount = await VerifiedGovernor.countDocuments();
    if (verifiedCount === 0) {
      // No whitelist, verification not required
      return res.json({
        success: true,
        whitelistEnabled: false,
        isVerified: true,
        message: 'Verification not required'
      });
    }

    const verifiedGovernor = await VerifiedGovernor.getVerifiedInfo(governorId);
    if (verifiedGovernor) {
      return res.json({
        success: true,
        whitelistEnabled: true,
        isVerified: true,
        governorName: verifiedGovernor.governorName
      });
    }

    return res.json({
      success: true,
      whitelistEnabled: true,
      isVerified: false,
      message: 'Governor ID not found in KD 3584 member list'
    });
  } catch (error) {
    console.error('Check verification error:', error);
    res.status(500).json({ error: 'Failed to check verification' });
  }
});

/**
 * POST /api/auth/login
 * Login with governor ID and password
 */
router.post('/login', [
  body('visibleGovernorId').trim().notEmpty().withMessage('Governor ID required'),
  body('password').notEmpty().withMessage('Password required')
], validate, async (req, res) => {
  try {
    const { visibleGovernorId, password } = req.body;

    const user = await User.findOne({ visibleGovernorId });

    if (!user || !user.isActive) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Get linked governor
    const governor = user.governorId
      ? await Governor.findById(user.governorId)
      : null;

    const token = generateToken(user._id);

    res.json({
      success: true,
      token,
      user: {
        id: user._id,
        visibleGovernorId: user.visibleGovernorId,
        role: user.role,
        governorId: user.governorId
      },
      governor
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Login failed' });
  }
});

/**
 * GET /api/auth/me
 * Get current user
 */
router.get('/me', authMiddleware, async (req, res) => {
  try {
    const governor = req.user.governorId
      ? await Governor.findById(req.user.governorId)
      : null;

    res.json({
      success: true,
      user: {
        id: req.user._id,
        visibleGovernorId: req.user.visibleGovernorId,
        role: req.user.role,
        governorId: req.user.governorId
      },
      governor
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to get user' });
  }
});

/**
 * POST /api/auth/link-governor
 * Link user to an existing unclaimed governor
 */
router.post('/link-governor', authMiddleware, [
  body('governorId').isMongoId().withMessage('Valid governor ID required')
], validate, async (req, res) => {
  try {
    const { governorId } = req.body;

    if (req.user.governorId) {
      return res.status(400).json({ error: 'You already have a linked governor' });
    }

    const governor = await Governor.findById(governorId);
    if (!governor) {
      return res.status(404).json({ error: 'Governor not found' });
    }

    if (governor.userId) {
      return res.status(400).json({ error: 'Governor already claimed by another user' });
    }

    governor.userId = req.user._id;
    await governor.save();

    await User.findByIdAndUpdate(req.user._id, { governorId: governor._id });

    res.json({
      success: true,
      governor
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to link governor' });
  }
});

/**
 * GET /api/auth/unclaimed-governors
 * Get list of unclaimed governors (for linking)
 */
router.get('/unclaimed-governors', authMiddleware, async (req, res) => {
  try {
    const governors = await Governor.find({ userId: null }).select('name vipLevel');
    res.json({ success: true, governors });
  } catch (error) {
    res.status(500).json({ error: 'Failed to get governors' });
  }
});

/**
 * PUT /api/auth/change-password
 * Change user's password
 */
router.put('/change-password', authMiddleware, [
  body('currentPassword').notEmpty().withMessage('Current password is required'),
  body('newPassword').isLength({ min: 6 }).withMessage('New password must be at least 6 characters')
], validate, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Verify current password
    const isMatch = await user.comparePassword(currentPassword);
    if (!isMatch) {
      return res.status(400).json({ error: 'Current password is incorrect' });
    }

    // Update password
    user.password = newPassword;
    await user.save();

    res.json({ success: true, message: 'Password changed successfully' });
  } catch (error) {
    console.error('Change password error:', error);
    res.status(500).json({ error: 'Failed to change password' });
  }
});

/**
 * PUT /api/auth/update-governor-name
 * Update linked governor's name
 */
router.put('/update-governor-name', authMiddleware, [
  body('newName').trim().isLength({ min: 2, max: 50 }).withMessage('Governor name must be 2-50 characters')
], validate, async (req, res) => {
  try {
    const { newName } = req.body;

    if (!req.user.governorId) {
      return res.status(400).json({ error: 'No governor linked to this account' });
    }

    // Check if name is taken by another governor
    const existingGovernor = await Governor.findOne({
      name: { $regex: `^${newName}$`, $options: 'i' },
      _id: { $ne: req.user.governorId }
    });

    if (existingGovernor) {
      return res.status(400).json({ error: 'This governor name is already taken' });
    }

    const governor = await Governor.findByIdAndUpdate(
      req.user.governorId,
      { name: newName },
      { new: true }
    );

    res.json({ success: true, governor, message: 'Governor name updated successfully' });
  } catch (error) {
    console.error('Update governor name error:', error);
    res.status(500).json({ error: 'Failed to update governor name' });
  }
});

/**
 * DELETE /api/auth/delete-account
 * Delete user account and optionally their governor profile
 */
router.delete('/delete-account', authMiddleware, [
  body('password').notEmpty().withMessage('Password is required to confirm deletion')
], validate, async (req, res) => {
  try {
    const { password, deleteGovernor } = req.body;

    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Verify password
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(400).json({ error: 'Incorrect password' });
    }

    // If user has a linked governor
    if (user.governorId) {
      if (deleteGovernor) {
        // Delete governor and all their builds
        const GovernorBuild = (await import('../models/GovernorBuild.js')).default;
        await GovernorBuild.deleteMany({ governorId: user.governorId });
        await Governor.findByIdAndDelete(user.governorId);
      } else {
        // Just unlink the governor (allow someone else to claim)
        await Governor.findByIdAndUpdate(user.governorId, { userId: null });
      }
    }

    // Delete user
    await User.findByIdAndDelete(req.user._id);

    res.json({ success: true, message: 'Account deleted successfully' });
  } catch (error) {
    console.error('Delete account error:', error);
    res.status(500).json({ error: 'Failed to delete account' });
  }
});

/**
 * Admin: Get all users
 */
router.get('/users', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const users = await User.find().select('-password').populate('governorId');
    res.json({ success: true, users });
  } catch (error) {
    res.status(500).json({ error: 'Failed to get users' });
  }
});

/**
 * POST /api/auth/cleanup-user
 * Delete a broken user record (user exists but governor doesn't)
 */
router.post('/cleanup-user', async (req, res) => {
  try {
    const { adminSecret, visibleGovernorId } = req.body;
    const expectedSecret = process.env.ADMIN_SECRET || 'rok3584admin';
    if (adminSecret !== expectedSecret) {
      return res.status(403).json({ error: 'Invalid admin secret' });
    }

    if (!visibleGovernorId) {
      return res.status(400).json({ error: 'Governor ID required' });
    }

    // Find and delete the user
    const user = await User.findOne({ visibleGovernorId });
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Check if their governor exists
    if (user.governorId) {
      const governor = await Governor.findById(user.governorId);
      if (!governor) {
        // Governor doesn't exist - delete the broken user
        await User.findByIdAndDelete(user._id);
        return res.json({ success: true, message: 'Broken user record deleted. You can now re-register.' });
      } else {
        return res.status(400).json({ error: 'User has a valid governor. Use delete-account instead.' });
      }
    } else {
      // No governor linked - delete user
      await User.findByIdAndDelete(user._id);
      return res.json({ success: true, message: 'User without governor deleted. You can now re-register.' });
    }
  } catch (error) {
    console.error('Cleanup user error:', error);
    res.status(500).json({ error: 'Failed to cleanup user' });
  }
});

/**
 * POST /api/auth/reset-users
 * Drop the users collection to clear old indexes (one-time migration)
 */
router.post('/reset-users', async (req, res) => {
  try {
    const { adminSecret } = req.body;
    const expectedSecret = process.env.ADMIN_SECRET || 'rok3584admin';
    if (adminSecret !== expectedSecret) {
      return res.status(403).json({ error: 'Invalid admin secret' });
    }

    // Drop the users collection entirely
    try {
      await User.collection.drop();
    } catch (e) {
      // Collection may not exist
    }

    res.json({ success: true, message: 'Users collection reset successfully' });
  } catch (error) {
    console.error('Reset users error:', error);
    res.status(500).json({ error: 'Failed to reset users' });
  }
});

/**
 * POST /api/auth/create-admin
 * Create admin user (only works if no admin exists)
 */
router.post('/create-admin', [
  body('visibleGovernorId').trim().notEmpty().withMessage('Governor ID required'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  body('adminSecret').notEmpty().withMessage('Admin secret required')
], validate, async (req, res) => {
  try {
    const { visibleGovernorId, password, adminSecret, governorName } = req.body;

    // Check admin secret (should match environment variable)
    const expectedSecret = process.env.ADMIN_SECRET || 'rok3584admin';
    if (adminSecret !== expectedSecret) {
      return res.status(403).json({ error: 'Invalid admin secret' });
    }

    // Check if admin already exists
    const existingAdmin = await User.findOne({ role: 'admin' });
    if (existingAdmin) {
      return res.status(400).json({ error: 'Admin user already exists' });
    }

    // Check if governor ID already registered
    const existingUser = await User.findOne({ visibleGovernorId });
    if (existingUser) {
      return res.status(400).json({ error: 'This Governor ID is already registered' });
    }

    // Drop old User indexes that might cause issues
    try {
      await User.collection.dropIndex('email_1');
    } catch (e) { /* Index may not exist */ }
    try {
      await User.collection.dropIndex('username_1');
    } catch (e) { /* Index may not exist */ }

    // Create admin user
    const user = await User.create({
      visibleGovernorId,
      password,
      role: 'admin'
    });

    // Link or create governor if name provided
    let governor = null;
    if (governorName) {
      // Check if governor already exists
      const existingGovernor = await Governor.findOne({
        name: { $regex: `^${governorName}$`, $options: 'i' }
      });

      if (existingGovernor) {
        // Link existing governor to admin
        existingGovernor.userId = user._id;
        await existingGovernor.save();
        governor = existingGovernor;
      } else {
        // Create new governor
        governor = await Governor.create({ name: governorName, userId: user._id });
      }
      user.governorId = governor._id;
      await user.save();
    }

    const token = generateToken(user._id);

    res.status(201).json({
      success: true,
      token,
      user: {
        id: user._id,
        visibleGovernorId: user.visibleGovernorId,
        role: user.role,
        governorId: user.governorId
      },
      governor,
      message: 'Admin user created successfully'
    });
  } catch (error) {
    console.error('Admin creation error:', error);
    res.status(500).json({ error: 'Failed to create admin' });
  }
});

export default router;
