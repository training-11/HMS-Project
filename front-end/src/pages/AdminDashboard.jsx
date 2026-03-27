
import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../Components/Navbar";

const API = "http://localhost:8080/api";

const ROLE_META = {
  doctor:  { label: "Doctors",  color: "#3b82f6", bg: "rgba(59,130,246,0.12)",  border: "rgba(59,130,246,0.3)",  icon: "🩺" },
  nurse:   { label: "Nurses",   color: "#a855f7", bg: "rgba(168,85,247,0.12)", border: "rgba(168,85,247,0.3)", icon: "💉" },
  patient: { label: "Patients", color: "#10b981", bg: "rgba(16,185,129,0.12)", border: "rgba(16,185,129,0.3)", icon: "🏥" },
  // admin:   { label: "Admins",   color: "#f59e0b", bg: "rgba(245,158,11,0.12)", border: "rgba(245,158,11,0.3)",  icon: "🛡️" },
};

// ── tiny helpers ──────────────────────────────────────────────────────────
const fmt = (val) => val || "—";
const fmtDate = (d) => d ? new Date(d).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" }) : "—";
const initials = (name = "") => name.split(" ").slice(0, 2).map((w) => w[0]).join("").toUpperCase() || "?";

// ── primary display fields per role ──────────────────────────────────────
const COLS = {
  doctor:  ["fullName", "email", "phone", "specialty", "department"],
  nurse:   ["fullName", "email", "phone", "department"],
  patient: ["fullName", "email", "phone", "bloodGroup", "gender"],
  // admin:   ["fullName", "email", "phone", "adminRole", "department"],
};
const COL_LABELS = {
  fullName: "Name", email: "Email", phone: "Phone",
  specialty: "Specialty", department: "Department",
  bloodGroup: "Blood Group", gender: "Gender",
  adminRole: "Role",
};

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("doctor");
  const [data, setData] = useState({ doctor: [], nurse: [], patient: [] });
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(null); // "<role>-<id>-verify|delete"
  const [toast, setToast] = useState(null);
  const [search, setSearch] = useState("");
  const [confirmDelete, setConfirmDelete] = useState(null); // { role, id, name }
  const [selectedUser, setSelectedUser] = useState(null);

  // ── fetch all users — calls your 4 existing working endpoints in parallel
  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try {
      const [docRes, nurseRes, patientRes, adminRes] = await Promise.all([
        fetch(`${API}/getDoc`),
        fetch(`${API}/getNurse`),
        fetch(`${API}/getPatient`),
        // fetch(`${API}/getAdmin`),
      ]);

      // collect any failed responses
      const failed = [
        !docRes.ok     && "doctors",
        !nurseRes.ok   && "nurses",
        !patientRes.ok && "patients",
        // !adminRes.ok   && "admins",
      ].filter(Boolean);

      if (failed.length === 4) throw new Error("All endpoints failed — is the server running?");

      const [doctors, nurses, patients, admins] = await Promise.all([
        docRes.ok     ? docRes.json()     : Promise.resolve([]),
        nurseRes.ok   ? nurseRes.json()   : Promise.resolve([]),
        patientRes.ok ? patientRes.json() : Promise.resolve([]),
        // adminRes.ok   ? adminRes.json()   : Promise.resolve([]),
      ]);

      setData({
        doctor:  Array.isArray(doctors)  ? doctors  : [],
        nurse:   Array.isArray(nurses)   ? nurses   : [],
        patient: Array.isArray(patients) ? patients : [],
        // admin:   Array.isArray(admins)   ? admins   : [],
      });

      if (failed.length > 0) {
        showToast("error", `Could not load: ${failed.join(", ")}`);
      }
    } catch (err) {
      showToast("error", err.message || "Could not connect to server");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchUsers(); }, [fetchUsers]);

  // ── toast ─────────────────────────────────────────────────────────────
  const showToast = (type, msg) => {
    setToast({ type, msg });
    setTimeout(() => setToast(null), 3200);
  };

  // ── verify ────────────────────────────────────────────────────────────
  const handleVerify = async (role, id) => {
    const key = `${role}-${id}-verify`;
    setActionLoading(key);
    try {
      const res = await fetch(`${API}/verifyUser/${role}/${id}`, { method: "PATCH" });
      let json = {};
      try { json = await res.json(); } catch (_) {}
      if (!res.ok) throw new Error(json.message || `Server returned ${res.status}`);
      setData((prev) => ({
        ...prev,
        [role]: prev[role].map((u) =>
          u._id === id ? { ...u, isVerified: true, verifiedAt: new Date().toISOString() } : u
        ),
      }));
      showToast("success", "User verified successfully");
    } catch (err) {
      showToast("error", err.message || "Verification failed");
    } finally {
      setActionLoading(null);
    }
  };


