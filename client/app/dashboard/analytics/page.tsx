"use client";

import { useQuery } from "@tanstack/react-query";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, LineChart, Line } from "recharts";
import { getAnalytics } from "@/services/analytics";

export default function AnalyticsPage() {
  const { data, isLoading, isError } = useQuery({ queryKey: ["analytics"], queryFn: getAnalytics });

  if (isLoading) {
    return <div className="py-12 text-center text-sm text-slate-500">Loading analytics...</div>;
  }
  if (isError || !data) {
    return <div className="py-12 text-center text-sm text-danger">Could not load analytics.</div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-white">Analytics</h1>
        <p className="text-sm text-slate-400">Trends across all of your scan history.</p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <MetricCard label="Total Scans" value={data.totalScans} />
        <MetricCard label="Open Ports Found" value={data.openPorts} accent="text-success" />
        <MetricCard label="Avg Risk Score" value={data.avgRiskScore} />
        <MetricCard label="Avg Scan Time" value={`${(data.avgScanTime / 1000).toFixed(1)}s`} />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="glass-card p-6">
          <h3 className="mb-4 text-sm font-semibold text-white">Most Common Open Ports</h3>
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={data.topOpenPorts}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
              <XAxis dataKey="port" tick={{ fill: "#94A3B8", fontSize: 11 }} />
              <YAxis tick={{ fill: "#94A3B8", fontSize: 11 }} allowDecimals={false} />
              <Tooltip contentStyle={{ background: "#1E293B", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 8 }} />
              <Bar dataKey="count" fill="#00E5FF" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="glass-card p-6">
          <h3 className="mb-4 text-sm font-semibold text-white">Monthly Scan Volume</h3>
          <ResponsiveContainer width="100%" height={260}>
            <LineChart data={data.monthlyStats}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
              <XAxis dataKey="month" tick={{ fill: "#94A3B8", fontSize: 11 }} />
              <YAxis tick={{ fill: "#94A3B8", fontSize: 11 }} allowDecimals={false} />
              <Tooltip contentStyle={{ background: "#1E293B", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 8 }} />
              <Line type="monotone" dataKey="count" stroke="#00E5FF" strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="glass-card p-6">
          <h3 className="mb-4 text-sm font-semibold text-white">Most Scanned Targets</h3>
          <ul className="space-y-2 text-sm">
            {data.topTargets.map((t) => (
              <li key={t.target} className="flex justify-between border-b border-white/5 pb-2">
                <span className="text-slate-300">{t.target}</span>
                <span className="font-semibold text-accent">{t.count}</span>
              </li>
            ))}
            {data.topTargets.length === 0 && <li className="text-slate-500">No data yet.</li>}
          </ul>
        </div>

        <div className="glass-card p-6">
          <h3 className="mb-4 text-sm font-semibold text-white">Highest Risk Scans</h3>
          <ul className="space-y-2 text-sm">
            {data.highestRiskScans.map((s) => (
              <li key={s.id} className="flex justify-between border-b border-white/5 pb-2">
                <span className="text-slate-300">{s.target}</span>
                <span className="font-semibold text-danger">{s.riskScore}</span>
              </li>
            ))}
            {data.highestRiskScans.length === 0 && <li className="text-slate-500">No data yet.</li>}
          </ul>
        </div>
      </div>
    </div>
  );
}

function MetricCard({ label, value, accent }: { label: string; value: string | number; accent?: string }) {
  return (
    <div className="glass-card p-5">
      <div className={`text-2xl font-bold text-white ${accent ?? ""}`}>{value}</div>
      <div className="text-xs text-slate-400">{label}</div>
    </div>
  );
}
