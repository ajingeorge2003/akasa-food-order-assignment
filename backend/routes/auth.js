import express from "express";
import asyncHandler from "express-async-handler";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../models/User.js";

const router = express.Router();

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: "7d" });
};

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

export default router;
