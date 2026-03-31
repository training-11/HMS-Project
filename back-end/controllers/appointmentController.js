const Appointment = require("../models/Appointment");
const Doctor = require("../models/Doctor");
const Patient = require("../models/Patient");
const nodemailer = require("nodemailer");

console.log("EMAIL_USER:", process.env.EMAIL_USER);
console.log("EMAIL_PASS:", process.env.EMAIL_PASS);

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS, 
  },
});

// Time slots available (9 AM to 5 PM, 1-hour slots)
const TIME_SLOTS = [
  "09:00-10:00",
  "10:00-11:00",
  "11:00-12:00",
  "12:00-13:00",
  "13:00-14:00",
  "14:00-15:00",
  "15:00-16:00",
  "16:00-17:00",
];

const ACTIVE_SLOT_STATUSES = ["scheduled"];

const getDayRange = (dateInput) => {
  const date = new Date(dateInput);

  if (Number.isNaN(date.getTime())) {
    return null;
  }

  const start = new Date(date);
  start.setHours(0, 0, 0, 0);

  const end = new Date(date);
  end.setHours(23, 59, 59, 999);

  return { start, end, date };
};

// ✅ CREATE APPOINTMENT
exports.createAppointment = async (req, res) => {
  try {
    const { patientId, doctorId, appointmentDate, timeSlot, notes } = req.body;

    if (!patientId || !doctorId || !appointmentDate || !timeSlot) {
      return res.status(400).json({
        message: "Patient, doctor, date, and time slot are required",
      });
    }

    // Check if patient exists
    const patient = await Patient.findById(patientId);
    if (!patient) {
      return res.status(404).json({ message: "Patient not found" });
    }

    // Check if doctor exists and is verified
    const doctor = await Doctor.findById(doctorId);
    if (!doctor) {
      return res.status(404).json({ message: "Doctor not found" });
    }
    if (!doctor.isVerified) {
      return res.status(400).json({ message: "Doctor is not verified" });
    }

    // Check if time slot is valid
    if (!TIME_SLOTS.includes(timeSlot)) {
      return res.status(400).json({ message: "Invalid time slot" });
    }

    const dayRange = getDayRange(appointmentDate);
    if (!dayRange) {
      return res.status(400).json({ message: "Invalid appointment date" });
    }

    // Check if the selected doctor already has this slot booked on that day.
    const existingAppointment = await Appointment.findOne({
      doctor: doctorId,
      appointmentDate: { $gte: dayRange.start, $lte: dayRange.end },
      timeSlot,
      status: { $in: ACTIVE_SLOT_STATUSES },
    });

    if (existingAppointment) {
      return res.status(409).json({
        message: "This time slot is already booked for the selected doctor",
      });
    }

    // Prevent assigning the same patient to multiple doctors at the same time.
    const patientConflict = await Appointment.findOne({
      patient: patientId,
      appointmentDate: { $gte: dayRange.start, $lte: dayRange.end },
      timeSlot,
      status: { $in: ACTIVE_SLOT_STATUSES },
    });

    if (patientConflict) {
      return res.status(409).json({
        message: "This patient already has an appointment in the selected time slot",
      });
    }

    // Create appointment
    const appointment = new Appointment({
      patient: patientId,
      doctor: doctorId,
      appointmentDate: dayRange.start,
      timeSlot,
      notes: notes || "",
      status: "scheduled",
    });

    await appointment.save();

    // ✅ SEND MAIL TO DOCTOR
    try {
      await transporter.sendMail({
        from: process.env.EMAIL_USER,
        to: doctor.email,
        subject: "New Patient Assigned 🏥",
        html: `
          <h2>New Appointment Assigned</h2>
          <p><b>Patient Name:</b> ${patient.fullName}</p>
          <p><b>Date:</b> ${appointmentDate}</p>
          <p><b>Time Slot:</b> ${timeSlot}</p>
          <p>Please login to your dashboard.</p>
        `,
      });
    } catch (mailErr) {
      console.error("Mail send error:", mailErr);
    }

        // ✅ SEND MAIL TO PATIENT
    try {
      await transporter.sendMail({
        from: process.env.EMAIL_USER,
        to: patient.email,
        subject: "Appointment Confirmed 🏥",
        html: `
          <h2>Your Appointment is Confirmed</h2>
          <p><b>Doctor Name:</b> ${doctor.fullName}</p>
          <p><b>Date:</b> ${appointmentDate}</p>
          <p><b>Time Slot:</b> ${timeSlot}</p>
          <p>Please arrive 10 minutes early.</p>
        `,
      });
    } catch (mailErr) {
      console.error("Patient mail error:", mailErr);
    }

    // Populate patient and doctor details
    const populatedAppointment = await Appointment.findById(appointment._id)
      .populate("patient", "fullName email phone bloodGroup")
      .populate("doctor", "fullName email specialty department");

    res.status(201).json({
      message: "Appointment created successfully",
      appointment: populatedAppointment,
    });
  } catch (err) {
    console.error("Create appointment error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// ✅ GET ALL APPOINTMENTS
exports.getAppointments = async (req, res) => {
  try {
    const appointments = await Appointment.find()
      .populate("patient", "fullName email phone bloodGroup")
      .populate("doctor", "fullName email specialty department")
      .sort({ appointmentDate: 1, timeSlot: 1 });

    res.json(appointments);
  } catch (err) {
    console.error("Get appointments error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// ✅ GET APPOINTMENTS BY DOCTOR
exports.getAppointmentsByDoctor = async (req, res) => {
  try {
    const { doctorId } = req.params;

    const appointments = await Appointment.find({ doctor: doctorId })
      .populate("patient", "fullName email phone bloodGroup")
      .populate("doctor", "fullName email specialty department")
      .sort({ appointmentDate: 1, timeSlot: 1 });

    res.json(appointments);
  } catch (err) {
    console.error("Get doctor appointments error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// ✅ GET APPOINTMENTS BY PATIENT
exports.getAppointmentsByPatient = async (req, res) => {
  try {
    const { patientId } = req.params;

    const appointments = await Appointment.find({ patient: patientId })
      .populate("patient", "fullName email phone bloodGroup")
      .populate("doctor", "fullName email specialty department")
      .sort({ appointmentDate: 1, timeSlot: 1 });

    res.json(appointments);
  } catch (err) {
    console.error("Get patient appointments error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// ✅ GET AVAILABLE TIME SLOTS FOR A DOCTOR ON A DATE
exports.getAvailableSlots = async (req, res) => {
  try {
    const { doctorId, date } = req.query;

    if (!doctorId || !date) {
      return res.status(400).json({
        message: "Doctor ID and date are required",
      });
    }

    const dayRange = getDayRange(date);
    if (!dayRange) {
      return res.status(400).json({ message: "Invalid date" });
    }

    // Get all booked appointments for this doctor on this date
    const bookedAppointments = await Appointment.find({
      doctor: doctorId,
      appointmentDate: { $gte: dayRange.start, $lte: dayRange.end },
      status: { $in: ACTIVE_SLOT_STATUSES },
    }).select("timeSlot");

    const bookedSlots = bookedAppointments.map((apt) => apt.timeSlot);

    // Filter out booked slots
    const availableSlots = TIME_SLOTS.filter(
      (slot) => !bookedSlots.includes(slot)
    );

    res.json({
      date,
      totalSlots: TIME_SLOTS.length,
      bookedSlots: bookedSlots.length,
      availableSlots,
    });
  } catch (err) {
    console.error("Get available slots error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// ✅ UPDATE APPOINTMENT STATUS
exports.updateAppointmentStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, notes } = req.body;

    const validStatuses = ["scheduled", "completed", "cancelled", "no-show"];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ message: "Invalid status" });
    }

    const appointment = await Appointment.findByIdAndUpdate(
      id,
      {
        status,
        notes: notes || undefined,
        updatedAt: new Date(),
      },
      { new: true }
    )
      .populate("patient", "fullName email phone bloodGroup")
      .populate("doctor", "fullName email specialty department");

    if (!appointment) {
      return res.status(404).json({ message: "Appointment not found" });
    }

    res.json({
      message: "Appointment updated successfully",
      appointment,
    });
  } catch (err) {
    console.error("Update appointment error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// ✅ DELETE APPOINTMENT
exports.deleteAppointment = async (req, res) => {
  try {
    const { id } = req.params;

    const appointment = await Appointment.findByIdAndDelete(id);

    if (!appointment) {
      return res.status(404).json({ message: "Appointment not found" });
    }

    res.json({ message: "Appointment deleted successfully" });
  } catch (err) {
    console.error("Delete appointment error:", err);
    res.status(500).json({ message: "Server error" });
  }
};
