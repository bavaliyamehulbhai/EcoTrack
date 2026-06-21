import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getProfile } from "../services/authService";
import {
  getLeaderboard,
  getTopUsers,
  getMyRank,
  getCommunityStats
} from "../services/leaderboardService";
import DashboardLayout from "../layouts/DashboardLayout";

function Leaderboard() {
  const [user, setUser] = useState(null);
  const [leaderboard, setLeaderboard] = useState([]);
  const [topUsers, setTopUsers] = useState([]);
  const [myRank, setMyRank] = useState(null);
  const [communityStats, setCommunityStats] = useState(null);

  // Search & Filter state
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState("points"); // points, streak
  const [selectedLeague, setSelectedLeague] = useState("All");

  const [isLoading, setIsLoading] = useState(true);

  const getTierName = (points) => {
    if (points <= 150) return "Bronze";
    if (points <= 300) return "Silver";
    if (points <= 500) return "Gold";
    return "Emerald";
  };

  const getTierColor = (tier) => {
    if (tier === "Bronze") return "#b45309"; // Bronze brown
    if (tier === "Silver") return "#9ca3af"; // Silver grey
    if (tier === "Gold") return "#fbbf24"; // Gold yellow
    return "#34d399"; // Emerald green
  };
  const navigate = useNavigate();

  const loadData = async () => {
    try {
      setIsLoading(true);
      const profile = await getProfile();
      setUser(profile);

      const boardData = await getLeaderboard();
      setLeaderboard(boardData);

      const topData = await getTopUsers();
      setTopUsers(topData);

      const rankData = await getMyRank();
      setMyRank(rankData);

      const statsData = await getCommunityStats();
      setCommunityStats(statsData);
    } catch (error) {
      console.error("Leaderboard load failed", error);
      if (error.response?.status === 401) {
        localStorage.removeItem("token");
        navigate("/login");
      }
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [navigate]);

  const logoutHandler = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };

  // Rank Badges System logic (Phase 17)
  const getRankBadgeName = (rank) => {
    if (rank === 1) return "Earth Guardian";
    if (rank >= 2 && rank <= 5) return "Green Champion";
    if (rank >= 6 && rank <= 20) return "Eco Warrior";
    return "Eco Beginner";
  };

  // Filter and sort users list
  const filteredUsers = leaderboard
    .filter((u) => u.name.toLowerCase().includes(searchTerm.toLowerCase()))
    .filter((u) => selectedLeague === "All" || getTierName(u.points) === selectedLeague)
    .sort((a, b) => {
      if (sortBy === "streak") {
        return b.streak - a.streak;
      }
      return b.points - a.points;
    });

  return (
    <DashboardLayout user={user} onLogout={logoutHandler}>
      {isLoading ? (
        <div className="loading-state-wrapper">
          <div className="spinner"></div>
          <p style={{ marginTop: "12px", color: "#9ca3af" }}>Loading global rankings...</p>
        </div>
      ) : (
        <div className="dashboard-grid-layout" style={{ gap: "24px" }}>
          
          {/* Header Card */}
          <div className="welcome-card" style={{ textAlign: "left", padding: "30px", marginBottom: "0" }}>
            <h1 className="welcome-title" style={{ fontSize: "28px" }}>Community Leaderboard</h1>
            <p className="welcome-email" style={{ justifyContent: "flex-start", marginBottom: "0" }}>
              Compete globally, build your daily streaks, log green activities, and claim Eco Champion titles.
            </p>
          </div>

          {/* Row 1: Community Stats Cards */}
          {communityStats && (
            <div className="dashboard-cards-container">
              <div className="stat-card dashboard-stat-card">
                <div className="stat-card-header">
                  <span className="stat-card-title">Total Users</span>
                  <span className="stat-card-icon">👥</span>
                </div>
                <div className="stat-card-body">
                  <h2 className="stat-card-value">{communityStats.totalUsers}</h2>
                  <p className="stat-card-subtitle" style={{ marginTop: "8px" }}>Active green profiles</p>
                </div>
              </div>

              <div className="stat-card dashboard-stat-card">
                <div className="stat-card-header">
                  <span className="stat-card-title">Total Points</span>
                  <span className="stat-card-icon">⭐</span>
                </div>
                <div className="stat-card-body">
                  <h2 className="stat-card-value">{communityStats.totalPoints}</h2>
                  <p className="stat-card-subtitle" style={{ marginTop: "8px" }}>Eco actions reward pool</p>
                </div>
              </div>

              <div className="stat-card dashboard-stat-card">
                <div className="stat-card-header">
                  <span className="stat-card-title">Actions Completed</span>
                  <span className="stat-card-icon">⚡</span>
                </div>
                <div className="stat-card-body">
                  <h2 className="stat-card-value">{communityStats.totalActions}</h2>
                  <p className="stat-card-subtitle" style={{ marginTop: "8px" }}>Logged daily challenges</p>
                </div>
              </div>

              <div className="stat-card dashboard-stat-card">
                <div className="stat-card-header">
                  <span className="stat-card-title">Goals Created</span>
                  <span className="stat-card-icon">🎯</span>
                </div>
                <div className="stat-card-body">
                  <h2 className="stat-card-value">{communityStats.totalGoals}</h2>
                  <p className="stat-card-subtitle" style={{ marginTop: "8px" }}>Carbon target goals set</p>
                </div>
              </div>
            </div>
          )}

          {/* Row 2: Top Contributors Podium Cards */}
          {topUsers && topUsers.length > 0 && (
            <div className="podium-container">
              {topUsers.slice(0, 3).map((top, idx) => {
                const positions = ["first", "second", "third"];
                const medals = ["🥇", "🥈", "🥉"];
                const titles = ["Earth Guardian", "Green Champion", "Eco Warrior"];
                const positionClass = positions[idx];
                return (
                  <div key={top._id} className={`podium-card ${positionClass}`}>
                    <span style={{ fontSize: idx === 0 ? "38px" : idx === 1 ? "32px" : "28px", marginBottom: "4px" }}>
                      {medals[idx]}
                    </span>
                    <div className="podium-avatar">
                      {top.name.charAt(0).toUpperCase()}
                    </div>
                    <h4 style={{ margin: "6px 0 2px 0", fontSize: idx === 0 ? "15px" : "13.5px", fontWeight: "700", color: idx === 0 ? "#f59e0b" : idx === 1 ? "#9ca3af" : "#f97316" }}>
                      {titles[idx]}
                    </h4>
                    <div style={{ fontWeight: "700", fontSize: idx === 0 ? "16px" : "14px", color: "var(--text-h)", marginTop: "2px" }}>
                      {top.name}
                    </div>
                    <p style={{ margin: "6px 0 0 0", fontSize: idx === 0 ? "13px" : "12px", color: "#9ca3af" }}>
                      <strong>{top.points}</strong> pts • 🔥 {top.streak}d streak
                    </p>
                  </div>
                );
              })}
            </div>
          )}

          {/* Row 3: Current User Position Info & Leaderboard Table */}
          <div className="dashboard-subgrid" style={{ gridTemplateColumns: "repeat(8, 1fr)" }}>
            
            {/* Table Area (span 5) */}
            <div style={{ gridColumn: "span 5", display: "flex", flexDirection: "column", gap: "24px" }}>
              <div className="welcome-card" style={{ padding: "24px 30px", marginBottom: "0", textAlign: "left" }}>
                
                {/* Search / Filter bar */}
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px", flexWrap: "wrap", gap: "12px" }}>
                  <h3 className="card-heading-title" style={{ margin: "0 !important" }}>Global Rankings</h3>
                  
                  <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
                    <input
                      type="text"
                      placeholder="🔍 Search name..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      style={{
                        padding: "8px 12px",
                        borderRadius: "8px",
                        border: "1px solid var(--border)",
                        background: "var(--code-bg)",
                        color: "var(--text-h)",
                        fontSize: "12.5px"
                      }}
                    />
                    <select
                      value={selectedLeague}
                      onChange={(e) => setSelectedLeague(e.target.value)}
                      style={{
                        padding: "8px 12px",
                        borderRadius: "8px",
                        border: "1px solid var(--border)",
                        background: "var(--code-bg)",
                        color: "var(--text-h)",
                        fontSize: "12.5px",
                        cursor: "pointer"
                      }}
                    >
                      <option value="All">All Leagues</option>
                      <option value="Bronze">Bronze League</option>
                      <option value="Silver">Silver League</option>
                      <option value="Gold">Gold League</option>
                      <option value="Emerald">Emerald League</option>
                    </select>
                    <select
                      value={sortBy}
                      onChange={(e) => setSortBy(e.target.value)}
                      style={{
                        padding: "8px 12px",
                        borderRadius: "8px",
                        border: "1px solid var(--border)",
                        background: "var(--code-bg)",
                        color: "var(--text-h)",
                        fontSize: "12.5px",
                        cursor: "pointer"
                      }}
                    >
                      <option value="points">Sort by Points</option>
                      <option value="streak">Sort by Streak</option>
                    </select>
                  </div>
                </div>

                {/* Table */}
                {filteredUsers.length === 0 ? (
                  <div className="empty-state-design" style={{ padding: "40px 0" }}>
                    <p className="empty-state-text">Leaderboard Empty</p>
                  </div>
                ) : (
                  <div style={{ overflowX: "auto" }}>
                    <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "14px" }}>
                      <thead>
                        <tr style={{ borderBottom: "1px solid rgba(255,255,255,0.06)", color: "#6b7280", textAlign: "left" }}>
                          <th style={{ padding: "12px 8px" }}>Rank</th>
                          <th style={{ padding: "12px 8px" }}>Name</th>
                          <th style={{ padding: "12px 8px" }}>Points</th>
                          <th style={{ padding: "12px 8px" }}>Streak</th>
                          <th style={{ padding: "12px 8px" }}>Level Badge</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredUsers.map((u) => {
                          const badgeName = getRankBadgeName(u.rank);
                          const isSelf = user && u._id === user.id;

                          return (
                            <tr
                              key={u._id}
                              style={{
                                borderBottom: "1px solid rgba(255,255,255,0.03)",
                                background: isSelf ? "rgba(34,197,94,0.05)" : "transparent",
                                fontWeight: isSelf ? "600" : "400"
                              }}
                            >
                              <td style={{ padding: "14px 8px" }}>
                                {u.rank === 1 ? "🥇" : u.rank === 2 ? "🥈" : u.rank === 3 ? "🥉" : `#${u.rank}`}
                              </td>
                              <td style={{ padding: "14px 8px" }}>
                               <span style={{ marginRight: "6px" }}>{u.name}</span>
                                {isSelf && <span style={{ color: "#22c55e", fontSize: "11px", fontWeight: "600", marginRight: "6px" }}>(you)</span>}
                                <span 
                                  style={{
                                    fontSize: "10px",
                                    fontWeight: "800",
                                    padding: "2px 6px",
                                    borderRadius: "4px",
                                    background: `${getTierColor(getTierName(u.points))}18`,
                                    color: getTierColor(getTierName(u.points)),
                                    border: `1px solid ${getTierColor(getTierName(u.points))}33`,
                                    textTransform: "uppercase",
                                    display: "inline-block",
                                    verticalAlign: "middle"
                                  }}
                                >
                                  {getTierName(u.points)}
                                </span>
                              </td>
                              <td style={{ padding: "14px 8px", color: "#22c55e" }}>{u.points}</td>
                              <td style={{ padding: "14px 8px", color: "#f97316" }}>🔥 {u.streak} Days</td>
                              <td style={{ padding: "14px 8px" }}>
                                <span className={`status-badge-modern ${u.rank === 1 ? "excellent" : u.rank <= 5 ? "good" : "moderate"}`} style={{ fontSize: "11px", padding: "2px 8px" }}>
                                  {badgeName}
                                </span>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                )}

              </div>
            </div>

            {/* Current User Rank Card (span 3) */}
            <div style={{ gridColumn: "span 3", display: "flex", flexDirection: "column", gap: "24px" }}>
              {myRank ? (
                <div className="welcome-card" style={{ padding: "30px", marginBottom: "0", textAlign: "center" }}>
                  <h3 className="card-heading-title" style={{ marginBottom: "20px" }}>Your Standings</h3>
                  
                  <div style={{ background: "var(--subcard-bg)", border: "1px solid var(--subcard-border)", borderRadius: "16px", padding: "24px" }}>
                    <span style={{ fontSize: "40px", display: "block" }}>🏆</span>
                    <h2 style={{ fontSize: "28px", margin: "8px 0 2px 0", color: "var(--text-h)" }}>
                      #{myRank.rank}
                    </h2>
                    <span className="profile-card-role-badge" style={{ fontSize: "12px", background: "rgba(34,197,94,0.1)" }}>
                      {getRankBadgeName(myRank.rank)}
                    </span>
                    <p style={{ margin: "16px 0 0 0", fontSize: "13.5px", color: "#9ca3af" }}>
                      Current: <strong>{myRank.points} Points</strong>
                    </p>
                  </div>

                  {myRank.pointsNeededForNextRank > 0 && (
                    <div style={{ background: "rgba(34, 197, 94, 0.05)", border: "1px solid rgba(34, 197, 94, 0.15)", borderRadius: "8px", padding: "10px", fontSize: "12.5px", color: "#22c55e", marginTop: "16px", textAlign: "center" }}>
                      💡 Need <strong>{myRank.pointsNeededForNextRank} Points</strong> to reach Rank #{myRank.rank - 1}!
                    </div>
                  )}
                </div>
              ) : (
                <div className="welcome-card" style={{ padding: "30px", marginBottom: "0", textAlign: "center" }}>
                  <p className="empty-state-text">Complete Actions to Earn Points</p>
                </div>
              )}
            </div>

          </div>

        </div>
      )}
    </DashboardLayout>
  );
}

export default Leaderboard;
