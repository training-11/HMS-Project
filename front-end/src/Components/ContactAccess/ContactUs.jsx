import React, { useState, useEffect, useRef } from "react";
import "../../App.css";

function ContactUs() {
  const [activeSection, setActiveSection] = useState(null);
  const containerRef = useRef(null);

  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    branch: "",
    department: "",
    date: "",
    time: "",
  });

 
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setActiveSection(null);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    alert("Appointment Booked Successfully!");
    console.log(formData);

    setFormData({
      name: "",
      phone: "",
      branch: "",
      department: "",
      date: "",
      time: "",
    });
  };

  return (
    <div className="contact-page">
      <div className="header">
       <h1 className="main-title">
  <span className="hospital-name">CITY CARE HOSPITAL</span>
  <br />
  <span className="contact-text">CONTACTUS</span>
</h1>
      </div>

 
      <div ref={containerRef}>
        <div className="info-section">
          <div
            className={`info-box ${activeSection === "branches" ? "active" : ""}`}
            onClick={() =>
              setActiveSection(activeSection === "branches" ? null : "branches")
            }
          >
            <h3>📍 BRANCHES</h3>
          </div>

          <div
            className={`info-box ${activeSection === "departments" ? "active" : ""}`}
            onClick={() =>
              setActiveSection(
                activeSection === "departments" ? null : "departments"
              )
            }
          >
            <h3>🩺 DEPARTMENTS</h3>
          </div>

          

          <div
            className={`info-box ${activeSection === "contact" ? "active" : ""}`}
            onClick={() =>
              setActiveSection(activeSection === "contact" ? null : "contact")
            }
          >
            <h3>📞 CONTACT </h3>
          </div>
        </div>

      
        {activeSection && (
          <div className="details-section">
            <div className="details-card">
              {activeSection === "branches" && (
                <>
                  <h3>Our Branches</h3>
                  <ul>
                    <li>Hyderabad</li>
                    <li>Chennai</li>
                    <li>Bangalore</li>
                    <li>Mumbai</li>
                  </ul>
                </>
              )}

              {activeSection === "departments" && (
                <>
                  <h3>Departments</h3>
                  <ul>
                    <li>Cardiology</li>
                    <li>Neurology</li>
                    <li>Orthopedics</li>
                    <li>Pediatrics</li>
                  </ul>
                </>
              )}

              

              {activeSection === "contact" && (
                <>
                  <h3>Contact Info</h3>
                  <p>📞 1000 123 4567</p>
                  <p>✉ info@citycare.com</p>
                </>
              )}
            </div>
          </div>
        )}
      </div>

    
      <div className="booking-section">
        <h2> BOOK YOUR SLOT</h2>

        <form onSubmit={handleSubmit} className="booking-form">
          <input
            name="name"
            placeholder="Full Name"
            value={formData.name}
            required
            onChange={handleChange}
          />

          <input
            type="tel"
            name="phone"
            placeholder="Phone Number"
            value={formData.phone}
            required
            onChange={handleChange}
          />

          <select
            name="branch"
            value={formData.branch}
            required
            onChange={handleChange}
          >
            <option value="">Select Branch</option>
            <option>Hyderabad</option>
            <option>Chennai</option>
            <option>Banglore</option>
            <option>Mumbai</option>
          </select>

          <select
            name="department"
            value={formData.department}
            required
            onChange={handleChange}
          >
            <option value="">Select Department</option>
            <option>Cardiology</option>
            <option>Neurology</option>
            <option>Orthopedics</option>
            <option>Peadiatrics</option>
          </select>

          <input
            type="date"
            name="date"
            value={formData.date}
            required
            onChange={handleChange}
          />

          <input
            type="time"
            name="time"
            value={formData.time}
            required
            onChange={handleChange}
          />

          <button type="submit">Book Appointment</button>
        </form>
      </div>
    </div>
  );
}

export default ContactUs;