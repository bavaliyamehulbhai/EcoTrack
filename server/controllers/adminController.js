import User from "../models/User.js";
import CarbonRecord from "../models/CarbonRecord.js";
import Goal from "../models/Goal.js";
import UserAction from "../models/UserAction.js";
import Action from "../models/Action.js";
import AuditLog from "../models/AuditLog.js";
import asyncHandler from "express-async-handler";

// GET /api/admin/dashboard
export const getAdminDashboard = asyncHandler(async (req, res) => {
  const totalUsers = await User.countDocuments();
    const totalCarbonRecords = await CarbonRecord.countDocuments();
    const totalGoals = await Goal.countDocuments();
    const totalActions = await UserAction.countDocuments();

    const users = await User.find().select("points");
    const totalPoints = users.reduce((sum, u) => sum + (u.points || 0), 0);

  res.json({
    totalUsers,
    totalCarbonRecords,
    totalGoals,
    totalActions,
    totalPoints
  });
});

// GET /api/admin/users
export const getUsers = asyncHandler(async (req, res) => {
  const users = await User.find().select("-password").sort({ createdAt: -1 });
  res.json(users);
});

// DELETE /api/admin/users/:id
export const deleteUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Don't delete the admin itself
    if (user.role === "admin") {
      return res.status(400).json({ message: "Cannot delete an Admin account" });
    }

    await User.findByIdAndDelete(req.params.id);
    
    // Also delete related records
    await CarbonRecord.deleteMany({ userId: req.params.id });
    await Goal.deleteMany({ userId: req.params.id });
    await UserAction.deleteMany({ userId: req.params.id });

    // Log to AuditLog
    await AuditLog.create({
      adminId: req.user.id,
      adminName: req.user.name,
      action: "delete",
      targetId: user._id.toString(),
      targetName: user.name,
      details: `Deleted user ${user.email} and all associated records.`
    });

  res.json({ message: "User and all associated data deleted successfully" });
});

// PUT /api/admin/block/:id
export const blockUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (user.role === "admin") {
      return res.status(400).json({ message: "Cannot block an Admin account" });
    }

    user.isBlocked = !user.isBlocked;
    await user.save();

    // Log to AuditLog
    await AuditLog.create({
      adminId: req.user.id,
      adminName: req.user.name,
      action: user.isBlocked ? "block" : "unblock",
      targetId: user._id.toString(),
      targetName: user.name,
      details: `${user.isBlocked ? "Blocked" : "Unblocked"} user ${user.email}.`
    });

  res.json({
    message: user.isBlocked ? "User blocked successfully" : "User unblocked successfully",
    isBlocked: user.isBlocked
  });
});

// GET /api/admin/carbon-records
export const getCarbonRecords = asyncHandler(async (req, res) => {
  const records = await CarbonRecord.find()
    .populate("userId", "name email")
    .sort({ createdAt: -1 });
  res.json(records);
});

// GET /api/admin/goals
export const getGoals = asyncHandler(async (req, res) => {
  const goals = await Goal.find()
    .populate("userId", "name email")
    .sort({ createdAt: -1 });
  res.json(goals);
});

// GET /api/admin/actions
export const getActionsAnalytics = asyncHandler(async (req, res) => {
  const totalActions = await UserAction.countDocuments();

    // Group completions by Action Id
    const completions = await UserAction.aggregate([
      { $group: { _id: "$actionId", count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);

    let mostCompleted = null;
    let leastCompleted = null;

    if (completions.length > 0) {
      const mostId = completions[0]._id;
      const leastId = completions[completions.length - 1]._id;

      const mostAction = await Action.findById(mostId);
      const leastAction = await Action.findById(leastId);

      mostCompleted = mostAction 
        ? { title: mostAction.title, count: completions[0].count }
        : null;

      leastCompleted = leastAction 
        ? { title: leastAction.title, count: completions[completions.length - 1].count }
        : null;
    }

  res.json({
    totalActions,
    mostCompleted,
    leastCompleted
  });
});

// GET /api/admin/top-users
export const getTopUsers = asyncHandler(async (req, res) => {
  const topUsers = await User.find()
    .select("name email points streak")
    .sort({ points: -1 })
    .limit(5);
  res.json(topUsers);
});

// GET /api/admin/community
export const getCommunityInsights = asyncHandler(async (req, res) => {
  const users = await User.find().select("points");
    const totalPoints = users.reduce((sum, u) => sum + (u.points || 0), 0);

    const records = await CarbonRecord.find().select("totalCarbon");
    const totalCarbon = records.reduce((sum, r) => sum + (r.totalCarbon || 0), 0);
    const avgCarbon = records.length > 0 ? Math.round((totalCarbon / records.length) * 10) / 10 : 0;

    const topUserObj = await User.findOne().sort({ points: -1 }).select("name");
    const topUser = topUserObj ? topUserObj.name : "N/A";

  res.json({
    totalPoints,
    avgCarbon,
    topUser
  });
});

// POST /api/admin/users/bulk-block
export const bulkBlockUsers = asyncHandler(async (req, res) => {
  const { userIds } = req.body;
    if (!userIds || !Array.isArray(userIds)) {
      return res.status(400).json({ message: "Invalid userIds list provided" });
    }

    const users = await User.find({ _id: { $in: userIds } });
    let blockedCount = 0;

    for (const user of users) {
      if (user.role === "admin") continue; // Skip admin
      
      user.isBlocked = true;
      await user.save();
      blockedCount++;

      await AuditLog.create({
        adminId: req.user.id,
        adminName: req.user.name,
        action: "block",
        targetId: user._id.toString(),
        targetName: user.name,
        details: `Bulk blocked user ${user.email}.`
      });
    }

  res.json({ success: true, message: `Successfully blocked ${blockedCount} users.` });
});

// POST /api/admin/users/bulk-delete
export const bulkDeleteUsers = asyncHandler(async (req, res) => {
  const { userIds } = req.body;
    if (!userIds || !Array.isArray(userIds)) {
      return res.status(400).json({ message: "Invalid userIds list provided" });
    }

    const users = await User.find({ _id: { $in: userIds } });
    let deletedCount = 0;

    for (const user of users) {
      if (user.role === "admin") continue; // Skip admin

      const idStr = user._id.toString();
      await User.findByIdAndDelete(user._id);
      
      // Also delete related records
      await CarbonRecord.deleteMany({ userId: user._id });
      await Goal.deleteMany({ userId: user._id });
      await UserAction.deleteMany({ userId: user._id });

      deletedCount++;

      await AuditLog.create({
        adminId: req.user.id,
        adminName: req.user.name,
        action: "delete",
        targetId: idStr,
        targetName: user.name,
        details: `Bulk deleted user ${user.email} and all associated records.`
      });
    }

  res.json({ success: true, message: `Successfully deleted ${deletedCount} users.` });
});

// GET /api/admin/audit-logs
export const getAuditLogs = asyncHandler(async (req, res) => {
  const logs = await AuditLog.find().sort({ createdAt: -1 });
  res.json(logs);
});
