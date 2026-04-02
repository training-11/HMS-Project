const Patient = require("../models/Patient");
const bcrypt = require("bcryptjs");
const multer = require("multer");
const path = require("path");
const fs = require("fs");

const PHONE_REGEX = /^\d{10}$/;
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// ── Absolute paths ─────────────────────────────────────────
const UPLOAD_ROOT = path.resolve(__dirname, "..", "uploads");
const PHOTO_DIR = path.resolve(UPLOAD_ROOT, "photos");
const DOCS_DIR = path.resolve(UPLOAD_ROOT, "documents");

// Create folders if they don't exist
[UPLOAD_ROOT, PHOTO_DIR, DOCS_DIR].forEach((dir) => {
  fs.mkdirSync(dir, { recursive: true });
});

console.log("✅ Upload dirs ready:");
console.log("   photos    →", PHOTO_DIR);
console.log("   documents →", DOCS_DIR);

// ── Multer Storage ─────────────────────────────────────────
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const dir = file.fieldname === "photo" ? PHOTO_DIR : DOCS_DIR;
    cb(null, dir);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname) || ".jpg";
    const name = `${file.fieldname}-${Date.now()}${ext}`;
    cb(null, name);
  },
});

const upload = multer({ storage });

// Upload fields
exports.uploadMiddleware = upload.fields([
  { name: "photo", maxCount: 1 },
  { name: "documents", maxCount: 10 },
]);

// ── Register Patient ─────────────────────────────────────────
exports.registerPatient = async (req, res) => {
  try {
    console.log("\n========== registerPatient ==========");

    const {
      fullName,
      email,
      phone,
      dob,
      bloodGroup,
      medicalHistory,
      password,
    } = req.body;

    if (
      !fullName ||
      !email ||
      !phone ||
      !dob ||
      !bloodGroup ||
      !medicalHistory ||
      !password
    ) {
      return res.status(400).json({ message: "All fields are required" });
    }

    if (!EMAIL_REGEX.test(email.trim())) {
      return res.status(400).json({ message: "Please enter a valid email address" });
    }

    if (!PHONE_REGEX.test(String(phone).trim())) {
      return res.status(400).json({ message: "Phone number must contain exactly 10 digits" });
    }

    const normalizedEmail = email.toLowerCase().trim();

    const existing = await Patient.findOne({ email: normalizedEmail });

    if (existing) {
      return res
        .status(400)
        .json({ message: "A patient with this email already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const photoFile = req.files?.["photo"]?.[0] || null;
    const docFiles = req.files?.["documents"] || [];

    const newPatient = new Patient({
      fullName,
      email: normalizedEmail,
      phone,
      dob,
      bloodGroup,
      medicalHistory,
      password: hashedPassword,

      photo: photoFile
        ? {
            filename: photoFile.filename,
            path: `uploads/photos/${photoFile.filename}`,
          }
        : null,

      documents: docFiles.map((f) => ({
        filename: f.filename,
        originalName: f.originalname,
        path: `uploads/documents/${f.filename}`,
      })),
    });

    const saved = await newPatient.save();

    const result = saved.toObject();
    delete result.password;

    res.status(201).json({
      message: "Patient registered successfully",
      patient: result,
    });
  } catch (err) {
    if (err.code === 11000) {
      return res
        .status(400)
        .json({ message: "A patient with this email already exists" });
    }

    console.error("registerPatient error:", err);
    res.status(500).json({ message: err.message });
  }
};

// ── Get Patients ─────────────────────────────────────────
exports.getPatients = async (req, res) => {
  try {
    const patients = await Patient.find().select("-password");
    res.json(patients);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
