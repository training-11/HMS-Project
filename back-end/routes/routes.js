

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
const route   = express.Router();

const authController    = require("../controllers/AuthController");
const docController     = require("../controllers/doctorController");
const nurseController   = require("../controllers/nurseController");
const patientController = require("../controllers/patientController");

route.post("/login", authController.commonLogin);

// uploadMiddleware MUST be the second argument — it parses multipart/form-data
// before postDoc runs, otherwise req.files is always undefined
route.post("/postDoc", docController.uploadMiddleware, docController.postDoc);
route.get ("/getDoc",  docController.getDoctors);

route.post("/postNurse",   nurseController.registerNurse);
route.get ("/getNurse",    nurseController.getNurses);

route.post("/postPatient", patientController.registerPatient);
route.get ("/getPatient",  patientController.getPatients);

module.exports = route;
