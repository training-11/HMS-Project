const Doctor = require("../models/Doctor");
const bcrypt = require("bcryptjs");

exports.registerDoctor = async (req, res) => {
  try {
    const { fullName, email, phone, specialty, department, password } =
      req.body;

    // Check if doctor already exists
    const existingDoctor = await Doctor.findOne({ email });
    if (existingDoctor) {
      return res.status(400).json({
        message: "Doctor already exists",
      });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    const doctor = await Doctor.create({
      fullName,
      email,
      phone,
      specialty,
      department,
      password: hashedPassword,
    });

    // Remove password before sending response
    doctor.password = undefined;

    res.status(201).json({
      message: "Doctor registered successfully",
      doctor,
    });
  } catch (err) {
    res.status(500).json({
      message: err.message,
    });
  }
};

exports.getDoctors = async (req, res) => {
  try {
    const doctors = await Doctor.find().select("-password"); // hide password
    res.json(doctors);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.postDoc = async (req, res) => {
  try {
    const { fullName, email, phone, specialty, department, password } =
      req.body;

    if (
      !fullName ||
      !email ||
      !phone ||
      !specialty ||
      !department ||
      !password
    ) {
      return res.status(400).json({
        message: "All fields are required",
      });
    }

    
    const hashedPassword = await bcrypt.hash(password, 10);

    const newDoc = new Doctor({
      fullName,
      email,
      phone,
      specialty,
      department,
      password: hashedPassword,
    });

    const savedDoc = await newDoc.save();

    res.status(201).json({
      message: "Doctor added successfully",
      doctor: savedDoc,
    });
  } catch (err) {
    res.status(500).json({
      message: err.message,
    });
  }
};

