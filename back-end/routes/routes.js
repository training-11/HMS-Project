const express = require("express");
const route = express.Router();

const authController    = require("../controllers/AuthController");
const docController     = require("../controllers/doctorController");
const nurseController   = require("../controllers/nurseController");
const patientController = require("../controllers/patientController");
const adminController   = require("../controllers/adminController");

route.post("/login", authController.commonLogin);

// Doctor
route.post("/postDoc",  docController.uploadMiddleware, docController.postDoc);
route.get("/getDoc",    docController.getDoctors);

// Nurse
route.post("/postNurse", nurseController.uploadMiddleware, nurseController.postNurse);
route.get("/getNurse",   nurseController.getNurses);

// Patient
route.post("/postPatient", patientController.uploadMiddleware, patientController.registerPatient);
route.get("/getPatient",   patientController.getPatients);

// Admin
route.post("/postAdmin", (req, res) => {
  res.json({ message: "Admin created" });
});

route.get("/getAdmin", (req, res) => {
  res.json([]);
});

// ✅ Dashboard APIs
route.patch("/verifyUser/:role/:id",  adminController.verifyUser);
route.patch("/rejectUser/:role/:id",  adminController.rejectUser);
route.delete("/deleteUser/:role/:id", adminController.deleteUser);

module.exports = route;