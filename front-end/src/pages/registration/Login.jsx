import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../../Components/Navbar";

const ROLES = [
  {
    id: "doctor",
    label: "Doctor",
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
        <circle cx="12" cy="7" r="4" fill="currentColor" />
        <path
          d="M4 20c0-4 3.6-7 8-7s8 3 8 7"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
        />
        <rect x="16" y="13" width="2" height="5" rx="1" fill="currentColor" />
        <rect x="14" y="15" width="6" height="2" rx="1" fill="currentColor" />
      </svg>
    ),
    color: "#1976d2",
    bg: "#e3f2fd",
    border: "#90caf9",
  },
  {
    id: "nurse",
    label: "Nurse",
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
        <circle cx="12" cy="7" r="4" fill="currentColor" />
        <path
          d="M4 20c0-4 3.6-7 8-7s8 3 8 7"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
        />
        <rect x="11" y="2" width="2" height="5" rx="1" fill="currentColor" />
        <rect x="9.5" y="3.5" width="5" height="2" rx="1" fill="currentColor" />
      </svg>
    ),
    color: "#7b1fa2",
    bg: "#f3e5f5",
    border: "#ce93d8",
  },
  {
    id: "patient",
    label: "Patient",
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
        <circle cx="12" cy="7" r="4" fill="currentColor" />
        <path
          d="M4 20c0-4 3.6-7 8-7s8 3 8 7"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
        />
        <path
          d="M12 13v4M10 15h4"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
        />
      </svg>
    ),
    color: "#2e7d32",
    bg: "#e8f5e9",
    border: "#a5d6a7",
  },
  {
    id: "admin",
    label: "Admin",
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
        <path
          d="M12 2L3 6v6c0 5.25 3.75 10.15 9 11.25C17.25 22.15 21 17.25 21 12V6L12 2z"
          fill="currentColor"
          opacity="0.85"
        />
        <path
          d="M9 12l2 2 4-4"
          stroke="#fff"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    ),
    color: "#1a237e",
    bg: "#e8eaf6",
    border: "#9fa8da",
  },
];

const Login = () => {
  const navigate = useNavigate();
  const [selectedRole, setSelectedRole] = useState("doctor");
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const activeRole = ROLES.find((r) => r.id === selectedRole) || ROLES[0];

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError("");
  };

  const handleRoleSelect = (role) => {
    setSelectedRole(role);
    setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const res = await fetch("http://localhost:8080/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...formData, role: selectedRole }),
      });
      const data = await res.json();
