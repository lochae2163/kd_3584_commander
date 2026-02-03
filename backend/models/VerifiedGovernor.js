import mongoose from 'mongoose';

const verifiedGovernorSchema = new mongoose.Schema({
  visibleGovernorId: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  governorName: {
    type: String,
    required: true
  },
  power: {
    type: Number,
    default: 0
  },
  allianceTag: {
    type: String,
    default: null
  },
  killPoints: {
    type: Number,
    default: 0
  },
  deads: {
    type: Number,
    default: 0
  },
  // Track when this data was last updated
  lastUpdated: {
    type: Date,
    default: Date.now
  }
}, { timestamps: true });

// Static method to check if a governor ID is verified
verifiedGovernorSchema.statics.isVerified = async function(governorId) {
  const verified = await this.findOne({ visibleGovernorId: String(governorId) });
  return !!verified;
};

// Static method to get verified governor info
verifiedGovernorSchema.statics.getVerifiedInfo = async function(governorId) {
  return await this.findOne({ visibleGovernorId: String(governorId) });
};

export default mongoose.model('VerifiedGovernor', verifiedGovernorSchema);
