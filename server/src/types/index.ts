import { Request } from "express";

export interface JwtPayload {
  userId: string;
  role: "admin" | "analyst";
}

export interface AuthenticatedRequest extends Request {
  user?: JwtPayload;
}

export interface PortResult {
  port: number;
  protocol: "tcp" | "udp";
  state: "open" | "closed" | "filtered";
  service: string;
  version: string;
  risk: "Low" | "Medium" | "High" | "Critical";
}

export interface ScanRequestOptions {
  target: string;
  portPreset: "top100" | "top1000" | "all" | "custom";
  customPortRange?: string;
  scanTypes: string[];
  timingTemplate?: string;
  usePn?: boolean;
  authorizationConfirmed: boolean;
}
