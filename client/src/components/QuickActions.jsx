import { Link } from "react-router-dom";

function QuickActions() {
  return (
    <div className="welcome-card p-24 mb-0" style={{ textAlign: "left" }}>
      <h3 className="card-heading-title">⚡ Quick Sustainability Actions</h3>
      <div style={{ display: "flex", gap: "12px", flexWrap: "wrap", marginTop: "20px" }}>
        <Link to="/calculator" className="quick-action-btn primary glow-btn">
          🧮 New Assessment
        </Link>
        <Link to="/goals" className="quick-action-btn tertiary glow-btn">
          🎯 Set Target Goal
        </Link>
        <a href="http://localhost:5000/api/reports/pdf" target="_blank" rel="noreferrer" className="quick-action-btn secondary glow-btn">
          📄 Download PDF Audit
        </a>
        <a href="http://localhost:5000/api/reports/csv" className="quick-action-btn secondary glow-btn">
          📥 Export History (CSV)
        </a>
      </div>
    </div>
  );
}

export default QuickActions;
