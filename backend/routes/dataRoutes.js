import express from 'express';
import {
  getAllCommanders,
  getAllEquipment,
  getAllInscriptions,
  getAllArmaments
} from '../controllers/dataController.js';

const router = express.Router();

// Get all commanders (optionally filter by troopType and role)
router.get('/commanders', getAllCommanders);

// Get all equipment (optionally filter by type)
router.get('/equipment', getAllEquipment);

// Get all inscriptions (optionally filter by rarity and/or armamentType)
router.get('/inscriptions', getAllInscriptions);

// Get all armaments
router.get('/armaments', getAllArmaments);

export default router;
