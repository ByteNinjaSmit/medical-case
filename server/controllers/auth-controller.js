require("dotenv").config();
const User = require("../models/user-model");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const mongoose = require('mongoose');

const ACCESS_COOKIE_OPTIONS = {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 15 * 60 * 1000,
};

const REFRESH_COOKIE_OPTIONS = {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 7 * 24 * 60 * 60 * 1000,
};

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
            // Generate tokens
            const accessToken = await userExist.generateToken();
            const refreshToken = await userExist.generateRefreshToken();

            res.cookie("authToken", accessToken, ACCESS_COOKIE_OPTIONS);
            res.cookie("refreshToken", refreshToken, REFRESH_COOKIE_OPTIONS);

            return res.status(200).json({
                message: "Login Successful",
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
    let token = req.cookies && req.cookies.authToken;

    if (!token) {
      const auth = req.header("Authorization");
      if (!auth) return res.status(401).json({ message: "Unauthorized" });
      token = auth.replace("Bearer", "").trim();
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);
    const { userID } = decoded;

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

const logout = async (req, res, next) => {
  try {
    res.clearCookie("authToken", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
    });

    res.clearCookie("refreshToken", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
    });

    return res.status(200).json({ message: "Logout successful" });
  } catch (error) {
    next(error);
  }
};

const refreshAccessToken = async (req, res, next) => {
  try {
    const token = req.cookies && req.cookies.refreshToken;
    if (!token) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const decoded = jwt.verify(
      token,
      process.env.JWT_REFRESH_SECRET_KEY || process.env.JWT_SECRET_KEY
    );

    const { userID } = decoded;
    const user = await User.findById(userID);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const accessToken = await user.generateToken();
    res.cookie("authToken", accessToken, ACCESS_COOKIE_OPTIONS);

    return res.status(200).json({ message: "Token refreshed" });
  } catch (error) {
    console.error("Error refreshing access token:", error);
    return res.status(401).json({ message: "Invalid or expired refresh token" });
  }
};

module.exports = {
    doctorRegister,
    doctorLogin,
    getCurrentUser,
    logout,
    refreshAccessToken,
}
