import NurseRegistrationForm from "./Components/Registration/NurseRegistrationForm";
import "./Components/Registration/NurseForm.css";
import { BrowserRouter, Routes, Route } from "react-router-dom";
function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/register" element={<NurseRegistrationForm />} />
      </Routes>
    </BrowserRouter>
    // <div className="App">
    //   <NurseRegistrationForm />
    // </div>
  );
}

export default App;
