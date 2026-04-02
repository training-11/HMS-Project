const Appointment = require("../models/Appointment");
const Doctor = require("../models/Doctor");
const Patient = require("../models/Patient");
const nodemailer = require("nodemailer");
const Nurse = require("../models/Nurse");

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
      .populate("nurse", "fullName email")
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
      .populate("nurse", "fullName email")
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
      .populate("nurse", "fullName email")
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

exports.assignNurse = async (req, res) => {
  try {
    const { id } = req.params;
    const { nurseId } = req.body;

    if (!nurseId) {
      return res.status(400).json({ message: "Nurse ID is required" });
    }

    const appointment = await Appointment.findById(id);

    if (!appointment) {
      return res.status(404).json({ message: "Appointment not found" });
    }

    const dayRange = getDayRange(appointment.appointmentDate);

    // 🔥 CHECK: same nurse, same date, same time
    const conflict = await Appointment.findOne({
      _id: { $ne: id }, // exclude current appointment
      nurse: nurseId,
      appointmentDate: { $gte: dayRange.start, $lte: dayRange.end },
      timeSlot: appointment.timeSlot,
      status: { $in: ACTIVE_SLOT_STATUSES },
    });

    if (conflict) {
      return res.status(409).json({
        message: "This nurse is already assigned for this time slot",
      });
    }

    appointment.nurse = nurseId;
    await appointment.save();
    const nurse = await Nurse.findById(nurseId);
const patient = await Patient.findById(appointment.patient);
const doctor = await Doctor.findById(appointment.doctor);

try {
  await transporter.sendMail({
    from: process.env.EMAIL_USER,
    to: nurse.email,
    subject: "New Patient Assigned 🏥",
    html: `
      <h2>You have been assigned a patient</h2>
      <p><b>Patient Name:</b> ${patient.fullName}</p>
      <p><b>Date:</b> ${appointment.appointmentDate.toDateString()}</p>
      <p><b>Time Slot:</b> ${appointment.timeSlot}</p>
      <p><b>Assigned By Doctor:</b> ${doctor.fullName}</p>
      <p>Please login to your dashboard.</p>
    `,
  });
} catch (err) {
  console.error("Nurse mail error:", err);
}

    const updated = await Appointment.findById(id)
      .populate("patient", "fullName email phone")
      .populate("doctor", "fullName")
      .populate("nurse", "fullName email");

    res.json({
      message: "Nurse assigned successfully",
      appointment: updated,
    });
  } catch (err) {
    console.error("Assign nurse error:", err);
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
const Appointment = require("../models/Appointment");
const Doctor = require("../models/Doctor");
const Patient = require("../models/Patient");
const sendMail = require("../utils/sendMail");

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

exports.createAppointment = async (req, res) => {
  try {
    const { patientId, doctorId, appointmentDate, timeSlot, notes } = req.body;

    if (!patientId || !doctorId || !appointmentDate || !timeSlot) {
      return res.status(400).json({
        message: "Patient, doctor, date, and time slot are required",
      });
    }

    const patient = await Patient.findById(patientId);
    if (!patient) {
      return res.status(404).json({ message: "Patient not found" });
    }

    const doctor = await Doctor.findById(doctorId);
    if (!doctor) {
      return res.status(404).json({ message: "Doctor not found" });
    }
    if (!doctor.isVerified) {
      return res.status(400).json({ message: "Doctor is not verified" });
    }

    if (!TIME_SLOTS.includes(timeSlot)) {
      return res.status(400).json({ message: "Invalid time slot" });
    }

    const dayRange = getDayRange(appointmentDate);
    if (!dayRange) {
      return res.status(400).json({ message: "Invalid appointment date" });
    }

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

    const appointment = new Appointment({
      patient: patientId,
      doctor: doctorId,
      appointmentDate: dayRange.start,
      timeSlot,
      notes: notes || "",
      status: "scheduled",
    });

    await appointment.save();

    try {
      await sendMail(
        doctor.email,
        "New Patient Assigned 🏥",
        `New Appointment Assigned\nPatient Name: ${patient.fullName}\nDate: ${appointmentDate}\nTime Slot: ${timeSlot}\nPlease login to your dashboard.`,
        `
          <div style="font-family: Arial, sans-serif; color: #111827; line-height: 1.6;">
            <h2 style="margin: 0 0 16px; font-size: 28px; font-weight: 700;">New Appointment Assigned</h2>
            <p style="margin: 0 0 10px; font-size: 18px;"><b>Patient Name:</b> ${patient.fullName}</p>
            <p style="margin: 0 0 10px; font-size: 18px;"><b>Date:</b> ${appointmentDate}</p>
            <p style="margin: 0 0 10px; font-size: 18px;"><b>Time Slot:</b> ${timeSlot}</p>
            <p style="margin: 18px 0 0; font-size: 18px;">Please login to your dashboard.</p>
          </div>
        `
      );
    } catch (mailErr) {
      console.error("Doctor appointment mail error:", mailErr);
    }

    try {
      await sendMail(
        patient.email,
        "Appointment Confirmed 🏥",
        `Your Appointment is Confirmed\nDoctor Name: ${doctor.fullName}\nDate: ${appointmentDate}\nTime Slot: ${timeSlot}\nPlease arrive 10 minutes early.`,
        `
          <div style="font-family: Arial, sans-serif; color: #111827; line-height: 1.6;">
            <h2 style="margin: 0 0 16px; font-size: 28px; font-weight: 700;">Your Appointment is Confirmed</h2>
            <p style="margin: 0 0 10px; font-size: 18px;"><b>Doctor Name:</b> ${doctor.fullName}</p>
            <p style="margin: 0 0 10px; font-size: 18px;"><b>Date:</b> ${appointmentDate}</p>
            <p style="margin: 0 0 10px; font-size: 18px;"><b>Time Slot:</b> ${timeSlot}</p>
            <p style="margin: 18px 0 0; font-size: 18px;">Please arrive 10 minutes early.</p>
          </div>
        `
      );
    } catch (mailErr) {
      console.error("Patient appointment mail error:", mailErr);
    }

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

    const bookedAppointments = await Appointment.find({
      doctor: doctorId,
      appointmentDate: { $gte: dayRange.start, $lte: dayRange.end },
      status: { $in: ACTIVE_SLOT_STATUSES },
    }).select("timeSlot");

    const bookedSlots = bookedAppointments.map((apt) => apt.timeSlot);

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
