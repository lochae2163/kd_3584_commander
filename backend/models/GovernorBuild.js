import mongoose from 'mongoose';

const equipmentSlotSchema = new mongoose.Schema({
  equipmentId: {
    type: String,
    default: null
  },
  name: {
    type: String,
    default: null
  },
  iconicLevel: {
    type: Number,
    min: 1,
    max: 5,
    default: null
  },
  hasCrit: {
    type: Boolean,
    default: false
  }
}, { _id: false });

const armamentSchema = new mongoose.Schema({
  armamentType: {
    type: String,
    enum: ['arch', 'wedge', 'hollow_square', 'delta', 'pincer'],
    default: null
  },
  attack: { type: Number, default: null },
  defense: { type: Number, default: null },
  marchSpeed: { type: Number, default: null },
  allDamage: { type: Number, default: null }
}, { _id: false });

const inscriptionsSchema = new mongoose.Schema({
  special: [{ type: String }],
  rare: [{ type: String }],
  common: [{ type: String }]
}, { _id: false });

const governorBuildSchema = new mongoose.Schema({
  governorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Governor',
    required: true
  },
  troopType: {
    type: String,
    required: true,
    enum: ['infantry', 'cavalry', 'archer', 'leadership']
  },
  buildType: {
    type: String,
    required: true,
    enum: ['rally', 'garrison']
  },
  primaryCommander: {
    type: String,
    default: null
  },
  secondaryCommander: {
    type: String,
    default: null
  },
  equipment: {
    weapon: { type: equipmentSlotSchema, default: () => ({}) },
    helmet: { type: equipmentSlotSchema, default: () => ({}) },
    chest: { type: equipmentSlotSchema, default: () => ({}) },
    gloves: { type: equipmentSlotSchema, default: () => ({}) },
    legs: { type: equipmentSlotSchema, default: () => ({}) },
    boots: { type: equipmentSlotSchema, default: () => ({}) },
    accessory: { type: equipmentSlotSchema, default: () => ({}) }
  },
  armament: {
    type: armamentSchema,
    default: () => ({})
  },
  inscriptions: {
    type: inscriptionsSchema,
    default: () => ({ special: [], rare: [], common: [] })
  }
}, { timestamps: true });

// Index for faster queries
governorBuildSchema.index({ governorId: 1 });
governorBuildSchema.index({ governorId: 1, troopType: 1, buildType: 1 });

export default mongoose.model('GovernorBuild', governorBuildSchema);
