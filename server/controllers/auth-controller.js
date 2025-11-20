require("dotenv").config();
const User = require("../models/user-model");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const mongoose = require('mongoose');

const doctorRegister = async (req, res,next) => {
    try {
        // const { name, username, email, password } = req.body;
        const name = process.env.DOCTOR_NAME;
        const username = process.env.DOCTOR_USERNAME;
        const email = process.env.DOCTOR_EMAIL;
        const password = process.env.DOCTOR_PASSWORD;


        const userExist = await User.findOne({ username });
        // For No Duplicate
        if (userExist) {
            return res.status(400).json({ message: "User already exists" });
        }

        // Creating Account
        const userCreated = await User.create({
            name,
            username,
            email,
            password,
            isDoctor:true,
        });

        return res.status(200).json({
            message: "Registration Successful of Doctor",
            data: userCreated,
        });
    } catch (error) {
        next(error);
    }
}



// *--------------------------
// Doctor Login Logic
// *--------------------------
const doctorLogin = async (req, res, next) => {
    try {
        const { username, password } = req.body;

        // Check if the user exists by username OR email
        const userExist = await User.findOne({
            $or: [
                { username: username },
                { email: username }
            ]
        });
        if (!userExist) {
            return res.status(400).json({ message: "Invalid Credentials" });
        }

        // Validate password
        const user = await userExist.comparePassword(password);
        if (user) {
            // Generate token
            const token = await userExist.generateToken();

            return res.status(200).json({
                message: "Login Successful",
                token,
                userId: userExist._id.toString(),
            });
        } else {
            return res.status(401).json({ message: "Invalid Username Or Password" });
        }
    } catch (error) {
        next(error);
    }
};



// ---------------------------
// GET Current Logged User detail
// ---------------------------

const getCurrentUser = async (req, res, next) => {
  try {
    const auth = req.header("Authorization");
    if (!auth) return res.status(401).json({ message: "Unauthorized" });
    const jwtToken = auth.replace("Bearer", "").trim();
    const decoded = jwt.verify(jwtToken, process.env.JWT_SECRET_KEY);
    const { userID } = decoded;

    // Fetch user
    const userData = await User.findById(userID).select("-password");

    if (!userData) {
      return res.status(404).json({ message: "User not found" });
    }

    return res.status(200).json({
      user: userData,
    });
  } catch (error) {
    console.error("Error fetching current user:", error);
    next(error);
  }
};

module.exports = {
    doctorRegister,
    doctorLogin,
    getCurrentUser,
}
