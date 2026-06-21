import User from "../models/User.js";
import UserAction from "../models/UserAction.js";
import Goal from "../models/Goal.js";
import asyncHandler from "express-async-handler";

// GET /api/leaderboard
export const getLeaderboard = asyncHandler(async (req, res) => {
  const users = await User.find()
    .select("name points streak badges role")
    .sort({ points: -1 });

  const rankedUsers = users.map((user, index) => ({
    rank: index + 1,
    _id: user._id,
    name: user.name,
    points: user.points || 0,
    streak: user.streak || 0,
    badges: user.badges || [],
    role: user.role
  }));

  res.json(rankedUsers);
});

// GET /api/leaderboard/top
export const getTopUsers = asyncHandler(async (req, res) => {
  const users = await User.find()
    .select("name points streak badges")
    .sort({ points: -1 })
    .limit(3);

  const rankedTop = users.map((user, index) => ({
    rank: index + 1,
    _id: user._id,
    name: user.name,
    points: user.points || 0,
    streak: user.streak || 0,
    badges: user.badges || []
  }));

  res.json(rankedTop);
});

// GET /api/leaderboard/my-rank
export const getMyRank = asyncHandler(async (req, res) => {
  const users = await User.find().sort({ points: -1 });
  
  const index = users.findIndex(u => u._id.toString() === req.user.id.toString());
  const rank = index !== -1 ? index + 1 : null;
  const currentUser = index !== -1 ? users[index] : null;

  if (!currentUser) {
    return res.status(404).json({ message: "User not found" });
  }

  // Points needed for next rank
  let pointsNeededForNextRank = 0;
  if (index > 0) {
    const nextUser = users[index - 1];
    pointsNeededForNextRank = (nextUser.points || 0) - (currentUser.points || 0);
  }

  res.json({
    rank,
    points: currentUser.points || 0,
    pointsNeededForNextRank
  });
});

// GET /api/community/stats
export const getCommunityStats = asyncHandler(async (req, res) => {
  const totalUsers = await User.countDocuments();
  const totalActions = await UserAction.countDocuments();
  const totalGoals = await Goal.countDocuments();

  const users = await User.find().select("points");
  const totalPoints = users.reduce((sum, u) => sum + (u.points || 0), 0);

  res.json({
    totalUsers,
    totalPoints,
    totalActions,
    totalGoals
  });
});
