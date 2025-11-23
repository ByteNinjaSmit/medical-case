const mongoose = require("mongoose");

const eliminationSchema = new mongoose.Schema(
  {
    patient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Patient",
      required: true,
      unique: true,
    },
    stool: {
      color: { type: String, trim: true },
      consistency: { type: String, trim: true },
      odor: { type: String, trim: true },
      satisfaction: { type: String, trim: true },
      urging: { type: String, trim: true },
      pain: { type: String, trim: true },
      frequency: { type: String, trim: true },
      bloodOrMucus: { type: String, trim: true },
    },
    urine: {
      color: { type: String, trim: true },
      odor: { type: String, trim: true },
      quantity: { type: String, trim: true },
      urgency: { type: String, trim: true },
      difficulty: { type: String, trim: true },
      burning: { type: String, trim: true },
      frequency: { type: String, trim: true },
    },
    discharges: [
      {
        type: { type: String, trim: true },
        color: { type: String, trim: true },
        odor: { type: String, trim: true },
        stainColor: { type: String, trim: true },
        consistency: { type: String, trim: true },
        timing: { type: String, trim: true },
      },
    ],
  },
  { timestamps: true }
);

const Elimination = mongoose.model("Elimination", eliminationSchema);
module.exports = Elimination;
