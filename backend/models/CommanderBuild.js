import mongoose from 'mongoose';

const equipmentPieceSchema = new mongoose.Schema({
  slot: {
    type: String,
    required: true,
    enum: ['WEAPON', 'HELM', 'CHEST', 'GLOVES', 'PANTS', 'BOOTS', 'ACCESSORY1', 'ACCESSORY2']
  },
  equipment_id: {
    type: String,
    ref: 'Equipment',
    required: true
  },
  iconic_level: {
    type: String,
    required: true,
    enum: ['I', 'II', 'IV', 'V']
  },
  special_talent: {
    type: Boolean,
    default: false
  }
}, { _id: false });

const calculatedStatsSchema = new mongoose.Schema({
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

const commanderBuildSchema = new mongoose.Schema({
  player_name: {
    type: String,
    required: true
  },
  role: {
    type: String,
    ref: 'CommanderRole',
    required: true
  },

  // Layer 1: Player Base Stats
  layer_1: {
    vip_level: {
      type: Number,
      required: true,
      min: 10,
      max: 19
    },
    civilisation: {
      type: String,
      required: true
    },
    spending_tier: {
      type: String,
      required: true
    },
    city_skin: {
      type: String,
      required: true
    },
    calculated_stats: calculatedStatsSchema,
    score: { type: Number, default: 0 }
  },

  // Layer 2: Equipment
  layer_2: {
    equipment_pieces: [equipmentPieceSchema],
    set_bonuses: [{
      set_name: String,
      pieces_count: Number,
      stats: calculatedStatsSchema
    }],
    calculated_stats: calculatedStatsSchema,
    score: { type: Number, default: 0 }
  },

  // Layer 3: Formation & Inscriptions
  layer_3: {
    formation: {
      type: String,
      required: true,
      enum: ['ARCH', 'WEDGE', 'HOLLOW SQUARE', 'DELTA', 'PINCER']
    },
    special_inscriptions: [{
      type: String,
      ref: 'Inscription'
    }],
    rare_inscriptions: [{
      type: String,
      ref: 'Inscription'
    }],
    common_inscriptions: [{
      type: String,
      ref: 'Inscription'
    }],
    armament_attributes: {
      attack: { type: Number, default: 0 },
      defense: { type: Number, default: 0 },
      health: { type: Number, default: 0 },
      all_dmg: { type: Number, default: 0 }
    },
    calculated_stats: calculatedStatsSchema,
    multipliers: {
      all_dmg: { type: Number, default: 0 },
      skill_dmg: { type: Number, default: 0 },
      smite_dmg: { type: Number, default: 0 },
      combo_dmg: { type: Number, default: 0 }
    },
    score: { type: Number, default: 0 }
  },

  // Final Results
  total_score: {
    type: Number,
    required: true
  },
  tier: {
    type: String,
    enum: ['S+', 'S', 'A', 'B', 'C'],
    required: true
  },
  percentage_of_max: {
    type: Number,
    required: true
  }
}, { timestamps: true });

// Indexes for leaderboard queries
commanderBuildSchema.index({ role: 1, total_score: -1 });
commanderBuildSchema.index({ player_name: 1 });

export default mongoose.model('CommanderBuild', commanderBuildSchema);
