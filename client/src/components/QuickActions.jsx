import { Link } from "react-router-dom";

function QuickActions() {
  const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

  return (
    <section className="welcome-card p-24 mb-0" style={{ textAlign: "left" }} aria-labelledby="quick-actions-title">
      <h3 id="quick-actions-title" className="card-heading-title">⚡ Quick Sustainability Actions</h3>
      <div style={{ display: "flex", gap: "12px", flexWrap: "wrap", marginTop: "20px" }}>
        <Link to="/calculator" className="quick-action-btn primary glow-btn" aria-label="Start a new carbon assessment">
          🧮 New Assessment
        </Link>
        <Link to="/goals" className="quick-action-btn tertiary glow-btn" aria-label="Set a new target goal">
          🎯 Set Target Goal
        </Link>
        <a href={`${API_URL}/reports/pdf`} target="_blank" rel="noreferrer" className="quick-action-btn secondary glow-btn" aria-label="Download your audit report as PDF">
          📄 Download PDF Audit
        </a>
        <a href={`${API_URL}/reports/csv`} className="quick-action-btn secondary glow-btn" aria-label="Export your history as CSV">
          📥 Export History (CSV)
        </a>
      </div>
    </section>
  );
}

export default QuickActions;
