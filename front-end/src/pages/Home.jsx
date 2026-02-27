


import { useState } from "react";
//import Navbar from "../Components/Navbar";
import Footer from "../Components/Footer";
import bgImage from "../assets/hospital-bg.jpg";
import { useNavigate } from "react-router-dom";
import { Link } from "react-router-dom";
import logo from "../assets/hospital-logo.png";



function Home() {
  const [showModal, setShowModal] = useState(false);
  const navigate = useNavigate();

  return (
    <>
      <link
        rel="stylesheet"
        href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css"
      />
      {/* <Navbar /> */}
      <nav style={styles.nav}>
      <img src={logo} height="50" width="50" alt="logo" />
      <div>
        <Link style={styles.link} to="/">
          Home
        </Link>
        <Link style={styles.link} to="#" onClick={() => setShowModal(true)}>
          Register
        </Link>
        <Link style={styles.link} to="#">
          Login
        </Link>
        <Link style={styles.link} to="/aboutUs">
          About
        </Link>
        <Link style={styles.link} to="/ContactUs">
          Contact
        </Link>
      </div>
    </nav>

      
      <section
        style={{
          ...styles.hero,
          backgroundImage: `url(${bgImage})`,
        }}
      >
        <h1>Welcome to CityCare Hospital - Your Health, Our Priority</h1>
        <div>
          <button
            style={styles.btn}
            onClick={() => setShowModal(true)}
          >
            Register Now
          </button>
          <button style={styles.btn}>Login</button>
        </div>
      </section>

      
      {showModal && (
        <>
          
          <div
            className="modal-backdrop fade show"
            onClick={() => setShowModal(false)}
          ></div>

          
          <div
            className="modal fade show"
            style={{ display: "block" }}
            tabIndex="-1"
          >
            <div className="modal-dialog modal-dialog-centered">
              <div className="modal-content">

                <div className="modal-header">
                  <h5 className="modal-title fw-bold">Register As</h5>
                  <button
                    type="button"
                    className="btn-close"
                    onClick={() => setShowModal(false)}
                  ></button>
                </div>

                <div className="modal-body">
                  <p className="text-muted text-center mb-4">
                    Please select your role to continue registration
                  </p>
                  <div className="d-grid gap-3">
                    <button className="btn btn-primary btn-lg" onClick={() => navigate("/Doctor-register")}>
                      Doctor
                    </button>
                    <button className="btn btn-success btn-lg" onClick={() => navigate("/nurse-register")}>
                       Nurse
                    </button>
                    <button className="btn btn-info btn-lg text-white" onClick={() => navigate("/patient-register")}>
                       Patient
                    </button>
                    <button className="btn btn-dark btn-lg">
                       Admin
                    </button>
                  </div>
                </div>

                <div className="modal-footer">
                  <button
                    className="btn btn-secondary"
                    onClick={() => setShowModal(false)}
                  >
                    Cancel
                  </button>
                </div>

              </div>
            </div>
          </div>
        </>
      )}

      
      <section style={styles.cards}>
        <div style={styles.card}>Registration</div>
        <div style={styles.card}>Login</div>
        <div style={styles.card}>About Us</div>
        <div style={styles.card}>Contact Us</div>
      </section>

      
      <section style={styles.about}>
        <h2>About Our Hospital</h2>
        <p>
          CityCare Hospital provides advanced healthcare services with
          experienced doctors and modern facilities.
        </p>
      </section>

      <Footer />
    </>
  );
}

const styles = {
  nav: {
    display: "flex",
    justifyContent: "space-between",
    padding: "15px",
    background: "#0077b6",
    color: "white",
  },
  link: {
    color: "white",
    marginLeft: "15px",
    textDecoration: "none",
  },
  hero: {
    textAlign: "center",
    padding: "80px 20px",
    height: "80vh",
    backgroundSize: "cover",
    backgroundPosition: "center",
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
    color: "white",
  },
  btn: {
    padding: "10px 20px",
    margin: "10px",
    background: "#023e8a",
    color: "white",
    border: "none",
    cursor: "pointer",
  },
  cards: {
    display: "flex",
    justifyContent: "space-around",
    padding: "40px",
  },
  card: {
    padding: "20px",
    border: "1px solid #ddd",
    width: "200px",
    textAlign: "center",
  },
  about: {
    textAlign: "center",
    padding: "40px",
  },
};

export default Home;