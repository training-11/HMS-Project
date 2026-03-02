import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

function NurseRegistrationForm() {

  const navigate = useNavigate();

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
  const [loading, setLoading] = useState(false);
  const [serverError, setServerError] = useState("");

  const changeFunction = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    setServerError("");
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

  const formSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    const confirmRegister = window.confirm(
      "You are registering as a Nurse. Are you sure?"
    );
    if (!confirmRegister) return;

    setLoading(true);
    setServerError("");

    try {
      const res = await fetch("http://localhost:8080/api/postNurse", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (!res.ok) {
        setServerError(data.message || "Registration failed");
      } else {
        setFormData(initialState);
        setErrors({});
        navigate("/login");
      }

    } catch (err) {
      setServerError("Server connection failed");
    }

    setLoading(false);
  };

  return (

    <div style={containerStyle}>

      <div style={formBox}>

        {/* BACK BUTTON */}
        <button
          onClick={()=>navigate("/")}
          style={backBtn}
        >
          ← Back
        </button>

        <h2 style={titleStyle}>Nurse Registration</h2>

        {serverError && (
          <div style={errorBox}>
            ⚠ {serverError}
          </div>
        )}

        <form onSubmit={formSubmit}>

          <label>Full Name</label>
          <input
            style={inputStyle}
            type="text"
            name="fullName"
            value={formData.fullName}
            onChange={changeFunction}
            placeholder="Enter Full Name"
          />
          <small style={errorText}>{errors.fullName}</small>


          <label>Email Address</label>
          <input
            style={inputStyle}
            type="email"
            name="email"
            value={formData.email}
            onChange={changeFunction}
            placeholder="Enter Email"
          />
          <small style={errorText}>{errors.email}</small>


          <label>Phone Number</label>
          <input
            style={inputStyle}
            type="tel"
            name="phone"
            value={formData.phone}
            onChange={changeFunction}
            placeholder="Enter Phone"
          />
          <small style={errorText}>{errors.phone}</small>


          <label>Department</label>
          <select
            style={inputStyle}
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
          <small style={errorText}>{errors.department}</small>


          <label>Shift Timing</label>
          <select
            style={inputStyle}
            name="shiftTiming"
            value={formData.shiftTiming}
            onChange={changeFunction}
          >
            <option value="">Select Shift</option>
            <option>Morning (8AM - 4PM)</option>
            <option>Evening (4PM - 12AM)</option>
            <option>Night (12AM - 8AM)</option>
          </select>
          <small style={errorText}>{errors.shiftTiming}</small>


          <label>Password</label>
          <input
            style={inputStyle}
            type="password"
            name="password"
            value={formData.password}
            onChange={changeFunction}
            placeholder="Password"
          />
          <small style={errorText}>{errors.password}</small>


          <button style={registerBtn} type="submit" disabled={loading}>
            {loading ? "Registering..." : "Register"}
          </button>


          <p style={{textAlign:"center",marginTop:"10px"}}>
            Already have account?
            <span
            onClick={()=>navigate("/login")}
            style={{
              color:"#0077b6",
              cursor:"pointer",
              marginLeft:"5px"
            }}>
              Login
            </span>
          </p>

        </form>

      </div>

    </div>
  );
}


/* STYLES */

const containerStyle = {
  display:"flex",
  justifyContent:"center",
  alignItems:"center",
  height:"100vh",
  background:"#f5f7fa"
};

const formBox = {
  width:"420px",
  padding:"30px",
  background:"white",
  borderRadius:"10px",
  boxShadow:"0px 0px 10px rgba(0,0,0,0.1)"
};

const titleStyle = {
  textAlign:"center",
  color:"#0077b6",
  marginBottom:"20px"
};

const inputStyle = {
  width:"100%",
  padding:"10px",
  marginBottom:"8px",
  borderRadius:"6px",
  border:"1px solid #ccc"
};

const registerBtn = {
  width:"100%",
  padding:"10px",
  background:"#0077b6",
  color:"white",
  border:"none",
  borderRadius:"6px",
  cursor:"pointer",
  marginTop:"10px"
};

const backBtn = {
  border:"none",
  background:"transparent",
  color:"#0077b6",
  fontSize:"15px",
  cursor:"pointer",
  marginBottom:"10px",
  fontWeight:"600"
};

const errorBox = {
  background:"#ffebee",
  padding:"10px",
  borderRadius:"6px",
  marginBottom:"10px",
  color:"#c62828"
};

const errorText = {
  color:"red",
  fontSize:"12px"
};

export default NurseRegistrationForm;