
import express from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import rateLimit from "express-rate-limit";
import User from "../models/User.js";
import authMiddleware from "../middleware/authMiddleware.js";
import {
  isRequestBody,
  isValidEmail,
  isValidPassword,
  normalizeEmail,
} from "../utils/validation.js";
import sendApiError from "../utils/sendApiError.js";
const router = express.Router();

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: "Too many authentication attempts. Try again later." },
});

// REGISTER
router.post("/register", authLimiter, async (req, res) => {
  try {
    if (!isRequestBody(req.body)) {
      return res.status(400).json({ message: "Please provide valid request data" });
    }

    const { name, email, password } = req.body;

    if (typeof name !== "string" || !name.trim() || !isValidEmail(email)) {
      return res.status(400).json({
        message: "Please provide a valid name and email address",
      });
    }

    if (!isValidPassword(password)) {
      return res.status(400).json({
        message: "Password must be at least 6 characters and no more than 72 bytes",
      });
    }

    if (name.trim().length > 80) {
      return res.status(400).json({ message: "Name must be 80 characters or fewer" });
    }

    const normalizedEmail = normalizeEmail(email);
    const existingUser = await User.findOne({ email: normalizedEmail });
    if (existingUser) {
      return res.status(409).json({
        message: "Email already registered",
      });
    }

    const hashPassword = await bcrypt.hash(password, 10);

    const newUser = await User.create({
      name: name.trim(),
      email: normalizedEmail,
      password: hashPassword,
    });

    return res.status(201).json({
      message: "Registration successfully",
      user: {
        id: newUser._id,
        name: newUser.name,
        email: newUser.email,
      },
    });
  } catch (error) {
    return sendApiError(res, error, "Registration");
  }
});

// LOGIN
router.post("/login", authLimiter, async (req, res) => {
  try {
    if (!isRequestBody(req.body)) {
      return res.status(400).json({ message: "Please provide valid request data" });
    }

    const { email, password } = req.body;

    if (!isValidEmail(email) || typeof password !== "string" || !password) {
      return res.status(400).json({
        message: "Please enter a valid email address and password",
      });
    }

    const user = await User.findOne({ email: normalizeEmail(email) });

    if (!user) {
      return res.status(401).json({
        message: "Invalid email or password",
      });
    }

    const isPasswordCorrect = await bcrypt.compare(
      password,
      user.password
    );

    if (!isPasswordCorrect) {
      return res.status(401).json({
        message: "Invalid email or password",
      });
    }

    if (!process.env.JWT_SECRET) {
      console.error("Login failed (JWT_SECRET is not configured)");
      return res.status(503).json({ message: "Authentication is temporarily unavailable" });
    }

    const token = jwt.sign(
      { userId: user._id },
      process.env.JWT_SECRET,
      { expiresIn: "7d", algorithm: "HS256" }
    );

    res.status(200).json({
      message: "Login successfully",
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
      },
    });
  } catch (error) {
    return sendApiError(res, error, "Login");
  }
});

// FORGOT PASSWORD
router.post("/forgot-password", authLimiter, async (req, res) => {
  try {
    if (!isRequestBody(req.body)) {
      return res.status(400).json({ message: "Please provide valid request data" });
    }

    const { email } = req.body;

    if (!isValidEmail(email)) {
      return res.status(400).json({
        message: "Please enter a valid email address",
      });
    }

    const user = await User.findOne({ email: normalizeEmail(email) });

    const genericResponse = {
      message: "If the account exists, password reset instructions will be sent.",
    };

    if (!user || process.env.NODE_ENV === "production") {
      return res.status(200).json({
        ...genericResponse,
      });
    }

    // Generate a secure random token
    const resetToken = crypto.randomBytes(32).toString("hex");

    // Store only the hashed token in MongoDB
    user.resetPasswordToken = crypto
      .createHash("sha256")
      .update(resetToken)
      .digest("hex");

    // Token expires after 15 minutes
    user.resetPasswordExpires = Date.now() + 15 * 60 * 1000;

    await user.save();

    const response = { ...genericResponse };

    const frontendUrl = (process.env.FRONTEND_URL || "http://localhost:5173")
      .replace(/\/+$/, "");
    response.resetLink = `${frontendUrl}/reset-password/${resetToken}`;

    return res.status(200).json(response);
  } catch (error) {
    return sendApiError(res, error, "Forgot password");
  }
});

