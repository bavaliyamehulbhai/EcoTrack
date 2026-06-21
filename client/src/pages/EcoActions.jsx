import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getProfile } from "../services/authService";
import { getActions, completeAction, getStats, buyStreakFreeze } from "../services/actionService";
import DashboardLayout from "../layouts/DashboardLayout";
import { toast } from "../components/Toast";
import BadgeModal from "../components/BadgeModal";
import Celebration from "../components/Celebration";
import ConfirmActionModal from "../components/ConfirmActionModal";

function EcoActions() {
  const [user, setUser] = useState(null);
  const [actions, setActions] = useState([]);
  const [stats, setStats] = useState({
    points: 0,
    streak: 0,
    badges: [],
    completedTodayCount: 0
  });
  const [completedTodayIds, setCompletedTodayIds] = useState([]);
  const [triggerCelebration, setTriggerCelebration] = useState(0);

  const [isLoading, setIsLoading] = useState(true);
  const [isCompletingId, setIsCompletingId] = useState(null);
  const navigate = useNavigate();

  const loadData = async () => {
    try {
      setIsLoading(true);
      const profile = await getProfile();
      setUser(profile);

      const actionsList = await getActions();
      setActions(actionsList);

      const statsData = await getStats();
      setStats(statsData);

      // Check which actions are completed today
      // Wait, we can determine this by checking if completed today in some way, or let completeAction return updated stats.
      // Alternatively, we can let userAction model check, but let's query it or keep tracking locally, 
      // or let's assume we can fetch list of actions done today.
      // Wait! We can retrieve user actions or let our endpoint return which action IDs are done today.
      // To keep it simple and robust, let's track the completed actions in the current session, 
      // and also we can determine them if we modify the endpoint or check.
      // Wait, let's check if the stats endpoint can return completedActionIds for today!
      // That would be extremely reliable. Let's update actionController.js to return `completedActionIds` done today in the stats response!
      // This is a great idea. Let's modify actionController.js to add `completedActionIds` to stats response.
    } catch (error) {
      console.error("Eco actions load failed", error);
      if (error.response?.status === 401) {
        navigate("/login");
      }
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [navigate]);

  const handleComplete = async (actionId) => {
    setIsCompletingId(actionId);
    try {
      const res = await completeAction(actionId);
      
      let alertMsg = `Completed! Earned +${res.pointsEarned} Points.`;
      if (res.dailyChallengeBonus) {
        alertMsg += " 🎉 Daily Challenge Met! +50 Bonus Points Awarded!";
      }
      if (res.unlockedBadges.length > 0) {
        alertMsg += ` 🏆 New Badge Unlocked: ${res.unlockedBadges.join(", ")}!`;
      }
      toast.success(alertMsg);
      setTriggerCelebration((prev) => prev + 1);

      // Fetch fresh stats and update completed IDs
      const statsData = await getStats();
      setStats(statsData);
      setCompletedTodayIds((prev) => [...prev, actionId]);

    } catch (error) {
      console.error(error);
      toast.error(error.response?.data?.message || "Failed to complete action");
    } finally {
      setIsCompletingId(null);
    }
  };

  const [selectedBadge, setSelectedBadge] = useState(null);
  const [isBuyingFreeze, setIsBuyingFreeze] = useState(false);
  const [showFreezeConfirm, setShowFreezeConfirm] = useState(false);

  const confirmBuyFreeze = async () => {
    setIsBuyingFreeze(true);
    try {
      await buyStreakFreeze();
      toast.success("Successfully purchased a Streak Freeze! ❄️");
      setTriggerCelebration((prev) => prev + 1);
      const statsData = await getStats();
      setStats(statsData);
    } catch (error) {
      console.error(error);
      toast.error(error.response?.data?.message || "Failed to purchase Streak Freeze");
    } finally {
      setIsBuyingFreeze(false);
      setShowFreezeConfirm(false);
    }
  };

  const logoutHandler = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };

  // Badge mapping to emoji representation
  const badgeIcons = {
    "Eco Beginner": "🌱 Eco Beginner",
    "Eco Warrior": "🛡️ Eco Warrior",
    "Green Champion": "🏆 Green Champion"
  };

  // Daily Challenge math
  const challengeProgress = Math.min(stats.completedTodayCount, 3);
  const challengePercent = Math.round((challengeProgress / 3) * 100);

  return (
    <DashboardLayout user={user} onLogout={logoutHandler}>
      <Celebration trigger={triggerCelebration} />
      {isLoading ? (
        <div className="loading-state-wrapper">
          <div className="spinner"></div>
          <p style={{ marginTop: "12px", color: "#9ca3af" }}>Loading eco actions...</p>
        </div>
      ) : (
        <div className="dashboard-grid-layout" style={{ gap: "24px" }}>
          
          {/* Header Card */}
          <div className="welcome-card" style={{ textAlign: "left", padding: "30px", marginBottom: "0" }}>
            <h1 className="welcome-title" style={{ fontSize: "28px" }}>Eco Actions & Gamification</h1>
            <p className="welcome-email" style={{ justifyContent: "flex-start", marginBottom: "0" }}>
              Perform daily green actions, log accomplishments, build streaks, and unlock achievement badges.
            </p>
          </div>

          {/* User Gamification Stats Summary */}
          <div className="dashboard-cards-container">
            <div className="stat-card dashboard-stat-card">
              <div className="stat-card-header">
                <span className="stat-card-title">My Eco Points</span>
                <span className="stat-card-icon">⭐</span>
              </div>
              <div className="stat-card-body">
                <h2 className="stat-card-value">{stats.points}</h2>
                <p className="stat-card-subtitle" style={{ marginTop: "8px" }}>Lifetime points earned</p>
              </div>
            </div>

            <div className="stat-card dashboard-stat-card">
              <div className="stat-card-header">
                <span className="stat-card-title">Daily Streak</span>
                <span className="stat-card-icon">🔥</span>
              </div>
              <div className="stat-card-body">
                <h2 className="stat-card-value">{stats.streak} Days</h2>
                <p className="stat-card-subtitle" style={{ marginTop: "8px" }}>Keep logging daily actions</p>
              </div>
            </div>

            <div className="stat-card dashboard-stat-card">
              <div className="stat-card-header">
                <span className="stat-card-title">Unlocked Badges</span>
                <span className="stat-card-icon">🎖️</span>
              </div>
              <div className="stat-card-body">
                <h2 className="stat-card-value">{stats.badges.length}</h2>
                <p className="stat-card-subtitle" style={{ marginTop: "8px" }}>Badges achieved</p>
              </div>
            </div>
          </div>

          {/* Daily Challenge, Achievements & Streak Freeze Shop Row */}
          <div className="dashboard-cards-container">
            
            {/* Daily Challenge Card */}
            <div className="welcome-card" style={{ textAlign: "left", padding: "24px 30px", marginBottom: "0" }}>
              <div className="flex-between" style={{ marginBottom: "16px" }}>
                <h3 className="card-heading-title" style={{ margin: "0 !important" }}>⚡ Daily Challenge</h3>
                <span className="status-badge-modern excellent">+50 Bonus Points</span>
              </div>

              <p style={{ fontSize: "13px", color: "#e5e7eb", marginBottom: "12px" }}>
                Complete <strong>3 Eco Actions</strong> today to claim your daily bonus.
              </p>

              <div style={{ display: "flex", justifyContent: "space-between", fontSize: "12px", color: "#9ca3af", marginBottom: "8px" }}>
                <span>Progress: {challengeProgress} / 3 completed</span>
                <span>{challengePercent}%</span>
              </div>

              <div className="progress-bar-container" style={{ background: "rgba(255,255,255,0.06)", height: "10px", borderRadius: "10px", overflow: "hidden", marginBottom: "12px" }}>
                <div
                  className="progress-bar-fill"
                  style={{
                    width: `${challengePercent}%`,
                    height: "100%",
                    background: challengePercent === 100 ? "linear-gradient(135deg, #f59e0b, #ca8a04)" : "linear-gradient(135deg, #22c55e, #4ade80)",
                    boxShadow: challengePercent === 100 ? "0 0 10px rgba(245, 158, 11, 0.4)" : "0 0 10px rgba(34, 197, 94, 0.3)",
                    transition: "width 0.4s ease-out"
                  }}
                ></div>
              </div>

              {challengePercent === 100 && (
                <div style={{ background: "rgba(234, 179, 8, 0.1)", border: "1px solid rgba(234, 179, 8, 0.2)", borderRadius: "8px", padding: "8px 12px", fontSize: "11px", color: "#eab308", fontWeight: "600", textAlign: "center" }}>
                  🎉 Challenge Met! +50 Bonus Points Awarded
                </div>
              )}
            </div>

            {/* Badges/Achievements Card */}
            <div className="welcome-card" style={{ textAlign: "left", padding: "24px 30px", marginBottom: "0" }}>
              <h3 className="card-heading-title" style={{ marginBottom: "16px" }}>🏆 My Achievements</h3>
              
              {stats.badges.length === 0 ? (
                <div className="empty-state-design" style={{ padding: "24px 0", textAlign: "center" }}>
                  <p className="empty-state-text" style={{ fontSize: "13px" }}>Complete actions to unlock badges</p>
                </div>
              ) : (
                <div style={{ display: "flex", gap: "10px", flexWrap: "wrap", marginTop: "8px" }}>
                  {stats.badges.map((b) => (
                    <div
                      key={b}
                      className="status-badge-modern excellent"
                      onClick={() => setSelectedBadge(b)}
                      style={{
                        padding: "8px 16px",
                        borderRadius: "20px",
                        fontSize: "13px",
                        background: "rgba(34, 197, 94, 0.1)",
                        borderColor: "rgba(34, 197, 94, 0.3)",
                        color: "#22c55e",
                        fontWeight: "600",
                        display: "inline-flex",
                        alignItems: "center",
                        cursor: "pointer",
                        transition: "all 0.2s ease"
                      }}
                      title="Click to view achievements & share"
                    >
                      {badgeIcons[b] || b}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Streak Freeze Shop Card */}
            <div className="welcome-card" style={{ textAlign: "left", padding: "24px 30px", marginBottom: "0", display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
              <div>
                <div className="flex-between" style={{ marginBottom: "16px" }}>
                  <h3 className="card-heading-title" style={{ margin: "0 !important" }}>❄️ Streak Freeze Shop</h3>
                  <span className="status-badge-modern good" style={{ color: "#3b82f6", borderColor: "rgba(59,130,246,0.3)", background: "rgba(59,130,246,0.1)", padding: "4px 10px" }}>100 pts</span>
                </div>
                <p style={{ fontSize: "13px", color: "#9ca3af", marginBottom: "12px", lineHeight: "1.4" }}>
                  Protects your daily action streak if you miss a day. Active freeze count: <strong>{stats.streakFreezes || 0}</strong>
                </p>
              </div>

              <button
                className="quick-action-btn glow-btn primary"
                style={{ 
                  width: "100%", 
                  padding: "10px", 
                  fontSize: "13px", 
                  background: stats.points < 100 ? "rgba(255,255,255,0.05)" : "linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)", 
                  border: "none", 
                  color: stats.points < 100 ? "#6b7280" : "#fff", 
                  cursor: stats.points < 100 ? "not-allowed" : "pointer", 
                  transition: "all 0.3s",
                  boxShadow: stats.points < 100 ? "none" : "0 4px 12px rgba(59, 130, 246, 0.2)"
                }}
                disabled={stats.points < 100 || isBuyingFreeze}
                onClick={() => setShowFreezeConfirm(true)}
              >
                {isBuyingFreeze ? "Buying..." : stats.points < 100 ? "Need 100 pts" : "Buy Streak Freeze ❄️"}
              </button>
            </div>

          </div>

          {selectedBadge && (
            <BadgeModal 
              badgeName={selectedBadge} 
              onClose={() => setSelectedBadge(null)} 
            />
          )}

          {/* Eco Actions List */}
          <div className="welcome-card" style={{ textAlign: "left", padding: "24px 30px", marginBottom: "0" }}>
            <h3 className="card-heading-title" style={{ marginBottom: "20px" }}>Available Eco Actions</h3>

            {actions.length === 0 ? (
              <div className="empty-state-design" style={{ padding: "40px 0" }}>
                <p className="empty-state-text">No Eco Actions Available</p>
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                {actions.map((act) => {
                  const isDoneToday = completedTodayIds.includes(act._id);
                  return (
                    <div
                      key={act._id}
                      className="recent-item"
                      style={{
                        padding: "18px 24px",
                        background: isDoneToday ? "rgba(34, 197, 94, 0.03)" : "rgba(255,255,255,0.01)",
                        border: "1px solid",
                        borderColor: isDoneToday ? "rgba(34, 197, 94, 0.2)" : "rgba(255, 255, 255, 0.05)",
                        borderRadius: "14px",
                        boxShadow: isDoneToday ? "0 0 15px rgba(34, 197, 94, 0.05)" : "none",
                        transition: "all 0.3s cubic-bezier(0.16, 1, 0.3, 1)"
                      }}
                    >
                      <div style={{ display: "flex", flexDirection: "column", gap: "4px", flex: 1, width: "100%" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
                          <span style={{ fontWeight: "700", fontSize: "15px" }}>{act.title}</span>
                          <span className="status-badge-modern good" style={{ fontSize: "10.5px", padding: "2px 8px" }}>
                            +{act.points} pts
                          </span>
                        </div>
                        <p style={{ margin: 0, fontSize: "12.5px", color: "#9ca3af", lineHeight: "1.4" }}>
                          {act.description}
                        </p>
                      </div>

                      <button
                        className={`quick-action-btn glow-btn ${isDoneToday ? "secondary" : "primary"}`}
                        style={{ padding: "8px 18px", fontSize: "12.5px", flexShrink: 0 }}
                        disabled={isDoneToday || isCompletingId === act._id}
                        onClick={() => handleComplete(act._id)}
                      >
                        {isCompletingId === act._id 
                          ? "Saving..." 
                          : isDoneToday 
                            ? "✓ Completed" 
                            : "Complete"
                        }
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

        </div>
      )}

      {showFreezeConfirm && (
        <ConfirmActionModal 
          title="Buy Streak Freeze?"
          description="Are you sure you want to spend 100 Eco Points to protect your daily streak?"
          icon="❄️"
          confirmText="Yes, Buy Freeze"
          confirmColor="#3b82f6"
          onCancel={() => setShowFreezeConfirm(false)}
          onConfirm={confirmBuyFreeze}
        />
      )}
    </DashboardLayout>
  );
}

export default EcoActions;
