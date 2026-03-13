const Admin = require("../models/Admin");
const bcrypt = require("bcryptjs");
const multer = require("multer");
const path = require("path");
const fs = require("fs");

// ── Upload folders ─────────────────────────────────────
const UPLOAD_ROOT = path.resolve(__dirname, "..", "uploads");
const PHOTO_DIR = path.resolve(UPLOAD_ROOT, "photos");
const DOCS_DIR = path.resolve(UPLOAD_ROOT, "documents");

[UPLOAD_ROOT, PHOTO_DIR, DOCS_DIR].forEach((dir) => {
  fs.mkdirSync(dir, { recursive: true });
});
console.log("Admin Controller Loaded");

console.log("✅ Upload dirs ready:");
console.log("   photos    →", PHOTO_DIR);
console.log("   documents →", DOCS_DIR);

// ── Multer Storage ─────────────────────────────────────
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

exports.uploadMiddleware = upload.fields([
  { name: "photo", maxCount: 1 },
  { name: "documents", maxCount: 10 },
]);

// ── Register Admin ─────────────────────────────────────
exports.postAdmin = async (req, res) => {
  try {
    const {
      fullName,
      email,
      phone,
      employeeId,
      adminRole,
      accessLevel,
      department,
      password,
    } = req.body;

    if (
      !fullName ||
      !email ||
      !phone ||
      !employeeId ||
      !adminRole ||
      !accessLevel ||
      !department ||
      !password
    ) {
      return res.status(400).json({
        message: "All fields are required",
      });
    }

    const normalizedEmail = email.toLowerCase().trim();

    const existingAdmin = await Admin.findOne({ email: normalizedEmail });

    if (existingAdmin) {
      return res.status(400).json({
        message: "Admin with this email already exists",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const photoFile = req.files?.["photo"]?.[0] || null;
    const docFiles = req.files?.["documents"] || [];

    const newAdmin = new Admin({
      fullName,
      email: normalizedEmail,
      phone,
      employeeId,
      adminRole,
      accessLevel,
      department,
      password: hashedPassword,

      photo: photoFile
        ? {
            filename: photoFile.filename,
            path: `uploads/photos/${photoFile.filename}`,
          }
        : null,

      documents: docFiles.map((doc) => ({
        filename: doc.originalname,
        path: `uploads/documents/${doc.filename}`,
      })),
    });

    const savedAdmin = await newAdmin.save();

    const result = savedAdmin.toObject();
    delete result.password;

    res.status(201).json({
      message: "Admin registered successfully",
      admin: result,
    });
  } catch (err) {
    if (err.code === 11000) {
      return res.status(400).json({
        message: "Admin with this email already exists",
      });
    }

    console.error("postAdmin error:", err);

    res.status(500).json({
      message: err.message,
    });
  }
};

// ── Get All Admins ─────────────────────────────────────
exports.getAdmins = async (req, res) => {
  try {
    const admins = await Admin.find().select("-password");

    res.json(admins);
  } catch (err) {
    res.status(500).json({
      message: err.message,
    });
  }
};
