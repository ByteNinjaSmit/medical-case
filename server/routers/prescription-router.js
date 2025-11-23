const express = require("express");
const router = express.Router();
const prescriptionController = require("../controllers/prescription-controller");
const auth = require('../middlewares/auth-middleware');

// Apply auth middleware to all routes below
router.use(auth);

router.post("/", prescriptionController.createPrescription);
router.get("/:patientId", prescriptionController.getPrescriptionsByPatient);
router.put("/:id", prescriptionController.updatePrescription);
router.delete("/:id", prescriptionController.deletePrescription);

module.exports = router;
