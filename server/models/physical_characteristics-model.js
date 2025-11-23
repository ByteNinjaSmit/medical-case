const mongoose = require("mongoose");

const physicalCharacteristicsSchema = new mongoose.Schema(
  {
    patient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Patient",
      required: true,
      unique: true,
    },
    appearance: {
      bodyType: { type: String, trim: true },
      complexion: { type: String, trim: true },
      build: { type: String, trim: true },
      gait: { type: String, trim: true },
      generalLook: { type: String, trim: true },
    },
    skin: {
      color: { type: String, trim: true },
      texture: { type: String, trim: true },
      eruptions: { type: String, trim: true },
      itching: { type: String, trim: true },
      dryness: { type: String, trim: true },
      sensitivity: { type: String, trim: true },
    },
    hair: {
      type: { type: String, trim: true },
      fall: { type: String, trim: true },
      color: { type: String, trim: true },
      dandruff: { type: String, trim: true },
    },
    nails: {
      brittleness: { type: String, trim: true },
      color: { type: String, trim: true },
      shape: { type: String, trim: true },
      thickness: { type: String, trim: true },
    },
    face: {
      expression: { type: String, trim: true },
      puffiness: { type: String, trim: true },
      discoloration: { type: String, trim: true },
    },
    eyes: {
      complaints: { type: String, trim: true },
      modalities: { type: String, trim: true },
    },
    ears: {
      complaints: { type: String, trim: true },
      discharges: { type: String, trim: true },
    },
    mouthTeeth: {
      tongue: { type: String, trim: true },
      ulcers: { type: String, trim: true },
      gums: { type: String, trim: true },
      teeth: { type: String, trim: true },
    },
    perspiration: {
      distribution: { type: String, trim: true },
      odour: { type: String, trim: true },
      staining: { type: String, trim: true },
      amount: { type: String, trim: true },
      temperature: { type: String, trim: true },
    },
    extremities: {
      swelling: { type: String, trim: true },
      tremors: { type: String, trim: true },
      weakness: { type: String, trim: true },
    },
    dietRoutine: {
      mealPattern: { type: String, trim: true },
      addictions: { type: String, trim: true },
      physicalActivity: { type: String, trim: true },
      sleepSchedule: { type: String, trim: true },
    },
  },
  { timestamps: true }
);

const PhysicalCharacteristics = mongoose.model(
  "PhysicalCharacteristics",
  physicalCharacteristicsSchema
);
module.exports = PhysicalCharacteristics;

