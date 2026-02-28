import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

const DoctorRegistrationForm = () => {
  const navigate = useNavigate();
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [signupData, setSignupData] = useState({
    fullName: "",
    email: "",
    phone: "",
    specialty: "",
    department: "",
    password: "",
  });

  const specialties = [
    "Cardiology", "Neurology", "Orthopedics", "Dermatology",
    "Pediatrics", "Oncology", "Radiology", "General Surgery",
    "Psychiatry", "ENT", "Ophthalmology", "Gynecology",
  ];

  const departments = [
    "Emergency", "ICU", "OPD", "Surgery",
    "Inpatient", "Diagnostics", "Maternity", "Pediatric Ward",
  ];

  const handleChange = (e) => {
    setSignupData({ ...signupData, [e.target.name]: e.target.value });
    setError("");
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setShowConfirm(true);
  };

  const handleConfirmYes = async () => {
    setShowConfirm(false);
    setLoading(true);
    setError("");
    try {
      const res = await fetch("http://localhost:8080/api/postDoc", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(signupData),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.message || "Registration failed. Please try again.");
      } else {
        setSuccess("Registration successful! Redirecting to login...");
        setSignupData({ fullName: "", email: "", phone: "", specialty: "", department: "", password: "" });
        setTimeout(() => navigate("/login"), 1800);
      }
    } catch (err) {
      setError("Could not connect to server. Please check your connection.");
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmNo = () => setShowConfirm(false);

  return (
    <>
      <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/css/bootstrap.min.css" />
      <style>{`
        .hc-bg {
          min-height: 100vh;
          background: linear-gradient(135deg, #e8f4fd 0%, #f0f9f0 100%);
          position: relative;
          overflow: hidden;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .hc-bg-icons { position: fixed; inset: 0; pointer-events: none; z-index: 0; }
        .hc-bg-icons svg { position: absolute; opacity: 0.18; }
        .hc-card-wrap { position: relative; z-index: 1; width: 100%; display: flex; justify-content: center; }
        .btn-primary { background-color: #1976d2; border-color: #1976d2; }
        .btn-primary:hover { background-color: #1565c0; border-color: #1565c0; }
        .alert-success-custom {
          background: #e8f5e9; border: 1px solid #a5d6a7;
          color: #2e7d32; border-radius: 8px; padding: 10px 14px;
          font-size: 14px; margin-bottom: 12px;
        }
        .alert-error-custom {
          background: #ffebee; border: 1px solid #ef9a9a;
          color: #c62828; border-radius: 8px; padding: 10px 14px;
          font-size: 14px; margin-bottom: 12px;
        }
      `}</style>

      <div className="hc-bg">
        <div className="hc-bg-icons">
          <svg width="80" height="80" style={{ top: "5%", left: "5%" }} viewBox="0 0 80 80">
            <rect x="30" y="5" width="20" height="70" rx="4" fill="#2196F3" />
            <rect x="5" y="30" width="70" height="20" rx="4" fill="#2196F3" />
          </svg>
          <svg width="60" height="60" style={{ top: "15%", right: "8%" }} viewBox="0 0 80 80">
            <rect x="30" y="5" width="20" height="70" rx="4" fill="#2196F3" />
            <rect x="5" y="30" width="70" height="20" rx="4" fill="#2196F3" />
          </svg>
          <svg width="100" height="100" style={{ bottom: "10%", left: "3%" }} viewBox="0 0 80 80">
            <rect x="30" y="5" width="20" height="70" rx="4" fill="#2196F3" />
            <rect x="5" y="30" width="70" height="20" rx="4" fill="#2196F3" />
          </svg>
          <svg width="200" height="60" style={{ top: "8%", left: "30%" }} viewBox="0 0 200 60" fill="none">
            <path d="M0 30 L40 30 L55 10 L65 50 L75 20 L85 40 L95 30 L200 30" stroke="#e53935" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          <svg width="70" height="70" style={{ top: "60%", right: "3%" }} viewBox="0 0 100 100">
            <path d="M50 85 L15 50 Q5 35 20 25 Q35 15 50 35 Q65 15 80 25 Q95 35 85 50 Z" fill="#e53935" />
          </svg>
        </div>

        <div className="hc-card-wrap">
          <div className="card shadow-sm p-5 m-3" style={{ width: "100%", maxWidth: "450px" }}>
            <h4 className="text-center mb-4">Doctor Sign Up</h4>

            {success && <div className="alert-success-custom">✓ {success}</div>}
            {error && <div className="alert-error-custom">⚠ {error}</div>}

            <form onSubmit={handleSubmit}>
              <div className="mb-3">
                <label className="form-label">Full Name</label>
                <input type="text" className="form-control" name="fullName"
                  placeholder="Dr. Arunraj" value={signupData.fullName}
                  onChange={handleChange} required />
              </div>

              <div className="mb-3">
                <label className="form-label">Email</label>
                <input type="email" className="form-control" name="email"
                  placeholder="arunraj@hospital.com" value={signupData.email}
                  onChange={handleChange} required />
              </div>

              <div className="mb-3">
                <label className="form-label">Phone</label>
                <input type="tel" className="form-control" name="phone"
                  placeholder="+91 98765 43210" value={signupData.phone}
                  onChange={handleChange} required />
              </div>

              <div className="mb-3">
                <label className="form-label">Specialty</label>
                <select className="form-select" name="specialty"
                  value={signupData.specialty} onChange={handleChange} required>
                  <option value="">Select Specialty</option>
                  {specialties.map((s) => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>

              <div className="mb-3">
                <label className="form-label">Department</label>
                <select className="form-select" name="department"
                  value={signupData.department} onChange={handleChange} required>
                  <option value="">Select Department</option>
                  {departments.map((d) => <option key={d} value={d}>{d}</option>)}
                </select>
              </div>

              <div className="mb-4">
                <label className="form-label">Password</label>
                <input type="password" className="form-control" name="password"
                  placeholder="Enter password" value={signupData.password}
                  onChange={handleChange} required />
              </div>

              <button type="submit" className="btn btn-primary w-100" disabled={loading}>
                {loading ? "Registering..." : "Register"}
              </button>

              <p className="text-center mt-3 mb-0" style={{ fontSize: "14px" }}>
                Already have an account?{" "}
                <span className="text-primary" style={{ cursor: "pointer", textDecoration: "underline" }}
                  onClick={() => navigate("/login")}>
                  Login
                </span>
              </p>
            </form>
          </div>
        </div>
      </div>

      {showConfirm && (
        <div style={{ position: "fixed", inset: 0, backgroundColor: "rgba(0,0,0,0.5)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000 }}>
          <div className="card p-4 shadow" style={{ width: "100%", maxWidth: "360px" }}>
            <h5 className="mb-3">Confirm Registration</h5>
            <p className="mb-4">You are registering as a <strong>Doctor</strong>. Are you sure?</p>
            <div className="d-flex gap-2">
              <button className="btn btn-primary w-50" onClick={handleConfirmYes}>Yes, Register</button>
              <button className="btn btn-outline-secondary w-50" onClick={handleConfirmNo}>Cancel</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default DoctorRegistrationForm;
