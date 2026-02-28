const express = require("express");

const route = express.Router();

const docController = require("../controllers/doctorController");

const nurseController = require("../controllers/nurseController");

const patientController = require("../controllers/patientController");

route.get("/getDoc", docController.getDoctors);

route.post("/postDoc", docController.postDoc);

route.get("/getNurse", nurseController.getNurses);

route.get("/getPatient", patientController.getPatients);

module.exports = route;
