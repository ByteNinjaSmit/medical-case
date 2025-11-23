const express = require("express");
const router = express.Router();

const authControllers = require("../controllers/auth-controller");



router.route("/register").post(authControllers.doctorRegister);   
router.route("/login").post(authControllers.doctorLogin);   
router.get("/current", authControllers.getCurrentUser);
router.post("/logout", authControllers.logout);
router.post("/refresh", authControllers.refreshAccessToken);


module.exports = router;