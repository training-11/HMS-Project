// ✅ IMPORT MODELS
const nodemailer = require("nodemailer");
const Doctor = require("../models/Doctor");
const Nurse = require("../models/Nurse");
const Patient = require("../models/Patient");


// ✅ EMAIL SETUP
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: "hmsadmin7@gmail.com",
    pass: "coqgegtjmidfmcnr", // ⚠️ use app password
  },
});

// 🔹 helper to select model
const getModel = (role) => {
  if (role === "doctor") return Doctor;
  if (role === "nurse") return Nurse;
  if (role === "patient") return Patient;
  return null;
};


// ✅ VERIFY USER
exports.verifyUser = async (req, res) => {
  try {
    const { role, id } = req.params;

    const Model = getModel(role);
    if (!Model) return res.status(400).json({ message: "Invalid role" });

    const user = await Model.findByIdAndUpdate(
      id,
      {
        isVerified: true,
        isRejected: false,
        verifiedAt: new Date(),
      },
      { new: true }
    );

    if (!user) return res.status(404).json({ message: "User not found" });

    // ✅ SEND EMAIL
    await transporter.sendMail({
      from: "hmsadmin7@gmail.com",
      to: user.email,
      subject: "Account Approved",
      text: `Hello ${user.fullName}, your account has been approved.`,
    });

    res.json({ message: "User verified & mail sent", user });

  } catch (err) {
    console.error("VERIFY ERROR:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// ✅ REJECT USER
exports.rejectUser = async (req, res) => {
  try {
    const { role, id } = req.params;

    const Model = getModel(role);
    if (!Model) return res.status(400).json({ message: "Invalid role" });

    const user = await Model.findByIdAndUpdate(
      id,
      {
        isRejected: true,
        isVerified: false,
      },
      { new: true }
    );

    if (!user) return res.status(404).json({ message: "User not found" });

    // ✅ SEND EMAIL
    await transporter.sendMail({
      from: "hmsadmin7@gmail.com",
      to: user.email,
      subject: "Account Rejected",
      text: `Hello ${user.fullName}, your account has been rejected.`,
    });

    res.json({ message: "User rejected & mail sent", user });

  } catch (err) {
    console.error("REJECT ERROR:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// ✅ DELETE USER
exports.deleteUser = async (req, res) => {
  try {
    const { role, id } = req.params;

    const Model = getModel(role);
    if (!Model) return res.status(400).json({ message: "Invalid role" });

    const user = await Model.findByIdAndDelete(id);

    if (!user) return res.status(404).json({ message: "User not found" });

    res.json({ message: "User deleted successfully" });

  } catch (err) {
    console.error("DELETE ERROR:", err);
    res.status(500).json({ message: "Server error" });
  }
};