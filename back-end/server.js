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

const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const path = require("path");
require("dotenv").config();

const app = express();

mongoose
  .connect("mongodb://localhost:27017/HospitalData")
  .then(() => console.log("MongoDB Connected"))
  .catch((err) => console.log(err));

//Check the MongoDB URI
//console.log("MongoDB URI:", process.env.MONGODB_URI);

// Connect to MongoDB
// mongoose.connect(process.env.MONGODB_URI || "mongodb://localhost:27017/HospitalData", {
//     // useNewUrlParser: true,
//     // useUnifiedTopology: true,
//     tls: true,
//     ssl: true,
//     // sslValidate: false, // only if you're using self-signed certificates
// }).then(() => {
//     console.log("Connected to MongoDB");
// }).catch((error) => {
//     console.error("Error connecting to MongoDB:", error);
// });

app.use(
  cors({
    origin: "http://localhost:3000",
    methods: ["GET", "POST", "PUT", "DELETE","PATCH","OPTIONS"],
    credentials: true,
  }),
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve uploaded files as static — accessible at:
// http://localhost:8080/uploads/photos/<filename>
// http://localhost:8080/uploads/documents/<filename>
app.use('/uploads/photos', express.static(path.join(__dirname, 'uploads/photos')));
app.use('/uploads/documents', express.static(path.join(__dirname, 'uploads/documents')));

const route = require("./routes/routes");



app.use("/api", route);

app.listen(8080, () => console.log("Server running on port 8080"));
