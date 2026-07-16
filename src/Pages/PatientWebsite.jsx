import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useAppointments } from "../context/AppointmentContext";
import "./PatientWebsite.css";

const API = "http://localhost:3001";

const DEPARTMENTS = ["All", "Cardiology", "Orthopedics", "Pediatrics", "Gynecology", "Psychiatry", "Neurology"];
const TIME_SLOTS  = ["09:00 AM", "10:00 AM", "11:00 AM", "12:00 PM", "02:00 PM", "03:00 PM", "04:00 PM", "05:00 PM"];

function StarRating({ rating }) {
  return (
    <div className="star-rating">
      {[1,2,3,4,5].map((s) => (
        <span key={s} className={s <= Math.round(rating) ? "star filled" : "star"}>★</span>
      ))}
      <span className="rating-num">{rating}</span>
    </div>
  );
}

export default function PatientWebsite() {
  const { bookAppointment } = useAppointments();

  const [doctors,      setDoctors]      = useState([]);
  const [filtered,     setFiltered]     = useState([]);
  const [search,       setSearch]       = useState("");
  const [department,   setDepartment]   = useState("All");
  const [loading,      setLoading]      = useState(true);

  // Booking modal
  const [selectedDoc,  setSelectedDoc]  = useState(null);
  const [showBooking,  setShowBooking]  = useState(false);
  const [showSuccess,  setShowSuccess]  = useState(false);
  const [bookingStep,  setBookingStep]  = useState(1);

  const emptyBooking = {
    patientName: "", patientEmail: "", patientPhone: "",
    patientAge: "", patientGender: "", reason: "",
    date: "", time: "",
  };
  const [booking, setBooking] = useState(emptyBooking);
  const [bErrors, setBErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  // Fetch doctors
  useEffect(() => {
    fetch(`${API}/doctors`)
      .then((r) => r.json())
      .then((data) => { setDoctors(data); setFiltered(data); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  // Filter
  useEffect(() => {
    let result = doctors;
    if (department !== "All") result = result.filter((d) => d.department === department);
    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter((d) =>
        d.name.toLowerCase().includes(q) ||
        d.designation.toLowerCase().includes(q) ||
        d.department.toLowerCase().includes(q)
      );
    }
    setFiltered(result);
  }, [search, department, doctors]);

  const handleBookChange = (e) => {
    const { name, value } = e.target;
    setBooking((p) => ({ ...p, [name]: value }));
    setBErrors((p) => ({ ...p, [name]: "" }));
  };

  const validateBookStep = (step) => {
    const errors = {};
    if (step === 1) {
      if (!booking.patientName.trim())  errors.patientName  = "Name is required.";
      if (!booking.patientEmail.trim()) errors.patientEmail = "Email is required.";
      else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(booking.patientEmail)) errors.patientEmail = "Invalid email.";
      if (!booking.patientPhone.trim()) errors.patientPhone = "Phone is required.";
      if (!booking.patientAge)          errors.patientAge   = "Age is required.";
      if (!booking.patientGender)       errors.patientGender = "Gender is required.";
    }
    if (step === 2) {
      if (!booking.date)         errors.date   = "Date is required.";
      if (!booking.time)         errors.time   = "Time slot is required.";
      if (!booking.reason.trim()) errors.reason = "Reason is required.";
    }
    setBErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleNextStep = () => {
    if (validateBookStep(bookingStep)) setBookingStep(2);
  };

  const handleBookSubmit = async () => {
    if (!validateBookStep(2)) return;
    setSubmitting(true);
    const result = await bookAppointment({
      ...booking,
      doctorId:   selectedDoc.id,
      doctorName: selectedDoc.name,
      department: selectedDoc.department,
      designation:selectedDoc.designation,
      fee:        selectedDoc.appointment.consultationCharge,
    });
    setSubmitting(false);
    if (result.success) {
      setShowBooking(false);
      setShowSuccess(true);
      setBooking(emptyBooking);
      setBookingStep(1);
      setTimeout(() => setShowSuccess(false), 4000);
    }
  };

  const openBooking = (doc) => {
    if (doc.status !== "Available") return;
    setSelectedDoc(doc);
    setBooking(emptyBooking);
    setBErrors({});
    setBookingStep(1);
    setShowBooking(true);
  };

  return (
    <div className="pw-root">

      {/* ── Navbar ── */}
      <nav className="pw-nav">
        <div className="pw-nav-brand">
          <span className="pw-nav-icon">🏥</span>
          <div>
            <div className="pw-nav-name">MedCore</div>
            <div className="pw-nav-sub">Hospital</div>
          </div>
        </div>
        <div className="pw-nav-links">
          <a href="#doctors">Doctors</a>
          <a href="#about">About</a>
          <a href="#contact">Contact</a>
          <Link to="/admin/login" className="pw-admin-link">Admin Login</Link>
        </div>
        <button className="pw-nav-btn">Emergency: 108</button>
      </nav>

      {/* ── Hero ── */}
      <section className="pw-hero">
        <div className="pw-hero-bg" />
        <div className="pw-hero-content">
          <div className="pw-hero-badge">🏥 Trusted by 10,000+ patients</div>
          <h1 className="pw-hero-title">
            Find the Best <span className="pw-hero-highlight">Doctor</span><br />
            & Book Instantly
          </h1>
          <p className="pw-hero-desc">
            Connect with top-rated specialists at MedCore Hospital. Easy booking, real-time availability, and expert care.
          </p>

          {/* Search bar */}
          <div className="pw-hero-search">
            <span className="pw-search-icon">🔍</span>
            <input
              className="pw-search-input"
              placeholder="Search by doctor name, specialty..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <button className="pw-search-btn">Search</button>
          </div>

          {/* Stats */}
          <div className="pw-hero-stats">
            {[
              { icon: "👨‍⚕️", value: "50+",    label: "Doctors" },
              { icon: "👤",    value: "10K+",   label: "Patients" },
              { icon: "🏆",    value: "15+",    label: "Years Exp." },
              { icon: "⭐",    value: "4.9",    label: "Rating" },
            ].map((s, i) => (
              <div className="pw-stat" key={i}>
                <span className="pw-stat-icon">{s.icon}</span>
                <span className="pw-stat-value">{s.value}</span>
                <span className="pw-stat-label">{s.label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Doctors Section ── */}
      <section className="pw-doctors-section" id="doctors">
        <div className="pw-section-header">
          <div>
            <h2 className="pw-section-title">Our Specialist Doctors</h2>
            <p className="pw-section-sub">Book an appointment with our expert medical professionals</p>
          </div>
        </div>

        {/* Department filter */}
        <div className="pw-filters">
          {DEPARTMENTS.map((dept) => (
            <button
              key={dept}
              className={`pw-filter-btn ${department === dept ? "active" : ""}`}
              onClick={() => setDepartment(dept)}
            >
              {dept}
            </button>
          ))}
        </div>

        {/* Doctor Cards */}
        {loading ? (
          <div className="pw-loading">Loading doctors...</div>
        ) : filtered.length === 0 ? (
          <div className="pw-empty">No doctors found. Try a different search.</div>
        ) : (
          <div className="pw-doctor-grid">
            {filtered.map((doc) => (
              <div className="pw-doctor-card" key={doc.id}>

                {/* Top banner */}
                <div className="pw-card-banner">
                  {doc.featured && <span className="pw-featured-badge">⭐ Featured</span>}
                  <span className={`pw-status-badge ${doc.status === "Available" ? "avail" : "unavail"}`}>
                    {doc.status}
                  </span>
                </div>

                {/* Profile */}
                <div className="pw-card-body">
                  <img src={doc.profileImage} alt={doc.name} className="pw-doctor-img" />
                  <h3 className="pw-doctor-name">{doc.name}</h3>
                  <p className="pw-doctor-desg">{doc.designation}</p>
                  <span className="pw-doctor-dept">{doc.department}</span>

                  <StarRating rating={doc.rating} />
                  <span className="pw-review-count">({doc.reviewCount} reviews)</span>

                  <div className="pw-card-divider" />

                  {/* Info grid */}
                  <div className="pw-info-grid">
                    <div className="pw-info-item">
                      <span className="pw-info-label">Experience</span>
                      <span className="pw-info-value">🎓 {doc.experience}</span>
                    </div>
                    <div className="pw-info-item">
                      <span className="pw-info-label">Consult Type</span>
                      <span className="pw-info-value">📋 {doc.appointment.type}</span>
                    </div>
                    <div className="pw-info-item">
                      <span className="pw-info-label">Languages</span>
                      <span className="pw-info-value">🗣 {doc.languages?.join(", ")}</span>
                    </div>
                    <div className="pw-info-item">
                      <span className="pw-info-label">Available</span>
                      <span className="pw-info-value">📅 {doc.available}</span>
                    </div>
                  </div>

                  <div className="pw-card-divider" />

                  <div className="pw-fee-row">
                    <span className="pw-fee-label">Consultation Fee</span>
                    <span className="pw-fee-value">${doc.appointment.consultationCharge}</span>
                  </div>

                  <button
                    className={`pw-book-btn ${doc.status !== "Available" ? "disabled" : ""}`}
                    onClick={() => openBooking(doc)}
                    disabled={doc.status !== "Available"}
                  >
                    {doc.status === "Available" ? "📅 Book Appointment" : "Currently Unavailable"}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* ── Why Choose Us ── */}
      <section className="pw-why-section" id="about">
        <h2 className="pw-section-title" style={{ textAlign: "center", marginBottom: "0.5rem" }}>Why Choose MedCore?</h2>
        <p className="pw-section-sub" style={{ textAlign: "center", marginBottom: "2.5rem" }}>We provide world-class healthcare services</p>
        <div className="pw-why-grid">
          {[
            { icon: "🏆", title: "Top Specialists",  desc: "Board-certified doctors with years of experience in their fields." },
            { icon: "⚡", title: "Instant Booking",  desc: "Book appointments in seconds with our easy online system." },
            { icon: "🔒", title: "100% Secure",      desc: "Your health data is protected with enterprise-grade security." },
            { icon: "💬", title: "24/7 Support",     desc: "Our care team is available around the clock for any queries." },
          ].map((w, i) => (
            <div className="pw-why-card" key={i}>
              <div className="pw-why-icon">{w.icon}</div>
              <h3 className="pw-why-title">{w.title}</h3>
              <p className="pw-why-desc">{w.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="pw-footer" id="contact">
        <div className="pw-footer-content">
          <div className="pw-footer-brand">
            <span style={{ fontSize: 28 }}>🏥</span>
            <div>
              <div style={{ fontSize: 18, fontWeight: 700, color: "#fff" }}>MedCore Hospital</div>
              <div style={{ fontSize: 12, color: "#64748B" }}>Caring for life, every day</div>
            </div>
          </div>
          <div className="pw-footer-links">
            <div className="pw-footer-col">
              <div className="pw-footer-col-title">Contact</div>
              <div>📞 Emergency: 108</div>
              <div>✉️ info@medicare.com</div>
              <div>📍 123 Health Street, Medical City</div>
            </div>
            <div className="pw-footer-col">
              <div className="pw-footer-col-title">Hours</div>
              <div>Mon–Fri: 8AM – 8PM</div>
              <div>Sat–Sun: 9AM – 5PM</div>
              <div>Emergency: 24/7</div>
            </div>
          </div>
        </div>
        <div className="pw-footer-bottom">
          © 2026 MedCore Hospital. All rights reserved.
        </div>
      </footer>

      {/* ── Booking Modal ── */}
      {showBooking && selectedDoc && (
        <div className="pw-modal-overlay" onClick={() => setShowBooking(false)}>
          <div className="pw-modal" onClick={(e) => e.stopPropagation()}>

            {/* Modal header */}
            <div className="pw-modal-header">
              <div className="pw-modal-doc-info">
                <img src={selectedDoc.profileImage} alt={selectedDoc.name} className="pw-modal-doc-img" />
                <div>
                  <div className="pw-modal-doc-name">{selectedDoc.name}</div>
                  <div className="pw-modal-doc-desg">{selectedDoc.designation} · {selectedDoc.department}</div>
                  <div className="pw-modal-doc-fee">Fee: <strong>${selectedDoc.appointment.consultationCharge}</strong></div>
                </div>
              </div>
              <button className="pw-modal-close" onClick={() => setShowBooking(false)}>✕</button>
            </div>

            {/* Step indicator */}
            <div className="pw-modal-steps">
              <div className={`pw-step ${bookingStep === 1 ? "active" : "done"}`}>
                <span className="pw-step-num">{bookingStep > 1 ? "✓" : "1"}</span>
                Patient Info
              </div>
              <div className="pw-step-line" />
              <div className={`pw-step ${bookingStep === 2 ? "active" : bookingStep > 2 ? "done" : ""}`}>
                <span className="pw-step-num">2</span>
                Schedule
              </div>
            </div>

            {/* Step 1 — Patient Info */}
            {bookingStep === 1 && (
              <div className="pw-modal-body">
                <div className="pw-form-row">
                  <div className="pw-form-group">
                    <label>Full Name *</label>
                    <input name="patientName" value={booking.patientName} onChange={handleBookChange} placeholder="John Doe" className={bErrors.patientName ? "err" : ""} />
                    {bErrors.patientName && <span className="pw-err">{bErrors.patientName}</span>}
                  </div>
                  <div className="pw-form-group">
                    <label>Email *</label>
                    <input name="patientEmail" type="email" value={booking.patientEmail} onChange={handleBookChange} placeholder="john@example.com" className={bErrors.patientEmail ? "err" : ""} />
                    {bErrors.patientEmail && <span className="pw-err">{bErrors.patientEmail}</span>}
                  </div>
                </div>
                <div className="pw-form-row">
                  <div className="pw-form-group">
                    <label>Phone *</label>
                    <input name="patientPhone" value={booking.patientPhone} onChange={handleBookChange} placeholder="+1 000 000 0000" className={bErrors.patientPhone ? "err" : ""} />
                    {bErrors.patientPhone && <span className="pw-err">{bErrors.patientPhone}</span>}
                  </div>
                  <div className="pw-form-group">
                    <label>Age *</label>
                    <input name="patientAge" type="number" value={booking.patientAge} onChange={handleBookChange} placeholder="25" className={bErrors.patientAge ? "err" : ""} />
                    {bErrors.patientAge && <span className="pw-err">{bErrors.patientAge}</span>}
                  </div>
                </div>
                <div className="pw-form-row">
                  <div className="pw-form-group">
                    <label>Gender *</label>
                    <select name="patientGender" value={booking.patientGender} onChange={handleBookChange} className={bErrors.patientGender ? "err" : ""}>
                      <option value="">Select</option>
                      <option>Male</option>
                      <option>Female</option>
                      <option>Other</option>
                    </select>
                    {bErrors.patientGender && <span className="pw-err">{bErrors.patientGender}</span>}
                  </div>
                </div>
              </div>
            )}

            {/* Step 2 — Schedule */}
            {bookingStep === 2 && (
              <div className="pw-modal-body">
                <div className="pw-form-row">
                  <div className="pw-form-group">
                    <label>Preferred Date *</label>
                    <input name="date" type="date" value={booking.date} onChange={handleBookChange}
                      min={new Date().toISOString().split("T")[0]}
                      className={bErrors.date ? "err" : ""}
                    />
                    {bErrors.date && <span className="pw-err">{bErrors.date}</span>}
                  </div>
                </div>
                <div className="pw-form-group">
                  <label>Select Time Slot *</label>
                  <div className="pw-time-slots">
                    {TIME_SLOTS.map((t) => (
                      <button
                        key={t} type="button"
                        className={`pw-time-slot ${booking.time === t ? "selected" : ""}`}
                        onClick={() => { setBooking((p) => ({ ...p, time: t })); setBErrors((p) => ({ ...p, time: "" })); }}
                      >
                        {t}
                      </button>
                    ))}
                  </div>
                  {bErrors.time && <span className="pw-err">{bErrors.time}</span>}
                </div>
                <div className="pw-form-group">
                  <label>Reason for Visit *</label>
                  <textarea name="reason" value={booking.reason} onChange={handleBookChange}
                    placeholder="Describe your symptoms or reason for visit..."
                    rows={3} className={bErrors.reason ? "err" : ""}
                  />
                  {bErrors.reason && <span className="pw-err">{bErrors.reason}</span>}
                </div>

                {/* Summary */}
                <div className="pw-booking-summary">
                  <div className="pw-summary-title">Booking Summary</div>
                  <div className="pw-summary-row"><span>Patient</span><strong>{booking.patientName}</strong></div>
                  <div className="pw-summary-row"><span>Doctor</span><strong>{selectedDoc.name}</strong></div>
                  <div className="pw-summary-row"><span>Date</span><strong>{booking.date || "—"}</strong></div>
                  <div className="pw-summary-row"><span>Time</span><strong>{booking.time || "—"}</strong></div>
                  <div className="pw-summary-row"><span>Fee</span><strong>${selectedDoc.appointment.consultationCharge}</strong></div>
                </div>
              </div>
            )}

            {/* Modal Footer */}
            <div className="pw-modal-footer">
              {bookingStep === 2 && (
                <button className="pw-btn-back" onClick={() => setBookingStep(1)}>← Back</button>
              )}
              <div style={{ flex: 1 }} />
              <button className="pw-btn-cancel" onClick={() => setShowBooking(false)}>Cancel</button>
              {bookingStep === 1
                ? <button className="pw-btn-next" onClick={handleNextStep}>Next →</button>
                : <button className="pw-btn-confirm" onClick={handleBookSubmit} disabled={submitting}>
                    {submitting ? <span className="pw-spinner" /> : "✅ Confirm Booking"}
                  </button>
              }
            </div>
          </div>
        </div>
      )}

      {/* ── Success Toast ── */}
      {showSuccess && (
        <div className="pw-success-toast">
          <span className="pw-toast-icon">🎉</span>
          <div>
            <div className="pw-toast-title">Appointment Booked!</div>
            <div className="pw-toast-msg">Your appointment has been confirmed. Doctor has been notified.</div>
          </div>
        </div>
      )}

    </div>
  );
}
