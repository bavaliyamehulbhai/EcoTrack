import Action from "../models/Action.js";
import UserAction from "../models/UserAction.js";
import User from "../models/User.js";
import { createNotification } from "../utils/notificationHelper.js";
import asyncHandler from "express-async-handler";

// GET /api/actions
export const getActions = asyncHandler(async (req, res) => {
  const actions = await Action.find();
  res.json(actions);
});

// POST /api/actions/complete
export const completeAction = asyncHandler(async (req, res) => {
  const { actionId } = req.body;

    const action = await Action.findById(actionId);
    if (!action) {
      return res.status(404).json({ message: "Action not found" });
    }

    // Prevent duplicate action completion on the same day
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);

    const alreadyDone = await UserAction.findOne({
      userId: req.user.id,
      actionId: actionId,
      completedDate: { $gte: todayStart }
    });

    if (alreadyDone) {
      return res.status(400).json({ message: "Action already completed today" });
    }

    // Create completion log
    const userAction = await UserAction.create({
      userId: req.user.id,
      actionId: actionId,
      completedDate: new Date()
    });

    // Update user points and streaks
    const user = await User.findById(req.user.id);
    user.points += action.points;

    // Streak Tracking Logic
    const today = new Date();
    const lastDate = user.lastActionDate ? new Date(user.lastActionDate) : null;
    let streakUpdated = false;
    
    if (!lastDate) {
      user.streak = 1;
      streakUpdated = true;
    } else {
      // Calculate day difference at midnight
      const todayMidnight = new Date(today);
      todayMidnight.setHours(0, 0, 0, 0);
      
      const lastMidnight = new Date(lastDate);
      lastMidnight.setHours(0, 0, 0, 0);

      const diffTime = todayMidnight - lastMidnight;
      const dayDiff = Math.round(diffTime / (1000 * 60 * 60 * 24));

      if (dayDiff === 1) {
        user.streak += 1;
        streakUpdated = true;
      } else if (dayDiff > 1) {
        if (user.streakFreezes > 0) {
          user.streakFreezes -= 1;
          user.streak += 1;
          streakUpdated = true;
          await createNotification(
            user._id,
            "❄️ Streak Freeze Used",
            "A streak freeze was automatically used to protect your daily streak!"
          );
        } else {
          user.streak = 1;
          streakUpdated = true;
        }
      }
    }
    user.lastActionDate = new Date();

    // Daily Challenge: Complete 3 Eco Actions today for +50 Bonus Points
    const completedTodayCount = await UserAction.countDocuments({
      userId: req.user.id,
      completedDate: { $gte: todayStart }
    });

    let dailyChallengeBonus = false;
    if (completedTodayCount === 3) {
      user.points += 50;
      dailyChallengeBonus = true;
    }

    // Badge Engine Rules:
    // 50 Points -> Eco Beginner
    // 150 Points -> Eco Warrior
    // 300 Points -> Green Champion
    const unlockedBadges = [];
    if (user.points >= 50 && !user.badges.includes("Eco Beginner")) {
      user.badges.push("Eco Beginner");
      unlockedBadges.push("Eco Beginner");
    }
    if (user.points >= 150 && !user.badges.includes("Eco Warrior")) {
      user.badges.push("Eco Warrior");
      unlockedBadges.push("Eco Warrior");
    }
    if (user.points >= 300 && !user.badges.includes("Green Champion")) {
      user.badges.push("Green Champion");
      unlockedBadges.push("Green Champion");
    }

    await user.save();

    // Dispatch Notifications after successful database updates
    if (streakUpdated) {
      await createNotification(
        user._id,
        "🔥 Streak Updated",
        `Keep it up! Your green daily streak is now ${user.streak} days.`
      );
    }

    if (dailyChallengeBonus) {
      await createNotification(
        user._id,
        "⚡ Daily Challenge Met",
        "Congratulations! You completed 3 eco-actions today and received a +50 pts bonus."
      );
    }

    for (const badge of unlockedBadges) {
      await createNotification(
        user._id,
        "🏆 Badge Earned",
        `Congratulations! You unlocked the "${badge}" level badge!`
      );
    }

  res.json({
    success: true,
    pointsEarned: action.points,
    dailyChallengeBonus,
    unlockedBadges,
    currentPoints: user.points,
    currentStreak: user.streak,
    completedTodayCount
  });
});

// GET /api/actions/stats
export const getUserStats = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);

    const completedTodayCount = await UserAction.countDocuments({
      userId: req.user.id,
      completedDate: { $gte: todayStart }
    });

  res.json({
    points: user.points || 0,
    streak: user.streak || 0,
    badges: user.badges || [],
    streakFreezes: user.streakFreezes || 0,
    tier: user.tier || "Bronze",
    completedTodayCount
  });
});

// POST /api/actions/buy-streak-freeze
export const buyStreakFreeze = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (user.points < 100) {
      return res.status(400).json({ message: "Insufficient points. Streak Freeze costs 100 points." });
    }

    user.points -= 100;
    user.streakFreezes = (user.streakFreezes || 0) + 1;
    await user.save();

    await createNotification(
      user._id,
      "❄️ Streak Freeze Purchased",
      "Successfully bought a streak freeze for 100 points! This will automatically protect your streak if you miss a daily check-in."
    );

  res.json({
    success: true,
    points: user.points,
    streakFreezes: user.streakFreezes,
    message: "Streak Freeze purchased successfully"
  });
});
