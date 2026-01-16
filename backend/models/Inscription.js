import mongoose from 'mongoose';

const statsSchema = new mongoose.Schema({
  attack: { type: Number, default: 0 },
  defense: { type: Number, default: 0 },
  health: { type: Number, default: 0 },
  all_dmg: { type: Number, default: 0 },
  na: { type: Number, default: 0 },
  ca: { type: Number, default: 0 },
  skill_dmg: { type: Number, default: 0 },
  smite_dmg: { type: Number, default: 0 },
  combo_dmg: { type: Number, default: 0 }
}, { _id: false });

const multipliersSchema = new mongoose.Schema({
  all_dmg: { type: Number, default: 0 },
  skill_dmg: { type: Number, default: 0 },
  smite_dmg: { type: Number, default: 0 },
  combo_dmg: { type: Number, default: 0 }
}, { _id: false });

const contextSpecificBonusSchema = new mongoose.Schema({
  context: {
    type: String,
    enum: ['RALLY', 'GARRISON']
  },
  stats: statsSchema,
  multipliers: multipliersSchema
}, { _id: false });

const inscriptionSchema = new mongoose.Schema({
  inscription_id: {
    type: String,
    required: true,
    unique: true
  },
  name: {
    type: String,
    required: true
  },
  rarity: {
    type: String,
    required: true,
    enum: ['COMMON', 'RARE', 'SPECIAL', 'FORMATION']
  },
  stats: {
    type: statsSchema,
    default: {}
  },
  multipliers: {
    type: multipliersSchema,
    default: {}
  },
  context_specific: {
    type: Boolean,
    default: false
  },
  context_bonuses: [contextSpecificBonusSchema],
  negative_effects: {
    type: statsSchema,
    default: {}
  }
}, { timestamps: true });

// Index for faster queries
inscriptionSchema.index({ rarity: 1 });

export default mongoose.model('Inscription', inscriptionSchema);
