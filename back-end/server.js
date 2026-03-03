// const path = require("path");

// const express = require("express");
// const mongoose = require("mongoose");
// const cors = require("cors");


// const app = express();

// app.use("/uploads", express.static(path.join(__dirname, "uploads")));


// app.use(cors({
//   origin: "http://localhost:3000",  // ← your React app URL
//   methods: ["GET", "POST", "PUT", "DELETE"],
//   credentials: true,
// }));                                    // ← first
// app.use(express.json());                            // ← second
// app.use(express.urlencoded({ extended: true }));    // ← add this

// const route = require("./routes/routes");

// mongoose
//   .connect("mongodb://localhost:27017/HospitalData")
//   .then(() => {
//     console.log("MongoDB Connected");
//   })
//   .catch((err) => {
//     console.log(err);
//   });

// app.use("/api", route);

// app.listen("8080", () => {
//   console.log("Server Running");
// });


const express  = require("express");
const mongoose = require("mongoose");
const cors     = require("cors");
const path     = require("path");

const app = express();

app.use(cors({
  origin: "http://localhost:3000",
  methods: ["GET", "POST", "PUT", "DELETE"],
  credentials: true,
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve uploaded files as static — accessible at:
// http://localhost:8080/uploads/photos/<filename>
// http://localhost:8080/uploads/documents/<filename>
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

const route = require("./routes/routes");

mongoose
  .connect("mongodb://localhost:27017/HospitalData")
  .then(() => console.log("MongoDB Connected"))
  .catch((err) => console.log(err));

app.use("/api", route);

app.listen(8080, () => console.log("Server running on port 8080"));
