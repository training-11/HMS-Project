import { useRef, useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import AboutUs from "./AboutUs";
import ContactUs from "./ContactUs";
import Footer from "../Components/Footer";
import Navbar from "../Components/Navbar";
import bgImage from "../assets/hospital-bg.jpg";

function Home() {
  const homeRef = useRef(null);
  const aboutRef = useRef(null);
  const contactRef = useRef(null);

  const [showModal] = useState(false);

  const location = useLocation(); 

  const scrollToRef = (ref) => {
    if (ref && ref.current) {
      window.scrollTo({
        top: ref.current.offsetTop - 60,
        behavior: "smooth",
      });
    }
  };

  useEffect(() => {
    if (location.state?.scrollTo) {
      const section = location.state.scrollTo;

      setTimeout(() => {
        if (section === "home") scrollToRef(homeRef);
        if (section === "about") scrollToRef(aboutRef);
        if (section === "contact") scrollToRef(contactRef);
      }, 100);
    }
  }, [location]);

  return (
    <div style={{ fontFamily: "Arial, sans-serif" }}>
      
      <Navbar
        scrollToRef={scrollToRef}
        homeRef={homeRef}
        aboutRef={aboutRef}
        contactRef={contactRef}
      />

      <section
        ref={homeRef}
        style={{
          minHeight: "100vh",
          paddingTop: "60px",
          backgroundImage: `url(${bgImage})`,
          // linear gradient is used to darken the background for better text visibility 
          backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.5), rgba(0, 0, 0, 0.5)), url(${bgImage})`,
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

      <section ref={aboutRef}>
        <AboutUs />
      </section>

      <section ref={contactRef}>
        <ContactUs />
      </section>

      <Footer />
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