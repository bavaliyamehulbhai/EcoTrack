import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { getProfile } from "../services/authService";
import { getDashboard, getTopUsers, getCommunity } from "../services/adminService";
import DashboardLayout from "../layouts/DashboardLayout";
import { toast } from "../components/Toast";

function AdminDashboard() {
  const [user, setUser] = useState(null);
  const [adminStats, setAdminStats] = useState(null);
  const [topUsers, setTopUsers] = useState([]);
  const [community, setCommunity] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoading(true);
        const profile = await getProfile();
        if (profile.role !== "admin") {
          toast.error("Access Denied: Admin role required");
          navigate("/dashboard");
          return;
        }
        setUser(profile);

        const statsData = await getDashboard();
        setAdminStats(statsData);

        const topData = await getTopUsers();
        setTopUsers(topData);

        const commData = await getCommunity();
        setCommunity(commData);
      } catch (error) {
        console.error("Admin dashboard load failed", error);
        if (error.response?.status === 401) {
          localStorage.removeItem("token");
          navigate("/login");
        } else {
          navigate("/dashboard");
        }
      } finally {
        setIsLoading(false);
      }
    };
    loadData();
  }, [navigate]);

  const logoutHandler = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };

  return (
    <DashboardLayout user={user} onLogout={logoutHandler}>
      {isLoading ? (
        <div className="loading-state-wrapper">
          <div className="spinner"></div>
          <p style={{ marginTop: "12px", color: "#9ca3af" }}>Loading admin panel...</p>
        </div>
      ) : (
        <div className="dashboard-grid-layout" style={{ gap: "24px" }}>
          
          {/* Header Card */}
          <div className="welcome-card" style={{ textAlign: "left", padding: "30px", marginBottom: "0" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "12px" }}>
              <div>
                <h1 className="welcome-title" style={{ fontSize: "28px" }}>⚙️ Administrative Control Room</h1>
                <p className="welcome-email" style={{ justifyContent: "flex-start", marginBottom: "0" }}>
                  Oversee system activities, monitor resource allocation, and manage user statuses.
                </p>
              </div>
              <span className="profile-card-role-badge" style={{ background: "rgba(239,68,68,0.12)", color: "#ef4444", borderColor: "rgba(239,68,68,0.25)", fontSize: "12.5px", padding: "6px 14px" }}>
                Admin Account
              </span>
            </div>
          </div>

          {/* Row 1: Dashboard Stats Cards */}
          {adminStats && (
            <div className="dashboard-cards-container">
              <div className="stat-card dashboard-stat-card">
                <div className="stat-card-header">
                  <span className="stat-card-title">Total Users</span>
                  <span className="stat-card-icon">👥</span>
                </div>
                <div className="stat-card-body">
                  <h2 className="stat-card-value">{adminStats.totalUsers}</h2>
                  <p className="stat-card-subtitle" style={{ marginTop: "8px" }}>Registered accounts</p>
                </div>
              </div>

              <div className="stat-card dashboard-stat-card">
                <div className="stat-card-header">
                  <span className="stat-card-title">Carbon Records</span>
                  <span className="stat-card-icon">🌱</span>
                </div>
                <div className="stat-card-body">
                  <h2 className="stat-card-value">{adminStats.totalCarbonRecords}</h2>
                  <p className="stat-card-subtitle" style={{ marginTop: "8px" }}>Logged footprint files</p>
                </div>
              </div>

              <div className="stat-card dashboard-stat-card">
                <div className="stat-card-header">
                  <span className="stat-card-title">Reduction Goals</span>
                  <span className="stat-card-icon">🎯</span>
                </div>
                <div className="stat-card-body">
                  <h2 className="stat-card-value">{adminStats.totalGoals}</h2>
                  <p className="stat-card-subtitle" style={{ marginTop: "8px" }}>Active target limits</p>
                </div>
              </div>

              <div className="stat-card dashboard-stat-card">
                <div className="stat-card-header">
                  <span className="stat-card-title">Actions Completed</span>
                  <span className="stat-card-icon">⚡</span>
                </div>
                <div className="stat-card-body">
                  <h2 className="stat-card-value">{adminStats.totalActions}</h2>
                  <p className="stat-card-subtitle" style={{ marginTop: "8px" }}>Seeded & completed challenges</p>
                </div>
              </div>

              <div className="stat-card dashboard-stat-card">
                <div className="stat-card-header">
                  <span className="stat-card-title">Community Points</span>
                  <span className="stat-card-icon">⭐</span>
                </div>
                <div className="stat-card-body">
                  <h2 className="stat-card-value">{adminStats.totalPoints}</h2>
                  <p className="stat-card-subtitle" style={{ marginTop: "8px" }}>Accumulated points</p>
                </div>
              </div>
            </div>
          )}

          {/* Row 2: Community Insights & Telemetry */}
          <div className="dashboard-subgrid" style={{ gridTemplateColumns: "repeat(8, 1fr)" }}>
            
            {/* Top Contributors List (span 5) */}
            <div style={{ gridColumn: "span 5", display: "flex", flexDirection: "column", gap: "24px" }}>
              <div className="welcome-card" style={{ padding: "24px 30px", marginBottom: "0", textAlign: "left" }}>
                <h3 className="card-heading-title" style={{ marginBottom: "16px" }}>🏆 Top Contributors Directory</h3>
                
                <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                  {topUsers.map((top, idx) => (
                    <div key={top._id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", background: "rgba(255,255,255,0.01)", border: "1px solid rgba(255,255,255,0.03)", borderRadius: "12px", padding: "12px 18px" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                        <span style={{ fontSize: "18px", fontWeight: "700", color: "#6b7280" }}>#{idx + 1}</span>
                        <div>
                          <div style={{ fontWeight: "700", fontSize: "14.5px", color: "#fff" }}>{top.name}</div>
                          <div style={{ fontSize: "11.5px", color: "#6b7280" }}>{top.email}</div>
                        </div>
                      </div>
                      <div style={{ textAlign: "right" }}>
                        <span style={{ fontWeight: "700", color: "#22c55e", fontSize: "14px" }}>{top.points} pts</span>
                        <div style={{ fontSize: "11px", color: "#f97316" }}>🔥 {top.streak}d streak</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Platform Insights Card (span 3) */}
            <div style={{ gridColumn: "span 3", display: "flex", flexDirection: "column", gap: "24px" }}>
              {community && (
                <div className="welcome-card" style={{ padding: "24px 30px", marginBottom: "0", textAlign: "left" }}>
                  <h3 className="card-heading-title" style={{ marginBottom: "16px" }}>📡 System Overview</h3>
                  
                  <div style={{ display: "flex", flexDirection: "column", gap: "12px", fontSize: "13.5px" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", borderBottom: "1px solid rgba(255,255,255,0.03)", paddingBottom: "8px" }}>
                      <span style={{ color: "#9ca3af" }}>Database Status:</span>
                      <strong style={{ color: "#22c55e" }}>ONLINE</strong>
                    </div>
                    <div style={{ display: "flex", justifyContent: "space-between", borderBottom: "1px solid rgba(255,255,255,0.03)", paddingBottom: "8px" }}>
                      <span style={{ color: "#9ca3af" }}>Avg Carbon/Record:</span>
                      <strong style={{ color: "#3b82f6" }}>{community.avgCarbon} kg</strong>
                    </div>
                    <div style={{ display: "flex", justifyContent: "space-between", borderBottom: "1px solid rgba(255,255,255,0.03)", paddingBottom: "8px" }}>
                      <span style={{ color: "#9ca3af" }}>Highest Contributor:</span>
                      <strong style={{ color: "#f59e0b" }}>{community.topUser}</strong>
                    </div>
                    <div style={{ display: "flex", justifyContent: "space-between", paddingBottom: "4px" }}>
                      <span style={{ color: "#9ca3af" }}>API Server fallback:</span>
                      <strong style={{ color: "#6b7280" }}>INACTIVE (ATLAS ACTIVE)</strong>
                    </div>
                  </div>
                </div>
              )}
            </div>

          </div>

        </div>
      )}
    </DashboardLayout>
  );
}

export default AdminDashboard;
