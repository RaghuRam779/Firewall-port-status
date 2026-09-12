import "express-async-errors";
import express from "express";
import helmet from "helmet";
import cors from "cors";
import morgan from "morgan";
import { env } from "./config/env";
import { connectDB } from "./config/db";
import { logger } from "./utils/logger";
import { generalLimiter } from "./middleware/rateLimiter";
import { notFoundHandler, errorHandler } from "./middleware/errorHandler";

import authRoutes from "./routes/authRoutes";
import scanRoutes from "./routes/scanRoutes";
import reportRoutes from "./routes/reportRoutes";
import analyticsRoutes from "./routes/analyticsRoutes";
import settingsRoutes from "./routes/settingsRoutes";

const app = express();

app.use(helmet());
app.use(
  cors({
    origin: env.clientOrigin,
    credentials: true
  })
);
app.use(express.json({ limit: "1mb" }));
app.use(morgan(env.nodeEnv === "development" ? "dev" : "combined"));
app.use(generalLimiter);

app.get("/api/health", (_req, res) => {
  res.json({ status: "success", message: "Firewall Port Status Checker API is running" });
});

app.use("/api/auth", authRoutes);
app.use("/api/scan", scanRoutes);
app.use("/api/report", reportRoutes);
app.use("/api/analytics", analyticsRoutes);
app.use("/api/settings", settingsRoutes);

app.use(notFoundHandler);
app.use(errorHandler);

async function start() {
  try {
    await connectDB();
    app.listen(env.port, () => {
      logger.info(`Server listening on port ${env.port} (${env.nodeEnv})`);
    });
  } catch (err) {
    logger.error("Failed to start server", { error: err instanceof Error ? err.message : err });
    process.exit(1);
  }
}

start();
