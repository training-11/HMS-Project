import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

const ROLES = [
  {
    id: "doctor",
    label: "Doctor",
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
        <circle cx="12" cy="7" r="4" fill="currentColor" />
        <path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
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
        <path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
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
        <path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        <path d="M12 13v4M10 15h4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      </svg>
    ),
    color: "#2e7d32",
    bg: "#e8f5e9",
    border: "#a5d6a7",
  },
];

const Login = () => {
  const navigate = useNavigate();
  const [selectedRole, setSelectedRole] = useState("doctor");
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const activeRole = ROLES.find((r) => r.id === selectedRole);

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
        setError(data.message || "Login failed. Please check your credentials.");
      } else {
        if (data.token) localStorage.setItem("authToken", data.token);
        if (data.user) localStorage.setItem("userInfo", JSON.stringify({ ...data.user, role: selectedRole }));
        // Redirect based on role
        navigate(`/`);
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
  };

  return (
    <>
      <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/css/bootstrap.min.css" />
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
        }

        /* Decorative background SVGs */
        .bg-deco { position: fixed; inset: 0; pointer-events: none; z-index: 0; }
        .bg-deco svg { position: absolute; opacity: 0.15; }

        .login-card {
          position: relative;
          z-index: 1;
          width: 100%;
          max-width: 440px;
          background: #fff;
          border-radius: 20px;
          box-shadow: 0 8px 40px rgba(0,0,0,0.10);
          padding: 40px 36px 36px;
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
        }
        .hospital-name {
          font-size: 18px;
          font-weight: 700;
          color: #1a237e;
          letter-spacing: 0.3px;
        }

        .login-title {
          text-align: center;
          font-size: 22px;
          font-weight: 700;
          color: #1a1a2e;
          margin-bottom: 4px;
        }
        .login-subtitle {
          text-align: center;
          font-size: 13px;
          color: #9e9e9e;
          margin-bottom: 28px;
        }

        /* Role selector tabs */
        .role-tabs {
          display: flex;
          gap: 10px;
          margin-bottom: 28px;
          background: #f5f5f5;
          border-radius: 12px;
          padding: 5px;
        }
        .role-tab {
          flex: 1;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 6px;
          padding: 10px 6px;
          border-radius: 9px;
          cursor: pointer;
          border: 2px solid transparent;
          background: transparent;
          transition: all 0.2s ease;
          font-size: 12px;
          font-weight: 600;
          color: #757575;
        }
        .role-tab:hover { background: #eeeeee; }
        .role-tab.active {
          background: #fff;
          box-shadow: 0 2px 12px rgba(0,0,0,0.09);
          border-color: var(--role-border);
          color: var(--role-color);
        }
        .role-tab-icon {
          width: 36px; height: 36px;
          border-radius: 50%;
          display: flex; align-items: center; justify-content: center;
          background: #eeeeee;
          transition: background 0.2s;
        }
        .role-tab.active .role-tab-icon {
          background: var(--role-bg);
        }

        /* Form styles */
        .form-label {
          font-size: 13px;
          font-weight: 600;
          color: #424242;
          margin-bottom: 6px;
        }
        .form-control {
          border-radius: 10px;
          border: 1.5px solid #e0e0e0;
          padding: 10px 14px;
          font-size: 14px;
          transition: border-color 0.2s;
        }
        .form-control:focus {
          border-color: var(--role-color, #1976d2);
          box-shadow: 0 0 0 3px rgba(25,118,210,0.10);
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
          transition: opacity 0.2s, transform 0.1s;
          cursor: pointer;
          letter-spacing: 0.3px;
        }
        .btn-login:hover:not(:disabled) { opacity: 0.9; transform: translateY(-1px); }
        .btn-login:disabled { opacity: 0.65; cursor: not-allowed; }

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

        .divider {
          display: flex; align-items: center; gap: 10px;
          color: #bdbdbd; font-size: 12px; margin: 20px 0;
        }
        .divider::before, .divider::after {
          content: ''; flex: 1; height: 1px; background: #eeeeee;
        }

        .register-link {
          text-align: center;
          font-size: 13px;
          color: #757575;
        }
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
      `}</style>

      {/* CSS variables injected dynamically per role */}
      <style>{`
        :root {
          --role-color: ${activeRole.color};
          --role-bg: ${activeRole.bg};
          --role-border: ${activeRole.border};
        }
      `}</style>

      {/* Decorative background */}
      <div className="bg-deco">
        <svg width="80" height="80" style={{ top: "5%", left: "5%" }} viewBox="0 0 80 80">
          <rect x="30" y="5" width="20" height="70" rx="4" fill="#2196F3" />
          <rect x="5" y="30" width="70" height="20" rx="4" fill="#2196F3" />
        </svg>
        <svg width="60" height="60" style={{ top: "15%", right: "8%" }} viewBox="0 0 80 80">
          <rect x="30" y="5" width="20" height="70" rx="4" fill="#9c27b0" />
          <rect x="5" y="30" width="70" height="20" rx="4" fill="#9c27b0" />
        </svg>
        <svg width="100" height="100" style={{ bottom: "10%", left: "3%" }} viewBox="0 0 80 80">
          <rect x="30" y="5" width="20" height="70" rx="4" fill="#4caf50" />
          <rect x="5" y="30" width="70" height="20" rx="4" fill="#4caf50" />
        </svg>
        <svg width="200" height="60" style={{ top: "8%", left: "25%" }} viewBox="0 0 200 60" fill="none">
          <path d="M0 30 L40 30 L55 10 L65 50 L75 20 L85 40 L95 30 L200 30" stroke="#e53935" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
        <svg width="70" height="70" style={{ top: "55%", right: "3%" }} viewBox="0 0 100 100">
          <path d="M50 85 L15 50 Q5 35 20 25 Q35 15 50 35 Q65 15 80 25 Q95 35 85 50 Z" fill="#e53935" />
        </svg>
        <svg width="200" height="60" style={{ bottom: "5%", right: "10%" }} viewBox="0 0 200 60" fill="none">
          <path d="M0 30 L40 30 L55 10 L65 50 L75 20 L85 40 L95 30 L200 30" stroke="#e53935" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
        <svg width="45" height="45" style={{ top: "35%", right: "12%" }} viewBox="0 0 100 100">
          <path d="M50 85 L15 50 Q5 35 20 25 Q35 15 50 35 Q65 15 80 25 Q95 35 85 50 Z" fill="#2196F3" />
        </svg>
      </div>

      <div className="login-bg">
        <div className="login-card">

          {/* Hospital branding */}
          <div className="hospital-logo">
            <div className="hospital-logo-icon">
              <svg width="22" height="22" viewBox="0 0 80 80">
                <rect x="30" y="5" width="20" height="70" rx="4" fill="#1976d2" />
                <rect x="5" y="30" width="70" height="20" rx="4" fill="#1976d2" />
              </svg>
            </div>
            <span className="hospital-name">MediCare Portal</span>
          </div>

          <p className="login-title" style={{ marginTop: "18px" }}>Welcome Back</p>
          <p className="login-subtitle">Select your role and sign in to continue</p>

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
                <div className="role-tab-icon" style={{ color: selectedRole === role.id ? role.color : "#9e9e9e" }}>
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
                <circle cx="12" cy="12" r="10" stroke="#c62828" strokeWidth="2" />
                <path d="M12 8v4M12 16h.01" stroke="#c62828" strokeWidth="2" strokeLinecap="round" />
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
                  <span className="spinner-border spinner-border-sm border-white" role="status" />
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