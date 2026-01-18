import mongoose from 'mongoose';

const inscriptionSchema = new mongoose.Schema({
  inscriptionId: {
    type: String,
    required: true,
    unique: true
  },
  name: {
    type: String,
    required: true
  },
  armamentType: {
    type: String,
    required: true,
    enum: ['arch', 'wedge', 'hollow_square', 'delta', 'pincer']
  },
  rarity: {
    type: String,
    required: true,
    enum: ['COMMON', 'RARE', 'SPECIAL']
  },
  effect: {
    type: String,
    default: ''
  }
}, { timestamps: true });

// Indexes for faster queries
inscriptionSchema.index({ rarity: 1 });
inscriptionSchema.index({ armamentType: 1 });
inscriptionSchema.index({ armamentType: 1, rarity: 1 });

export default mongoose.model('Inscription', inscriptionSchema);
