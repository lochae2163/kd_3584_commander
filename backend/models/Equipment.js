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

const iconicLevelSchema = new mongoose.Schema({
  level: {
    type: String,
    required: true,
    enum: ['I', 'II', 'IV', 'V']
  },
  stats: {
    type: statsSchema,
    required: true
  },
  multipliers: {
    type: multipliersSchema,
    default: {}
  }
}, { _id: false });

const equipmentSchema = new mongoose.Schema({
  equipment_id: {
    type: String,
    required: true,
    unique: true
  },
  name: {
    type: String,
    required: true
  },
  type: {
    type: String,
    required: true,
    enum: ['WEAPON', 'HELM', 'CHEST', 'GLOVES', 'PANTS', 'BOOTS', 'ACCESSORY']
  },
  set_name: {
    type: String,
    default: null
    // e.g., "Hellish Wasteland", "Dragon Breath", "Eternal Empire", "Garb of the Glorious Goddess"
  },
  iconic_levels: [iconicLevelSchema],
  special_talent_available: {
    type: Boolean,
    default: true
  }
}, { timestamps: true });

// Index for faster queries
equipmentSchema.index({ type: 1, set_name: 1 });

export default mongoose.model('Equipment', equipmentSchema);
