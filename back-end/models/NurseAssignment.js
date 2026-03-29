const mongoose = require("mongoose");

const nurseAssignmentSchema = new mongoose.Schema({
  nurse: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Nurse",
    required: true,
  },
  patients: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Patient",
      required: true,
    },
  ],
  assignmentDate: {
    type: Date,
    required: true,
  },
  shift: {
    type: String,
    enum: ["morning", "afternoon", "night"],
    required: true,
  },
  notes: {
    type: String,
    default: "",
  },
  createdBy: {
    type: String,
    default: "admin",
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

nurseAssignmentSchema.index({ nurse: 1, assignmentDate: 1, shift: 1 }, { unique: true });
nurseAssignmentSchema.index({ assignmentDate: 1, shift: 1 });

module.exports = mongoose.model("NurseAssignment", nurseAssignmentSchema);
