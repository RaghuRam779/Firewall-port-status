import { Response } from "express";
import { Scan } from "../models/Scan";
import { AuthenticatedRequest } from "../types";
import { asyncHandler } from "../utils/asyncHandler";
import { ApiError } from "../middleware/errorHandler";
import { scanToCSV, scanToJSON, streamScanPDF } from "../services/reportService";

async function getAuthorizedScan(req: AuthenticatedRequest) {
  const scan = await Scan.findById(req.params.id);
  if (!scan) throw new ApiError(404, "Scan not found");
  if (req.user!.role !== "admin" && scan.user.toString() !== req.user!.userId) {
    throw new ApiError(403, "You do not have access to this scan");
  }
  return scan;
}

export const getReport = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const scan = await getAuthorizedScan(req);
  res.json({ status: "success", report: scanToJSON(scan) });
});

export const exportReportJSON = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const scan = await getAuthorizedScan(req);
  res.setHeader("Content-Disposition", `attachment; filename="scan-${scan.id}.json"`);
  res.json(scanToJSON(scan));
});

export const exportReportCSV = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const scan = await getAuthorizedScan(req);
  res.setHeader("Content-Type", "text/csv");
  res.setHeader("Content-Disposition", `attachment; filename="scan-${scan.id}.csv"`);
  res.send(scanToCSV(scan));
});

export const exportReportPDF = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const scan = await getAuthorizedScan(req);
  streamScanPDF(scan, res);
});
