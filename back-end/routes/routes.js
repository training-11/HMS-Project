<<<<<<< HEAD
=======
// const express = require("express");
// const route = express.Router();

// const authController = require("../controllers/AuthController");
// const docController = require("../controllers/doctorController");
// const nurseController = require("../controllers/nurseController");
// const patientController = require("../controllers/patientController");

// route.post("/login", authController.commonLogin);

// // uploadMiddleware MUST be the second argument — it parses multipart/form-data
// // before postDoc runs, otherwise req.files is always undefined
// route.post("/postDoc", docController.uploadMiddleware, docController.postDoc);
// route.get("/getDoc", docController.getDoctors);

// route.post(
//   "/postNurse",
//   nurseController.uploadMiddleware,
//   nurseController.postNurse,
// );
// route.get("/getNurse", nurseController.getNurses);

// route.post(
//   "/postPatient",
//   patientController.uploadMiddleware,
//   patientController.registerPatient,
// );
// route.get("/getPatient", patientController.getPatients);

// module.exports = route;
>>>>>>> 1a3240f (Adminform created)
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

<<<<<<< HEAD
=======
// Patient Routes
>>>>>>> 1a3240f (Adminform created)
route.post(
  "/postPatient",
  patientController.uploadMiddleware,
  patientController.registerPatient,
);
route.get("/getPatient", patientController.getPatients);

<<<<<<< HEAD
module.exports = route;
=======
// Admin Routes
route.post(
  "/postAdmin",
  adminController.uploadMiddleware,
  adminController.postAdmin,
);

route.get("/getAdmin", adminController.getAdmins);

module.exports = route;
>>>>>>> 1a3240f (Adminform created)
