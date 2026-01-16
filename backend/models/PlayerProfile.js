import mongoose from 'mongoose';

const vipBonusSchema = new mongoose.Schema({
  vip_level: {
    type: Number,
    required: true,
    min: 10,
    max: 19
  },
  attack: { type: Number, default: 0 },
  defense: { type: Number, default: 0 },
  health: { type: Number, default: 0 },
  all_dmg: { type: Number, default: 0 }
}, { _id: false });

const civilisationSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  bonuses_by_role: [{
    role_id: String,
    attack: { type: Number, default: 0 },
    defense: { type: Number, default: 0 },
    health: { type: Number, default: 0 },
    all_dmg: { type: Number, default: 0 },
    na: { type: Number, default: 0 },
    skill_dmg: { type: Number, default: 0 }
  }]
}, { _id: false });

const spendingTierSchema = new mongoose.Schema({
  tier_name: {
    type: String,
    required: true
  },
  attack: { type: Number, default: 0 },
  defense: { type: Number, default: 0 },
  health: { type: Number, default: 0 },
  all_dmg: { type: Number, default: 0 }
}, { _id: false });

const citySkinSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  bonuses_by_role: [{
    role_id: String,
    attack: { type: Number, default: 0 },
    defense: { type: Number, default: 0 },
    health: { type: Number, default: 0 },
    all_dmg: { type: Number, default: 0 },
    skill_dmg: { type: Number, default: 0 }
  }]
}, { _id: false });

// Static reference data models
const VIPBonus = mongoose.model('VIPBonus', vipBonusSchema);
const Civilisation = mongoose.model('Civilisation', civilisationSchema);
const SpendingTier = mongoose.model('SpendingTier', spendingTierSchema);
const CitySkin = mongoose.model('CitySkin', citySkinSchema);

export { VIPBonus, Civilisation, SpendingTier, CitySkin };
