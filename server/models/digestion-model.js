const mongoose = require("mongoose");

const digestionSchema = new mongoose.Schema(
  {
    patient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Patient",
      required: true,
      unique: true,
    },
    acidity: {
      type: String,
      enum: ["None", "Mild", "Moderate", "Severe"],
      default: "None",
    },
    appetite: {
      type: String,
      enum: ["Low", "Normal", "High", "Variable"],
      default: "Normal",
    },
    colics: {
      present: { type: Boolean, default: false },
      description: { type: String, trim: true },
    },
    eructations: {
      type: String,
      trim: true,
    },
    flatulence: {
      location: {
        type: String,
        enum: ["None", "Upper Abdomen", "Lower Abdomen", "Generalized"],
        default: "None",
      },
      description: { type: String, trim: true },
    },
    hungerPattern: {
      type: String,
      trim: true,
    },
    nausea: {
      description: { type: String, trim: true },
      timing: { type: String, trim: true },
      modalities: { type: String, trim: true },
    },
    salivation: {
      type: String,
      trim: true,
    },
    taste: {
      type: String,
      trim: true,
    },
    thirstLevel: {
      type: Number,
      min: 0,
      max: 10,
      default: 5,
    },
    thirstNote: {
      type: String,
      trim: true,
    },
    cravings: [
      {
        type: String,
        trim: true,
      },
    ],
    cravingsNote: {
      type: String,
      trim: true,
    },
    aversions: [
      {
        type: String,
        trim: true,
      },
    ],
    aversionsNote: {
      type: String,
      trim: true,
    },
    foodReactions: [
      {
        item: { type: String, trim: true },
        effect: { type: String, trim: true },
      },
    ],
    foodEffectsNote: {
      type: String,
      trim: true,
    },
    generalModalities: {
      type: String,
      trim: true,
    },
    notes: {
      type: String,
      trim: true,
    },
  },
  { timestamps: true }
);

const Digestion = mongoose.model("Digestion", digestionSchema);
module.exports = Digestion;
