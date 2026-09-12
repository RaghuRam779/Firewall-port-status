import { api } from "./api";

export interface PortResult {
  port: number;
  protocol: "tcp" | "udp";
  state: "open" | "closed" | "filtered";
  service: string;
  version: string;
  risk: "Low" | "Medium" | "High" | "Critical";
}

export interface Scan {
  _id: string;
  target: string;
  command: string;
  scanTypes: string[];
  portPreset: string;
  status: "queued" | "running" | "completed" | "failed";
  ports: PortResult[];
  hostUp: boolean;
  osGuess?: string;
  latencyMs?: number;
  firewallDetected: boolean;
  riskScore: number;
  recommendations: string[];
  durationMs: number;
  createdAt: string;
  completedAt?: string;
}

export interface NewScanPayload {
  target: string;
  portPreset: "top100" | "top1000" | "all" | "custom";
  customPortRange?: string;
  scanTypes: string[];
  timingTemplate?: string;
  usePn?: boolean;
  authorizationConfirmed: boolean;
}

export async function startScan(payload: NewScanPayload): Promise<Scan> {
  const { data } = await api.post<{ status: string; scan: Scan }>("/scan", payload);
  return data.scan;
}

export async function getAllScans(page = 1, limit = 20) {
  const { data } = await api.get<{ status: string; scans: Scan[]; total: number }>("/scan", {
    params: { page, limit }
  });
  return data;
}

export async function getScanById(id: string): Promise<Scan> {
  const { data } = await api.get<{ status: string; scan: Scan }>(`/scan/${id}`);
  return data.scan;
}

export async function deleteScanById(id: string): Promise<void> {
  await api.delete(`/scan/${id}`);
}