// RESET PASSWORD
router.post("/reset-password", authLimiter, async (req, res) => {
  try {
    if (!isRequestBody(req.body)) {
      return res.status(400).json({ message: "Please provide valid request data" });
    }

    const { token, password } = req.body;

    if (
      typeof token !== "string" ||
      !/^[a-f\d]{64}$/i.test(token) ||
      !isValidPassword(password)
    ) {
      return res.status(400).json({
        message: "A valid reset token and password are required",
      });
    }

    // Hash the received token
    const hashedToken = crypto
      .createHash("sha256")
      .update(token)
      .digest("hex");

    // Find user with valid, unexpired token
    const user = await User.findOne({
      resetPasswordToken: hashedToken,
      resetPasswordExpires: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).json({
        message: "Reset link is invalid or expired",
      });
    }

    // Hash and update the new password
    user.password = await bcrypt.hash(password, 10);

    // Clear reset token so it cannot be reused
    user.resetPasswordToken = null;
    user.resetPasswordExpires = null;

    await user.save();

    return res.status(200).json({
      message: "Password reset successfully. Please login.",
    });
  } catch (error) {
    return sendApiError(res, error, "Reset password");
  }
});



// GET USER PROFILE
router.get("/profile", authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.userId).select("-password");

    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    res.status(200).json({
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
      },
    });
  } catch (error) {
    return sendApiError(res, error, "Get profile");
  }
});

// UPDATE USER PROFILE
router.put("/profile", authMiddleware, async (req, res) => {
  try {
    if (!isRequestBody(req.body)) {
      return res.status(400).json({ message: "Please provide valid request data" });
    }

    const allowedFields = new Set(["name", "currentPassword", "newPassword"]);
    if (Object.keys(req.body).some((field) => !allowedFields.has(field))) {
      return res.status(400).json({ message: "Request contains unsupported fields" });
    }

    const { name, currentPassword, newPassword } = req.body;
    const hasName = Object.hasOwn(req.body, "name");
    const hasCurrentPassword = Object.hasOwn(req.body, "currentPassword");
    const hasNewPassword = Object.hasOwn(req.body, "newPassword");

    if (!hasName && !hasCurrentPassword && !hasNewPassword) {
      return res.status(400).json({ message: "Provide at least one profile change" });
    }

    if (
      hasName &&
      (typeof name !== "string" || !name.trim() || name.trim().length > 80)
    ) {
      return res.status(400).json({
        message: "Name must be between 1 and 80 characters",
      });
    }

    if (
      hasCurrentPassword !== hasNewPassword ||
      (hasCurrentPassword && typeof currentPassword !== "string") ||
      (hasNewPassword && !isValidPassword(newPassword))
    ) {
      return res.status(400).json({
        message: "To change your password, provide your current password and a valid new password",
      });
    }

    const user = await User.findById(req.userId);

    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    // Update name
    if (hasName) {
      user.name = name.trim();
    }

    // Change password
    if (hasNewPassword) {
      const isPasswordCorrect = await bcrypt.compare(
        currentPassword,
        user.password
      );

      if (!isPasswordCorrect) {
        return res.status(400).json({
          message: "Current password is incorrect",
        });
      }

      user.password = await bcrypt.hash(newPassword, 10);
    }

    await user.save();

    return res.status(200).json({
      message: "Profile updated successfully",
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
      },
    });
  } catch (error) {
    return sendApiError(res, error, "Update profile");
  }
});


export default router;
