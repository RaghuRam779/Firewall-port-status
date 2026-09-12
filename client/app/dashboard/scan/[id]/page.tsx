"use client";

import { useParams, useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import {
  ArrowDownTrayIcon,
  ClockIcon,
  ServerIcon,
  ShieldExclamationIcon
} from "@heroicons/react/24/outline";
import { getScanById } from "@/services/scan";
import { downloadReport } from "@/services/report";
import { RiskGauge } from "@/components/RiskGauge";
import { PortTable } from "@/components/PortTable";
import { PortStatePieChart } from "@/components/Charts/PieChart";
import { TopServicesBarChart } from "@/components/Charts/BarChart";

export default function ScanResultPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();

  const { data: scan, isLoading, error } = useQuery({
    queryKey: ["scan", params.id],
    queryFn: () => getScanById(params.id),
    refetchInterval: (query) => (query.state.data?.status === "running" ? 3000 : false)
  });

  if (isLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-accent border-t-transparent" />
      </div>
    );
  }

  if (error || !scan) {
    return (
      <div className="rounded-lg border border-danger/30 bg-danger/10 p-4 text-sm text-danger">
        Could not load this scan. It may have been deleted or you may not have access to it.
      </div>
    );
  }

  const openCount = scan.ports.filter((p) => p.state === "open").length;
  const closedCount = scan.ports.filter((p) => p.state === "closed").length;
  const filteredCount = scan.ports.filter((p) => p.state === "filtered").length;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold text-white">{scan.target}</h1>
          <p className="text-sm text-slate-400">
            Scanned {new Date(scan.createdAt).toLocaleString()} · {scan.command}
          </p>
        </div>
        <div className="flex gap-2">
          <button onClick={() => downloadReport(scan._id, "pdf")} className="btn-secondary text-xs">
            <ArrowDownTrayIcon className="h-4 w-4" /> PDF
          </button>
          <button onClick={() => downloadReport(scan._id, "csv")} className="btn-secondary text-xs">
            <ArrowDownTrayIcon className="h-4 w-4" /> CSV
          </button>
          <button onClick={() => downloadReport(scan._id, "json")} className="btn-secondary text-xs">
            <ArrowDownTrayIcon className="h-4 w-4" /> JSON
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
        <div className="glass-card p-5 text-center">
          <div className="text-2xl font-bold text-success">{openCount}</div>
          <div className="text-xs text-slate-400">Open Ports</div>
        </div>
        <div className="glass-card p-5 text-center">
          <div className="text-2xl font-bold text-slate-400">{closedCount}</div>
          <div className="text-xs text-slate-400">Closed Ports</div>
        </div>
        <div className="glass-card p-5 text-center">
          <div className="text-2xl font-bold text-warning">{filteredCount}</div>
          <div className="text-xs text-slate-400">Filtered Ports</div>
        </div>
        <div className="glass-card p-5 text-center">
          <div
            className={`text-2xl font-bold ${scan.firewallDetected ? "text-warning" : "text-success"}`}
          >
            {scan.firewallDetected ? "Detected" : "Not Detected"}
          </div>
          <div className="text-xs text-slate-400">Firewall Status</div>
        </div>
      </div>

      {!scan.hostUp && (
        <div className="rounded-lg border border-warning/30 bg-warning/10 px-4 py-3 text-sm text-warning">
          The target did not respond to host discovery, so no port data was available. Try a reachable target or enable “Skip host discovery (-Pn)” only when you are authorized to test a host that blocks discovery probes.
        </div>
      )}

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="glass-card flex flex-col items-center justify-center p-6">
          <RiskGauge score={scan.riskScore} />
        </div>
        <div className="glass-card p-6">
          <h3 className="mb-2 text-sm font-semibold text-white">Port Distribution</h3>
          <PortStatePieChart ports={scan.ports} />
        </div>
        <div className="glass-card p-6">
          <h3 className="mb-2 text-sm font-semibold text-white">Top Services</h3>
          <TopServicesBarChart ports={scan.ports} />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="glass-card p-5">
          <div className="flex items-center gap-2 text-slate-300">
            <ServerIcon className="h-5 w-5 text-accent" />
            <span className="text-sm font-medium">Host Info</span>
          </div>
          <div className="mt-3 space-y-1 text-sm text-slate-400">
            <div>OS: {scan.osGuess ?? "Unknown"}</div>
            <div>Latency: {scan.latencyMs != null ? `${scan.latencyMs} ms` : "N/A"}</div>
            <div>Status: {scan.status}</div>
          </div>
        </div>
        <div className="glass-card p-5">
          <div className="flex items-center gap-2 text-slate-300">
            <ClockIcon className="h-5 w-5 text-accent" />
            <span className="text-sm font-medium">Scan Duration</span>
          </div>
          <div className="mt-3 text-2xl font-bold text-white">
            {(scan.durationMs / 1000).toFixed(1)}s
          </div>
        </div>
        <div className="glass-card p-5 lg:col-span-1">
          <div className="flex items-center gap-2 text-slate-300">
            <ShieldExclamationIcon className="h-5 w-5 text-accent" />
            <span className="text-sm font-medium">Recommendations</span>
          </div>
          <ul className="mt-3 space-y-1.5 text-xs text-slate-400">
            {scan.recommendations.map((r, i) => (
              <li key={i} className="flex gap-1.5">
                <span className="text-accent">•</span> {r}
              </li>
            ))}
          </ul>
        </div>
      </div>

      <PortTable ports={scan.ports} />

      <button onClick={() => router.push("/dashboard/history")} className="btn-secondary text-sm">
        Back to history
      </button>
    </div>
  );
}
