import express from 'express';
import {
  calculateBuildScore,
  getLeaderboard,
  getPlayerBuilds,
  getBuildById,
  deleteBuild
} from '../controllers/calculatorController.js';

const router = express.Router();

// Calculate build score
router.post('/calculate', calculateBuildScore);

// Get leaderboard for a role
router.get('/leaderboard/:role', getLeaderboard);

// Get all builds for a player
router.get('/player/:player_name', getPlayerBuilds);

// Get specific build
router.get('/build/:id', getBuildById);

// Delete build
router.delete('/build/:id', deleteBuild);

export default router;
