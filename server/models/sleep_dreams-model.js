const mongoose = require("mongoose");

const sleepDreamsSchema = new mongoose.Schema(
  {
    patient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Patient",
      required: true,
      unique: true,
    },
    sleepQuality: {
      type: String,
      enum: ["Light", "Deep", "Broken", "Restless", "Normal"],
      default: "Normal",
    },
    sleepPosition: {
      type: String,
      enum: ["Back", "Side", "Stomach", "Variable", "Unknown"],
      default: "Variable",
    },
    timeToSleep: {
      type: String,
      trim: true,
    },
    earlyWaking: {
      type: String,
      trim: true,
    },
    nightAwakenings: {
      reason: { type: String, trim: true },
      frequency: { type: String, trim: true },
    },
    disturbances: {
      type: String,
      trim: true,
    },
    dreams: [
      {
        theme: { type: String, trim: true },
        frequency: { type: String, trim: true },
        emotionalTone: { type: String, trim: true },
        notes: { type: String, trim: true },
      },
    ],
  },
  { timestamps: true }
);

const SleepDreams = mongoose.model("SleepDreams", sleepDreamsSchema);
module.exports = SleepDreams;
