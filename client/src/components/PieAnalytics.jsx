import { useState } from "react";

function PieAnalytics({ data }) {
  const [activeCategory, setActiveCategory] = useState(null);

  const categories = [
    { name: "Transport", value: data?.transport || 0, color: "#3b82f6", icon: "🚗" },
    { name: "Electricity", value: data?.electricity || 0, color: "#eab308", icon: "⚡" },
    { name: "Food", value: data?.food || 0, color: "#ef4444", icon: "🍎" },
    { name: "Waste", value: data?.waste || 0, color: "#a855f7", icon: "🗑️" },
    { name: "Water", value: data?.water || 0, color: "#06b6d4", icon: "💧" }
  ];

  const total = categories.reduce((acc, curr) => acc + curr.value, 0);
  const displayTotal = total > 0 ? total : 100;

  // Compute angles for Donut segments
  let accumulatedPercent = 0;
  const segments = categories.map((c) => {
    // If total is 0, give each category equal shares for visualization/placeholder
    const value = total > 0 ? c.value : 20; 
    const percentage = (value / (total > 0 ? total : 100)) * 100;
    const startPercent = accumulatedPercent;
    accumulatedPercent += percentage;
    return {
      ...c,
      percentage,
      startPercent,
      actualPercent: total > 0 ? (c.value / total) * 100 : 0
    };
  });

  return (
    <div className="welcome-card chart-card">
      <div className="card-header-row" style={{ borderBottom: "1px solid var(--border)", paddingBottom: "12px", marginBottom: "16px" }}>
        <h3 className="card-heading-title">Carbon Sources</h3>
        <span style={{ fontSize: "12px", color: "#6b7280" }}>Category Breakdown</span>
      </div>

      <div className="donut-chart-container">
        <div className="donut-chart-svg-wrapper">
          <svg width="170" height="170" viewBox="0 0 42 42" className="donut-chart">
            <circle cx="21" cy="21" r="15.915" fill="transparent" stroke="var(--border)" strokeWidth="4.2" />
            
            {segments.map((seg, idx) => {
              const dashArray = `${seg.percentage} ${100 - seg.percentage}`;
              const dashOffset = 100 - seg.startPercent + 25;
              const isHovered = activeCategory === seg.name;

              return (
                <circle
                  key={idx}
                  cx="21"
                  cy="21"
                  r="15.915"
                  fill="transparent"
                  stroke={seg.color}
                  strokeWidth={isHovered ? "5.5" : "4.2"}
                  strokeDasharray={dashArray}
                  strokeDashoffset={dashOffset}
                  style={{
                    transformOrigin: "center",
                    transition: "all 0.3s ease",
                    cursor: "pointer"
                  }}
                  onMouseEnter={() => setActiveCategory(seg.name)}
                  onMouseLeave={() => setActiveCategory(null)}
                />
              );
            })}

            {/* Center Area */}
            <circle cx="21" cy="21" r="11.5" fill="var(--sidebar-bg)" />
            <text x="21" y="19" className="donut-center-label" fill="#6b7280" fontSize="2.8" textAnchor="middle">
              {activeCategory ? activeCategory.toUpperCase() : "TOTAL CO₂"}
            </text>
            <text x="21" y="24" className="donut-center-val" fill="var(--text-h)" fontSize="4.2" fontWeight="bold" textAnchor="middle">
              {activeCategory 
                ? `${(data?.[activeCategory.toLowerCase()] || 0).toFixed(0)} kg`
                : `${total.toFixed(0)} kg`
              }
            </text>
          </svg>
        </div>

        {/* Legend List showing detailed percents */}
        <div className="donut-legend" style={{ gap: "6px" }}>
          {segments.map((seg, idx) => (
            <div
              key={idx}
              className={`legend-item ${activeCategory === seg.name ? "active" : ""}`}
              onMouseEnter={() => setActiveCategory(seg.name)}
              onMouseLeave={() => setActiveCategory(null)}
              style={{ padding: "6px 8px" }}
            >
              <span className="legend-indicator" style={{ backgroundColor: seg.color }}></span>
              <span className="legend-icon">{seg.icon}</span>
              <span className="legend-name" style={{ fontSize: "12.5px" }}>{seg.name}</span>
              <span className="legend-val" style={{ fontSize: "12px", color: seg.color }}>
                {seg.actualPercent.toFixed(0)}%
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default PieAnalytics;
