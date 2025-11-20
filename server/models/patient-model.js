const mongoose = require("mongoose");

const patientSchema = new mongoose.Schema(
    {
        patientId: {
            type: String,
            required: true,
            trim: true,
            match: /^[A-Z0-9\-]+$/  // only allows letters, numbers & hyphen
        },

        visitDate: {
            type: Date,
            default: Date.now
        },

        name: {
            type: String,
            required: true,
            trim: true,
            minlength: 2,
            maxlength: 100
        },

        age: {
            type: Number,
            min: 0,
            max: 120,
            required: true,
        },

        sex: {
            type: String,
            enum: ["Male", "Female", "Other", "Prefer Not To Say"],
            default: "Other",
            required: true,
        },

        maritalStatus: {
            type: String,
            enum: [
                "Single",
                "Married",
                "Widowed",
                "Divorced",
                "Separated",
                "Not Disclosed"
            ],
            default: "Not Disclosed"
        },

        diet: {
            type: String,
            enum: ["VEG", "NON_VEG", "EGG", "VEGAN", "OTHER"],
            default: "OTHER"
        },

        address: {
            type: String,
            trim: true,
            maxlength: 300
        },

        mobileNo: {
            type: String,
            trim: true,
            match: /^(\+?\d{1,3}[- ]?)?\d{7,14}$/,
        },


        referredBy: {
            type: String,
            trim: true,
            maxlength: 100
        },

        education: {
            type: String,
            enum: [
                "None",
                "Primary",
                "Secondary",
                "High School",
                "Graduate",
                "Post Graduate",
                "Doctorate",
                "Other"
            ],
            default: "Other"
        },

        occupation: {
            type: String,
            enum: [
                "Unemployed",
                "Student",
                "Self Employed",
                "Private Job",
                "Government Job",
                "Retired",
                "Homemaker",
                "Other"
            ],
            default: "Other"
        },

        summary: {
            type: String,
            trim: true,
            maxlength: 2000
        }
    },
    { timestamps: true }
);

// Create indexes for faster search
patientSchema.index({ patientId: 1 });
patientSchema.index({ name: "text", address: "text" });

const Patient = mongoose.model("Patient", patientSchema);
module.exports = Patient;
