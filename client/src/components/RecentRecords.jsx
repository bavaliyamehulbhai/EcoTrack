import { Link } from "react-router-dom";

function RecentRecords({ records }) {
  const recentList = records.slice(0, 5);

  const formatDate = (dateStr) => {
    return new Date(dateStr).toLocaleDateString(undefined, {
      day: "numeric",
      month: "long",
      year: "numeric"
    });
  };

  const getStatus = (value) => {
    if (value <= 50) return { label: "Excellent", class: "excellent" };
    if (value <= 100) return { label: "Good", class: "good" };
    if (value <= 200) return { label: "Moderate", class: "moderate" };
    return { label: "High", class: "high" };
  };

  return (
    <div className="welcome-card recent-records-card">
      <div className="card-header-row" style={{ flexDirection: "column", alignItems: "flex-start", gap: "12px", borderBottom: "none" }}>
        <h3 className="card-heading-title" style={{ fontSize: "20px" }}>Recent Carbon Records</h3>
        
        {/* Quick Actions Panel */}
        <div className="quick-actions-bar">
          <Link to="/calculator" className="quick-action-btn primary">
            ➕ New Assessment
          </Link>
          <Link to="/history" className="quick-action-btn secondary">
            📜 View History
          </Link>
          <Link to="/goals" className="quick-action-btn tertiary">
            🎯 Set Goal
          </Link>
        </div>
      </div>

      <div style={{ borderTop: "1px solid var(--border)", paddingTop: "16px", marginTop: "8px" }}>
        {recentList.length === 0 ? (
          <div className="empty-state-design">
            <span className="empty-state-icon">🌍</span>
            <p className="empty-state-text">No Carbon Assessments Yet.</p>
            <Link to="/calculator" className="quick-action-btn primary" style={{ display: "inline-block", width: "auto", margin: "12px auto 0" }}>
              Take Your First Assessment
            </Link>
          </div>
        ) : (
          <div className="timeline-list">
            {recentList.map((record) => {
              const status = getStatus(record.totalCarbon);
              return (
                <div key={record._id} className="timeline-item">
                  <div className="timeline-marker">
                    <div className="timeline-dot"></div>
                    <div className="timeline-line"></div>
                  </div>
                  <div className="timeline-content">
                    <div className="timeline-header">
                      <span className="timeline-title">🌱 Carbon Assessment Completed</span>
                      <span className="timeline-date">{formatDate(record.createdAt)}</span>
                    </div>
                    <div className="timeline-footer">
                      <span className="timeline-value">{record.totalCarbon?.toFixed(1)} kg CO₂</span>
                      <span className={`status-badge-modern ${status.class}`}>
                        {status.label}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

export default RecentRecords;
