import React, { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
//import Navbar from "../../Components/Navbar";
import Navbar from "../Components/Navbar";

const AdminRegistrationForm = () => {
  const navigate = useNavigate();
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [photoPreview, setPhotoPreview] = useState(null);
  const [documents, setDocuments] = useState([]);
  const [camOpen, setCamOpen] = useState(false);

  const photoRef = useRef(null);
  const docsRef = useRef(null);
  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const photoFileRef = useRef(null);

  const [signupData, setSignupData] = useState({
    fullName: "",
    email: "",
    phone: "",
    employeeId: "",
    adminRole: "",
    accessLevel: "",
    department: "",
    password: "",
  });

  const adminRoles = [
    "Super Admin",
    "Hospital Admin",
    "Department Admin",
    "Records Admin",
    "Billing Admin",
    "IT Admin",
    "HR Admin",
    "Compliance Admin",
  ];

  const accessLevels = [
    "Full Access",
    "Read & Write",
    "Read Only",
    "Department Restricted",
  ];

  const departments = [
    "Hospital Management",
    "Human Resources",
    "Finance & Billing",
    "IT & Systems",
    "Medical Records",
    "Operations",
    "Compliance & Legal",
    "Patient Services",
  ];

  const handleChange = (e) => {
    setSignupData({ ...signupData, [e.target.name]: e.target.value });
    setError("");
  };

  // Gallery upload
  const handlePhotoChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      setError("Please select a valid image file.");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setError("Photo must be under 5MB.");
      return;
    }
    photoFileRef.current = file;
    const reader = new FileReader();
    reader.onloadend = () => setPhotoPreview(reader.result);
    reader.readAsDataURL(file);
    setError("");
  };

  // Webcam
  const openCam = async () => {
    setCamOpen(true);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      streamRef.current = stream;
      setTimeout(() => {
        if (videoRef.current) videoRef.current.srcObject = stream;
      }, 80);
    } catch {
      setError("Could not access webcam. Please allow camera permission.");
      setCamOpen(false);
    }
  };

  const snap = () => {
    const video = videoRef.current;
    const canvas = document.createElement("canvas");
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    canvas.getContext("2d").drawImage(video, 0, 0);
    canvas.toBlob(
      (blob) => {
        const file = new File([blob], "webcam-photo.jpg", {
          type: "image/jpeg",
        });
        photoFileRef.current = file;
        setPhotoPreview(canvas.toDataURL("image/jpeg"));
        closeCam();
      },
      "image/jpeg",
      0.92,
    );
  };

  const closeCam = () => {
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
    setCamOpen(false);
  };

  // Documents
  const handleDocsChange = (e) => {
    const files = Array.from(e.target.files);
    const allowed = [
      "application/pdf",
      "image/jpeg",
      "image/png",
      "image/jpg",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    ];
    if (files.some((f) => !allowed.includes(f.type))) {
      setError("Only PDF, JPG, PNG, DOC, DOCX files are allowed.");
      return;
    }
    if (files.some((f) => f.size > 10 * 1024 * 1024)) {
      setError("Each document must be under 10MB.");
      return;
    }
    setDocuments((prev) => {
      const ex = prev.map((f) => f.name);
      return [...prev, ...files.filter((f) => !ex.includes(f.name))];
    });
    setError("");
    e.target.value = "";
  };

  const removeDocument = (i) =>
    setDocuments((prev) => prev.filter((_, idx) => idx !== i));

  const getFileIcon = (f) =>
    f.type === "application/pdf"
      ? "📄"
      : f.type.startsWith("image/")
        ? "🖼️"
        : "📝";

  const formatSize = (b) =>
    b < 1024
      ? b + " B"
      : b < 1048576
        ? (b / 1024).toFixed(1) + " KB"
        : (b / 1048576).toFixed(1) + " MB";

  const handleSubmit = (e) => {
    e.preventDefault();
    setShowConfirm(true);
  };

  const handleConfirmYes = async () => {
    setShowConfirm(false);
    setLoading(true);
    setError("");

    try {
      const formData = new FormData();
      Object.entries(signupData).forEach(([k, v]) => formData.append(k, v));

      const photo = photoFileRef.current;
      if (photo) {
        formData.append("photo", photo, photo.name);
        console.log("Appending photo:", photo.name, photo.size, photo.type);
      }

      documents.forEach((doc, i) => {
        formData.append("documents", doc, doc.name);
        console.log(`Appending doc[${i}]:`, doc.name, doc.size, doc.type);
      });

      const res = await fetch("http://localhost:8080/api/postAdmin", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.message || "Registration failed.");
      } else {
        setSuccess("Admin registered successfully! Redirecting to login...");
        setSignupData({
          fullName: "",
          email: "",
          phone: "",
          employeeId: "",
          adminRole: "",
          accessLevel: "",
          department: "",
          password: "",
        });
        setPhotoPreview(null);
        photoFileRef.current = null;
        setDocuments([]);
        setTimeout(() => navigate("/login"), 1800);
      }
    } catch (err) {
      console.error("Submit error:", err);
      setError("Could not connect to server.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <link
        rel="stylesheet"
        href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/css/bootstrap.min.css"
      />
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&display=swap');

        * { font-family: 'DM Sans', sans-serif; }

        .admin-outer { min-height: 100vh; width: 100%; display: flex; flex-direction: column; }
        .admin-bg {
          flex: 1;
          min-height: 100vh;
          background: linear-gradient(135deg, #0f172a 0%, #1e293b 40%, #162032 100%);
          position: relative;
          overflow: hidden;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 100px 16px 60px;
        }

        /* Animated background grid */
        .admin-bg::before {
          content: '';
          position: fixed;
          inset: 0;
          background-image:
            linear-gradient(rgba(99,179,237,0.04) 1px, transparent 1px),
            linear-gradient(90deg, rgba(99,179,237,0.04) 1px, transparent 1px);
          background-size: 40px 40px;
          pointer-events: none;
          z-index: 0;
        }

        .admin-bg-deco { position: fixed; inset: 0; pointer-events: none; z-index: 0; overflow: hidden; }

        .deco-circle {
          position: absolute;
          border-radius: 50%;
          filter: blur(80px);
          opacity: 0.12;
        }
        .deco-circle-1 { width: 500px; height: 500px; background: #3b82f6; top: -150px; right: -100px; }
        .deco-circle-2 { width: 400px; height: 400px; background: #6366f1; bottom: -100px; left: -80px; }
        .deco-circle-3 { width: 300px; height: 300px; background: #0ea5e9; top: 40%; left: 20%; }

        /* Badge top of card */
        .admin-badge {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          background: rgba(59,130,246,0.15);
          border: 1px solid rgba(59,130,246,0.3);
          border-radius: 20px;
          padding: 4px 14px;
          font-size: 11px;
          font-weight: 700;
          letter-spacing: 1.2px;
          text-transform: uppercase;
          color: #93c5fd;
          margin-bottom: 16px;
        }
        .admin-badge-dot {
          width: 6px; height: 6px; border-radius: 50%;
          background: #3b82f6;
          animation: pulse-dot 1.8s ease-in-out infinite;
        }
        @keyframes pulse-dot {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.4; transform: scale(0.7); }
        }

        /* Card */
        .admin-card-wrap { position: relative; z-index: 1; width: 100%; display: flex; justify-content: center; }
        .admin-card {
          background: rgba(15, 23, 42, 0.85);
          backdrop-filter: blur(20px);
          border: 1px solid rgba(99,179,237,0.12);
          border-radius: 20px;
          padding: 36px 36px 32px;
          width: 100%;
          max-width: 500px;
          box-shadow: 0 25px 60px rgba(0,0,0,0.5), 0 0 0 1px rgba(255,255,255,0.04);
        }
        .admin-card h4 {
          color: #f1f5f9;
          font-weight: 700;
          font-size: 22px;
          margin-bottom: 4px;
        }
        .admin-card .subtitle {
          color: #64748b;
          font-size: 13px;
          margin-bottom: 24px;
        }

        /* Alerts */
        .alert-success-custom { background: rgba(16,185,129,0.1); border: 1px solid rgba(16,185,129,0.3); color: #6ee7b7; border-radius: 10px; padding: 10px 14px; font-size: 13px; margin-bottom: 16px; }
        .alert-error-custom { background: rgba(239,68,68,0.1); border: 1px solid rgba(239,68,68,0.3); color: #fca5a5; border-radius: 10px; padding: 10px 14px; font-size: 13px; margin-bottom: 16px; }

        /* Section label */
        .section-label {
          font-size: 10px;
          font-weight: 700;
          color: #475569;
          text-transform: uppercase;
          letter-spacing: 1.2px;
          margin-bottom: 12px;
          margin-top: 6px;
          display: flex;
          align-items: center;
          gap: 8px;
        }
        .section-label::after {
          content: '';
          flex: 1;
          height: 1px;
          background: rgba(99,179,237,0.1);
        }

        /* Inputs */
        .form-label { color: #94a3b8; font-size: 12px; font-weight: 600; margin-bottom: 5px; text-transform: uppercase; letter-spacing: 0.5px; }
        .form-control, .form-select {
          background: rgba(30, 41, 59, 0.8) !important;
          border: 1px solid rgba(99,179,237,0.15) !important;
          color: #e2e8f0 !important;
          border-radius: 10px !important;
          font-size: 14px !important;
          padding: 10px 14px !important;
          transition: border-color 0.2s, box-shadow 0.2s !important;
        }
        .form-control:focus, .form-select:focus {
          border-color: rgba(59,130,246,0.5) !important;
          box-shadow: 0 0 0 3px rgba(59,130,246,0.1) !important;
          background: rgba(30, 41, 59, 1) !important;
          outline: none !important;
        }
        .form-control::placeholder { color: #475569 !important; }
        .form-select option { background: #1e293b; color: #e2e8f0; }

        /* Photo section */
        .photo-preview { width: 88px; height: 88px; border-radius: 50%; object-fit: cover; border: 2px solid rgba(59,130,246,0.5); display: block; margin: 0 auto 10px; box-shadow: 0 0 0 4px rgba(59,130,246,0.1); }
        .photo-placeholder { width: 88px; height: 88px; border-radius: 50%; background: rgba(30,41,59,0.8); border: 2px dashed rgba(99,179,237,0.25); display: flex; align-items: center; justify-content: center; margin: 0 auto 10px; font-size: 30px; }
        .photo-source-row { display: flex; gap: 8px; margin-top: 10px; }
        .photo-source-btn {
          flex: 1;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 6px;
          padding: 9px 10px;
          border-radius: 9px;
          font-size: 12px;
          font-weight: 600;
          cursor: pointer;
          border: 1px solid rgba(99,179,237,0.2);
          background: rgba(30,41,59,0.8);
          color: #93c5fd;
          transition: all 0.15s;
        }
        .photo-source-btn:hover { background: rgba(59,130,246,0.1); border-color: rgba(59,130,246,0.4); }
        .photo-source-btn.cam { border-color: rgba(52,211,153,0.2); color: #6ee7b7; }
        .photo-source-btn.cam:hover { background: rgba(16,185,129,0.08); border-color: rgba(52,211,153,0.4); }

        /* Docs */
        .docs-upload-area {
          border: 2px dashed rgba(99,179,237,0.2);
          border-radius: 12px;
          padding: 16px;
          background: rgba(30,41,59,0.4);
          cursor: pointer;
          text-align: center;
          transition: all 0.2s;
        }
        .docs-upload-area:hover { border-color: rgba(59,130,246,0.5); background: rgba(59,130,246,0.05); }
        .doc-item { display: flex; align-items: center; gap: 8px; background: rgba(30,41,59,0.6); border: 1px solid rgba(99,179,237,0.1); border-radius: 8px; padding: 8px 10px; margin-top: 8px; font-size: 12px; color: #cbd5e1; }
        .doc-item-name { flex: 1; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
        .doc-remove { background: none; border: none; color: #f87171; cursor: pointer; font-size: 18px; padding: 0 2px; line-height: 1; }

        /* Submit button */
        .btn-admin {
          background: linear-gradient(135deg, #2563eb 0%, #3b82f6 100%);
          border: none;
          border-radius: 11px;
          color: #fff;
          font-weight: 700;
          font-size: 14px;
          letter-spacing: 0.3px;
          padding: 12px;
          width: 100%;
          cursor: pointer;
          transition: all 0.2s;
          box-shadow: 0 4px 15px rgba(37,99,235,0.35);
          position: relative;
          overflow: hidden;
        }
        .btn-admin::before {
          content: '';
          position: absolute;
          top: 0; left: -100%;
          width: 100%; height: 100%;
          background: linear-gradient(90deg, transparent, rgba(255,255,255,0.1), transparent);
          transition: left 0.4s;
        }
        .btn-admin:hover::before { left: 100%; }
        .btn-admin:hover { transform: translateY(-1px); box-shadow: 0 6px 20px rgba(37,99,235,0.45); }
        .btn-admin:active { transform: translateY(0); }
        .btn-admin:disabled { opacity: 0.6; cursor: not-allowed; transform: none; }

        /* Two-col grid */
        .two-col { display: grid; grid-template-columns: 1fr 1fr; gap: 14px; }
        @media (max-width: 480px) { .two-col { grid-template-columns: 1fr; } }

        /* Role badge preview */
        .role-preview {
          display: inline-flex;
          align-items: center;
          gap: 5px;
          background: rgba(99,102,241,0.15);
          border: 1px solid rgba(99,102,241,0.3);
          border-radius: 6px;
          padding: 3px 10px;
          font-size: 11px;
          font-weight: 600;
          color: #a5b4fc;
          margin-top: 6px;
        }

        /* Webcam overlay */
        .cam-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.85); display: flex; align-items: center; justify-content: center; z-index: 2000; }
        .cam-box { background: #0f172a; border: 1px solid rgba(99,179,237,0.15); border-radius: 16px; overflow: hidden; width: 100%; max-width: 440px; }
        .cam-header { display: flex; justify-content: space-between; align-items: center; padding: 14px 18px; background: rgba(30,41,59,0.8); color: #e2e8f0; font-weight: 600; font-size: 14px; }
        .cam-close { background: none; border: none; color: #64748b; font-size: 22px; cursor: pointer; }
        .cam-close:hover { color: #e2e8f0; }
        .cam-video { width: 100%; display: block; }
        .cam-footer { padding: 16px; background: rgba(30,41,59,0.8); display: flex; justify-content: center; }
        .cam-snap { width: 58px; height: 58px; border-radius: 50%; background: #2563eb; border: 3px solid rgba(99,179,237,0.3); cursor: pointer; font-size: 22px; display: flex; align-items: center; justify-content: center; transition: transform 0.1s, box-shadow 0.2s; box-shadow: 0 0 20px rgba(37,99,235,0.4); }
        .cam-snap:hover { transform: scale(1.07); box-shadow: 0 0 30px rgba(37,99,235,0.6); }
        .cam-snap:active { transform: scale(0.93); }

        /* Confirm modal */
        .confirm-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.75); display: flex; align-items: center; justify-content: center; z-index: 1000; }
        .confirm-box {
          background: #0f172a;
          border: 1px solid rgba(99,179,237,0.15);
          border-radius: 16px;
          padding: 28px;
          width: 100%;
          max-width: 360px;
          box-shadow: 0 20px 50px rgba(0,0,0,0.6);
        }
        .confirm-box h5 { color: #f1f5f9; font-weight: 700; margin-bottom: 12px; }
        .confirm-box p { color: #94a3b8; font-size: 13px; margin-bottom: 8px; }
        .confirm-box .check-item { color: #6ee7b7; font-size: 12px; margin-bottom: 6px; }
        .btn-confirm { background: linear-gradient(135deg, #2563eb, #3b82f6); border: none; border-radius: 9px; color: #fff; font-weight: 700; padding: 10px; cursor: pointer; font-size: 13px; }
        .btn-cancel { background: rgba(30,41,59,0.8); border: 1px solid rgba(99,179,237,0.15); border-radius: 9px; color: #94a3b8; font-weight: 600; padding: 10px; cursor: pointer; font-size: 13px; }
        .btn-cancel:hover { border-color: rgba(99,179,237,0.3); color: #cbd5e1; }

        /* Back button */
        .back-btn {
          position: fixed;
          top: 80px;
          left: 24px;
          z-index: 10;
          display: flex;
          align-items: center;
          gap: 7px;
          background: rgba(15,23,42,0.9);
          border: 1px solid rgba(99,179,237,0.2);
          border-radius: 10px;
          padding: 8px 14px;
          font-size: 13px;
          font-weight: 600;
          color: #94a3b8;
          cursor: pointer;
          backdrop-filter: blur(10px);
          box-shadow: 0 2px 12px rgba(0,0,0,0.3);
          transition: all 0.2s;
        }
        .back-btn:hover { color: #e2e8f0; border-color: rgba(59,130,246,0.4); transform: translateX(-2px); }

        .login-link { color: #60a5fa; cursor: pointer; text-decoration: underline; transition: color 0.15s; }
        .login-link:hover { color: #93c5fd; }
      `}</style>

      <Navbar />

      <button className="back-btn" type="button" onClick={() => navigate("/")}>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="14"
          height="14"
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

      <div className="admin-outer">
        <div className="admin-bg">
          <div className="admin-bg-deco">
            <div className="deco-circle deco-circle-1" />
            <div className="deco-circle deco-circle-2" />
            <div className="deco-circle deco-circle-3" />
          </div>

          <div className="admin-card-wrap">
            <div className="admin-card">
              {/* Header */}
              <div style={{ textAlign: "center", marginBottom: 8 }}>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "center",
                    marginBottom: 12,
                  }}
                >
                  <div className="admin-badge">
                    <span className="admin-badge-dot" />
                    Admin Portal
                  </div>
                </div>
                <h4>Admin Registration</h4>
                <p className="subtitle">Create a new administrator account</p>
              </div>

              {success && (
                <div className="alert-success-custom">✓ {success}</div>
              )}
              {error && <div className="alert-error-custom">⚠ {error}</div>}

              <form onSubmit={handleSubmit}>
                {/* Profile Photo */}
                <div className="mb-4">
                  <div className="section-label">Profile Photo</div>
                  <div style={{ textAlign: "center", marginBottom: 6 }}>
                    {photoPreview ? (
                      <img
                        src={photoPreview}
                        alt="Preview"
                        className="photo-preview"
                      />
                    ) : (
                      <div className="photo-placeholder">🛡️</div>
                    )}
                  </div>
                  <div className="photo-source-row">
                    <button
                      type="button"
                      className="photo-source-btn"
                      onClick={() => photoRef.current.click()}
                    >
                      🖼️ Upload Photo
                    </button>
                    <button
                      type="button"
                      className="photo-source-btn cam"
                      onClick={openCam}
                    >
                      📷 Take Photo
                    </button>
                  </div>
                  <input
                    type="file"
                    accept="image/*"
                    ref={photoRef}
                    style={{ display: "none" }}
                    onChange={handlePhotoChange}
                  />
                </div>

                {/* Personal Information */}
                <div className="section-label">Personal Information</div>
                <div className="two-col mb-3">
                  <div>
                    <label className="form-label">Full Name</label>
                    <input
                      type="text"
                      className="form-control"
                      name="fullName"
                      placeholder="John Smith"
                      value={signupData.fullName}
                      onChange={handleChange}
                      required
                    />
                  </div>
                  <div>
                    <label className="form-label">Employee ID</label>
                    <input
                      type="text"
                      className="form-control"
                      name="employeeId"
                      placeholder="EMP-00123"
                      value={signupData.employeeId}
                      onChange={handleChange}
                      required
                    />
                  </div>
                </div>
                <div className="mb-3">
                  <label className="form-label">Email</label>
                  <input
                    type="email"
                    className="form-control"
                    name="email"
                    placeholder="admin@hospital.com"
                    value={signupData.email}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div className="mb-4">
                  <label className="form-label">Phone</label>
                  <input
                    type="tel"
                    className="form-control"
                    name="phone"
                    placeholder="+91 98765 43210"
                    value={signupData.phone}
                    onChange={handleChange}
                    required
                  />
                </div>

                {/* Admin Role & Access */}
                <div className="section-label">Role & Access</div>
                <div className="two-col mb-3">
                  <div>
                    <label className="form-label">Admin Role</label>
                    <select
                      className="form-select"
                      name="adminRole"
                      value={signupData.adminRole}
                      onChange={handleChange}
                      required
                    >
                      <option value="">Select Role</option>
                      {adminRoles.map((r) => (
                        <option key={r} value={r}>
                          {r}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="form-label">Access Level</label>
                    <select
                      className="form-select"
                      name="accessLevel"
                      value={signupData.accessLevel}
                      onChange={handleChange}
                      required
                    >
                      <option value="">Select Level</option>
                      {accessLevels.map((a) => (
                        <option key={a} value={a}>
                          {a}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
                <div className="mb-4">
                  <label className="form-label">Department</label>
                  <select
                    className="form-select"
                    name="department"
                    value={signupData.department}
                    onChange={handleChange}
                    required
                  >
                    <option value="">Select Department</option>
                    {departments.map((d) => (
                      <option key={d} value={d}>
                        {d}
                      </option>
                    ))}
                  </select>
                  {signupData.adminRole && (
                    <div>
                      <span className="role-preview">
                        🛡️ {signupData.adminRole}
                      </span>
                    </div>
                  )}
                </div>

                {/* Password */}
                <div className="section-label">Security</div>
                <div className="mb-4">
                  <label className="form-label">Password</label>
                  <input
                    type="password"
                    className="form-control"
                    name="password"
                    placeholder="Enter a strong password"
                    value={signupData.password}
                    onChange={handleChange}
                    required
                  />
                </div>

                {/* Documents */}
                <div className="mb-4">
                  <div className="section-label">Verification Documents</div>
                  <div
                    className="docs-upload-area"
                    onClick={() => docsRef.current.click()}
                  >
                    <div style={{ fontSize: 22, marginBottom: 4 }}>📎</div>
                    <div
                      style={{
                        fontSize: 13,
                        color: "#60a5fa",
                        fontWeight: 500,
                      }}
                    >
                      Click to upload documents
                    </div>
                    <div
                      style={{ fontSize: 11, color: "#475569", marginTop: 3 }}
                    >
                      Government ID, appointment letter, clearance · PDF, JPG,
                      PNG, DOC · Max 10MB each
                    </div>
                  </div>
                  <input
                    type="file"
                    accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                    multiple
                    ref={docsRef}
                    style={{ display: "none" }}
                    onChange={handleDocsChange}
                  />
                  {documents.length > 0 && (
                    <div style={{ marginTop: 4 }}>
                      {documents.map((doc, i) => (
                        <div key={i} className="doc-item">
                          <span>{getFileIcon(doc)}</span>
                          <span className="doc-item-name" title={doc.name}>
                            {doc.name}
                          </span>
                          <span
                            style={{
                              color: "#475569",
                              fontSize: 11,
                              whiteSpace: "nowrap",
                            }}
                          >
                            {formatSize(doc.size)}
                          </span>
                          <button
                            type="button"
                            className="doc-remove"
                            onClick={() => removeDocument(i)}
                          >
                            ×
                          </button>
                        </div>
                      ))}
                      <div
                        style={{
                          fontSize: 11,
                          color: "#475569",
                          marginTop: 6,
                          textAlign: "right",
                        }}
                      >
                        {documents.length} file{documents.length > 1 ? "s" : ""}{" "}
                        selected
                      </div>
                    </div>
                  )}
                </div>

                <button type="submit" className="btn-admin" disabled={loading}>
                  {loading ? "Registering..." : "Create Admin Account"}
                </button>

                <p
                  className="text-center mt-3 mb-0"
                  style={{ fontSize: "13px", color: "#64748b" }}
                >
                  Already have an account?{" "}
                  <span
                    className="login-link"
                    onClick={() => navigate("/login")}
                  >
                    Login
                  </span>
                </p>
              </form>
            </div>
          </div>
        </div>
      </div>

      {/* Webcam Overlay */}
      {camOpen && (
        <div
          className="cam-overlay"
          onClick={(e) => {
            if (e.target === e.currentTarget) closeCam();
          }}
        >
          <div className="cam-box">
            <div className="cam-header">
              <span>📷 Take a Photo</span>
              <button className="cam-close" onClick={closeCam}>
                ×
              </button>
            </div>
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className="cam-video"
            />
            <div className="cam-footer">
              <button className="cam-snap" onClick={snap} title="Snap photo">
                📸
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Confirm Modal */}
      {showConfirm && (
        <div className="confirm-overlay">
          <div className="confirm-box">
            <h5>Confirm Registration</h5>
            <p>
              You are registering as an{" "}
              <strong style={{ color: "#93c5fd" }}>Administrator</strong>.
            </p>
            {signupData.adminRole && (
              <p className="check-item">✓ Role: {signupData.adminRole}</p>
            )}
            {signupData.accessLevel && (
              <p className="check-item">✓ Access: {signupData.accessLevel}</p>
            )}
            {photoPreview && (
              <p className="check-item">✓ Profile photo attached</p>
            )}
            {documents.length > 0 && (
              <p className="check-item">
                ✓ {documents.length} document{documents.length > 1 ? "s" : ""}{" "}
                attached
              </p>
            )}
            <p style={{ marginTop: 12, marginBottom: 20 }}>
              Are you sure you want to proceed?
            </p>
            <div style={{ display: "flex", gap: 10 }}>
              <button
                className="btn-confirm"
                style={{ flex: 1 }}
                onClick={handleConfirmYes}
              >
                Yes, Register
              </button>
              <button
                className="btn-cancel"
                style={{ flex: 1 }}
                onClick={() => setShowConfirm(false)}
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

export default AdminRegistrationForm;
