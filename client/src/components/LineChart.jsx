import { useState } from "react";

function LineChart({ records }) {
  const [hoveredPoint, setHoveredPoint] = useState(null);

  // Chronological order (oldest first)
  const chartRecords = [...records].reverse().slice(-7); // Last 7 entries

  // Default mock data if no records
  const mockData = [
    { totalCarbon: 45, dateLabel: "13 Jun" },
    { totalCarbon: 38, dateLabel: "14 Jun" },
    { totalCarbon: 42, dateLabel: "15 Jun" },
    { totalCarbon: 32, dateLabel: "16 Jun" },
    { totalCarbon: 40, dateLabel: "17 Jun" },
    { totalCarbon: 35.2, dateLabel: "18 Jun" }
  ];

  const dataPoints = chartRecords.length > 0 
    ? chartRecords.map((r, idx) => ({
        totalCarbon: r.totalCarbon,
        dateLabel: new Date(r.createdAt).toLocaleDateString(undefined, { day: "numeric", month: "short" }),
        id: r._id || idx
      }))
    : mockData;

  // Chart boundaries
  const width = 500;
  const height = 200;
  const paddingX = 40;
  const paddingY = 30;

  const values = dataPoints.map((d) => d.totalCarbon);
  const maxValue = Math.max(...values, 50); // Ensure max is at least 50
  const minValue = Math.min(...values, 0);

  // Helper to compute SVG coordinates
  const getCoordinates = (index, value) => {
    const totalPoints = dataPoints.length;
    const x = paddingX + (index * (width - 2 * paddingX)) / Math.max(totalPoints - 1, 1);
    
    // Y-scale helper
    const range = maxValue - minValue;
    const normValue = range > 0 ? (value - minValue) / range : 0.5;
    const y = height - paddingY - normValue * (height - 2 * paddingY);
    
    return { x, y };
  };

  // Generate SVG path points
  const points = dataPoints.map((d, index) => getCoordinates(index, d.totalCarbon));
  const polylinePoints = points.map((p) => `${p.x},${p.y}`).join(" ");

  // Create gradient path fill coordinates
  const areaPoints = points.length > 0
    ? `${points[0].x},${height - paddingY} ` + 
      polylinePoints + 
      ` ${points[points.length - 1].x},${height - paddingY}`
    : "";

  return (
    <div className="welcome-card chart-card">
      <h3 className="card-heading-title" style={{ marginBottom: "20px" }}>Carbon Trend (kg CO₂)</h3>

      {records.length === 0 && (
        <p style={{ color: "#6b7280", fontSize: "13px", marginBottom: "15px", textAlign: "center" }}>
          Showing illustrative trend. Add assessments to view your historical logs.
        </p>
      )}

      <div className="line-chart-svg-wrapper">
        <svg viewBox={`0 0 ${width} ${height}`} className="line-chart-svg" width="100%">
          <defs>
            <linearGradient id="lineGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#22c55e" stopOpacity="0.4" />
              <stop offset="100%" stopColor="#22c55e" stopOpacity="0.0" />
            </linearGradient>
          </defs>

          {/* Grid lines */}
          <line x1={paddingX} y1={paddingY} x2={width - paddingX} y2={paddingY} stroke="rgba(255,255,255,0.04)" strokeDasharray="3,3" />
          <line x1={paddingX} y1={height / 2} x2={width - paddingX} y2={height / 2} stroke="rgba(255,255,255,0.04)" strokeDasharray="3,3" />
          <line x1={paddingX} y1={height - paddingY} x2={width - paddingX} y2={height - paddingY} stroke="rgba(255,255,255,0.08)" />

          {/* Y Axis Labels */}
          <text x={paddingX - 10} y={paddingY + 4} fill="#6b7280" fontSize="10" textAnchor="end">{maxValue.toFixed(0)}</text>
          <text x={paddingX - 10} y={height / 2 + 4} fill="#6b7280" fontSize="10" textAnchor="end">{((maxValue + minValue) / 2).toFixed(0)}</text>
          <text x={paddingX - 10} y={height - paddingY + 4} fill="#6b7280" fontSize="10" textAnchor="end">{minValue.toFixed(0)}</text>

          {/* Area under the line */}
          {areaPoints && (
            <polygon points={areaPoints} fill="url(#lineGrad)" />
          )}

          {/* Line Path */}
          {polylinePoints && (
            <polyline
              fill="none"
              stroke="#22c55e"
              strokeWidth="3.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              points={polylinePoints}
            />
          )}

          {/* Interactive Data Nodes */}
          {points.map((p, idx) => {
            const isHovered = hoveredPoint === idx;
            const originalVal = dataPoints[idx].totalCarbon;

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
                  onMouseEnter={() => setHoveredPoint(idx)}
                  onMouseLeave={() => setHoveredPoint(null)}
                />
                
                {/* Tooltip Overlay */}
                {isHovered && (
                  <g>
                    <rect
                      x={p.x - 30}
                      y={p.y - 30}
                      width="60"
                      height="20"
                      rx="4"
                      fill="#1f2937"
                      stroke="#22c55e"
                      strokeWidth="1"
                    />
                    <text
                      x={p.x}
                      y={p.y - 17}
                      fill="#fff"
                      fontSize="9"
                      fontWeight="bold"
                      textAnchor="middle"
                    >
                      {originalVal.toFixed(1)} kg
                    </text>
                  </g>
                )}

                {/* X Axis Labels */}
                <text
                  x={p.x}
                  y={height - 10}
                  fill="#6b7280"
                  fontSize="9.5"
                  textAnchor="middle"
                >
                  {dataPoints[idx].dateLabel}
                </text>
              </g>
            );
          })}
        </svg>
      </div>
    </div>
  );
}

export default LineChart;
