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
  status: {
    type: String,
    enum: ["pending", "approved", "rejected"],
    default: "pending",
  },
  photo: { filename: String, path: String },

  documents: [
    {
      data: Buffer,
      contentType: String,
      filename: String,
      originalName: String,
      path: String,
    },
  ],
  isVerified: {
  type: Boolean,
  default: false,
},
verifiedAt: {
  type: Date,
},
});

module.exports = mongoose.model("doctor", doctorSchema);
