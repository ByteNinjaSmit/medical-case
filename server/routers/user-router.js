const express = require("express");
const router = express.Router();

const userControllers = require('../controllers/user-controller');
const auth = require('../middlewares/auth-middleware');

// Apply auth middleware to all routes below
router.use(auth);

router.route("/new-patient").post(userControllers.createPatient);
router.route("/patients").get(userControllers.getAllPatients);
router.route("/new-complaint").post(userControllers.createComplaint);
router.route("/complaint/:patientId").get(userControllers.getPatientComplaints);

// Complaints list and helpers
router.route("/complaints").get(userControllers.getComplaints);
router.route("/complaints/next-no/:patientId").get(userControllers.getNextComplaintNumber);

module.exports = router;