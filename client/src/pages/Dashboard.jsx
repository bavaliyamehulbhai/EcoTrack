import { useState, useMemo } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "../context/AuthContext";
import { getDashboardData, getCarbonHistory } from "../services/carbonService";
import {
  getCategoryAnalytics,
  getTrendAnalytics,
  getMonthlyAnalytics
} from "../services/analyticsService";
import { getGoalAnalytics } from "../services/goalService";
import { getStats } from "../services/actionService";
import { getTopUsers } from "../services/leaderboardService";
import { getReportsSummary } from "../services/reportService";

import DashboardLayout from "../layouts/DashboardLayout";
import DashboardCard from "../components/DashboardCard";
import RecentRecords from "../components/RecentRecords";
import ProfileCard from "../components/ProfileCard";
import PieAnalytics from "../components/PieAnalytics";
import LineAnalytics from "../components/LineAnalytics";
import BarAnalytics from "../components/BarAnalytics";
import InsightsCard from "../components/InsightsCard";
import { Skeleton, SkeletonCard } from "../components/Skeleton";
import QuickActions from "../components/QuickActions";
import ActiveGoalCard from "../components/ActiveGoalCard";
import TopContributors from "../components/TopContributors";

function Dashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();

  // Analytics Filter (last 7, 30, or 365 days)
  const [filterDays, setFilterDays] = useState(30);

  const { data: stats = { totalRecords: 0, totalCarbon: 0, avgCarbon: 0 }, isLoading: isStatsLoading, error: queryError } = useQuery({ queryKey: ["dashboardData"], queryFn: getDashboardData, retry: false });
  const { data: history = [], isLoading: isHistoryLoading } = useQuery({ queryKey: ["carbonHistory"], queryFn: getCarbonHistory });
  const { data: categoryData, isLoading: isCategoryLoading } = useQuery({ queryKey: ["categoryAnalytics"], queryFn: getCategoryAnalytics });
  const { data: trendData = [], isLoading: isTrendLoading } = useQuery({ queryKey: ["trendAnalytics"], queryFn: getTrendAnalytics });
  const { data: monthlyData = [], isLoading: isMonthlyLoading } = useQuery({ queryKey: ["monthlyAnalytics"], queryFn: getMonthlyAnalytics });
  const { data: goalAnalytics, isLoading: isGoalLoading } = useQuery({ queryKey: ["goalAnalytics"], queryFn: getGoalAnalytics });
  const { data: userStats = { points: 0, streak: 0, badges: [], completedTodayCount: 0 }, isLoading: isUserStatsLoading } = useQuery({ queryKey: ["userStats"], queryFn: getStats });
  const { data: topUsers = [], isLoading: isTopUsersLoading } = useQuery({ queryKey: ["topUsers"], queryFn: getTopUsers });
  const { data: reportSummary, isLoading: isReportSummaryLoading } = useQuery({ queryKey: ["reportSummary"], queryFn: getReportsSummary });

  const isLoading = isStatsLoading || isHistoryLoading || isCategoryLoading || isTrendLoading || isMonthlyLoading || isGoalLoading || isUserStatsLoading || isTopUsersLoading || isReportSummaryLoading;
  
  if (queryError?.response?.status === 401) {
    localStorage.removeItem("token");
    navigate("/login");
  }

  const error = queryError ? "Failed to load analytics dashboard. Please try again." : null;

  // Phase 16: Carbon Health Score
  const healthScore = stats.totalCarbon > 0
    ? Math.max(0, Math.min(100, Math.round(100 - (stats.totalCarbon / 5))))
    : 100;

  const getHealthBadge = (scoreVal) => {
    if (scoreVal >= 80) return { label: "Excellent", class: "up" };
    if (scoreVal >= 60) return { label: "Good", class: "up" };
    if (scoreVal >= 40) return { label: "Moderate", class: "down" };
    return { label: "High Risk", class: "down" };
  };

  const healthBadge = getHealthBadge(healthScore);

  // Dynamic calculations based on filters
  const getPeriodsData = (days) => {
    const now = new Date();
    const cutoffCurrent = new Date(now.getTime() - days * 24 * 60 * 60 * 1000);
    const cutoffPrevious = new Date(now.getTime() - 2 * days * 24 * 60 * 60 * 1000);
    
    const currentPeriod = history.filter((r) => {
      const d = new Date(r.createdAt);
      return d >= cutoffCurrent;
    });
    
    const previousPeriod = history.filter((r) => {
      const d = new Date(r.createdAt);
      return d >= cutoffPrevious && d < cutoffCurrent;
    });
    
    return { currentPeriod, previousPeriod };
  };

  const calculateTrend = (current, previous, isCarbon = false) => {
    if (history.length === 0) return { label: "", type: "" };
    
    if (previous === 0) {
      if (current > 0) {
        return {
          label: isCarbon ? "First entry recorded" : "+100% from last period",
          type: "up"
        };
      }
      return { label: "", type: "" };
    }
    
    const diff = ((current - previous) / previous) * 100;
    const absDiff = Math.abs(diff).toFixed(0);
    
    if (diff < 0) {
      return {
        label: isCarbon ? `↓ ${absDiff}% reduction` : `↓ ${absDiff}% from last period`,
        type: "down"
      };
    } else if (diff > 0) {
      return {
        label: isCarbon ? `↑ ${absDiff}% increase` : `+${absDiff}% from last period`,
        type: isCarbon ? "increasing" : "up"
      };
    } else {
      return {
        label: "Stable",
        type: "stable"
      };
    }
  };

  const { currentPeriod, previousPeriod } = useMemo(() => getPeriodsData(filterDays), [history, filterDays]);

  const { recordsTrend, carbonTrend, avgTrend, carbonReductionPercent } = useMemo(() => {
    const currentCount = currentPeriod.length;
    const previousCount = previousPeriod.length;
    const recTrend = calculateTrend(currentCount, previousCount);

    const currentCarbonSum = currentPeriod.reduce((sum, r) => sum + r.totalCarbon, 0);
    const previousCarbonSum = previousPeriod.reduce((sum, r) => sum + r.totalCarbon, 0);
    const carbTrend = calculateTrend(currentCarbonSum, previousCarbonSum, true);

    const currentAvg = currentCount > 0 ? currentCarbonSum / currentCount : 0;
    const previousAvg = previousCount > 0 ? previousCarbonSum / previousCount : 0;
    const averageTrend = calculateTrend(currentAvg, previousAvg, true);

    const reductionPercent = previousCarbonSum > currentCarbonSum && previousCarbonSum > 0
      ? Math.round(((previousCarbonSum - currentCarbonSum) / previousCarbonSum) * 100)
      : 0;

    return {
      recordsTrend: recTrend,
      carbonTrend: carbTrend,
      avgTrend: averageTrend,
      carbonReductionPercent: reductionPercent
    };
  }, [currentPeriod, previousPeriod, history.length]);

  const filteredHistory = useMemo(() => {
    const cutoff = new Date(new Date().getTime() - filterDays * 24 * 60 * 60 * 1000);
    return history.filter(r => new Date(r.createdAt) >= cutoff);
  }, [history, filterDays]);

  const challengeRate = useMemo(() => Math.min(100, Math.round(((userStats.completedTodayCount || 0) / 3) * 100)), [userStats.completedTodayCount]);

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="dashboard-grid-layout" style={{ gap: "24px" }}>
          <div>
            <Skeleton width="180px" height="26px" />
            <Skeleton width="260px" height="14px" margin="6px 0 0 0" />
          </div>
          <div className="dashboard-cards-container">
            <SkeletonCard />
            <SkeletonCard />
            <SkeletonCard />
            <SkeletonCard />
          </div>
          <div className="analytics-section-row">
            <div className="welcome-card" style={{ height: "260px", marginBottom: "0" }}>
              <Skeleton width="130px" height="18px" />
              <Skeleton width="100%" height="150px" margin="16px 0 0 0" />
            </div>
            <div className="welcome-card" style={{ height: "260px", marginBottom: "0" }}>
              <Skeleton width="130px" height="18px" />
              <Skeleton width="100%" height="150px" margin="16px 0 0 0" />
            </div>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="dashboard-grid-layout" style={{ gap: "24px" }}>
        
        {/* Filter Toolbar & Advanced Analytics */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "12px" }}>
          <div>
            <h2 style={{ fontSize: "22px", fontWeight: "700", margin: 0 }}>Overview Dashboard</h2>
            <div style={{ display: "flex", gap: "12px", flexWrap: "wrap", marginTop: "4px" }}>
              <span style={{ fontSize: "12px", color: "#9ca3af", background: "rgba(34,197,94,0.06)", padding: "2px 8px", borderRadius: "6px" }}>
                📉 Carbon Reduction Rate: <strong>{carbonReductionPercent}%</strong>
              </span>
              <span style={{ fontSize: "12px", color: "#9ca3af", background: "rgba(59,130,246,0.06)", padding: "2px 8px", borderRadius: "6px" }}>
                ⚡ Challenge Completion: <strong>{challengeRate}%</strong>
              </span>
            </div>
          </div>
          
          <div className="filter-dropdown-container">
            <span style={{ fontSize: "13px", color: "#6b7280", marginRight: "8px" }}>Show:</span>
            <select
              value={filterDays}
              onChange={(e) => setFilterDays(Number(e.target.value))}
              style={{
                padding: "8px 12px",
                borderRadius: "8px",
                border: "1px solid var(--border)",
                background: "var(--code-bg)",
                color: "var(--text-h)",
                fontSize: "13px",
                fontFamily: "inherit",
                cursor: "pointer",
                outline: "none"
              }}
            >
              <option value="7">Last 7 Days</option>
              <option value="30">Last 30 Days</option>
              <option value="365">Last Year</option>
            </select>
          </div>
        </div>

        {/* Row 1: Primary Metrics Cards Section */}
        <div className="dashboard-cards-container" style={{ gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))" }}>
          <DashboardCard
            title="Total Records"
            value={stats.totalRecords}
            icon="📊"
            subtitle="Calculations saved"
            trend={recordsTrend.label}
            trendType={recordsTrend.type}
            theme="blue"
          />
          <DashboardCard
            title="Total Carbon"
            value={`${stats.totalCarbon?.toFixed(1)} kg`}
            icon="🌱"
            subtitle="Lifetime footprint"
            trend={carbonTrend.label}
            trendType={carbonTrend.type}
            theme="green"
          />
          <DashboardCard
            title="Average Carbon"
            value={`${stats.avgCarbon?.toFixed(1)} kg`}
            icon="⚖️"
            subtitle="Per calculation"
            trend={avgTrend.label}
            trendType={avgTrend.type}
            theme="blue"
          />
          <DashboardCard
            title="Carbon Health Score"
            value={`${healthScore}/100`}
            icon="🏆"
            isCircular={true}
            score={healthScore}
            trend={healthBadge.label}
            trendType={healthBadge.class}
            theme="green"
          />
        </div>

        {/* Row 2: Gamification & Goals Section */}
        <div className="dashboard-cards-container" style={{ gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))" }}>
          <DashboardCard
            title="Goal Progress"
            value={goalAnalytics ? `${goalAnalytics.progress}%` : "—"}
            icon="🎯"
            subtitle={goalAnalytics ? `Target: ${goalAnalytics.targetCarbon} kg` : "No active goal"}
            trend={goalAnalytics ? `${goalAnalytics.daysRemaining} days left` : ""}
            trendType={goalAnalytics ? "up" : ""}
            theme="blue"
          />
          <DashboardCard
            title="Eco Points"
            value={userStats.points}
            icon="⭐"
            subtitle="Lifetime points"
            trend={userStats.badges.length > 0 ? `🏆 ${userStats.badges.length} Badges` : "No badges"}
            trendType="up"
            theme="accent"
          />
          <DashboardCard
            title="Daily Streak"
            value={`${userStats.streak} Days`}
            icon="🔥"
            subtitle="Check-in streak"
            trend={userStats.streak > 0 ? "Keep it up!" : "Start checking in"}
            trendType="up"
            theme="orange"
          />
        </div>

        {/* Quick Actions Panel */}
        <QuickActions />

        {/* Row 2: Active Goal Section (Day 5 Integration) */}
        <ActiveGoalCard goalAnalytics={goalAnalytics} />

        {/* Row 3: Charts Grid (Pie & Line) */}
        <div className="analytics-section-row">
          <PieAnalytics data={categoryData} />
          <LineAnalytics trendData={trendData} />
        </div>

        {/* Row 4: Monthly Bar Chart */}
        <div className="analytics-section-row" style={{ gridTemplateColumns: "1fr" }}>
          <BarAnalytics monthlyData={monthlyData} />
        </div>

        {/* Row 5: Top Contributors & Insights */}
        <div className="analytics-section-row">
          <TopContributors topUsers={topUsers} />
          <InsightsCard categoryData={categoryData} />
        </div>

        {/* Row 6: Recent Records + Profile Section */}
        <div className="dashboard-subgrid">
          <div className="recent-records-section">
            <RecentRecords records={filteredHistory} />
          </div>
          <div className="profile-section-card">
            <ProfileCard user={user} />
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}

export default Dashboard;
