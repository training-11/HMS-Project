import React, { useState } from "react";

import "../../Components/styles/NurseForm.css";

function NurseRegistrationForm() {
  const initialState = {
    fullName: "",
    email: "",
    phone: "",
    department: "",
    shiftTiming: "",
    password: "",
  };

  const [formData, setFormData] = useState(initialState);
  const [errors, setErrors] = useState({});

  const changeFunction = (e) => {
    const { name, value } = e.target;

    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const validateForm = () => {
    let newErrors = {};

    if (!formData.fullName.trim()) {
      newErrors.fullName = "Full Name is required";
    }

    if (!/^\S+@\S+\.\S+$/.test(formData.email)) {
      newErrors.email = "Enter valid email address";
    }

    if (!/^[0-9]{10}$/.test(formData.phone)) {
      newErrors.phone = "Phone must be 10 digits";
    }

    if (!formData.department) {
      newErrors.department = "Select department";
    }

    if (!formData.shiftTiming) {
      newErrors.shiftTiming = "Select shift timing";
    }

    if (formData.password.length < 6) {
      newErrors.password = "Password must be at least 6 characters";
    }

    setErrors(newErrors);

    return Object.keys(newErrors).length === 0;
  };

  const formSubmit = (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    const confirmRegister = window.confirm(
      "You are registering as a Nurse. Are you sure?",
    );

    if (confirmRegister) {
      console.log("Nurse Registration Data:", formData);
      alert("Nurse Registered Successfully!");

      setFormData(initialState);
      setErrors({});
    }
  };

  return (
    <div className="nurse-form-container">
      <h2>Nurse Registration</h2>

      <form onSubmit={formSubmit} className="nurse-form">
        <div className="form-group">
          <label>Full Name</label>
          <input
            type="text"
            name="fullName"
            value={formData.fullName}
            onChange={changeFunction}
            placeholder="Enter Full Name"
          />
          <small className="error">{errors.fullName}</small>
        </div>

        <div className="form-group">
          <label>Email Address</label>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={changeFunction}
            placeholder="Enter Email"
          />
          <small className="error">{errors.email}</small>
        </div>

        <div className="form-group">
          <label>Phone Number</label>
          <input
            type="tel"
            name="phone"
            value={formData.phone}
            onChange={changeFunction}
            placeholder="Enter 10-digit Phone Number"
          />
          <small className="error">{errors.phone}</small>
        </div>

        <div className="form-group">
          <label>Department</label>
          <select
            name="department"
            value={formData.department}
            onChange={changeFunction}
          >
            <option value="">Select Department</option>
            <option value="ICU">ICU</option>
            <option value="Emergency">Emergency</option>
            <option value="General Ward">General Ward</option>
            <option value="Pediatrics">Pediatrics</option>
          </select>
          <small className="error">{errors.department}</small>
        </div>

        <div className="form-group">
          <label>Shift Timing</label>
          <select
            name="shiftTiming"
            value={formData.shiftTiming}
            onChange={changeFunction}
          >
            <option value="">Select Shift</option>
            <option value="Morning (8AM - 4PM)">Morning (8AM - 4PM)</option>
            <option value="Evening (4PM - 12AM)">Evening (4PM - 12AM)</option>
            <option value="Night (12AM - 8AM)">Night (12AM - 8AM)</option>
          </select>
          <small className="error">{errors.shiftTiming}</small>
        </div>

        <div className="form-group">
          <label>Password</label>
          <input
            type="password"
            name="password"
            value={formData.password}
            onChange={changeFunction}
            placeholder="Create Strong Password"
          />
          <small className="error">{errors.password}</small>
        </div>

        <button type="submit" className="register-btn">
          Register
        </button>
      </form>
    </div>
  );
}

export default NurseRegistrationForm;
