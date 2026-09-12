"use client";

import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import {
  MagnifyingGlassCircleIcon,
  ShieldCheckIcon,
  ShieldExclamationIcon,
  BoltIcon
} from "@heroicons/react/24/outline";
import { getAllScans } from "@/services/scan";
import { getAnalytics } from "@/services/analytics";

function riskColor(score: number) {
  if (score < 25) return "text-success";
  if (score < 50) return "text-warning";
  return "text-danger";
}

export default function DashboardPage() {
  const { data: scansData, isLoading: scansLoading, isError: scansError } = useQuery({
    queryKey: ["scans", 1],
    queryFn: () => getAllScans(1, 5)
  });

  const { data: analytics, isLoading: analyticsLoading, isError: analyticsError } = useQuery({
    queryKey: ["analytics"],
    queryFn: getAnalytics
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-white">Dashboard</h1>
          <p className="text-sm text-slate-400">Overview of your scan activity and risk posture.</p>
        </div>
        <Link href="/dashboard/scan/new" className="btn-primary text-sm">
          <MagnifyingGlassCircleIcon className="h-4 w-4" /> New Scan
        </Link>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          icon={BoltIcon}
          label="Total Scans"
          value={analyticsLoading ? "—" : analyticsError ? "!" : analytics?.totalScans ?? 0}
        />
        <StatCard
          icon={ShieldCheckIcon}
          label="Open Ports Found"
          value={analyticsLoading ? "—" : analyticsError ? "!" : analytics?.openPorts ?? 0}
          accent="text-success"
        />
        <StatCard
          icon={ShieldExclamationIcon}
          label="Avg Risk Score"
          value={analyticsLoading ? "—" : analyticsError ? "!" : analytics?.avgRiskScore ?? 0}
          accent={analytics ? riskColor(analytics.avgRiskScore) : undefined}
        />
        <StatCard
          icon={BoltIcon}
          label="Avg Scan Time"
          value={analyticsLoading ? "—" : analyticsError ? "!" : `${((analytics?.avgScanTime ?? 0) / 1000).toFixed(1)}s`}
        />
      </div>

      <div className="glass-card p-6">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-sm font-semibold text-white">Recent Scans</h2>
          <Link href="/dashboard/history" className="text-xs text-accent hover:underline">
            View all
          </Link>
        </div>

        {scansLoading ? (
          <div className="py-8 text-center text-sm text-slate-500">Loading...</div>
        ) : scansError ? (
          <div className="py-8 text-center text-sm text-danger">Could not load recent scans.</div>
        ) : scansData?.scans.length === 0 ? (
          <div className="py-8 text-center text-sm text-slate-500">
            No scans yet. Start your first scan to see results here.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-white/10 text-xs uppercase tracking-wide text-slate-500">
                  <th className="px-3 py-2">Target</th>
                  <th className="px-3 py-2">Status</th>
                  <th className="px-3 py-2">Risk</th>
                  <th className="px-3 py-2">Date</th>
                </tr>
              </thead>
              <tbody>
                {scansData?.scans.map((s) => (
                  <tr key={s._id} className="border-b border-white/5 hover:bg-white/5">
                    <td className="px-3 py-2.5">
                      <Link href={`/dashboard/scan/${s._id}`} className="text-accent hover:underline">
                        {s.target}
                      </Link>
                    </td>
                    <td className="px-3 py-2.5 capitalize">{s.status}</td>
                    <td className={`px-3 py-2.5 font-semibold ${riskColor(s.riskScore)}`}>
                      {s.riskScore}
                    </td>
                    <td className="px-3 py-2.5 text-slate-400">
                      {new Date(s.createdAt).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

function StatCard({
  icon: Icon,
  label,
  value,
  accent
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string | number;
  accent?: string;
}) {
  return (
    <div className="glass-card glass-card-hover p-5">
      <Icon className="mb-3 h-6 w-6 text-accent" />
      <div className={`text-2xl font-bold text-white ${accent ?? ""}`}>{value}</div>
      <div className="text-xs text-slate-400">{label}</div>
    </div>
  );
}
