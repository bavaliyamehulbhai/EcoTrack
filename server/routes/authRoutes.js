import express from "express";

import {
  registerUser,
  loginUser,
  logoutUser,
  getProfile,
  updateProfile
} from "../controllers/authController.js";

import protect from "../middleware/authMiddleware.js";
import { validateRequest } from "../middleware/validateMiddleware.js";
import { registerSchema, loginSchema } from "../validators/authValidator.js";

const router = express.Router();

router.post("/register", validateRequest(registerSchema), registerUser);

router.post("/login", validateRequest(loginSchema), loginUser);

router.post("/logout", logoutUser);

router.get("/profile", protect, getProfile);
router.put("/profile", protect, updateProfile);

export default router;