const mongoose = require("mongoose");

const complaintSchema = new mongoose.Schema(
  {
    // ===============================
    // Relation with Patient
    // ===============================
    patient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Patient",
      required: true
    },

    // Visit date – defaults to now
    visitDate: {
      type: Date,
      default: Date.now
    },

    // Complaint number (per patient)
    complaintNo: {
      type: Number,
      required: true,
      min: 1
    },

    // Main complaint text
    complaintText: {
      type: String,
      required: true,
      trim: true,
      minlength: 3,
      maxlength: 1000
    },

    // ===============================
    // Clinical details
    // ===============================

    location: {
      type: String,
      trim: true,
      maxlength: 500,
    required:true,
    },

    sensation: {
      type: String,
      trim: true,
      required:true,
    },

    onset: {
      type: String,
      trim: true,
      enum: [
        "Sudden",
        "Gradual",
        "Slow",
        "Rapid",
        "Unknown",
        "Other"
      ],
      default: "Unknown"
    },

    aggravation: {
      type: String,
      trim: true
    },

    amelioration: {
      type: String,
      trim: true
    },

    concomitants: {
      type: String,
      trim: true,
    required:true,
    },

    duration: {
      type: String,
      trim: true
    },

    severity: {
      type: String,
      enum: ["Mild", "Moderate", "Severe", "Very Severe"],
      default: "Moderate"
    }
  },
  { timestamps: true }
);

// =====================================
// Unique constraint: complaintNo per patient
// =====================================
complaintSchema.index({ patient: 1, complaintNo: 1 }, { unique: true });

// Faster lookup
complaintSchema.index({ patient: 1 });

const Complaint = mongoose.model("Complaint", complaintSchema);
module.exports = Complaint;
