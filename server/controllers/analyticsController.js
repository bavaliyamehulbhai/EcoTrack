import CarbonRecord from "../models/CarbonRecord.js";
import asyncHandler from "express-async-handler";

// GET /api/analytics/category
export const getCategoryAnalytics = asyncHandler(async (req, res) => {
  const records = await CarbonRecord.find({ userId: req.user.id });

  const analytics = {
    transport: 0,
    electricity: 0,
    food: 0,
    waste: 0,
    water: 0
  };

  records.forEach((record) => {
    analytics.transport += record.transport || 0;
    analytics.electricity += record.electricity || 0;
    analytics.food += record.food || 0;
    analytics.waste += record.waste || 0;
    analytics.water += record.water || 0;
  });

  res.json(analytics);
});

// GET /api/analytics/trend
export const getTrendAnalytics = asyncHandler(async (req, res) => {
  // Return last 10 records chronologically (oldest first)
  const records = await CarbonRecord.find({ userId: req.user.id })
    .sort({ createdAt: 1 })
    .limit(10);

  const trend = records.map((record) => ({
    date: record.createdAt.toISOString().split("T")[0],
    carbon: record.totalCarbon
  }));

  res.json(trend);
});

// GET /api/analytics/monthly
export const getMonthlyAnalytics = asyncHandler(async (req, res) => {
  const records = await CarbonRecord.find({ userId: req.user.id });

  // Group by month name (e.g. "Jan", "Feb")
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const monthlySum = {};

  months.forEach((m) => {
    monthlySum[m] = 0;
  });

  records.forEach((record) => {
    const date = new Date(record.createdAt);
    const monthName = months[date.getMonth()];
    monthlySum[monthName] += record.totalCarbon || 0;
  });

  // Map to array format requested
  const response = months.map((m) => ({
    month: m,
    carbon: monthlySum[m]
  }));

  res.json(response);
});
