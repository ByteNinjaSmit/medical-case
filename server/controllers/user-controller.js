require("dotenv").config();
const User = require("../models/user-model");
const Patient = require("../models/patient-model");
const Complaint = require("../models/complaint-model");
const PhysicalCharacteristics = require("../models/physical_characteristics-model");
const Digestion = require("../models/digestion-model");
const Elimination = require("../models/elimination-model");
const SleepDreams = require("../models/sleep_dreams-model");
const SexualFunction = require("../models/sexual_function-model");
const MenstrualHistory = require("../models/menstrual_history-model");
const History = require("../models/history-model");
const ThermalModalities = require("../models/thermal_modalities-model");
const Investigation = require("../models/investigation-model");
const FollowUp = require("../models/followup-model");
const MentalGenerals = require("../models/mental_generals-model");
const mongoose = require('mongoose');


const createPatient = async (req, res, next) => {
    try {
        // ============================
        // 1. Extract Body Fields
        // ============================
        const {
            patientId,
            visitDate,
            name,
            age,
            sex,
            maritalStatus,
            diet,
            address,
            mobileNo,
            referredBy,
            education,
            occupation,
            summary,
        } = req.body;

        // ============================
        // 2. Manual Validation (Before DB)
        // ============================

        // Required fields
        const requiredFields = {
            patientId,
            name,
            age,
            sex,
        };

        for (const [key, value] of Object.entries(requiredFields)) {
            if (!value || value === "") {
                return res.status(400).json({
                    success: false,
                    message: `${key} is required`,
                });
            }
        }

        // Age check
        if (age < 0 || age > 120) {
            return res.status(400).json({
                success: false,
                message: "Age must be between 0 and 120",
            });
        }


        // Sex enum validation
        const validSex = ["Male", "Female", "Other", "Prefer Not To Say"];
        if (!validSex.includes(sex)) {
            return res.status(400).json({
                success: false,
                message: "Invalid value for sex",
            });
        }


        // Mobile number validation (optional but strict)
        if (mobileNo) {
            const mobileRegex = /^(\+?\d{1,3}[- ]?)?\d{7,14}$/;
            if (!mobileRegex.test(mobileNo)) {
                return res.status(400).json({
                    success: false,
                    message: "Invalid mobile number format",
                });
            }
        }

        // ============================
        // 3. Check if patientId already exists
        // ============================
        const existingPatient = await Patient.findOne({ patientId });

        if (existingPatient) {
            return res.status(400).json({
                success: false,
                message: `Patient with patientId '${patientId}' already exists`,
            });
        }


        // ============================
        // 3. Create Patient Object
        // ============================

        const patientData = {
            patientId,
            visitDate,
            name,
            age,
            sex,
            maritalStatus,
            diet,
            address,
            mobileNo,
            referredBy,
            education,
            occupation,
            summary,
        };

        // ============================
        // 4. Save to DB (Mongoose Validation)
        // ============================
        const patient = new Patient(patientData);
        const savedPatient = await patient.save();

        return res.status(201).json({
            success: true,
            message: "Patient created successfully",
            data: savedPatient,
        });


    } catch (error) {

        // Handle Duplicate Key Error (e.g. patientId must be unique)
        if (error.code === 11000) {
            return res.status(400).json({
                success: false,
                message: `Duplicate value entered for: ${Object.keys(error.keyValue)}`
            });
        }

        // Validation Errors
        if (error.name === "ValidationError") {
            return res.status(400).json({
                success: false,
                message: "Validation Error",
                errors: error.errors,
            });
        }

        console.log(`Error From the createPatient:`, error);
        next(error); // Pass to global error handler
    }
};


