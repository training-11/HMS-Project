import React, { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../../Components/Navbar";

const PHONE_REGEX = /^\d{10}$/;
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function PatientRegistrationForm() {
  const navigate = useNavigate();

  const [photoPreview, setPhotoPreview] = useState(null);
  const [documents, setDocuments] = useState([]);
  const [camOpen, setCamOpen] = useState(false);
  const [showLoginConfirm, setShowLoginConfirm] = useState(false);
  const [error, setError] = useState("");

  const photoRef = useRef(null);
  const docsRef = useRef(null);
  const videoRef = useRef(null);
  const streamRef = useRef(null);

  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phone: "",
    dateofbirth: "",
    bloodgroup: "",
    medicalhistory: "",
    password: "",
    profilePhoto: null,
  });

  // ================= PHOTO =================
  const handlePhotoChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setFormData({ ...formData, profilePhoto: file });

    const reader = new FileReader();
    reader.onloadend = () => setPhotoPreview(reader.result);
    reader.readAsDataURL(file);
  };

  // ================= CAMERA =================
  const openCam = async () => {
    const stream = await navigator.mediaDevices.getUserMedia({ video: true });
    streamRef.current = stream;
    setCamOpen(true);

    setTimeout(() => {
      if (videoRef.current) videoRef.current.srcObject = stream;
    }, 100);
  };

  const snap = () => {
    const video = videoRef.current;
    const canvas = document.createElement("canvas");

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    canvas.getContext("2d").drawImage(video, 0, 0);

    canvas.toBlob((blob) => {
      const file = new File([blob], "patient-photo.jpg", {
        type: "image/jpeg",
      });

      setFormData({ ...formData, profilePhoto: file });
      setPhotoPreview(canvas.toDataURL("image/jpeg"));
      closeCam();
    });
  };

  const closeCam = () => {
    streamRef.current?.getTracks().forEach((t) => t.stop());
    setCamOpen(false);
  };

  // ================= DOCUMENTS =================
  const handleDocsChange = (e) => {
    const files = Array.from(e.target.files);
    setDocuments([...documents, ...files]);
  };

  const removeDocument = (index) => {
    const updatedDocs = [...documents];
    updatedDocs.splice(index, 1);
    setDocuments(updatedDocs);
  };

  const formatSize = (size) => {
    if (size < 1024) return size + " B";
    if (size < 1024 * 1024) return (size / 1024).toFixed(1) + " KB";
    return (size / (1024 * 1024)).toFixed(1) + " MB";
  };

  const getFileIcon = (file) => {
    const ext = file.name.split(".").pop().toLowerCase();

    if (["jpg", "jpeg", "png"].includes(ext)) return "🖼️";
    if (ext === "pdf") return "📄";
    if (["doc", "docx"].includes(ext)) return "📃";

    return "📎";
  };
  // ================= REGISTER =================
  const handleRegister = async () => {
    if (!EMAIL_REGEX.test(formData.email)) {
      setError("Please enter a valid email address.");
      return;
    }

    if (!PHONE_REGEX.test(formData.phone)) {
      setError("Phone number must contain exactly 10 digits.");
      return;
    }

    try {
      setError("");
      const data = new FormData();

      data.append("fullName", formData.fullName);
      data.append("email", formData.email);
      data.append("phone", formData.phone);
      data.append("dob", formData.dateofbirth);
      data.append("bloodGroup", formData.bloodgroup);
      data.append("medicalHistory", formData.medicalhistory);
      data.append("password", formData.password);

      if (formData.profilePhoto) {
        data.append("photo", formData.profilePhoto);
      }

      documents.forEach((doc) => {
        data.append("documents", doc);
      });

      const res = await fetch("http://localhost:8080/api/postPatient", {
        method: "POST",
        body: data,
      });

      const result = await res.json();

      if (!res.ok) {
        setError(result.message || "Registration failed");
      } else {
        alert("Patient registered successfully!");
        navigate("/login");
      }
    } catch (err) {
      console.error(err);
      setError("Server error");
    }
  };

  return (
    <>
      <Navbar />

      <div style={styles.backContainer}>
        <button
          style={styles.backBtn}
          type="button"
          onClick={() => navigate("/")}
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
      </div>

      <div style={styles.page}>
        <div style={styles.card}>
          <h2 style={styles.title}>Patient Sign Up</h2>
          {error && <div style={styles.errorBox}>{error}</div>}

          {/* PROFILE PHOTO */}
          <div style={styles.section}>
            <h4 style={styles.sectionTitle}>Profile Photo</h4>

            <div style={styles.photoWrapper}>
              {photoPreview ? (
                <img src={photoPreview} alt="preview" style={styles.photo} />
              ) : (
                <div style={styles.photoPlaceholder}>👤</div>
              )}
            </div>

            <div style={styles.buttonRow}>
              <button
                type="button"
                style={styles.uploadBtn}
                onClick={() => photoRef.current.click()}
              >
                Upload Photo
              </button>

              <button type="button" style={styles.cameraBtn} onClick={openCam}>
                Take Photo
              </button>
            </div>

            <input
              type="file"
              ref={photoRef}
              style={{ display: "none" }}
              onChange={handlePhotoChange}
            />
          </div>

          {/* PERSONAL INFO */}
          <div style={styles.section}>
            <h4 style={styles.sectionTitle}>Personal Information</h4>

            <label style={styles.label}>Full Name</label>
            <input
              style={styles.input}
              placeholder="Enter Full Name"
              onChange={(e) =>
                setFormData({ ...formData, fullName: e.target.value })
              }
            />

            <label style={styles.label}>Email</label>
            <input
              type="email"
              style={styles.input}
              placeholder="Enter Email"
              value={formData.email}
              onChange={(e) =>
                setFormData({ ...formData, email: e.target.value })
              }
            />

            <label style={styles.label}>Phone</label>
            <input
              type="tel"
              style={styles.input}
              placeholder="Enter 10 digit Phone Number"
              value={formData.phone}
              inputMode="numeric"
              maxLength={10}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  phone: e.target.value.replace(/\D/g, "").slice(0, 10),
                })
              }
            />

            <label style={styles.label}>Date of Birth</label>
            <input
              type="date"
              style={styles.input}
              onChange={(e) =>
                setFormData({ ...formData, dateofbirth: e.target.value })
              }
            />

            <label style={styles.label}>Blood Group</label>
            <select
              style={styles.input}
              onChange={(e) =>
                setFormData({ ...formData, bloodgroup: e.target.value })
              }
            >
              <option value="">Select Blood Group</option>
              <option>A+</option>
              <option>A-</option>
              <option>B+</option>
              <option>B-</option>
              <option>AB+</option>
              <option>AB-</option>
              <option>O+</option>
              <option>O-</option>
            </select>

            <label style={styles.label}>Medical History</label>
            <textarea
              style={styles.input}
              placeholder="Enter Medical History"
              onChange={(e) =>
                setFormData({ ...formData, medicalhistory: e.target.value })
              }
            />

            <label style={styles.label}>Password</label>
            <input
              type="password"
              style={styles.input}
              placeholder="Enter Password"
              onChange={(e) =>
                setFormData({ ...formData, password: e.target.value })
              }
            />
          </div>

          {/* DOCUMENTS */}
          <div style={styles.section}>
            <h4 style={styles.sectionTitle}>Verification Documents</h4>

            <div
              style={styles.docsUpload}
              onClick={() => docsRef.current.click()}
            >
              <div style={{ fontSize: 22, marginBottom: 4 }}>📎</div>

              <div style={{ fontSize: 14, fontWeight: 500, color: "#2e7d32" }}>
                Click to upload documents
              </div>

              <div style={{ fontSize: 12, color: "#777", marginTop: 4 }}>
                Medical license, degree certificates, ID · PDF, JPG, PNG, DOC ·
                Max 10MB each
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

            {documents.length > 0 &&
              documents.map((doc, i) => (
                <div key={i} style={styles.docItem}>
                  <span>{getFileIcon(doc)}</span>
                  <span style={styles.docName}>{doc.name}</span>
                  <span style={styles.docSize}>{formatSize(doc.size)}</span>

                  <button
                    style={styles.removeBtn}
                    onClick={() => removeDocument(i)}
                  >
                    ×
                  </button>
                </div>
              ))}
          </div>

          {/* REGISTER */}
          <button style={styles.registerBtn} onClick={handleRegister}>
            Register
          </button>

          {/* LOGIN */}
          <p style={styles.loginText}>
            Already have an account?{" "}
            <span
              style={styles.loginLink}
              onClick={() => setShowLoginConfirm(true)}
            >
              Login
            </span>
          </p>
        </div>

        {/* CAMERA */}
        {camOpen && (
          <div style={styles.overlay}>
            <div style={styles.cameraBox}>
              <video ref={videoRef} autoPlay style={{ width: "100%" }} />
              <button style={styles.captureBtn} onClick={snap}>
                Capture
              </button>
              <button style={styles.closeBtn} onClick={closeCam}>
                Close
              </button>
            </div>
          </div>
        )}

        {/* LOGIN POPUP */}
        {showLoginConfirm && (
          <div style={styles.popupOverlay}>
            <div style={styles.popupBox}>
              <h4>Confirm Login</h4>
              <p>
                Are you sure you want to login as <b>Patient</b>?
              </p>

              <div style={{ display: "flex", gap: 10 }}>
                <button
                  style={styles.confirmBtn}
                  onClick={() => navigate("/login")}
                >
                  Yes
                </button>

                <button
                  style={styles.cancelBtn}
                  onClick={() => setShowLoginConfirm(false)}
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
}

const styles = {
  page: {
    minHeight: "178vh",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    background: "#f5f7fb",
    padding: 20,
  },

  card: {
    background: "#fff",
    padding: 30,
    borderRadius: 12,
    width: "100%",
    maxWidth: 500,
    boxShadow: "0 8px 25px rgba(0,0,0,0.08)",
  },

  title: {
    textAlign: "center",
    marginBottom: 20,
  },

  section: {
    marginBottom: 20,
  },
  errorBox: {
    background: "#ffebee",
    border: "1px solid #ef9a9a",
    color: "#c62828",
    borderRadius: 8,
    padding: 10,
    marginBottom: 16,
    fontSize: 14,
  },

  sectionTitle: {
    fontWeight: 600,
    marginBottom: 10,
  },

  label: {
    display: "block",
    marginTop: 10,
    marginBottom: 6,
  },

  input: {
    width: "100%",
    padding: 10,
    borderRadius: 8,
    border: "1px solid #ddd",
  },

  photoWrapper: {
    display: "flex",
    justifyContent: "center",
    marginBottom: 10,
  },

  photoPlaceholder: {
    width: 110,
    height: 110,
    borderRadius: "50%",
    background: "#bbdefb",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    fontSize: 34,
  },

  photo: {
    width: 110,
    height: 110,
    borderRadius: "50%",
    objectFit: "cover",
  },

  buttonRow: {
    display: "flex",
    gap: 10,
  },

  uploadBtn: {
    flex: 1,
    padding: 8,
    borderRadius: 6,
    border: "1px solid #1976d2",
    background: "#fff",
    color: "#1976d2",
    cursor: "pointer",
  },

  cameraBtn: {
    flex: 1,
    padding: 8,
    borderRadius: 6,
    border: "1px solid #2e7d32",
    background: "#fff",
    color: "#2e7d32",
    cursor: "pointer",
  },

  docsUpload: {
    border: "2px dashed #bbb",
    padding: 20,
    textAlign: "center",
    borderRadius: 8,
    cursor: "pointer",
  },

  docItem: {
    display: "flex",
    gap: 10,
    padding: 6,
  },

  docName: {
    flex: 1,
  },

  docSize: {
    fontSize: 12,
    color: "#777",
  },

  removeBtn: {
    border: "none",
    background: "transparent",
    color: "red",
    fontSize: 18,
    cursor: "pointer",
  },

  registerBtn: {
    width: "100%",
    padding: 12,
    background: "#1976d2",
    color: "#fff",
    border: "none",
    borderRadius: 8,
    marginTop: 10,
    cursor: "pointer",
  },

  loginText: {
    textAlign: "center",
    marginTop: 15,
  },

  loginLink: {
    color: "#1976d2",
    cursor: "pointer",
    textDecoration: "underline",
  },

  popupOverlay: {
    position: "fixed",
    inset: 0,
    background: "rgba(0,0,0,0.5)",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
  },

  popupBox: {
    background: "#fff",
    padding: 25,
    borderRadius: 10,
    width: 300,
    textAlign: "center",
  },

  confirmBtn: {
    flex: 1,
    padding: 10,
    background: "#1976d2",
    color: "#fff",
    border: "none",
    borderRadius: 6,
  },

  cancelBtn: {
    flex: 1,
    padding: 10,
    border: "1px solid #ccc",
    borderRadius: 6,
  },

  overlay: {
    position: "fixed",
    inset: 0,
    background: "rgba(0,0,0,0.8)",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
  },

  cameraBox: {
    background: "#fff",
    padding: 15,
    borderRadius: 10,
    width: 350,
  },

  captureBtn: {
    marginTop: 10,
    width: "100%",
  },

  closeBtn: {
    marginTop: 5,
    width: "100%",
    background: "red",
    color: "#fff",
    border: "none",
  },

  backBtn: {
    position: "fixed",
    top: "80px", // below navbar
    left: "24px",
    zIndex: 1000,
    display: "flex",
    alignItems: "center",
    gap: "7px",
    background: "#fff",
    border: "1.5px solid #e0e0e0",
    borderRadius: "10px",
    padding: "8px 14px",
    fontSize: "13px",
    fontWeight: "600",
    color: "#424242",
    cursor: "pointer",
    boxShadow: "0 2px 8px rgba(0,0,0,0.07)",
    transition: "all 0.2s ease",
  },
  // backbutton:{
  //    background: #f5f5f5,
  //     border-color: #bdbdbd,
  //         transform: translateX(-2px),
  // }
  // .back-btn:hover {
  //         background: #f5f5f5;
  //         border-color: #bdbdbd;
  //         transform: translateX(-2px);
  //       }
};

export default PatientRegistrationForm;
