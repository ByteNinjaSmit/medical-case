const mongoose = require("mongoose");

const menstrualHistorySchema = new mongoose.Schema(
  {
    patient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Patient",
      required: true,
      unique: true,
    },
    lmp: {
      type: Date,
    },
    cycleLength: {
      type: String,
      trim: true,
    },
    flowDuration: {
      type: String,
      trim: true,
    },
    regularity: {
      type: String,
      trim: true,
    },
    flowAmount: {
      type: String,
      trim: true,
    },
    flowColor: {
      type: String,
      trim: true,
    },
    clots: {
      type: String,
      trim: true,
    },
    pain: {
      timing: { type: String, trim: true },
      character: { type: String, trim: true },
      location: { type: String, trim: true },
      modalities: { type: String, trim: true },
    },
    moodChanges: {
      type: String,
      trim: true,
    },
    associatedSymptoms: {
      type: String,
      trim: true,
    },
    obstetricHistory: {
      type: String,
      trim: true,
    },
    menarcheAge: {
      type: Number,
      min: 8,
      max: 25,
    },
    menopauseAge: {
      type: Number,
      min: 30,
      max: 60,
    },
  },
  { timestamps: true }
);

const MenstrualHistory = mongoose.model("MenstrualHistory", menstrualHistorySchema);
module.exports = MenstrualHistory;
