import React from "react";
import "./AboutUs.css";

const doctors = [
  {
    id: 1,
    name: "Dr. Rajesh Kumar",
    specialization: "Cardiologist",
    experience: "15 Years Experience",
    image: "https://randomuser.me/api/portraits/men/32.jpg",
  },
  {
    id: 2,
    name: "Dr. Priya Sharma",
    specialization: "Neurologist",
    experience: "12 Years Experience",
    image: "https://randomuser.me/api/portraits/women/44.jpg",
  },
  {
    id: 3,
    name: "Dr. Arjun Reddy",
    specialization: "Orthopedic Surgeon",
    experience: "10 Years Experience",
    image: "https://randomuser.me/api/portraits/men/75.jpg",
  },
   {
    id: 4,
    name: "Dr. Vijay ",
    specialization: "Pediatric ",
    experience: "10 Years Experience",
    image: "https://randomuser.me/api/portraits/men/11.jpg",
  },
  {
    id: 5,
    name: "Dr. Lavanya",
    specialization: "ENT Surgeon",
    experience: "10 Years Experience",
    image: "https://randomuser.me/api/portraits/women/70.jpg",
  },
    {
    id: 6,
    name: "Dr. Dhanush",
    specialization: "Dentist",
    experience: "10 Years Experience",
    image: "https://randomuser.me/api/portraits/men/45.jpg",
  },
    {
    id: 7,
    name: "Dr. Sudheer",
    specialization: "General Surgeon",
    experience: "10 Years Experience",
    image: "https://randomuser.me/api/portraits/men/83.jpg",
  },
    {
    id: 8,
    name: "Dr. Samantha",
    specialization: "General Surgeon",
    experience: "10 Years Experience",
    image: "https://randomuser.me/api/portraits/women/68.jpg",
  },
];

function AboutUs() {
  return (
    <div className="about-container">
      <div className="overlay">

        <div className="content-wrapper">

          <h1 className="main-heading">About CityCare Hospital</h1>

          <p className="about-text">
            CityCare Hospital is a leading healthcare provider offering
            advanced medical facilities and compassionate care. We combine
            modern technology with experienced professionals to ensure
            the best treatment for our patients.
          </p>

          {/* Vision & Mission */}
          <div className="vm-container">
            <div className="vm-card">
              <h3>Our Vision</h3>
              <p>
                To become the most trusted healthcare institution by
                delivering innovative and patient-centered services.
              </p>
            </div>

            <div className="vm-card">
              <h3>Our Mission</h3>
              <p>
                To provide affordable, accessible, and world-class healthcare
                with compassion and excellence.
              </p>
            </div>
          </div>

          {/* Doctors */}
          <h2 className="doctor-heading">Our Expert Doctors</h2>

          <div className="doctor-grid">
            {doctors.map((doc) => (
              <div className="doctor-card" key={doc.id}>
                <img src={doc.image} alt={doc.name} />
                <h3>{doc.name}</h3>
                <p>{doc.specialization}</p>
                <span>{doc.experience}</span>
              </div>
            ))}
          </div>

        </div>
      </div>
    </div>
  );
}

export default AboutUs;