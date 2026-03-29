import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../Components/Navbar";

const API = "http://localhost:8080/api";

const SHIFT_LABELS = {
  morning: "Morning Shift",
  afternoon: "Afternoon Shift",
  night: "Night Shift",
};

const formatDate = (value) => {
  if (!value) {
    return "-";
  }

  return new Date(value).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

export default function NurseAppointments() {
  const navigate = useNavigate();
  const [nurse, setNurse] = useState(null);
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    try {
      const stored = localStorage.getItem("userInfo");
      const parsed = stored ? JSON.parse(stored) : null;

      if (!parsed || parsed.role !== "nurse" || !parsed._id) {
        navigate("/login", { replace: true });
        return;
      }

      setNurse(parsed);
    } catch {
      navigate("/login", { replace: true });
    }
  }, [navigate]);

  useEffect(() => {
    if (!nurse?._id) {
      return;
    }

    const loadAssignments = async () => {
      setLoading(true);
      setError("");

      try {
        const res = await fetch(`${API}/nurse-assignments/nurse/${nurse._id}`);
        const data = await res.json();

        if (!res.ok) {
          throw new Error(data.message || "Failed to load nurse assignments");
        }

        setAssignments(Array.isArray(data) ? data : []);
      } catch (err) {
        setError(err.message || "Failed to load nurse assignments");
      } finally {
        setLoading(false);
      }
    };

    loadAssignments();
  }, [nurse]);

  const totalPatients = useMemo(
    () =>
      assignments.reduce((count, assignment) => {
        const patients = Array.isArray(assignment.patients) ? assignment.patients : [];
        return count + patients.length;
      }, 0),
    [assignments]
  );

  return (
    <>
      <style>{`
        .nurse-appointments-root {
          min-height: 100vh;
          background: #080d1a;
          color: #e2e8f0;
          padding-top: 64px;
        }

        .nurse-appointments-root::before {
          content: "";
          position: fixed;
          inset: 0;
          background-image:
            linear-gradient(rgba(99,179,237,0.03) 1px, transparent 1px),
            linear-gradient(90deg, rgba(99,179,237,0.03) 1px, transparent 1px);
          background-size: 48px 48px;
          pointer-events: none;
          z-index: 0;
        }

        .nurse-appointments-inner {
          position: relative;
          z-index: 1;
          max-width: 1180px;
          margin: 0 auto;
          padding: 32px 24px 60px;
        }

        .back-btn {
          display: inline-flex;
          align-items: center;
          gap: 7px;
          background: rgba(15,23,42,0.8);
          border: 1px solid rgba(99,179,237,0.18);
          border-radius: 9px;
          padding: 7px 14px;
          font-size: 13px;
          font-weight: 600;
          color: #94a3b8;
          cursor: pointer;
          margin-bottom: 24px;
        }

        .page-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          gap: 16px;
          margin-bottom: 28px;
          flex-wrap: wrap;
        }

        .title {
          font-size: 28px;
          font-weight: 800;
          color: #f8fafc;
          letter-spacing: -0.5px;
        }

        .title span {
          color: #38bdf8;
        }

        .subtitle {
          font-size: 13px;
          color: #94a3b8;
          margin-top: 4px;
        }

        .summary-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
          gap: 14px;
          width: min(480px, 100%);
        }

        .summary-card {
          background: rgba(15,23,42,0.8);
          border: 1px solid rgba(99,179,237,0.12);
          border-radius: 14px;
          padding: 16px 18px;
        }

        .summary-label {
          font-size: 11px;
          color: #64748b;
          text-transform: uppercase;
          letter-spacing: 1px;
        }

        .summary-value {
          font-size: 30px;
          font-weight: 800;
          margin-top: 6px;
          color: #f8fafc;
        }

        .table-wrap {
          background: rgba(10,17,32,0.7);
          border: 1px solid rgba(99,179,237,0.1);
          border-radius: 16px;
          overflow: hidden;
        }

        table {
          width: 100%;
          border-collapse: collapse;
        }

        thead tr {
          background: rgba(15,23,42,0.9);
          border-bottom: 1px solid rgba(99,179,237,0.1);
        }

        th {
          padding: 13px 16px;
          text-align: left;
          font-size: 10px;
          font-weight: 700;
          color: #475569;
          text-transform: uppercase;
          letter-spacing: 1px;
          white-space: nowrap;
        }

        td {
          padding: 14px 16px;
          font-size: 13px;
          color: #cbd5e1;
          border-bottom: 1px solid rgba(99,179,237,0.05);
          vertical-align: top;
        }

        tbody tr:last-child td {
          border-bottom: none;
        }

        tbody tr:hover {
          background: rgba(56,189,248,0.04);
        }

        .shift-badge {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          border-radius: 999px;
          padding: 5px 10px;
          font-size: 11px;
          font-weight: 700;
          background: rgba(56,189,248,0.12);
          border: 1px solid rgba(56,189,248,0.25);
          color: #7dd3fc;
        }

        .patient-list {
          display: flex;
          flex-direction: column;
          gap: 10px;
          min-width: 280px;
        }

        .patient-card {
          background: rgba(15,23,42,0.7);
          border: 1px solid rgba(99,179,237,0.08);
          border-radius: 12px;
          padding: 12px 14px;
        }

        .patient-name {
          font-weight: 700;
          color: #f1f5f9;
        }

        .meta-line {
          font-size: 12px;
          color: #94a3b8;
          margin-top: 4px;
        }

        .notes {
          color: #cbd5e1;
          line-height: 1.5;
          max-width: 240px;
        }

        .state-box {
          padding: 46px 20px;
          text-align: center;
          color: #94a3b8;
        }

        @media (max-width: 860px) {
          .table-wrap {
            overflow-x: auto;
          }
        }
      `}</style>

      <Navbar />

      <div className="nurse-appointments-root">
        <div className="nurse-appointments-inner">
          <button className="back-btn" type="button" onClick={() => navigate("/")}>
            Back
          </button>

          <div className="page-header">
            <div>
              <div className="title">
                Nurse <span>Appointments</span>
              </div>
              <div className="subtitle">
                Shift-wise patient assignments allocated for your care
              </div>
            </div>

            <div className="summary-grid">
              <div className="summary-card">
                <div className="summary-label">Assigned Shifts</div>
                <div className="summary-value">{assignments.length}</div>
              </div>
              <div className="summary-card">
                <div className="summary-label">Assigned Patients</div>
                <div className="summary-value">{totalPatients}</div>
              </div>
            </div>
          </div>

          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>#</th>
                  <th>Date</th>
                  <th>Shift</th>
                  <th>Patients</th>
                  <th>Notes</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={5}>
                      <div className="state-box">Loading nurse assignments...</div>
                    </td>
                  </tr>
                ) : error ? (
                  <tr>
                    <td colSpan={5}>
                      <div className="state-box">{error}</div>
                    </td>
                  </tr>
                ) : assignments.length === 0 ? (
                  <tr>
                    <td colSpan={5}>
                      <div className="state-box">No nurse appointments assigned yet.</div>
                    </td>
                  </tr>
                ) : (
                  assignments.map((assignment, index) => (
                    <tr key={assignment._id}>
                      <td>{index + 1}</td>
                      <td>{formatDate(assignment.assignmentDate)}</td>
                      <td>
                        <span className="shift-badge">
                          {SHIFT_LABELS[assignment.shift] || assignment.shift || "-"}
                        </span>
                      </td>
                      <td>
                        <div className="patient-list">
                          {(assignment.patients || []).map((patient) => (
                            <div key={patient._id} className="patient-card">
                              <div className="patient-name">
                                {patient.fullName || "Unknown patient"}
                              </div>
                              <div className="meta-line">
                                {patient.email || "No email"}
                              </div>
                              <div className="meta-line">
                                {patient.phone || "No phone"}
                              </div>
                              <div className="meta-line">
                                Blood Group: {patient.bloodGroup || "Not added"}
                              </div>
                            </div>
                          ))}
                        </div>
                      </td>
                      <td className="notes">{assignment.notes?.trim() || "No notes added"}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </>
  );
}
