import React from "react";

const PatientList = ({ patients, setPatients }) => {

  const handleDelete = (index) => {
    const updated = patients.filter((_, i) => i !== index);
    setPatients(updated);
    localStorage.setItem("patients", JSON.stringify(updated));
  };

  return (
    <div style={{ width: "600px", margin: "30px auto" }}>
      <h2>Registered Patients</h2>

      {patients.length === 0 ? (
        <p>No patients registered</p>
      ) : (
        <table border="1" width="100%">
          <thead>
            <tr>
              <th>Name</th>
              <th>Email</th>
              <th>Phone</th>
              <th>Blood</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {patients.map((p, index) => (
              <tr key={index}>
                <td>{p.fullName}</td>
                <td>{p.email}</td>
                <td>{p.phone}</td>
                <td>{p.bloodGroup}</td>
                <td>
                  <button onClick={() => handleDelete(index)}>Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default PatientList;