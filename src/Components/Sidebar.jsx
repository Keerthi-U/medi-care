import { useState } from "react";
import { useAppointments } from "../context/AppointmentContext";
import "./Sidebar.css";

const navItems = [
  { id: "overview",     icon: "📊", label: "Overview" },
  { id: "patients",     icon: "👤", label: "Patients" },
  { id: "wards",        icon: "🛏️",  label: "Wards" },
  { id: "doctors",      icon: "🩺", label: "Doctors" },
  { id: "lab",          icon: "🧪", label: "Lab Results" },
  { id: "appointments", icon: "📅", label: "Appointments" },
  { id: "reports",      icon: "📋", label: "Reports" },
  { id: "settings",     icon: "⚙️",  label: "Settings" },
];

export default function Sidebar({ active, onNavigate, user, onLogout, onViewPatientSite }) {
  const [hovered, setHovered] = useState(null);
  const { unreadCount } = useAppointments();

  return (
    <aside className="sidebar">

      {/* Logo */}
      <div className="sidebar-logo">
        <span className="sidebar-logo-icon">🏥</span>
        <div>
          <div className="sidebar-logo-title">MedCore</div>
          <div className="sidebar-logo-sub">Hospital System</div>
        </div>
      </div>

      <div className="sidebar-divider" />
      <div className="sidebar-nav-label">Main Menu</div>

      {/* Nav */}
      <nav className="sidebar-nav">
        {navItems.map((item) => (
          <button
            key={item.id}
            onClick={() => onNavigate(item.id)}
            onMouseEnter={() => setHovered(item.id)}
            onMouseLeave={() => setHovered(null)}
            className={`sidebar-nav-item
              ${active  === item.id ? "active"  : ""}
              ${hovered === item.id && active !== item.id ? "hovered" : ""}
            `}
          >
            <span className="sidebar-nav-icon">{item.icon}</span>
            <span className="sidebar-nav-text">{item.label}</span>
            {item.id === "appointments" && unreadCount > 0 && (
              <span className="sidebar-badge">{unreadCount}</span>
            )}
          </button>
        ))}
      </nav>

      <div className="sidebar-spacer" />
      <div className="sidebar-divider" />

      {/* Patient Website button */}
      <button className="sidebar-patient-btn" onClick={onViewPatientSite}>
        <span>🌐</span>
        <span>Patient Website</span>
      </button>

      {/* Logout button */}
      <button className="sidebar-logout-btn" onClick={onLogout}>
        <span>🚪</span>
        <span>Logout</span>
      </button>

      {/* Doctor Profile Footer */}
      <div className="sidebar-footer">
        <div className="sidebar-avatar">{user?.initials || "AS"}</div>
        <div className="sidebar-footer-info">
          <div className="sidebar-footer-name">{user?.name || "Dr. Anitha Sharma"}</div>
          <div className="sidebar-footer-role">{user?.role || "Chief Medical Officer"}</div>
          <div className="sidebar-online">
            <span className="sidebar-online-dot" />
            Online
          </div>
        </div>
      </div>

    </aside>
  );
}
