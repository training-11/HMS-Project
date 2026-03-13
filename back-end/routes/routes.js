const express = require("express");
const route = express.Router();

const authController = require("../controllers/AuthController");
const docController = require("../controllers/doctorController");
const nurseController = require("../controllers/nurseController");
const patientController = require("../controllers/patientController");
const adminController = require("../controllers/adminController");
console.log(adminController);

route.post("/login", authController.commonLogin);

// Doctor Routes
route.post("/postDoc", docController.uploadMiddleware, docController.postDoc);
route.get("/getDoc", docController.getDoctors);

// Nurse Routes
route.post(
  "/postNurse",
  nurseController.uploadMiddleware,
  nurseController.postNurse,
);
route.get("/getNurse", nurseController.getNurses);

// Patient Routes

route.post(
  "/postPatient",
  patientController.uploadMiddleware,
  patientController.registerPatient,
);
route.get("/getPatient", patientController.getPatients);

// Admin Routes
route.post(
  "/postAdmin",
  adminController.uploadMiddleware,
  adminController.postAdmin,
);

route.get("/getAdmin", adminController.getAdmins);

module.exports = route;
