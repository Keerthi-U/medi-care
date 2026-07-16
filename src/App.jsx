import { Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "./context/AuthContext";
import { useAppointments } from "./context/AppointmentContext";
import { useState } from "react";

import Sidebar    from "./Components/Sidebar";
import TopBar     from "./Components/TopBar";

import Login          from "./Pages/Login";
import DoctorLogin    from "./Pages/DoctorLogin";
import DoctorPortal   from "./Pages/DoctorPortal";
import PatientWebsite from "./Pages/PatientWebsite";

import Overview  from "./Pages/Overview";
import Doctors   from "./Pages/Doctors";
import Patients  from "./Pages/Patients";
import Wards     from "./Pages/Wards";

import "./App.css";

// ── Protected route for Admin ─────────────────────────
function AdminRoute({ children }) {
  const { user } = useAuth();
  if (!user || user.type !== "admin") return <Navigate to="/admin/login" replace />;
  return children;
}

// ── Protected route for Doctor ────────────────────────
function DoctorRoute({ children }) {
  const { user } = useAuth();
  if (!user || user.type !== "doctor") return <Navigate to="/doctor/login" replace />;
  return children;
}

// ── Admin Layout (Sidebar + TopBar + page) ────────────
function AdminLayout({ activePage, setActivePage }) {
  const { user, logout }  = useAuth();
  const { newNotif }      = useAppointments();

  return (
    <div className="app-wrapper">
      <Sidebar
        active={activePage}
        onNavigate={setActivePage}
        user={user}
        onLogout={logout}
        onViewPatientSite={() => window.open("/", "_blank")}
      />
      <div className="app-content">
        <TopBar
          activePage={activePage}
          onViewPatientSite={() => window.open("/", "_blank")}
        />
        <main className="app-main">
          {activePage === "overview"  && <Overview />}
          {activePage === "doctors"   && <Doctors />}
          {activePage === "patients"  && <Patients />}
          {activePage === "wards"     && <Wards />}
        </main>
      </div>

      {newNotif && (
        <div className="new-notif-toast">
          <span className="new-notif-icon">🔔</span>
          <div>
            <div className="new-notif-title">New Appointment Booked!</div>
            <div className="new-notif-msg">{newNotif.message}</div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function App() {
  const [activePage, setActivePage] = useState("overview");

  return (
    <Routes>

      {/* ── Patient Website (public) ── */}
      <Route path="/" element={<PatientWebsite />} />

      {/* ── Admin ── */}
      <Route path="/admin/login" element={<AdminLoginRedirect />} />
      <Route
        path="/admin/*"
        element={
          <AdminRoute>
            <AdminLayout activePage={activePage} setActivePage={setActivePage} />
          </AdminRoute>
        }
      />

      {/* ── Doctor ── */}
      <Route path="/doctor/login" element={<DoctorLoginRedirect />} />
      <Route
        path="/doctor/*"
        element={
          <DoctorRoute>
            <DoctorPortalWrapper />
          </DoctorRoute>
        }
      />

      {/* ── Fallback ── */}
      <Route path="*" element={<Navigate to="/" replace />} />

    </Routes>
  );
}

// ── Admin Login — redirect if already logged in ───────
function AdminLoginRedirect() {
  const { user, logout } = useAuth();
  if (user?.type === "admin") return <Navigate to="/admin" replace />;
  return <Login onSwitchToDoctor={() => { logout(); window.location.href = "/doctor/login"; }} />;
}

// ── Doctor Login — redirect if already logged in ──────
function DoctorLoginRedirect() {
  const { user, logout } = useAuth();
  if (user?.type === "doctor") return <Navigate to="/doctor" replace />;
  return <DoctorLogin onSwitchToAdmin={() => { logout(); window.location.href = "/admin/login"; }} />;
}

// ── Doctor Portal wrapper with logout ─────────────────
function DoctorPortalWrapper() {
  const { logout } = useAuth();
  return <DoctorPortal onLogout={() => { logout(); window.location.href = "/doctor/login"; }} />;
}
