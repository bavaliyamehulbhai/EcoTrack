import express from "express";
import protect from "../middleware/authMiddleware.js";
import {
  getNotifications,
  markNotificationRead,
  createNotificationDirectly,
  deleteNotification
} from "../controllers/notificationController.js";

const router = express.Router();

router.use(protect);

router.get("/", getNotifications);
router.put("/:id", markNotificationRead);
router.post("/", createNotificationDirectly);
router.delete("/:id", deleteNotification);

export default router;
