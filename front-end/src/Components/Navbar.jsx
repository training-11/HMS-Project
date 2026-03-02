import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import logo from "../assets/hospital-logo.png";

const Navbar = ({
  scrollToRef,
  homeRef,
  aboutRef,
  contactRef
}) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [showModal, setShowModal] = useState(false);

  const handleScroll = (section, ref) => {

    if (location.pathname !== "/") {
      navigate("/", { state: { scrollTo: section } });
      return;
    }

    if (typeof scrollToRef === "function" && ref) {
      scrollToRef(ref);
    }
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

        <div style={{ display: "flex", gap: "20px" }}>
          <span
            style={{ cursor: "pointer" }}
            onClick={() => handleScroll("home", homeRef)}
          >
            Home
          </span>

          <span
            style={{ cursor: "pointer" }}
            onClick={() => handleScroll("about", aboutRef)}
          >
            About Us
          </span>

          <span
            style={{ cursor: "pointer" }}
            onClick={() => handleScroll("contact", contactRef)}
          >
            Contact Us
          </span>
        </div>

        <div style={{ display: "flex", gap: "20px" }}>
          <span
            style={{ cursor: "pointer" }}
            onClick={() => setShowModal(true)}
          >
            Register
          </span>

          <span
            style={{ cursor: "pointer" }}
            onClick={() => navigate("/login")}
          >
            Login
          </span>
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

            <div
              style={{
                padding: "15px",
                display: "flex",
                flexDirection: "column",
                gap: "10px",
              }}
            >
              <button  style={modalBtnStyle} onClick={() => navigate("/doctor-register")}>
                Doctor
              </button>
              <button style={modalBtnStyle}  onClick={() => navigate("/nurse-register")}>
                Nurse
              </button>
              <button style={modalBtnStyle}  onClick={() => navigate("/patient-register")}>
                Patient
              </button>
              <button style={modalBtnStyle}  onClick={() => navigate("/Admin-register")}>
                Admin
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