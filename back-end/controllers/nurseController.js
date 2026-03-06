const Nurse = require("../models/Nurse");
const bcrypt = require("bcryptjs");
const multer = require("multer");
const path = require("path");
const fs = require("fs");

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

// ── Register Nurse ─────────────────────────────────────────
exports.postNurse = async (req, res) => {
  try {
    console.log("\n========== postNurse ==========");

    const {
      fullName,
      email,
      phone,
      department,
      shiftTiming,
      experience,
      password,
    } = req.body;

    if (
      !fullName ||
      !email ||
      !phone ||
      !department ||
      !shiftTiming ||
      !password
    ) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const normalizedEmail = email.toLowerCase().trim();

    const existing = await Nurse.findOne({ email: normalizedEmail });

    if (existing) {
      return res
        .status(400)
        .json({ message: "A nurse with this email already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const photoFile = req.files?.["photo"]?.[0] || null;
    const docFiles = req.files?.["documents"] || [];

    const newNurse = new Nurse({
      fullName,
      email: normalizedEmail,
      phone,
      department,
      shiftTiming,
      experience,
      password: hashedPassword,

      photo: photoFile
        ? {
            filename: photoFile.filename,
            path: `uploads/photos/${photoFile.filename}`,
          }
        : null,

      documents: docFiles.map((f) => ({
        filename: f.originalname,
        path: `uploads/documents/${f.filename}`,
      })),
    });

    const saved = await newNurse.save();

    const result = saved.toObject();
    delete result.password;

    res.status(201).json({
      message: "Nurse registered successfully",
      nurse: result,
    });
  } catch (err) {
    if (err.code === 11000) {
      return res
        .status(400)
        .json({ message: "A nurse with this email already exists" });
    }

    console.error("postNurse error:", err);
    res.status(500).json({ message: err.message });
  }
};

// ── Get Nurses ─────────────────────────────────────────
exports.getNurses = async (req, res) => {
  try {
    const nurses = await Nurse.find().select("-password");
    res.json(nurses);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
