const Doctor = require("../models/Doctor");
const Nurse = require("../models/Nurse");
const Patient = require("../models/Patient");
const Admin = require("../models/Admin");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const ROLE_MODELS = {
  doctor: Doctor,
  nurse: Nurse,
  patient: Patient,
  admin: Admin,
};

// ✅ LOGIN
exports.commonLogin = async (req, res) => {
  try {
    const { email, password, role } = req.body;

    if (!email || !password || !role) {
      return res.status(400).json({
        message: "Email, password, and role are required",
      });
    }

    const roleLower = role.toLowerCase().trim();
    const normalizedEmail = email.toLowerCase().trim();

    // 🔥 ✅ ADMIN STATIC LOGIN (NO DB)
    if (roleLower === "admin") {
      const ADMIN_EMAIL = "admin@gmail.com";
      const ADMIN_PASSWORD = "admin123";

      if (
        normalizedEmail !== ADMIN_EMAIL ||
        password !== ADMIN_PASSWORD
      ) {
        return res.status(401).json({
          message: "Invalid admin credentials",
        });
      }

      const token = jwt.sign(
        {
          id: "admin-id",
          email: ADMIN_EMAIL,
          role: "admin",
        },
        process.env.JWT_SECRET || "your_jwt_secret_key",
        { expiresIn: "7d" }
      );

      return res.status(200).json({
        message: "Admin login successful",
        token,
        role: "admin",
        user: {
          fullName: "Super Admin",
          email: ADMIN_EMAIL,
          role: "admin",
        },
      });
    }

    // ✅ NORMAL USERS (doctor, nurse, patient)
    const Model = ROLE_MODELS[roleLower];

    if (!Model) {
      return res.status(400).json({
        message: "Invalid role. Must be doctor, nurse, patient, or admin",
      });
    }

    const userWithPassword = await Model.findOne({
      email: normalizedEmail,
    }).select("+password +isVerified");

    if (!userWithPassword) {
      return res.status(401).json({
        message: "Invalid email or password",
      });
    }

    const isMatch = await bcrypt.compare(
      password,
      userWithPassword.password
    );

    if (!isMatch) {
      return res.status(401).json({
        message: "Invalid email or password",
      });
    }

    // ✅ ONLY doctor & nurse need approval
    if (roleLower === "doctor" || roleLower === "nurse") {
      if (!userWithPassword.isVerified) {
        return res.status(403).json({
          message:
            "Your account is not approved yet. Please wait for admin approval.",
        });
      }
    }

    const token = jwt.sign(
      {
        id: userWithPassword._id,
        email: userWithPassword.email,
        role: roleLower,
      },
      process.env.JWT_SECRET || "your_jwt_secret_key",
      { expiresIn: "7d" }
    );

    const safeUser = await Model.findById(
      userWithPassword._id
    ).select("-password");

    res.status(200).json({
      message:
        roleLower.charAt(0).toUpperCase() + roleLower.slice(1) +
        " login successful",
      token,
      role: roleLower,
      user: safeUser,
    });
  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({ message: "Internal server error" });
  }
};

// ✅ VERIFY USER
exports.verifyUser = async (req, res) => {
  try {
    const { role, id } = req.params;

    const Model = ROLE_MODELS[role];

    if (!Model) {
      return res.status(400).json({ message: "Invalid role" });
    }

    const user = await Model.findByIdAndUpdate(
      id,
      {
        isVerified: true,
        verifiedAt: new Date(),
      },
      { new: true }
    ).select("-password");

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json({
      message: `${role} verified successfully`,
      user,
    });
  } catch (err) {
    console.error("Verify error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// ✅ DELETE USER
exports.deleteUser = async (req, res) => {
  try {
    const { role, id } = req.params;

    const Model = ROLE_MODELS[role];

    if (!Model) {
      return res.status(400).json({ message: "Invalid role" });
    }

    const user = await Model.findByIdAndDelete(id);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json({
      message: `${role} deleted successfully`,
    });
  } catch (err) {
    console.error("Delete error:", err);
    res.status(500).json({ message: "Server error" });
  }
};