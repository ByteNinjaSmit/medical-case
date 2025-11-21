require("dotenv").config();
const User = require("../models/user-model");
const Patient = require("../models/patient-model");
const Complaint = require("../models/complaint-model");
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




module.exports = {
    createPatient,
    getAllPatients,
    createComplaint,
    getPatientComplaints,
    getComplaints,
    getNextComplaintNumber
}