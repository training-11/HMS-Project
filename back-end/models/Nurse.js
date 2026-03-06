const mongoose = require("mongoose");

const nurseSchema = new mongoose.Schema({
  fullName: {
    type: String,
    required: true,
    trim: true,
  },
  email: {
    type: String,
    required: true,
    unique: true, // important
    lowercase: true,
  },
  phone: {
    type: String,
    required: true,
  },
  department: {
    type: String,
    required: true,
  },
  shiftTiming: {
    type: String,
    required: true,
  },
  password: {
    type: String,
    required: true,
  },
  photo: { filename: String, path: String },

  documents: [
    {
      data: Buffer,
      contentType: String,
      filename: String,
    },
  ],
});
module.exports = mongoose.model("Nurse", nurseSchema);
