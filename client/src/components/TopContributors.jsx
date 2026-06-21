import { Link } from "react-router-dom";

function TopContributors({ topUsers }) {
  return (
    <div className="welcome-card p-24 mb-0" style={{ textAlign: "left", display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
      <div>
        <div className="flex-between" style={{ marginBottom: "16px" }}>
          <h3 className="card-heading-title mb-0">🥇 Top Eco Contributors</h3>
          <span style={{ fontSize: "12px", color: "#6b7280" }}>Global top 3</span>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
          {topUsers && topUsers.length > 0 ? (
            topUsers.slice(0, 3).map((top, idx) => {
              const medals = ["🥇", "🥈", "🥉"];
              return (
                <div key={top._id || idx} className="flex-between" style={{ background: "var(--subcard-bg)", border: "1px solid var(--subcard-border)", borderRadius: "12px", padding: "12px 16px" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                    <span style={{ fontSize: "20px" }}>{medals[idx]}</span>
                    <div style={{ display: "flex", flexDirection: "column" }}>
                      <span style={{ fontWeight: "600", fontSize: "14px", color: "var(--text-h)" }}>{top.name}</span>
                      <span style={{ fontSize: "11px", color: "#6b7280" }}>🔥 {top.streak}d streak</span>
                    </div>
                  </div>
                  <span style={{ fontWeight: "700", color: "#22c55e", fontSize: "14px" }}>{top.points} pts</span>
                </div>
              );
            })
          ) : (
            <div style={{ padding: "20px", textAlign: "center", color: "#6b7280", fontSize: "13.5px" }}>
              No contributors active yet.
            </div>
          )}
        </div>
      </div>
      <div style={{ marginTop: "16px", borderTop: "1px solid rgba(255,255,255,0.06)", paddingTop: "12px", textAlign: "right" }}>
        <Link to="/leaderboard" style={{ fontSize: "13px", color: "#22c55e", textDecoration: "none", fontWeight: "600" }}>
          View Leaderboard →
        </Link>
      </div>
    </div>
  );
}

export default TopContributors;
