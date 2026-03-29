import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import logo from "../assets/hospital-logo.png";

const Navbar = ({ scrollToRef, homeRef, aboutRef, contactRef }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [showModal, setShowModal] = useState(false);
  const [userInfo, setUserInfo] = useState(null);

  useEffect(() => {
    try {
      const stored = localStorage.getItem("userInfo");
      setUserInfo(stored ? JSON.parse(stored) : null);
    } catch {
      setUserInfo(null);
    }
  }, [location.pathname]);

  const isAdmin = userInfo?.role === "admin";
  const isDoctor = userInfo?.role === "doctor";
  const isNurse = userInfo?.role === "nurse";

  const handleScroll = (section, ref) => {
    if (location.pathname !== "/") {
      navigate("/", { state: { scrollTo: section } });
      return;
    }
    if (typeof scrollToRef === "function" && ref) scrollToRef(ref);
  };

  const handleLogout = () => {
    localStorage.removeItem("authToken");
    localStorage.removeItem("userInfo");
    setUserInfo(null);
    navigate("/login");
  };

  return (
    <>
      <nav
        style={{
          position: "fixed",
          top: 0,
          width: "100%",
          height: "60px",
          background: "#0077b6",
          color: "white",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "0 20px",
          zIndex: 1000,
        }}
      >
        <img
          src={logo}
          alt="logo"
          style={{ height: "50px", cursor: "pointer" }}
          onClick={() => handleScroll("home", homeRef)}
        />

        <div style={{ display: "flex", gap: "20px", alignItems: "center" }}>
          <span style={{ cursor: "pointer" }} onClick={() => handleScroll("home", homeRef)}>
            Home
          </span>
          <span style={{ cursor: "pointer" }} onClick={() => handleScroll("about", aboutRef)}>
            About Us
          </span>
          <span style={{ cursor: "pointer" }} onClick={() => handleScroll("contact", contactRef)}>
            Contact Us
          </span>

          {isAdmin && (
            <span
              onClick={() => navigate("/admin-dashboard")}
              style={{
                cursor: "pointer",
                background: "rgba(255,255,255,0.18)",
                border: "1px solid rgba(255,255,255,0.4)",
                borderRadius: "6px",
                padding: "4px 12px",
                fontWeight: "700",
                fontSize: "13px",
                display: "flex",
                alignItems: "center",
                gap: "5px",
                transition: "background 0.2s",
              }}
              onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(255,255,255,0.28)")}
              onMouseLeave={(e) => (e.currentTarget.style.background = "rgba(255,255,255,0.18)")}
            >
              Dashboard
            </span>
          )}

          {isDoctor && (
            <span
              onClick={() => navigate("/doctor-appointments")}
              style={{
                cursor: "pointer",
                background: "rgba(255,255,255,0.18)",
                border: "1px solid rgba(255,255,255,0.4)",
                borderRadius: "6px",
                padding: "4px 12px",
                fontWeight: "700",
                fontSize: "13px",
                display: "flex",
                alignItems: "center",
                gap: "5px",
                transition: "background 0.2s",
              }}
              onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(255,255,255,0.28)")}
              onMouseLeave={(e) => (e.currentTarget.style.background = "rgba(255,255,255,0.18)")}
            >
              Appointments
            </span>
          )}

          {isNurse && (
            <span
              onClick={() => navigate("/nurse-appointments")}
              style={{
                cursor: "pointer",
                background: "rgba(255,255,255,0.18)",
                border: "1px solid rgba(255,255,255,0.4)",
                borderRadius: "6px",
                padding: "4px 12px",
                fontWeight: "700",
                fontSize: "13px",
                display: "flex",
                alignItems: "center",
                gap: "5px",
                transition: "background 0.2s",
              }}
              onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(255,255,255,0.28)")}
              onMouseLeave={(e) => (e.currentTarget.style.background = "rgba(255,255,255,0.18)")}
            >
              Appointments
            </span>
          )}
        </div>

        <div style={{ display: "flex", gap: "16px", alignItems: "center" }}>
          {userInfo ? (
            <>
              <span style={{ fontSize: "13px", opacity: 0.85 }}>
                {userInfo.fullName || userInfo.email}
              </span>
              <span
                style={{
                  cursor: "pointer",
                  background: "rgba(255,255,255,0.15)",
                  border: "1px solid rgba(255,255,255,0.35)",
                  borderRadius: "6px",
                  padding: "4px 12px",
                  fontSize: "13px",
                  fontWeight: "600",
                }}
                onClick={handleLogout}
                onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(255,80,80,0.35)")}
                onMouseLeave={(e) => (e.currentTarget.style.background = "rgba(255,255,255,0.15)")}
              >
                Logout
              </span>
            </>
          ) : (
            <>
              <span style={{ cursor: "pointer" }} onClick={() => setShowModal(true)}>
                Register
              </span>
              <span style={{ cursor: "pointer" }} onClick={() => navigate("/login")}>
                Login
              </span>
            </>
          )}
        </div>
      </nav>

      {showModal && (
        <>
          <div
            onClick={() => setShowModal(false)}
            style={{
              position: "fixed",
              inset: 0,
              backgroundColor: "rgba(0,0,0,0.5)",
              zIndex: 1001,
            }}
          />
          <div
            style={{
              position: "fixed",
              top: "50%",
              left: "50%",
              transform: "translate(-50%, -50%)",
              background: "white",
              zIndex: 1002,
              width: "300px",
              borderRadius: "8px",
            }}
          >
            <div
              style={{
                padding: "10px",
                background: "#0077b6",
                color: "white",
                display: "flex",
                justifyContent: "space-between",
              }}
            >
              <h5>Register As</h5>
              <button
                style={{ background: "transparent", border: "none", color: "white" }}
                onClick={() => setShowModal(false)}
              >
                X
              </button>
            </div>
            <div style={{ padding: "15px", display: "flex", flexDirection: "column", gap: "10px" }}>
              <button style={modalBtnStyle} onClick={() => { navigate("/doctor-register"); setShowModal(false); }}>
                Doctor
              </button>
              <button style={modalBtnStyle} onClick={() => { navigate("/nurse-register"); setShowModal(false); }}>
                Nurse
              </button>
              <button style={modalBtnStyle} onClick={() => { navigate("/patient-register"); setShowModal(false); }}>
                Patient
              </button>
            </div>
          </div>
        </>
      )}
    </>
  );
};

const modalBtnStyle = {
  padding: "10px",
  cursor: "pointer",
  background: "#023e8a",
  color: "white",
  border: "none",
  borderRadius: "4px",
};

export default Navbar;
