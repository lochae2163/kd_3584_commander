import mongoose from 'mongoose';

const statsSchema = new mongoose.Schema({
  attack: { type: Number, default: 0 },
  defense: { type: Number, default: 0 },
  health: { type: Number, default: 0 },
  all_dmg: { type: Number, default: 0 },
  skill_dmg: { type: Number, default: 0 }
}, { _id: false });

const setBonusLevelSchema = new mongoose.Schema({
  pieces_required: {
    type: Number,
    required: true
  },
  stats: {
    type: statsSchema,
    required: true
  }
}, { _id: false });

const setBonusSchema = new mongoose.Schema({
  set_name: {
    type: String,
    required: true,
    unique: true
  },
  bonus_levels: [setBonusLevelSchema]
  // e.g., [{ pieces_required: 2, stats: {...} }, { pieces_required: 4, stats: {...} }]
}, { timestamps: true });

export default mongoose.model('SetBonus', setBonusSchema);
