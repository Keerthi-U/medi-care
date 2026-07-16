import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import "./Login.css";

export default function Login({ onSwitchToDoctor }) {
  const { loginAdmin, loading, error } = useAuth();

  const [form,        setForm]        = useState({ email: "", password: "" });
  const [showPass,    setShowPass]    = useState(false);
  const [fieldErrors, setFieldErrors] = useState({ email: "", password: "" });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    setFieldErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const validate = () => {
    const errors = { email: "", password: "" };
    let valid = true;

    if (!form.email.trim()) {
      errors.email = "Email is required.";
      valid = false;
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      errors.email = "Enter a valid email address.";
      valid = false;
    }

    if (!form.password.trim()) {
      errors.password = "Password is required.";
      valid = false;
    } else if (form.password.length < 6) {
      errors.password = "Password must be at least 6 characters.";
      valid = false;
    }

    setFieldErrors(errors);
    return valid;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    await loginAdmin(form.email, form.password);
  };

  return (
    <div className="login-page">

      {/* ── Left Panel ── */}
      <div className="login-left">
        <div className="login-left-overlay" />

        {/* Logo */}
        <div className="login-brand">
          <span className="login-brand-icon">🏥</span>
          <div>
            <div className="login-brand-name">MedCore</div>
            <div className="login-brand-sub">Hospital Management System</div>
          </div>
        </div>

        {/* Center content */}
        <div className="login-left-content">
          <div className="login-illustration">
            <div className="login-illustration-circle circle-1" />
            <div className="login-illustration-circle circle-2" />
            <div className="login-illustration-circle circle-3" />
            <div className="login-doctor-icon">👨‍⚕️</div>
          </div>

          <h2 className="login-left-title">Welcome to MedCore</h2>
          <p className="login-left-desc">
            A powerful hospital management dashboard for doctors, staff, and administrators.
          </p>

          {/* Stats */}
          <div className="login-stats">
            <div className="login-stat">
              <div className="login-stat-value">1,284</div>
              <div className="login-stat-label">Patients</div>
            </div>
            <div className="login-stat-divider" />
            <div className="login-stat">
              <div className="login-stat-value">56</div>
              <div className="login-stat-label">Doctors</div>
            </div>
            <div className="login-stat-divider" />
            <div className="login-stat">
              <div className="login-stat-value">12</div>
              <div className="login-stat-label">Departments</div>
            </div>
          </div>
        </div>

        {/* Features */}
        <div className="login-features">
          {[
            { icon: "📊", text: "Real-time Analytics" },
            { icon: "🔒", text: "Secure & Private" },
            { icon: "📋", text: "Medical Records" },
          ].map((f, i) => (
            <div className="login-feature-item" key={i}>
              <span className="login-feature-icon">{f.icon}</span>
              <span>{f.text}</span>
            </div>
          ))}
        </div>
      </div>

      {/* ── Right Panel ── */}
      <div className="login-right">
        <div className="login-form-wrap">

          {/* Header */}
          <div className="login-form-header">
            <div className="login-form-icon">🔐</div>
            <h1 className="login-form-title">Admin Login</h1>
            <p className="login-form-sub">Sign in to access your dashboard</p>
          </div>

          {/* Global error */}
          {error && (
            <div className="login-error-banner">
              ⚠️ {error}
            </div>
          )}

          {/* Form */}
          <form className="login-form" onSubmit={handleSubmit} noValidate>

            {/* Email */}
            <div className="login-field">
              <label className="login-label">Email Address</label>
              <div className={`login-input-wrap ${fieldErrors.email ? "has-error" : ""}`}>
                <span className="login-input-icon">✉️</span>
                <input
                  type="email"
                  name="email"
                  value={form.email}
                  onChange={handleChange}
                  placeholder="admin@medicare.com"
                  className="login-input"
                  autoComplete="email"
                />
              </div>
              {fieldErrors.email && <span className="login-field-error">{fieldErrors.email}</span>}
            </div>

            {/* Password */}
            <div className="login-field">
              <label className="login-label">Password</label>
              <div className={`login-input-wrap ${fieldErrors.password ? "has-error" : ""}`}>
                <span className="login-input-icon">🔑</span>
                <input
                  type={showPass ? "text" : "password"}
                  name="password"
                  value={form.password}
                  onChange={handleChange}
                  placeholder="Enter your password"
                  className="login-input"
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  className="login-toggle-pass"
                  onClick={() => setShowPass(!showPass)}
                >
                  {showPass ? "🙈" : "👁️"}
                </button>
              </div>
              {fieldErrors.password && <span className="login-field-error">{fieldErrors.password}</span>}
            </div>

            {/* Hint */}
            <div className="login-hint-box">
              <span>🔹</span>
              <span>Use <strong>admin@medicare.com</strong> / <strong>admin123</strong></span>
            </div>

            {/* Submit */}
            <button type="submit" className="login-submit-btn" disabled={loading}>
              {loading ? (
                <span className="login-spinner" />
              ) : (
                "Sign In →"
              )}
            </button>

          </form>

          <div className="login-switch-portal">
            Are you a doctor?{" "}
            <button className="login-switch-portal-btn" onClick={onSwitchToDoctor}>
              Go to Doctor Portal →
            </button>
          </div>

          <p className="login-footer-note">
            © 2026 MedCore Hospital System. All rights reserved.
          </p>

        </div>
      </div>

    </div>
  );
}
