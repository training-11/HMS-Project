const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

const app = express();

app.use(express.json());
app.use(cors());

const route = require("./routes/routes");

mongoose
  .connect("mongodb://localhost:27017/HospitalData")
  .then(() => {
    console.log("MongoDB Connected");
  })
  .catch((err) => {
    console.log(err);
  });

app.use("/api", route);

app.listen("8080", () => {
  console.log("Server Running");
});
