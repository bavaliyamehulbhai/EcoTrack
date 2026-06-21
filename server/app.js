import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import helmet from "helmet";
import mongoSanitize from "express-mongo-sanitize";
import xss from "xss-clean";
import compression from "compression";
import { rateLimit } from "express-rate-limit";
import { errorHandler } from "./middleware/errorMiddleware.js";

import authRoutes from "./routes/authRoutes.js";
import carbonRoutes from "./routes/carbonRoutes.js";
import analyticsRoutes from "./routes/analyticsRoutes.js";
import goalRoutes from "./routes/goalRoutes.js";
import actionRoutes from "./routes/actionRoutes.js";
import leaderboardRoutes from "./routes/leaderboardRoutes.js";
import adminRoutes from "./routes/adminRoutes.js";
import reportRoutes from "./routes/reportRoutes.js";
import notificationRoutes from "./routes/notificationRoutes.js";

const app = express();

// Security HTTP headers
app.use(helmet({
  crossOriginResourcePolicy: false,
}));

// Enable CORS
app.use(cors({
  origin: function (origin, callback) {
    callback(null, true);
  },
  credentials: true
}));

// Rate limiting for auth routes to prevent brute force
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: "Too many requests from this IP, please try again later."
});

app.use(cookieParser());
app.use(express.json({ limit: "10kb" })); // Limit body size

// Data sanitization against NoSQL query injection (removed due to getter compatibility issue)
// app.use(mongoSanitize());

// Data sanitization against XSS (commented out to prevent ES module crash)
// app.use(xss());

// Compress API responses
app.use(compression());

app.use("/api/auth", authLimiter, authRoutes);
app.use("/api/carbon", carbonRoutes);
app.use("/api/analytics", analyticsRoutes);
app.use("/api/goals", goalRoutes);
app.use("/api/actions", actionRoutes);
app.use("/api/leaderboard", leaderboardRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/reports", reportRoutes);
app.use("/api/notifications", notificationRoutes);

app.use(errorHandler);

export default app;