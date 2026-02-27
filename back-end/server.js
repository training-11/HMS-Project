const express = require("express");
const mongoose = require("mongoose");

const app = express();

mongoose
  .connect("mongodb://localhost:27017/HospitalData")
  .then(() => {
    console.log("MongoDB Connected");
  })
  .catch((err) => {
    console.log(err);
  });

app.listen("8080", () => {
  console.log("Server Running");
});
