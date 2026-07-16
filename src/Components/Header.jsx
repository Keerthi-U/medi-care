import "./Header.css";

export default function Header({ activePage }) {
  const today = new Date().toLocaleDateString("en-IN", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  const pageLabels = {
    overview:     "Overview",
    patients:     "Patients",
    wards:        "Wards",
    doctors:      "Doctors",
    lab:          "Lab Results",
    appointments: "Appointments",
    reports:      "Reports",
    settings:     "Settings",
  };

  return (
    <header className="header">

      {/* Left — Page title */}
      <div className="header-left">
        <h1 className="header-title">
          {pageLabels[activePage] || "Dashboard"}
        </h1>
        <p className="header-sub">Medical Report Dashboard &nbsp;·&nbsp; {today}</p>
      </div>

      {/* Right — Actions */}
      <div className="header-right">

        {/* Live badge */}
        <span className="header-live">
          <span className="header-live-dot" />
          Live
        </span>

        {/* Search */}
        <div className="header-search">
          <span className="header-search-icon">🔍</span>
          <input
            className="header-search-input"
            type="text"
            placeholder="Search patients, wards..."
          />
        </div>

        {/* Notification bell */}
        <button className="header-icon-btn">
          🔔
          <span className="header-notif-dot" />
        </button>

        {/* Export button */}
        <button className="header-export-btn">
          📤 Export PDF
        </button>

      </div>
    </header>
  );
}
