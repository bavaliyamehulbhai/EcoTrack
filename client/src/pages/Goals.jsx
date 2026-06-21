import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import {
  createGoal,
  getGoals,
  updateGoal,
  deleteGoal,
  getGoalAnalytics
} from "../services/goalService";
import DashboardLayout from "../layouts/DashboardLayout";
import { toast } from "../components/Toast";
import Celebration from "../components/Celebration";
import ConfirmActionModal from "../components/ConfirmActionModal";

function Goals() {
  const { user } = useAuth();
  const [goals, setGoals] = useState([]);
  const [analytics, setAnalytics] = useState(null);
  
  // Form states
  const [title, setTitle] = useState("");
  const [targetCarbon, setTargetCarbon] = useState("");
  const [deadline, setDeadline] = useState("");
  
  // Editing state
  const [editingId, setEditingId] = useState(null);
  const [deleteGoalId, setDeleteGoalId] = useState(null);

  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [triggerCelebration, setTriggerCelebration] = useState(0);
  const navigate = useNavigate();

  const loadData = async () => {
    try {
      setIsLoading(true);
      const goalsList = await getGoals();
      setGoals(goalsList);

      const analyticsData = await getGoalAnalytics();
      setAnalytics(analyticsData);
    } catch (error) {
      console.error("Goals load failed", error);
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title || !targetCarbon || !deadline) return;

    setIsSubmitting(true);
    try {
      if (editingId) {
        // Update Goal
        await updateGoal(editingId, { title, targetCarbon: Number(targetCarbon), deadline });
        toast.success("Goal updated successfully!");
        setTriggerCelebration((prev) => prev + 1);
        setEditingId(null);
      } else {
        // Create Goal
        await createGoal({ title, targetCarbon: Number(targetCarbon), deadline });
        toast.success("Goal set successfully!");
        setTriggerCelebration((prev) => prev + 1);
      }
      // Reset Form
      setTitle("");
      setTargetCarbon("");
      setDeadline("");
      loadData();
    } catch (error) {
      console.error(error);
      toast.error(error.response?.data?.message || "Failed to save goal");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEdit = (goal) => {
    setEditingId(goal._id);
    setTitle(goal.title);
    setTargetCarbon(goal.targetCarbon);
    // Format date string to YYYY-MM-DD
    setDeadline(new Date(goal.deadline).toISOString().split("T")[0]);
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setTitle("");
    setTargetCarbon("");
    setDeadline("");
  };

  const confirmDelete = async () => {
    if (!deleteGoalId) return;
    try {
      await deleteGoal(deleteGoalId);
      toast.success("Goal deleted successfully!");
      setDeleteGoalId(null);
      loadData();
    } catch (error) {
      console.error(error);
      toast.error(error.response?.data?.message || "Failed to delete goal");
      setDeleteGoalId(null);
    }
  };

  const logoutHandler = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };

  const formatDate = (dateStr) => {
    const options = { day: "numeric", month: "short", year: "numeric" };
    return new Date(dateStr).toLocaleDateString(undefined, options);
  };

  // Phase 18: Goal Achievement Status Badge logic
  const getGoalStatusLabel = (progress) => {
    if (progress >= 80) return { label: "Excellent", class: "excellent" };
    if (progress >= 50) return { label: "Good", class: "good" };
    return { label: "Needs Improvement", class: "high" };
  };

  const completedGoals = goals.filter((g) => g.status === "completed").length;

  return (
    <DashboardLayout>
      <Celebration trigger={triggerCelebration} />
      {isLoading ? (
        <div className="loading-state-wrapper">
          <div className="spinner"></div>
          <p style={{ marginTop: "12px", color: "#9ca3af" }}>Loading goals module...</p>
        </div>
      ) : (
        <div className="dashboard-grid-layout" style={{ gap: "24px" }}>
          
          {/* Header Card */}
          <div className="welcome-card" style={{ textAlign: "left", padding: "30px", marginBottom: "0" }}>
            <h1 className="welcome-title" style={{ fontSize: "28px" }}>Emission Target Goals</h1>
            <p className="welcome-email" style={{ justifyContent: "flex-start", marginBottom: "0" }}>
              Define caps for carbon footprints, track daily accomplishments, and maintain reduction metrics.
            </p>
          </div>

          {/* Goal Analytics Summary */}
          {analytics && (
            <div className="dashboard-cards-container">
              <div className="stat-card dashboard-stat-card">
                <div className="stat-card-header">
                  <span className="stat-card-title">Goal Progress</span>
                  <span className="stat-card-icon">🎯</span>
                </div>
                <div className="stat-card-body">
                  <h2 className="stat-card-value">{analytics.progress}%</h2>
                  <div className="progress-bar-container" style={{ background: "rgba(255,255,255,0.06)", height: "8px", borderRadius: "10px", overflow: "hidden", marginTop: "8px" }}>
                    <div
                      className="progress-bar-fill"
                      style={{
                        width: `${analytics.progress}%`,
                        height: "100%",
                        background: "linear-gradient(135deg, #22c55e, #16a34a)",
                        transition: "width 0.4s ease-out"
                      }}
                    ></div>
                  </div>
                </div>
              </div>

              <div className="stat-card dashboard-stat-card">
                <div className="stat-card-header">
                  <span className="stat-card-title">Days Remaining</span>
                  <span className="stat-card-icon">⏳</span>
                </div>
                <div className="stat-card-body">
                  <h2 className="stat-card-value">{analytics.daysRemaining} Days</h2>
                  <p className="stat-card-subtitle" style={{ marginTop: "8px" }}>To deadline</p>
                </div>
              </div>

              <div className="stat-card dashboard-stat-card">
                <div className="stat-card-header">
                  <span className="stat-card-title">Current Carbon</span>
                  <span className="stat-card-icon">🌱</span>
                </div>
                <div className="stat-card-body">
                  <h2 className="stat-card-value">{analytics.currentCarbon?.toFixed(1)} kg</h2>
                  <p className="stat-card-subtitle" style={{ marginTop: "8px" }}>Latest assessment</p>
                </div>
              </div>

              <div className="stat-card dashboard-stat-card">
                <div className="stat-card-header">
                  <span className="stat-card-title">Target Carbon</span>
                  <span className="stat-card-icon">🏁</span>
                </div>
                <div className="stat-card-body">
                  <h2 className="stat-card-value">{analytics.targetCarbon?.toFixed(0)} kg</h2>
                  <p className="stat-card-subtitle" style={{ marginTop: "8px" }}>Goal limit</p>
                </div>
              </div>
            </div>
          )}

          {/* Form & Listing Layout */}
          <div className="dashboard-subgrid" style={{ gridTemplateColumns: "repeat(8, 1fr)" }}>
            
            {/* Form Column (span 3) */}
            <div style={{ gridColumn: "span 3", display: "flex", flexDirection: "column", gap: "24px" }}>
              <div className="welcome-card" style={{ textAlign: "left", padding: "24px 30px", marginBottom: "0" }}>
                <h3 className="card-heading-title" style={{ marginBottom: "20px" }}>
                  {editingId ? "✏️ Edit Target Goal" : "➕ Create Target Goal"}
                </h3>
                
                <form onSubmit={handleSubmit} className="auth-form">
                  <div className="form-group">
                    <label htmlFor="goal-title">Goal Title</label>
                    <input
                      id="goal-title"
                      type="text"
                      placeholder="e.g. Reduce emissions"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="goal-target">Target Limit (kg CO₂)</label>
                    <input
                      id="goal-target"
                      type="number"
                      min="1"
                      placeholder="e.g. 20"
                      value={targetCarbon}
                      onChange={(e) => setTargetCarbon(e.target.value)}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="goal-deadline">Deadline</label>
                    <input
                      id="goal-deadline"
                      type="date"
                      value={deadline}
                      min={new Date().toISOString().split("T")[0]}
                      onChange={(e) => setDeadline(e.target.value)}
                      style={{
                        padding: "12px 16px",
                        borderRadius: "10px",
                        border: "1px solid var(--border)",
                        background: "var(--code-bg)",
                        color: "var(--text-h)",
                        fontSize: "15px",
                        fontFamily: "inherit"
                      }}
                      required
                    />
                  </div>

                  <div style={{ display: "flex", gap: "10px", marginTop: "10px" }}>
                    <button type="submit" className="auth-btn" disabled={isSubmitting} style={{ flex: 1 }}>
                      {isSubmitting ? "Saving..." : editingId ? "Save Changes" : "Create Goal"}
                    </button>
                    {editingId && (
                      <button type="button" className="logout-btn" onClick={handleCancelEdit} style={{ background: "var(--code-bg)", border: "1px solid var(--border)", color: "var(--text-h)" }}>
                        Cancel
                      </button>
                    )}
                  </div>
                </form>
              </div>
            </div>

            {/* List Column (span 5) */}
            <div style={{ gridColumn: "span 5", display: "flex", flexDirection: "column", gap: "24px" }}>
              <div className="welcome-card" style={{ textAlign: "left", padding: "24px 30px", marginBottom: "0" }}>
                <h3 className="card-heading-title" style={{ marginBottom: "20px" }}>Active & Past Goals</h3>

                {goals.length === 0 ? (
                  <div className="empty-state-design" style={{ padding: "40px 0" }}>
                    <span className="empty-state-icon">🎯</span>
                    <p className="empty-state-text" style={{ marginBottom: "16px" }}>No Goals Created Yet</p>
                    <button className="quick-action-btn primary" onClick={() => document.getElementById("goal-title").focus()}>
                      Create Goal
                    </button>
                  </div>
                ) : (
                  <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                    {goals.map((g) => {
                      const currentVal = analytics?.currentCarbon || 0;
                      const computedProgress = currentVal > 0 
                        ? Math.min(100, Math.round((g.targetCarbon / currentVal) * 100)) 
                        : 0;
                      const statusRating = getGoalStatusLabel(computedProgress);

                      return (
                        <div
                          key={g._id}
                          className="recent-item"
                          style={{
                            flexDirection: "column",
                            alignItems: "stretch",
                            gap: "12px",
                            padding: "16px 20px"
                          }}
                        >
                          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "start" }}>
                            <div>
                              <h4 style={{ margin: "0 0 4px 0", fontSize: "15.5px", fontWeight: "700", color: "var(--text-h)" }}>{g.title}</h4>
                              <span style={{ fontSize: "12px", color: "#6b7280" }}>
                                📅 Deadline: {formatDate(g.deadline)}
                              </span>
                            </div>
                            <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
                              <span className={`status-badge-modern ${g.status === "Active" ? "excellent" : "good"}`} style={{ fontSize: "10px" }}>
                                {g.status}
                              </span>
                              {g.status === "Active" && (
                                <span className={`status-badge-modern ${statusRating.class}`} style={{ fontSize: "10px" }}>
                                  {statusRating.label}
                                </span>
                              )}
                            </div>
                          </div>

                          {/* Progress display for Active Goals */}
                          {g.status === "Active" && (
                            <div style={{ display: "flex", flexDirection: "column", gap: "10px", marginTop: "4px" }}>
                              <div style={{ background: "var(--subcard-bg)", border: "1px solid var(--subcard-border)", borderRadius: "10px", padding: "12px 14px" }}>
                                <div style={{ display: "flex", justifyContent: "space-between", fontSize: "12.5px", color: "#9ca3af", marginBottom: "6px" }}>
                                  <span>Target Limit: <strong style={{ color: "#3b82f6" }}>{g.targetCarbon} kg</strong></span>
                                  <span>Current Footprint: <strong style={{ color: currentVal > g.targetCarbon ? "#ef4444" : "#22c55e" }}>{currentVal.toFixed(1)} kg</strong></span>
                                  <span>Ratio: <strong>{computedProgress}%</strong></span>
                                </div>
                                <div style={{ background: "rgba(255,255,255,0.06)", height: "8px", borderRadius: "10px", overflow: "hidden" }}>
                                  <div
                                    style={{
                                      width: `${Math.min(100, computedProgress)}%`,
                                      height: "100%",
                                      background: currentVal > g.targetCarbon 
                                        ? "linear-gradient(135deg, #ef4444, #dc2626)" 
                                        : "linear-gradient(135deg, #22c55e, #16a34a)",
                                      transition: "width 0.4s ease-out"
                                    }}
                                  ></div>
                                </div>
                              </div>

                              {currentVal > g.targetCarbon ? (
                                <div className="pulsing-warning-ring" style={{ background: "rgba(239, 68, 68, 0.05)", border: "1px solid rgba(239, 68, 68, 0.4)", borderRadius: "10px", padding: "10px 14px", color: "#f87171", fontSize: "12px", display: "flex", gap: "8px", alignItems: "center" }}>
                                  <span>⚠️</span>
                                  <span><strong>Target Exceeded:</strong> Swapping vehicle travel for walking/cycling is highly recommended to reduce footprint under your limit.</span>
                                </div>
                              ) : (
                                <div style={{ background: "rgba(34, 197, 94, 0.04)", border: "1px solid rgba(34, 197, 94, 0.15)", borderRadius: "10px", padding: "10px 14px", color: "#4ade80", fontSize: "12px", display: "flex", gap: "8px", alignItems: "center" }}>
                                  <span>🛡️</span>
                                  <span><strong>Safe Standings:</strong> You are currently maintaining carbon emissions within your target cap. Great job!</span>
                                </div>
                              )}
                            </div>
                          )}

                          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderTop: "1px solid rgba(255,255,255,0.04)", paddingTop: "10px", marginTop: "4px" }}>
                            {g.status !== "Active" ? (
                              <span style={{ fontSize: "13px", color: "#6b7280" }}>
                                Target Limit: <strong>{g.targetCarbon} kg</strong>
                              </span>
                            ) : (
                              <span></span>
                            )}
                            
                            <div style={{ display: "flex", gap: "10px" }}>
                              <button
                                className="quick-action-btn secondary"
                                style={{ padding: "6px 12px", fontSize: "12px" }}
                                onClick={() => handleEdit(g)}
                              >
                                ✏️ Edit
                              </button>
                              <button
                                className="logout-btn"
                                style={{ padding: "6px 12px", fontSize: "12px", borderRadius: "8px" }}
                                onClick={() => setDeleteGoalId(g._id)}
                              >
                                🗑️ Delete
                              </button>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>

          </div>

        </div>
      )}

      {deleteGoalId && (
        <ConfirmActionModal 
          title="Delete Target Goal?"
          description="Are you sure you want to delete this goal? This action cannot be undone and will remove it from your analytics."
          icon="🗑️"
          confirmText="Yes, Delete"
          confirmColor="#ef4444"
          onCancel={() => setDeleteGoalId(null)}
          onConfirm={confirmDelete}
        />
      )}
    </DashboardLayout>
  );
}

export default Goals;
