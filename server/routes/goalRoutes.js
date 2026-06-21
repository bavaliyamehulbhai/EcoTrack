import express from "express";
import {
  createGoal,
  getGoals,
  updateGoal,
  deleteGoal,
  getGoalAnalytics
} from "../controllers/goalController.js";
import protect from "../middleware/authMiddleware.js";
import { validateRequest } from "../middleware/validateMiddleware.js";
import { createGoalSchema } from "../validators/goalValidator.js";

const router = express.Router();

router.post("/", protect, validateRequest(createGoalSchema), createGoal);
router.get("/", protect, getGoals);
router.put("/:id", protect, updateGoal);
router.delete("/:id", protect, deleteGoal);
router.get("/analytics", protect, getGoalAnalytics);

export default router;
