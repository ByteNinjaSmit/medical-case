const mongoose = require("mongoose");

const prescriptionSchema = new mongoose.Schema({
    patientId: { type: String, required: true },

    date: { type: Date, default: Date.now },

    medicines: [
        {
            name: { type: String, required: true },
            potency: { type: String },
            dosage: { type: String },     // “3 drops TDS”, “Once daily”, etc.
            frequency: { type: String }   // Optional
        }
    ],

    reason: { type: String },       // Key symptoms or analysis that led to remedy
    followUpNotes: { type: String }, // Improvement, aggravation, change of plan
    nextVisit: { type: Date }
}, { timestamps: true });

module.exports = mongoose.model("Prescription", prescriptionSchema);
