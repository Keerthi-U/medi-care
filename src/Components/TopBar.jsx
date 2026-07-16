import { useState } from "react";
import { useAppointments } from "../context/AppointmentContext";
import { useAuth } from "../context/AuthContext";
import "./TopBar.css";

export default function TopBar({ activePage, onViewPatientSite }) {
  const { unreadCount, notifications, markNotifRead, markAllRead } = useAppointments();
  const { user } = useAuth();
  const [showNotif, setShowNotif] = useState(false);

  const pageLabels = {
    overview: "Overview", patients: "Patients", wards: "Wards",
    doctors: "Doctors", lab: "Lab Results", appointments: "Appointments",
    reports: "Reports", settings: "Settings",
  };

  const sorted = [...notifications].sort((a, b) =>
    new Date(b.createdAt) - new Date(a.createdAt)
  );

  return (
    <div className="topbar">
      {/* Left */}
      <div className="topbar-left">
        <h1 className="topbar-title">{pageLabels[activePage] || "Dashboard"}</h1>
        <p className="topbar-sub">
          {new Date().toLocaleDateString("en-IN", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}
        </p>
      </div>

      {/* Right */}
      <div className="topbar-right">

        {/* Patient site btn */}
        <button className="topbar-patient-btn" onClick={onViewPatientSite}>
          🌐 Patient Site
        </button>

        {/* Notification Bell */}
        <div className="notif-wrap">
          <button
            className="notif-bell-btn"
            onClick={() => setShowNotif(!showNotif)}
          >
            🔔
            {unreadCount > 0 && (
              <span className="notif-count">{unreadCount}</span>
            )}
          </button>

          {showNotif && (
            <div className="notif-dropdown">
              <div className="notif-header">
                <span className="notif-header-title">Notifications</span>
                {unreadCount > 0 && (
                  <button className="notif-mark-all" onClick={markAllRead}>
                    Mark all read
                  </button>
                )}
              </div>

              <div className="notif-list">
                {sorted.length === 0 ? (
                  <div className="notif-empty">No notifications yet</div>
                ) : (
                  sorted.map((n) => (
                    <div
                      key={n.id}
                      className={`notif-item ${!n.read ? "unread" : ""}`}
                      onClick={() => markNotifRead(n.id)}
                    >
                      <div className="notif-item-icon">
                        {n.read ? "📋" : "🔔"}
                      </div>
                      <div className="notif-item-body">
                        <div className="notif-item-msg">{n.message}</div>
                        <div className="notif-item-meta">
                          For {n.doctorName} · {new Date(n.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                        </div>
                      </div>
                      {!n.read && <span className="notif-dot" />}
                    </div>
                  ))
                )}
              </div>

              {sorted.length > 0 && (
                <div className="notif-footer">
                  {sorted.length} total notification{sorted.length > 1 ? "s" : ""}
                </div>
              )}
            </div>
          )}
        </div>

        {/* User avatar */}
        <div className="topbar-avatar">
          {user?.initials || "AS"}
        </div>
      </div>

      {/* Click outside to close */}
      {showNotif && (
        <div className="notif-backdrop" onClick={() => setShowNotif(false)} />
      )}
    </div>
  );
}
