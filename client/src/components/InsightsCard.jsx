function InsightsCard({ categoryData }) {
  const t = categoryData?.transport || 0;
  const e = categoryData?.electricity || 0;
  const f = categoryData?.food || 0;
  const wa = categoryData?.waste || 0;
  const wt = categoryData?.water || 0;

  const total = t + e + f + wa + wt;

  let title = "Personalized Insights";
  let description = "Complete carbon assessments to unlock personalized sustainability recommendations.";
  let tip = "Every record saved helps us compute more precise statistics on your energy and resource usage.";
  let severity = "info"; // info, warning, success
  let icon = "💡";

  if (total > 0) {
    if (t > e && t > f) {
      title = "High Transport Footprint";
      description = "Your transportation habits represent the largest share of your carbon footprint.";
      tip = "💡 Tip: Try using public transit, carpooling, or walking/cycling for short distance trips. If possible, consider choosing an electric vehicle or remote work options.";
      severity = "warning";
      icon = "🚗";
    } else if (e > t && e > f) {
      title = "High Energy Consumption";
      description = "Your electricity usage contributes significantly to carbon emissions.";
      tip = "💡 Tip: Reduce appliance standby power by turning off electronics at the wall. Switch to energy-efficient LED bulbs and manage HVAC cooling/heating temperatures wisely.";
      severity = "warning";
      icon = "⚡";
    } else if (f > t && f > e) {
      title = "Food Carbon Contributor";
      description = "Your meal preferences are the leading driver of your carbon records.";
      tip = "💡 Tip: Try integrating more plant-based meals into your weekly diet. Reducing red meat and preventing food waste are two of the most effective personal carbon reductions.";
      severity = "warning";
      icon = "🍏";
    } else {
      title = "Great Balance!";
      description = "Your carbon footprint is distributed relatively evenly across multiple categories.";
      tip = "💡 Tip: Focus on reducing waste by eliminating single-use plastics, and conserve water to push your sustainability score even higher.";
      severity = "success";
      icon = "🏆";
    }
  }

  return (
    <div className={`welcome-card insights-card ${severity}`} style={{ textAlign: "left", padding: "28px" }}>
      <div style={{ display: "flex", gap: "16px", alignItems: "flex-start" }}>
        <span className="insights-icon" style={{ fontSize: "32px", display: "flex", alignItems: "center" }}>
          {icon}
        </span>
        <div style={{ display: "flex", flexDirection: "column", gap: "6px", flex: 1 }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "8px" }}>
            <h3 className="card-heading-title" style={{ margin: "0 !important" }}>{title}</h3>
            {total > 0 && (
              <span className={`status-badge-modern ${severity}`}>
                Recommendation
              </span>
            )}
          </div>
          <p style={{ fontSize: "14px", color: "var(--text)", margin: "4px 0 8px 0" }}>{description}</p>
          <div className="tip-box" style={{ background: "var(--subcard-bg)", border: "1px solid var(--subcard-border)", borderRadius: "8px", padding: "12px", fontSize: "13px", color: "var(--text)", lineHeight: "1.4" }}>
            {tip}
          </div>
        </div>
      </div>
    </div>
  );
}

export default InsightsCard;
