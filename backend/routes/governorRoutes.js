import express from 'express';
import { authMiddleware, verifyPassword } from '../middleware/auth.js';
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

// Auth route (no middleware)
router.post('/auth/verify', verifyPassword);

// All builds route (must come before /:id to avoid conflict)
router.get('/builds', authMiddleware, getAllBuilds);

// Governor routes (all protected)
router.get('/', authMiddleware, getAllGovernors);
router.post('/', authMiddleware, createGovernor);
router.get('/:id', authMiddleware, getGovernorById);
router.put('/:id', authMiddleware, updateGovernor);
router.delete('/:id', authMiddleware, deleteGovernor);

// Build routes (nested under governor)
router.get('/:id/builds', authMiddleware, getGovernorBuilds);
router.post('/:id/builds', authMiddleware, createBuild);
router.get('/:id/builds/:buildId', authMiddleware, getBuildById);
router.put('/:id/builds/:buildId', authMiddleware, updateBuild);
router.delete('/:id/builds/:buildId', authMiddleware, deleteBuild);

export default router;
