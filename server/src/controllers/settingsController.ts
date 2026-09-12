import { Response } from "express";
import { Settings } from "../models/Settings";
import { AuthenticatedRequest } from "../types";
import { asyncHandler } from "../utils/asyncHandler";

export const getSettings = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  let settings = await Settings.findOne({ user: req.user!.userId });
  if (!settings) {
    settings = await Settings.create({ user: req.user!.userId });
  }
  res.json({ status: "success", settings });
});

export const updateSettings = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const { defaultScanType, defaultPortPreset, theme, notificationsEnabled, scanTimeoutMs } = req.body;

  const settings = await Settings.findOneAndUpdate(
    { user: req.user!.userId },
    {
      $set: {
        ...(defaultScanType && { defaultScanType }),
        ...(defaultPortPreset && { defaultPortPreset }),
        ...(theme && { theme }),
        ...(notificationsEnabled !== undefined && { notificationsEnabled }),
        ...(scanTimeoutMs !== undefined && { scanTimeoutMs })
      }
    },
    { new: true, upsert: true }
  );

  res.json({ status: "success", settings });
});
