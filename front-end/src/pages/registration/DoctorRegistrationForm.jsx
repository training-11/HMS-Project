import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../../Components/Navbar";

function DoctorRegistrationForm() {

  const navigate = useNavigate();

  const initialState = {
    fullName: "",
    email: "",
    phone: "",
    specialty: "",
    department: "",
    password: ""
  };

  const specialties = [
    "Cardiology",
    "Neurology",
    "Orthopedics",
    "Dermatology",
    "Pediatrics",
    "Oncology",
    "Radiology",
    "General Surgery"
  ];

  const departments = [
    "Emergency",
    "ICU",
    "OPD",
    "Surgery",
    "Diagnostics",
    "Maternity"
  ];

  const [formData,setFormData] = useState(initialState);
  const [loading,setLoading] = useState(false);
  const [serverError,setServerError] = useState("");

  const handleChange = (e)=>{
    setFormData({...formData,[e.target.name]:e.target.value});
    setServerError("");
  };

  const handleSubmit = async(e)=>{
    e.preventDefault();

    const confirmRegister = window.confirm(
      "You are registering as a Doctor. Are you sure?"
    );

    if(!confirmRegister) return;

    setLoading(true);
    setServerError("");

    try{

      const res = await fetch("http://localhost:8080/api/postDoc",{
        method:"POST",
        headers:{
          "Content-Type":"application/json"
        },
        body:JSON.stringify(formData)
      });

      const data = await res.json();

      if(!res.ok){
        setServerError(data.message || "Registration Failed");
      }else{
        setFormData(initialState);
        navigate("/login");
      }

    }catch(err){
      setServerError("Server connection failed");
    }

    setLoading(false);
  };

  return (
    <>
     <Navbar />
    <div style={containerStyle}>

      <div style={formBox}>

        {/* BACK BUTTON */}
        <button
          onClick={()=>navigate("/")}
          style={backBtn}
        >
          ← Back
        </button>

        <h2 style={titleStyle}>Doctor Registration</h2>

        {serverError && (
          <div style={errorBox}>
            {serverError}
          </div>
        )}

        <form onSubmit={handleSubmit}>

          <input
          style={inputStyle}
          type="text"
          name="fullName"
          placeholder="Full Name"
          value={formData.fullName}
          onChange={handleChange}
          required
          />

          <input
          style={inputStyle}
          type="email"
          name="email"
          placeholder="Email"
          value={formData.email}
          onChange={handleChange}
          required
          />

          <input
          style={inputStyle}
          type="text"
          name="phone"
          placeholder="Phone"
          value={formData.phone}
          onChange={handleChange}
          required
          />

          {/* SPECIALTY DROPDOWN */}

          <select
          style={inputStyle}
          name="specialty"
          value={formData.specialty}
          onChange={handleChange}
          required
          >
            <option value="">Select Specialty</option>

            {specialties.map((s)=>(
              <option key={s} value={s}>{s}</option>
            ))}

          </select>

          {/* DEPARTMENT DROPDOWN */}

          <select
          style={inputStyle}
          name="department"
          value={formData.department}
          onChange={handleChange}
          required
          >
            <option value="">Select Department</option>

            {departments.map((d)=>(
              <option key={d} value={d}>{d}</option>
            ))}

          </select>

          <input
          style={inputStyle}
          type="password"
          name="password"
          placeholder="Password"
          value={formData.password}
          onChange={handleChange}
          required
          />

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
    </>
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
  width:"400px",
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
  marginBottom:"12px",
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
  cursor:"pointer"
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

export default DoctorRegistrationForm;