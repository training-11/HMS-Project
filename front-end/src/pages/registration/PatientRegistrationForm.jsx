import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../../Components/styles/PatientRegistrationForm.css";
import Navbar from "../../Components/Navbar";

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
      "You are registering as a Patient. Are you sure?",
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
        setServerError(
          data.message || "Registration failed. Please try again.",
        );
      } else {
        setFormData(initialState);
        navigate("/login");
      }
    } catch (err) {
      setServerError(
        "Could not connect to server. Please check your connection.",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <style>{`
     /* Back Button */
        .back-btn {
          position: fixed;
          top: 80px;
          left: 24px;
          z-index: 10;
          display: flex;
          align-items: center;
          gap: 7px;
          background: #fff;
          border: 1.5px solid #e0e0e0;
          border-radius: 10px;
          padding: 8px 14px;
          font-size: 13px;
          font-weight: 600;
          color: #424242;
          cursor: pointer;
          box-shadow: 0 2px 8px rgba(0,0,0,0.07);
          transition: all 0.2s ease;
        }
        .back-btn:hover {
          background: #f5f5f5;
          border-color: #bdbdbd;
          transform: translateX(-2px);
        }
        .container{
        height: 120vh;
          
        }
    
    `}</style>

      <Navbar />

      {/* ✅ Back Button — correctly positioned & functional */}
      <button className="back-btn" type="button" onClick={() => navigate("/")}>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="15"
          height="15"
          fill="currentColor"
          viewBox="0 0 16 16"
        >
          <path
            fillRule="evenodd"
            d="M14.5 1.5a.5.5 0 0 1 .5.5v4.8a2.5 2.5 0 0 1-2.5 2.5H2.707l3.347 3.346a.5.5 0 0 1-.708.708l-4.2-4.2a.5.5 0 0 1 0-.708l4-4a.5.5 0 1 1 .708.708L2.707 8.3H12.5A1.5 1.5 0 0 0 14 6.8V2a.5.5 0 0 1 .5-.5"
          />
        </svg>
        Back
      </button>

      <div className="container">
        <div className="form-box">
          <h2>Patient Registration</h2>

          {serverError && (
            <div
              style={{
                background: "#ffebee",
                border: "1px solid #ef9a9a",
                color: "#c62828",
                borderRadius: "8px",
                padding: "10px 14px",
                fontSize: "14px",
                marginBottom: "14px",
              }}
            >
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
            <p
              style={{
                textAlign: "center",
                marginTop: "14px",
                fontSize: "14px",
                color: "#666",
              }}
            >
              Already have an account?{" "}
              <span
                onClick={() => navigate("/login")}
                style={{
                  color: "#2e7d32",
                  fontWeight: "600",
                  cursor: "pointer",
                  textDecoration: "underline",
                  textUnderlineOffset: "2px",
                }}
              >
                Login
              </span>
            </p>
          </form>
        </div>
      </div>
    </>
  );
};

export default PatientRegistrationForm;
