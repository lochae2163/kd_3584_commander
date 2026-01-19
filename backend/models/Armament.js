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
  slots: [{
    type: String,
    enum: ['emblem', 'flag', 'instrument', 'scroll']
  }]
}, { timestamps: true });

export default mongoose.model('Armament', armamentSchema);
