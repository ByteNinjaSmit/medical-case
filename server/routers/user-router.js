const express = require("express");
const router = express.Router();

const userControllers = require('../controllers/user-controller');
const auth = require('../middlewares/auth-middleware');

// Apply auth middleware to all routes below
router.use(auth);

router.route("/new-patient").post(userControllers.createPatient);
router.route("/patients").get(userControllers.getAllPatients);
router.route("/patients/:id").get(userControllers.getPatientById);
router.route("/new-complaint").post(userControllers.createComplaint);
router.route("/complaint/:patientId").get(userControllers.getPatientComplaints);

// Complaints list and helpers
router.route("/complaints").get(userControllers.getComplaints);
router.route("/complaints/next-no/:patientId").get(userControllers.getNextComplaintNumber);

// Case record modules (one-to-one per patient)
router
  .route("/patients/:patientId/physical-generals")
  .get(userControllers.getPhysicalGenerals)
  .put(userControllers.upsertPhysicalGenerals);

router
  .route("/patients/:patientId/digestion")
  .get(userControllers.getDigestion)
  .put(userControllers.upsertDigestion);

router
  .route("/patients/:patientId/elimination")
  .get(userControllers.getElimination)
  .put(userControllers.upsertElimination);

router
  .route("/patients/:patientId/sleep-dreams")
  .get(userControllers.getSleepDreams)
  .put(userControllers.upsertSleepDreams);

router
  .route("/patients/:patientId/sexual-function")
  .get(userControllers.getSexualFunction)
  .put(userControllers.upsertSexualFunction);

router
  .route("/patients/:patientId/menstrual-history")
  .get(userControllers.getMenstrualHistory)
  .put(userControllers.upsertMenstrualHistory);

router
  .route("/patients/:patientId/history")
  .get(userControllers.getHistory)
  .put(userControllers.upsertHistory);

router
  .route("/patients/:patientId/thermal-modalities")
  .get(userControllers.getThermalModalities)
  .put(userControllers.upsertThermalModalities);

router
  .route("/patients/:patientId/mental-generals")
  .get(userControllers.getMentalGenerals)
  .put(userControllers.upsertMentalGenerals);

// Investigations (many per patient)
router
  .route("/patients/:patientId/investigations")
  .get(userControllers.getInvestigations)
  .post(userControllers.createInvestigation);

router
  .route("/investigations/:id")
  .put(userControllers.updateInvestigation)
  .delete(userControllers.deleteInvestigation);

// Follow-ups (many per patient)
router
  .route("/patients/:patientId/followups")
  .get(userControllers.getFollowUps)
  .post(userControllers.createFollowUp);

router
  .route("/followups/:id")
  .put(userControllers.updateFollowUp)
  .delete(userControllers.deleteFollowUp);

module.exports = router;