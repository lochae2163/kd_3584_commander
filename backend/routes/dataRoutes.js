import express from 'express';
import {
  getAllRoles,
  getAllEquipment,
  getAllInscriptions,
  getAllVIPBonuses,
  getAllCivilisations,
  getAllSpendingTiers,
  getAllCitySkins,
  getAllSetBonuses
} from '../controllers/dataController.js';

const router = express.Router();

// Get all commander roles
router.get('/roles', getAllRoles);

// Get all equipment (optionally filter by type)
router.get('/equipment', getAllEquipment);

// Get all inscriptions (optionally filter by rarity)
router.get('/inscriptions', getAllInscriptions);

// Get all VIP bonuses
router.get('/vip', getAllVIPBonuses);

// Get all civilisations
router.get('/civilisations', getAllCivilisations);

// Get all spending tiers
router.get('/spending', getAllSpendingTiers);

// Get all city skins
router.get('/cityskins', getAllCitySkins);

// Get all set bonuses
router.get('/setbonuses', getAllSetBonuses);

export default router;
