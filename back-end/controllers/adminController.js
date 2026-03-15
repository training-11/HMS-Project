const Admin  = require("../models/Admin");
const bcrypt = require("bcryptjs");
const multer = require("multer");
const path   = require("path");
const fs     = require("fs");

// ── Lazy-load models (handles any capitalisation) ─────────────────────────
const loadModel = (...names) => {
  for (const n of names) {
    try { return require(`../models/${n}`); } catch (_) {}
  }
  console.warn(`⚠  Could not load any of: ${names.join(", ")}`);
  return null;
};

const Doctor  = loadModel("Doctor",  "doctor");
const Nurse   = loadModel("Nurse",   "nurse");
const Patient = loadModel("Patient", "patient");

console.log("✅ adminController loaded");
console.log("   Doctor  model:", Doctor  ? "✓" : "✗ NOT FOUND");
console.log("   Nurse   model:", Nurse   ? "✓" : "✗ NOT FOUND");
console.log("   Patient model:", Patient ? "✓" : "✗ NOT FOUND");
console.log("   Admin   model: ✓");

// ── Upload folders ────────────────────────────────────────────────────────
const UPLOAD_ROOT = path.resolve(__dirname, "..", "uploads");
const PHOTO_DIR   = path.resolve(UPLOAD_ROOT, "photos");
const DOCS_DIR    = path.resolve(UPLOAD_ROOT, "documents");
[UPLOAD_ROOT, PHOTO_DIR, DOCS_DIR].forEach((d) => fs.mkdirSync(d, { recursive: true }));

// ── Multer ────────────────────────────────────────────────────────────────
const upload = multer({
  storage: multer.diskStorage({
    destination: (req, file, cb) => cb(null, file.fieldname === "photo" ? PHOTO_DIR : DOCS_DIR),
    filename:    (req, file, cb) => cb(null, `${file.fieldname}-${Date.now()}${path.extname(file.originalname) || ".jpg"}`),
  }),
});
exports.uploadMiddleware = upload.fields([
  { name: "photo",     maxCount: 1  },
  { name: "documents", maxCount: 10 },
]);

// ── Model map ─────────────────────────────────────────────────────────────
const MODEL_MAP = { doctor: Doctor, nurse: Nurse, patient: Patient, admin: Admin };

// ── Register Admin ────────────────────────────────────────────────────────
exports.postAdmin = async (req, res) => {
  try {
    const { fullName, email, phone, employeeId, adminRole, accessLevel, department, password } = req.body;
    if (!fullName || !email || !phone || !employeeId || !adminRole || !accessLevel || !department || !password)
      return res.status(400).json({ message: "All fields are required" });

    const normalizedEmail = email.toLowerCase().trim();
    if (await Admin.findOne({ email: normalizedEmail }))
      return res.status(400).json({ message: "Admin with this email already exists" });

    const photoFile = req.files?.["photo"]?.[0] || null;
    const docFiles  = req.files?.["documents"]  || [];

    const saved = await new Admin({
      fullName, email: normalizedEmail, phone, employeeId,
      adminRole, accessLevel, department,
      password: await bcrypt.hash(password, 10),
      photo: photoFile ? { filename: photoFile.filename, path: `uploads/photos/${photoFile.filename}` } : null,
      documents: docFiles.map((d) => ({ filename: d.originalname, path: `uploads/documents/${d.filename}` })),
    }).save();

    const result = saved.toObject();
    delete result.password;
    res.status(201).json({ message: "Admin registered successfully", admin: result });
  } catch (err) {
    if (err.code === 11000) return res.status(400).json({ message: "Admin with this email already exists" });
    console.error("postAdmin:", err);
    res.status(500).json({ message: err.message });
  }
};

// ── Get Admins ────────────────────────────────────────────────────────────
exports.getAdmins = async (req, res) => {
  try {
    res.json(await Admin.find().select("-password"));
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ── Verify User  PATCH /api/verifyUser/:role/:id ──────────────────────────
exports.verifyUser = async (req, res) => {
  const { role, id } = req.params;
  console.log(`PATCH verifyUser  role=${role}  id=${id}`);

  const Model = MODEL_MAP[role];
  if (!Model) return res.status(400).json({ message: `Unknown role: "${role}"` });

  try {
    const user = await Model.findByIdAndUpdate(
      id,
      { $set: { isVerified: true, verifiedAt: new Date() } },
      { new: true, strict: false }
    ).select("-password");

    if (!user) return res.status(404).json({ message: "User not found" });

    console.log(`✅ Verified ${role}: ${user.fullName}`);
    res.json({ message: "Verified successfully", user });
  } catch (err) {
    console.error("verifyUser:", err);
    res.status(500).json({ message: err.message });
  }
};

// ── Delete User  DELETE /api/deleteUser/:role/:id ─────────────────────────
exports.deleteUser = async (req, res) => {
  const { role, id } = req.params;
  console.log(`DELETE deleteUser  role=${role}  id=${id}`);

  const Model = MODEL_MAP[role];
  if (!Model) return res.status(400).json({ message: `Unknown role: "${role}"` });

  try {
    const user = await Model.findByIdAndDelete(id);
    if (!user) return res.status(404).json({ message: "User not found" });

    const rm = (p) => p && fs.unlink(path.resolve(__dirname, "..", p), () => {});
    rm(user.photo?.path);
    (user.documents || []).forEach((d) => rm(d.path));

    console.log(`🗑  Deleted ${role}: ${user.fullName}`);
    res.json({ message: "Deleted successfully", deletedId: id });
  } catch (err) {
    console.error("deleteUser:", err);
    res.status(500).json({ message: err.message });
  }
};