//  GET All Patient (with pagination, search, sorting)
const getAllPatients = async (req, res, next) => {
    try {
        const {
            page = 1,
            limit = 10,
            search = "",
            sex,
            sortBy = "createdAt",
            order = "desc",
            dateFrom,
            dateTo,
        } = req.query;

        const numericPage = Math.max(parseInt(page) || 1, 1);
        const numericLimit = Math.min(Math.max(parseInt(limit) || 10, 1), 100);

        const filter = {};

        if (search) {
            const regex = new RegExp(search, "i");
            filter.$or = [
                { patientId: regex },
                { name: regex },
                { address: regex },
            ];
        }

        if (sex) {
            filter.sex = sex;
        }

        // Date range on createdAt
        if (dateFrom || dateTo) {
            filter.createdAt = {};
            if (dateFrom) filter.createdAt.$gte = new Date(dateFrom);
            if (dateTo) {
                const end = new Date(dateTo);
                // Include full end day
                end.setHours(23, 59, 59, 999);
                filter.createdAt.$lte = end;
            }
        }

        const sort = { [sortBy]: order === "asc" ? 1 : -1 };

        const total = await Patient.countDocuments();
        const totalFiltered = await Patient.countDocuments(filter);

        const patients = await Patient.find(filter)
            .sort(sort)
            .skip((numericPage - 1) * numericLimit)
            .limit(numericLimit);

        return res.status(200).json({
            success: true,
            data: patients,
            pagination: {
                page: numericPage,
                limit: numericLimit,
                total,
                totalFiltered,
                totalPages: Math.ceil(totalFiltered / numericLimit) || 1,
            },
        });

    } catch (error) {
        console.log("Error from getAllPatients:", error);
        next(error);
    }
};


const createComplaint = async (req, res, next) => {
    try {
        // ============================
        // 1. Extract body fields
        // ============================
        const {
            patient,       // ObjectId of Patient
            visitDate,
            // complaintNo intentionally ignored (always computed server-side)
            complaintText,
            location,
            sensation,
            onset,
            aggravation,
            amelioration,
            concomitants,
            duration,
            severity
        } = req.body;

        // ============================
        // 2. Manual Validation
        // ============================

        const requiredFields = {
            patient,
            complaintText
        };

        for (const [key, value] of Object.entries(requiredFields)) {
            if (!value || value === "") {
                return res.status(400).json({
                    success: false,
                    message: `${key} is required`,
                });
            }
        }

        // Determine complaintNo (always auto-increment server-side)
        const last = await Complaint.findOne({ patient }).sort({ complaintNo: -1 }).select("complaintNo");
        const finalComplaintNo = (last?.complaintNo || 0) + 1;

        // Validate patient ObjectId
        if (!mongoose.isValidObjectId(patient)) {
            return res.status(400).json({
                success: false,
                message: "Invalid patient ObjectId",
            });
        }

        // ============================
        // 4. Check complaintNo uniqueness per patient
        // ============================
        const duplicateComplaint = await Complaint.findOne({
            patient: patient,
            complaintNo: finalComplaintNo
        });

        if (duplicateComplaint) {
            return res.status(400).json({
                success: false,
                message: `Complaint No ${finalComplaintNo} already exists for this patient`
            });
        }

        // ============================
        // 5. Build Complaint Data
        // ============================
        const complaintData = {
            patient,
            visitDate,
            complaintNo: finalComplaintNo,
            complaintText,
            location,
            sensation,
            onset,
            aggravation,
            amelioration,
            concomitants,
            duration,
            severity
        };

        // ============================
        // 6. Save to DB
        // ============================
        const complaint = new Complaint(complaintData);
        const savedComplaint = await complaint.save();

        return res.status(201).json({
            success: true,
            message: "Complaint created successfully",
            data: savedComplaint,
        });

    } catch (error) {

        // Duplicate key error (complaintNo + patient unique index)
        if (error.code === 11000) {
            return res.status(400).json({
                success: false,
                message: "Duplicate complaint number for this patient",
            });
        }

        // Mongoose Validation Errors
        if (error.name === "ValidationError") {
            return res.status(400).json({
                success: false,
                message: "Validation Error",
                errors: error.errors,
            });
        }

        console.log("Error from createComplaint:", error);
        next(error);
    }
};



const getPatientComplaints = async (req, res, next) => {
    try {
        const { patientId } = req.params;

        // Validate ObjectId
        if (!mongoose.isValidObjectId(patientId)) {
            return res.status(400).json({
                success: false,
                message: "Invalid patient ObjectId",
            });
        }

        // Check if patient exists
        const patientExists = await Patient.findById(patientId);
        if (!patientExists) {
            return res.status(404).json({
                success: false,
                message: "Patient not found",
            });
        }

        // Fetch complaints
        const complaints = await Complaint.find({ patient: patientId })
            .sort({ complaintNo: 1 });

        return res.status(200).json({
            success: true,
            message: "Complaints fetched successfully",
            data: complaints,
        });

    } catch (error) {
        console.log("Error from getPatientComplaints:", error);
        next(error);
    }
};