const handleReject = async (role, id) => {
  const key = `${role}-${id}-reject`;
  setActionLoading(key);

  try {
    const res = await fetch(`${API}/rejectUser/${role}/${id}`, {
      method: "PATCH",
    });

    let json = {};
    try { json = await res.json(); } catch (_) {}

    if (!res.ok) throw new Error(json.message || "Reject failed");

    // 🔥 update UI (mark as rejected)
    setData((prev) => ({
      ...prev,
      [role]: prev[role].map((u) =>
        u._id === id ? { ...u, isRejected: true, isVerified: false } : u
      ),
    }));

    showToast("success", "User rejected & mail sent");

  } catch (err) {
    showToast("error", err.message);
  } finally {
    setActionLoading(null);
  }
};
  // ── delete ────────────────────────────────────────────────────────────
  const handleDelete = async () => {
    if (!confirmDelete) return;
    const { role, id } = confirmDelete;
    const key = `${role}-${id}-delete`;
    setActionLoading(key);
    setConfirmDelete(null);
    try {
      const res = await fetch(`${API}/deleteUser/${role}/${id}`, { method: "DELETE" });
      let json = {};
      try { json = await res.json(); } catch (_) {}
      if (!res.ok) throw new Error(json.message || `Server returned ${res.status}`);
      setData((prev) => ({
        ...prev,
        [role]: prev[role].filter((u) => u._id !== id),
      }));
      showToast("success", "User deleted successfully");
    } catch (err) {
      showToast("error", err.message || "Delete failed — make sure verify/delete routes are added to routes.js");
    } finally {
      setActionLoading(null);
    }
  };

  // ── filtered list ──────────────────────────────────────────────────────
  const filtered = data[activeTab].filter((u) => {
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return (
      u.fullName?.toLowerCase().includes(q) ||
      u.email?.toLowerCase().includes(q) ||
      u.phone?.includes(q)
    );
  });

  const meta = ROLE_META[activeTab];
  const totalAll = Object.values(data).reduce((s, arr) => s + arr.length, 0);
  const verifiedAll = Object.values(data).reduce(
    (s, arr) => s + arr.filter((u) => u.isVerified).length, 0
  );

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=DM+Mono:wght@400;500&display=swap');

        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        body { font-family: 'Syne', sans-serif; }

        .dash-root {
          min-height: 100vh;
          background: #080d1a;
          color: #e2e8f0;
          padding-top: 64px;
        }

        /* ── grid overlay ── */
        .dash-root::before {
          content: '';
          position: fixed; inset: 0;
          background-image:
            linear-gradient(rgba(99,179,237,0.03) 1px, transparent 1px),
            linear-gradient(90deg, rgba(99,179,237,0.03) 1px, transparent 1px);
          background-size: 48px 48px;
          pointer-events: none;
          z-index: 0;
        }

        .dash-inner { position: relative; z-index: 1; max-width: 1280px; margin: 0 auto; padding: 32px 24px 60px; }

        /* ── header ── */
        .dash-header { display: flex; align-items: flex-start; justify-content: space-between; margin-bottom: 32px; flex-wrap: wrap; gap: 16px; }
        .dash-title { font-size: 28px; font-weight: 800; color: #f8fafc; letter-spacing: -0.5px; }
        .dash-title span { color: #3b82f6; }
        .dash-subtitle { font-size: 13px; color: #475569; margin-top: 3px; font-family: 'DM Mono', monospace; }
        .dash-refresh {
          display: flex; align-items: center; gap: 7px;
          background: rgba(30,41,59,0.7);
          border: 1px solid rgba(99,179,237,0.15);
          border-radius: 9px; padding: 8px 14px;
          color: #94a3b8; font-size: 13px; font-weight: 600;
          cursor: pointer; transition: all 0.2s; font-family: 'Syne', sans-serif;
        }
        .dash-refresh:hover { border-color: rgba(59,130,246,0.4); color: #e2e8f0; background: rgba(59,130,246,0.08); }

        /* ── stat cards ── */
        .stat-row { display: grid; grid-template-columns: repeat(auto-fit, minmax(160px, 1fr)); gap: 14px; margin-bottom: 28px; }
        .stat-card {
          background: rgba(15,23,42,0.8);
          border: 1px solid rgba(99,179,237,0.1);
          border-radius: 14px; padding: 18px 20px;
          position: relative; overflow: hidden;
          transition: border-color 0.2s, transform 0.2s;
        }
        .stat-card:hover { border-color: rgba(99,179,237,0.25); transform: translateY(-1px); }
        .stat-card::before {
          content: '';
          position: absolute; top: 0; left: 0; right: 0; height: 2px;
          background: var(--c);
          border-radius: 14px 14px 0 0;
        }
        .stat-num { font-size: 32px; font-weight: 800; color: #f1f5f9; line-height: 1; }
        .stat-label { font-size: 12px; color: #64748b; margin-top: 4px; font-family: 'DM Mono', monospace; }
        .stat-icon { position: absolute; right: 14px; top: 14px; font-size: 22px; opacity: 0.5; }

        /* ── tabs ── */
        .tab-bar {
          display: flex; gap: 6px; margin-bottom: 20px;
          background: rgba(15,23,42,0.6);
          border: 1px solid rgba(99,179,237,0.1);
          border-radius: 12px; padding: 5px;
          flex-wrap: wrap;
        }
        .tab-btn {
          flex: 1; min-width: 100px;
          display: flex; align-items: center; justify-content: center; gap: 7px;
          padding: 9px 14px; border-radius: 8px;
          border: none; background: transparent;
          color: #475569; font-size: 13px; font-weight: 700;
          cursor: pointer; transition: all 0.2s; font-family: 'Syne', sans-serif;
          white-space: nowrap;
        }
        .tab-btn:hover { color: #94a3b8; background: rgba(99,179,237,0.06); }
        .tab-btn.active {
          background: var(--tc-bg);
          color: var(--tc);
          border: 1px solid var(--tc-border);
          box-shadow: 0 2px 12px rgba(0,0,0,0.2);
        }
        .tab-count {
          background: rgba(0,0,0,0.3);
          border-radius: 20px; padding: 1px 7px;
          font-size: 11px; font-family: 'DM Mono', monospace;
        }
        .tab-btn.active .tab-count { background: rgba(0,0,0,0.25); }

        /* ── toolbar ── */
        .toolbar { display: flex; align-items: center; gap: 12px; margin-bottom: 16px; flex-wrap: wrap; }
        .search-wrap { position: relative; flex: 1; min-width: 200px; }
        .search-wrap input {
          width: 100%;
          background: rgba(15,23,42,0.8);
          border: 1px solid rgba(99,179,237,0.15);
          border-radius: 9px; padding: 9px 14px 9px 38px;
          color: #e2e8f0; font-size: 13px; font-family: 'Syne', sans-serif;
          outline: none; transition: border-color 0.2s;
        }
        .search-wrap input::placeholder { color: #334155; }
        .search-wrap input:focus { border-color: rgba(59,130,246,0.4); }
        .search-icon { position: absolute; left: 12px; top: 50%; transform: translateY(-50%); color: #475569; font-size: 14px; }
        .result-count { font-size: 12px; color: #475569; font-family: 'DM Mono', monospace; white-space: nowrap; }

        /* ── table wrapper ── */
        .table-wrap {
          background: rgba(10,17,32,0.7);
          border: 1px solid rgba(99,179,237,0.1);
          border-radius: 16px; overflow: hidden;
        }
        .table-scroll { overflow-x: auto; }
        table { width: 100%; border-collapse: collapse; }
        thead tr {
          background: rgba(15,23,42,0.9);
          border-bottom: 1px solid rgba(99,179,237,0.1);
        }
        th {
          padding: 13px 16px;
          text-align: left;
          font-size: 10px; font-weight: 700;
          color: #475569; text-transform: uppercase;
          letter-spacing: 1px; white-space: nowrap;
          font-family: 'DM Mono', monospace;
        }
        tbody tr {
          border-bottom: 1px solid rgba(99,179,237,0.05);
          transition: background 0.15s;
        }
        tbody tr:last-child { border-bottom: none; }
        tbody tr:hover { background: rgba(59,130,246,0.04); }
        td {
          padding: 13px 16px;
          font-size: 13px; color: #cbd5e1;
          vertical-align: middle;
        }

        /* ── avatar cell ── */
        .user-cell { display: flex; align-items: center; gap: 10px; }
        .avatar {
          width: 34px; height: 34px; border-radius: 50%;
          display: flex; align-items: center; justify-content: center;
          font-size: 12px; font-weight: 800; flex-shrink: 0;
          background: var(--av-bg); color: var(--av-c);
          border: 1.5px solid var(--av-border);
        }
        .avatar img { width: 34px; height: 34px; border-radius: 50%; object-fit: cover; }
        .user-name { font-weight: 700; color: #f1f5f9; font-size: 13px; }
        .user-id { font-size: 10px; color: #334155; font-family: 'DM Mono', monospace; margin-top: 1px; }

        /* ── badge ── */
        .badge {
          display: inline-flex; align-items: center; gap: 4px;
          border-radius: 6px; padding: 3px 9px;
          font-size: 11px; font-weight: 700; white-space: nowrap;
        }
        .badge-verified { background: rgba(16,185,129,0.12); color: #34d399; border: 1px solid rgba(16,185,129,0.25); }
        .badge-pending  { background: rgba(245,158,11,0.10); color: #fbbf24; border: 1px solid rgba(245,158,11,0.25); }

        /* ── actions ── */
        .action-cell { display: flex; align-items: center; gap: 8px; }
        .btn-verify {
          display: flex; align-items: center; gap: 5px;
          background: rgba(16,185,129,0.1);
          border: 1px solid rgba(16,185,129,0.25);
          border-radius: 7px; padding: 6px 12px;
          color: #34d399; font-size: 12px; font-weight: 700;
          cursor: pointer; transition: all 0.2s; font-family: 'Syne', sans-serif;
          white-space: nowrap;
        }
        .btn-verify:hover:not(:disabled) { background: rgba(16,185,129,0.18); border-color: rgba(16,185,129,0.5); }
        .btn-verify:disabled { opacity: 0.45; cursor: not-allowed; }
        .btn-verify.done { background: rgba(16,185,129,0.06); color: #064e3b; cursor: default; border-color: transparent; }

        .btn-delete {
          display: flex; align-items: center; gap: 5px;
          background: rgba(239,68,68,0.08);
          border: 1px solid rgba(239,68,68,0.2);
          border-radius: 7px; padding: 6px 12px;
          color: #f87171; font-size: 12px; font-weight: 700;
          cursor: pointer; transition: all 0.2s; font-family: 'Syne', sans-serif;
          white-space: nowrap;
        }
        .btn-delete:hover:not(:disabled) { background: rgba(239,68,68,0.15); border-color: rgba(239,68,68,0.45); }
        .btn-delete:disabled { opacity: 0.45; cursor: not-allowed; }

        /* ── empty / loading state ── */
        .empty-state {
          padding: 60px 20px; text-align: center;
        }
        .empty-icon { font-size: 40px; margin-bottom: 12px; opacity: 0.4; }
        .empty-text { color: #334155; font-size: 14px; }

        .spin {
          display: inline-block;
          width: 14px; height: 14px;
          border: 2px solid currentColor;
          border-top-color: transparent;
          border-radius: 50%;
          animation: spin 0.7s linear infinite;
          vertical-align: middle;
        }
        @keyframes spin { to { transform: rotate(360deg); } }

        /* ── toast ── */
        .toast {
          position: fixed; bottom: 28px; right: 28px; z-index: 9999;
          display: flex; align-items: center; gap: 10px;
          padding: 13px 18px; border-radius: 12px;
          font-size: 14px; font-weight: 600;
          box-shadow: 0 8px 30px rgba(0,0,0,0.4);
          animation: slideUp 0.3s ease;
          max-width: 340px;
        }
        .toast-success { background: rgba(6,78,59,0.95); border: 1px solid rgba(16,185,129,0.4); color: #6ee7b7; }
        .toast-error   { background: rgba(127,29,29,0.95); border: 1px solid rgba(239,68,68,0.4); color: #fca5a5; }
        @keyframes slideUp { from { opacity:0; transform:translateY(14px); } to { opacity:1; transform:translateY(0); } }

        /* ── confirm modal ── */
        .overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.75); z-index: 5000; display: flex; align-items: center; justify-content: center; }
        .confirm-box {
          background: #0f172a;
          border: 1px solid rgba(239,68,68,0.25);
          border-radius: 16px; padding: 28px;
          width: 100%; max-width: 360px;
          box-shadow: 0 20px 50px rgba(0,0,0,0.7);
        }
        .confirm-box h5 { color: #f1f5f9; font-weight: 800; font-size: 17px; margin-bottom: 8px; }
        .confirm-box p  { color: #64748b; font-size: 13px; margin-bottom: 24px; line-height: 1.6; }
        .confirm-name   { color: #fca5a5; font-weight: 700; }
        .confirm-actions { display: flex; gap: 10px; }
        .btn-confirm-del {
          flex: 1; padding: 10px;
          background: linear-gradient(135deg, #dc2626, #ef4444);
          border: none; border-radius: 9px; color: #fff;
          font-weight: 700; font-size: 13px; cursor: pointer;
          font-family: 'Syne', sans-serif;
          transition: opacity 0.2s;
        }
        .btn-confirm-del:hover { opacity: 0.88; }
        .btn-confirm-cancel {
          flex: 1; padding: 10px;
          background: rgba(30,41,59,0.8);
          border: 1px solid rgba(99,179,237,0.15); border-radius: 9px;
          color: #94a3b8; font-weight: 700; font-size: 13px; cursor: pointer;
          font-family: 'Syne', sans-serif; transition: all 0.2s;
        }
        .btn-confirm-cancel:hover { border-color: rgba(99,179,237,0.35); color: #e2e8f0; }

        /* ── loading skeleton ── */
        .skeleton-row td { padding: 14px 16px; }
        .skel {
          height: 12px; border-radius: 6px;
          background: linear-gradient(90deg, rgba(30,41,59,0.6) 25%, rgba(51,65,85,0.4) 50%, rgba(30,41,59,0.6) 75%);
          background-size: 200% 100%;
          animation: shimmer 1.4s infinite;
        }
        @keyframes shimmer { to { background-position: -200% 0; } }

        /* ── back btn ── */
        .back-btn {
          display: inline-flex; align-items: center; gap: 7px;
          background: rgba(15,23,42,0.8);
          border: 1px solid rgba(99,179,237,0.18);
          border-radius: 9px; padding: 7px 14px;
          font-size: 13px; font-weight: 600; color: #64748b;
          cursor: pointer; transition: all 0.2s;
          font-family: 'Syne', sans-serif; margin-bottom: 24px;
        }
        .back-btn:hover { color: #e2e8f0; border-color: rgba(59,130,246,0.4); transform: translateX(-2px); }

        @media (max-width: 600px) {
          .dash-title { font-size: 22px; }
          .stat-row { grid-template-columns: repeat(2, 1fr); }
          .tab-btn { font-size: 12px; padding: 8px 10px; }
        }
      `}</style>

      <Navbar />

      <div className="dash-root">
        <div className="dash-inner">

          {/* Back */}
          <button className="back-btn" onClick={() => navigate(-1)}>
            <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" fill="currentColor" viewBox="0 0 16 16">
              <path fillRule="evenodd" d="M14.5 1.5a.5.5 0 0 1 .5.5v4.8a2.5 2.5 0 0 1-2.5 2.5H2.707l3.347 3.346a.5.5 0 0 1-.708.708l-4.2-4.2a.5.5 0 0 1 0-.708l4-4a.5.5 0 1 1 .708.708L2.707 8.3H12.5A1.5 1.5 0 0 0 14 6.8V2a.5.5 0 0 1 .5-.5" />
            </svg>
            Back
          </button>

          {/* Header */}
          <div className="dash-header">
            <div>
              <div className="dash-title">Admin <span>Dashboard</span></div>
              <div className="dash-subtitle">// user management &amp; verification panel</div>
            </div>
            <button className="dash-refresh" onClick={fetchUsers} disabled={loading}>
              {loading ? <span className="spin" /> : "↻"} Refresh
            </button>
          </div>

          {/* Stat cards */}
          <div className="stat-row">
            {[
              { label: "total users",    num: totalAll,            c: "#3b82f6", icon: "👥" },
              { label: "verified",       num: verifiedAll,         c: "#10b981", icon: "✅" },
              { label: "pending",        num: totalAll - verifiedAll, c: "#f59e0b", icon: "⏳" },
              ...Object.entries(data).map(([role, arr]) => ({
                label: ROLE_META[role].label.toLowerCase(),
                num: arr.length, c: ROLE_META[role].color,
                icon: ROLE_META[role].icon,
              })),
            ].map(({ label, num, c, icon }) => (
              <div key={label} className="stat-card" style={{ "--c": c }}>
                <div className="stat-icon">{icon}</div>
                <div className="stat-num">{num}</div>
                <div className="stat-label">{label}</div>
              </div>
            ))}
          </div>

          {/* Tabs */}
          <div className="tab-bar">
            {Object.entries(ROLE_META).map(([role, m]) => (
              <button
                key={role}
                className={`tab-btn${activeTab === role ? " active" : ""}`}
                style={{ "--tc": m.color, "--tc-bg": m.bg, "--tc-border": m.border }}
                onClick={() => { setActiveTab(role); setSearch(""); }}
              >
                {m.icon} {m.label}
                <span className="tab-count">{data[role].length}</span>
              </button>
            ))}
          </div>

          {/* Toolbar */}
          <div className="toolbar">
            <div className="search-wrap">
              <span className="search-icon">🔍</span>
              <input
                placeholder={`Search ${meta.label.toLowerCase()} by name, email or phone…`}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <div className="result-count">{filtered.length} result{filtered.length !== 1 ? "s" : ""}</div>
          </div>

          {/* Table */}
          <div className="table-wrap">
            <div className="table-scroll">
              <table>
                <thead>
                  <tr>
                    <th>#</th>
                    <th>User</th>
                    {COLS[activeTab].slice(1).map((col) => (
                      <th key={col}>{COL_LABELS[col] || col}</th>
                    ))}
                    <th>Joined</th>
                    <th>Status</th>
                    {/* <th>Actions</th> */}
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    Array.from({ length: 5 }).map((_, i) => (
                      <tr key={i} className="skeleton-row">
                        {Array.from({ length: COLS[activeTab].length + 3 }).map((__, j) => (
                          <td key={j}><div className="skel" style={{ width: j === 0 ? 20 : j === 1 ? 120 : 80 }} /></td>
                        ))}
                      </tr>
                    ))
                  ) : filtered.length === 0 ? (
                    <tr>
                      <td colSpan={COLS[activeTab].length + 4}>
                        <div className="empty-state">
                          <div className="empty-icon">{search ? "🔍" : meta.icon}</div>
                          <div className="empty-text">
                            {search ? `No results for "${search}"` : `No ${meta.label.toLowerCase()} registered yet`}
                          </div>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    filtered.map((user, idx) => {
                      const avColor = meta.color;
                      const isVerifying = actionLoading === `${activeTab}-${user._id}-verify`;
                      const isDeleting  = actionLoading === `${activeTab}-${user._id}-delete`;
                      const photoUrl = user.photo?.path
                        ? `http://localhost:8080/${user.photo.path}`
                        : null;

                      return (
                        <tr 
                          key={user._id}
                                onClick={() => {
                                  console.log("USER DATA", user);
                                  setSelectedUser(user);
                                }}
                              >
                          {/* # */}
                          <td style={{ color: "#334155", fontFamily: "'DM Mono',monospace", fontSize: 12 }}>
                            {idx + 1}
                          </td>

                          {/* Name + avatar */}
                          <td>
                            <div className="user-cell">
                              <div
                                className="avatar"
                                style={{
                                  "--av-bg":     `${avColor}18`,
                                  "--av-c":      avColor,
                                  "--av-border": `${avColor}40`,
                                }}
                              >
                                {photoUrl
                                  ? <img src={photoUrl} alt={user.fullName} onError={(e) => { e.target.style.display = "none"; }} />
                                  : initials(user.fullName)}
                              </div>
                              <div>
                                <div className="user-name">{fmt(user.fullName)}</div>
                                <div className="user-id">{user._id?.slice(-8)}</div>
                              </div>
                            </div>
                          </td>

                          {/* Dynamic columns (skip fullName) */}
                          {COLS[activeTab].slice(1).map((col) => (
                            <td key={col} style={{ maxWidth: 180, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                              {fmt(user[col])}
                            </td>
                          ))}

                          {/* Joined */}
                          <td style={{ fontFamily: "'DM Mono',monospace", fontSize: 12, color: "#475569" }}>
                            {fmtDate(user.createdAt)}
                          </td>

                          {/* Status */}
                          <td>
                            {user.isVerified
                              ? <span className="badge badge-verified">✓ Verified</span>
                              : <span className="badge badge-pending">⏳ Pending</span>}
                          </td>

                          {/* Actions
                          <td>
                            <div className="action-cell">
                              {user.isVerified ? (
                                <button className="btn-verify done" disabled>✓ Done</button>
                              ) : (
                                <button
                                  className="btn-verify"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleVerify(activeTab, user._id);
                                  }}
                                >
                                  {isVerifying ? <span className="spin" /> : "✓"} Verify
                                </button>
                              )}
                              <button
                                className="btn-delete"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setConfirmDelete({ role: activeTab, id: user._id, name: user.fullName });
                                  }}
                                disabled={!!actionLoading}
                              >
                                {isDeleting ? <span className="spin" /> : "✕"} Delete
                              </button>
                            </div>
                          </td> */}
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>

        </div>
      </div>

      {/* Delete Confirm Modal */}
      {confirmDelete && (
        <div className="overlay" onClick={(e) => { if (e.target === e.currentTarget) setConfirmDelete(null); }}>
          <div className="confirm-box">
            <h5>Delete User?</h5>
            <p>
              You're about to permanently delete{" "}
              <span className="confirm-name">{confirmDelete.name}</span>.
              This action cannot be undone and will also remove all uploaded files.
            </p>
            <div className="confirm-actions">
              <button className="btn-confirm-del" onClick={handleDelete}>Delete Permanently</button>
              <button className="btn-confirm-cancel" onClick={() => setConfirmDelete(null)}>Cancel</button>
            </div>
          </div>
        </div>
      )}

      
{selectedUser && (
  <div
    className="overlay"
    onClick={(e) => {
      if (e.target === e.currentTarget) setSelectedUser(null);
    }}
  >
    <div className="confirm-box" style={{ maxWidth: "520px" }}>
      <h5>User Details</h5>

      {/* ✅ PHOTO */}
      {selectedUser.photo && (
        <div style={{ textAlign: "center", marginBottom: "10px" }}>
          <img
            src={`http://localhost:8080/uploads/photos/${encodeURIComponent(
              selectedUser.photo?.filename || selectedUser.photo
            )}`}
            alt="User"
            style={{
              width: "100px",
              height: "100px",
              borderRadius: "50%",
              objectFit: "cover",
              border: "2px solid #1976d2",
            }}
          />
        </div>
      )}

      <p><b>Name:</b> {selectedUser.fullName}</p>
      <p><b>Email:</b> {selectedUser.email}</p>
      <p><b>Phone:</b> {selectedUser.phone}</p>

      {selectedUser.specialty && <p><b>Specialty:</b> {selectedUser.specialty}</p>}
      {selectedUser.department && <p><b>Department:</b> {selectedUser.department}</p>}
      {selectedUser.shiftTiming && <p><b>Shift:</b> {selectedUser.shiftTiming}</p>}
      {selectedUser.bloodGroup && <p><b>Blood Group:</b> {selectedUser.bloodGroup}</p>}
      {selectedUser.gender && <p><b>Gender:</b> {selectedUser.gender}</p>}

      <p><b>Joined:</b> {fmtDate(selectedUser.createdAt)}</p>

      {/* ✅ DOCUMENTS */}
      {selectedUser.documents && selectedUser.documents.length > 0 && (
        <div style={{ marginTop: "15px" }}>
          <b>Documents:</b>

          {selectedUser.documents.map((doc, index) => {
            const fileName =
              typeof doc === "string"
                ? doc
                : doc.filename || doc.name;

            return (
              <div key={index} style={{ marginTop: "5px" }}>
                <a
                  href={`http://localhost:8080/uploads/documents/${encodeURIComponent(fileName)}`}
                  target="_blank"
                  rel="noreferrer"
                  style={{ color: "#1976d2", textDecoration: "underline" }}
                >
                  View Document {index + 1}
                </a>
              </div>
            );
          })}
        </div>
      )}

      {/* 🔥 ACTION BUTTONS (THIS WAS MISSING) */}
      <div style={{ marginTop: "20px", display: "flex", gap: "10px" }}>

        {/* ✅ VERIFY */}
        {selectedUser.isVerified ? (
          <button className="btn-verify done" disabled>
            ✓ Accepted
          </button>
        ) : (
          <button
            className="btn-verify"
            onClick={() => {
              handleVerify(activeTab, selectedUser._id);
              setSelectedUser(null);
            }}
          >
            ✓ Accept
          </button>
        )}

  {/* ❌ REJECT (only when NOT verified) */}
  {!selectedUser.isVerified && (
    <button
      className="btn-delete"
      onClick={() => {
        handleReject(activeTab, selectedUser._id);
        setSelectedUser(null);
      }}
    >
      ✕ Reject
    </button>
  )}

        {/* ❌ DELETE */}
        <button
          className="btn-delete"
          onClick={() => {
            setConfirmDelete({
              role: activeTab,
              id: selectedUser._id,
              name: selectedUser.fullName,
            });
            setSelectedUser(null);
          }}
        >
          ✕ Delete
        </button>

        {/* CLOSE */}
        <button
          className="btn-confirm-cancel"
          onClick={() => setSelectedUser(null)}
        >
          Close
        </button>
      </div>

    </div>
  </div>
)}
      {/* Toast */}
      {toast && (
        <div className={`toast toast-${toast.type}`}>
          {toast.type === "success" ? "✓" : "⚠"} {toast.msg}
        </div>
      )}
    </>
  );
}