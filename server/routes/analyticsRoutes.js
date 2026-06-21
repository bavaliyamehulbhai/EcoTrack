import express from "express";
import protect from "../middleware/authMiddleware.js";
import {
  getCategoryAnalytics,
  getTrendAnalytics,
  getMonthlyAnalytics
} from "../controllers/analyticsController.js";

const router = express.Router();

router.get("/category", protect, getCategoryAnalytics);
router.get("/trend", protect, getTrendAnalytics);
router.get("/monthly", protect, getMonthlyAnalytics);

export default router;