// ===============================
// GET Complaints list (pagination & filters)
// ===============================
async function getComplaints(req, res, next) {
    try {
        const {
            page = 1,
            limit = 10,
            patientId,
            search = "",
            severity,
            sortBy = "createdAt",
            order = "desc",
            dateFrom,
            dateTo,
        } = req.query;

        const numericPage = Math.max(parseInt(page) || 1, 1);
        const numericLimit = Math.min(Math.max(parseInt(limit) || 10, 1), 100);

        const filter = {};
        if (patientId && mongoose.isValidObjectId(patientId)) {
            filter.patient = patientId;
        }
        if (search) {
            const regex = new RegExp(search, "i");
            filter.$or = [
                { complaintText: regex },
                { location: regex },
                { sensation: regex },
                { concomitants: regex },
            ];
        }
        if (severity) {
            filter.severity = severity;
        }

        // Date range on createdAt
        if (dateFrom || dateTo) {
            filter.createdAt = {};
            if (dateFrom) filter.createdAt.$gte = new Date(dateFrom);
            if (dateTo) {
                const end = new Date(dateTo);
                end.setHours(23, 59, 59, 999);
                filter.createdAt.$lte = end;
            }
        }

        const sort = { [sortBy]: order === "asc" ? 1 : -1 };

        const total = await Complaint.countDocuments();
        const totalFiltered = await Complaint.countDocuments(filter);

        const complaints = await Complaint.find(filter)
            .populate("patient", "patientId name")
            .sort(sort)
            .skip((numericPage - 1) * numericLimit)
            .limit(numericLimit);

        return res.status(200).json({
            success: true,
            data: complaints,
            pagination: {
                page: numericPage,
                limit: numericLimit,
                total,
                totalFiltered,
                totalPages: Math.ceil(totalFiltered / numericLimit) || 1,
            },
        });
    } catch (error) {
        console.log("Error from getComplaints:", error);
        next(error);
    }
}

// ===============================
// GET next complaint number for a patient
// ===============================
async function getNextComplaintNumber(req, res, next) {
    try {
        const { patientId } = req.params;
        if (!patientId || !mongoose.isValidObjectId(patientId)) {
            return res.status(400).json({ success: false, message: "Invalid patientId" });
        }
        const patientExists = await Patient.findById(patientId).select("_id");
        if (!patientExists) {
            return res.status(404).json({ success: false, message: "Patient not found" });
        }
        const last = await Complaint.findOne({ patient: patientId }).sort({ complaintNo: -1 }).select("complaintNo");
        const nextNo = (last?.complaintNo || 0) + 1;
        return res.status(200).json({ success: true, nextComplaintNo: nextNo });
    } catch (error) {
        console.log("Error from getNextComplaintNumber:", error);
        next(error);
    }
}

// ===============================
// Helper: validate patient existence
// ===============================
async function ensurePatientExists(patientId) {
    if (!mongoose.isValidObjectId(patientId)) {
        return { ok: false, status: 400, message: "Invalid patient ObjectId" };
    }
    const patient = await Patient.findById(patientId).select("_id");
    if (!patient) {
        return { ok: false, status: 404, message: "Patient not found" };
    }
    return { ok: true, patient };
}

// ===============================
// Get single patient by id
// ===============================
const getPatientById = async (req, res, next) => {
    try {
        const { id } = req.params;
        if (!mongoose.isValidObjectId(id)) {
            return res.status(400).json({ success: false, message: "Invalid patient id" });
        }
        const patient = await Patient.findById(id);
        if (!patient) {
            return res.status(404).json({ success: false, message: "Patient not found" });
        }
        return res.status(200).json({ success: true, data: patient });
    } catch (error) {
        console.log("Error from getPatientById:", error);
        next(error);
    }
};

// ===============================
// One-to-one modules: generic upsert pattern
// ===============================
async function upsertOneToOneModule(Model, patientId, body) {
    const update = { ...body, patient: patientId };
    const doc = await Model.findOneAndUpdate(
        { patient: patientId },
        update,
        { new: true, upsert: true, setDefaultsOnInsert: true }
    );
    return doc;
}

// Physical Generals (PhysicalCharacteristics)
const getPhysicalGenerals = async (req, res, next) => {
    try {
        const { patientId } = req.params;
        const check = await ensurePatientExists(patientId);
        if (!check.ok) {
            return res.status(check.status).json({ success: false, message: check.message });
        }
        const doc = await PhysicalCharacteristics.findOne({ patient: patientId });
        return res.status(200).json({ success: true, data: doc });
    } catch (error) {
        console.log("Error from getPhysicalGenerals:", error);
        next(error);
    }
};

