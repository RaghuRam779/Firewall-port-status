import { Response } from "express";
import { Scan } from "../models/Scan";
import { AuthenticatedRequest } from "../types";
import { asyncHandler } from "../utils/asyncHandler";

export const getAnalytics = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const filter = req.user!.role === "admin" ? {} : { user: req.user!.userId };

  const scans = await Scan.find(filter);

  const totalScans = scans.length;
  const openPorts = scans.reduce((sum, s) => sum + s.ports.filter((p) => p.state === "open").length, 0);
  const closedPorts = scans.reduce((sum, s) => sum + s.ports.filter((p) => p.state === "closed").length, 0);
  const filteredPorts = scans.reduce((sum, s) => sum + s.ports.filter((p) => p.state === "filtered").length, 0);
  const avgScanTime = totalScans
    ? Math.round(scans.reduce((sum, s) => sum + s.durationMs, 0) / totalScans)
    : 0;
  const avgRiskScore = totalScans
    ? Math.round(scans.reduce((sum, s) => sum + s.riskScore, 0) / totalScans)
    : 0;

  const targetCounts = new Map<string, number>();
  const portCounts = new Map<number, number>();
  for (const scan of scans) {
    targetCounts.set(scan.target, (targetCounts.get(scan.target) ?? 0) + 1);
    for (const p of scan.ports.filter((p) => p.state === "open")) {
      portCounts.set(p.port, (portCounts.get(p.port) ?? 0) + 1);
    }
  }

  const topTargets = [...targetCounts.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([target, count]) => ({ target, count }));

  const topOpenPorts = [...portCounts.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 8)
    .map(([port, count]) => ({ port, count }));

  const highestRiskScans = [...scans]
    .sort((a, b) => b.riskScore - a.riskScore)
    .slice(0, 5)
    .map((s) => ({ id: s.id, target: s.target, riskScore: s.riskScore, createdAt: s.createdAt }));

  // Monthly scan counts for the trailing 12 months.
  const monthly = new Map<string, number>();
  for (const scan of scans) {
    const key = scan.createdAt.toISOString().slice(0, 7); // YYYY-MM
    monthly.set(key, (monthly.get(key) ?? 0) + 1);
  }
  const monthlyStats = [...monthly.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .slice(-12)
    .map(([month, count]) => ({ month, count }));

  res.json({
    status: "success",
    analytics: {
      totalScans,
      openPorts,
      closedPorts,
      filteredPorts,
      avgScanTime,
      avgRiskScore,
      topTargets,
      topOpenPorts,
      highestRiskScans,
      monthlyStats
    }
  });
});
