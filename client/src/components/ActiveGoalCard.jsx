import { Link } from "react-router-dom";

function ActiveGoalCard({ goalAnalytics }) {
  if (!goalAnalytics) return null;

  return (
    <div className="welcome-card p-24 mb-0" style={{ textAlign: "left" }}>
      <div className="flex-between" style={{ marginBottom: "16px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <span style={{ fontSize: "20px" }}>🎯</span>
          <span style={{ fontWeight: "700", fontSize: "16px" }}>Active Target Carbon Goal</span>
        </div>
        <Link to="/goals" style={{ fontSize: "13px", color: "#22c55e", textDecoration: "none" }}>
          Edit Goal
        </Link>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "20px", alignItems: "center" }}>
        <div style={{ gridColumn: "span 3" }}>
          <div className="flex-between" style={{ fontSize: "13px", color: "#9ca3af", marginBottom: "8px" }}>
            <span>Current: <strong>{goalAnalytics.currentCarbon?.toFixed(1)} kg</strong></span>
            <span>Target: <strong>{goalAnalytics.targetCarbon?.toFixed(0)} kg</strong></span>
          </div>
          <div style={{ background: "rgba(255,255,255,0.06)", height: "10px", borderRadius: "10px", overflow: "hidden" }}>
            <div
              style={{
                width: `${Math.min(goalAnalytics.progress, 100)}%`,
                height: "100%",
                background: goalAnalytics.currentCarbon > goalAnalytics.targetCarbon 
                  ? "linear-gradient(135deg, #ef4444, #dc2626)" 
                  : "linear-gradient(135deg, #22c55e, #16a34a)"
              }}
            ></div>
          </div>
        </div>
        
        <div className="stat-card" style={{ padding: "10px 14px", background: "var(--subcard-bg)", border: "1px solid var(--subcard-border)", textAlign: "center" }}>
          <span style={{ fontSize: "11px", color: "#6b7280" }}>Days Left</span>
          <p style={{ margin: "2px 0 0 0", fontSize: "16px", fontWeight: "700", color: "#f97316" }}>
            {goalAnalytics.daysRemaining}
          </p>
        </div>
      </div>
    </div>
  );
}

export default ActiveGoalCard;
