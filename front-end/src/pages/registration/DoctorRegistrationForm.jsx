import React, { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../../Components/Navbar";

const DoctorRegistrationForm = () => {
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

  // ── FIX: use a REF for photoFile, not state ──────────────────────────────
  // State updates are async — by the time handleConfirmYes runs,
  // a stale closure could hold the OLD photoFile value (null).
  // A ref is always the latest value, no closure issues.
  const photoFileRef = useRef(null);

  const [signupData, setSignupData] = useState({
    fullName: "", email: "", phone: "", specialty: "", department: "", password: "",
  });

  const specialties = ["Cardiology", "Neurology", "Orthopedics", "Dermatology", "Pediatrics", "Oncology", "Radiology", "General Surgery", "Psychiatry", "ENT", "Ophthalmology", "Gynecology"];
  const departments = ["Emergency", "ICU", "OPD", "Surgery", "Inpatient", "Diagnostics", "Maternity", "Pediatric Ward"];

  const handleChange = (e) => { setSignupData({ ...signupData, [e.target.name]: e.target.value }); setError(""); };

  // Gallery upload
  const handlePhotoChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) { setError("Please select a valid image file."); return; }
    if (file.size > 5 * 1024 * 1024) { setError("Photo must be under 5MB."); return; }
    photoFileRef.current = file;                            // ← store in ref
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
      setTimeout(() => { if (videoRef.current) videoRef.current.srcObject = stream; }, 80);
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
    canvas.toBlob((blob) => {
      const file = new File([blob], "webcam-photo.jpg", { type: "image/jpeg" });
      photoFileRef.current = file;                          // ← store in ref
      setPhotoPreview(canvas.toDataURL("image/jpeg"));
      closeCam();
    }, "image/jpeg", 0.92);
  };

  const closeCam = () => {
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
    setCamOpen(false);
  };

  // Documents
  const handleDocsChange = (e) => {
    const files = Array.from(e.target.files);
    const allowed = ["application/pdf", "image/jpeg", "image/png", "image/jpg", "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document"];
    if (files.some(f => !allowed.includes(f.type))) { setError("Only PDF, JPG, PNG, DOC, DOCX files are allowed."); return; }
    if (files.some(f => f.size > 10 * 1024 * 1024)) { setError("Each document must be under 10MB."); return; }
    setDocuments(prev => { const ex = prev.map(f => f.name); return [...prev, ...files.filter(f => !ex.includes(f.name))]; });
    setError("");
    e.target.value = "";
  };

  const removeDocument = (i) => setDocuments(prev => prev.filter((_, idx) => idx !== i));
  const getFileIcon = (f) => f.type === "application/pdf" ? "📄" : f.type.startsWith("image/") ? "🖼️" : "📝";
  const formatSize = (b) => b < 1024 ? b + " B" : b < 1048576 ? (b / 1024).toFixed(1) + " KB" : (b / 1048576).toFixed(1) + " MB";

  const handleSubmit = (e) => { e.preventDefault(); setShowConfirm(true); };

  const handleConfirmYes = async () => {
    setShowConfirm(false);
    setLoading(true);
    setError("");

    try {
      const formData = new FormData();
      Object.entries(signupData).forEach(([k, v]) => formData.append(k, v));

      // ── FIX: read from ref — always the latest file, never stale ──────────
      const photo = photoFileRef.current;
      if (photo) {
        formData.append("photo", photo, photo.name);        // 3rd arg = filename hint
        console.log("Appending photo:", photo.name, photo.size, photo.type);
      } else {
        console.log("No photo selected");
      }

      documents.forEach((doc, i) => {
        formData.append("documents", doc, doc.name);
        console.log(`Appending doc[${i}]:`, doc.name, doc.size, doc.type);
      });

      // ── FIX: do NOT set Content-Type manually — browser must set it ───────
      // (with the multipart boundary). Any manual header here breaks multer.
      const res = await fetch("http://localhost:8080/api/postDoc", {
        method: "POST",
        body: formData,
        // NO headers: {} here — this is the #1 mistake that breaks file uploads
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.message || "Registration failed.");
      } else {
        setSuccess("Registration successful! Redirecting to login...");
        setSignupData({ fullName: "", email: "", phone: "", specialty: "", department: "", password: "" });
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
      <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/css/bootstrap.min.css" />
      <style>{`
        .container { height:180vh; display:flex; }
        .hc-bg { min-height:100vh; background:linear-gradient(135deg,#e8f4fd 0%,#f0f9f0 100%); position:relative; overflow:hidden; display:flex; align-items:center; justify-content:center; }
        .hc-bg-icons { position:fixed; inset:0; pointer-events:none; z-index:0; }
        .hc-bg-icons svg { position:absolute; opacity:0.18; }
        .hc-card-wrap { position:relative; z-index:1; width:100%; display:flex; justify-content:center; }
        .btn-primary { background-color:#1976d2; border-color:#1976d2; }
        .btn-primary:hover { background-color:#1565c0; border-color:#1565c0; }
        .alert-success-custom { background:#e8f5e9; border:1px solid #a5d6a7; color:#2e7d32; border-radius:8px; padding:10px 14px; font-size:14px; margin-bottom:12px; }
        .alert-error-custom { background:#ffebee; border:1px solid #ef9a9a; color:#c62828; border-radius:8px; padding:10px 14px; font-size:14px; margin-bottom:12px; }
        .photo-preview { width:90px; height:90px; border-radius:50%; object-fit:cover; border:3px solid #1976d2; display:block; margin:0 auto 8px; }
        .photo-placeholder { width:70px; height:70px; border-radius:50%; background:#bbdefb; display:flex; align-items:center; justify-content:center; margin:0 auto 8px; font-size:28px; }
        .photo-source-row { display:flex; gap:8px; margin-top:8px; }
        .photo-source-btn { flex:1; display:flex; align-items:center; justify-content:center; gap:6px; padding:9px 10px; border-radius:8px; font-size:13px; font-weight:600; cursor:pointer; transition:all 0.15s; border:1.5px solid #90caf9; background:#fff; color:#1976d2; }
        .photo-source-btn:hover { background:#e3f2fd; border-color:#1976d2; }
        .photo-source-btn.cam { border-color:#a5d6a7; color:#2e7d32; }
        .photo-source-btn.cam:hover { background:#e8f5e9; border-color:#388e3c; }
        .docs-upload-area { border:2px dashed #a5d6a7; border-radius:12px; padding:14px; background:#f5fff7; cursor:pointer; transition:border-color 0.2s,background 0.2s; text-align:center; }
        .docs-upload-area:hover { border-color:#388e3c; background:#e8f5e9; }
        .doc-item { display:flex; align-items:center; gap:8px; background:#fff; border:1px solid #e0e0e0; border-radius:8px; padding:7px 10px; margin-top:8px; font-size:13px; }
        .doc-item-name { flex:1; overflow:hidden; text-overflow:ellipsis; white-space:nowrap; }
        .doc-remove { background:none; border:none; color:#e53935; cursor:pointer; font-size:18px; padding:0 2px; line-height:1; }
        .section-label { font-size:12px; font-weight:700; color:#555; text-transform:uppercase; letter-spacing:0.6px; margin-bottom:10px; margin-top:4px; border-left:3px solid #1976d2; padding-left:8px; }
        .cam-overlay { position:fixed; inset:0; background:rgba(0,0,0,0.75); display:flex; align-items:center; justify-content:center; z-index:2000; }
        .cam-box { background:#111; border-radius:14px; overflow:hidden; width:100%; max-width:440px; }
        .cam-header { display:flex; justify-content:space-between; align-items:center; padding:12px 16px; background:#1a1a1a; color:#fff; font-weight:600; font-size:15px; }
        .cam-close { background:none; border:none; color:#aaa; font-size:22px; cursor:pointer; line-height:1; }
        .cam-close:hover { color:#fff; }
        .cam-video { width:100%; display:block; background:#000; }
        .cam-footer { padding:14px; background:#1a1a1a; display:flex; justify-content:center; }
        .cam-snap { width:58px; height:58px; border-radius:50%; background:#fff; border:4px solid #999; cursor:pointer; font-size:22px; display:flex; align-items:center; justify-content:center; transition:transform 0.1s; }
        .cam-snap:hover { transform:scale(1.07); background:#e3f2fd; }
        .cam-snap:active { transform:scale(0.93); }

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
      `}</style>

      <Navbar />

      {/* ✅ Back Button — correctly positioned & functional */}
          <button className="back-btn" type="button" onClick={() => navigate("/")}>
            <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" fill="currentColor" viewBox="0 0 16 16">
              <path fillRule="evenodd" d="M14.5 1.5a.5.5 0 0 1 .5.5v4.8a2.5 2.5 0 0 1-2.5 2.5H2.707l3.347 3.346a.5.5 0 0 1-.708.708l-4.2-4.2a.5.5 0 0 1 0-.708l4-4a.5.5 0 1 1 .708.708L2.707 8.3H12.5A1.5 1.5 0 0 0 14 6.8V2a.5.5 0 0 1 .5-.5" />
            </svg>
            Back
          </button>



      <div className="container">
        <div className="hc-bg">
          <div className="hc-bg-icons">
            <svg width="80" height="80" style={{ top: "5%", left: "5%" }} viewBox="0 0 80 80"><rect x="30" y="5" width="20" height="70" rx="4" fill="#2196F3" /><rect x="5" y="30" width="70" height="20" rx="4" fill="#2196F3" /></svg>
            <svg width="60" height="60" style={{ top: "15%", right: "8%" }} viewBox="0 0 80 80"><rect x="30" y="5" width="20" height="70" rx="4" fill="#2196F3" /><rect x="5" y="30" width="70" height="20" rx="4" fill="#2196F3" /></svg>
            <svg width="100" height="100" style={{ bottom: "10%", left: "3%" }} viewBox="0 0 80 80"><rect x="30" y="5" width="20" height="70" rx="4" fill="#2196F3" /><rect x="5" y="30" width="70" height="20" rx="4" fill="#2196F3" /></svg>
            <svg width="200" height="60" style={{ top: "8%", left: "30%" }} viewBox="0 0 200 60" fill="none"><path d="M0 30 L40 30 L55 10 L65 50 L75 20 L85 40 L95 30 L200 30" stroke="#e53935" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" /></svg>
            <svg width="70" height="70" style={{ top: "60%", right: "3%" }} viewBox="0 0 100 100"><path d="M50 85 L15 50 Q5 35 20 25 Q35 15 50 35 Q65 15 80 25 Q95 35 85 50 Z" fill="#e53935" /></svg>
          </div>

          

          <div className="hc-card-wrap">
            <div className="card shadow-sm p-4 m-3" style={{ width: "100%", maxWidth: "480px" }}>
              <h4 className="text-center mb-4">Doctor Sign Up</h4>

              {success && <div className="alert-success-custom">✓ {success}</div>}
              {error && <div className="alert-error-custom">⚠ {error}</div>}

              <form onSubmit={handleSubmit}>
                {/* Profile Photo */}
                <div className="mb-4">
                  <div className="section-label">Profile Photo</div>
                  <div style={{ textAlign: "center", marginBottom: 8 }}>
                    {photoPreview ? <img src={photoPreview} alt="Preview" className="photo-preview" /> : <div className="photo-placeholder">👤</div>}
                  </div>
                  <div className="photo-source-row">
                    <button type="button" className="photo-source-btn" onClick={() => photoRef.current.click()}>🖼️ Upload Photo</button>
                    <button type="button" className="photo-source-btn cam" onClick={openCam}>📷 Take Photo</button>
                  </div>
                  <input type="file" accept="image/*" ref={photoRef} style={{ display: "none" }} onChange={handlePhotoChange} />
                </div>

                <div className="section-label">Personal Information</div>
                <div className="mb-3"><label className="form-label">Full Name</label><input type="text" className="form-control" name="fullName" placeholder="Dr. Arunraj" value={signupData.fullName} onChange={handleChange} required /></div>
                <div className="mb-3"><label className="form-label">Email</label><input type="email" className="form-control" name="email" placeholder="arunraj@hospital.com" value={signupData.email} onChange={handleChange} required /></div>
                <div className="mb-3"><label className="form-label">Phone</label><input type="tel" className="form-control" name="phone" placeholder="+91 98765 43210" value={signupData.phone} onChange={handleChange} required /></div>
                <div className="mb-3"><label className="form-label">Specialty</label><select className="form-select" name="specialty" value={signupData.specialty} onChange={handleChange} required><option value="">Select Specialty</option>{specialties.map(s => <option key={s} value={s}>{s}</option>)}</select></div>
                <div className="mb-3"><label className="form-label">Department</label><select className="form-select" name="department" value={signupData.department} onChange={handleChange} required><option value="">Select Department</option>{departments.map(d => <option key={d} value={d}>{d}</option>)}</select></div>
                <div className="mb-4"><label className="form-label">Password</label><input type="password" className="form-control" name="password" placeholder="Enter password" value={signupData.password} onChange={handleChange} required /></div>

                <div className="mb-4">
                  <div className="section-label">Verification Documents</div>
                  <div className="docs-upload-area" onClick={() => docsRef.current.click()}>
                    <div style={{ fontSize: 22, marginBottom: 4 }}>📎</div>
                    <div style={{ fontSize: 13, color: "#388e3c", fontWeight: 500 }}>Click to upload documents</div>
                    <div style={{ fontSize: 11, color: "#888", marginTop: 3 }}>Medical license, degree certificates, ID · PDF, JPG, PNG, DOC · Max 10MB each</div>
                  </div>
                  <input type="file" accept=".pdf,.jpg,.jpeg,.png,.doc,.docx" multiple ref={docsRef} style={{ display: "none" }} onChange={handleDocsChange} />
                  {documents.length > 0 && (
                    <div style={{ marginTop: 4 }}>
                      {documents.map((doc, i) => (
                        <div key={i} className="doc-item">
                          <span>{getFileIcon(doc)}</span>
                          <span className="doc-item-name" title={doc.name}>{doc.name}</span>
                          <span style={{ color: "#999", fontSize: 11, whiteSpace: "nowrap" }}>{formatSize(doc.size)}</span>
                          <button type="button" className="doc-remove" onClick={() => removeDocument(i)}>×</button>
                        </div>
                      ))}
                      <div style={{ fontSize: 11, color: "#888", marginTop: 6, textAlign: "right" }}>{documents.length} file{documents.length > 1 ? "s" : ""} selected</div>
                    </div>
                  )}
                </div>

                <button type="submit" className="btn btn-primary w-100" disabled={loading}>{loading ? "Registering..." : "Register"}</button>
                <p className="text-center mt-3 mb-0" style={{ fontSize: "14px" }}>
                  Already have an account?{" "}
                  <span className="text-primary" style={{ cursor: "pointer", textDecoration: "underline" }} onClick={() => navigate("/login")}>Login</span>
                </p>
              </form>
            </div>
          </div>
        </div>

        {camOpen && (
          <div className="cam-overlay" onClick={(e) => { if (e.target === e.currentTarget) closeCam(); }}>
            <div className="cam-box">
              <div className="cam-header">
                <span>📷 Take a Photo</span>
                <button className="cam-close" onClick={closeCam}>×</button>
              </div>
              <video ref={videoRef} autoPlay playsInline muted className="cam-video" />
              <div className="cam-footer">
                <button className="cam-snap" onClick={snap} title="Snap photo">📸</button>
              </div>
            </div>
          </div>
        )}

        {showConfirm && (
          <div style={{ position: "fixed", inset: 0, backgroundColor: "rgba(0,0,0,0.5)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000 }}>
            <div className="card p-4 shadow" style={{ width: "100%", maxWidth: "360px" }}>
              <h5 className="mb-3">Confirm Registration</h5>
              <p className="mb-1">You are registering as a <strong>Doctor</strong>.</p>
              {photoPreview && <p className="mb-1" style={{ fontSize: 13, color: "#555" }}>✓ Profile photo attached</p>}
              {documents.length > 0 && <p className="mb-3" style={{ fontSize: 13, color: "#555" }}>✓ {documents.length} document{documents.length > 1 ? "s" : ""} attached</p>}
              <p className="mb-4">Are you sure you want to proceed?</p>
              <div className="d-flex gap-2">
                <button className="btn btn-primary w-50" onClick={handleConfirmYes}>Yes, Register</button>
                <button className="btn btn-outline-secondary w-50" onClick={() => setShowConfirm(false)}>Cancel</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default DoctorRegistrationForm;