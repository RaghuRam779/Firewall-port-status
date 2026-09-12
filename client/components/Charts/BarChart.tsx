"use client";

import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";
import { PortResult } from "@/services/scan";

export function TopServicesBarChart({ ports }: { ports: PortResult[] }) {
  const counts = new Map<string, number>();
  ports
    .filter((p) => p.state === "open")
    .forEach((p) => counts.set(p.service, (counts.get(p.service) ?? 0) + 1));

  const data = [...counts.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 8)
    .map(([service, count]) => ({ service, count }));

  return (
    <ResponsiveContainer width="100%" height={220}>
      <BarChart data={data} layout="vertical" margin={{ left: 20 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" horizontal={false} />
        <XAxis type="number" tick={{ fill: "#94A3B8", fontSize: 11 }} allowDecimals={false} />
        <YAxis type="category" dataKey="service" tick={{ fill: "#94A3B8", fontSize: 11 }} width={80} />
        <Tooltip
          contentStyle={{ background: "#1E293B", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 8 }}
        />
        <Bar dataKey="count" fill="#00E5FF" radius={[0, 4, 4, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}
