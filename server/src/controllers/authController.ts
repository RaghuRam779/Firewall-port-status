import { Response } from "express";
import bcrypt from "bcrypt";
import crypto from "crypto";
import jwt from "jsonwebtoken";
import { User } from "../models/User";
import { env } from "../config/env";
import { ApiError } from "../middleware/errorHandler";
import { AuthenticatedRequest, JwtPayload } from "../types";
import { asyncHandler } from "../utils/asyncHandler";
import { logger } from "../utils/logger";

function signToken(payload: JwtPayload): string {
  return jwt.sign(payload, env.jwtSecret, { expiresIn: env.jwtExpiresIn } as jwt.SignOptions);
}

export const register = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const { name, email, password } = req.body;

  const existing = await User.findOne({ email: email.toLowerCase() });
  if (existing) {
    throw new ApiError(409, "An account with this email already exists");
  }

  const passwordHash = await bcrypt.hash(password, 12);
  const user = await User.create({ name, email, passwordHash, role: "analyst" });

  const token = signToken({ userId: user.id, role: user.role });
  logger.audit("user_registered", { userId: user.id, email: user.email });

  res.status(201).json({
    status: "success",
    token,
    user: { id: user.id, name: user.name, email: user.email, role: user.role }
  });
});

export const login = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email: email.toLowerCase() });
  if (!user || !(await user.comparePassword(password))) {
    logger.audit("login_failed", { email });
    throw new ApiError(401, "Invalid email or password");
  }

  const token = signToken({ userId: user.id, role: user.role });
  logger.audit("login_success", { userId: user.id });

  res.json({
    status: "success",
    token,
    user: { id: user.id, name: user.name, email: user.email, role: user.role }
  });
});

export const logout = asyncHandler(async (_req: AuthenticatedRequest, res: Response) => {
  // Stateless JWT: logout is a client-side token discard. Included for API completeness
  // and as the natural place to add refresh-token/blacklist revocation if one is added later.
  res.json({ status: "success", message: "Logged out" });
});

export const me = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const user = await User.findById(req.user!.userId).select("-passwordHash");
  if (!user) throw new ApiError(404, "User not found");
  res.json({ status: "success", user });
});

export const updateProfile = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const { name } = req.body;
  const user = await User.findByIdAndUpdate(
    req.user!.userId,
    { $set: { name } },
    { new: true }
  ).select("-passwordHash");
  if (!user) throw new ApiError(404, "User not found");
  res.json({ status: "success", user });
});

/**
 * Issues a password reset token. No transactional email provider is configured
 * in this project by default, so the token is returned directly in the API
 * response in non-production environments only, for local testing. Wire a real
 * mail service (SES, Postmark, etc.) and stop returning the token before
 * deploying to production.
 */
export const forgotPassword = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const { email } = req.body;
  const user = await User.findOne({ email: email.toLowerCase() });

  // Always respond with 200 to avoid leaking which emails are registered.
  if (!user) {
    return res.json({ status: "success", message: "If that account exists, a reset link was issued." });
  }

  const rawToken = crypto.randomBytes(32).toString("hex");
  user.resetTokenHash = crypto.createHash("sha256").update(rawToken).digest("hex");
  user.resetTokenExpires = new Date(Date.now() + 30 * 60 * 1000); // 30 minutes
  await user.save();

  logger.audit("password_reset_requested", { userId: user.id });

  res.json({
    status: "success",
    message: "If that account exists, a reset link was issued.",
    ...(env.nodeEnv !== "production" ? { devResetToken: rawToken } : {})
  });
});

export const resetPassword = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const { token, password } = req.body;
  const tokenHash = crypto.createHash("sha256").update(token).digest("hex");

  const user = await User.findOne({
    resetTokenHash: tokenHash,
    resetTokenExpires: { $gt: new Date() }
  }).select("+resetTokenHash +resetTokenExpires");

  if (!user) {
    throw new ApiError(400, "Reset token is invalid or has expired");
  }

  user.passwordHash = await bcrypt.hash(password, 12);
  user.resetTokenHash = undefined;
  user.resetTokenExpires = undefined;
  await user.save();

  logger.audit("password_reset_completed", { userId: user.id });

  res.json({ status: "success", message: "Password updated. You can now log in." });
});
