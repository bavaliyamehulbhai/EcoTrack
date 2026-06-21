import express from "express";
import protect from "../middleware/authMiddleware.js";
import { validateRequest } from "../middleware/validateMiddleware.js";
import { actionSchema } from "../validators/actionValidator.js";
import {
  getActions,
  completeAction,
  getUserStats,
  buyStreakFreeze
} from "../controllers/actionController.js";

const router = express.Router();

router.get("/", protect, getActions);
router.post("/complete", protect, validateRequest(actionSchema), completeAction);
router.post("/buy-streak-freeze", protect, buyStreakFreeze);
router.get("/stats", protect, getUserStats);

export default router;
