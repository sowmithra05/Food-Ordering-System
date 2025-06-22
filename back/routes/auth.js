import express from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import User from "../models/User.js";
import Feedback from "../models/Feedback.js";

dotenv.config();
const router = express.Router();

// Middleware to verify JWT token
const verifyToken = (req, res, next) => {
    const token = req.header("Authorization")?.split(" ")[1];

    if (!token) return res.status(401).json({ msg: "No token, authorization denied" });

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded.user;
        next();
    } catch (err) {
        res.status(401).json({ msg: "Invalid token" });
    }
};

// ✅ REGISTER Route
router.post("/register", async (req, res) => {
    try {
        const { name, email, password } = req.body;

        let user = await User.findOne({ email });
        if (user) return res.status(400).json({ msg: "User already exists" });

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        user = new User({ name, email, password: hashedPassword });
        await user.save();

        const payload = { user: { id: user.id } };
        const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: "1h" });

        res.status(201).json({ token, msg: "User registered successfully" });
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ msg: "Server error" });
    }
});

// ✅ LOGIN Route
router.post("/login", async (req, res) => {
    try {
        const { email, password } = req.body;
        let user = await User.findOne({ email });
        if (!user) return res.status(400).json({ msg: "Invalid email or password" });

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return res.status(400).json({ msg: "Invalid email or password" });

        const payload = { user: { id: user.id } };
        const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: "1h" });

        res.json({ token, msg: "Login successful", user: { name: user.name, email: user.email } });
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ msg: "Server error" });
    }
});

// ✅ SUBMIT Feedback (Protected Route)
router.post("/feedback", verifyToken, async (req, res) => {
    const { message } = req.body;

    if (!message || message.trim() === "") {
        return res.status(400).json({ msg: "Feedback message cannot be empty" });
    }

    try {
        const feedback = new Feedback({ userId: req.user.id, message });
        await feedback.save();

        res.status(201).json({ msg: "Feedback submitted successfully" });
    } catch (err) {
        res.status(500).json({ msg: "Server error" });
    }
});

// ✅ GET ALL Feedback (Admin Access)
router.get("/feedback", verifyToken, async (req, res) => {
    try {
        const feedbacks = await Feedback.find().populate("userId", "name email");
        res.status(200).json(feedbacks);
    } catch (err) {
        res.status(500).json({ msg: "Server error" });
    }
});

// ✅ GET USER PROFILE (Protected Route)
router.get("/profile", verifyToken, async (req, res) => {
    try {
        const user = await User.findById(req.user.id).select("-password");
        res.json(user);
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ msg: "Server error" });
    }
});

export default router;
