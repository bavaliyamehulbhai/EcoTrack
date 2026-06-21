import { useState } from "react";

function LineAnalytics({ trendData }) {
  const [hoveredIndex, setHoveredIndex] = useState(null);

  // Fallback placeholder data if no records
  const mockTrend = [
    { date: "15 Jun", carbon: 120 },
    { date: "16 Jun", carbon: 95 },
    { date: "17 Jun", carbon: 80 }
  ];

  const pointsData = trendData && trendData.length > 0
    ? trendData.map((d) => ({
        carbon: d.carbon,
        dateLabel: new Date(d.date).toLocaleDateString(undefined, { day: "numeric", month: "short" })
      }))
    : mockTrend;

  // Trend status calculations
  let statusLabel = "Stable";
  let statusClass = "stable";

  // Check if we have real records, but less than 2
  if (trendData && trendData.length > 0 && trendData.length < 2) {
    statusLabel = "Not enough data";
    statusClass = "stable";
  } else if (pointsData.length >= 2) {
    const current = pointsData[pointsData.length - 1].carbon;
    const previous = pointsData[pointsData.length - 2].carbon;

    if (current < previous) {
      const reduction = ((previous - current) / previous) * 100;
      statusLabel = `↓ Improving (${reduction.toFixed(0)}% reduction)`;
      statusClass = "improving";
    } else if (current > previous) {
      const increase = ((current - previous) / previous) * 100;
      statusLabel = `↑ Increasing (${increase.toFixed(0)}% increase)`;
      statusClass = "increasing";
    } else {
      statusLabel = "→ Stable";
      statusClass = "stable";
    }
  }

  // Dimension settings
  const width = 500;
  const height = 200;
  const paddingX = 40;
  const paddingY = 30;

  const carbonValues = pointsData.map((d) => d.carbon);
  const maxVal = Math.max(...carbonValues, 65);
  const minVal = Math.min(...carbonValues, 0);

  const averageVal = 50;
  const range = maxVal - minVal;
  const averageNorm = range > 0 ? (averageVal - minVal) / range : 0.5;
  const averageY = height - paddingY - averageNorm * (height - 2 * paddingY);

  // Helper coordinate mapper
  const getCoords = (index, value) => {
    const len = pointsData.length;
    const x = paddingX + (index * (width - 2 * paddingX)) / Math.max(len - 1, 1);
    const y = height - paddingY - (range > 0 ? (value - minVal) / range : 0.5) * (height - 2 * paddingY);
    return { x, y };
  };

  const coordinates = pointsData.map((d, index) => getCoords(index, d.carbon));
  const polyPoints = coordinates.map((p) => `${p.x},${p.y}`).join(" ");
  const areaPoints = coordinates.length > 0
    ? `${coordinates[0].x},${height - paddingY} ` + polyPoints + ` ${coordinates[coordinates.length - 1].x},${height - paddingY}`
    : "";

  return (
    <div className="welcome-card chart-card">
      <div className="card-header-row" style={{ borderBottom: "1px solid var(--border)", paddingBottom: "12px", marginBottom: "16px" }}>
        <div style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
          <h3 className="card-heading-title">Carbon Trend</h3>
          <span style={{ fontSize: "12px", color: "#6b7280" }}>Historical analysis of assessments</span>
        </div>
        <span className={`trend-status-badge ${statusClass}`} style={{ fontSize: "10.5px" }}>
          {statusLabel}
        </span>
      </div>

      <div className="line-chart-svg-wrapper">
        <svg viewBox={`0 0 ${width} ${height}`} className="line-chart-svg" width="100%">
          <defs>
            <linearGradient id="trendGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#22c55e" stopOpacity="0.3" />
              <stop offset="100%" stopColor="#22c55e" stopOpacity="0.0" />
            </linearGradient>
          </defs>

          {/* Grid lines */}
          <line x1={paddingX} y1={paddingY} x2={width - paddingX} y2={paddingY} stroke="var(--border)" strokeDasharray="3,3" />
          <line x1={paddingX} y1={height / 2} x2={width - paddingX} y2={height / 2} stroke="var(--border)" strokeDasharray="3,3" />
          <line x1={paddingX} y1={height - paddingY} x2={width - paddingX} y2={height - paddingY} stroke="var(--border)" />

          {/* Baseline Average Line */}
          <line 
            x1={paddingX} 
            y1={averageY} 
            x2={width - paddingX} 
            y2={averageY} 
            stroke="#ef4444" 
            strokeWidth="1.5" 
            strokeDasharray="4,4" 
            opacity="0.5"
          />
          <text 
            x={width - paddingX - 5} 
            y={averageY - 5} 
            fill="#ef4444" 
            fontSize="8.5" 
            fontWeight="bold"
            textAnchor="end"
            opacity="0.8"
          >
            Community Avg (50 kg)
          </text>

          {/* Y Axis */}
          <text x={paddingX - 10} y={paddingY + 3} fill="#6b7280" fontSize="9" textAnchor="end">{maxVal.toFixed(0)}</text>
          <text x={paddingX - 10} y={height / 2 + 3} fill="#6b7280" fontSize="9" textAnchor="end">{((maxVal + minVal) / 2).toFixed(0)}</text>
          <text x={paddingX - 10} y={height - paddingY + 3} fill="#6b7280" fontSize="9" textAnchor="end">{minVal.toFixed(0)}</text>

          {/* Area fill */}
          {areaPoints && <polygon points={areaPoints} fill="url(#trendGrad)" />}

          {/* Path */}
          {polyPoints && (
            <polyline
              fill="none"
              stroke="#22c55e"
              strokeWidth="3"
              strokeLinecap="round"
              strokeLinejoin="round"
              points={polyPoints}
            />
          )}

          {/* Points */}
          {coordinates.map((p, idx) => {
            const isHovered = hoveredIndex === idx;
            return (
              <g key={idx}>
                <circle
                  cx={p.x}
                  cy={p.y}
                  r={isHovered ? "6.5" : "4"}
                  fill="#090d12"
                  stroke="#22c55e"
                  strokeWidth="2.5"
                  style={{ transition: "all 0.15s ease", cursor: "pointer" }}
                  onMouseEnter={() => setHoveredIndex(idx)}
                  onMouseLeave={() => setHoveredIndex(null)}
                />

                {isHovered && (
                  <g>
                    <rect
                      x={p.x - 32}
                      y={p.y - 30}
                      width="64"
                      height="18"
                      rx="4"
                      fill="#1f2937"
                      stroke="#22c55e"
                      strokeWidth="1"
                    />
                    <text
                      x={p.x}
                      y={p.y - 18}
                      fill="#fff"
                      fontSize="9"
                      fontWeight="bold"
                      textAnchor="middle"
                    >
                      {pointsData[idx].carbon.toFixed(0)} kg
                    </text>
                  </g>
                )}

                {/* X labels */}
                <text
                  x={p.x}
                  y={height - 12}
                  fill="#6b7280"
                  fontSize="9.5"
                  textAnchor="middle"
                >
                  {pointsData[idx].dateLabel}
                </text>
              </g>
            );
          })}
        </svg>
      </div>
    </div>
  );
}

export default LineAnalytics;
