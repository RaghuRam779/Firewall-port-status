"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";

const stages = [
  "Resolving target...",
  "Sending probes...",
  "Analyzing port states...",
  "Detecting services and versions...",
  "Evaluating firewall behavior...",
  "Compiling results..."
];

export function ScanProgress({ command }: { command: string }) {
  const [stageIndex, setStageIndex] = useState(0);
  const [log, setLog] = useState<string[]>([`$ ${command}`]);

  useEffect(() => {
    const interval = setInterval(() => {
      setStageIndex((i) => {
        const next = Math.min(i + 1, stages.length - 1);
        setLog((prev) => [...prev, stages[next]]);
        return next;
      });
    }, 1800);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="glass-card p-6">
      <div className="mb-4 flex items-center gap-3">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-accent border-t-transparent" />
        <div>
          <div className="text-sm font-semibold text-white">{stages[stageIndex]}</div>
          <div className="text-xs text-slate-500">This may take up to a few minutes depending on scan scope.</div>
        </div>
      </div>

      <div className="mb-4 h-1.5 w-full overflow-hidden rounded-full bg-white/5">
        <motion.div
          className="h-full bg-accent"
          animate={{ width: `${((stageIndex + 1) / stages.length) * 100}%` }}
          transition={{ ease: "easeOut", duration: 0.6 }}
        />
      </div>

      <div className="max-h-48 overflow-y-auto rounded-lg bg-black/40 p-3 font-mono text-xs text-success">
        {log.map((line, i) => (
          <div key={i}>{line}</div>
        ))}
      </div>
    </div>
  );
}
