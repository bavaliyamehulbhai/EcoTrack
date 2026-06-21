import express from "express";
import protect from "../middleware/authMiddleware.js";
import { validateRequest } from "../middleware/validateMiddleware.js";
import { carbonSchema } from "../validators/carbonValidator.js";
import {
  createCarbonRecord,
  getCarbonHistory,
  getDashboardData
} from "../controllers/carbonController.js";

const router = express.Router();

router.post("/calculate", protect, validateRequest(carbonSchema), createCarbonRecord);
router.get("/history", protect, getCarbonHistory);
router.get("/dashboard", protect, getDashboardData);

export default router;
