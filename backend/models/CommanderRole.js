import mongoose from 'mongoose';

const scoringScaleSchema = new mongoose.Schema({
  attack: { type: Number, required: true },
  defense: { type: Number, required: true },
  health: { type: Number, required: true },
  all_dmg: { type: Number, required: true },
  na: { type: Number, required: true },
  ca: { type: Number, required: true },
  skill_dmg: { type: Number, required: true },
  smite_dmg: { type: Number, required: true },
  combo_dmg: { type: Number, required: true }
}, { _id: false });

const commanderRoleSchema = new mongoose.Schema({
  role_id: {
    type: String,
    required: true,
    unique: true,
    // e.g., "ARCHER RALLY - SKILL DMG", "CAV GARRISON - DAVID"
  },
  troop_type: {
    type: String,
    required: true,
    enum: ['CAVALRY', 'ARCHER', 'INFANTRY', 'LEADERSHIP']
  },
  role_type: {
    type: String,
    required: true,
    enum: ['RALLY', 'GARRISON']
  },
  damage_focus: {
    type: String,
    required: true,
    // e.g., "SKILL DMG", "SMITE DMG", "COMBO DMG", "NA", "HYBRID"
  },
  scoring_scales: {
    layer_1_2: {
      type: scoringScaleSchema,
      required: true
    },
    layer_3: {
      type: scoringScaleSchema,
      required: true
    }
  },
  highest_score_reference: {
    type: Number,
    required: true
  },
  tier_thresholds: {
    s_plus: { type: Number, default: 87.5 }, // % of highest score
    s: { type: Number, default: 81 },
    a: { type: Number, default: 75 },
    b: { type: Number, default: 66 }
    // C tier is everything below B
  }
}, { timestamps: true });

export default mongoose.model('CommanderRole', commanderRoleSchema);
