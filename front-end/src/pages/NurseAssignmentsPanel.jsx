import React, { useMemo, useState } from "react";

const API = "http://localhost:8080/api";

const SHIFT_OPTIONS = [
  { value: "morning", label: "Morning" },
  { value: "afternoon", label: "Afternoon" },
  { value: "night", label: "Night" },
];

const fmtDate = (d) =>
  d
    ? new Date(d).toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      })
    : "—";

const shiftLabel = (shift) =>
  SHIFT_OPTIONS.find((option) => option.value === shift)?.label || shift || "—";

export default function NurseAssignmentsPanel({
  nurses,
  patients,
  assignments,
  setAssignments,
  loading,
  showToast,
}) {
  const [search, setSearch] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const [form, setForm] = useState({
    nurseId: "",
    assignmentDate: "",
    shift: "morning",
    patientIds: [],
    notes: "",
  });

  const verifiedNurses = useMemo(
    () => nurses.filter((nurse) => nurse.isVerified),
    [nurses]
  );

  const filteredAssignments = useMemo(() => {
    if (!search.trim()) {
      return assignments;
    }

    const query = search.toLowerCase();
    return assignments.filter((assignment) => {
      const patientNames = assignment.patients?.map((patient) => patient.fullName).join(" ") || "";
      return (
        assignment.nurse?.fullName?.toLowerCase().includes(query) ||
        assignment.nurse?.email?.toLowerCase().includes(query) ||
        patientNames.toLowerCase().includes(query) ||
        shiftLabel(assignment.shift).toLowerCase().includes(query)
      );
    });
  }, [assignments, search]);

  const resetForm = () => {
    setShowModal(false);
    setForm({
      nurseId: "",
      assignmentDate: "",
      shift: "morning",
      patientIds: [],
      notes: "",
    });
  };

  const togglePatient = (patientId) => {
    setForm((prev) => ({
      ...prev,
      patientIds: prev.patientIds.includes(patientId)
        ? prev.patientIds.filter((id) => id !== patientId)
        : [...prev.patientIds, patientId],
    }));
  };

  const selectedNurse = verifiedNurses.find((nurse) => nurse._id === form.nurseId);
  const selectedPatients = patients.filter((patient) => form.patientIds.includes(patient._id));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const res = await fetch(`${API}/nurse-assignments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || "Failed to assign patients to nurse");
      }

      setAssignments((prev) => {
        const existing = prev.find((assignment) => assignment._id === data.assignment._id);
        if (existing) {
          return prev.map((assignment) =>
            assignment._id === data.assignment._id ? data.assignment : assignment
          );
        }
        return [...prev, data.assignment].sort(
          (a, b) => new Date(a.assignmentDate) - new Date(b.assignmentDate)
        );
      });

      showToast("success", data.message || "Patients assigned to nurse successfully");
      resetForm();
    } catch (err) {
      showToast("error", err.message || "Failed to assign patients to nurse");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    setDeletingId(id);

    try {
      const res = await fetch(`${API}/nurse-assignments/${id}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || "Failed to delete nurse assignment");
      }

      setAssignments((prev) => prev.filter((assignment) => assignment._id !== id));
      showToast("success", data.message || "Nurse assignment deleted successfully");
    } catch (err) {
      showToast("error", err.message || "Failed to delete nurse assignment");
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <>
      <div className="toolbar">
        <div className="search-wrap">
          <span className="search-icon">🔍</span>
          <input
            placeholder="Search nurse assignments by nurse, patient, or shift…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="result-count">
          {filteredAssignments.length} result{filteredAssignments.length !== 1 ? "s" : ""}
        </div>
        <button
          className="dash-refresh"
          onClick={() => setShowModal(true)}
          style={{ marginLeft: "auto" }}
        >
          ➕ Assign To Nurse
        </button>
      </div>

      <div className="table-wrap">
        <div className="table-scroll">
          <table>
            <thead>
              <tr>
                <th>#</th>
                <th>Nurse</th>
                <th>Date</th>
                <th>Shift</th>
                <th>Patients</th>
                <th>Notes</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={7}>
                    <div className="empty-state">
                      <div className="empty-text">Loading nurse assignments…</div>
                    </div>
                  </td>
                </tr>
              ) : filteredAssignments.length === 0 ? (
                <tr>
                  <td colSpan={7}>
                    <div className="empty-state">
                      <div className="empty-icon">💉</div>
                      <div className="empty-text">
                        {search ? `No results for "${search}"` : "No nurse assignments created yet"}
                      </div>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredAssignments.map((assignment, index) => (
                  <tr key={assignment._id}>
                    <td style={{ color: "#334155", fontFamily: "'DM Mono',monospace", fontSize: 12 }}>
                      {index + 1}
                    </td>
                    <td>
                      <div className="user-cell">
                        <div
                          className="avatar"
                          style={{
                            "--av-bg": "rgba(168,85,247,0.12)",
                            "--av-c": "#a855f7",
                            "--av-border": "rgba(168,85,247,0.3)",
                          }}
                        >
                          {(assignment.nurse?.fullName || "?")
                            .split(" ")
                            .slice(0, 2)
                            .map((part) => part[0])
                            .join("")
                            .toUpperCase()}
                        </div>
                        <div>
                          <div className="user-name">{assignment.nurse?.fullName || "Unknown nurse"}</div>
                          <div className="user-id">{assignment.nurse?.department || "No department"}</div>
                        </div>
                      </div>
                    </td>
                    <td style={{ fontFamily: "'DM Mono',monospace", fontSize: 12 }}>
                      {fmtDate(assignment.assignmentDate)}
                    </td>
                    <td>
                      <span className="badge badge-verified">{shiftLabel(assignment.shift)}</span>
                    </td>
                    <td>
                      <div style={{ display: "grid", gap: "6px" }}>
                        {assignment.patients?.map((patient) => (
                          <span key={patient._id} style={{ fontSize: "12px" }}>
                            {patient.fullName}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td style={{ maxWidth: 220, whiteSpace: "normal" }}>
                      {assignment.notes?.trim() || "No notes added"}
                    </td>
                    <td>
                      <button
                        className="btn-delete"
                        onClick={() => handleDelete(assignment._id)}
                        disabled={deletingId === assignment._id}
                      >
                        {deletingId === assignment._id ? "Deleting..." : "Delete"}
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {showModal && (
        <div className="overlay" onClick={(e) => { if (e.target === e.currentTarget) resetForm(); }}>
          <div className="confirm-box" style={{ maxWidth: "560px", borderColor: "rgba(168,85,247,0.25)" }}>
            <h5>Assign Patients To Nurse</h5>
            <form onSubmit={handleSubmit} style={{ marginTop: "20px" }}>
              <div style={{ marginBottom: "16px" }}>
                <label style={{ display: "block", marginBottom: "6px", fontSize: "13px", color: "#94a3b8", fontWeight: 600 }}>
                  Nurse *
                </label>
                <select
                  value={form.nurseId}
                  onChange={(e) => setForm((prev) => ({ ...prev, nurseId: e.target.value }))}
                  required
                  style={{
                    width: "100%",
                    padding: "10px 12px",
                    background: "rgba(15,23,42,0.8)",
                    border: "1px solid rgba(99,179,237,0.15)",
                    borderRadius: "8px",
                    color: "#e2e8f0",
                    fontSize: "13px",
                    fontFamily: "'Syne', sans-serif",
                    outline: "none",
                  }}
                >
                  <option value="">Select a verified nurse</option>
                  {verifiedNurses.map((nurse) => (
                    <option key={nurse._id} value={nurse._id}>
                      {nurse.fullName} - {nurse.department}
                    </option>
                  ))}
                </select>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px", marginBottom: "16px" }}>
                <div>
                  <label style={{ display: "block", marginBottom: "6px", fontSize: "13px", color: "#94a3b8", fontWeight: 600 }}>
                    Assignment Date *
                  </label>
                  <input
                    type="date"
                    value={form.assignmentDate}
                    onChange={(e) => setForm((prev) => ({ ...prev, assignmentDate: e.target.value }))}
                    min={new Date().toISOString().split("T")[0]}
                    required
                    style={{
                      width: "100%",
                      padding: "10px 12px",
                      background: "rgba(15,23,42,0.8)",
                      border: "1px solid rgba(99,179,237,0.15)",
                      borderRadius: "8px",
                      color: "#e2e8f0",
                      fontSize: "13px",
                      fontFamily: "'Syne', sans-serif",
                      outline: "none",
                    }}
                  />
                </div>

                <div>
                  <label style={{ display: "block", marginBottom: "6px", fontSize: "13px", color: "#94a3b8", fontWeight: 600 }}>
                    Shift *
                  </label>
                  <select
                    value={form.shift}
                    onChange={(e) => setForm((prev) => ({ ...prev, shift: e.target.value }))}
                    required
                    style={{
                      width: "100%",
                      padding: "10px 12px",
                      background: "rgba(15,23,42,0.8)",
                      border: "1px solid rgba(99,179,237,0.15)",
                      borderRadius: "8px",
                      color: "#e2e8f0",
                      fontSize: "13px",
                      fontFamily: "'Syne', sans-serif",
                      outline: "none",
                    }}
                  >
                    {SHIFT_OPTIONS.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div style={{ marginBottom: "16px" }}>
                <label style={{ display: "block", marginBottom: "6px", fontSize: "13px", color: "#94a3b8", fontWeight: 600 }}>
                  Patients *
                </label>
                <div
                  style={{
                    maxHeight: "210px",
                    overflowY: "auto",
                    border: "1px solid rgba(99,179,237,0.15)",
                    borderRadius: "10px",
                    background: "rgba(15,23,42,0.8)",
                    padding: "10px",
                    display: "grid",
                    gap: "8px",
                  }}
                >
                  {patients.map((patient) => (
                    <label
                      key={patient._id}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "10px",
                        padding: "8px 10px",
                        borderRadius: "8px",
                        background: form.patientIds.includes(patient._id)
                          ? "rgba(16,185,129,0.12)"
                          : "rgba(30,41,59,0.55)",
                        border: form.patientIds.includes(patient._id)
                          ? "1px solid rgba(16,185,129,0.35)"
                          : "1px solid rgba(99,179,237,0.08)",
                        cursor: "pointer",
                      }}
                    >
                      <input
                        type="checkbox"
                        checked={form.patientIds.includes(patient._id)}
                        onChange={() => togglePatient(patient._id)}
                      />
                      <span style={{ fontSize: "13px", color: "#e2e8f0" }}>
                        {patient.fullName} - {patient.bloodGroup || "No blood group"}
                      </span>
                    </label>
                  ))}
                </div>
              </div>

              <div style={{ marginBottom: "20px" }}>
                <label style={{ display: "block", marginBottom: "6px", fontSize: "13px", color: "#94a3b8", fontWeight: 600 }}>
                  Notes (Optional)
                </label>
                <textarea
                  rows={3}
                  value={form.notes}
                  onChange={(e) => setForm((prev) => ({ ...prev, notes: e.target.value }))}
                  placeholder="Ward instructions or shift notes..."
                  style={{
                    width: "100%",
                    padding: "10px 12px",
                    background: "rgba(15,23,42,0.8)",
                    border: "1px solid rgba(99,179,237,0.15)",
                    borderRadius: "8px",
                    color: "#e2e8f0",
                    fontSize: "13px",
                    fontFamily: "'Syne', sans-serif",
                    outline: "none",
                    resize: "vertical",
                  }}
                />
              </div>

              {selectedNurse && selectedPatients.length > 0 && form.assignmentDate && (
                <div
                  style={{
                    marginBottom: "20px",
                    padding: "12px 14px",
                    background: "rgba(168,85,247,0.12)",
                    border: "1px solid rgba(168,85,247,0.28)",
                    borderRadius: "10px",
                    color: "#e9d5ff",
                    fontSize: "12px",
                    lineHeight: 1.6,
                  }}
                >
                  Assignment ready: {selectedPatients.length} patient{selectedPatients.length > 1 ? "s" : ""} to{" "}
                  {selectedNurse.fullName} on {form.assignmentDate} during the {shiftLabel(form.shift)} shift.
                </div>
              )}

              <div className="confirm-actions">
                <button
                  type="submit"
                  className="btn-confirm-del"
                  disabled={submitting || form.patientIds.length === 0}
                  style={{ background: "#a855f7", borderColor: "#a855f7" }}
                >
                  {submitting ? "Assigning..." : "Assign Patients"}
                </button>
                <button
                  type="button"
                  className="btn-confirm-cancel"
                  onClick={resetForm}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
