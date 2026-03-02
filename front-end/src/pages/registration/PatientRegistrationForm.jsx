import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../../Components/Navbar";


const PatientRegistrationForm = () => {

  const navigate = useNavigate();

  const initialState = {
    fullName: "",
    email: "",
    phone: "",
    dob: "",
    bloodGroup: "",
    medicalHistory: "",
    password: ""
  };

  const [formData, setFormData] = useState(initialState);
  const [loading, setLoading] = useState(false);
  const [serverError, setServerError] = useState("");

  const handleChange = (e) => {
    setFormData({...formData,[e.target.name]:e.target.value});
    setServerError("");
  };

  const handleSubmit = async (e) => {

    e.preventDefault();

    const confirmRegister = window.confirm(
      "You are registering as a Patient. Are you sure?"
    );

    if(!confirmRegister) return;

    setLoading(true);

    try{

      const res = await fetch("http://localhost:8080/api/postPatient",{
        method:"POST",
        headers:{
          "Content-Type":"application/json"
        },
        body:JSON.stringify(formData)
      });

      const data = await res.json();

      if(!res.ok){
        setServerError(data.message || "Registration Failed");
      }
      else{
        setFormData(initialState);
        navigate("/login");
      }

    }
    catch(err){
      setServerError("Server not connected");
    }

    setLoading(false);

  };

  return (
    <>
     <Navbar />

<div style={styles.page}>

<div style={styles.container}>

{/* Back Button Like Nurse */}
<div
onClick={()=>navigate("/")}
style={styles.backLink}
>
← Back
</div>


<h2 style={styles.title}>
Patient Registration
</h2>


{serverError && (
<div style={styles.error}>
⚠ {serverError}
</div>
)}


<form onSubmit={handleSubmit}>

<label>Full Name</label>
<input
name="fullName"
value={formData.fullName}
onChange={handleChange}
required
style={styles.input}
/>

<label>Email</label>
<input
type="email"
name="email"
value={formData.email}
onChange={handleChange}
required
style={styles.input}
/>

<label>Phone</label>
<input
name="phone"
value={formData.phone}
onChange={handleChange}
required
style={styles.input}
/>

<label>Date Of Birth</label>
<input
type="date"
name="dob"
value={formData.dob}
onChange={handleChange}
required
style={styles.input}
/>

<label>Blood Group</label>

<select
name="bloodGroup"
value={formData.bloodGroup}
onChange={handleChange}
required
style={styles.input}
>

<option value="">Select</option>
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
value={formData.medicalHistory}
onChange={handleChange}
required
style={styles.textarea}
/>


<label>Password</label>

<input
type="password"
name="password"
value={formData.password}
onChange={handleChange}
required
style={styles.input}
/>


<button
type="submit"
disabled={loading}
style={styles.registerBtn}
>

{loading ? "Registering..." : "Register"}

</button>


<p style={styles.loginText}>

Already have an account ?

<span
onClick={()=>navigate("/login")}
style={styles.loginLink}
>

 Login

</span>

</p>

</form>

</div>

</div>
</>

  );

};


const styles = {

page:{
marginTop:"90px",
display:"flex",
justifyContent:"center",
background:"#f5f7fb",
minHeight:"100vh"
},

container:{
width:"420px",
background:"white",
padding:"30px",
borderRadius:"10px",
boxShadow:"0px 5px 15px rgba(0,0,0,0.15)"
},

backLink:{
color:"#1976d2",
fontWeight:"600",
cursor:"pointer",
marginBottom:"10px"
},

title:{
textAlign:"center",
marginBottom:"20px"
},

input:{
width:"100%",
padding:"10px",
marginBottom:"12px",
borderRadius:"6px",
border:"1px solid #ccc"
},

textarea:{
width:"100%",
padding:"10px",
marginBottom:"12px",
height:"80px",
borderRadius:"6px",
border:"1px solid #ccc"
},

registerBtn:{
width:"100%",
padding:"12px",
background:"#2e7d32",
color:"white",
border:"none",
borderRadius:"6px",
fontSize:"16px",
cursor:"pointer"
},

loginText:{
textAlign:"center",
marginTop:"15px"
},

loginLink:{
color:"#1976d2",
fontWeight:"bold",
cursor:"pointer"
},

error:{
background:"#ffe5e5",
padding:"10px",
marginBottom:"10px",
borderRadius:"6px",
color:"red"
}

};

export default PatientRegistrationForm;