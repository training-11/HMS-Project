import NurseRegistrationForm from "./pages/registration/NurseRegistrationForm";
import PatientRegistrationForm from "./pages/registration/PatientRegistrationForm";
//import PatientList from "./pages/registration/PatientList";
import ContactUs from "./pages/ContactUs";
import Login from "./pages/registration/Login";

import { BrowserRouter, Routes, Route } from "react-router-dom";
import DoctorRegistrationForm from "./pages/registration/DoctorRegistrationForm";
import AboutUs from "./pages/AboutUs";
import Home from "./pages/Home";
function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/nurse-register" element={<NurseRegistrationForm />} />
        <Route path="/patient-register" element={<PatientRegistrationForm />} />
        {/* <Route path="/patients" element={<PatientList />} /> */}
        <Route path="/login" element={<Login />} />
        <Route path="/ContactUs" element={<ContactUs />} />
        <Route path="/doctor-register" element={<DoctorRegistrationForm />} />
        <Route path="/aboutUs" element={<AboutUs />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
