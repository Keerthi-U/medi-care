import { useState } from "react";
import { useDoctors } from "../context/DoctorContext";
import "./Doctors.css";

const emptyForm = {
  profileImage:         "",
  name:                 "",
  username:             "",
  phone:                "",
  email:                "",
  dob:                  "",
  experience:           "",
  department:           "",
  designation:          "",
  medicalLicenseNumber: "",
  languages:            "",
  bloodGroup:           "",
  gender:               "",
  bio:                  "",
  featured:             false,
  available:            "",
  status:               "Available",
  appointmentType:      "In-Person",
  consultationCharge:   "",
};

const emptyErrors = {
  profileImage: "", name: "", username: "", phone: "", email: "",
  dob: "", experience: "", department: "", designation: "",
  medicalLicenseNumber: "", languages: "", bloodGroup: "",
  gender: "", bio: "", available: "", consultationCharge: "",
};

const validateStep = (step, form) => {
  const errors = { ...emptyErrors };
  let isValid = true;

  if (step === 1) {
    if (!form.name.trim())       { errors.name = "Full name is required."; isValid = false; }
    if (!form.username.trim())   { errors.username = "Username is required."; isValid = false; }
    if (!form.phone.trim())      { errors.phone = "Phone is required."; isValid = false; }
    else if (!/^\+?[0-9\s\-]{7,15}$/.test(form.phone)) { errors.phone = "Enter a valid phone."; isValid = false; }
    if (!form.email.trim())      { errors.email = "Email is required."; isValid = false; }
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) { errors.email = "Enter a valid email."; isValid = false; }
    if (!form.dob)               { errors.dob = "Date of birth is required."; isValid = false; }
    if (!form.gender)            { errors.gender = "Gender is required."; isValid = false; }
    if (!form.bloodGroup)        { errors.bloodGroup = "Blood group is required."; isValid = false; }
    if (!form.languages.trim())  { errors.languages = "At least one language required."; isValid = false; }
    if (!form.bio.trim())        { errors.bio = "Bio is required."; isValid = false; }
  }

  if (step === 2) {
    if (!form.designation.trim())          { errors.designation = "Designation is required."; isValid = false; }
    if (!form.department.trim())           { errors.department = "Department is required."; isValid = false; }
    if (!form.experience.trim())           { errors.experience = "Experience is required."; isValid = false; }
    if (!form.medicalLicenseNumber.trim()) { errors.medicalLicenseNumber = "License number is required."; isValid = false; }
    if (!form.available.trim())            { errors.available = "Available date is required."; isValid = false; }
  }

  if (step === 3) {
    if (!form.consultationCharge)                              { errors.consultationCharge = "Charge is required."; isValid = false; }
    else if (isNaN(form.consultationCharge) || Number(form.consultationCharge) <= 0) { errors.consultationCharge = "Enter a valid amount."; isValid = false; }
  }

  return { errors, isValid };
};

