import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import connectDB from './config/database.js';
import calculatorRoutes from './routes/calculatorRoutes.js';
import dataRoutes from './routes/dataRoutes.js';
import CommanderRole from './models/CommanderRole.js';
import Equipment from './models/Equipment.js';
import Inscription from './models/Inscription.js';
import SetBonus from './models/SetBonus.js';
import { VIPBonus, Civilisation, SpendingTier, CitySkin } from './models/PlayerProfile.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// CORS configuration - allow all origins for now
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api/calculator', calculatorRoutes);
app.use('/api/data', dataRoutes);

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'OK', message: 'ROK Commander Calculator API is running', version: '1.1' });
});

// Seed database endpoint (one-time use)
app.get('/api/seed', async (req, res) => {
  try {
    const DATA_DIR = path.join(__dirname, 'data');

    // Check if data files exist
    if (!fs.existsSync(path.join(DATA_DIR, 'commanderRoles.json'))) {
      return res.status(400).json({ error: 'Data files not found' });
    }

    // Check if already seeded
    const existingRoles = await CommanderRole.countDocuments();
    if (existingRoles > 0) {
      return res.status(200).json({
        message: 'Database already seeded',
        counts: {
          roles: existingRoles,
          equipment: await Equipment.countDocuments(),
          inscriptions: await Inscription.countDocuments()
        }
      });
    }

    console.log('Seeding database...');

    // Seed Commander Roles
    const rolesData = JSON.parse(fs.readFileSync(path.join(DATA_DIR, 'commanderRoles.json'), 'utf8'));
    await CommanderRole.insertMany(rolesData);

    // Seed Equipment
    const equipmentData = JSON.parse(fs.readFileSync(path.join(DATA_DIR, 'equipment.json'), 'utf8'));
    await Equipment.insertMany(equipmentData);

    // Seed Inscriptions
    const inscriptionsData = JSON.parse(fs.readFileSync(path.join(DATA_DIR, 'inscriptions.json'), 'utf8'));
    await Inscription.insertMany(inscriptionsData);

    // Seed Set Bonuses
    const setBonusesData = JSON.parse(fs.readFileSync(path.join(DATA_DIR, 'setBonuses.json'), 'utf8'));
    await SetBonus.insertMany(setBonusesData);

    // Seed VIP Bonuses
    const vipData = JSON.parse(fs.readFileSync(path.join(DATA_DIR, 'vipBonuses.json'), 'utf8'));
    await VIPBonus.insertMany(vipData);

    // Seed Civilisations
    const civsData = JSON.parse(fs.readFileSync(path.join(DATA_DIR, 'civilisations.json'), 'utf8'));
    await Civilisation.insertMany(civsData);

    // Seed Spending Tiers
    const spendingData = JSON.parse(fs.readFileSync(path.join(DATA_DIR, 'spendingTiers.json'), 'utf8'));
    await SpendingTier.insertMany(spendingData);

    // Seed City Skins
    const citySkinsData = JSON.parse(fs.readFileSync(path.join(DATA_DIR, 'citySkins.json'), 'utf8'));
    await CitySkin.insertMany(citySkinsData);

    res.status(200).json({
      success: true,
      message: 'Database seeded successfully!',
      counts: {
        roles: rolesData.length,
        equipment: equipmentData.length,
        inscriptions: inscriptionsData.length,
        setBonuses: setBonusesData.length,
        vipBonuses: vipData.length,
        civilisations: civsData.length,
        spendingTiers: spendingData.length,
        citySkins: citySkinsData.length
      }
    });
  } catch (error) {
    console.error('Seed error:', error);
    res.status(500).json({ error: 'Failed to seed database', details: error.message });
  }
});

// Force reseed endpoint (clears and re-seeds database)
app.get('/api/reseed', async (req, res) => {
  try {
    const DATA_DIR = path.join(__dirname, 'data');

    // Check if data files exist
    if (!fs.existsSync(path.join(DATA_DIR, 'commanderRoles.json'))) {
      return res.status(400).json({ error: 'Data files not found' });
    }

    console.log('Clearing database...');

    // Clear all collections
    await CommanderRole.deleteMany({});
    await Equipment.deleteMany({});
    await Inscription.deleteMany({});
    await SetBonus.deleteMany({});
    await VIPBonus.deleteMany({});
    await Civilisation.deleteMany({});
    await SpendingTier.deleteMany({});
    await CitySkin.deleteMany({});

    console.log('Re-seeding database...');

    // Seed Commander Roles
    const rolesData = JSON.parse(fs.readFileSync(path.join(DATA_DIR, 'commanderRoles.json'), 'utf8'));
    await CommanderRole.insertMany(rolesData);

    // Seed Equipment
    const equipmentData = JSON.parse(fs.readFileSync(path.join(DATA_DIR, 'equipment.json'), 'utf8'));
    await Equipment.insertMany(equipmentData);

    // Seed Inscriptions
    const inscriptionsData = JSON.parse(fs.readFileSync(path.join(DATA_DIR, 'inscriptions.json'), 'utf8'));
    await Inscription.insertMany(inscriptionsData);

    // Seed Set Bonuses
    const setBonusesData = JSON.parse(fs.readFileSync(path.join(DATA_DIR, 'setBonuses.json'), 'utf8'));
    await SetBonus.insertMany(setBonusesData);

    // Seed VIP Bonuses
    const vipData = JSON.parse(fs.readFileSync(path.join(DATA_DIR, 'vipBonuses.json'), 'utf8'));
    await VIPBonus.insertMany(vipData);

    // Seed Civilisations
    const civsData = JSON.parse(fs.readFileSync(path.join(DATA_DIR, 'civilisations.json'), 'utf8'));
    await Civilisation.insertMany(civsData);

    // Seed Spending Tiers
    const spendingData = JSON.parse(fs.readFileSync(path.join(DATA_DIR, 'spendingTiers.json'), 'utf8'));
    await SpendingTier.insertMany(spendingData);

    // Seed City Skins
    const citySkinsData = JSON.parse(fs.readFileSync(path.join(DATA_DIR, 'citySkins.json'), 'utf8'));
    await CitySkin.insertMany(citySkinsData);

    res.status(200).json({
      success: true,
      message: 'Database re-seeded successfully!',
      counts: {
        roles: rolesData.length,
        equipment: equipmentData.length,
        inscriptions: inscriptionsData.length,
        setBonuses: setBonusesData.length,
        vipBonuses: vipData.length,
        civilisations: civsData.length,
        spendingTiers: spendingData.length,
        citySkins: citySkinsData.length
      }
    });
  } catch (error) {
    console.error('Reseed error:', error);
    res.status(500).json({ error: 'Failed to reseed database', details: error.message });
  }
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

// Start server
const startServer = async () => {
  try {
    await connectDB();
    app.listen(PORT, () => {
      console.log(`\n🚀 Server is running on port ${PORT}`);
      console.log(`📊 API: http://localhost:${PORT}`);
      console.log(`🏥 Health Check: http://localhost:${PORT}/health\n`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer();