if (!res.ok) {
  // 🔥 Admin approval pending
  if (data.message === "Waiting for admin approval") {
    setError("Your account is not approved yet. Please wait for admin approval.");
  } 
  // 🔥 Rejected case (optional)
  else if (data.message === "Account rejected") {
    setError("Your account was rejected by admin.");
  } 
  else {
    setError(
      data.message || "Login failed. Please check your credentials.",
    );
  }
} else {
        if (data.token) localStorage.setItem("authToken", data.token);
        if (data.user)
          localStorage.setItem(
            "userInfo",
            JSON.stringify({ ...data.user, role: selectedRole }),
          );
        if (selectedRole === "admin") {
          navigate("/admin-dashboard");
        } else if (selectedRole === "doctor") {
          navigate("/doctor-appointments");
        } else if (selectedRole === "nurse") {
          navigate("/nurse-appointments");
        } else {
          navigate(`/`);
        }
      }
    } catch (err) {
      setError("Could not connect to server. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const registerPaths = {
    doctor: "/doctor-register",
    nurse: "/nurse-register",
    patient: "/patient-register",
    admin: "/admin-register",
  };

  const isAdmin = selectedRole === "admin";

  return (
    <>
      <link
        rel="stylesheet"
        href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/css/bootstrap.min.css"
      />
      <style>{`
        * { box-sizing: border-box; }

        .login-bg {
          min-height: 100vh;
          background: linear-gradient(135deg, #e8f4fd 0%, #f0f9f0 100%);
          display: flex;
          align-items: center;
          justify-content: center;
          position: relative;
          overflow: hidden;
          padding: 24px;
          transition: background 0.4s ease;
        }

        .login-bg.admin-mode {
          background: linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #0f172a 100%);
        }

        /* Decorative background SVGs */
        .bg-deco { position: fixed; inset: 0; pointer-events: none; z-index: 0; }
        .bg-deco svg { position: absolute; opacity: 0.15; }

        /* Admin bg deco */
        .admin-bg-deco { position: fixed; inset: 0; pointer-events: none; z-index: 0; overflow: hidden; }
        .admin-glow {
          position: absolute;
          border-radius: 50%;
          filter: blur(90px);
          opacity: 0;
          transition: opacity 0.5s ease;
        }
        .admin-mode ~ .admin-bg-deco .admin-glow,
        .admin-glow.visible { opacity: 0.1; }
        .admin-grid {
          position: fixed;
          inset: 0;
          background-image:
            linear-gradient(rgba(99,179,237,0.04) 1px, transparent 1px),
            linear-gradient(90deg, rgba(99,179,237,0.04) 1px, transparent 1px);
          background-size: 40px 40px;
          pointer-events: none;
          z-index: 0;
          opacity: 0;
          transition: opacity 0.5s ease;
        }

        .login-card {
          position: relative;
          z-index: 1;
          width: 100%;
          max-width: 440px;
          background: #fff;
          border-radius: 20px;
          box-shadow: 0 8px 40px rgba(0,0,0,0.10);
          padding: 40px 36px 36px;
          transition: background 0.4s ease, border-color 0.4s ease, box-shadow 0.4s ease;
        }

        .login-card.admin-mode {
          background: rgba(15, 23, 42, 0.92);
          border: 1px solid rgba(99,179,237,0.14);
          box-shadow: 0 25px 60px rgba(0,0,0,0.55), 0 0 0 1px rgba(255,255,255,0.04);
        }

        /* Hospital logo area */
        .hospital-logo {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 10px;
          margin-bottom: 6px;
        }
        .hospital-logo-icon {
          width: 40px; height: 40px;
          background: #e3f2fd;
          border-radius: 10px;
          display: flex; align-items: center; justify-content: center;
          transition: background 0.3s;
        }
        .admin-mode .hospital-logo-icon { background: rgba(26,35,126,0.3); }
        .hospital-name {
          font-size: 18px;
          font-weight: 700;
          color: #1a237e;
          letter-spacing: 0.3px;
          transition: color 0.3s;
        }
        .admin-mode .hospital-name { color: #93c5fd; }

        .login-title {
          text-align: center;
          font-size: 22px;
          font-weight: 700;
          color: #1a1a2e;
          margin-bottom: 4px;
          transition: color 0.3s;
        }
        .admin-mode .login-title { color: #f1f5f9; }

        .login-subtitle {
          text-align: center;
          font-size: 13px;
          color: #9e9e9e;
          margin-bottom: 28px;
          transition: color 0.3s;
        }
        .admin-mode .login-subtitle { color: #475569; }

        /* Admin badge */
        .admin-role-badge {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 6px;
          background: rgba(26,35,126,0.12);
          border: 1px solid rgba(159,168,218,0.35);
          border-radius: 20px;
          padding: 4px 14px;
          font-size: 10px;
          font-weight: 700;
          letter-spacing: 1.2px;
          text-transform: uppercase;
          color: #7986cb;
          margin: 0 auto 14px;
          width: fit-content;
          animation: fadeIn 0.3s ease;
        }
        .admin-mode .admin-role-badge {
          background: rgba(59,130,246,0.12);
          border-color: rgba(59,130,246,0.3);
          color: #93c5fd;
        }
        .badge-dot {
          width: 6px; height: 6px; border-radius: 50%;
          background: currentColor;
          animation: pulse-dot 1.8s ease-in-out infinite;
        }
        @keyframes pulse-dot {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.4; transform: scale(0.7); }
        }
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(-4px); }
          to { opacity: 1; transform: translateY(0); }
        }

        /* Role selector tabs */
        .role-tabs {
          display: flex;
          gap: 8px;
          margin-bottom: 28px;
          background: #f5f5f5;
          border-radius: 12px;
          padding: 5px;
          transition: background 0.3s;
        }
        .admin-mode .role-tabs { background: rgba(30,41,59,0.8); }

        .role-tab {
          flex: 1;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 5px;
          padding: 9px 4px;
          border-radius: 9px;
          cursor: pointer;
          border: 2px solid transparent;
          background: transparent;
          transition: all 0.2s ease;
          font-size: 11px;
          font-weight: 600;
          color: #757575;
        }
        .admin-mode .role-tab { color: #475569; }
        .role-tab:hover { background: #eeeeee; }
        .admin-mode .role-tab:hover { background: rgba(99,179,237,0.07); color: #94a3b8; }
        .role-tab.active {
          background: #fff;
          box-shadow: 0 2px 12px rgba(0,0,0,0.09);
          border-color: var(--role-border);
          color: var(--role-color);
        }
        .admin-mode .role-tab.active {
          background: rgba(15,23,42,0.9);
          box-shadow: 0 2px 12px rgba(0,0,0,0.3);
        }
        .role-tab-icon {
          width: 34px; height: 34px;
          border-radius: 50%;
          display: flex; align-items: center; justify-content: center;
          background: #eeeeee;
          transition: background 0.2s;
        }
        .admin-mode .role-tab-icon { background: rgba(30,41,59,0.6); }
        .role-tab.active .role-tab-icon { background: var(--role-bg); }
        .admin-mode .role-tab.active .role-tab-icon { background: var(--role-bg); }

        /* Form styles */
        .form-label {
          font-size: 12px;
          font-weight: 600;
          color: #424242;
          margin-bottom: 6px;
          transition: color 0.3s;
        }
        .admin-mode .form-label {
          color: #94a3b8;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }
        .form-control {
          border-radius: 10px;
          border: 1.5px solid #e0e0e0;
          padding: 10px 14px;
          font-size: 14px;
          transition: border-color 0.2s, background 0.3s, color 0.3s;
        }
        .admin-mode .form-control {
          background: rgba(30,41,59,0.8) !important;
          border-color: rgba(99,179,237,0.15) !important;
          color: #e2e8f0 !important;
        }
        .admin-mode .form-control::placeholder { color: #475569 !important; }
        .form-control:focus {
          border-color: var(--role-color, #1976d2);
          box-shadow: 0 0 0 3px rgba(25,118,210,0.10);
        }
        .admin-mode .form-control:focus {
          border-color: rgba(59,130,246,0.5) !important;
          box-shadow: 0 0 0 3px rgba(59,130,246,0.1) !important;
          background: rgba(30,41,59,1) !important;
        }

        .btn-login {
          width: 100%;
          padding: 12px;
          border-radius: 10px;
          border: none;
          font-weight: 700;
          font-size: 15px;
          color: #fff;
          background: var(--role-color, #1976d2);
          transition: opacity 0.2s, transform 0.1s, box-shadow 0.2s;
          cursor: pointer;
          letter-spacing: 0.3px;
        }
        .btn-login:hover:not(:disabled) { opacity: 0.9; transform: translateY(-1px); }
        .btn-login:disabled { opacity: 0.65; cursor: not-allowed; }

        /* Admin login button override */
        .admin-mode .btn-login {
          background: linear-gradient(135deg, #2563eb 0%, #3b82f6 100%) !important;
          box-shadow: 0 4px 15px rgba(37,99,235,0.35);
          position: relative;
          overflow: hidden;
        }
        .admin-mode .btn-login::before {
          content: '';
          position: absolute;
          top: 0; left: -100%;
          width: 100%; height: 100%;
          background: linear-gradient(90deg, transparent, rgba(255,255,255,0.1), transparent);
          transition: left 0.4s;
        }
        .admin-mode .btn-login:hover::before { left: 100%; }
        .admin-mode .btn-login:hover:not(:disabled) {
          opacity: 1;
          box-shadow: 0 6px 20px rgba(37,99,235,0.45);
        }

        .error-box {
          background: #ffebee;
          border: 1px solid #ef9a9a;
          color: #c62828;
          border-radius: 9px;
          padding: 10px 14px;
          font-size: 13px;
          margin-bottom: 16px;
          display: flex;
          align-items: center;
          gap: 8px;
        }
        .admin-mode .error-box {
          background: rgba(239,68,68,0.1);
          border-color: rgba(239,68,68,0.3);
          color: #fca5a5;
        }

        .divider {
          display: flex; align-items: center; gap: 10px;
          color: #bdbdbd; font-size: 12px; margin: 20px 0;
        }
        .divider::before, .divider::after {
          content: ''; flex: 1; height: 1px; background: #eeeeee;
        }
        .admin-mode .divider { color: #334155; }
        .admin-mode .divider::before, .admin-mode .divider::after { background: rgba(99,179,237,0.1); }

        .register-link {
          text-align: center;
          font-size: 13px;
          color: #757575;
        }
        .admin-mode .register-link { color: #475569; }
        .register-link span {
          font-weight: 600;
          cursor: pointer;
          text-decoration: underline;
          text-underline-offset: 2px;
        }

        .spinner-border-sm {
          width: 14px; height: 14px;
          border-width: 2px;
          margin-right: 8px;
          vertical-align: middle;
        }

        /* Back Button */
        .back-btn {
          position: absolute;
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
        .admin-mode ~ .back-btn,
        .back-btn.admin-mode {
          background: rgba(15,23,42,0.9);
          border-color: rgba(99,179,237,0.2);
          color: #94a3b8;
        }
        .back-btn.admin-mode:hover {
          background: rgba(30,41,59,0.9);
          border-color: rgba(59,130,246,0.4);
          color: #e2e8f0;
        }
      `}</style>

      {/* CSS variables per role */}
      <style>{`
        :root {
          --role-color: ${activeRole.color};
          --role-bg: ${activeRole.bg};
          --role-border: ${activeRole.border};
        }
      `}</style>

      <Navbar />

      {/* Decorative background — hidden in admin mode via opacity */}
      <div
        className="bg-deco"
        style={{ opacity: isAdmin ? 0 : 1, transition: "opacity 0.4s" }}
      >
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
          <rect x="30" y="5" width="20" height="70" rx="4" fill="#9c27b0" />
          <rect x="5" y="30" width="70" height="20" rx="4" fill="#9c27b0" />
        </svg>
        <svg
          width="100"
          height="100"
          style={{ bottom: "10%", left: "3%" }}
          viewBox="0 0 80 80"
        >
          <rect x="30" y="5" width="20" height="70" rx="4" fill="#4caf50" />
          <rect x="5" y="30" width="70" height="20" rx="4" fill="#4caf50" />
        </svg>
        <svg
          width="200"
          height="60"
          style={{ top: "8%", left: "25%" }}
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
          style={{ top: "55%", right: "3%" }}
          viewBox="0 0 100 100"
        >
          <path
            d="M50 85 L15 50 Q5 35 20 25 Q35 15 50 35 Q65 15 80 25 Q95 35 85 50 Z"
            fill="#e53935"
          />
        </svg>
        <svg
          width="200"
          height="60"
          style={{ bottom: "5%", right: "10%" }}
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
          width="45"
          height="45"
          style={{ top: "35%", right: "12%" }}
          viewBox="0 0 100 100"
        >
          <path
            d="M50 85 L15 50 Q5 35 20 25 Q35 15 50 35 Q65 15 80 25 Q95 35 85 50 Z"
            fill="#2196F3"
          />
        </svg>
      </div>

      {/* Admin dark glow blobs */}
      <div
        style={{
          position: "fixed",
          inset: 0,
          pointerEvents: "none",
          zIndex: 0,
          overflow: "hidden",
          opacity: isAdmin ? 1 : 0,
          transition: "opacity 0.5s",
        }}
      >
        <div
          style={{
            position: "absolute",
            width: 500,
            height: 500,
            borderRadius: "50%",
            background: "#3b82f6",
            filter: "blur(100px)",
            opacity: 0.08,
            top: -150,
            right: -100,
          }}
        />
        <div
          style={{
            position: "absolute",
            width: 400,
            height: 400,
            borderRadius: "50%",
            background: "#6366f1",
            filter: "blur(100px)",
            opacity: 0.08,
            bottom: -100,
            left: -80,
          }}
        />
        <div
          style={{
            position: "absolute",
            inset: 0,
            backgroundImage:
              "linear-gradient(rgba(99,179,237,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(99,179,237,0.04) 1px, transparent 1px)",
            backgroundSize: "40px 40px",
          }}
        />
      </div>

      <div className={`login-bg${isAdmin ? " admin-mode" : ""}`}>
        <button
          className={`back-btn${isAdmin ? " admin-mode" : ""}`}
          type="button"
          onClick={() => navigate(-1)}
        >
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

        <div className={`login-card${isAdmin ? " admin-mode" : ""}`}>
          {/* Hospital branding */}
          <div className="hospital-logo">
            <div className="hospital-logo-icon">
              <svg width="22" height="22" viewBox="0 0 80 80">
                <rect
                  x="30"
                  y="5"
                  width="20"
                  height="70"
                  rx="4"
                  fill={isAdmin ? "#3b82f6" : "#1976d2"}
                />
                <rect
                  x="5"
                  y="30"
                  width="70"
                  height="20"
                  rx="4"
                  fill={isAdmin ? "#3b82f6" : "#1976d2"}
                />
              </svg>
            </div>
            <span className="hospital-name">MediCare Portal</span>
          </div>

          {/* Admin badge — only shows when Admin tab is active */}
          {isAdmin && (
            <div className="admin-role-badge">
              <span className="badge-dot" />
              Admin Portal
            </div>
          )}

          <p
            className="login-title"
            style={{ marginTop: isAdmin ? 0 : "18px" }}
          >
            {isAdmin ? "Admin Sign In" : "Welcome Back"}
          </p>
          <p className="login-subtitle">
            {isAdmin
              ? "Secure access for authorized administrators"
              : "Select your role and sign in to continue"}
          </p>

          {/* Role selector */}
          <div className="role-tabs">
            {ROLES.map((role) => (
              <button
                key={role.id}
                className={`role-tab${selectedRole === role.id ? " active" : ""}`}
                style={{
                  "--role-color": role.color,
                  "--role-bg": role.bg,
                  "--role-border": role.border,
                }}
                onClick={() => handleRoleSelect(role.id)}
                type="button"
              >
                <div
                  className="role-tab-icon"
                  style={{
                    color:
                      selectedRole === role.id
                        ? role.color
                        : isAdmin
                          ? "#475569"
                          : "#9e9e9e",
                  }}
                >
                  {role.icon}
                </div>
                {role.label}
              </button>
            ))}
          </div>

          {/* Error */}
          {error && (
            <div className="error-box">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                <circle
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="2"
                />
                <path
                  d="M12 8v4M12 16h.01"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                />
              </svg>
              {error}
            </div>
          )}

          {/* Login form */}
          <form onSubmit={handleSubmit}>
            <div className="mb-3">
              <label className="form-label">Email Address</label>
              <input
                type="email"
                className="form-control"
                name="email"
                placeholder={`Enter your ${activeRole.label.toLowerCase()} email`}
                value={formData.email}
                onChange={handleChange}
                required
                autoFocus
              />
            </div>

            <div className="mb-4">
              <label className="form-label">Password</label>
              <input
                type="password"
                className="form-control"
                name="password"
                placeholder="Enter your password"
                value={formData.password}
                onChange={handleChange}
                required
              />
            </div>

            <button type="submit" className="btn-login" disabled={loading}>
              {loading ? (
                <>
                  <span
                    className="spinner-border spinner-border-sm border-white"
                    role="status"
                  />
                  Signing in...
                </>
              ) : (
                `Login as ${activeRole.label}`
              )}
            </button>
          </form>

          <div className="divider">or</div>

          <p className="register-link">
            Don't have an account?{" "}
            <span
              style={{ color: activeRole.color }}
              onClick={() => navigate(registerPaths[selectedRole])}
            >
              Register as {activeRole.label}
            </span>
          </p>
        </div>
      </div>
    </>
  );
};

export default Login;
