import express from 'express';
import { authMiddleware, optionalAuth, verifyPassword } from '../middleware/auth.js';
import {
  getAllBuilds,
  getAllGovernors,
  getGovernorById,
  createGovernor,
  updateGovernor,
  deleteGovernor,
  getGovernorBuilds,
  getBuildById,
  createBuild,
  updateBuild,
  deleteBuild
} from '../controllers/governorController.js';

const router = express.Router();

// Legacy auth route (for backwards compatibility)
router.post('/auth/verify', verifyPassword);

// Public read routes (anyone can view, optionalAuth attaches user if logged in)
router.get('/builds', optionalAuth, getAllBuilds);
router.get('/', optionalAuth, getAllGovernors);
router.get('/:id', optionalAuth, getGovernorById);
router.get('/:id/builds', optionalAuth, getGovernorBuilds);
router.get('/:id/builds/:buildId', optionalAuth, getBuildById);

// Protected write routes (require authentication + ownership)
router.post('/', authMiddleware, createGovernor);
router.put('/:id', authMiddleware, updateGovernor);
router.delete('/:id', authMiddleware, deleteGovernor);
router.post('/:id/builds', authMiddleware, createBuild);
router.put('/:id/builds/:buildId', authMiddleware, updateBuild);
router.delete('/:id/builds/:buildId', authMiddleware, deleteBuild);

export default router;
