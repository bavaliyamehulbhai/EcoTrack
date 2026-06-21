import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { getCarbonHistory } from "../services/carbonService";
import { getProfile } from "../services/authService";
import DashboardLayout from "../layouts/DashboardLayout";

function History() {
  const [history, setHistory] = useState([]);
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoading(true);
        const profile = await getProfile();
        setUser(profile);

        const data = await getCarbonHistory();
        setHistory(data);
      } catch (error) {
        console.error("Error fetching carbon history or profile", error);
        if (error.response?.status === 401) {
          localStorage.removeItem("token");
          navigate("/login");
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

  const formatDate = (dateStr) => {
    const options = { day: 'numeric', month: 'long', year: 'numeric' };
    return new Date(dateStr).toLocaleDateString(undefined, options);
  };

  return (
    <DashboardLayout user={user} onLogout={logoutHandler}>
      <div className="dashboard-grid-layout" style={{ gap: "24px" }}>
        
        {/* Header Card */}
        <div className="welcome-card" style={{ textAlign: "left", padding: "30px", marginBottom: "0" }}>
          <h1 className="welcome-title" style={{ fontSize: "28px" }}>Carbon Footprint History</h1>
          <p className="welcome-email" style={{ justifyContent: "flex-start", marginBottom: "0" }}>
            Track your progress and view past carbon footprint calculations.
          </p>
        </div>

        {isLoading ? (
          <div className="loading-state">
            <div className="spinner"></div>
            <p>Loading history records…</p>
          </div>
        ) : history.length === 0 ? (
          <div className="welcome-card" style={{ textAlign: "center", padding: "40px", marginBottom: "0" }}>
            <span style={{ fontSize: "48px", display: "block", marginBottom: "15px" }}>📭</span>
            <h3>No Records Yet</h3>
            <p style={{ color: "#6b7280", marginBottom: "20px" }}>You haven't calculated your carbon footprint yet.</p>
            <Link to="/calculator" className="auth-btn" style={{ display: "inline-block", textDecoration: "none", width: "auto", padding: "10px 24px" }}>
              Start Calculating
            </Link>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
            {history.map((record) => {
              const total = record.totalCarbon || 1;
              const percentages = {
                transport: ((record.transport || 0) / total) * 100,
                electricity: ((record.electricity || 0) / total) * 100,
                food: ((record.food || 0) / total) * 100,
                waste: ((record.waste || 0) / total) * 100,
                water: ((record.water || 0) / total) * 100
              };

              return (
                <div
                  key={record._id}
                  className="welcome-card"
                  style={{
                    textAlign: "left",
                    padding: "24px 30px",
                    marginBottom: "0",
                    transition: "all 0.3s cubic-bezier(0.16, 1, 0.3, 1)",
                    cursor: "default"
                  }}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid var(--border)", paddingBottom: "12px", marginBottom: "16px" }}>
                    <span style={{ color: "#22c55e", fontWeight: "600", fontSize: "16px" }}>
                      📅 {formatDate(record.createdAt)}
                    </span>
                    <span style={{ background: "rgba(34, 197, 94, 0.12)", border: "1px solid rgba(34, 197, 94, 0.2)", color: "#22c55e", padding: "4px 12px", borderRadius: "12px", fontWeight: "700", fontSize: "14px" }}>
                      Total: {record.totalCarbon?.toFixed(1)} kg CO₂
                    </span>
                  </div>

                  <div className="dashboard-grid" style={{ gridTemplateColumns: "repeat(5, 1fr)" }}>
                    <div className="stat-card" style={{ padding: "12px 8px", background: "var(--subcard-bg)", marginBottom: "0", border: "1px solid var(--subcard-border)" }}>
                      <span style={{ fontSize: "20px" }}>🚗</span>
                      <h3 style={{ fontSize: "12px", marginTop: "4px" }}>Transport</h3>
                      <p className="stat-value" style={{ fontSize: "16px", color: "#3b82f6" }}>{record.transport?.toFixed(1)} kg</p>
                    </div>
                    <div className="stat-card" style={{ padding: "12px 8px", background: "var(--subcard-bg)", marginBottom: "0", border: "1px solid var(--subcard-border)" }}>
                      <span style={{ fontSize: "20px" }}>⚡</span>
                      <h3 style={{ fontSize: "12px", marginTop: "4px" }}>Electricity</h3>
                      <p className="stat-value" style={{ fontSize: "16px", color: "#eab308" }}>{record.electricity?.toFixed(1)} kg</p>
                    </div>
                    <div className="stat-card" style={{ padding: "12px 8px", background: "var(--subcard-bg)", marginBottom: "0", border: "1px solid var(--subcard-border)" }}>
                      <span style={{ fontSize: "20px" }}>🍎</span>
                      <h3 style={{ fontSize: "12px", marginTop: "4px" }}>Food</h3>
                      <p className="stat-value" style={{ fontSize: "16px", color: "#22c55e" }}>{record.food?.toFixed(1)} kg</p>
                    </div>
                    <div className="stat-card" style={{ padding: "12px 8px", background: "var(--subcard-bg)", marginBottom: "0", border: "1px solid var(--subcard-border)" }}>
                      <span style={{ fontSize: "20px" }}>🗑️</span>
                      <h3 style={{ fontSize: "12px", marginTop: "4px" }}>Waste</h3>
                      <p className="stat-value" style={{ fontSize: "16px", color: "#ef4444" }}>{record.waste?.toFixed(1)} kg</p>
                    </div>
                    <div className="stat-card" style={{ padding: "12px 8px", background: "var(--subcard-bg)", marginBottom: "0", border: "1px solid var(--subcard-border)" }}>
                      <span style={{ fontSize: "20px" }}>💧</span>
                      <h3 style={{ fontSize: "12px", marginTop: "4px" }}>Water</h3>
                      <p className="stat-value" style={{ fontSize: "16px", color: "#06b6d4" }}>{record.water?.toFixed(1)} kg</p>
                    </div>
                  </div>

                  {/* Category Breakdown Progress Bars */}
                  <div className="cat-breakdown-row">
                    <div className="cat-bar-wrapper">
                      <div className="cat-bar-label">
                        <span>🚗 Travel</span>
                        <span>{percentages.transport.toFixed(0)}%</span>
                      </div>
                      <div className="cat-bar-container">
                        <div className="cat-bar-fill transport" style={{ width: `${percentages.transport}%` }}></div>
                      </div>
                    </div>
                    <div className="cat-bar-wrapper">
                      <div className="cat-bar-label">
                        <span>⚡ Utility</span>
                        <span>{percentages.electricity.toFixed(0)}%</span>
                      </div>
                      <div className="cat-bar-container">
                        <div className="cat-bar-fill electricity" style={{ width: `${percentages.electricity}%` }}></div>
                      </div>
                    </div>
                    <div className="cat-bar-wrapper">
                      <div className="cat-bar-label">
                        <span>🍎 Diet</span>
                        <span>{percentages.food.toFixed(0)}%</span>
                      </div>
                      <div className="cat-bar-container">
                        <div className="cat-bar-fill food" style={{ width: `${percentages.food}%` }}></div>
                      </div>
                    </div>
                    <div className="cat-bar-wrapper">
                      <div className="cat-bar-label">
                        <span>🗑️ Waste</span>
                        <span>{percentages.waste.toFixed(0)}%</span>
                      </div>
                      <div className="cat-bar-container">
                        <div className="cat-bar-fill waste" style={{ width: `${percentages.waste}%` }}></div>
                      </div>
                    </div>
                    <div className="cat-bar-wrapper">
                      <div className="cat-bar-label">
                        <span>💧 Water</span>
                        <span>{percentages.water.toFixed(0)}%</span>
                      </div>
                      <div className="cat-bar-container">
                        <div className="cat-bar-fill water" style={{ width: `${percentages.water}%` }}></div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}

export default History;