const upsertPhysicalGenerals = async (req, res, next) => {
    try {
        const { patientId } = req.params;
        const check = await ensurePatientExists(patientId);
        if (!check.ok) {
            return res.status(check.status).json({ success: false, message: check.message });
        }
        const doc = await upsertOneToOneModule(PhysicalCharacteristics, patientId, req.body || {});
        return res.status(200).json({ success: true, data: doc });
    } catch (error) {
        console.log("Error from upsertPhysicalGenerals:", error);
        next(error);
    }
};

// Digestion
const getDigestion = async (req, res, next) => {
    try {
        const { patientId } = req.params;
        const check = await ensurePatientExists(patientId);
        if (!check.ok) {
            return res.status(check.status).json({ success: false, message: check.message });
        }
        const doc = await Digestion.findOne({ patient: patientId });
        return res.status(200).json({ success: true, data: doc });
    } catch (error) {
        console.log("Error from getDigestion:", error);
        next(error);
    }
};

const upsertDigestion = async (req, res, next) => {
    try {
        const { patientId } = req.params;
        const check = await ensurePatientExists(patientId);
        if (!check.ok) {
            return res.status(check.status).json({ success: false, message: check.message });
        }
        const doc = await upsertOneToOneModule(Digestion, patientId, req.body || {});
        return res.status(200).json({ success: true, data: doc });
    } catch (error) {
        console.log("Error from upsertDigestion:", error);
        next(error);
    }
};

// Elimination
const getElimination = async (req, res, next) => {
    try {
        const { patientId } = req.params;
        const check = await ensurePatientExists(patientId);
        if (!check.ok) {
            return res.status(check.status).json({ success: false, message: check.message });
        }
        const doc = await Elimination.findOne({ patient: patientId });
        return res.status(200).json({ success: true, data: doc });
    } catch (error) {
        console.log("Error from getElimination:", error);
        next(error);
    }
};

const upsertElimination = async (req, res, next) => {
    try {
        const { patientId } = req.params;
        const check = await ensurePatientExists(patientId);
        if (!check.ok) {
            return res.status(check.status).json({ success: false, message: check.message });
        }
        const doc = await upsertOneToOneModule(Elimination, patientId, req.body || {});
        return res.status(200).json({ success: true, data: doc });
    } catch (error) {
        console.log("Error from upsertElimination:", error);
        next(error);
    }
};

// Sleep & Dreams
const getSleepDreams = async (req, res, next) => {
    try {
        const { patientId } = req.params;
        const check = await ensurePatientExists(patientId);
        if (!check.ok) {
            return res.status(check.status).json({ success: false, message: check.message });
        }
        const doc = await SleepDreams.findOne({ patient: patientId });
        return res.status(200).json({ success: true, data: doc });
    } catch (error) {
        console.log("Error from getSleepDreams:", error);
        next(error);
    }
};

const upsertSleepDreams = async (req, res, next) => {
    try {
        const { patientId } = req.params;
        const check = await ensurePatientExists(patientId);
        if (!check.ok) {
            return res.status(check.status).json({ success: false, message: check.message });
        }
        const doc = await upsertOneToOneModule(SleepDreams, patientId, req.body || {});
        return res.status(200).json({ success: true, data: doc });
    } catch (error) {
        console.log("Error from upsertSleepDreams:", error);
        next(error);
    }
};

// Sexual Function
const getSexualFunction = async (req, res, next) => {
    try {
        const { patientId } = req.params;
        const check = await ensurePatientExists(patientId);
        if (!check.ok) {
            return res.status(check.status).json({ success: false, message: check.message });
        }
        const doc = await SexualFunction.findOne({ patient: patientId });
        return res.status(200).json({ success: true, data: doc });
    } catch (error) {
        console.log("Error from getSexualFunction:", error);
        next(error);
    }
};

const upsertSexualFunction = async (req, res, next) => {
    try {
        const { patientId } = req.params;
        const check = await ensurePatientExists(patientId);
        if (!check.ok) {
            return res.status(check.status).json({ success: false, message: check.message });
        }
        const doc = await upsertOneToOneModule(SexualFunction, patientId, req.body || {});
        return res.status(200).json({ success: true, data: doc });
    } catch (error) {
        console.log("Error from upsertSexualFunction:", error);
        next(error);
    }
};

