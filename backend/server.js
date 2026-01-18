import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import connectDB from './config/database.js';
import governorRoutes from './routes/governorRoutes.js';
import dataRoutes from './routes/dataRoutes.js';
import Commander from './models/Commander.js';
import Equipment from './models/Equipment.js';
import Inscription from './models/Inscription.js';
import Armament from './models/Armament.js';

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
app.use('/api/governors', governorRoutes);
app.use('/api/data', dataRoutes);

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'OK', message: 'ROK Data Keeper API is running', version: '2.0' });
});

// Seed database endpoint (one-time use)
app.get('/api/seed', async (req, res) => {
  try {
    const DATA_DIR = path.join(__dirname, 'data');

    // Check if data files exist
    if (!fs.existsSync(path.join(DATA_DIR, 'commanders.json'))) {
      return res.status(400).json({ error: 'Data files not found' });
    }

    // Check if already seeded
    const existingCommanders = await Commander.countDocuments();
    if (existingCommanders > 0) {
      return res.status(200).json({
        message: 'Database already seeded',
        counts: {
          commanders: existingCommanders,
          equipment: await Equipment.countDocuments(),
          inscriptions: await Inscription.countDocuments(),
          armaments: await Armament.countDocuments()
        }
      });
    }

    console.log('Seeding database...');

    // Seed Commanders
    const commandersData = JSON.parse(fs.readFileSync(path.join(DATA_DIR, 'commanders.json'), 'utf8'));
    await Commander.insertMany(commandersData);

    // Seed Equipment
    const equipmentData = JSON.parse(fs.readFileSync(path.join(DATA_DIR, 'equipment.json'), 'utf8'));
    await Equipment.insertMany(equipmentData);

    // Seed Inscriptions
    const inscriptionsData = JSON.parse(fs.readFileSync(path.join(DATA_DIR, 'inscriptions.json'), 'utf8'));
    await Inscription.insertMany(inscriptionsData);

    // Seed Armaments
    const armamentsData = JSON.parse(fs.readFileSync(path.join(DATA_DIR, 'armaments.json'), 'utf8'));
    await Armament.insertMany(armamentsData);

    res.status(200).json({
      success: true,
      message: 'Database seeded successfully!',
      counts: {
        commanders: commandersData.length,
        equipment: equipmentData.length,
        inscriptions: inscriptionsData.length,
        armaments: armamentsData.length
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
    if (!fs.existsSync(path.join(DATA_DIR, 'commanders.json'))) {
      return res.status(400).json({ error: 'Data files not found' });
    }

    console.log('Clearing database...');

    // Clear reference data collections (keep governors and builds)
    await Commander.deleteMany({});
    await Equipment.deleteMany({});
    await Inscription.deleteMany({});
    await Armament.deleteMany({});

    console.log('Re-seeding database...');

    // Seed Commanders
    const commandersData = JSON.parse(fs.readFileSync(path.join(DATA_DIR, 'commanders.json'), 'utf8'));
    await Commander.insertMany(commandersData);

    // Seed Equipment
    const equipmentData = JSON.parse(fs.readFileSync(path.join(DATA_DIR, 'equipment.json'), 'utf8'));
    await Equipment.insertMany(equipmentData);

    // Seed Inscriptions
    const inscriptionsData = JSON.parse(fs.readFileSync(path.join(DATA_DIR, 'inscriptions.json'), 'utf8'));
    await Inscription.insertMany(inscriptionsData);

    // Seed Armaments
    const armamentsData = JSON.parse(fs.readFileSync(path.join(DATA_DIR, 'armaments.json'), 'utf8'));
    await Armament.insertMany(armamentsData);

    res.status(200).json({
      success: true,
      message: 'Database re-seeded successfully!',
      counts: {
        commanders: commandersData.length,
        equipment: equipmentData.length,
        inscriptions: inscriptionsData.length,
        armaments: armamentsData.length
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
