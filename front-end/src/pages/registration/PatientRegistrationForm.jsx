import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../../Components/styles/PatientRegistrationForm.css";

const PatientRegistrationForm = () => {
  const navigate = useNavigate();

  const initialState = {
    fullName: "",
    email: "",
    phone: "",
    dob: "",
    bloodGroup: "",
    medicalHistory: "",
    password: "",
  };

  const [formData, setFormData] = useState(initialState);
  const [loading, setLoading] = useState(false);
  const [serverError, setServerError] = useState("");

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setServerError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const confirmRegister = window.confirm(
      "You are registering as a Patient. Are you sure?"
    );
    if (!confirmRegister) return;

    setLoading(true);
    setServerError("");

    try {
      const res = await fetch("http://localhost:8080/api/postPatient", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      const data = await res.json();

      if (!res.ok) {
        setServerError(data.message || "Registration failed. Please try again.");
      } else {
        setFormData(initialState);
        navigate("/login");
      }
    } catch (err) {
      setServerError("Could not connect to server. Please check your connection.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container">
      <div className="form-box">
        <h2>Patient Registration</h2>

        {serverError && (
          <div style={{
            background: "#ffebee", border: "1px solid #ef9a9a", color: "#c62828",
            borderRadius: "8px", padding: "10px 14px", fontSize: "14px", marginBottom: "14px"
          }}>
            ⚠ {serverError}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <label>Full Name</label>
          <input
            type="text"
            name="fullName"
            placeholder="Enter Full Name"
            value={formData.fullName}
            onChange={handleChange}
            required
          />

          <label>Email Address</label>
          <input
            type="email"
            name="email"
            placeholder="Enter Email"
            value={formData.email}
            onChange={handleChange}
            required
          />

          <label>Phone Number</label>
          <input
            type="text"
            name="phone"
            placeholder="Enter 10-digit Phone Number"
            value={formData.phone}
            onChange={handleChange}
            required
          />

          <label>Date of Birth</label>
          <input
            type="date"
            name="dob"
            value={formData.dob}
            onChange={handleChange}
            required
          />

          <label>Blood Group</label>
          <select
            name="bloodGroup"
            value={formData.bloodGroup}
            onChange={handleChange}
            required
          >
            <option value="">Select Blood Group</option>
            <option>A+</option>
            <option>B+</option>
            <option>O+</option>
            <option>AB+</option>
            <option>A-</option>
            <option>B-</option>
            <option>O-</option>
            <option>AB-</option>
          </select>

          <label>Medical History</label>
          <textarea
            name="medicalHistory"
            placeholder="Enter Medical History"
            value={formData.medicalHistory}
            onChange={handleChange}
            required
          />

          <label>Password</label>
          <input
            type="password"
            name="password"
            placeholder="Create Strong Password"
            value={formData.password}
            onChange={handleChange}
            required
          />

          <button type="submit" disabled={loading}>
            {loading ? "Registering..." : "Register"}
          </button>

          {/* Login link */}
          <p style={{ textAlign: "center", marginTop: "14px", fontSize: "14px", color: "#666" }}>
            Already have an account?{" "}
            <span
              onClick={() => navigate("/login")}
              style={{
                color: "#2e7d32", fontWeight: "600", cursor: "pointer",
                textDecoration: "underline", textUnderlineOffset: "2px"
              }}
            >
              Login
            </span>
          </p>
        </form>
      </div>
    </div>
  );
};

export default PatientRegistrationForm;
