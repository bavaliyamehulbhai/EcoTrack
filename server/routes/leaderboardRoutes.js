import express from "express";
import protect from "../middleware/authMiddleware.js";
import {
  getLeaderboard,
  getTopUsers,
  getMyRank,
  getCommunityStats
} from "../controllers/leaderboardController.js";

const router = express.Router();

router.get("/", protect, getLeaderboard);
router.get("/top", protect, getTopUsers);
router.get("/my-rank", protect, getMyRank);
router.get("/community-stats", protect, getCommunityStats); // We put it under /leaderboard/community-stats or register community routes separately, let's keep it under leaderboardRoutes or mount it appropriately. Let's make it GET /api/leaderboard/community-stats for route simplicity!

export default router;
