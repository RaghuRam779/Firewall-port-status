import { api } from "./api";

export interface Analytics {
  totalScans: number;
  openPorts: number;
  closedPorts: number;
  filteredPorts: number;
  avgScanTime: number;
  avgRiskScore: number;
  topTargets: { target: string; count: number }[];
  topOpenPorts: { port: number; count: number }[];
  highestRiskScans: { id: string; target: string; riskScore: number; createdAt: string }[];
  monthlyStats: { month: string; count: number }[];
}

export async function getAnalytics(): Promise<Analytics> {
  const { data } = await api.get<{ status: string; analytics: Analytics }>("/analytics");
  return data.analytics;
}
