import React, { useState } from "react";
import "../../Components/styles/PatientRegistrationForm.css";

const PatientRegistrationForm = () => {
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phone: "",
    dob: "",
    bloodGroup: "",
    medicalHistory: "",
    password: "",
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log(formData);
    alert("Patient Registered!");
  };

  return (
    <div className="container">
      <div className="form-box">
        <h2>Patient Registration</h2>

        <form onSubmit={handleSubmit}>
          <label>Full Name</label>
          <input
            type="text"
            name="fullName"
            placeholder="Enter Full Name"
            onChange={handleChange}
          />

          <label>Email Address</label>
          <input
            type="email"
            name="email"
            placeholder="Enter Email"
            onChange={handleChange}
          />

          <label>Phone Number</label>
          <input
            type="text"
            name="phone"
            placeholder="Enter 10-digit Phone Number"
            onChange={handleChange}
          />

          <label>Date of Birth</label>
          <input type="date" name="dob" onChange={handleChange} />

          <label>Blood Group</label>
          <select name="bloodGroup" onChange={handleChange}>
            <option value="">Select Blood Group</option>
            <option>A+</option>
            <option>B+</option>
            <option>O+</option>
            <option>AB+</option>
            <option>A-</option>
            <option>B-</option>
            <option>O-</option>
            <option>AB-</option>
          </select>

          <label>Medical History</label>
          <textarea
            name="medicalHistory"
            placeholder="Enter Medical History"
            onChange={handleChange}
          />

          <label>Password</label>
          <input
            type="password"
            name="password"
            placeholder="Create Strong Password"
            onChange={handleChange}
          />

          <button type="submit">Register</button>
        </form>
      </div>
    </div>
  );
};

export default PatientRegistrationForm;
