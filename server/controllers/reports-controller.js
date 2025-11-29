const Patient = require("../models/patient-model");
const Complaint = require("../models/complaint-model");
const Prescription = require("../models/prescription-model");
const FollowUp = require("../models/followup-model");
const Investigation = require("../models/investigation-model");
const PhysicalCharacteristics = require("../models/physical_characteristics-model");
const Digestion = require("../models/digestion-model");
const Elimination = require("../models/elimination-model");
const SleepDreams = require("../models/sleep_dreams-model");
const History = require("../models/history-model");

// ============================
// DASHBOARD STATISTICS
// ============================

/**
 * Get comprehensive dashboard statistics
 * GET /api/reports/dashboard
 */
const getDashboardStats = async (req, res) => {
    try {
        const now = new Date();
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        const startOfYear = new Date(now.getFullYear(), 0, 1);
        const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

        // Parallel queries for better performance
        const [
            totalPatients,
            newPatientsThisMonth,
            totalComplaints,
            totalPrescriptions,
            prescriptionsThisMonth,
            pendingFollowUps,
            genderDistribution,
            ageDistribution,
            recentPatients,
            recentPrescriptions,
        ] = await Promise.all([
            // Total patients
            Patient.countDocuments(),

            // New patients this month
            Patient.countDocuments({ createdAt: { $gte: startOfMonth } }),

            // Total complaints
            Complaint.countDocuments(),

            // Total prescriptions
            Prescription.countDocuments(),

            // Prescriptions this month
            Prescription.countDocuments({ createdAt: { $gte: startOfMonth } }),

            // Pending follow-ups (next visit in future)
            FollowUp.countDocuments({
                nextVisit: { $gte: now, $lte: new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000) }
            }),

            // Gender distribution
            Patient.aggregate([
                { $group: { _id: "$sex", count: { $sum: 1 } } },
                { $sort: { count: -1 } }
            ]),

            // Age distribution
            Patient.aggregate([
                {
                    $bucket: {
                        groupBy: "$age",
                        boundaries: [0, 18, 30, 45, 60, 120],
                        default: "Unknown",
                        output: { count: { $sum: 1 } }
                    }
                }
            ]),

            // Recent patients (last 5)
            Patient.find()
                .sort({ createdAt: -1 })
                .limit(5)
                .select("patientId name age sex createdAt"),

            // Recent prescriptions (last 5)
            Prescription.find()
                .sort({ createdAt: -1 })
                .limit(5)
                .populate("patientId", "name patientId")
                .select("medicines reason createdAt"),
        ]);

        // Calculate growth percentage
        const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
        const lastMonthEnd = startOfMonth;
        const patientsLastMonth = await Patient.countDocuments({
            createdAt: { $gte: lastMonthStart, $lt: lastMonthEnd }
        });
        const patientGrowth = patientsLastMonth > 0
            ? ((newPatientsThisMonth - patientsLastMonth) / patientsLastMonth * 100).toFixed(1)
            : 100;

        // Format age distribution
        const ageGroups = ageDistribution.map(group => ({
            range: group._id === "Unknown" ? "Unknown" :
                group._id === 0 ? "0-17" :
                    group._id === 18 ? "18-29" :
                        group._id === 30 ? "30-44" :
                            group._id === 45 ? "45-59" : "60+",
            count: group.count
        }));

        res.status(200).json({
            success: true,
            data: {
                overview: {
                    totalPatients,
                    newPatientsThisMonth,
                    patientGrowth: parseFloat(patientGrowth),
                    totalComplaints,
                    totalPrescriptions,
                    prescriptionsThisMonth,
                    pendingFollowUps,
                },
                demographics: {
                    gender: genderDistribution,
                    ageGroups,
                },
                recentActivity: {
                    patients: recentPatients,
                    prescriptions: recentPrescriptions,
                }
            }
        });
    } catch (error) {
        console.error("Dashboard stats error:", error);
        res.status(500).json({
            success: false,
            message: "Failed to fetch dashboard statistics",
            error: error.message
        });
    }
};

