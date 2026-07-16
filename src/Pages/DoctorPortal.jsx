import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useAppointments } from "../context/AppointmentContext";
import "./DoctorPortal.css";

const STATUS_COLORS = {
  Pending:   { bg: "#FEF9C3", color: "#854D0E" },
  Confirmed: { bg: "#DCFCE7", color: "#15803D" },
  Rejected:  { bg: "#FEE2E2", color: "#B91C1C" },
  Completed: { bg: "#E0E7FF", color: "#3730A3" },
};

export default function DoctorPortal({ onLogout }) {
  const { user } = useAuth();
  const { appointments, notifications, unreadCount, markNotifRead, markAllRead, updateAppointmentStatus } = useAppointments();
  const [activeTab, setActiveTab] = useState("appointments");

  // Filter only this doctor's data
  const myAppointments  = appointments.filter((a) => a.doctorId === user?.id);
  const myNotifications = notifications.filter((n) => n.doctorId === user?.id);
  const myUnread        = myNotifications.filter((n) => !n.read).length;

  const pending   = myAppointments.filter((a) => a.status === "Pending");
  const confirmed = myAppointments.filter((a) => a.status === "Confirmed");
  const rejected  = myAppointments.filter((a) => a.status === "Rejected");

  return (
    <div className="dp-root">

      {/* Sidebar */}
      <aside className="dp-sidebar">
        <div className="dp-brand">
          <span style={{ fontSize: 26 }}>🏥</span>
          <div>
            <div className="dp-brand-name">MedCore</div>
            <div className="dp-brand-sub">Doctor Portal</div>
          </div>
        </div>

        <div className="dp-divider" />

        {/* Doctor profile */}
        <div className="dp-profile">
          <div className="dp-profile-avatar">
            {user?.profileImage
              ? <img src={user.profileImage} alt={user.name} className="dp-profile-img" />
              : <span>{user?.initials}</span>
            }
          </div>
          <div className="dp-profile-info">
            <div className="dp-profile-name">{user?.name}</div>
            <div className="dp-profile-role">{user?.role}</div>
            <div className="dp-profile-dept">{user?.department}</div>
          </div>
        </div>

        <div className="dp-divider" />
        <div className="dp-nav-label">Navigation</div>

        {/* Nav */}
        <nav className="dp-nav">
          {[
            { id: "appointments", icon: "📅", label: "My Appointments", count: myAppointments.length },
            { id: "notifications", icon: "🔔", label: "Notifications", count: myUnread },
            { id: "profile", icon: "👤", label: "My Profile" },
          ].map((item) => (
            <button
              key={item.id}
              className={`dp-nav-item ${activeTab === item.id ? "active" : ""}`}
              onClick={() => setActiveTab(item.id)}
            >
              <span className="dp-nav-icon">{item.icon}</span>
              <span className="dp-nav-text">{item.label}</span>
              {item.count > 0 && (
                <span className={`dp-nav-badge ${item.id === "notifications" ? "red" : ""}`}>
                  {item.count}
                </span>
              )}
            </button>
          ))}
        </nav>

        <div style={{ flex: 1 }} />
        <div className="dp-divider" />
        <button className="dp-logout-btn" onClick={onLogout}>🚪 Logout</button>
      </aside>

      {/* Main */}
      <main className="dp-main">

        {/* ── Appointments Tab ── */}
        {activeTab === "appointments" && (
          <div className="dp-content">
            <div className="dp-page-header">
              <h1 className="dp-page-title">My Appointments</h1>
              <p className="dp-page-sub">Manage your patient appointments</p>
            </div>

            {/* Summary cards */}
            <div className="dp-summary-cards">
              {[
                { label: "Total",     value: myAppointments.length, icon: "📋", color: "#6366F1" },
                { label: "Pending",   value: pending.length,        icon: "⏳", color: "#F59E0B" },
                { label: "Confirmed", value: confirmed.length,      icon: "✅", color: "#10B981" },
                { label: "Rejected",  value: rejected.length,       icon: "❌", color: "#EF4444" },
              ].map((s, i) => (
                <div className="dp-summary-card" key={i}>
                  <div className="dp-summary-icon" style={{ background: `${s.color}20`, color: s.color }}>
                    {s.icon}
                  </div>
                  <div>
                    <div className="dp-summary-value">{s.value}</div>
                    <div className="dp-summary-label">{s.label}</div>
                  </div>
                </div>
              ))}
            </div>

            {/* Appointments list */}
            {myAppointments.length === 0 ? (
              <div className="dp-empty">
                <div style={{ fontSize: 48 }}>📭</div>
                <div>No appointments yet.</div>
              </div>
            ) : (
              <div className="dp-appt-list">
                {myAppointments.map((appt) => (
                  <div className="dp-appt-card" key={appt.id}>
                    <div className="dp-appt-left">
                      <div className="dp-appt-avatar">
                        {appt.patientName?.[0]?.toUpperCase() || "P"}
                      </div>
                      <div className="dp-appt-info">
                        <div className="dp-appt-name">{appt.patientName}</div>
                        <div className="dp-appt-meta">
                          📅 {appt.date} · ⏰ {appt.time} · 🧬 {appt.reason}
                        </div>
                        <div className="dp-appt-contact">
                          ✉️ {appt.patientEmail} · 📞 {appt.patientPhone}
                        </div>
                      </div>
                    </div>
                    <div className="dp-appt-right">
                      <span
                        className="dp-appt-status"
                        style={{
                          background: STATUS_COLORS[appt.status]?.bg,
                          color:      STATUS_COLORS[appt.status]?.color,
                        }}
                      >
                        {appt.status}
                      </span>
                      <div className="dp-appt-fee">${appt.fee}</div>
                      {appt.status === "Pending" && (
                        <div className="dp-appt-actions">
                          <button
                            className="dp-btn-confirm"
                            onClick={() => updateAppointmentStatus(appt.id, "Confirmed")}
                          >
                            ✅ Accept
                          </button>
                          <button
                            className="dp-btn-reject"
                            onClick={() => updateAppointmentStatus(appt.id, "Rejected")}
                          >
                            ❌ Reject
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ── Notifications Tab ── */}
        {activeTab === "notifications" && (
          <div className="dp-content">
            <div className="dp-page-header">
              <h1 className="dp-page-title">Notifications</h1>
              <p className="dp-page-sub">{myUnread} unread notification{myUnread !== 1 ? "s" : ""}</p>
            </div>
            {myUnread > 0 && (
              <button className="dp-mark-all-btn" onClick={markAllRead}>
                ✓ Mark all as read
              </button>
            )}
            {myNotifications.length === 0 ? (
              <div className="dp-empty">
                <div style={{ fontSize: 48 }}>🔕</div>
                <div>No notifications yet.</div>
              </div>
            ) : (
              <div className="dp-notif-list">
                {[...myNotifications].reverse().map((n) => (
                  <div
                    key={n.id}
                    className={`dp-notif-item ${!n.read ? "unread" : ""}`}
                    onClick={() => markNotifRead(n.id)}
                  >
                    <div className="dp-notif-icon">{n.read ? "📋" : "🔔"}</div>
                    <div className="dp-notif-body">
                      <div className="dp-notif-msg">{n.message}</div>
                      <div className="dp-notif-time">
                        {new Date(n.createdAt).toLocaleString()}
                      </div>
                    </div>
                    {!n.read && <span className="dp-notif-dot" />}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ── Profile Tab ── */}
        {activeTab === "profile" && (
          <div className="dp-content">
            <div className="dp-page-header">
              <h1 className="dp-page-title">My Profile</h1>
              <p className="dp-page-sub">Your doctor profile details</p>
            </div>
            <div className="dp-profile-card">
              <div className="dp-profile-card-top">
                <div className="dp-profile-card-avatar">
                  {user?.profileImage
                    ? <img src={user.profileImage} alt={user.name} />
                    : <span>{user?.initials}</span>
                  }
                </div>
                <div>
                  <div className="dp-profile-card-name">{user?.name}</div>
                  <div className="dp-profile-card-role">{user?.role}</div>
                  <div className="dp-profile-card-dept">{user?.department}</div>
                </div>
              </div>
              <div className="dp-profile-fields">
                <div className="dp-profile-field">
                  <span>✉️ Email</span>
                  <strong>{user?.email}</strong>
                </div>
                <div className="dp-profile-field">
                  <span>🏥 Department</span>
                  <strong>{user?.department}</strong>
                </div>
                <div className="dp-profile-field">
                  <span>📋 Total Appointments</span>
                  <strong>{myAppointments.length}</strong>
                </div>
                <div className="dp-profile-field">
                  <span>✅ Confirmed</span>
                  <strong>{confirmed.length}</strong>
                </div>
              </div>
            </div>
          </div>
        )}

      </main>
    </div>
  );
}

