import express from "express";
import cors from "cors";
import mongoose from "mongoose";
import dotenv from "dotenv";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import session from "express-session";
import User from "./models/User.js"; // Import User Model

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json()); // Middleware to parse JSON

// Session middleware
app.use(
  session({
    secret: "your_secret_key",
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false },
  })
);

// MongoDB Connection
mongoose.connect(process.env.MONGO_URI, {
}).then(() => console.log("MongoDB Connected"))
  .catch((err) => console.error("MongoDB Connection Error:", err));

// Serve static files (for the dashboard)
app.use(express.static('public'));

// Register Route
app.post("/api/auth/register", async (req, res) => {
  try {
    const { name, email, password } = req.body;
    
    console.log("Received data:", req.body);
    
    let user = await User.findOne({ email });
    if (user) return res.status(400).json({ message: "User already exists" });
    
    const hashedPassword = await bcrypt.hash(password, 10);
    user = new User({ name, email, password: hashedPassword });
    
    await user.save();
    console.log("User registered:", user);
    
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: "1h" });
    
    res.status(201).json({ token, message: "User registered successfully" });
  } catch (err) {
    console.error("Error in /api/auth/register:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

// LOGIN ROUTE
app.post("/api/auth/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: "Invalid credentials" });
    
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ message: "Invalid credentials" });
    
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: "1h" });
    
    res.json({ token, user: { id: user._id, name: user.name, email: user.email } });
  } catch (err) {
    console.error("Error in /api/auth/login:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

// Auth middleware
const auth = (req, res, next) => {
  try {
    const token = req.header('x-auth-token');
    if (!token) return res.status(401).json({ message: 'No token, authorization denied' });

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    res.status(401).json({ message: 'Token is not valid' });
  }
};

// PROTECTED ROUTE - Get all users (for dashboard)
app.get("/api/users", auth, async (req, res) => {
  try {
    const users = await User.find().select('-password'); // Exclude password
    res.json(users);
  } catch (err) {
    console.error("Error fetching users:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

// PROTECTED ROUTE - Get single user by ID
app.get("/api/users/:id", auth, async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password');
    
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    
    res.json(user);
  } catch (err) {
    console.error("Error fetching user:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

// PROTECTED ROUTE - Get current user
app.get("/api/auth/user", auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    res.json(user);
  } catch (err) {
    console.error("Error fetching current user:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

// Server Listening
const PORT = 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));