// const express = require("express");

// const route = express.Router();

// const authController = require("../controllers/AuthController");
// const docController = require("../controllers/doctorController");
// const nurseController = require("../controllers/nurseController");
// const patientController = require("../controllers/patientController");

// route.post("/login", authController.commonLogin);

// route.get("/getDoc", docController.getDoctors);
// route.post("/postDoc", docController.uploadMiddleware, docController.postDoc);

// route.get("/getNurse", nurseController.getNurses);
// route.post("/postNurse", nurseController.registerNurse);

// route.get("/getPatient", patientController.getPatients);
// route.post("/postPatient", patientController.registerPatient);

// module.exports = route;

const express = require("express");
const route = express.Router();

const authController = require("../controllers/AuthController");
const docController = require("../controllers/doctorController");
const nurseController = require("../controllers/nurseController");
const patientController = require("../controllers/patientController");

route.post("/login", authController.commonLogin);

// uploadMiddleware MUST be the second argument — it parses multipart/form-data
// before postDoc runs, otherwise req.files is always undefined
route.post("/postDoc", docController.uploadMiddleware, docController.postDoc);
route.get("/getDoc", docController.getDoctors);

route.post(
  "/postNurse",
  nurseController.uploadMiddleware,
  nurseController.postNurse,
);
route.get("/getNurse", nurseController.getNurses);

route.post("/postPatient", patientController.registerPatient);
route.get("/getPatient", patientController.getPatients);

module.exports = route;

// const express = require("express");
// const router = express.Router();

// const authController = require("../controllers/AuthController");
// const docController = require("../controllers/doctorController");
// const nurseController = require("../controllers/nurseController");
// const patientController = require("../controllers/patientController");

// // ---------------- LOGIN ----------------
// router.post("/login", authController.commonLogin);

// // ---------------- DOCTOR ----------------
// router.post(
//   "/postDoc",
//   docController.uploadMiddleware,
//   docController.postDoc
// );

// router.get("/getDoc", docController.getDoctors);

// // ---------------- NURSE ----------------
// router.post(
//   "/postNurse",
//   nurseController.uploadMiddleware,
//   nurseController.postNurse
// );

// router.get("/getNurse", nurseController.getNurses);

// // ---------------- PATIENT ----------------
// router.post("/postPatient", patientController.registerPatient);
// router.get("/getPatient", patientController.getPatients);

// module.exports = router;
