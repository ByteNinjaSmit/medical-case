const mongoose = require("mongoose");

const followUpSchema = new mongoose.Schema(
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
    relatedPrescription: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Prescription",
    },
    patientState: {
      type: String,
      trim: true,
    },
    changesInComplaints: {
      type: String,
      trim: true,
    },
    changesInGenerals: {
      type: String,
      trim: true,
    },
    remedyReaction: {
      type: String,
      trim: true,
    },
    nextPrescription: {
      type: String,
      trim: true,
    },
    nextVisitDate: {
      type: Date,
    },
    notes: {
      type: String,
      trim: true,
    },
  },
  { timestamps: true }
);

followUpSchema.index({ patient: 1, date: -1 });

const FollowUp = mongoose.model("FollowUp", followUpSchema);
module.exports = FollowUp;
