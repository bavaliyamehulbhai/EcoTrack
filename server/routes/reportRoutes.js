import express from "express";
import protect from "../middleware/authMiddleware.js";
import {
  getSummary,
  exportCSV,
  generatePDFReport
} from "../controllers/reportController.js";

const router = express.Router();

router.use(protect);

router.get("/summary", getSummary);
router.get("/pdf", generatePDFReport);
router.get("/csv", exportCSV);

export default router;
