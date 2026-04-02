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
