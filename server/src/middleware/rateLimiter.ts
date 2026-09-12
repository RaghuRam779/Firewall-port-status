import rateLimit from "express-rate-limit";
import { env } from "../config/env";

export const generalLimiter = rateLimit({
  windowMs: env.rateLimitWindowMs,
  max: env.rateLimitMax,
  standardHeaders: true,
  legacyHeaders: false,
  message: { status: "error", message: "Too many requests, please try again later." }
});

export const authLimiter = rateLimit({
  windowMs: env.rateLimitWindowMs,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: { status: "error", message: "Too many auth attempts, please try again later." }
});

// Scans are expensive (they shell out to Nmap), so they get a tighter limit.
export const scanLimiter = rateLimit({
  windowMs: env.rateLimitWindowMs,
  max: env.scanRateLimitMax,
  standardHeaders: true,
  legacyHeaders: false,
  message: { status: "error", message: "Scan rate limit exceeded, please try again later." }
});
