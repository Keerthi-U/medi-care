import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import "./DoctorLogin.css";

export default function DoctorLogin({ onSwitchToAdmin }) {
  const { loginDoctor, loading, error } = useAuth();
  const [form,       setForm]       = useState({ email: "", password: "" });
  const [showPass,   setShowPass]   = useState(false);
  const [fErrors,    setFErrors]    = useState({});

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((p) => ({ ...p, [name]: value }));
    setFErrors((p) => ({ ...p, [name]: "" }));
  };

  const validate = () => {
    const errs = {};
    if (!form.email.trim())    errs.email    = "Email is required.";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) errs.email = "Invalid email.";
    if (!form.password.trim()) errs.password = "License number is required.";
    setFErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    await loginDoctor(form.email, form.password);
  };

  return (
    <div className="dlogin-page">

      {/* Left Panel */}
      <div className="dlogin-left">
        <div className="dlogin-left-overlay" />
        <div className="dlogin-brand">
          <span style={{ fontSize: 32 }}>🏥</span>
          <div>
            <div className="dlogin-brand-name">MedCore</div>
            <div className="dlogin-brand-sub">Doctor Portal</div>
          </div>
        </div>

        <div className="dlogin-center">
          <div className="dlogin-illustration">
            <div className="dlogin-circle c1" />
            <div className="dlogin-circle c2" />
            <div className="dlogin-circle c3" />
            <span className="dlogin-emoji">👨‍⚕️</span>
          </div>
          <h2 className="dlogin-left-title">Doctor Dashboard</h2>
          <p className="dlogin-left-desc">
            View your appointments, patient details, and notifications — all in one place.
          </p>
          <div className="dlogin-features">
            {["📅 View your appointments", "🔔 Get patient notifications", "✅ Accept or reject bookings", "📋 Track your schedule"].map((f, i) => (
              <div className="dlogin-feature" key={i}>{f}</div>
            ))}
          </div>
        </div>
      </div>

      {/* Right Panel */}
      <div className="dlogin-right">
        <div className="dlogin-form-wrap">
          <div className="dlogin-form-icon">🩺</div>
          <h1 className="dlogin-form-title">Doctor Login</h1>
          <p className="dlogin-form-sub">Sign in with your hospital email and medical license number</p>

          {error && <div className="dlogin-error">⚠️ {error}</div>}

          <form onSubmit={handleSubmit} noValidate className="dlogin-form">
            <div className="dlogin-field">
              <label>Hospital Email</label>
              <div className={`dlogin-input-wrap ${fErrors.email ? "has-error" : ""}`}>
                <span>✉️</span>
                <input name="email" type="email" value={form.email} onChange={handleChange} placeholder="doctor@medicare.com" />
              </div>
              {fErrors.email && <span className="dlogin-err">{fErrors.email}</span>}
            </div>

            <div className="dlogin-field">
              <label>Medical License Number (Password)</label>
              <div className={`dlogin-input-wrap ${fErrors.password ? "has-error" : ""}`}>
                <span>🔑</span>
                <input name="password" type={showPass ? "text" : "password"} value={form.password} onChange={handleChange} placeholder="e.g. ML100000001" />
                <button type="button" className="dlogin-toggle" onClick={() => setShowPass(!showPass)}>
                  {showPass ? "🙈" : "👁️"}
                </button>
              </div>
              {fErrors.password && <span className="dlogin-err">{fErrors.password}</span>}
            </div>

            <div className="dlogin-hint">
              🔹 Use your hospital email + medical license number to login
            </div>

            <button type="submit" className="dlogin-submit" disabled={loading}>
              {loading ? <span className="dlogin-spinner" /> : "Sign In →"}
            </button>
          </form>

          <div className="dlogin-switch">
            Admin?{" "}
            <button onClick={onSwitchToAdmin} className="dlogin-switch-btn">
              Go to Admin Login
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
