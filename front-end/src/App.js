import NurseRegistrationForm from "./Components/Registration/NurseRegistrationForm";
import PatientRegistrationForm from "./Components/Registration/PatientRegistrationForm";
import PatientList from "./Components/Registration/PatientList";
import ContactUs from "./Components/ContactAccess/ContactUs";
import "./Components/Registration/NurseForm.css";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import DoctorRegistrationForm from "./Components/RegistrationPages/DoctorRegistrationForm";
import AboutUs from "./Components/AboutUs";
function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/nurse-register" element={<NurseRegistrationForm />} />
        <Route path="/patient-register" element={<PatientRegistrationForm />} />
        <Route path="/patients" element={<PatientList />} /> 
        <Route path="/ContactUs" element={<ContactUs/>} />
        <Route path = "/Doctor-register " element = {<DoctorRegistrationForm />} />
        <Route path = "/AboutUs " element = {<AboutUs />} />
      </Routes>
    </BrowserRouter>
    // <div className="App">
    //   <NurseRegistrationForm />
    // </div>
  );
}

export default App;
