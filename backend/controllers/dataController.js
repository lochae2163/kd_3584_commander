import CommanderRole from '../models/CommanderRole.js';
import Equipment from '../models/Equipment.js';
import Inscription from '../models/Inscription.js';
import SetBonus from '../models/SetBonus.js';
import { VIPBonus, Civilisation, SpendingTier, CitySkin } from '../models/PlayerProfile.js';

/**
 * Get all commander roles
 */
export const getAllRoles = async (req, res) => {
  try {
    const roles = await CommanderRole.find({}).sort({ role_id: 1 });
    res.status(200).json({ success: true, count: roles.length, roles });
  } catch (error) {
    console.error('Error fetching roles:', error);
    res.status(500).json({ error: 'Failed to fetch roles' });
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
 * Get all inscriptions
 */
export const getAllInscriptions = async (req, res) => {
  try {
    const { rarity } = req.query;
    const query = rarity ? { rarity: rarity.toUpperCase() } : {};

    const inscriptions = await Inscription.find(query).sort({ rarity: 1, name: 1 });
    res.status(200).json({ success: true, count: inscriptions.length, inscriptions });
  } catch (error) {
    console.error('Error fetching inscriptions:', error);
    res.status(500).json({ error: 'Failed to fetch inscriptions' });
  }
};

/**
 * Get all VIP bonuses
 */
export const getAllVIPBonuses = async (req, res) => {
  try {
    const bonuses = await VIPBonus.find({}).sort({ vip_level: 1 });
    res.status(200).json({ success: true, count: bonuses.length, bonuses });
  } catch (error) {
    console.error('Error fetching VIP bonuses:', error);
    res.status(500).json({ error: 'Failed to fetch VIP bonuses' });
  }
};

/**
 * Get all civilisations
 */
export const getAllCivilisations = async (req, res) => {
  try {
    const civilisations = await Civilisation.find({}).sort({ name: 1 });
    res.status(200).json({ success: true, count: civilisations.length, civilisations });
  } catch (error) {
    console.error('Error fetching civilisations:', error);
    res.status(500).json({ error: 'Failed to fetch civilisations' });
  }
};

/**
 * Get all spending tiers
 */
export const getAllSpendingTiers = async (req, res) => {
  try {
    const tiers = await SpendingTier.find({});
    res.status(200).json({ success: true, count: tiers.length, tiers });
  } catch (error) {
    console.error('Error fetching spending tiers:', error);
    res.status(500).json({ error: 'Failed to fetch spending tiers' });
  }
};

/**
 * Get all city skins
 */
export const getAllCitySkins = async (req, res) => {
  try {
    const citySkins = await CitySkin.find({}).sort({ name: 1 });
    res.status(200).json({ success: true, count: citySkins.length, citySkins });
  } catch (error) {
    console.error('Error fetching city skins:', error);
    res.status(500).json({ error: 'Failed to fetch city skins' });
  }
};

/**
 * Get all set bonuses
 */
export const getAllSetBonuses = async (req, res) => {
  try {
    const setBonuses = await SetBonus.find({}).sort({ set_name: 1 });
    res.status(200).json({ success: true, count: setBonuses.length, setBonuses });
  } catch (error) {
    console.error('Error fetching set bonuses:', error);
    res.status(500).json({ error: 'Failed to fetch set bonuses' });
  }
};
