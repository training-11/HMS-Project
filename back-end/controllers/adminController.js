const Doctor = require("../models/Doctor");
const Nurse = require("../models/Nurse");
const Patient = require("../models/Patient");
const sendMail = require("../utils/sendMail");

const getApprovalModel = (role) => {
  if (role === "doctor") return Doctor;
  if (role === "nurse") return Nurse;
  return null;
};

const getDeleteModel = (role) => {
  if (role === "doctor") return Doctor;
  if (role === "nurse") return Nurse;
  if (role === "patient") return Patient;
  return null;
};

exports.verifyUser = async (req, res) => {
  try {
    const { role, id } = req.params;

    const Model = getApprovalModel(role);
    if (!Model) {
      return res.status(400).json({
        message: "Only doctors and nurses require admin verification",
      });
    }

    const user = await Model.findByIdAndUpdate(
      id,
      {
        isVerified: true,
        isRejected: false,
        verifiedAt: new Date(),
      },
      { new: true }
    );

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const mailResult = await sendMail(
      user.email,
      "Account Approved",
      `Hello ${user.fullName}, your account has been approved. You can now log in to the hospital management system.`
    );

    res.json({
      message: mailResult.sent ? "User verified and email sent" : "User verified successfully",
      user,
      emailSent: Boolean(mailResult.sent),
    });
  } catch (err) {
    console.error("VERIFY ERROR:", err);
    res.status(500).json({ message: "Server error" });
  }
};

exports.rejectUser = async (req, res) => {
  try {
    const { role, id } = req.params;

    const Model = getApprovalModel(role);
    if (!Model) {
      return res.status(400).json({
        message: "Only doctors and nurses can be rejected by admin",
      });
    }

    const user = await Model.findByIdAndUpdate(
      id,
      {
        isRejected: true,
        isVerified: false,
      },
      { new: true }
    );

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const mailResult = await sendMail(
      user.email,
      "Account Rejected",
      `Hello ${user.fullName}, your account registration has been rejected by admin. Please contact the hospital for more details.`
    );

    res.json({
      message: mailResult.sent ? "User rejected and email sent" : "User rejected successfully",
      user,
      emailSent: Boolean(mailResult.sent),
    });
  } catch (err) {
    console.error("REJECT ERROR:", err);
    res.status(500).json({ message: "Server error" });
  }
};

exports.deleteUser = async (req, res) => {
  try {
    const { role, id } = req.params;

    const Model = getDeleteModel(role);
    if (!Model) {
      return res.status(400).json({ message: "Invalid role" });
    }

    const user = await Model.findByIdAndDelete(id);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json({ message: "User deleted successfully" });
  } catch (err) {
    console.error("DELETE ERROR:", err);
    res.status(500).json({ message: "Server error" });
  }
};