// Menstrual History
const getMenstrualHistory = async (req, res, next) => {
    try {
        const { patientId } = req.params;
        const check = await ensurePatientExists(patientId);
        if (!check.ok) {
            return res.status(check.status).json({ success: false, message: check.message });
        }
        const doc = await MenstrualHistory.findOne({ patient: patientId });
        return res.status(200).json({ success: true, data: doc });
    } catch (error) {
        console.log("Error from getMenstrualHistory:", error);
        next(error);
    }
};

const upsertMenstrualHistory = async (req, res, next) => {
    try {
        const { patientId } = req.params;
        const check = await ensurePatientExists(patientId);
        if (!check.ok) {
            return res.status(check.status).json({ success: false, message: check.message });
        }
        const doc = await upsertOneToOneModule(MenstrualHistory, patientId, req.body || {});
        return res.status(200).json({ success: true, data: doc });
    } catch (error) {
        console.log("Error from upsertMenstrualHistory:", error);
        next(error);
    }
};

// History (Past/Family/Personal)
const getHistory = async (req, res, next) => {
    try {
        const { patientId } = req.params;
        const check = await ensurePatientExists(patientId);
        if (!check.ok) {
            return res.status(check.status).json({ success: false, message: check.message });
        }
        const doc = await History.findOne({ patient: patientId });
        return res.status(200).json({ success: true, data: doc });
    } catch (error) {
        console.log("Error from getHistory:", error);
        next(error);
    }
};

const upsertHistory = async (req, res, next) => {
    try {
        const { patientId } = req.params;
        const check = await ensurePatientExists(patientId);
        if (!check.ok) {
            return res.status(check.status).json({ success: false, message: check.message });
        }
        const doc = await upsertOneToOneModule(History, patientId, req.body || {});
        return res.status(200).json({ success: true, data: doc });
    } catch (error) {
        console.log("Error from upsertHistory:", error);
        next(error);
    }
};

// Thermal Modalities
const getThermalModalities = async (req, res, next) => {
    try {
        const { patientId } = req.params;
        const check = await ensurePatientExists(patientId);
        if (!check.ok) {
            return res.status(check.status).json({ success: false, message: check.message });
        }
        const doc = await ThermalModalities.findOne({ patient: patientId });
        return res.status(200).json({ success: true, data: doc });
    } catch (error) {
        console.log("Error from getThermalModalities:", error);
        next(error);
    }
};

const upsertThermalModalities = async (req, res, next) => {
    try {
        const { patientId } = req.params;
        const check = await ensurePatientExists(patientId);
        if (!check.ok) {
            return res.status(check.status).json({ success: false, message: check.message });
        }
        const doc = await upsertOneToOneModule(ThermalModalities, patientId, req.body || {});
        return res.status(200).json({ success: true, data: doc });
    } catch (error) {
        console.log("Error from upsertThermalModalities:", error);
        next(error);
    }
};

// Mental Generals
const getMentalGenerals = async (req, res, next) => {
    try {
        const { patientId } = req.params;
        const check = await ensurePatientExists(patientId);
        if (!check.ok) {
            return res.status(check.status).json({ success: false, message: check.message });
        }
        const doc = await MentalGenerals.findOne({ patient: patientId });
        return res.status(200).json({ success: true, data: doc });
    } catch (error) {
        console.log("Error from getMentalGenerals:", error);
        next(error);
    }
};

const upsertMentalGenerals = async (req, res, next) => {
    try {
        const { patientId } = req.params;
        const check = await ensurePatientExists(patientId);
        if (!check.ok) {
            return res.status(check.status).json({ success: false, message: check.message });
        }
        const doc = await upsertOneToOneModule(MentalGenerals, patientId, req.body || {});
        return res.status(200).json({ success: true, data: doc });
    } catch (error) {
        console.log("Error from upsertMentalGenerals:", error);
        next(error);
    }
};

// Investigations (multi per patient)
const getInvestigations = async (req, res, next) => {
    try {
        const { patientId } = req.params;
        const check = await ensurePatientExists(patientId);
        if (!check.ok) {
            return res.status(check.status).json({ success: false, message: check.message });
        }
        const list = await Investigation.find({ patient: patientId }).sort({ date: -1 });
        return res.status(200).json({ success: true, data: list });
    } catch (error) {
        console.log("Error from getInvestigations:", error);
        next(error);
    }
};

