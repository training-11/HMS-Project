const mongoose = require("mongoose");

const adminSchema = new mongoose.Schema({
  fullName: {
    type: String,
    required: true,
    trim: true,
  },

  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
  },

  phone: {
    type: String,
    required: true,
  },

  employeeId: {
    type: String,
    required: true,
    unique: true,
  },

  adminRole: {
    type: String,
    required: true,
  },

  accessLevel: {
    type: String,
    required: true,
  },

  department: {
    type: String,
    required: true,
  },

  password: {
    type: String,
    required: true,
  },

  photo: {
    filename: String,
    path: String,
  },

  documents: [
    {
      data: Buffer,
      contentType: String,
      filename: String,
      originalName: String,
      path: String,
    },
  ],

  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("admin", adminSchema);
