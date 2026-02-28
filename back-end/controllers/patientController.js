const Patient = require('../models/Patient');
const bcrypt = require("bcryptjs");

exports.registerPatient = async (req, res) => {
  try {
    const {
      fullName,
      email,
      phone,
      dob,
      bloodGroup,
      medicalHistory,
      password,
    } = req.body;

    // Check if patient already exists
    const existingPatient = await Patient.findOne({ email });
    if (existingPatient) {
      return res.status(400).json({
        message: "Patient already exists",
      });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    const patient = await Patient.create({
      fullName,
      email,
      phone,
      dob,
      bloodGroup,
      medicalHistory,
      password: hashedPassword,
    });

    // Remove password before sending response
    patient.password = undefined;

    res.status(201).json({
      message: "Patient registered successfully",
      patient,
    });
  } catch (err) {
    res.status(500).json({
      message: err.message,
    });
  }
};

exports.getPatients = async (req, res) => {
  try {
    const paitents = await Patient.find().select("-password"); // hide password
    res.json(paitents);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
