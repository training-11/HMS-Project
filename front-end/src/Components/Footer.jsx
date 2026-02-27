import { Link } from "react-router-dom";

function Footer() {
  return (
    <footer style={styles.footer}>
      <div style={styles.section}>
        <p>📍 Rajahmundry, Andhra Pradesh &nbsp;&nbsp;&nbsp;
          📞 +91 9876543210 &nbsp;&nbsp;&nbsp;
          📧 citycare@gmail.com</p>
      </div>

      <div style={styles.section}>
        <Link style={styles.link} to="/about">About</Link>
        <Link style={styles.link} to="/contact">Contact</Link>
        <Link style={styles.link} to="/privacy">Privacy Policy</Link>
      </div>

      <div style={styles.section}>
        <a style={styles.link} href="https://facebook.com" target="_blank">Facebook</a>
        <a style={styles.link} href="https://instagram.com" target="_blank">Instagram</a>
        <a style={styles.link} href="https://x.com" target="_blank">X</a>
      </div>

      <p style={styles.copy}>
        © 2026 CityCare Hospital. All Rights Reserved.
      </p>

    </footer>
  );
}

const styles = {
  footer: {
    background: "#0077b6",
    color: "white",
    padding: "30px 20px",
    marginTop: "40px",
    display: "flex",
    flexDirection: "column",
    alignItems: "center"
  },
  section: {
    marginBottom: "15px",
    textAlign: "center"
  },
  link: {
    color: "white",
    margin: "0 10px",
    textDecoration: "none"
  },
  copy: {
    marginTop: "20px",
    fontSize: "14px"
  }
};

export default Footer;