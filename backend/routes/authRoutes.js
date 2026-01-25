import express from 'express';
import { body, validationResult } from 'express-validator';
import User from '../models/User.js';
import Governor from '../models/Governor.js';
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
 * Register a new user
 */
router.post('/register', [
  body('username').trim().isLength({ min: 3, max: 30 }).withMessage('Username must be 3-30 characters'),
  body('email').isEmail().normalizeEmail().withMessage('Valid email required'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  body('governorName').optional().trim()
], validate, async (req, res) => {
  try {
    const { username, email, password, governorName } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({
      $or: [{ email }, { username: { $regex: `^${username}$`, $options: 'i' } }]
    });

    if (existingUser) {
      const field = existingUser.email === email.toLowerCase() ? 'email' : 'username';
      return res.status(400).json({ error: `User with this ${field} already exists` });
    }

    // Create user
    const user = await User.create({ username, email, password });

    // Optionally create/link governor
    let governor = null;
    if (governorName) {
      // Check if governor name already exists
      const existingGovernor = await Governor.findOne({
        name: { $regex: `^${governorName}$`, $options: 'i' }
      });

      if (existingGovernor) {
        // If governor exists and is unclaimed, claim it
        if (!existingGovernor.userId) {
          existingGovernor.userId = user._id;
          await existingGovernor.save();
          user.governorId = existingGovernor._id;
          await user.save();
          governor = existingGovernor;
        } else {
          return res.status(400).json({ error: 'Governor name already claimed by another user' });
        }
      } else {
        // Create new governor
        governor = await Governor.create({ name: governorName, userId: user._id });
        user.governorId = governor._id;
        await user.save();
      }
    }

    const token = generateToken(user._id);

    res.status(201).json({
      success: true,
      token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
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
 * POST /api/auth/login
 * Login user
 */
router.post('/login', [
  body('login').trim().notEmpty().withMessage('Username or email required'),
  body('password').notEmpty().withMessage('Password required')
], validate, async (req, res) => {
  try {
    const { login, password } = req.body;

    // Find user by email or username
    const user = await User.findOne({
      $or: [
        { email: login.toLowerCase() },
        { username: { $regex: `^${login}$`, $options: 'i' } }
      ]
    });

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
        username: user.username,
        email: user.email,
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
        username: req.user.username,
        email: req.user.email,
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
 * Admin: Create user (invite)
 */
router.post('/invite', authMiddleware, adminMiddleware, [
  body('username').trim().isLength({ min: 3, max: 30 }),
  body('email').isEmail().normalizeEmail(),
  body('tempPassword').isLength({ min: 6 })
], validate, async (req, res) => {
  try {
    const { username, email, tempPassword, governorId } = req.body;

    const user = await User.create({
      username,
      email,
      password: tempPassword
    });

    if (governorId) {
      const governor = await Governor.findById(governorId);
      if (governor && !governor.userId) {
        governor.userId = user._id;
        await governor.save();
        user.governorId = governor._id;
        await user.save();
      }
    }

    res.status(201).json({
      success: true,
      user: {
        id: user._id,
        username: user.username,
        email: user.email
      },
      message: `User created. Temporary password: ${tempPassword}`
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to create user' });
  }
});

export default router;
