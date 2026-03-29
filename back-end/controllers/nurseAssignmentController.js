const NurseAssignment = require("../models/NurseAssignment");
const Nurse = require("../models/Nurse");
const Patient = require("../models/Patient");

const SHIFTS = ["morning", "afternoon", "night"];

const getDayRange = (dateInput) => {
  const date = new Date(dateInput);

  if (Number.isNaN(date.getTime())) {
    return null;
  }

  const start = new Date(date);
  start.setHours(0, 0, 0, 0);

  const end = new Date(date);
  end.setHours(23, 59, 59, 999);

  return { start, end };
};

exports.createOrUpdateAssignment = async (req, res) => {
  try {
    const { nurseId, patientIds, assignmentDate, shift, notes } = req.body;

    if (!nurseId || !assignmentDate || !shift || !Array.isArray(patientIds) || patientIds.length === 0) {
      return res.status(400).json({
        message: "Nurse, patients, assignment date, and shift are required",
      });
    }

    if (!SHIFTS.includes(shift)) {
      return res.status(400).json({ message: "Invalid shift" });
    }

    const dayRange = getDayRange(assignmentDate);
    if (!dayRange) {
      return res.status(400).json({ message: "Invalid assignment date" });
    }

    const uniquePatientIds = [...new Set(patientIds.map(String))];

    const nurse = await Nurse.findById(nurseId);
    if (!nurse) {
      return res.status(404).json({ message: "Nurse not found" });
    }
    if (!nurse.isVerified) {
      return res.status(400).json({ message: "Nurse is not verified" });
    }

    const patients = await Patient.find({ _id: { $in: uniquePatientIds } }).select("_id");
    if (patients.length !== uniquePatientIds.length) {
      return res.status(404).json({ message: "One or more patients were not found" });
    }

    const existingAssignments = await NurseAssignment.find({
      assignmentDate: { $gte: dayRange.start, $lte: dayRange.end },
      shift,
      patients: { $in: uniquePatientIds },
    }).select("nurse patients");

    const conflictingAssignments = existingAssignments.filter(
      (assignment) => String(assignment.nurse) !== String(nurseId)
    );

    if (conflictingAssignments.length > 0) {
      return res.status(409).json({
        message: "One or more selected patients are already assigned to another nurse in this shift",
      });
    }

    let assignment = await NurseAssignment.findOne({
      nurse: nurseId,
      assignmentDate: { $gte: dayRange.start, $lte: dayRange.end },
      shift,
    });

    if (assignment) {
      assignment.patients = [...new Set([...assignment.patients.map(String), ...uniquePatientIds])];
      assignment.notes = notes?.trim() || assignment.notes;
      assignment.updatedAt = new Date();
      await assignment.save();
    } else {
      assignment = await NurseAssignment.create({
        nurse: nurseId,
        patients: uniquePatientIds,
        assignmentDate: dayRange.start,
        shift,
        notes: notes || "",
      });
    }

    const populatedAssignment = await NurseAssignment.findById(assignment._id)
      .populate("nurse", "fullName email department shiftTiming")
      .populate("patients", "fullName email phone bloodGroup");

    res.status(201).json({
      message: "Patients assigned to nurse successfully",
      assignment: populatedAssignment,
    });
  } catch (err) {
    console.error("Create nurse assignment error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

exports.getAssignments = async (req, res) => {
  try {
    const assignments = await NurseAssignment.find()
      .populate("nurse", "fullName email department shiftTiming")
      .populate("patients", "fullName email phone bloodGroup")
      .sort({ assignmentDate: 1, shift: 1, createdAt: 1 });

    res.json(assignments);
  } catch (err) {
    console.error("Get nurse assignments error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

exports.getAssignmentsByNurse = async (req, res) => {
  try {
    const { nurseId } = req.params;

    const assignments = await NurseAssignment.find({ nurse: nurseId })
      .populate("nurse", "fullName email department shiftTiming")
      .populate("patients", "fullName email phone bloodGroup")
      .sort({ assignmentDate: 1, shift: 1, createdAt: 1 });

    res.json(assignments);
  } catch (err) {
    console.error("Get nurse assignments by nurse error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

exports.deleteAssignment = async (req, res) => {
  try {
    const { id } = req.params;

    const assignment = await NurseAssignment.findByIdAndDelete(id);
    if (!assignment) {
      return res.status(404).json({ message: "Assignment not found" });
    }

    res.json({ message: "Nurse assignment deleted successfully" });
  } catch (err) {
    console.error("Delete nurse assignment error:", err);
    res.status(500).json({ message: "Server error" });
  }
};
