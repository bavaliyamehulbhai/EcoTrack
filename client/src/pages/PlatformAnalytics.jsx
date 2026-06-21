import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getProfile } from "../services/authService";
import { getUsers, getCarbonRecords, getActions } from "../services/adminService";
import DashboardLayout from "../layouts/DashboardLayout";
import { toast } from "../components/Toast";

function PlatformAnalytics() {
  const [user, setUser] = useState(null);
  const [users, setUsers] = useState([]);
  const [records, setRecords] = useState([]);
  const [actionsStats, setActionsStats] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // Hover states for tooltips on custom SVG graphs
  const [hoveredUserIdx, setHoveredUserIdx] = useState(null);
  const [hoveredCarbonIdx, setHoveredCarbonIdx] = useState(null);
  const [hoveredPointsIdx, setHoveredPointsIdx] = useState(null);

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

      const usersList = await getUsers();
      setUsers(usersList);

      const recordsList = await getCarbonRecords();
      setRecords(recordsList);

      const actStats = await getActions();
      setActionsStats(actStats);
    } catch (error) {
      console.error("Platform analytics load failed", error);
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

  // --- Chart 1: User Growth (Cumulative Sum over Time) ---
  const getUserGrowthData = () => {
    const sorted = [...users].sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
    const growthMap = {};
    
    sorted.forEach((u) => {
      const dateStr = new Date(u.createdAt).toLocaleDateString(undefined, { day: "numeric", month: "short" });
      growthMap[dateStr] = (growthMap[dateStr] || 0) + 1;
    });

    let runningSum = 0;
    return Object.keys(growthMap).map((date) => {
      runningSum += growthMap[date];
      return { date, count: runningSum };
    });
  };

  const userGrowthPoints = getUserGrowthData();

  // Custom User Line Chart coordinates mapper
  const userChartWidth = 500;
  const userChartHeight = 200;
  const userPadX = 40;
  const userPadY = 30;

  const userCounts = userGrowthPoints.map((d) => d.count);
  const maxUserCount = Math.max(...userCounts, 5);
  const minUserCount = 0;

  const getUserCoords = (index, value) => {
    const len = userGrowthPoints.length;
    const x = userPadX + (index * (userChartWidth - 2 * userPadX)) / Math.max(len - 1, 1);
    const range = maxUserCount - minUserCount;
    const norm = range > 0 ? (value - minUserCount) / range : 0.5;
    const y = userChartHeight - userPadY - norm * (userChartHeight - 2 * userPadY);
    return { x, y };
  };

  const userCoords = userGrowthPoints.map((d, index) => getUserCoords(index, d.count));
  const userPolyPoints = userCoords.map((p) => `${p.x},${p.y}`).join(" ");
  const userAreaPoints = userCoords.length > 0
    ? `${userCoords[0].x},${userChartHeight - userPadY} ` + userPolyPoints + ` ${userCoords[userCoords.length - 1].x},${userChartHeight - userPadY}`
    : "";

  // --- Chart 2: Carbon Records Growth (Summed total carbon by date) ---
  const getCarbonRecordsData = () => {
    const sorted = [...records].sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
    const carbonMap = {};

    sorted.forEach((r) => {
      const dateStr = new Date(r.createdAt).toLocaleDateString(undefined, { day: "numeric", month: "short" });
      carbonMap[dateStr] = (carbonMap[dateStr] || 0) + (r.totalCarbon || 0);
    });

    return Object.keys(carbonMap).map((date) => ({
      date,
      carbon: Math.round(carbonMap[date] * 10) / 10
    })).slice(-7); // Show last 7 active dates for cleaner bar displays
  };

  const carbonRecordsPoints = getCarbonRecordsData();

  // Custom Carbon Bar Chart coordinates mapper
  const carbonChartWidth = 500;
  const carbonChartHeight = 200;
  const carbonPadX = 40;
  const carbonPadY = 30;

  const carbonValues = carbonRecordsPoints.map((d) => d.carbon);
  const maxCarbonVal = Math.max(...carbonValues, 100);

  // --- Chart 3: User Points Distribution ---
  const getPointsDistributionData = () => {
    const buckets = [
      { label: "0-100", count: 0 },
      { label: "101-200", count: 0 },
      { label: "201-300", count: 0 },
      { label: "301-400", count: 0 },
      { label: "400+", count: 0 }
    ];

    users.forEach((u) => {
      const pts = u.points || 0;
      if (pts <= 100) buckets[0].count++;
      else if (pts <= 200) buckets[1].count++;
      else if (pts <= 300) buckets[2].count++;
      else if (pts <= 400) buckets[3].count++;
      else buckets[4].count++;
    });

    return buckets;
  };

  const pointsDistribution = getPointsDistributionData();
  const maxPointsBucketCount = Math.max(...pointsDistribution.map(b => b.count), 5);

  return (
    <DashboardLayout user={user} onLogout={logoutHandler}>
      {isLoading ? (
        <div className="loading-state-wrapper">
          <div className="spinner"></div>
          <p style={{ marginTop: "12px", color: "#9ca3af" }}>Loading charts engine...</p>
        </div>
      ) : (
        <div className="dashboard-grid-layout" style={{ gap: "24px" }}>
          
          {/* Header Card */}
          <div className="welcome-card" style={{ textAlign: "left", padding: "30px", marginBottom: "0" }}>
            <h1 className="welcome-title" style={{ fontSize: "28px" }}>📈 Platform Telemetry & Analytics</h1>
            <p className="welcome-email" style={{ justifyContent: "flex-start", marginBottom: "0" }}>
              Explore comprehensive system telemetry curves including user registration growth and carbon offset metrics.
            </p>
          </div>

          {/* Row 1: Actions Analytics Summary Widgets */}
          {actionsStats && (
            <div className="dashboard-cards-container">
              <div className="stat-card dashboard-stat-card">
                <div className="stat-card-header">
                  <span className="stat-card-title">Community Actions Log</span>
                  <span className="stat-card-icon">⚡</span>
                </div>
                <div className="stat-card-body">
                  <h2 className="stat-card-value">{actionsStats.totalActions}</h2>
                  <p className="stat-card-subtitle" style={{ marginTop: "8px" }}>Logged green challenges</p>
                </div>
              </div>

              <div className="stat-card dashboard-stat-card" style={{ background: "rgba(34,197,94,0.06)" }}>
                <div className="stat-card-header">
                  <span className="stat-card-title">Most Completed Challenge</span>
                  <span className="stat-card-icon">🏆</span>
                </div>
                <div className="stat-card-body">
                  <h2 className="stat-card-value" style={{ fontSize: "20px" }}>
                    {actionsStats.mostCompleted?.title || "N/A"}
                  </h2>
                  <p className="stat-card-subtitle" style={{ marginTop: "8px", color: "#22c55e" }}>
                    Logged {actionsStats.mostCompleted?.count || 0} times
                  </p>
                </div>
              </div>

              <div className="stat-card dashboard-stat-card" style={{ background: "rgba(239,68,68,0.04)" }}>
                <div className="stat-card-header">
                  <span className="stat-card-title">Least Completed Challenge</span>
                  <span className="stat-card-icon">💤</span>
                </div>
                <div className="stat-card-body">
                  <h2 className="stat-card-value" style={{ fontSize: "20px", color: "#f87171" }}>
                    {actionsStats.leastCompleted?.title || "N/A"}
                  </h2>
                  <p className="stat-card-subtitle" style={{ marginTop: "8px" }}>
                    Logged {actionsStats.leastCompleted?.count || 0} times
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Row 2: Charts Row 1 */}
          <div className="analytics-section-row">
            
            {/* Chart 1: Users Growth Line Chart */}
            <div className="welcome-card chart-card">
              <div className="card-header-row" style={{ borderBottom: "1px solid rgba(255,255,255,0.06)", paddingBottom: "12px", marginBottom: "16px" }}>
                <div style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
                  <h3 className="card-heading-title">User Base Growth</h3>
                  <span style={{ fontSize: "12px", color: "#6b7280" }}>Cumulative registered community profiles</span>
                </div>
                <span className="trend-status-badge improving" style={{ fontSize: "10.5px" }}>
                  +{users.length} Active
                </span>
              </div>

              <div className="line-chart-svg-wrapper">
                {userGrowthPoints.length === 0 ? (
                  <p style={{ color: "#6b7280", fontSize: "13px" }}>No data points available</p>
                ) : (
                  <svg viewBox={`0 0 ${userChartWidth} ${userChartHeight}`} className="line-chart-svg" width="100%">
                    <defs>
                      <linearGradient id="userGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#22c55e" stopOpacity="0.25" />
                        <stop offset="100%" stopColor="#22c55e" stopOpacity="0.0" />
                      </linearGradient>
                    </defs>

                    {/* Grid Lines */}
                    <line x1={userPadX} y1={userPadY} x2={userChartWidth - userPadX} y2={userPadY} stroke="rgba(255,255,255,0.04)" strokeDasharray="3,3" />
                    <line x1={userPadX} y1={userChartHeight / 2} x2={userChartWidth - userPadX} y2={userChartHeight / 2} stroke="rgba(255,255,255,0.04)" strokeDasharray="3,3" />
                    <line x1={userPadX} y1={userChartHeight - userPadY} x2={userChartWidth - userPadX} y2={userChartHeight - userPadY} stroke="rgba(255,255,255,0.08)" />

                    {/* Y Axis labels */}
                    <text x={userPadX - 10} y={userPadY + 3} fill="#6b7280" fontSize="9.5" textAnchor="end">{maxUserCount}</text>
                    <text x={userPadX - 10} y={userChartHeight / 2 + 3} fill="#6b7280" fontSize="9.5" textAnchor="end">{Math.round((maxUserCount + minUserCount) / 2)}</text>
                    <text x={userPadX - 10} y={userChartHeight - userPadY + 3} fill="#6b7280" fontSize="9.5" textAnchor="end">{minUserCount}</text>

                    {/* Area fill */}
                    {userAreaPoints && <polygon points={userAreaPoints} fill="url(#userGrad)" />}

                    {/* Polyline path */}
                    {userPolyPoints && (
                      <polyline
                        fill="none"
                        stroke="#22c55e"
                        strokeWidth="3.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        points={userPolyPoints}
                      />
                    )}

                    {/* Coordinates Circles */}
                    {userCoords.map((p, idx) => {
                      const isHovered = hoveredUserIdx === idx;
                      return (
                        <g key={idx}>
                          <circle
                            cx={p.x}
                            cy={p.y}
                            r={isHovered ? "7" : "4.5"}
                            fill="#090d12"
                            stroke="#22c55e"
                            strokeWidth="2.5"
                            style={{ transition: "all 0.15s ease", cursor: "pointer" }}
                            onMouseEnter={() => setHoveredUserIdx(idx)}
                            onMouseLeave={() => setHoveredUserIdx(null)}
                          />

                          {isHovered && (
                            <g>
                              <rect x={p.x - 30} y={p.y - 32} width="60" height="20" rx="4" fill="#1f2937" stroke="#22c55e" strokeWidth="1" />
                              <text x={p.x} y={p.y - 19} fill="#fff" fontSize="10" fontWeight="bold" textAnchor="middle">
                                {userGrowthPoints[idx].count} Users
                              </text>
                            </g>
                          )}

                          {/* X labels */}
                          <text x={p.x} y={userChartHeight - 12} fill="#6b7280" fontSize="9.5" textAnchor="middle">
                            {userGrowthPoints[idx].date}
                          </text>
                        </g>
                      );
                    })}
                  </svg>
                )}
              </div>
            </div>

            {/* Chart 2: Carbon Records Growth Bar Chart */}
            <div className="welcome-card chart-card">
              <div className="card-header-row" style={{ borderBottom: "1px solid rgba(255,255,255,0.06)", paddingBottom: "12px", marginBottom: "16px" }}>
                <div style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
                  <h3 className="card-heading-title">Total Daily Emissions</h3>
                  <span style={{ fontSize: "12px", color: "#6b7280" }}>Aggregated carbon records volume logged</span>
                </div>
                <span className="trend-status-badge stable" style={{ fontSize: "10.5px" }}>
                  Active Audits
                </span>
              </div>

              <div className="line-chart-svg-wrapper">
                {carbonRecordsPoints.length === 0 ? (
                  <p style={{ color: "#6b7280", fontSize: "13px" }}>No carbon records tracked yet</p>
                ) : (
                  <svg viewBox={`0 0 ${carbonChartWidth} ${carbonChartHeight}`} className="line-chart-svg" width="100%">
                    <defs>
                      <linearGradient id="barGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.8" />
                        <stop offset="100%" stopColor="#3b82f6" stopOpacity="0.2" />
                      </linearGradient>
                    </defs>

                    {/* Grid Lines */}
                    <line x1={carbonPadX} y1={carbonPadY} x2={carbonChartWidth - carbonPadX} y2={carbonPadY} stroke="rgba(255,255,255,0.04)" strokeDasharray="3,3" />
                    <line x1={carbonPadX} y1={carbonChartHeight - carbonPadY} x2={carbonChartWidth - carbonPadX} y2={carbonChartHeight - carbonPadY} stroke="rgba(255,255,255,0.08)" />

                    {/* Y Axis */}
                    <text x={carbonPadX - 10} y={carbonPadY + 3} fill="#6b7280" fontSize="9.5" textAnchor="end">{maxCarbonVal.toFixed(0)}</text>
                    <text x={carbonPadX - 10} y={carbonChartHeight - carbonPadY + 3} fill="#6b7280" fontSize="9.5" textAnchor="end">0</text>

                    {/* Bars */}
                    {carbonRecordsPoints.map((d, idx) => {
                      const len = carbonRecordsPoints.length;
                      const spacing = (carbonChartWidth - 2 * carbonPadX) / len;
                      const barWidth = Math.max(16, spacing * 0.4);
                      const x = carbonPadX + idx * spacing + spacing / 2 - barWidth / 2;
                      
                      const range = maxCarbonVal - 0;
                      const norm = range > 0 ? d.carbon / range : 0.5;
                      const barHeight = norm * (carbonChartHeight - 2 * carbonPadY);
                      const y = carbonChartHeight - carbonPadY - barHeight;

                      const isHovered = hoveredCarbonIdx === idx;

                      return (
                        <g key={idx}>
                          <rect
                            x={x}
                            y={y}
                            width={barWidth}
                            height={Math.max(barHeight, 2)}
                            rx="4"
                            fill="url(#barGrad)"
                            stroke={isHovered ? "#fff" : "transparent"}
                            strokeWidth="1"
                            style={{ transition: "all 0.15s ease", cursor: "pointer" }}
                            onMouseEnter={() => setHoveredCarbonIdx(idx)}
                            onMouseLeave={() => setHoveredCarbonIdx(null)}
                          />

                          {isHovered && (
                            <g>
                              <rect x={x + barWidth / 2 - 40} y={y - 30} width="80" height="20" rx="4" fill="#1f2937" stroke="#3b82f6" strokeWidth="1" />
                              <text x={x + barWidth / 2} y={y - 17} fill="#fff" fontSize="9.5" fontWeight="bold" textAnchor="middle">
                                {d.carbon.toFixed(1)} kg CO₂
                              </text>
                            </g>
                          )}

                          {/* X labels */}
                          <text x={x + barWidth / 2} y={carbonChartHeight - 12} fill="#6b7280" fontSize="9.5" textAnchor="middle">
                            {d.date}
                          </text>
                        </g>
                      );
                    })}
                  </svg>
                )}
              </div>
            </div>

          </div>

          {/* Row 3: Points Distribution Histogram */}
          <div className="analytics-section-row" style={{ gridTemplateColumns: "1fr" }}>
            <div className="welcome-card chart-card" style={{ minHeight: "260px" }}>
              <div className="card-header-row" style={{ borderBottom: "1px solid rgba(255,255,255,0.06)", paddingBottom: "12px", marginBottom: "16px" }}>
                <div style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
                  <h3 className="card-heading-title">Community Eco Points Spread</h3>
                  <span style={{ fontSize: "12px", color: "#6b7280" }}>Distribution curve of users across points brackets</span>
                </div>
              </div>

              <div className="line-chart-svg-wrapper">
                <svg viewBox="0 0 500 150" className="line-chart-svg" width="100%">
                  <defs>
                    <linearGradient id="pointsGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#f59e0b" stopOpacity="0.8" />
                      <stop offset="100%" stopColor="#f59e0b" stopOpacity="0.2" />
                    </linearGradient>
                  </defs>

                  {/* Grid Lines */}
                  <line x1={40} y1={20} x2={460} y2={20} stroke="rgba(255,255,255,0.03)" strokeDasharray="3,3" />
                  <line x1={40} y1={120} x2={460} y2={120} stroke="rgba(255,255,255,0.08)" />

                  {/* Y Label */}
                  <text x={30} y={24} fill="#6b7280" fontSize="9.5" textAnchor="end">{maxPointsBucketCount}</text>
                  <text x={30} y={124} fill="#6b7280" fontSize="9.5" textAnchor="end">0</text>

                  {/* Bars */}
                  {pointsDistribution.map((b, idx) => {
                    const spacing = 420 / 5;
                    const barWidth = 40;
                    const x = 40 + idx * spacing + spacing / 2 - barWidth / 2;
                    
                    const norm = b.count / maxPointsBucketCount;
                    const barHeight = norm * 100;
                    const y = 120 - barHeight;

                    const isHovered = hoveredPointsIdx === idx;

                    return (
                      <g key={idx}>
                        <rect
                          x={x}
                          y={y}
                          width={barWidth}
                          height={Math.max(barHeight, 2)}
                          rx="4"
                          fill="url(#pointsGrad)"
                          stroke={isHovered ? "#fff" : "transparent"}
                          strokeWidth="1"
                          style={{ transition: "all 0.15s ease", cursor: "pointer" }}
                          onMouseEnter={() => setHoveredPointsIdx(idx)}
                          onMouseLeave={() => setHoveredPointsIdx(null)}
                        />

                        {isHovered && (
                          <g>
                            <rect x={x + barWidth / 2 - 35} y={y - 28} width="70" height="20" rx="4" fill="#1f2937" stroke="#f59e0b" strokeWidth="1" />
                            <text x={x + barWidth / 2} y={y - 15} fill="#fff" fontSize="9.5" fontWeight="bold" textAnchor="middle">
                              {b.count} Users
                            </text>
                          </g>
                        )}

                        <text x={x + barWidth / 2} y={138} fill="#9ca3af" fontSize="10.5" textAnchor="middle">
                          {b.label} pts
                        </text>
                      </g>
                    );
                  })}
                </svg>
              </div>
            </div>
          </div>

        </div>
      )}
    </DashboardLayout>
  );
}

export default PlatformAnalytics;
