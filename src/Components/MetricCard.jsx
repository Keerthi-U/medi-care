import "./MetricCard.css";

export default function MetricCard({ icon, label, value, delta, deltaUp }) {
  return (
    <div className="metric-card">
      <div className="metric-icon">{icon}</div>
      <div className="metric-label">{label}</div>
      <div className="metric-value">{value}</div>
      <div className={`metric-delta ${deltaUp ? "delta-up" : "delta-down"}`}>
        {deltaUp ? "↑" : "↓"} {delta}
      </div>
    </div>
  );
}
