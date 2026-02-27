import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import bgImage from "../assets/hospital-bg.jpg";   

function Home() {
  return (
    <>
      <Navbar />

      <section
        style={{
          ...styles.hero,
          backgroundImage: `url(${bgImage})`   
        }}
      >
        <h1>Welcome to CityCare Hospital - Your Health, Our Priority</h1>
        <div>
          <button style={styles.btn}>Register Now</button>
          <button style={styles.btn}>Login</button>
        </div>
      </section>

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
    color: "white"
  },
  btn: {
    padding: "10px 20px",
    margin: "10px",
    background: "#023e8a",
    color: "white",
    border: "none",
    cursor: "pointer"
  },
  cards: {
    display: "flex",
    justifyContent: "space-around",
    padding: "40px"
  },
  card: {
    padding: "20px",
    border: "1px solid #ddd",
    width: "200px",
    textAlign: "center"
  },
  about: {
    textAlign: "center",
    padding: "40px"
  }
};

export default Home;