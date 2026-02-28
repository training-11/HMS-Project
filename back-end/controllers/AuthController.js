const Doctor = require("../models/Doctor");
const Nurse = require("../models/Nurse");
const Patient = require("../models/Patient"); 
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");


const ROLE_MODELS = {
  doctor: Doctor,
  nurse: Nurse,
  patient: Patient,
};

exports.commonLogin = async (req, res) => {
  try {
    const { email, password, role } = req.body;

    
    if (!email || !password || !role) {
      return res.status(400).json({ message: "Email, password, and role are required" });
    }

    const roleLower = role.toLowerCase();
    const Model = ROLE_MODELS[roleLower];

    if (!Model) {
      return res.status(400).json({ message: "Invalid role. Must be doctor, nurse, or patient" });
    }

    // ── 2. Find user by email ────────────────────────────────────────────────
    const user = await Model.findOne({ email: email.toLowerCase() });
    if (!user) {
      
      return res.status(401).json({ message: "Invalid email or password" });
    }

    // ── 3. Compare password ──────────────────────────────────────────────────
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    // ── 4. Sign JWT ──────────────────────────────────────────────────────────
    const token = jwt.sign(
      { id: user._id, email: user.email, role: roleLower },
      process.env.JWT_SECRET || "your_jwt_secret_key",
      { expiresIn: "7d" }
    );

    // ── 5. Build safe user payload (no password) ─────────────────────────────
    const userObj = user.toObject();
    delete userObj.password;

    res.status(200).json({
      message: `${role.charAt(0).toUpperCase() + role.slice(1)} login successful`,
      token,
      role: roleLower,
      user: userObj,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};