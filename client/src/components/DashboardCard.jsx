function DashboardCard({ title, value, icon, subtitle, trend, trendType, isCircular, score, theme }) {
  const themeClass = theme ? `${theme}-theme` : "green-theme";

  if (isCircular) {
    const strokeDash = `${score}, 100`;
    return (
      <div className={`stat-card dashboard-stat-card circular-score-card ${themeClass}`}>
        <div className="stat-card-header">
          <span className="stat-card-title">{title}</span>
          <span className="stat-card-icon">{icon}</span>
        </div>
        <div className="circular-score-body">
          <svg width="70" height="70" viewBox="0 0 36 36" className="circular-chart">
            <defs>
              <linearGradient id="circleGrad" x1="0" y1="1" x2="1" y2="0">
                <stop offset="0%" stopColor="#22c55e" />
                <stop offset="100%" stopColor="#4ade80" />
              </linearGradient>
              <linearGradient id="blueCircleGrad" x1="0" y1="1" x2="1" y2="0">
                <stop offset="0%" stopColor="#3b82f6" />
                <stop offset="100%" stopColor="#60a5fa" />
              </linearGradient>
              <linearGradient id="orangeCircleGrad" x1="0" y1="1" x2="1" y2="0">
                <stop offset="0%" stopColor="#f97316" />
                <stop offset="100%" stopColor="#fb923c" />
              </linearGradient>
            </defs>
            <path
              className="circle-bg"
              d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              fill="none"
              stroke="var(--border)"
              strokeWidth="3.5"
            />
            <path
              className="circle"
              strokeDasharray={strokeDash}
              d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              fill="none"
              stroke={
                theme === "blue" ? "url(#blueCircleGrad)" :
                theme === "orange" ? "url(#orangeCircleGrad)" :
                "url(#circleGrad)"
              }
              strokeWidth="3.5"
              strokeLinecap="round"
              style={{
                transition: "stroke-dasharray 0.5s ease"
              }}
            />
            <text x="18" y="20.8" className="percentage" fill="var(--text-h)" fontSize="8" fontWeight="bold" textAnchor="middle">
              {score}%
            </text>
          </svg>
          <div className="circular-score-info">
            <h2 className="stat-card-value">{value}</h2>
            {trend && (
              <span className={`trend-badge ${trendType}`}>
                {trend}
              </span>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`stat-card dashboard-stat-card ${themeClass}`}>
      <div className="stat-card-header">
        <span className="stat-card-title">{title}</span>
        <span className="stat-card-icon">{icon}</span>
      </div>
      <div className="stat-card-body">
        <h2 className="stat-card-value">{value}</h2>
        <div className="stat-card-footer-row">
          {trend && (
            <span className={`trend-badge ${trendType}`}>
              {trend}
            </span>
          )}
          {subtitle && <p className="stat-card-subtitle">{subtitle}</p>}
        </div>
      </div>
    </div>
  );
}

export default DashboardCard;
