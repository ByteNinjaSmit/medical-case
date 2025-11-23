const mongoose = require("mongoose");

const sexualFunctionSchema = new mongoose.Schema(
  {
    patient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Patient",
      required: true,
      unique: true,
    },
    gender: {
      type: String,
      enum: ["Male", "Female", "Other", "Unknown"],
      default: "Unknown",
    },
    desireLevel: {
      type: String,
      trim: true,
    },
    aversion: {
      type: String,
      trim: true,
    },
    guiltOrConflict: {
      type: String,
      trim: true,
    },
    male: {
      erectionQuality: { type: String, trim: true },
      emissions: { type: String, trim: true },
      debility: { type: String, trim: true },
      masturbationHistory: { type: String, trim: true },
      contraceptionUse: { type: String, trim: true },
      stdHistory: { type: String, trim: true },
      performanceAnxiety: { type: String, trim: true },
    },
    female: {
      libido: { type: String, trim: true },
      dyspareunia: { type: String, trim: true },
      vaginalDryness: { type: String, trim: true },
      discharges: { type: String, trim: true },
      contraceptionUse: { type: String, trim: true },
      obstetricHistory: { type: String, trim: true },
    },
    notes: {
      type: String,
      trim: true,
    },
  },
  { timestamps: true }
);

const SexualFunction = mongoose.model("SexualFunction", sexualFunctionSchema);
module.exports = SexualFunction;
