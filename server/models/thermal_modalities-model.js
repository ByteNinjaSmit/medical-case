const mongoose = require("mongoose");

const thermalModalitiesSchema = new mongoose.Schema(
  {
    patient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Patient",
      required: true,
      unique: true,
    },
    thermalState: {
      type: String,
      enum: ["Hot", "Cold", "Neutral"],
      default: "Neutral",
    },
    sunReaction: {
      type: String,
      trim: true,
    },
    moonReaction: {
      type: String,
      trim: true,
    },
    noiseSensitivity: {
      type: String,
      trim: true,
    },
    bathPreference: {
      type: String,
      trim: true,
    },
    weatherPreference: {
      type: String,
      trim: true,
    },
    seasonWorse: {
      type: String,
      trim: true,
    },
    seasonBetter: {
      type: String,
      trim: true,
    },
    coveringPreference: {
      type: String,
      trim: true,
    },
    roomTemperaturePreference: {
      type: String,
      trim: true,
    },
    generalModalities: {
      type: String,
      trim: true,
    },
  },
  { timestamps: true }
);

const ThermalModalities = mongoose.model("ThermalModalities", thermalModalitiesSchema);
module.exports = ThermalModalities;
