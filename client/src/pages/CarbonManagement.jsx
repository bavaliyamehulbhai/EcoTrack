import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getProfile } from "../services/authService";
import { getCarbonRecords } from "../services/adminService";
import DashboardLayout from "../layouts/DashboardLayout";
import { toast } from "../components/Toast";

function CarbonManagement() {
  const [user, setUser] = useState(null);
  const [records, setRecords] = useState([]);
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

      const recordsList = await getCarbonRecords();
      setRecords(recordsList);
    } catch (error) {
      console.error("Carbon records load failed", error);
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
    const options = { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" };
    return new Date(dateStr).toLocaleDateString(undefined, options);
  };

  const filteredRecords = records.filter((r) => {
    const userName = r.userId?.name || "Unknown User";
    const userEmail = r.userId?.email || "";
    return userName.toLowerCase().includes(searchTerm.toLowerCase()) || 
           userEmail.toLowerCase().includes(searchTerm.toLowerCase());
  });

  return (
    <DashboardLayout user={user} onLogout={logoutHandler}>
      {isLoading ? (
        <div className="loading-state-wrapper">
          <div className="spinner"></div>
          <p style={{ marginTop: "12px", color: "#9ca3af" }}>Loading carbon audit logs...</p>
        </div>
      ) : (
        <div className="dashboard-grid-layout" style={{ gap: "24px" }}>
          
          {/* Header Card */}
          <div className="welcome-card" style={{ textAlign: "left", padding: "30px", marginBottom: "0" }}>
            <h1 className="welcome-title" style={{ fontSize: "28px" }}>🌱 Carbon Records Management</h1>
            <p className="welcome-email" style={{ justifyContent: "flex-start", marginBottom: "0" }}>
              Audit carbon records logged by all users. Analyze resource allocations across different categories.
            </p>
          </div>

          {/* Audit Logs Table */}
          <div className="welcome-card" style={{ padding: "24px 30px", marginBottom: "0", textAlign: "left" }}>
            
            {/* Filter Bar */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px", flexWrap: "wrap", gap: "12px" }}>
              <h3 className="card-heading-title" style={{ margin: 0 }}>Global Assessment Audits</h3>
              <input
                type="text"
                placeholder="🔍 Search user name..."
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
            {filteredRecords.length === 0 ? (
              <div className="empty-state-design" style={{ padding: "40px 0" }}>
                <p className="empty-state-text">No matching carbon records found</p>
              </div>
            ) : (
              <div style={{ overflowX: "auto" }}>
                <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "13.5px" }}>
                  <thead>
                    <tr style={{ borderBottom: "1px solid rgba(255,255,255,0.06)", color: "#6b7280", textAlign: "left" }}>
                      <th style={{ padding: "12px 8px" }}>User</th>
                      <th style={{ padding: "12px 8px" }}>Transport</th>
                      <th style={{ padding: "12px 8px" }}>Electricity</th>
                      <th style={{ padding: "12px 8px" }}>Food</th>
                      <th style={{ padding: "12px 8px" }}>Waste</th>
                      <th style={{ padding: "12px 8px" }}>Water</th>
                      <th style={{ padding: "12px 8px", color: "#22c55e" }}>Total Carbon</th>
                      <th style={{ padding: "12px 8px" }}>Timestamp</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredRecords.map((r) => (
                      <tr
                        key={r._id}
                        style={{ borderBottom: "1px solid rgba(255,255,255,0.03)" }}
                      >
                        <td style={{ padding: "14px 8px" }}>
                          <div style={{ fontWeight: "600", color: "#fff" }}>{r.userId?.name || "Deleted User"}</div>
                          <div style={{ fontSize: "11px", color: "#6b7280" }}>{r.userId?.email || ""}</div>
                        </td>
                        <td style={{ padding: "14px 8px" }}>🚗 {r.transport?.toFixed(1)} kg</td>
                        <td style={{ padding: "14px 8px" }}>⚡ {r.electricity?.toFixed(1)} kg</td>
                        <td style={{ padding: "14px 8px" }}>🍎 {r.food?.toFixed(1)} kg</td>
                        <td style={{ padding: "14px 8px" }}>🗑️ {r.waste?.toFixed(1)} kg</td>
                        <td style={{ padding: "14px 8px" }}>💧 {r.water?.toFixed(1)} kg</td>
                        <td style={{ padding: "14px 8px", fontWeight: "700", color: "#22c55e" }}>
                          {r.totalCarbon?.toFixed(1)} kg
                        </td>
                        <td style={{ padding: "14px 8px", color: "#6b7280" }}>
                          {formatDate(r.createdAt)}
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

export default CarbonManagement;
