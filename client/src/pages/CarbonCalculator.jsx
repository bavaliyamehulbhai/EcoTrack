import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { createCarbon, getCarbonHistory } from "../services/carbonService";
import DashboardLayout from "../layouts/DashboardLayout";
import { toast } from "../components/Toast";

function CarbonCalculator() {
  const [formData, setFormData] = useState({
    transportKm: 0,
    electricityUnits: 0,
    foodType: "vegetarian",
    plasticUsage: 0,
    waterUsage: 0
  });

  const calculateLiveEstimate = () => {
    const km = Number(formData.transportKm) || 0;
    const units = Number(formData.electricityUnits) || 0;
    const plastic = Number(formData.plasticUsage) || 0;
    const water = Number(formData.waterUsage) || 0;
    
    let foodFactor = 1.5;
    if (formData.foodType === "mixed") foodFactor = 3.0;
    if (formData.foodType === "nonveg") foodFactor = 5.0;

    return km * 0.2 + units * 0.5 + foodFactor + plastic * 2.0 + water * 0.001;
  };

  const liveEstimate = calculateLiveEstimate();
  const [step, setStep] = useState(1);
  const [lastRecord, setLastRecord] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [calculationResult, setCalculationResult] = useState(null);
  const navigate = useNavigate();

  const loadData = async () => {
    try {
      const historyData = await getCarbonHistory();
      if (historyData && historyData.length > 0) {
        const sorted = [...historyData].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        setLastRecord(sorted[0]);
      }
    } catch (err) {
      console.error("Failed to load calculator data", err);
      if (err.response?.status === 401) {
        localStorage.removeItem("token");
        navigate("/login");
      }
    }
  };

  useEffect(() => {
    loadData();
  }, [navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (step < 3) {
      setStep((prev) => prev + 1);
      return;
    }
    setIsSubmitting(true);
    try {
      const response = await createCarbon(formData);
      setCalculationResult(response.record);
      setLastRecord(response.record);
      toast.success("Record Saved successfully!");
      setFormData({
        transportKm: 0,
        electricityUnits: 0,
        foodType: "vegetarian",
        plasticUsage: 0,
        waterUsage: 0
      });
      setStep(1);
    } catch (error) {
      console.error(error);
      toast.error(error.response?.data?.message || "Failed to calculate carbon footprint");
    } finally {
      setIsSubmitting(false);
    }
  };

  const ecoTips = [
    {
      title: "🚴 Ride a Bicycle",
      text: "Did you know? Using a bicycle for just 5km instead of driving can reduce daily CO₂ emissions by over 1.2 kg."
    },
    {
      title: "💡 Power Standby",
      text: "Turning off appliances at the wall plug saves up to 10% on your home's total electricity footprint."
    },
    {
      title: "🥗 Eat Plant-Based",
      text: "Swapping out red meat for plant-based alternatives twice a week can cut your food carbon footprint by 30%."
    },
    {
      title: "🚿 Save Water",
      text: "Reducing shower times by 2 minutes conserves water and significantly cuts down on thermal water heating emissions."
    }
  ];

  // Pick a tip based on the day or random
  const activeTip = ecoTips[new Date().getDate() % ecoTips.length];

  return (
    <DashboardLayout>
      <div className="dashboard-grid-layout" style={{ gap: "24px" }}>
        
        {/* Header Card */}
        <div className="welcome-card" style={{ textAlign: "left", padding: "30px", marginBottom: "0" }}>
          <h1 className="welcome-title" style={{ fontSize: "28px" }}>Carbon Calculator</h1>
          <p className="welcome-email" style={{ justifyContent: "flex-start", marginBottom: "0" }}>
            Estimate your daily/monthly carbon footprint and save it to your records.
          </p>
        </div>

        <div className="dashboard-subgrid">
          
          {/* Main Calculator Form (span 5) */}
          <div style={{ gridColumn: "span 5", display: "flex", flexDirection: "column", gap: "24px" }}>
            <div className="welcome-card" style={{ textAlign: "left", padding: "30px", marginBottom: "0" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" }}>
                <h3 className="card-heading-title" style={{ margin: 0 }}>New Footprint Assessment</h3>
                <span className="profile-card-role-badge" style={{ background: "rgba(34,197,94,0.1)", color: "#22c55e", borderColor: "transparent", fontWeight: "700" }}>
                  Step {step} of 3
                </span>
              </div>

              {/* Progress Steps bar */}
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "32px", position: "relative", padding: "0 10px" }}>
                <div style={{ position: "absolute", top: "50%", left: "10px", right: "10px", height: "2px", background: "rgba(255,255,255,0.06)", zIndex: 1, transform: "translateY(-50%)" }}></div>
                <div 
                  style={{ 
                    position: "absolute", 
                    top: "50%", 
                    left: "10px", 
                    width: step === 1 ? "0%" : step === 2 ? "50%" : "calc(100% - 20px)", 
                    height: "2px", 
                    background: "linear-gradient(90deg, #22c55e, #10b981)", 
                    zIndex: 2,
                    transform: "translateY(-50%)",
                    transition: "width 0.3s cubic-bezier(0.4, 0, 0.2, 1)" 
                  }}
                ></div>
                
                {[1, 2, 3].map((s) => (
                  <div 
                    key={s} 
                    style={{ 
                      width: "32px", 
                      height: "32px", 
                      borderRadius: "50%", 
                      background: step >= s ? "linear-gradient(135deg, #22c55e, #10b981)" : "#090d12", 
                      border: "2px solid",
                      borderColor: step >= s ? "#22c55e" : "rgba(255,255,255,0.1)",
                      color: step >= s ? "#fff" : "#6b7280",
                      display: "flex", 
                      alignItems: "center", 
                      justifyContent: "center", 
                      fontWeight: "700",
                      fontSize: "13px",
                      zIndex: 3,
                      boxShadow: step >= s ? "0 0 10px rgba(34, 197, 94, 0.4)" : "none",
                      transition: "all 0.3s ease"
                    }}
                  >
                    {s}
                  </div>
                ))}
              </div>

              <form onSubmit={handleSubmit} className="auth-form" style={{ gap: "24px" }}>
                {step === 1 && (
                  <div className="page-fade-in" style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
                    <h4 style={{ margin: "0 0 4px 0", color: "var(--text-h)", fontSize: "14.5px", fontWeight: "600" }}>
                      🚗 Step 1: Transport & Commuting
                    </h4>
                    <div className="form-group">
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        <label htmlFor="transportKm">Daily Travel Distance</label>
                        <span className="profile-card-role-badge" style={{ background: "rgba(59,130,246,0.1)", color: "#3b82f6", borderColor: "transparent", fontSize: "12px" }}>
                          {formData.transportKm || 0} km
                        </span>
                      </div>
                      <input
                        id="transportKm"
                        name="transportKm"
                        type="range"
                        min="0"
                        max="200"
                        step="1"
                        value={formData.transportKm || 0}
                        onChange={handleChange}
                        required
                      />
                    </div>
                  </div>
                )}

                {step === 2 && (
                  <div className="page-fade-in" style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
                    <h4 style={{ margin: "0 0 4px 0", color: "var(--text-h)", fontSize: "14.5px", fontWeight: "600" }}>
                      ⚡ Step 2: Consumption & Diet
                    </h4>
                    <div className="form-group">
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        <label htmlFor="electricityUnits">Electricity consumption</label>
                        <span className="profile-card-role-badge" style={{ background: "rgba(234,179,8,0.1)", color: "#eab308", borderColor: "transparent", fontSize: "12px" }}>
                          {formData.electricityUnits || 0} kWh
                        </span>
                      </div>
                      <input
                        id="electricityUnits"
                        name="electricityUnits"
                        type="range"
                        min="0"
                        max="500"
                        step="1"
                        value={formData.electricityUnits || 0}
                        onChange={handleChange}
                        required
                      />
                    </div>

                    <div className="form-group">
                      <label htmlFor="foodType">Primary Diet Profile</label>
                      <select
                        id="foodType"
                        name="foodType"
                        value={formData.foodType}
                        onChange={handleChange}
                        style={{
                          padding: "12px 16px",
                          borderRadius: "10px",
                          border: "1px solid var(--border)",
                          background: "var(--code-bg)",
                          color: "var(--text-h)",
                          fontSize: "14px",
                          fontFamily: "inherit",
                          outline: "none"
                        }}
                        required
                      >
                        <option value="vegetarian">Vegetarian (Low emissions)</option>
                        <option value="mixed">Mixed Diet (Medium emissions)</option>
                        <option value="nonveg">Heavy Meat Consumer (High emissions)</option>
                      </select>
                    </div>
                  </div>
                )}

                {step === 3 && (
                  <div className="page-fade-in" style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
                    <h4 style={{ margin: "0 0 4px 0", color: "var(--text-h)", fontSize: "14.5px", fontWeight: "600" }}>
                      🗑️ Step 3: Waste & Water usage
                    </h4>
                    <div className="form-group">
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        <label htmlFor="plasticUsage">Weekly Plastic Waste</label>
                        <span className="profile-card-role-badge" style={{ background: "rgba(239,68,68,0.1)", color: "#ef4444", borderColor: "transparent", fontSize: "12px" }}>
                          {formData.plasticUsage || 0} kg
                        </span>
                      </div>
                      <input
                        id="plasticUsage"
                        name="plasticUsage"
                        type="range"
                        min="0"
                        max="50"
                        step="1"
                        value={formData.plasticUsage || 0}
                        onChange={handleChange}
                        required
                      />
                    </div>

                    <div className="form-group">
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        <label htmlFor="waterUsage">Daily Water Usage</label>
                        <span className="profile-card-role-badge" style={{ background: "rgba(6,182,212,0.1)", color: "#06b6d4", borderColor: "transparent", fontSize: "12px" }}>
                          {formData.waterUsage || 0} Liters
                        </span>
                      </div>
                      <input
                        id="waterUsage"
                        name="waterUsage"
                        type="range"
                        min="0"
                        max="1000"
                        step="10"
                        value={formData.waterUsage || 0}
                        onChange={handleChange}
                        required
                      />
                    </div>
                  </div>
                )}

                <div style={{ display: "flex", gap: "10px", marginTop: "10px" }}>
                  {step > 1 && (
                    <button 
                      type="button" 
                      onClick={() => setStep((prev) => prev - 1)} 
                      className="quick-action-btn secondary"
                      style={{ padding: "12px 20px", fontSize: "14px" }}
                    >
                      ← Back
                    </button>
                  )}
                  
                  <button 
                    type="submit" 
                    className="auth-btn glow-btn" 
                    disabled={isSubmitting} 
                    style={{ flex: 1, margin: 0, padding: "12px" }}
                  >
                    {step < 3 
                      ? "Next Step →" 
                      : isSubmitting 
                        ? "Calculating..." 
                        : "Calculate & Save Record 🚀"
                    }
                  </button>
                </div>
              </form>
            </div>

            {calculationResult && (
              <div className="welcome-card" style={{ background: "rgba(34, 197, 94, 0.08)", borderColor: "rgba(34, 197, 94, 0.3)", padding: "30px", marginBottom: "0", textAlign: "left" }}>
                <h2 style={{ color: "#22c55e", marginBottom: "15px", fontSize: "20px" }}>Calculation Result</h2>
                <div className="dashboard-grid" style={{ marginTop: "20px" }}>
                  <div className="stat-card" style={{ padding: "15px", marginBottom: "0" }}>
                    <h3 style={{ fontSize: "13px" }}>Transport CO2</h3>
                    <p className="stat-value" style={{ fontSize: "18px" }}>{calculationResult.transport?.toFixed(2)} kg</p>
                  </div>
                  <div className="stat-card" style={{ padding: "15px", marginBottom: "0" }}>
                    <h3 style={{ fontSize: "13px" }}>Electricity CO2</h3>
                    <p className="stat-value" style={{ fontSize: "18px" }}>{calculationResult.electricity?.toFixed(2)} kg</p>
                  </div>
                  <div className="stat-card" style={{ padding: "15px", marginBottom: "0" }}>
                    <h3 style={{ fontSize: "13px" }}>Food CO2</h3>
                    <p className="stat-value" style={{ fontSize: "18px" }}>{calculationResult.food?.toFixed(2)} kg</p>
                  </div>
                  <div className="stat-card" style={{ padding: "15px", marginBottom: "0" }}>
                    <h3 style={{ fontSize: "13px" }}>Waste CO2</h3>
                    <p className="stat-value" style={{ fontSize: "18px" }}>{calculationResult.waste?.toFixed(2)} kg</p>
                  </div>
                  <div className="stat-card" style={{ padding: "15px", marginBottom: "0" }}>
                    <h3 style={{ fontSize: "13px" }}>Water CO2</h3>
                    <p className="stat-value" style={{ fontSize: "18px" }}>{calculationResult.water?.toFixed(2)} kg</p>
                  </div>
                  <div className="stat-card" style={{ padding: "15px", background: "rgba(34, 197, 94, 0.2)", borderColor: "#22c55e", marginBottom: "0" }}>
                    <h3 style={{ color: "#fff", fontSize: "13px" }}>Total Carbon</h3>
                    <p className="stat-value" style={{ fontSize: "20px", color: "#fff" }}>{calculationResult.totalCarbon?.toFixed(2)} kg</p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Right Sidebar Details (span 3) */}
          <div style={{ gridColumn: "span 3", display: "flex", flexDirection: "column", gap: "24px" }}>
            
            {/* Real-time Live Estimate Preview */}
            <div className="welcome-card" style={{ textAlign: "center", padding: "30px", marginBottom: "0" }}>
              <h3 className="card-heading-title" style={{ marginBottom: "16px" }}>⚡ Live Footprint Estimate</h3>
              <div style={{ display: "flex", gap: "20px", alignItems: "center", background: "var(--subcard-bg)", border: "1px solid var(--subcard-border)", borderRadius: "16px", padding: "24px" }}>
                <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center" }}>
                  <span style={{ fontSize: "28px" }}>🌱</span>
                  <h2 style={{ fontSize: "24px", margin: "6px 0 4px 0", color: liveEstimate > 150 ? "#ef4444" : liveEstimate > 75 ? "#f97316" : "#22c55e", fontWeight: "800", transition: "color 0.2s" }}>
                    {liveEstimate.toFixed(1)} kg
                  </h2>
                  <span className="profile-card-role-badge" style={{ fontSize: "10px", textTransform: "uppercase" }}>
                    Estimated CO₂
                  </span>
                </div>
                
                <div className="live-bar-container">
                  <div 
                    className="live-bar-fill"
                    style={{
                      height: `${Math.min(100, (liveEstimate / 300) * 100)}%`,
                      background: liveEstimate > 150 
                        ? "linear-gradient(to top, #ef4444, #f87171)" 
                        : liveEstimate > 75 
                          ? "linear-gradient(to top, #f97316, #fb923c)" 
                          : "linear-gradient(to top, #22c55e, #4ade80)"
                    }}
                  ></div>
                </div>
              </div>
            </div>

            {/* Last Carbon Score Preview */}
            <div className="welcome-card" style={{ textAlign: "center", padding: "24px", marginBottom: "0" }}>
              <h3 className="card-heading-title" style={{ marginBottom: "12px", fontSize: "15px" }}>Last Carbon Audit</h3>
              <div style={{ background: "var(--subcard-bg)", border: "1px solid var(--subcard-border)", borderRadius: "12px", padding: "16px" }}>
                {lastRecord ? (
                  <>
                    <h4 style={{ fontSize: "18px", margin: "0 0 8px 0", color: "#9ca3af", fontWeight: "700" }}>
                      {lastRecord.totalCarbon?.toFixed(1)} kg
                    </h4>
                    <div style={{ display: "flex", flexDirection: "column", gap: "6px", textAlign: "left", fontSize: "12px", color: "#9ca3af" }}>
                      <div style={{ display: "flex", justifyContent: "space-between" }}>
                        <span>🚗 Travel:</span>
                        <strong style={{ color: "var(--text-h)" }}>{lastRecord.transport?.toFixed(1)} kg</strong>
                      </div>
                      <div style={{ display: "flex", justifyContent: "space-between" }}>
                        <span>⚡ Utility:</span>
                        <strong style={{ color: "var(--text-h)" }}>{lastRecord.electricity?.toFixed(1)} kg</strong>
                      </div>
                      <div style={{ display: "flex", justifyContent: "space-between" }}>
                        <span>🍎 Diet:</span>
                        <strong style={{ color: "var(--text-h)" }}>{lastRecord.food?.toFixed(1)} kg</strong>
                      </div>
                    </div>
                  </>
                ) : (
                  <p style={{ margin: 0, color: "#6b7280", fontSize: "12px" }}>
                    No assessments yet.
                  </p>
                )}
              </div>
            </div>

            {/* Carbon Tips Card */}
            <div className="welcome-card insights-card success" style={{ textAlign: "left", padding: "28px", marginBottom: "0", display: "flex", flexDirection: "column", borderLeft: "4px solid #22c55e" }}>
              <div style={{ display: "flex", gap: "12px", alignItems: "flex-start", marginBottom: "12px" }}>
                <span style={{ fontSize: "28px" }}>💡</span>
                <h3 className="card-heading-title" style={{ margin: 0, fontSize: "16px" }}>Sustainability Tip</h3>
              </div>
              <h4 style={{ margin: "0 0 6px 0", color: "#22c55e", fontSize: "14px", fontWeight: "600" }}>
                {activeTip.title}
              </h4>
              <p style={{ fontSize: "13.5px", color: "#d1d5db", lineHeight: "1.4", margin: 0 }}>
                {activeTip.text}
              </p>
            </div>

          </div>

        </div>

      </div>
    </DashboardLayout>
  );
}

export default CarbonCalculator;
