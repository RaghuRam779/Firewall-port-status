"use client";

import { PieChart, Pie, Cell } from "recharts";

function riskColor(score: number) {
  if (score < 25) return "#10B981";
  if (score < 50) return "#F59E0B";
  if (score < 75) return "#FB923C";
  return "#EF4444";
}

function riskLabel(score: number) {
  if (score < 25) return "Low Risk";
  if (score < 50) return "Moderate Risk";
  if (score < 75) return "High Risk";
  return "Critical Risk";
}

export function RiskGauge({ score }: { score: number }) {
  const color = riskColor(score);
  const data = [
    { value: score, fill: color },
    { value: 100 - score, fill: "rgba(255,255,255,0.06)" }
  ];

  return (
    <div className="flex flex-col items-center">
      <PieChart width={180} height={110}>
        <Pie
          data={data}
          dataKey="value"
          startAngle={180}
          endAngle={0}
          innerRadius={65}
          outerRadius={85}
          cx="50%"
          cy="100%"
          stroke="none"
        >
          {data.map((entry, i) => (
            <Cell key={i} fill={entry.fill} />
          ))}
        </Pie>
      </PieChart>
      <div className="-mt-6 text-center">
        <div className="text-3xl font-bold" style={{ color }}>
          {score}
        </div>
        <div className="text-xs font-medium text-slate-400">{riskLabel(score)}</div>
      </div>
    </div>
  );
}
