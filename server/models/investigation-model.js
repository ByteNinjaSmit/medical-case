const mongoose = require("mongoose");

const investigationSchema = new mongoose.Schema(
  {
    patient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Patient",
      required: true,
    },
    date: {
      type: Date,
      default: Date.now,
    },
    type: {
      type: String,
      trim: true,
    },
    hb: { type: String, trim: true },
    wbc: { type: String, trim: true },
    rbc: { type: String, trim: true },
    esr: { type: String, trim: true },
    bloodSugar: { type: String, trim: true },
    lipidProfile: { type: String, trim: true },
    urineReport: { type: String, trim: true },
    stoolReport: { type: String, trim: true },
    radiology: { type: String, trim: true },
    ecg: { type: String, trim: true },
    other: { type: String, trim: true },
    values: [
      {
        name: { type: String, trim: true },
        value: { type: String, trim: true },
        unit: { type: String, trim: true },
        referenceRange: { type: String, trim: true },
      },
    ],
    reportSummary: {
      type: String,
      trim: true,
    },
  },
  { timestamps: true }
);

investigationSchema.index({ patient: 1, date: -1 });

const Investigation = mongoose.model("Investigation", investigationSchema);
module.exports = Investigation;

