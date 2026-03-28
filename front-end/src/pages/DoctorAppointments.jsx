import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../Components/Navbar";

const API = "http://localhost:8080/api";

const fmtDate = (d) =>
  d
    ? new Date(d).toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      })
    : "—";

export default function DoctorAppointments() {
  const navigate = useNavigate();
  const [doctor, setDoctor] = useState(null);
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    try {
      const stored = localStorage.getItem("userInfo");
      const parsed = stored ? JSON.parse(stored) : null;

      if (!parsed || parsed.role !== "doctor" || !parsed._id) {
        navigate("/login", { replace: true });
        return;
      }

      setDoctor(parsed);
    } catch {
      navigate("/login", { replace: true });
    }
  }, [navigate]);

  useEffect(() => {
    if (!doctor?._id) {
      return;
    }

    const loadAppointments = async () => {
      setLoading(true);
      setError("");

      try {
        const res = await fetch(`${API}/appointments/doctor/${doctor._id}`);
        const data = await res.json();

        if (!res.ok) {
          throw new Error(data.message || "Failed to load appointments");
        }

        setAppointments(Array.isArray(data) ? data : []);
      } catch (err) {
        setError(err.message || "Failed to load appointments");
      } finally {
        setLoading(false);
      }
    };

    loadAppointments();
  }, [doctor]);

  const scheduledAppointments = useMemo(
    () => appointments.filter((appointment) => appointment.status === "scheduled"),
    [appointments]
  );

  return (
    <>
      <style>{`
        .doctor-appointments-root {
          min-height: 100vh;
          background: #080d1a;
          color: #e2e8f0;
          padding-top: 64px;
        }

        .doctor-appointments-root::before {
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

        .doctor-appointments-inner {
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
          color: #64748b;
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
          color: #3b82f6;
        }

        .subtitle {
          font-size: 13px;
          color: #64748b;
          margin-top: 4px;
        }

        .summary-card {
          background: rgba(15,23,42,0.8);
          border: 1px solid rgba(99,179,237,0.12);
          border-radius: 14px;
          padding: 16px 18px;
          min-width: 220px;
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
          background: rgba(59,130,246,0.04);
        }

        .patient-name {
          font-weight: 700;
          color: #f1f5f9;
        }

        .meta-line {
          font-size: 12px;
          color: #64748b;
          margin-top: 4px;
        }

        .badge {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          border-radius: 999px;
          padding: 5px 10px;
          font-size: 11px;
          font-weight: 700;
          background: rgba(245,158,11,0.12);
          border: 1px solid rgba(245,158,11,0.3);
          color: #fbbf24;
        }

        .state-box {
          padding: 46px 20px;
          text-align: center;
          color: #94a3b8;
        }
      `}</style>

      <Navbar />

      <div className="doctor-appointments-root">
        <div className="doctor-appointments-inner">
          <button className="back-btn" type="button" onClick={() => navigate("/")}>
            Back
          </button>

          <div className="page-header">
            <div>
              <div className="title">
                Doctor <span>Appointments</span>
              </div>
              <div className="subtitle">
                Scheduled patients assigned to your time slots
              </div>
            </div>

            <div className="summary-card">
              <div className="summary-label">Scheduled Now</div>
              <div className="summary-value">{scheduledAppointments.length}</div>
            </div>
          </div>

          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>#</th>
                  <th>Patient</th>
                  <th>Date</th>
                  <th>Time Slot</th>
                  <th>Status</th>
                  <th>Notes</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={6}>
                      <div className="state-box">Loading scheduled appointments...</div>
                    </td>
                  </tr>
                ) : error ? (
                  <tr>
                    <td colSpan={6}>
                      <div className="state-box">{error}</div>
                    </td>
                  </tr>
                ) : scheduledAppointments.length === 0 ? (
                  <tr>
                    <td colSpan={6}>
                      <div className="state-box">No scheduled appointments assigned yet.</div>
                    </td>
                  </tr>
                ) : (
                  scheduledAppointments.map((appointment, index) => (
                    <tr key={appointment._id}>
                      <td>{index + 1}</td>
                      <td>
                        <div className="patient-name">
                          {appointment.patient?.fullName || "Unknown patient"}
                        </div>
                        <div className="meta-line">
                          {appointment.patient?.email || "No email"}
                        </div>
                        <div className="meta-line">
                          {appointment.patient?.phone || "No phone"}
                        </div>
                      </td>
                      <td>{fmtDate(appointment.appointmentDate)}</td>
                      <td>{appointment.timeSlot || "—"}</td>
                      <td>
                        <span className="badge">Scheduled</span>
                      </td>
                      <td>{appointment.notes?.trim() || "No notes added"}</td>
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
