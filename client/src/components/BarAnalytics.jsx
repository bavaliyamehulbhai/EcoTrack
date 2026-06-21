import { useState } from "react";

function BarAnalytics({ monthlyData }) {
  const [hoveredBar, setHoveredBar] = useState(null);

  // Fallback placeholder data if all months are 0
  const mockMonthly = [
    { month: "Jan", carbon: 150 },
    { month: "Feb", carbon: 180 },
    { month: "Mar", carbon: 120 },
    { month: "Apr", carbon: 90 },
    { month: "May", carbon: 110 },
    { month: "Jun", carbon: 75 },
    { month: "Jul", carbon: 0 },
    { month: "Aug", carbon: 0 },
    { month: "Sep", carbon: 0 },
    { month: "Oct", carbon: 0 },
    { month: "Nov", carbon: 0 },
    { month: "Dec", carbon: 0 }
  ];

  // Check if all carbon entries in monthlyData are 0
  const hasData = monthlyData && monthlyData.some(d => d.carbon > 0);
  const dataPoints = hasData ? monthlyData : mockMonthly;

  const width = 600;
  const height = 180;
  const paddingX = 40;
  const paddingY = 25;

  const values = dataPoints.map((d) => d.carbon);
  const maxVal = Math.max(...values, 125);

  const averageVal = 100;
  const maxBarHeight = height - 2 * paddingY;
  const averageY = height - paddingY - (averageVal / maxVal) * maxBarHeight;

  const totalCarbon = dataPoints.reduce((acc, curr) => acc + curr.carbon, 0);

  return (
    <div className="welcome-card chart-card" style={{ gridColumn: "span 2", minHeight: "260px" }}>
      <div className="card-header-row" style={{ borderBottom: "1px solid var(--border)", paddingBottom: "12px", marginBottom: "16px" }}>
        <div style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
          <h3 className="card-heading-title">Monthly Footprint Comparison</h3>
          <span style={{ fontSize: "12px", color: "#6b7280" }}>Monthly aggregate breakdown (kg CO₂)</span>
        </div>
        {hasData ? (
          <span style={{ fontSize: "13px", color: "#22c55e", fontWeight: "600" }}>
            Total Year: {totalCarbon.toFixed(0)} kg CO₂
          </span>
        ) : (
          <span style={{ fontSize: "12px", color: "#6b7280" }}>
            Illustrative comparison
          </span>
        )}
      </div>

      <div className="bar-chart-svg-wrapper" style={{ display: "flex", justifyContent: "center", alignItems: "center" }}>
        <svg viewBox={`0 0 ${width} ${height}`} className="bar-chart-svg" width="100%">
          <defs>
            <linearGradient id="barGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#22c55e" stopOpacity="0.85" />
              <stop offset="100%" stopColor="#16a34a" stopOpacity="0.3" />
            </linearGradient>
            <linearGradient id="barHoverGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#4ade80" stopOpacity="0.95" />
              <stop offset="100%" stopColor="#22c55e" stopOpacity="0.4" />
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
            Community Avg (100 kg)
          </text>

          {/* Y Axis */}
          <text x={paddingX - 10} y={paddingY + 3} fill="#6b7280" fontSize="9" textAnchor="end">{maxVal.toFixed(0)}</text>
          <text x={paddingX - 10} y={height / 2 + 3} fill="#6b7280" fontSize="9" textAnchor="end">{(maxVal / 2).toFixed(0)}</text>
          <text x={paddingX - 10} y={height - paddingY + 3} fill="#6b7280" fontSize="9" textAnchor="end">0</text>

          {/* Bars */}
          {dataPoints.map((d, index) => {
            const numBars = dataPoints.length;
            const chartWidth = width - 2 * paddingX;
            const barSpacing = chartWidth / numBars;
            const barWidth = Math.max(barSpacing * 0.55, 12);
            
            // X coordinate (center of the bar)
            const x = paddingX + index * barSpacing + (barSpacing - barWidth) / 2;
            
            // Height calculation
            const maxBarHeight = height - 2 * paddingY;
            const barHeight = maxVal > 0 ? (d.carbon / maxVal) * maxBarHeight : 0;
            
            // Y coordinate
            const y = height - paddingY - barHeight;

            const isHovered = hoveredBar === index;

            return (
              <g key={d.month}>
                {/* Visual Bar */}
                {barHeight > 2 && (
                  <rect
                    x={x}
                    y={y}
                    width={barWidth}
                    height={barHeight}
                    rx="4"
                    fill={isHovered ? "url(#barHoverGrad)" : "url(#barGrad)"}
                    style={{
                      transition: "all 0.25s cubic-bezier(0.4, 0, 0.2, 1)",
                      cursor: "pointer"
                    }}
                    onMouseEnter={() => setHoveredBar(index)}
                    onMouseLeave={() => setHoveredBar(null)}
                  />
                )}

                {/* X Axis Labels */}
                <text
                  x={x + barWidth / 2}
                  y={height - 8}
                  fill="#6b7280"
                  fontSize="10"
                  textAnchor="middle"
                >
                  {d.month}
                </text>

                {/* Tooltip Overlay */}
                {isHovered && (
                  <g>
                    <rect
                      x={x + barWidth / 2 - 30}
                      y={Math.max(y - 26, 2)}
                      width="60"
                      height="18"
                      rx="4"
                      fill="#1f2937"
                      stroke="#22c55e"
                      strokeWidth="1"
                    />
                    <text
                      x={x + barWidth / 2}
                      y={Math.max(y - 14, 14)}
                      fill="#fff"
                      fontSize="9"
                      fontWeight="bold"
                      textAnchor="middle"
                    >
                      {d.carbon.toFixed(0)} kg
                    </text>
                  </g>
                )}
              </g>
            );
          })}
        </svg>
      </div>
    </div>
  );
}

export default BarAnalytics;
