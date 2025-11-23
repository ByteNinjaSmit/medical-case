const Prescription = require("../models/prescription-model");

// Create a new prescription
const createPrescription = async (req, res) => {
    try {
        const { patientId, medicines, reason, followUpNotes, nextVisit } = req.body;

        if (!patientId || !medicines || medicines.length === 0) {
            return res.status(400).json({ message: "Patient ID and at least one medicine are required." });
        }

        const newPrescription = new Prescription({
            patientId,
            medicines,
            reason,
            followUpNotes,
            nextVisit
        });

        await newPrescription.save();
        res.status(201).json({ message: "Prescription created successfully", prescription: newPrescription });
    } catch (error) {
        console.error("Error creating prescription:", error);
        res.status(500).json({ message: "Internal server error", error: error.message });
    }
};

// Get all prescriptions for a specific patient
const getPrescriptionsByPatient = async (req, res) => {
    try {
        const { patientId } = req.params;
        const prescriptions = await Prescription.find({ patientId }).sort({ date: -1 });
        res.status(200).json(prescriptions);
    } catch (error) {
        console.error("Error fetching prescriptions:", error);
        res.status(500).json({ message: "Internal server error", error: error.message });
    }
};

// Update a prescription
const updatePrescription = async (req, res) => {
    try {
        const { id } = req.params;
        const updatedPrescription = await Prescription.findByIdAndUpdate(id, req.body, { new: true });

        if (!updatedPrescription) {
            return res.status(404).json({ message: "Prescription not found" });
        }

        res.status(200).json({ message: "Prescription updated successfully", prescription: updatedPrescription });
    } catch (error) {
        console.error("Error updating prescription:", error);
        res.status(500).json({ message: "Internal server error", error: error.message });
    }
};

// Delete a prescription
const deletePrescription = async (req, res) => {
    try {
        const { id } = req.params;
        const deletedPrescription = await Prescription.findByIdAndDelete(id);

        if (!deletedPrescription) {
            return res.status(404).json({ message: "Prescription not found" });
        }

        res.status(200).json({ message: "Prescription deleted successfully" });
    } catch (error) {
        console.error("Error deleting prescription:", error);
        res.status(500).json({ message: "Internal server error", error: error.message });
    }
};

module.exports = {
    createPrescription,
    getPrescriptionsByPatient,
    updatePrescription,
    deletePrescription
};
