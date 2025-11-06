import express from "express";
import asyncHandler from "express-async-handler";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import nodemailer from "nodemailer";
import User from "../models/User.js";

const router = express.Router();

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: "7d" });
};

// Initialize nodemailer transporter
const transporter = nodemailer.createTransport({
  service: process.env.EMAIL_SERVICE || "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD
  },
  connectionTimeout: 10000, // 10 seconds
  socketTimeout: 10000, // 10 seconds
  pool: {
    maxConnections: 5,
    maxMessages: 100,
    rateDelta: 4000,
    rateLimit: 14
  }
});

// POST /api/auth/register
router.post(
  "/register",
  asyncHandler(async (req, res) => {
    const { email, password } = req.body;
    if (!email || !password) {
      res.status(400);
      throw new Error("Email and password are required");
    }

    const existing = await User.findOne({ email });
    if (existing) {
      res.status(400);
      throw new Error("User already exists");
    }

    const salt = await bcrypt.genSalt(10);
    const hashed = await bcrypt.hash(password, salt);

    const user = await User.create({ email, password: hashed });
    res.status(201).json({
      id: user._id,
      email: user.email,
      token: generateToken(user._id)
    });
  })
);

// POST /api/auth/login
router.post(
  "/login",
  asyncHandler(async (req, res) => {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) {
      res.status(401);
      throw new Error("Invalid credentials");
    }
    const ok = await bcrypt.compare(password, user.password);
    if (!ok) {
      res.status(401);
      throw new Error("Invalid credentials");
    }
    res.json({ id: user._id, email: user.email, token: generateToken(user._id) });
  })
);

// POST /api/auth/forgot-password
router.post(
  "/forgot-password",
  asyncHandler(async (req, res) => {
    const { email } = req.body;
    if (!email) {
      res.status(400);
      throw new Error("Email is required");
    }

    const user = await User.findOne({ email });
    if (!user) {
      // For security, don't reveal if email exists
      res.json({ message: "If user exists, a reset link has been sent" });
      return;
    }

    // Generate reset token
    const resetToken = crypto.randomBytes(32).toString("hex");
    const resetTokenHash = crypto.createHash("sha256").update(resetToken).digest("hex");
    const resetExpires = new Date(Date.now() + 1 * 60 * 60 * 1000); // 1 hour

    user.resetPasswordToken = resetTokenHash;
    user.resetPasswordExpires = resetExpires;
    await user.save();

    // Send email
    const resetUrl = `${process.env.FRONTEND_URL || "http://localhost:5173"}/reset-password/${resetToken}`;
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: "Password Reset Link",
      html: `
        <h2>Password Reset Request</h2>
        <p>You requested a password reset. Click the link below to reset your password:</p>
        <a href="${resetUrl}" style="background-color: #667eea; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block;">Reset Password</a>
        <p>This link expires in 1 hour.</p>
        <p>If you didn't request this, please ignore this email.</p>
      `
    };

    try {
      const emailPromise = transporter.sendMail(mailOptions);
      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject(new Error("Email send timeout")), 8000)
      );
      
      await Promise.race([emailPromise, timeoutPromise]);
      res.json({ message: "Password reset link sent to your email" });
    } catch (err) {
      console.error("Email sending failed:", err.message);
      res.status(500);
      throw new Error("Failed to send reset email");
    }
  })
);

// POST /api/auth/reset-password
router.post(
  "/reset-password",
  asyncHandler(async (req, res) => {
    const { token, newPassword } = req.body;
    if (!token || !newPassword) {
      res.status(400);
      throw new Error("Token and new password are required");
    }

    if (newPassword.length < 6) {
      res.status(400);
      throw new Error("Password must be at least 6 characters");
    }

    const resetTokenHash = crypto.createHash("sha256").update(token).digest("hex");
    const user = await User.findOne({
      resetPasswordToken: resetTokenHash,
      resetPasswordExpires: { $gt: new Date() }
    });

    if (!user) {
      res.status(400);
      throw new Error("Invalid or expired reset token");
    }

    // Hash new password
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(newPassword, salt);
    user.resetPasswordToken = null;
    user.resetPasswordExpires = null;
    await user.save();

    res.json({ message: "Password reset successful", token: generateToken(user._id) });
  })
);

export default router;
