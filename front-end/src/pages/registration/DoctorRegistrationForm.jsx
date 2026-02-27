import React, { useState } from "react";

const DoctorRegistrationForm = () => {
  const [page, setPage] = useState("signup");
  const [showConfirm, setShowConfirm] = useState(false);

  const [signupData, setSignupData] = useState({
    fullName: "",
    email: "",
    phone: "",
    specialty: "",
    department: "",
    password: "",
  });

  const [loginData, setLoginData] = useState({
    email: "",
    password: "",
  });

  const specialties = [
    "Cardiology",
    "Neurology",
    "Orthopedics",
    "Dermatology",
    "Pediatrics",
    "Oncology",
    "Radiology",
    "General Surgery",
    "Psychiatry",
    "ENT",
    "Ophthalmology",
    "Gynecology",
  ];

  const departments = [
    "Emergency",
    "ICU",
    "OPD",
    "Surgery",
    "Inpatient",
    "Diagnostics",
    "Maternity",
    "Pediatric Ward",
  ];

  const handleSignupChange = (e) => {
    setSignupData({ ...signupData, [e.target.name]: e.target.value });
  };

  const handleLoginChange = (e) => {
    setLoginData({ ...loginData, [e.target.name]: e.target.value });
  };

  const handleSignupSubmit = (e) => {
    e.preventDefault();
    setShowConfirm(true);
  };

  const handleConfirmYes = () => {
    setShowConfirm(false);
    console.log("Doctor registered:", signupData);
  };

  const handleConfirmNo = () => {
    setShowConfirm(false);
  };

  const handleLoginSubmit = (e) => {
    e.preventDefault();
    console.log("Doctor login:", loginData);
  };

  return (
    <>
      <link
        rel="stylesheet"
        href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/css/bootstrap.min.css"
      />

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
        .hc-bg-icons {
          position: fixed;
          inset: 0;
          pointer-events: none;
          z-index: 0;
        }
        .hc-bg-icons svg {
          position: absolute;
          opacity: 0.18;
        }
        .hc-card-wrap {
          position: relative;
          z-index: 1;
          width: 100%;
          display: flex;
          justify-content: center;
        }
      `}</style>

      <div className="hc-bg">
        <div className="hc-bg-icons">
          <svg
            width="80"
            height="80"
            style={{ top: "5%", left: "5%" }}
            viewBox="0 0 80 80"
          >
            <rect x="30" y="5" width="20" height="70" rx="4" fill="#2196F3" />
            <rect x="5" y="30" width="70" height="20" rx="4" fill="#2196F3" />
          </svg>
          <svg
            width="60"
            height="60"
            style={{ top: "15%", right: "8%" }}
            viewBox="0 0 80 80"
          >
            <rect x="30" y="5" width="20" height="70" rx="4" fill="#2196F3" />
            <rect x="5" y="30" width="70" height="20" rx="4" fill="#2196F3" />
          </svg>
          <svg
            width="100"
            height="100"
            style={{ bottom: "10%", left: "3%" }}
            viewBox="0 0 80 80"
          >
            <rect x="30" y="5" width="20" height="70" rx="4" fill="#2196F3" />
            <rect x="5" y="30" width="70" height="20" rx="4" fill="#2196F3" />
          </svg>
          <svg
            width="50"
            height="50"
            style={{ bottom: "20%", right: "5%" }}
            viewBox="0 0 80 80"
          >
            <rect x="30" y="5" width="20" height="70" rx="4" fill="#4CAF50" />
            <rect x="5" y="30" width="70" height="20" rx="4" fill="#4CAF50" />
          </svg>

          <svg
            width="120"
            height="120"
            style={{ top: "40%", left: "1%" }}
            viewBox="0 0 100 100"
            fill="none"
          >
            <path
              d="M25 10 Q25 40 50 50 Q75 60 75 80 Q75 95 60 95 Q45 95 45 80"
              stroke="#2196F3"
              strokeWidth="5"
              strokeLinecap="round"
              fill="none"
            />
            <circle cx="25" cy="10" r="6" fill="#2196F3" />
            <circle cx="35" cy="10" r="6" fill="#2196F3" />
            <circle
              cx="60"
              cy="95"
              r="10"
              stroke="#2196F3"
              strokeWidth="4"
              fill="none"
            />
          </svg>

          <svg
            width="200"
            height="60"
            style={{ top: "8%", left: "30%" }}
            viewBox="0 0 200 60"
            fill="none"
          >
            <path
              d="M0 30 L40 30 L55 10 L65 50 L75 20 L85 40 L95 30 L200 30"
              stroke="#e53935"
              strokeWidth="3"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          <svg
            width="200"
            height="60"
            style={{ bottom: "5%", right: "15%" }}
            viewBox="0 0 200 60"
            fill="none"
          >
            <path
              d="M0 30 L40 30 L55 10 L65 50 L75 20 L85 40 L95 30 L200 30"
              stroke="#e53935"
              strokeWidth="3"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>

          <svg
            width="70"
            height="70"
            style={{ top: "60%", right: "3%" }}
            viewBox="0 0 100 100"
          >
            <path
              d="M50 85 L15 50 Q5 35 20 25 Q35 15 50 35 Q65 15 80 25 Q95 35 85 50 Z"
              fill="#e53935"
            />
          </svg>
          <svg
            width="45"
            height="45"
            style={{ top: "30%", right: "12%" }}
            viewBox="0 0 100 100"
          >
            <path
              d="M50 85 L15 50 Q5 35 20 25 Q35 15 50 35 Q65 15 80 25 Q95 35 85 50 Z"
              fill="#e53935"
            />
          </svg>

          <svg
            width="80"
            height="40"
            style={{ bottom: "35%", left: "6%" }}
            viewBox="0 0 80 40"
            fill="none"
          >
            <rect x="2" y="2" width="76" height="36" rx="18" fill="#9c27b0" />
            <rect x="2" y="2" width="38" height="36" rx="18" fill="#7b1fa2" />
          </svg>
          <svg
            width="60"
            height="30"
            style={{ top: "75%", right: "10%" }}
            viewBox="0 0 80 40"
            fill="none"
          >
            <rect x="2" y="2" width="76" height="36" rx="18" fill="#9c27b0" />
            <rect x="2" y="2" width="38" height="36" rx="18" fill="#7b1fa2" />
          </svg>

          <svg
            width="150"
            height="50"
            style={{ bottom: "15%", left: "10%" }}
            viewBox="0 0 200 60"
            fill="none"
          >
            <path
              d="M0 30 L40 30 L55 10 L65 50 L75 20 L85 40 L95 30 L200 30"
              stroke="#e53935"
              strokeWidth="3"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>

        <div className="hc-card-wrap">
          <div
            className="card shadow-sm p-5 m-3"
            style={{ width: "100%", maxWidth: "450px" }}
          >
            <h4 className="text-center mb-4">
              {page === "signup" ? "Doctor Sign Up" : "Doctor Login"}
            </h4>

            {page === "signup" && (
              <form onSubmit={handleSignupSubmit}>
                <div className="mb-3">
                  <label className="form-label">Full Name</label>
                  <input
                    type="text"
                    className="form-control"
                    name="fullName"
                    placeholder="Dr. Arunraj"
                    value={signupData.fullName}
                    onChange={handleSignupChange}
                    required
                  />
                </div>

                <div className="mb-3">
                  <label className="form-label">Email</label>
                  <input
                    type="email"
                    className="form-control"
                    name="email"
                    placeholder="arunraj@hospital.com"
                    value={signupData.email}
                    onChange={handleSignupChange}
                    required
                  />
                </div>

                <div className="mb-3">
                  <label className="form-label">Phone</label>
                  <input
                    type="tel"
                    className="form-control"
                    name="phone"
                    placeholder="+91 98765 43210"
                    value={signupData.phone}
                    onChange={handleSignupChange}
                    required
                  />
                </div>

                <div className="mb-3">
                  <label className="form-label">Specialty</label>
                  <select
                    className="form-select"
                    name="specialty"
                    value={signupData.specialty}
                    onChange={handleSignupChange}
                    required
                  >
                    <option value="">Select Specialty</option>
                    {specialties.map((s) => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="mb-3">
                  <label className="form-label">Department</label>
                  <select
                    className="form-select"
                    name="department"
                    value={signupData.department}
                    onChange={handleSignupChange}
                    required
                  >
                    <option value="">Select Department</option>
                    {departments.map((d) => (
                      <option key={d} value={d}>
                        {d}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="mb-4">
                  <label className="form-label">Password</label>
                  <input
                    type="password"
                    className="form-control"
                    name="password"
                    placeholder="Enter password"
                    value={signupData.password}
                    onChange={handleSignupChange}
                    required
                  />
                </div>

                <button type="submit" className="btn btn-primary w-100">
                  Register
                </button>

                <p
                  className="text-center mt-3 mb-0"
                  style={{ fontSize: "14px" }}
                >
                  Already have an account?{" "}
                  <span
                    className="text-primary"
                    style={{ cursor: "pointer", textDecoration: "underline" }}
                    onClick={() => setPage("login")}
                  >
                    Login
                  </span>
                </p>
              </form>
            )}

            {page === "login" && (
              <form onSubmit={handleLoginSubmit}>
                <div className="mb-3">
                  <label className="form-label">Email</label>
                  <input
                    type="email"
                    className="form-control"
                    name="email"
                    placeholder="jane@hospital.com"
                    value={loginData.email}
                    onChange={handleLoginChange}
                    required
                  />
                </div>

                <div className="mb-4">
                  <label className="form-label">Password</label>
                  <input
                    type="password"
                    className="form-control"
                    name="password"
                    placeholder="Enter password"
                    value={loginData.password}
                    onChange={handleLoginChange}
                    required
                  />
                </div>

                <button type="submit" className="btn btn-primary w-100">
                  Login
                </button>

                <p
                  className="text-center mt-3 mb-0"
                  style={{ fontSize: "14px" }}
                >
                  Don't have an account?{" "}
                  <span
                    className="text-primary"
                    style={{ cursor: "pointer", textDecoration: "underline" }}
                    onClick={() => setPage("signup")}
                  >
                    Sign Up
                  </span>
                </p>
              </form>
            )}
          </div>
        </div>
      </div>

      {showConfirm && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            backgroundColor: "rgba(0,0,0,0.5)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 1000,
          }}
        >
          <div
            className="card p-4 shadow"
            style={{ width: "100%", maxWidth: "360px" }}
          >
            <h5 className="mb-3">Confirm Registration</h5>
            <p className="mb-4">
              You are registering as a <strong>Doctor</strong>. Are you sure?
            </p>
            <div className="d-flex gap-2">
              <button
                className="btn btn-primary w-50"
                onClick={handleConfirmYes}
              >
                Yes, Register
              </button>
              <button
                className="btn btn-outline-secondary w-50"
                onClick={handleConfirmNo}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default DoctorRegistrationForm;
