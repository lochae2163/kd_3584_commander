import Commander from '../models/Commander.js';
import Equipment from '../models/Equipment.js';
import Inscription from '../models/Inscription.js';
import Armament from '../models/Armament.js';

/**
 * Get all commanders
 */
export const getAllCommanders = async (req, res) => {
  try {
    const { troopType, role } = req.query;
    let query = {};

    if (troopType) {
      query.troopType = troopType.toLowerCase();
    }

    if (role) {
      query.roles = role.toLowerCase();
    }

    const commanders = await Commander.find(query).sort({ name: 1 });
    res.status(200).json({ success: true, count: commanders.length, commanders });
  } catch (error) {
    console.error('Error fetching commanders:', error);
    res.status(500).json({ error: 'Failed to fetch commanders' });
  }
};

/**
 * Get all equipment
 */
export const getAllEquipment = async (req, res) => {
  try {
    const { type } = req.query;
    const query = type ? { type: type.toUpperCase() } : {};

    const equipment = await Equipment.find(query).sort({ name: 1 });
    res.status(200).json({ success: true, count: equipment.length, equipment });
  } catch (error) {
    console.error('Error fetching equipment:', error);
    res.status(500).json({ error: 'Failed to fetch equipment' });
  }
};

/**
 * Get all inscriptions (optionally filter by rarity and/or armamentType)
 */
export const getAllInscriptions = async (req, res) => {
  try {
    const { rarity, armamentType } = req.query;
    let query = {};

    if (rarity) {
      query.rarity = rarity.toUpperCase();
    }

    if (armamentType) {
      query.armamentType = armamentType.toLowerCase();
    }

    const inscriptions = await Inscription.find(query).sort({ rarity: 1, name: 1 });
    res.status(200).json({ success: true, count: inscriptions.length, inscriptions });
  } catch (error) {
    console.error('Error fetching inscriptions:', error);
    res.status(500).json({ error: 'Failed to fetch inscriptions' });
  }
};

/**
 * Get all armaments
 */
export const getAllArmaments = async (req, res) => {
  try {
    const armaments = await Armament.find().sort({ name: 1 });
    res.status(200).json({ success: true, count: armaments.length, armaments });
  } catch (error) {
    console.error('Error fetching armaments:', error);
    res.status(500).json({ error: 'Failed to fetch armaments' });
  }
};
