import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getProfile } from "../services/authService";
import { getGoals } from "../services/adminService";
import DashboardLayout from "../layouts/DashboardLayout";
import { toast } from "../components/Toast";

function GoalsManagement() {
  const [user, setUser] = useState(null);
  const [goals, setGoals] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

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

      const goalsList = await getGoals();
      setGoals(goalsList);
    } catch (error) {
      console.error("Goals loading failed", error);
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

  const formatDate = (dateStr) => {
    const options = { day: "numeric", month: "short", year: "numeric" };
    return new Date(dateStr).toLocaleDateString(undefined, options);
  };

  const filteredGoals = goals.filter((g) => {
    const userName = g.userId?.name || "Unknown User";
    const userEmail = g.userId?.email || "";
    return userName.toLowerCase().includes(searchTerm.toLowerCase()) || 
           userEmail.toLowerCase().includes(searchTerm.toLowerCase()) ||
           g.title.toLowerCase().includes(searchTerm.toLowerCase());
  });

  return (
    <DashboardLayout user={user} onLogout={logoutHandler}>
      {isLoading ? (
        <div className="loading-state-wrapper">
          <div className="spinner"></div>
          <p style={{ marginTop: "12px", color: "#9ca3af" }}>Loading community goals tracker...</p>
        </div>
      ) : (
        <div className="dashboard-grid-layout" style={{ gap: "24px" }}>
          
          {/* Header Card */}
          <div className="welcome-card" style={{ textAlign: "left", padding: "30px", marginBottom: "0" }}>
            <h1 className="welcome-title" style={{ fontSize: "28px" }}>🏁 Target Goals Management</h1>
            <p className="welcome-email" style={{ justifyContent: "flex-start", marginBottom: "0" }}>
              Monitor emission reduction targets set by platform members and verify completion standings.
            </p>
          </div>

          {/* Goals Tracker Table */}
          <div className="welcome-card" style={{ padding: "24px 30px", marginBottom: "0", textAlign: "left" }}>
            
            {/* Filter Bar */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px", flexWrap: "wrap", gap: "12px" }}>
              <h3 className="card-heading-title" style={{ margin: 0 }}>Global Goals Logs</h3>
              <input
                type="text"
                placeholder="🔍 Search user name or goal..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={{
                  padding: "10px 14px",
                  borderRadius: "8px",
                  border: "1px solid rgba(255,255,255,0.08)",
                  background: "#090d12",
                  color: "#fff",
                  fontSize: "13.5px",
                  width: "260px"
                }}
              />
            </div>

            {/* Table */}
            {filteredGoals.length === 0 ? (
              <div className="empty-state-design" style={{ padding: "40px 0" }}>
                <p className="empty-state-text">No matching goals found</p>
              </div>
            ) : (
              <div style={{ overflowX: "auto" }}>
                <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "14px" }}>
                  <thead>
                    <tr style={{ borderBottom: "1px solid rgba(255,255,255,0.06)", color: "#6b7280", textAlign: "left" }}>
                      <th style={{ padding: "12px 8px" }}>User</th>
                      <th style={{ padding: "12px 8px" }}>Goal Title</th>
                      <th style={{ padding: "12px 8px" }}>Target Limit</th>
                      <th style={{ padding: "12px 8px" }}>Deadline</th>
                      <th style={{ padding: "12px 8px", textAlign: "right" }}>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredGoals.map((g) => (
                      <tr
                        key={g._id}
                        style={{ borderBottom: "1px solid rgba(255,255,255,0.03)" }}
                      >
                        <td style={{ padding: "14px 8px" }}>
                          <div style={{ fontWeight: "600", color: "#fff" }}>{g.userId?.name || "Deleted User"}</div>
                          <div style={{ fontSize: "11px", color: "#6b7280" }}>{g.userId?.email || ""}</div>
                        </td>
                        <td style={{ padding: "14px 8px", color: "#fff", fontWeight: "500" }}>{g.title}</td>
                        <td style={{ padding: "14px 8px", color: "#3b82f6", fontWeight: "600" }}>
                          🎯 {g.targetCarbon} kg CO₂
                        </td>
                        <td style={{ padding: "14px 8px", color: "#9ca3af" }}>
                          {formatDate(g.deadline)}
                        </td>
                        <td style={{ padding: "14px 8px", textAlign: "right" }}>
                          <span className={`status-badge-modern ${g.status === "Active" ? "excellent" : "good"}`} style={{ fontSize: "10.5px" }}>
                            {g.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}

export default GoalsManagement;
