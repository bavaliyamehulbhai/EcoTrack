import Goal from "../models/Goal.js";
import CarbonRecord from "../models/CarbonRecord.js";
import { createNotification } from "../utils/notificationHelper.js";
import asyncHandler from "express-async-handler";

// POST /api/goals
export const createGoal = asyncHandler(async (req, res) => {
  const goal = await Goal.create({
    userId: req.user.id,
    title: req.body.title,
    targetCarbon: req.body.targetCarbon,
    deadline: req.body.deadline,
    status: "Active"
  });

  // Fire auto notification
  await createNotification(
    req.user.id,
    "🎯 Goal Created",
    `Target goal "${req.body.title}" set successfully with a limit of ${req.body.targetCarbon} kg CO₂.`
  );

  res.status(201).json(goal);
});

// GET /api/goals
export const getGoals = asyncHandler(async (req, res) => {
  const goals = await Goal.find({
    userId: req.user.id
  }).sort({
    createdAt: -1
  }).lean();

  res.json(goals);
});

// PUT /api/goals/:id
export const updateGoal = asyncHandler(async (req, res) => {
  const goal = await Goal.findById(req.params.id);

  if (!goal) {
    return res.status(404).json({
      message: "Goal Not Found"
    });
  }

  goal.title = req.body.title;
  goal.targetCarbon = req.body.targetCarbon;
  goal.deadline = req.body.deadline;

  await goal.save();

  res.json(goal);
});

// DELETE /api/goals/:id
export const deleteGoal = asyncHandler(async (req, res) => {
  const goal = await Goal.findById(req.params.id);

  if (!goal) {
    return res.status(404).json({
      message: "Goal Not Found"
    });
  }

  await goal.deleteOne();

  res.json({
    message: "Goal Deleted"
  });
});

// GET /api/goals/analytics
export const getGoalAnalytics = asyncHandler(async (req, res) => {
  const latestRecord = await CarbonRecord.findOne({
    userId: req.user.id
  }).sort({
    createdAt: -1
  });

  const goal = await Goal.findOne({
    userId: req.user.id,
    status: "Active"
  }).sort({
    createdAt: -1
  });

  if (!goal) {
    return res.json(null);
  }

  const latestCarbon = latestRecord ? latestRecord.totalCarbon : 0;
  
  // Formula: progress = (goal.targetCarbon / latestRecord.totalCarbon) * 100;
  let progress = 0;
  if (latestCarbon > 0) {
    progress = Math.round((goal.targetCarbon / latestCarbon) * 100);
  }

  const daysRemaining = Math.ceil(
    (new Date(goal.deadline) - Date.now()) / (1000 * 60 * 60 * 24)
  );

  res.json({
    currentCarbon: latestCarbon,
    targetCarbon: goal.targetCarbon,
    progress: Math.min(progress, 100),
    daysRemaining: daysRemaining > 0 ? daysRemaining : 0
  });
});
