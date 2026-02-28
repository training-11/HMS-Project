const Nurse = require("../models/Nurse");
const bcrypt = require("bcryptjs");

exports.registerNurse = async (req, res) => {
  try {
    const { fullName, email, phone, shiftTiming, department, password } =
      req.body;

    // Check if doctor already exists
    const existingNurse = await Nurse.findOne({ email });
    if (existingNurse) {
      return res.status(400).json({
        message: "Nurse already exists",
      });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    const nurse = await Nurse.create({
      fullName,
      email,
      phone,
      shiftTiming,
      department,
      password: hashedPassword,
    });

    // Remove password before sending response
    nurse.password = undefined;

    res.status(201).json({
      message: "Nurse registered successfully",
      nurse,
    });
  } catch (err) {
    res.status(500).json({
      message: err.message,
    });
  }
};

exports.getNurses = async (req, res) => {
  try {
    const nurses = await Nurse.find().select("-password"); // hide password
    res.json(nurses);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
