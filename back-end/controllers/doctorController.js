// const Doctor = require("../models/Doctor");
// const bcrypt = require("bcryptjs");
// const multer = require("multer");

// const storage = multer.memoryStorage();
// const upload = multer({ storage });


// exports.uploadMiddleware = upload.fields([
//   { name: "photo", maxCount: 1 },
//   { name: "documents", maxCount: 10 },
// ]);



// exports.registerDoctor = async (req, res) => {
//   try {
//     const { fullName, email, phone, specialty, department, password } =
//       req.body;

//     // const existingDoctor = await Doctor.findOne({ email});
//     // if (existingDoctor) {
//     //   return res.status(400).json({
//     //     message: "Doctor already exists",
//     //   });
//     // }
//     const normalizedEmail = email.toLowerCase().trim();
//     const existingDoctor = await Doctor.findOne({ email: normalizedEmail });
//     if (existingDoctor) {
//       return res.status(400).json({ message: "A doctor with this email already exists" });
//     }

//     const hashedPassword = await bcrypt.hash(password, 10);

//     const doctor = await Doctor.create({
//       fullName,
//       email: email.toLowerCase(),
//       phone,
//       specialty,
//       department,
//       password: hashedPassword,
//     });

//     doctor.password = undefined;

//     res.status(201).json({
//       message: "Doctor registered successfully",
//       doctor,
//     });
//   } catch (err) {
//     if (err.code === 11000) {
//       return res.status(400).json({ message: "A doctor with this email already exists" });
//     }
//     res.status(500).json({ message: err.message });
//   }

// }

//   exports.getDoctors = async (req, res) => {
//     try {
//       const doctors = await Doctor.find().select("-password");
//       res.json(doctors);
//     } catch (err) {
//       res.status(500).json({ message: err.message });
//     }
//   };

//   exports.postDoc = async (req, res) => {


//     try {
//       // console.log("Content-Type:", req.headers["content-type"]);
//       // console.log("req.body:", req.body);       // should show form fields
//       // console.log("req.files:", req.files);
//       const { fullName, email, phone, specialty, department, password } =
//         req.body;

//       if (!fullName || !email || !phone || !specialty || !department || !password) {
//         return res.status(400).json({
//           message: "All fields are required",
//         });
//       }

//       const hashedPassword = await bcrypt.hash(password, 10);

//       const photo = req.files?.["photo"]?.[0] || null;
//       const documents = req.files?.["documents"] || [];

//       const newDoc = new Doctor({
//         fullName,
//         email,
//         phone,
//         specialty,
//         department,
//         password: hashedPassword,
//         photo: photo
//           ? {
//             data: photo.buffer,
//             contentType: photo.mimetype,
//             filename: photo.originalname,
//           }
//           : null,
//         documents: documents.map((doc) => ({
//           data: doc.buffer,
//           contentType: doc.mimetype,
//           filename: doc.originalname,
//         })),
//       });

//       const savedDoc = await newDoc.save();

//       res.status(201).json({
//         message: "Doctor added successfully",
//         doctor: savedDoc,
//       });
//     } catch (err) {
//       res.status(500).json({
//         message: err.message,
//       });
//     }
//   };


const Doctor = require("../models/Doctor");
const bcrypt = require("bcryptjs");
const multer = require("multer");
const path = require("path");
const fs = require("fs");

// ── Absolute paths — no ambiguity ────────────────────────────────────────────
const UPLOAD_ROOT = path.resolve(__dirname, "..", "uploads");
const PHOTO_DIR = path.resolve(UPLOAD_ROOT, "photos");
const DOCS_DIR = path.resolve(UPLOAD_ROOT, "documents");

// Create folders immediately — log so you can confirm in terminal
[UPLOAD_ROOT, PHOTO_DIR, DOCS_DIR].forEach((dir) => {
  fs.mkdirSync(dir, { recursive: true });   // no-op if already exists
});

console.log("✅ Upload dirs ready:");
console.log("   photos    →", PHOTO_DIR);
console.log("   documents →", DOCS_DIR);

// ── Multer disk storage ───────────────────────────────────────────────────────
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    // pick folder based on field name
    const dir = file.fieldname === "photo" ? PHOTO_DIR : DOCS_DIR;
    console.log(`[multer dest] '${file.fieldname}' → ${dir}`);
    cb(null, dir);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname) || ".jpg";
    const name = `${file.fieldname}-${Date.now()}${ext}`;
    console.log(`[multer name] '${file.originalname}' saved as '${name}'`);
    cb(null, name);
  },
});

const upload = multer({ storage });

exports.uploadMiddleware = upload.fields([
  { name: "photo", maxCount: 1 },
  { name: "documents", maxCount: 10 },
]);

// ── postDoc ───────────────────────────────────────────────────────────────────
exports.postDoc = async (req, res) => {
  try {
    console.log("\n========== postDoc ==========");
    console.log("body keys :", Object.keys(req.body));
    console.log("req.files :", JSON.stringify(req.files, null, 2));  // full detail

    const { fullName, email, phone, specialty, department, password } = req.body;

    if (!fullName || !email || !phone || !specialty || !department || !password) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const normalizedEmail = email.toLowerCase().trim();

    const existing = await Doctor.findOne({ email: normalizedEmail });
    if (existing) {
      return res.status(400).json({ message: "A doctor with this email already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const photoFile = req.files?.["photo"]?.[0] || null;
    const docFiles = req.files?.["documents"] || [];

    console.log("photo saved :", photoFile ? photoFile.path : "none");
    console.log("docs  saved :", docFiles.map(f => f.path));

    const newDoc = new Doctor({
      fullName,
      email: normalizedEmail,
      phone,
      specialty,
      department,
      password: hashedPassword,
      photo: photoFile
        ? { filename: photoFile.filename, path: `uploads/photos/${photoFile.filename}` }
        : null,
      documents: docFiles.map((f) => ({
        filename: f.originalname,
        path: `uploads/documents/${f.filename}`,
      })),
    });

    const saved = await newDoc.save();
    const result = saved.toObject();
    delete result.password;

    res.status(201).json({ message: "Doctor registered successfully", doctor: result });

  } catch (err) {
    if (err.code === 11000) {
      return res.status(400).json({ message: "A doctor with this email already exists" });
    }
    console.error("postDoc error:", err);
    res.status(500).json({ message: err.message });
  }
};

exports.getDoctors = async (req, res) => {
  try {
    const doctors = await Doctor.find().select("-password");
    res.json(doctors);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};