const createInvestigation = async (req, res, next) => {
    try {
        const { patientId } = req.params;
        const check = await ensurePatientExists(patientId);
        if (!check.ok) {
            return res.status(check.status).json({ success: false, message: check.message });
        }
        const payload = { ...req.body, patient: patientId };
        const inv = new Investigation(payload);
        const saved = await inv.save();
        return res.status(201).json({ success: true, data: saved });
    } catch (error) {
        console.log("Error from createInvestigation:", error);
        next(error);
    }
};

const updateInvestigation = async (req, res, next) => {
    try {
        const { id } = req.params;
        if (!mongoose.isValidObjectId(id)) {
            return res.status(400).json({ success: false, message: "Invalid investigation id" });
        }
        const updated = await Investigation.findByIdAndUpdate(id, req.body || {}, { new: true });
        if (!updated) {
            return res.status(404).json({ success: false, message: "Investigation not found" });
        }
        return res.status(200).json({ success: true, data: updated });
    } catch (error) {
        console.log("Error from updateInvestigation:", error);
        next(error);
    }
};

const deleteInvestigation = async (req, res, next) => {
    try {
        const { id } = req.params;
        if (!mongoose.isValidObjectId(id)) {
            return res.status(400).json({ success: false, message: "Invalid investigation id" });
        }
        const deleted = await Investigation.findByIdAndDelete(id);
        if (!deleted) {
            return res.status(404).json({ success: false, message: "Investigation not found" });
        }
        return res.status(200).json({ success: true, message: "Investigation deleted" });
    } catch (error) {
        console.log("Error from deleteInvestigation:", error);
        next(error);
    }
};

// Follow-ups (multi per patient)
const getFollowUps = async (req, res, next) => {
    try {
        const { patientId } = req.params;
        const check = await ensurePatientExists(patientId);
        if (!check.ok) {
            return res.status(check.status).json({ success: false, message: check.message });
        }
        const list = await FollowUp.find({ patient: patientId }).sort({ date: -1 });
        return res.status(200).json({ success: true, data: list });
    } catch (error) {
        console.log("Error from getFollowUps:", error);
        next(error);
    }
};

const createFollowUp = async (req, res, next) => {
    try {
        const { patientId } = req.params;
        const check = await ensurePatientExists(patientId);
        if (!check.ok) {
            return res.status(check.status).json({ success: false, message: check.message });
        }
        const payload = { ...req.body, patient: patientId };
        const follow = new FollowUp(payload);
        const saved = await follow.save();
        return res.status(201).json({ success: true, data: saved });
    } catch (error) {
        console.log("Error from createFollowUp:", error);
        next(error);
    }
};

const updateFollowUp = async (req, res, next) => {
    try {
        const { id } = req.params;
        if (!mongoose.isValidObjectId(id)) {
            return res.status(400).json({ success: false, message: "Invalid follow-up id" });
        }
        const updated = await FollowUp.findByIdAndUpdate(id, req.body || {}, { new: true });
        if (!updated) {
            return res.status(404).json({ success: false, message: "Follow-up not found" });
        }
        return res.status(200).json({ success: true, data: updated });
    } catch (error) {
        console.log("Error from updateFollowUp:", error);
        next(error);
    }
};

const deleteFollowUp = async (req, res, next) => {
    try {
        const { id } = req.params;
        if (!mongoose.isValidObjectId(id)) {
            return res.status(400).json({ success: false, message: "Invalid follow-up id" });
        }
        const deleted = await FollowUp.findByIdAndDelete(id);
        if (!deleted) {
            return res.status(404).json({ success: false, message: "Follow-up not found" });
        }
        return res.status(200).json({ success: true, message: "Follow-up deleted" });
    } catch (error) {
        console.log("Error from deleteFollowUp:", error);
        next(error);
    }
};



module.exports = {
    createPatient,
    getAllPatients,
    getPatientById,
    createComplaint,
    getPatientComplaints,
    getComplaints,
    getNextComplaintNumber,
    getPhysicalGenerals,
    upsertPhysicalGenerals,
    getDigestion,
    upsertDigestion,
    getElimination,
    upsertElimination,
    getSleepDreams,
    upsertSleepDreams,
    getSexualFunction,
    upsertSexualFunction,
    getMenstrualHistory,
    upsertMenstrualHistory,
    getHistory,
    upsertHistory,
    getThermalModalities,
    upsertThermalModalities,
    getMentalGenerals,
    upsertMentalGenerals,
    getInvestigations,
    createInvestigation,
    updateInvestigation,
    deleteInvestigation,
    getFollowUps,
    createFollowUp,
    updateFollowUp,
    deleteFollowUp,
}