export default function Doctors() {
  const { doctors, loading, error, addDoctor, updateDoctor, deleteDoctor } = useDoctors();

  const [openMenu,   setOpenMenu]   = useState(null);
  const [showForm,   setShowForm]   = useState(false);
  const [editDoctor, setEditDoctor] = useState(null);
  const [form,       setForm]       = useState(emptyForm);
  const [errors,     setErrors]     = useState(emptyErrors);
  const [step,       setStep]       = useState(1);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({ ...prev, [name]: type === "checkbox" ? checked : value }));
    setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) {
      setErrors((prev) => ({ ...prev, profileImage: "Image must be under 2MB." }));
      return;
    }
    const reader = new FileReader();
    reader.onloadend = () => {
      setForm((prev) => ({ ...prev, profileImage: reader.result }));
      setErrors((prev) => ({ ...prev, profileImage: "" }));
    };
    reader.readAsDataURL(file);
  };

  const handleOpenAdd = () => {
    setEditDoctor(null);
    setForm(emptyForm);
    setErrors(emptyErrors);
    setStep(1);
    setShowForm(true);
  };

  const handleEdit = (doctor) => {
    setEditDoctor(doctor);
    setForm({
      profileImage:         doctor.profileImage         || "",
      name:                 doctor.name                 || "",
      username:             doctor.username             || "",
      phone:                doctor.phone                || "",
      email:                doctor.email                || "",
      dob:                  doctor.dob                  || "",
      experience:           doctor.experience           || "",
      department:           doctor.department           || "",
      designation:          doctor.designation          || "",
      medicalLicenseNumber: doctor.medicalLicenseNumber || "",
      languages:            (doctor.languages || []).join(", "),
      bloodGroup:           doctor.bloodGroup           || "",
      gender:               doctor.gender               || "",
      bio:                  doctor.bio                  || "",
      featured:             doctor.featured             || false,
      available:            doctor.available            || "",
      status:               doctor.status               || "Available",
      appointmentType:      doctor.appointment?.type    || "In-Person",
      consultationCharge:   doctor.appointment?.consultationCharge || "",
    });
    setErrors(emptyErrors);
    setStep(1);
    setShowForm(true);
    setOpenMenu(null);
  };

  const handleNext = () => {
    const { errors: stepErrors, isValid } = validateStep(step, form);
    if (!isValid) { setErrors(stepErrors); return; }
    setErrors(emptyErrors);
    setStep(step + 1);
  };

  const handleSubmit = () => {
    const { errors: stepErrors, isValid } = validateStep(3, form);
    if (!isValid) { setErrors(stepErrors); return; }

    const payload = {
      profileImage:         form.profileImage,
      name:                 form.name,
      username:             form.username,
      phone:                form.phone,
      email:                form.email,
      dob:                  form.dob,
      experience:           form.experience,
      department:           form.department,
      designation:          form.designation,
      medicalLicenseNumber: form.medicalLicenseNumber,
      languages:            form.languages.split(",").map((l) => l.trim()).filter(Boolean),
      bloodGroup:           form.bloodGroup,
      gender:               form.gender,
      bio:                  form.bio,
      featured:             form.featured,
      available:            form.available,
      status:               form.status,
      appointment: {
        type:               form.appointmentType,
        consultationCharge: Number(form.consultationCharge),
      },
    };

    if (editDoctor) {
      updateDoctor(editDoctor.id, { ...editDoctor, ...payload });
    } else {
      addDoctor({ id: `DT${Date.now()}`, ...payload });
    }

    setShowForm(false);
    setEditDoctor(null);
    setForm(emptyForm);
    setErrors(emptyErrors);
  };

  const handleDelete = (id) => { deleteDoctor(id); setOpenMenu(null); };

  if (loading) return <div className="doctors-state">Loading doctors...</div>;
  if (error)   return <div className="doctors-state error">{error}</div>;

  return (
    <section className="doctors-page">

      {/* ── Page Header ── */}
      <div className="doctors-header">
        <div className="doctors-title-wrap">
          <h1>Doctor Grid</h1>
          <span>Total Doctors: {doctors.length}</span>
        </div>
        <div className="doctors-actions">
          <button className="doctor-filter-btn">⚙ Filter</button>
          <button className="doctor-add-btn" onClick={handleOpenAdd}>+ New Doctor</button>
        </div>
      </div>

      {/* ── Modal ── */}
      {showForm && (
        <div className="modal-overlay" onClick={() => setShowForm(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>

            <div className="modal-header">
              <h2>{editDoctor ? "Edit Doctor" : "Add New Doctor"}</h2>
              <button className="modal-close" onClick={() => setShowForm(false)}>✕</button>
            </div>

            {/* Step Tabs — non-clickable divs */}
            <div className="modal-steps">
              {["Personal Info", "Professional", "Appointment"].map((label, i) => (
                <div key={i} className={`step-tab ${step === i + 1 ? "active" : ""} ${step > i + 1 ? "done" : ""}`}>
                  <span className="step-num">{step > i + 1 ? "✓" : i + 1}</span>
                  {label}
                </div>
              ))}
            </div>

            {/* ── Step 1 ── */}
            {step === 1 && (
              <div className="modal-body">
                <div className="form-row">
                  <div className="form-group full">
                    <label>Profile Image</label>
                    <div className="image-upload-wrap">
                      <input id="profileImageUpload" type="file" accept="image/*" style={{ display: "none" }} onChange={handleImageUpload} />
                      <div className="image-preview-box">
                        {form.profileImage
                          ? <img src={form.profileImage} alt="Preview" className="image-preview" />
                          : <div className="image-placeholder"><span className="image-placeholder-icon">📷</span><span>No image selected</span></div>
                        }
                      </div>
                      <div className="image-upload-actions">
                        <button type="button" className="btn-upload" onClick={() => document.getElementById("profileImageUpload").click()}>📁 Upload Image</button>
                        {form.profileImage && (
                          <button type="button" className="btn-remove-img" onClick={() => setForm((p) => ({ ...p, profileImage: "" }))}>✕ Remove</button>
                        )}
                      </div>
                      <span className="image-hint">JPG, PNG or WEBP · Max 2MB</span>
                    </div>
                    {errors.profileImage && <span className="error-msg">{errors.profileImage}</span>}
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>Full Name *</label>
                    <input name="name" value={form.name} onChange={handleChange} placeholder="Dr. John Smith" className={errors.name ? "input-error" : ""} />
                    {errors.name && <span className="error-msg">{errors.name}</span>}
                  </div>
                  <div className="form-group">
                    <label>Username *</label>
                    <input name="username" value={form.username} onChange={handleChange} placeholder="johnsmith" className={errors.username ? "input-error" : ""} />
                    {errors.username && <span className="error-msg">{errors.username}</span>}
                  </div>
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label>Phone *</label>
                    <input name="phone" value={form.phone} onChange={handleChange} placeholder="+1 000 000 0000" className={errors.phone ? "input-error" : ""} />
                    {errors.phone && <span className="error-msg">{errors.phone}</span>}
                  </div>
                  <div className="form-group">
                    <label>Email *</label>
                    <input name="email" type="email" value={form.email} onChange={handleChange} placeholder="doctor@example.com" className={errors.email ? "input-error" : ""} />
                    {errors.email && <span className="error-msg">{errors.email}</span>}
                  </div>
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label>Date of Birth *</label>
                    <input name="dob" type="date" value={form.dob} onChange={handleChange} className={errors.dob ? "input-error" : ""} />
                    {errors.dob && <span className="error-msg">{errors.dob}</span>}
                  </div>
                  <div className="form-group">
                    <label>Gender *</label>
                    <select name="gender" value={form.gender} onChange={handleChange} className={errors.gender ? "input-error" : ""}>
                      <option value="">Select</option>
                      <option>Male</option><option>Female</option><option>Other</option>
                    </select>
                    {errors.gender && <span className="error-msg">{errors.gender}</span>}
                  </div>
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label>Blood Group *</label>
                    <select name="bloodGroup" value={form.bloodGroup} onChange={handleChange} className={errors.bloodGroup ? "input-error" : ""}>
                      <option value="">Select</option>
                      {["A +ve","A -ve","B +ve","B -ve","O +ve","O -ve","AB +ve","AB -ve"].map(bg => <option key={bg}>{bg}</option>)}
                    </select>
                    {errors.bloodGroup && <span className="error-msg">{errors.bloodGroup}</span>}
                  </div>
                  <div className="form-group">
                    <label>Languages * (comma separated)</label>
                    <input name="languages" value={form.languages} onChange={handleChange} placeholder="English, French" className={errors.languages ? "input-error" : ""} />
                    {errors.languages && <span className="error-msg">{errors.languages}</span>}
                  </div>
                </div>
                <div className="form-row">
                  <div className="form-group full">
                    <label>Bio *</label>
                    <textarea name="bio" value={form.bio} onChange={handleChange} placeholder="Short bio about the doctor..." rows={3} className={errors.bio ? "input-error" : ""} />
                    {errors.bio && <span className="error-msg">{errors.bio}</span>}
                  </div>
                </div>
              </div>
            )}

            {/* ── Step 2 ── */}
            {step === 2 && (
              <div className="modal-body">
                <div className="form-row">
                  <div className="form-group">
                    <label>Designation *</label>
                    <input name="designation" value={form.designation} onChange={handleChange} placeholder="Cardiologist" className={errors.designation ? "input-error" : ""} />
                    {errors.designation && <span className="error-msg">{errors.designation}</span>}
                  </div>
                  <div className="form-group">
                    <label>Department *</label>
                    <input name="department" value={form.department} onChange={handleChange} placeholder="Cardiology" className={errors.department ? "input-error" : ""} />
                    {errors.department && <span className="error-msg">{errors.department}</span>}
                  </div>
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label>Experience *</label>
                    <input name="experience" value={form.experience} onChange={handleChange} placeholder="10+ Years" className={errors.experience ? "input-error" : ""} />
                    {errors.experience && <span className="error-msg">{errors.experience}</span>}
                  </div>
                  <div className="form-group">
                    <label>Medical License No. *</label>
                    <input name="medicalLicenseNumber" value={form.medicalLicenseNumber} onChange={handleChange} placeholder="ML000000000" className={errors.medicalLicenseNumber ? "input-error" : ""} />
                    {errors.medicalLicenseNumber && <span className="error-msg">{errors.medicalLicenseNumber}</span>}
                  </div>
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label>Available Date *</label>
                    <input name="available" value={form.available} onChange={handleChange} placeholder="Mon, 20 Jan 2025" className={errors.available ? "input-error" : ""} />
                    {errors.available && <span className="error-msg">{errors.available}</span>}
                  </div>
                  <div className="form-group">
                    <label>Status</label>
                    <select name="status" value={form.status} onChange={handleChange}>
                      <option>Available</option>
                      <option>Unavailable</option>
                    </select>
                  </div>
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label>Featured Doctor</label>
                    <div className="form-checkbox">
                      <input type="checkbox" name="featured" id="featured" checked={form.featured} onChange={handleChange} />
                      <label htmlFor="featured">Mark as Featured</label>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* ── Step 3 ── */}
            {step === 3 && (
              <div className="modal-body">
                <div className="form-row">
                  <div className="form-group">
                    <label>Appointment Type</label>
                    <select name="appointmentType" value={form.appointmentType} onChange={handleChange}>
                      <option>In-Person</option>
                      <option>Online Consultation</option>
                      <option>Both</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label>Consultation Charge ($) *</label>
                    <input name="consultationCharge" type="number" value={form.consultationCharge} onChange={handleChange} placeholder="499" className={errors.consultationCharge ? "input-error" : ""} />
                    {errors.consultationCharge && <span className="error-msg">{errors.consultationCharge}</span>}
                  </div>
                </div>
                <div className="form-summary">
                  <div className="summary-title">Review Summary</div>
                  <div className="summary-row"><span>Name</span><strong>{form.name || "—"}</strong></div>
                  <div className="summary-row"><span>Designation</span><strong>{form.designation || "—"}</strong></div>
                  <div className="summary-row"><span>Department</span><strong>{form.department || "—"}</strong></div>
                  <div className="summary-row"><span>Status</span><strong>{form.status}</strong></div>
                  <div className="summary-row"><span>Charge</span><strong>{form.consultationCharge ? `$${form.consultationCharge}` : "—"}</strong></div>
                  <div className="summary-row"><span>ID</span><strong>Auto-generated</strong></div>
                </div>
              </div>
            )}

            <div className="modal-footer">
              {step > 1 && <button className="btn-back" onClick={() => setStep(step - 1)}>← Back</button>}
              <div style={{ flex: 1 }} />
              <button className="btn-cancel" onClick={() => setShowForm(false)}>Cancel</button>
              {step < 3
                ? <button className="btn-next" onClick={handleNext}>Next →</button>
                : <button className="btn-save" onClick={handleSubmit}>{editDoctor ? "Update Doctor" : "Add Doctor"}</button>
              }
            </div>
          </div>
        </div>
      )}

      {/* ── Doctor Grid ── */}
      <div className="doctor-grid">
        {doctors.map((doctor, index) => (
          <article className="doctor-card" key={doctor.id}>

            {/* Status badge */}
            <span className={`doctor-status ${doctor.status === "Available" ? "status-available" : "status-unavailable"}`}>
              {doctor.status}
            </span>

            {/* 3-dot menu */}
            <button className="doctor-menu-btn" onClick={() => setOpenMenu(openMenu === index ? null : index)}>⋮</button>
            {openMenu === index && (
              <div className="doctor-menu">
                <button onClick={() => handleEdit(doctor)}>✏️ Edit</button>
                <button onClick={() => handleDelete(doctor.id)} className="delete-btn">🗑️ Delete</button>
              </div>
            )}

            {/* Card body */}
            <div className="doctor-card-body">
              <img src={doctor.profileImage} alt={doctor.name} className="doctor-photo" />
              <h3 className="doctor-name">{doctor.name}</h3>
              <p className="doctor-designation">{doctor.designation}</p>
              <span className="doctor-dept-badge">{doctor.department}</span>

              <div className="doctor-card-divider" />

              <div className="doctor-meta-grid">
                <div className="doctor-meta-item">
                  <span className="doctor-meta-label">Experience</span>
                  <span className="doctor-meta-value">🎓 {doctor.experience}</span>
                </div>
                <div className="doctor-meta-item">
                  <span className="doctor-meta-label">Blood Group</span>
                  <span className="doctor-meta-value">🩸 {doctor.bloodGroup}</span>
                </div>
                <div className="doctor-meta-item">
                  <span className="doctor-meta-label">Languages</span>
                  <span className="doctor-meta-value">🗣 {doctor.languages?.join(", ")}</span>
                </div>
                <div className="doctor-meta-item">
                  <span className="doctor-meta-label">Type</span>
                  <span className="doctor-meta-value">📋 {doctor.appointment?.type}</span>
                </div>
              </div>

              <div className="doctor-available">📅 Available: {doctor.available}</div>
              <div className="doctor-fee">Consultation Fee: <strong>${doctor.appointment?.consultationCharge}</strong></div>

              <div className="doctor-card-actions">
                <button className="doctor-action-btn view-btn">👁 View Profile</button>
                <button className="doctor-action-btn edit-btn" onClick={() => handleEdit(doctor)}>✏️ Edit</button>
              </div>
            </div>
          </article>
        ))}
      </div>

    </section>
  );
}
