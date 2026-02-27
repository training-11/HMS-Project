import NurseRegistrationForm from "./Components/Registration/NurseRegistrationForm";
import PatientRegistrationForm from "./Components/Registration/PatientRegistrationForm";
import PatientList from "./Components/Registration/PatientList";
import ContactUs from "./Components/ContactAccess/ContactUs";
import "./Components/Registration/NurseForm.css";
import { BrowserRouter, Routes, Route } from "react-router-dom";
function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/register" element={<NurseRegistrationForm />} />
        <Route path="/patient-register" element={<PatientRegistrationForm />} />
        <Route path="/patients" element={<PatientList />} /> 
        <Route path="/ContactUs" element={<ContactUs/>} />
      </Routes>
    </BrowserRouter>
    // <div className="App">
    //   <NurseRegistrationForm />
    // </div>
  );
}

export default App;
