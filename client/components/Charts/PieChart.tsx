"use client";

import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { PortResult } from "@/services/scan";

const COLORS = { open: "#10B981", closed: "#64748B", filtered: "#F59E0B" };

export function PortStatePieChart({ ports }: { ports: PortResult[] }) {
  const counts = { open: 0, closed: 0, filtered: 0 };
  ports.forEach((p) => counts[p.state]++);
  const data = Object.entries(counts).map(([name, value]) => ({ name, value }));

  return (
    <ResponsiveContainer width="100%" height={220}>
      <PieChart>
        <Pie data={data} dataKey="value" nameKey="name" innerRadius={55} outerRadius={85} paddingAngle={3}>
          {data.map((entry) => (
            <Cell key={entry.name} fill={COLORS[entry.name as keyof typeof COLORS]} stroke="none" />
          ))}
        </Pie>
        <Tooltip
          contentStyle={{ background: "#1E293B", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 8 }}
        />
        <Legend />
      </PieChart>
    </ResponsiveContainer>
  );
}
