import { Link } from "react-router-dom";
import logo from "../assets/hospital-logo.png";

function Navbar() {
  return (
    <nav style={styles.nav}>
       <img src={logo} height="50" width="50" alt="logo" />
      <div>
        <Link style={styles.link} to="/">Home</Link>
        <Link style={styles.link} to="#">Register</Link>
        <Link style={styles.link} to="#">Login</Link>
        <Link style={styles.link} to="#">About</Link>
        <Link style={styles.link} to="#">Contact</Link>
      </div>
    </nav>
  );
}

const styles = {
  nav: {
    display: "flex",
    justifyContent: "space-between",
    padding: "15px",
    background: "#0077b6",
    color: "white"
  },
  link: {
    color: "white",
    marginLeft: "15px",
    textDecoration: "none"
  }
};

export default Navbar;