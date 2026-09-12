import { Response } from "express";
import { Scan } from "../models/Scan";
import { AuthenticatedRequest } from "../types";
import { asyncHandler } from "../utils/asyncHandler";
import { ApiError } from "../middleware/errorHandler";
import { logger } from "../utils/logger";
import { env } from "../config/env";
import {
  buildNmapArgs,
  computeRiskScore,
  generateRecommendations,
  parseNmapOutput,
  runNmap
} from "../services/nmapService";
import { isValidTarget } from "../utils/validators";

export const createScan = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const {
    target,
    portPreset,
    customPortRange,
    scanTypes,
    timingTemplate,
    usePn,
    authorizationConfirmed
  } = req.body;

  // Hard requirement: every scan must carry an explicit authorization attestation.
  if (authorizationConfirmed !== true) {
    throw new ApiError(
      400,
      "You must confirm you own or are explicitly authorized to test this target before scanning."
    );
  }

  if (!target || !isValidTarget(target)) {
    throw new ApiError(400, "Invalid target. Provide a valid IP address, hostname, or CIDR range.");
  }

  if (env.scanTargetAllowlist.length > 0 && !env.scanTargetAllowlist.includes(target)) {
    throw new ApiError(
      403,
      "This target is not on the configured allowlist for this deployment."
    );
  }

  const args = buildNmapArgs({
    target,
    portPreset,
    customPortRange,
    scanTypes: Array.isArray(scanTypes) ? scanTypes : [],
    timingTemplate,
    usePn: Boolean(usePn),
    authorizationConfirmed: true
  });

  const scan = await Scan.create({
    user: req.user!.userId,
    target,
    command: `nmap ${args.join(" ")}`,
    scanTypes: scanTypes ?? [],
    portPreset,
    status: "running",
    authorizationConfirmed: true
  });

  logger.audit("scan_started", { userId: req.user!.userId, scanId: scan.id, target, command: scan.command });

  try {
    const { rawOutput, durationMs } = await runNmap(args);
    const { ports, hostUp, osGuess, latencyMs } = parseNmapOutput(rawOutput);
    const firewallDetected = ports.some((p) => p.state === "filtered");
    const riskScore = computeRiskScore(ports, firewallDetected);
    const recommendations = generateRecommendations(ports, firewallDetected);

    scan.status = "completed";
    scan.ports = ports;
    scan.hostUp = hostUp;
    scan.osGuess = osGuess;
    scan.latencyMs = latencyMs;
    scan.firewallDetected = firewallDetected;
    scan.riskScore = riskScore;
    scan.recommendations = recommendations;
    scan.durationMs = durationMs;
    scan.rawOutput = rawOutput;
    scan.completedAt = new Date();
    await scan.save();

    logger.audit("scan_completed", { scanId: scan.id, riskScore, openPorts: ports.filter(p => p.state === "open").length });

    res.status(201).json({ status: "success", scan });
  } catch (err) {
    scan.status = "failed";
    scan.rawOutput = err instanceof Error ? err.message : "Unknown scan error";
    await scan.save();
    logger.error("scan_failed", { scanId: scan.id, error: scan.rawOutput });
    if (scan.rawOutput.startsWith("Nmap is not installed")) {
      throw new ApiError(503, scan.rawOutput);
    }
    throw new ApiError(502, "Scan failed to complete. It may have timed out or the target was unreachable.");
  }
});

export const listScans = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const page = parseInt((req.query.page as string) ?? "1", 10);
  const limit = Math.min(parseInt((req.query.limit as string) ?? "20", 10), 100);

  const filter = req.user!.role === "admin" ? {} : { user: req.user!.userId };

  const [scans, total] = await Promise.all([
    Scan.find(filter)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit),
    Scan.countDocuments(filter)
  ]);

  res.json({ status: "success", scans, total, page, limit });
});

export const getScan = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const scan = await Scan.findById(req.params.id);
  if (!scan) throw new ApiError(404, "Scan not found");
  if (req.user!.role !== "admin" && scan.user.toString() !== req.user!.userId) {
    throw new ApiError(403, "You do not have access to this scan");
  }
  res.json({ status: "success", scan });
});

export const deleteScan = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const scan = await Scan.findById(req.params.id);
  if (!scan) throw new ApiError(404, "Scan not found");
  if (req.user!.role !== "admin" && scan.user.toString() !== req.user!.userId) {
    throw new ApiError(403, "You do not have access to this scan");
  }
  await scan.deleteOne();
  logger.audit("scan_deleted", { userId: req.user!.userId, scanId: req.params.id });
  res.json({ status: "success", message: "Scan deleted" });
});
