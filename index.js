// ipo-api/index.js (Backend Server)

const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors({ origin: "http://localhost:5173", credentials: true }));
app.use(express.json());

// MongoDB connection
mongoose
  .connect("mongodb://127.0.0.1:27017/ipoDB")
  .then(() => console.log("✅ Connected to MongoDB"))
  .catch((err) => console.error("❌ MongoDB connection error:", err));

// ===================== Schemas & Models =====================
const userSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true }, // hashed password
});

const User = mongoose.model("User", userSchema);

const ipoSchema = new mongoose.Schema({
  id: { type: Number, unique: true },
  company: String,
  priceBand: String,
  openDate: String,
  closeDate: String,
});

const IPO = mongoose.model("IPO", ipoSchema);

const applicationSchema = new mongoose.Schema({
  email: String,
  ipoId: Number,
  amount: Number,
});

const Application = mongoose.model("Application", applicationSchema);

// ===================== Seed IPO Data =====================
const defaultIPOs = [
  {
    id: 1,
    company: "Bluestock Technologies",
    priceBand: "100-120",
    openDate: "2025-08-01",
    closeDate: "2025-08-10",
  },
  {
    id: 2,
    company: "Fintech Innovations",
    priceBand: "250-300",
    openDate: "2025-09-01",
    closeDate: "2025-09-12",
  },
];

async function seedIPOData() {
  const count = await IPO.countDocuments({});
  if (count === 0) {
    await IPO.insertMany(defaultIPOs);
    console.log("🌱 Default IPOs added to database");
  }
}
seedIPOData();

// ===================== Routes =====================

// Root route
app.get("/", (req, res) => {
  res.send("🚀 IPO API backend is running!");
});

// Get all IPOs
app.get("/ipos", async (req, res) => {
  try {
    const ipos = await IPO.find({}, { _id: 0, __v: 0 });
    res.json(ipos);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch IPOs" });
  }
});

// Register user
app.post("/register", async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password)
    return res.status(400).json({ error: "Email and password are required" });

  try {
    const existingUser = await User.findOne({ email });
    if (existingUser)
      return res.status(400).json({ error: "User already exists" });

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new User({ email, password: hashedPassword });
    await newUser.save();

    res.status(201).json({ message: "✅ User registered successfully" });
  } catch (err) {
    res.status(500).json({ error: "Registration failed" });
  }
});

// Login user
app.post("/login", async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password)
    return res.status(400).json({ error: "Email and password are required" });

  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ error: "User not found" });

    const passwordMatch = await bcrypt.compare(password, user.password);
    if (!passwordMatch)
      return res.status(401).json({ error: "Invalid password" });

    const token = jwt.sign({ email: user.email }, process.env.JWT_SECRET, {
      expiresIn: "1h",
    });

    res.json({ message: "Login successful", token });
  } catch (err) {
    res.status(500).json({ error: "Login failed" });
  }
});

// Middleware for JWT
function authenticateToken(req, res, next) {
  const token = req.headers["authorization"]?.split(" ")[1];
  if (!token) return res.status(401).json({ error: "Access token missing" });

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) return res.status(403).json({ error: "Invalid or expired token" });
    req.user = user;
    next();
  });
}

// Apply for IPO
app.post("/apply", authenticateToken, async (req, res) => {
  const { ipoId, amount } = req.body;
  const email = req.user.email;

  if (!ipoId || !amount)
    return res.status(400).json({ error: "ipoId and amount are required" });

  try {
    const ipo = await IPO.findOne({ id: Number(ipoId) });
    if (!ipo) return res.status(400).json({ error: "IPO not found" });

    const existingApplication = await Application.findOne({ email, ipoId });
    if (existingApplication)
      return res.status(400).json({ error: "Already applied for this IPO" });

    const application = new Application({ email, ipoId, amount });
    await application.save();

    res.status(201).json({ message: "✅ Application submitted successfully" });
  } catch (err) {
    res.status(500).json({ error: "Application failed" });
  }
});

// Get user applications
app.get("/user/applications", authenticateToken, async (req, res) => {
  try {
    const applications = await Application.find(
      { email: req.user.email },
      { _id: 0, __v: 0 }
    );
    res.json(applications);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch applications" });
  }
});

// ===================== Start Server =====================
app.listen(PORT, () => {
  console.log(`✅ Server running at http://localhost:${PORT}`);
});
