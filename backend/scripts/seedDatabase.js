import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import mongoose from 'mongoose';
import connectDB from '../config/database.js';
import CommanderRole from '../models/CommanderRole.js';
import Equipment from '../models/Equipment.js';
import Inscription from '../models/Inscription.js';
import SetBonus from '../models/SetBonus.js';
import { VIPBonus, Civilisation, SpendingTier, CitySkin } from '../models/PlayerProfile.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DATA_DIR = path.join(__dirname, '../data');

async function seedDatabase() {
  try {
    // Connect to database
    await connectDB();

    console.log('\n🌱 Starting database seeding...\n');

    // Clear existing data
    console.log('🗑️  Clearing existing data...');
    await CommanderRole.deleteMany({});
    await Equipment.deleteMany({});
    await Inscription.deleteMany({});
    await SetBonus.deleteMany({});
    await VIPBonus.deleteMany({});
    await Civilisation.deleteMany({});
    await SpendingTier.deleteMany({});
    await CitySkin.deleteMany({});
    console.log('✅ Existing data cleared\n');

    // Seed Commander Roles
    console.log('📋 Seeding Commander Roles...');
    const rolesData = JSON.parse(fs.readFileSync(path.join(DATA_DIR, 'commanderRoles.json'), 'utf8'));
    await CommanderRole.insertMany(rolesData);
    console.log(`✅ Seeded ${rolesData.length} commander roles\n`);

    // Seed Equipment
    console.log('⚔️  Seeding Equipment...');
    const equipmentData = JSON.parse(fs.readFileSync(path.join(DATA_DIR, 'equipment.json'), 'utf8'));
    await Equipment.insertMany(equipmentData);
    console.log(`✅ Seeded ${equipmentData.length} equipment items\n`);

    // Seed Inscriptions
    console.log('📜 Seeding Inscriptions...');
    const inscriptionsData = JSON.parse(fs.readFileSync(path.join(DATA_DIR, 'inscriptions.json'), 'utf8'));
    await Inscription.insertMany(inscriptionsData);
    console.log(`✅ Seeded ${inscriptionsData.length} inscriptions\n`);

    // Seed Set Bonuses
    console.log('🎁 Seeding Set Bonuses...');
    const setBonusesData = JSON.parse(fs.readFileSync(path.join(DATA_DIR, 'setBonuses.json'), 'utf8'));
    await SetBonus.insertMany(setBonusesData);
    console.log(`✅ Seeded ${setBonusesData.length} set bonuses\n`);

    // Seed VIP Bonuses
    console.log('👑 Seeding VIP Bonuses...');
    const vipData = JSON.parse(fs.readFileSync(path.join(DATA_DIR, 'vipBonuses.json'), 'utf8'));
    await VIPBonus.insertMany(vipData);
    console.log(`✅ Seeded ${vipData.length} VIP levels\n`);

    // Seed Civilisations
    console.log('🏛️  Seeding Civilisations...');
    const civsData = JSON.parse(fs.readFileSync(path.join(DATA_DIR, 'civilisations.json'), 'utf8'));
    await Civilisation.insertMany(civsData);
    console.log(`✅ Seeded ${civsData.length} civilisations\n`);

    // Seed Spending Tiers
    console.log('💰 Seeding Spending Tiers...');
    const spendingData = JSON.parse(fs.readFileSync(path.join(DATA_DIR, 'spendingTiers.json'), 'utf8'));
    await SpendingTier.insertMany(spendingData);
    console.log(`✅ Seeded ${spendingData.length} spending tiers\n`);

    // Seed City Skins
    console.log('🏰 Seeding City Skins...');
    const citySkinsData = JSON.parse(fs.readFileSync(path.join(DATA_DIR, 'citySkins.json'), 'utf8'));
    await CitySkin.insertMany(citySkinsData);
    console.log(`✅ Seeded ${citySkinsData.length} city skins\n`);

    console.log('🎉 Database seeding completed successfully!\n');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding database:', error);
    process.exit(1);
  }
}

seedDatabase();
