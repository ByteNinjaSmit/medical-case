const mongoose = require("mongoose");

const historySchema = new mongoose.Schema(
  {
    patient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Patient",
      required: true,
      unique: true,
    },
    pastHistory: {
      diseases: [
        {
          name: { type: String, trim: true },
          year: { type: String, trim: true },
          treatmentTaken: { type: String, trim: true },
          outcome: { type: String, trim: true },
        },
      ],
      flags: {
        diabetes: { type: Boolean, default: false },
        asthma: { type: Boolean, default: false },
        hypertension: { type: Boolean, default: false },
        tuberculosis: { type: Boolean, default: false },
        jaundice: { type: Boolean, default: false },
        typhoid: { type: Boolean, default: false },
        skinDisease: { type: Boolean, default: false },
      },
      surgeries: [
        {
          type: { type: String, trim: true },
          year: { type: String, trim: true },
          complications: { type: String, trim: true },
        },
      ],
      accidents: [
        {
          type: { type: String, trim: true },
          year: { type: String, trim: true },
          effects: { type: String, trim: true },
        },
      ],
      allergies: { type: String, trim: true },
      vaccinations: { type: String, trim: true },
    },
    familyHistory: {
      familyDiseases: {
        diabetes: { type: Boolean, default: false },
        hypertension: { type: Boolean, default: false },
        asthma: { type: Boolean, default: false },
        tuberculosis: { type: Boolean, default: false },
        cancer: { type: Boolean, default: false },
        psoriasis: { type: Boolean, default: false },
        psychiatricIllness: { type: Boolean, default: false },
      },
      relationSpecific: [
        {
          relation: { type: String, trim: true },
          disease: { type: String, trim: true },
          ageOfOnset: { type: String, trim: true },
        },
      ],
      consanguinity: { type: String, trim: true },
      notes: { type: String, trim: true },
    },
    personalHistory: {
      addictions: { type: String, trim: true },
      habits: { type: String, trim: true },
      occupationHazards: { type: String, trim: true },
      lifestyle: { type: String, trim: true },
    },
  },
  { timestamps: true }
);

const History = mongoose.model("History", historySchema);
module.exports = History;

