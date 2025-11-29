const express = require("express");
const router = express.Router();

const reportsController = require('../controllers/reports-controller');
const auth = require('../middlewares/auth-middleware');

// Apply auth middleware to all routes
router.use(auth);

// Dashboard statistics
router.route("/dashboard").get(reportsController.getDashboardStats);

// Detailed analytics
router.route("/patients").get(reportsController.getPatientAnalytics);
router.route("/complaints").get(reportsController.getComplaintAnalytics);
router.route("/prescriptions").get(reportsController.getPrescriptionAnalytics);
router.route("/followups").get(reportsController.getFollowUpAnalytics);
router.route("/investigations").get(reportsController.getInvestigationAnalytics);

// Patient-specific detailed report
router.route("/patient/:patientId").get(reportsController.getPatientReport);

module.exports = router;
