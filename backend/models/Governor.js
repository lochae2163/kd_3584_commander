import mongoose from 'mongoose';

const governorSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  vipLevel: {
    type: Number,
    min: 0,
    max: 18,
    default: 0
  },
  totalMarches: {
    type: Number,
    min: 1,
    max: 7,
    default: 1
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null  // null = unclaimed (for migration of existing data)
  }
}, { timestamps: true });

// Note: name field already has an index due to unique: true
governorSchema.index({ userId: 1 });

export default mongoose.model('Governor', governorSchema);
