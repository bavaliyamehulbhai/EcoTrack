import { useState } from "react";

function PieChart({ records }) {
  const [activeCategory, setActiveCategory] = useState(null);

  // Default mock category breakdown if no records
  const sums = {
    transport: 0,
    electricity: 0,
    food: 0,
    waste: 0,
    water: 0
  };

  records.forEach((r) => {
    sums.transport += r.transport || 0;
    sums.electricity += r.electricity || 0;
    sums.food += r.food || 0;
    sums.waste += r.waste || 0;
    sums.water += r.water || 0;
  });

  const total = Object.values(sums).reduce((a, b) => a + b, 0);

  const categories = [
    { name: "Transport", value: sums.transport, color: "#3b82f6", icon: "🚗" },
    { name: "Electricity", value: sums.electricity, color: "#eab308", icon: "⚡" },
    { name: "Food", value: sums.food, color: "#ef4444", icon: "🍎" },
    { name: "Waste", value: sums.waste, color: "#a855f7", icon: "🗑️" },
    { name: "Water", value: sums.water, color: "#06b6d4", icon: "💧" }
  ];

  // If total is 0, display placeholders to keep UI beautiful
  const chartData = total > 0 ? categories : categories.map(c => ({ ...c, value: 20 }));
  const displayTotal = total > 0 ? total : 100;

  // Compute angles for Donut segments
  let accumulatedPercent = 0;
  const segments = chartData.map((c) => {
    const percentage = (c.value / displayTotal) * 100;
    const startPercent = accumulatedPercent;
    accumulatedPercent += percentage;
    return {
      ...c,
      percentage,
      startPercent
    };
  });

  return (
    <div className="welcome-card chart-card">
      <h3 className="card-heading-title" style={{ marginBottom: "20px" }}>Footprint Breakdown</h3>

      {total === 0 && (
        <p style={{ color: "#6b7280", fontSize: "13px", marginBottom: "15px", textAlign: "center" }}>
          Showing illustrative breakdown. Add assessment to see your data.
        </p>
      )}

      <div className="donut-chart-container">
        <div className="donut-chart-svg-wrapper">
          <svg width="180" height="180" viewBox="0 0 42 42" className="donut-chart">
            <circle cx="21" cy="21" r="15.915" fill="transparent" stroke="rgba(255,255,255,0.03)" strokeWidth="4.2" />
            
            {segments.map((seg, idx) => {
              const dashArray = `${seg.percentage} ${100 - seg.percentage}`;
              // Dashoffset counts clockwise. To start at 12 o'clock, we subtract from 25
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

            {/* Center Text inside Donut */}
            <circle cx="21" cy="21" r="11" fill="#090d12" />
            <text x="21" y="19" className="donut-center-label" fill="#6b7280" fontSize="3" textAnchor="middle">
              {activeCategory ? activeCategory : "TOTAL CO₂"}
            </text>
            <text x="21" y="24" className="donut-center-val" fill="#fff" fontSize="4.5" fontWeight="bold" textAnchor="middle">
              {activeCategory 
                ? `${sums[activeCategory.toLowerCase()]?.toFixed(0)} kg`
                : `${total.toFixed(0)} kg`
              }
            </text>
          </svg>
        </div>

        {/* Legend */}
        <div className="donut-legend">
          {segments.map((seg, idx) => (
            <div
              key={idx}
              className={`legend-item ${activeCategory === seg.name ? "active" : ""}`}
              onMouseEnter={() => setActiveCategory(seg.name)}
              onMouseLeave={() => setActiveCategory(null)}
            >
              <span className="legend-indicator" style={{ backgroundColor: seg.color }}></span>
              <span className="legend-icon">{seg.icon}</span>
              <span className="legend-name">{seg.name}</span>
              <span className="legend-val">
                {total > 0 ? `${((seg.value / total) * 100).toFixed(0)}%` : "0%"}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default PieChart;
