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

// Each armament slot can have multiple inscriptions selected
const armamentSlotSchema = new mongoose.Schema({
  inscriptions: [{ type: String }]  // Array of inscription IDs
}, { _id: false });

const armamentSchema = new mongoose.Schema({
  formation: {
    type: String,
    enum: ['pincer', 'tercio', 'delta', 'hollow_square', 'arch', 'wedge'],
    default: null
  },
  // 4 slots, each with their own inscriptions
  emblem: { type: armamentSlotSchema, default: () => ({ inscriptions: [] }) },
  flag: { type: armamentSlotSchema, default: () => ({ inscriptions: [] }) },
  instrument: { type: armamentSlotSchema, default: () => ({ inscriptions: [] }) },
  scroll: { type: armamentSlotSchema, default: () => ({ inscriptions: [] }) }
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
    accessory1: { type: equipmentSlotSchema, default: () => ({}) },
    accessory2: { type: equipmentSlotSchema, default: () => ({}) }
  },
  armament: {
    type: armamentSchema,
    default: () => ({
      formation: null,
      emblem: { inscriptions: [] },
      flag: { inscriptions: [] },
      instrument: { inscriptions: [] },
      scroll: { inscriptions: [] }
    })
  }
}, { timestamps: true });

// Index for faster queries
governorBuildSchema.index({ governorId: 1 });
governorBuildSchema.index({ governorId: 1, troopType: 1, buildType: 1 });
governorBuildSchema.index({ troopType: 1 });
governorBuildSchema.index({ buildType: 1 });

export default mongoose.model('GovernorBuild', governorBuildSchema);
