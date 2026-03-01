import React, { useRef, useState } from "react";
// import DoctorRegistrationForm from "./registration/DoctorRegistrationForm";
// import NurseRegistrationForm from "./registration/NurseRegistrationForm";
// import PatientRegistrationForm from "./registration/PatientRegistrationForm";
import AboutUs from "./AboutUs";
import ContactUs from "./ContactUs";
import Footer from "../Components/Footer";


import logo from "../assets/hospital-logo.png";
import bgImage from "../assets/hospital-bg.jpg";

function Home() {
  const homeRef = useRef(null);
  const aboutRef = useRef(null);
  const contactRef = useRef(null);
  const doctorRef = useRef(null);
  const nurseRef = useRef(null);
  const patientRef = useRef(null);
  const adminRef = useRef(null); 

  const [showModal, setShowModal] = useState(false);

  
  const scrollToRef = (ref) => {
    if (ref.current) {
      window.scrollTo({
        top: ref.current.offsetTop - 60, 
        behavior: "smooth",
      });
    }
  };

  return (
    <div style={{ fontFamily: "Arial, sans-serif" }}>
      {/* Navbar */}
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
        <div style={{ display: "flex", alignItems: "center" }}>
          <img src={logo} alt="logo" style={{ height: "50px" }} />
        </div>

        <div style={{ display: "flex", gap: "20px" }}>
          <span style={{ cursor: "pointer" }} onClick={() =>  window.location.href = "/"}>Home</span>
          <span style={{ cursor: "pointer" }} onClick={() => scrollToRef(aboutRef)}>About Us</span>
          <span style={{ cursor: "pointer" }} onClick={() => scrollToRef(contactRef)}>Contact Us</span>
        </div>

        <div style={{ display: "flex", gap: "20px" }}>
          <span style={{ cursor: "pointer" }} onClick={() => setShowModal(true)}>Register</span>
          <span style={{ cursor: "pointer" }} onClick={() => window.location.href = "/login"}>Login</span>
        </div>
      </nav>

      {/* Home Section */}
      <section
        ref={homeRef}
        style={{
          minHeight: "100vh",
          paddingTop: "60px",
          backgroundImage: `url(${bgImage})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          color: "white",
          textAlign: "center",
        }}
      >
        <h1 style={{ fontSize: "3rem" }}>Welcome to CityCare Hospital</h1>
        <p style={{ fontSize: "1.5rem" }}>Your Health, Our Priority</p>
      </section>

      {/* About Section */}
      <section ref={aboutRef}>
        <AboutUs />
      </section>

      {/* Contact Section */}
      <section ref={contactRef}>
        <ContactUs />
      </section>

      {/* Registration Forms */}
      {/* <section ref={doctorRef}><DoctorRegistrationForm /></section>
      <section ref={nurseRef}><NurseRegistrationForm /></section>
      <section ref={patientRef}><PatientRegistrationForm /></section>
      <section ref={adminRef}> */}
        {/* You can add AdminRegistrationForm here later */}
        {/* <div style={{ padding: "50px", textAlign: "center", fontSize: "1.2rem", color: "#0077b6" }}>
          Admin Registration Form will be here
        </div>
      </section> */}

      {/* Registration Modal */}

      <Footer/>
      
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
              overflow: "hidden",
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                padding: "10px 20px",
                background: "#0077b6",
                color: "white",
              }}
            >
              <h3>Register As</h3>
              <button
                style={{
                  cursor: "pointer",
                  background: "transparent",
                  color: "white",
                  border: "none",
                  fontSize: "1.2rem",
                }}
                onClick={() => setShowModal(false)}
              >
                X
              </button>
            </div>
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                padding: "20px",
                gap: "10px",
              }}
            >
              <button
                style={modalBtnStyle}
                onClick={() => {  window.location.href = "/doctor-register"; setShowModal(false); }}
              >
                Doctor
              </button>
              <button
                style={modalBtnStyle}
                onClick={() => {  window.location.href = "/nurse-register"; setShowModal(false); }}
              >
                Nurse
              </button>
              <button
                style={modalBtnStyle}
                onClick={() => {  window.location.href = "/patient-register"; setShowModal(false); }}
              >
                Patient
              </button>
              <button
                style={modalBtnStyle}
                onClick={() => {  window.location.href = ""; setShowModal(false); }}
              >
                Admin
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

const modalBtnStyle = {
  padding: "10px",
  cursor: "pointer",
  background: "#023e8a",
  color: "white",
  border: "none",
  borderRadius: "4px",
};

export default Home;