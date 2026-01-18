import mongoose from 'mongoose';

const armamentSchema = new mongoose.Schema({
  armamentId: {
    type: String,
    required: true,
    unique: true
  },
  name: {
    type: String,
    required: true
  },
  description: {
    type: String,
    default: ''
  },
  damageType: {
    type: String,
    required: true,
    enum: ['normal_attack', 'skill', 'defense', 'combo', 'smite']
  },
  baseStats: [{
    type: String,
    enum: ['attack', 'defense', 'marchSpeed', 'allDamage']
  }]
}, { timestamps: true });

export default mongoose.model('Armament', armamentSchema);