// ============================
// PATIENT ANALYTICS
// ============================

/**
 * Get detailed patient analytics
 * GET /api/reports/patients
 */
const getPatientAnalytics = async (req, res) => {
    try {
        const { startDate, endDate, sex, ageMin, ageMax } = req.query;

        // Build filter
        const filter = {};
        if (startDate || endDate) {
            filter.createdAt = {};
            if (startDate) filter.createdAt.$gte = new Date(startDate);
            if (endDate) filter.createdAt.$lte = new Date(endDate);
        }
        if (sex) filter.sex = sex;
        if (ageMin || ageMax) {
            filter.age = {};
            if (ageMin) filter.age.$gte = parseInt(ageMin);
            if (ageMax) filter.age.$lte = parseInt(ageMax);
        }

        const [
            totalCount,
            genderBreakdown,
            ageBreakdown,
            maritalStatusBreakdown,
            registrationTrend,
        ] = await Promise.all([
            Patient.countDocuments(filter),

            Patient.aggregate([
                { $match: filter },
                { $group: { _id: "$sex", count: { $sum: 1 } } }
            ]),

            Patient.aggregate([
                { $match: filter },
                {
                    $bucket: {
                        groupBy: "$age",
                        boundaries: [0, 18, 30, 45, 60, 120],
                        default: "Unknown",
                        output: { count: { $sum: 1 } }
                    }
                }
            ]),

            Patient.aggregate([
                { $match: filter },
                { $group: { _id: "$maritalStatus", count: { $sum: 1 } } }
            ]),

            Patient.aggregate([
                { $match: filter },
                {
                    $group: {
                        _id: {
                            year: { $year: "$createdAt" },
                            month: { $month: "$createdAt" }
                        },
                        count: { $sum: 1 }
                    }
                },
                { $sort: { "_id.year": 1, "_id.month": 1 } },
                { $limit: 12 }
            ])
        ]);

        res.status(200).json({
            success: true,
            data: {
                totalCount,
                demographics: {
                    gender: genderBreakdown,
                    age: ageBreakdown,
                    maritalStatus: maritalStatusBreakdown,
                },
                trends: {
                    registrationByMonth: registrationTrend.map(item => ({
                        month: `${item._id.year}-${String(item._id.month).padStart(2, '0')}`,
                        count: item.count
                    }))
                }
            }
        });
    } catch (error) {
        console.error("Patient analytics error:", error);
        res.status(500).json({
            success: false,
            message: "Failed to fetch patient analytics",
            error: error.message
        });
    }
};

// ============================
// COMPLAINT ANALYTICS
// ============================

/**
 * Get complaint analytics
 * GET /api/reports/complaints
 */
