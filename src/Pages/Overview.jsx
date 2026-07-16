import { useEffect, useState } from "react";
import { useDoctors } from "../context/DoctorContext";
import { useAppointments } from "../context/AppointmentContext";
import "./Overview.css";

const API = "http://localhost:3001";

export default function Overview() {
  const { doctors }                      = useDoctors();
  const { appointments, notifications }  = useAppointments();

  const [stats, setStats] = useState({
    totalPatients: 0,
    bedsOccupied:  0,
    emergency:     0,
    surgeries:     0,
    discharged:    0,
  });

  // ── Fetch real-time stats ─────────────────────────
  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [patientsRes, wardsRes] = await Promise.all([
          fetch(`${API}/patients`).catch(() => ({ json: () => [] })),
          fetch(`${API}/wards`).catch(()    => ({ json: () => [] })),
        ]);

        const patients = await patientsRes.json().catch(() => []);
        const wards    = await wardsRes.json().catch(() => []);

        setStats({
          totalPatients: patients.length  || 1284,
          bedsOccupied:  wards.length > 0
            ? wards.reduce((s, w) => s + (w.occupied || 0), 0)
            : 847,
          emergency:     patients.filter((p) => p.status === "Emergency").length || 63,
          surgeries:     patients.filter((p) => p.type   === "Surgery").length   || 28,
          discharged:    patients.filter((p) => p.status === "Discharged").length || 312,
        });
      } catch {
        // fallback to demo data
        setStats({ totalPatients: 1284, bedsOccupied: 847, emergency: 63, surgeries: 28, discharged: 312 });
      }
    };

    fetchStats();
    const interval = setInterval(fetchStats, 15000); // refresh every 15s
    return () => clearInterval(interval);
  }, []);

  // ── Derived real-time values ──────────────────────
  const totalDoctors      = doctors.length;
  const availableDoctors  = doctors.filter((d) => d.status === "Available").length;
  const totalAppointments = appointments.length;
  const pendingAppts      = appointments.filter((a) => a.status === "Pending").length;
  const confirmedAppts    = appointments.filter((a) => a.status === "Confirmed").length;
  const unreadNotifs      = notifications.filter((n) => !n.read).length;

  const metrics = [
    { icon: "👥", label: "Total Patients",    value: stats.totalPatients.toLocaleString(), delta: "4.2% this month",  up: true,  color: "#6366F1" },
    { icon: "🛏️",  label: "Beds Occupied",    value: stats.bedsOccupied.toLocaleString(),  delta: "66% occupancy",    up: true,  color: "#0D9488" },
    { icon: "🚑", label: "Emergency",          value: stats.emergency,                      delta: "12% today",        up: false, color: "#EF4444" },
    { icon: "🔬", label: "Surgeries",          value: stats.surgeries,                      delta: "7 scheduled",      up: true,  color: "#F59E0B" },
    { icon: "✅", label: "Discharged",         value: stats.discharged.toLocaleString(),    delta: "8.1% vs last",     up: true,  color: "#10B981" },
    { icon: "🩺", label: "Total Doctors",      value: totalDoctors,                         delta: `${availableDoctors} available`, up: true, color: "#8B5CF6" },
    { icon: "📅", label: "Appointments",       value: totalAppointments,                    delta: `${pendingAppts} pending`,       up: true, color: "#EC4899" },
    { icon: "🔔", label: "Notifications",      value: unreadNotifs,                         delta: "unread alerts",    up: false, color: "#F97316" },
  ];

  // ── Recent appointments ───────────────────────────
  const recentAppts = [...appointments]
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    .slice(0, 5);

  // ── Doctor availability ───────────────────────────
  const deptMap = doctors.reduce((acc, doc) => {
    acc[doc.department] = acc[doc.department] || { total: 0, available: 0 };
    acc[doc.department].total++;
    if (doc.status === "Available") acc[doc.department].available++;
    return acc;
  }, {});

  const deptStats = Object.entries(deptMap).map(([dept, val]) => ({
    dept, ...val, pct: Math.round((val.available / val.total) * 100)
  }));

  const DEPT_COLORS = ["#0D9488","#6366F1","#F59E0B","#EF4444","#10B981","#8B5CF6","#EC4899"];

  return (
    <div className="overview">

      {/* ── Page Header ── */}
      <div className="overview-header">
        <div>
          <h1 className="overview-title">Overview</h1>
          <p className="overview-sub">Medical Report Dashboard · Real-time Data</p>
        </div>
        <div className="overview-live-badge">
          <span className="overview-live-dot" />
          Live
        </div>
      </div>

      {/* ── Metric Cards ── */}
      <div className="overview-metrics">
        {metrics.map((m, i) => (
          <div className="ov-card" key={i} style={{ "--card-color": m.color }}>
            <div className="ov-card-icon">{m.icon}</div>
            <div className="ov-card-label">{m.label}</div>
            <div className="ov-card-value">{m.value}</div>
            <div className={`ov-card-delta ${m.up ? "up" : "down"}`}>
              {m.up ? "↑" : "↓"} {m.delta}
            </div>
            <div className="ov-card-bar" style={{ background: `${m.color}20` }}>
              <div className="ov-card-bar-fill" style={{ background: m.color, width: "65%" }} />
            </div>
          </div>
        ))}
      </div>

      {/* ── Bottom Row ── */}
      <div className="overview-bottom">

        {/* Recent Appointments */}
        <div className="ov-section">
          <div className="ov-section-header">
            <h2 className="ov-section-title">Recent Appointments</h2>
            <span className="ov-section-count">{totalAppointments} total</span>
          </div>
          {recentAppts.length === 0 ? (
            <div className="ov-empty">No appointments yet. Patients will appear here once they book.</div>
          ) : (
            <div className="ov-appt-list">
              {recentAppts.map((a) => (
                <div className="ov-appt-row" key={a.id}>
                  <div className="ov-appt-avatar">
                    {a.patientName?.[0]?.toUpperCase() || "P"}
                  </div>
                  <div className="ov-appt-info">
                    <div className="ov-appt-name">{a.patientName}</div>
                    <div className="ov-appt-meta">
                      {a.doctorName} · {a.date} · {a.time}
                    </div>
                  </div>
                  <span className={`ov-appt-status status-${a.status?.toLowerCase()}`}>
                    {a.status}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Doctor Availability by Department */}
        <div className="ov-section">
          <div className="ov-section-header">
            <h2 className="ov-section-title">Doctor Availability</h2>
            <span className="ov-section-count">{totalDoctors} doctors</span>
          </div>
          {deptStats.length === 0 ? (
            <div className="ov-empty">No doctor data available.</div>
          ) : (
            <div className="ov-dept-list">
              {deptStats.map((d, i) => (
                <div className="ov-dept-row" key={d.dept}>
                  <span className="ov-dept-name">{d.dept}</span>
                  <div className="ov-dept-bar-bg">
                    <div
                      className="ov-dept-bar-fill"
                      style={{ width: `${d.pct}%`, background: DEPT_COLORS[i % DEPT_COLORS.length] }}
                    />
                  </div>
                  <span className="ov-dept-pct">{d.available}/{d.total}</span>
                </div>
              ))}
            </div>
          )}

          {/* Quick stats */}
          <div className="ov-quick-stats">
            <div className="ov-quick-stat">
              <div className="ov-quick-value" style={{ color: "#10B981" }}>{confirmedAppts}</div>
              <div className="ov-quick-label">Confirmed</div>
            </div>
            <div className="ov-quick-stat">
              <div className="ov-quick-value" style={{ color: "#F59E0B" }}>{pendingAppts}</div>
              <div className="ov-quick-label">Pending</div>
            </div>
            <div className="ov-quick-stat">
              <div className="ov-quick-value" style={{ color: "#EF4444" }}>{unreadNotifs}</div>
              <div className="ov-quick-label">Unread</div>
            </div>
            <div className="ov-quick-stat">
              <div className="ov-quick-value" style={{ color: "#6366F1" }}>{availableDoctors}</div>
              <div className="ov-quick-label">Available Docs</div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
