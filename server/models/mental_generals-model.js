const mongoose = require("mongoose");

const mentalGeneralsSchema = new mongoose.Schema(
  {
    patient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Patient",
      required: true,
      unique: true,
    },
    temperament: {
      type: String,
      trim: true,
    },
    fears: {
      type: String,
      trim: true,
    },
    anxieties: {
      type: String,
      trim: true,
    },
    angerIrritability: {
      type: String,
      trim: true,
    },
    memoryConcentration: {
      type: String,
      trim: true,
    },
    sleepImpact: {
      type: String,
      trim: true,
    },
    griefOrTrauma: {
      type: String,
      trim: true,
    },
    otherSymptoms: {
      type: String,
      trim: true,
    },
  },
  { timestamps: true }
);

const MentalGenerals = mongoose.model("MentalGenerals", mentalGeneralsSchema);
module.exports = MentalGenerals;