const getComplaintAnalytics = async (req, res) => {
    try {
        const { startDate, endDate } = req.query;

        const filter = {};
        if (startDate || endDate) {
            filter.createdAt = {};
            if (startDate) filter.createdAt.$gte = new Date(startDate);
            if (endDate) filter.createdAt.$lte = new Date(endDate);
        }

        const [
            totalComplaints,
            complaintsByType,
            complaintsByLocation,
            complaintsBySeverity,
            complaintTrend,
        ] = await Promise.all([
            Complaint.countDocuments(filter),

            Complaint.aggregate([
                { $match: filter },
                { $unwind: "$complaints" },
                { $group: { _id: "$complaints.type", count: { $sum: 1 } } },
                { $sort: { count: -1 } },
                { $limit: 10 }
            ]),

            Complaint.aggregate([
                { $match: filter },
                { $unwind: "$complaints" },
                { $group: { _id: "$complaints.location", count: { $sum: 1 } } },
                { $match: { _id: { $ne: null, $ne: "" } } },
                { $sort: { count: -1 } },
                { $limit: 10 }
            ]),

            Complaint.aggregate([
                { $match: filter },
                { $unwind: "$complaints" },
                { $group: { _id: "$complaints.severity", count: { $sum: 1 } } },
                { $match: { _id: { $ne: null } } }
            ]),

            Complaint.aggregate([
                { $match: filter },
                {
                    $group: {
                        _id: {
                            year: { $year: "$createdAt" },
                            month: { $month: "$createdAt" }
                        },
                        count: { $sum: 1 }
                    }
                },
                { $sort: { "_id.year": 1, "_id.month": 1 } },
                { $limit: 12 }
            ])
        ]);

        res.status(200).json({
            success: true,
            data: {
                totalComplaints,
                breakdown: {
                    byType: complaintsByType,
                    byLocation: complaintsByLocation,
                    bySeverity: complaintsBySeverity,
                },
                trends: {
                    complaintsByMonth: complaintTrend.map(item => ({
                        month: `${item._id.year}-${String(item._id.month).padStart(2, '0')}`,
                        count: item.count
                    }))
                }
            }
        });
    } catch (error) {
        console.error("Complaint analytics error:", error);
        res.status(500).json({
            success: false,
            message: "Failed to fetch complaint analytics",
            error: error.message
        });
    }
};

// ============================
// PRESCRIPTION ANALYTICS
// ============================

/**
 * Get prescription analytics
 * GET /api/reports/prescriptions
 */
const getPrescriptionAnalytics = async (req, res) => {
    try {
        const { startDate, endDate } = req.query;

        const filter = {};
        if (startDate || endDate) {
            filter.createdAt = {};
            if (startDate) filter.createdAt.$gte = new Date(startDate);
            if (endDate) filter.createdAt.$lte = new Date(endDate);
        }

        const [
            totalPrescriptions,
            mostPrescribedMedicines,
            prescriptionTrend,
            averageMedicinesPerPrescription,
        ] = await Promise.all([
            Prescription.countDocuments(filter),

            Prescription.aggregate([
                { $match: filter },
                { $unwind: "$medicines" },
                { $group: { _id: "$medicines.name", count: { $sum: 1 } } },
                { $match: { _id: { $ne: null, $ne: "" } } },
                { $sort: { count: -1 } },
                { $limit: 15 }
            ]),

            Prescription.aggregate([
                { $match: filter },
                {
                    $group: {
                        _id: {
                            year: { $year: "$createdAt" },
                            month: { $month: "$createdAt" }
                        },
                        count: { $sum: 1 }
                    }
                },
                { $sort: { "_id.year": 1, "_id.month": 1 } },
                { $limit: 12 }
            ]),

            Prescription.aggregate([
                { $match: filter },
                {
                    $project: {
                        medicineCount: { $size: { $ifNull: ["$medicines", []] } }
                    }
                },
                {
                    $group: {
                        _id: null,
                        avgCount: { $avg: "$medicineCount" }
                    }
                }
            ])
        ]);

        res.status(200).json({
            success: true,
            data: {
                totalPrescriptions,
                averageMedicinesPerPrescription: averageMedicinesPerPrescription[0]?.avgCount || 0,
                topMedicines: mostPrescribedMedicines,
                trends: {
                    prescriptionsByMonth: prescriptionTrend.map(item => ({
                        month: `${item._id.year}-${String(item._id.month).padStart(2, '0')}`,
                        count: item.count
                    }))
                }
            }
        });
    } catch (error) {
        console.error("Prescription analytics error:", error);
        res.status(500).json({
            success: false,
            message: "Failed to fetch prescription analytics",
            error: error.message
        });
    }
};

// ============================
// FOLLOW-UP ANALYTICS
// ============================

/**
 * Get follow-up analytics
 * GET /api/reports/followups
 */
