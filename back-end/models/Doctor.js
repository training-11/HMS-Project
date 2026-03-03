const mongoose = require("mongoose");

const doctorSchema = new mongoose.Schema({
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
  specialty: {
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
  photo: { filename: String, path: "uploads/photos" },

  documents: [
    {
      data: Buffer,
      contentType: String,
      filename: String,
    },
  ],
});

module.exports = mongoose.model("doctor", doctorSchema);