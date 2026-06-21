import express from "express";
import protect from "../middleware/authMiddleware.js";
import { isAdmin } from "../middleware/adminMiddleware.js";
import {
  getAdminDashboard,
  getUsers,
  deleteUser,
  blockUser,
  getCarbonRecords,
  getGoals,
  getActionsAnalytics,
  getTopUsers,
  getCommunityInsights,
  bulkBlockUsers,
  bulkDeleteUsers,
  getAuditLogs
} from "../controllers/adminController.js";

const router = express.Router();

// Apply auth protection & admin authorization role checks globally for all admin routes
router.use(protect, isAdmin);

router.get("/dashboard", getAdminDashboard);
router.get("/users", getUsers);
router.delete("/users/:id", deleteUser);
router.put("/block/:id", blockUser);
router.post("/users/bulk-block", bulkBlockUsers);
router.post("/users/bulk-delete", bulkDeleteUsers);
router.get("/audit-logs", getAuditLogs);
router.get("/carbon-records", getCarbonRecords);
router.get("/goals", getGoals);
router.get("/actions", getActionsAnalytics);
router.get("/top-users", getTopUsers);
router.get("/community", getCommunityInsights);

export default router;