const getFollowUpAnalytics = async (req, res) => {
    try {
        const { startDate, endDate } = req.query;

        const filter = {};
        if (startDate || endDate) {
            filter.createdAt = {};
            if (startDate) filter.createdAt.$gte = new Date(startDate);
            if (endDate) filter.createdAt.$lte = new Date(endDate);
        }

        const now = new Date();

        const [
            totalFollowUps,
            upcomingFollowUps,
            overdueFollowUps,
            patientStateDistribution,
            followUpTrend,
        ] = await Promise.all([
            FollowUp.countDocuments(filter),

            FollowUp.countDocuments({
                ...filter,
                nextVisit: { $gte: now }
            }),

            FollowUp.countDocuments({
                ...filter,
                nextVisit: { $lt: now }
            }),

            FollowUp.aggregate([
                { $match: filter },
                { $group: { _id: "$patientState", count: { $sum: 1 } } },
                { $match: { _id: { $ne: null, $ne: "" } } }
            ]),

            FollowUp.aggregate([
                { $match: filter },
                {
                    $group: {
                        _id: {
                            year: { $year: "$createdAt" },
                            month: { $month: "$createdAt" }
                        },
                        count: { $sum: 1 }
                    }
                },
                { $sort: { "_id.year": 1, "_id.month": 1 } },
                { $limit: 12 }
            ])
        ]);

        res.status(200).json({
            success: true,
            data: {
                totalFollowUps,
                upcomingFollowUps,
                overdueFollowUps,
                patientStateDistribution,
                trends: {
                    followUpsByMonth: followUpTrend.map(item => ({
                        month: `${item._id.year}-${String(item._id.month).padStart(2, '0')}`,
                        count: item.count
                    }))
                }
            }
        });
    } catch (error) {
        console.error("Follow-up analytics error:", error);
        res.status(500).json({
            success: false,
            message: "Failed to fetch follow-up analytics",
            error: error.message
        });
    }
};

// ============================
// INVESTIGATION ANALYTICS
// ============================

/**
 * Get investigation analytics
 * GET /api/reports/investigations
 */
const getInvestigationAnalytics = async (req, res) => {
    try {
        const { startDate, endDate } = req.query;

        const filter = {};
        if (startDate || endDate) {
            filter.createdAt = {};
            if (startDate) filter.createdAt.$gte = new Date(startDate);
            if (endDate) filter.createdAt.$lte = new Date(endDate);
        }

        const [
            totalInvestigations,
            investigationsByType,
            investigationTrend,
        ] = await Promise.all([
            Investigation.countDocuments(filter),

            Investigation.aggregate([
                { $match: filter },
                { $group: { _id: "$type", count: { $sum: 1 } } },
                { $match: { _id: { $ne: null, $ne: "" } } },
                { $sort: { count: -1 } }
            ]),

            Investigation.aggregate([
                { $match: filter },
                {
                    $group: {
                        _id: {
                            year: { $year: "$createdAt" },
                            month: { $month: "$createdAt" }
                        },
                        count: { $sum: 1 }
                    }
                },
                { $sort: { "_id.year": 1, "_id.month": 1 } },
                { $limit: 12 }
            ])
        ]);

        res.status(200).json({
            success: true,
            data: {
                totalInvestigations,
                breakdown: {
                    byType: investigationsByType,
                },
                trends: {
                    investigationsByMonth: investigationTrend.map(item => ({
                        month: `${item._id.year}-${String(item._id.month).padStart(2, '0')}`,
                        count: item.count
                    }))
                }
            }
        });
    } catch (error) {
        console.error("Investigation analytics error:", error);
        res.status(500).json({
            success: false,
            message: "Failed to fetch investigation analytics",
            error: error.message
        });
    }
};

module.exports = {
    getDashboardStats,
    getPatientAnalytics,
    getComplaintAnalytics,
    getPrescriptionAnalytics,
    getFollowUpAnalytics,
    getInvestigationAnalytics,
};
