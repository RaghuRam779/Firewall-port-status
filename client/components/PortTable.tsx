"use client";

import { useMemo, useState } from "react";
import clsx from "clsx";
import { PortResult } from "@/services/scan";

type SortKey = "port" | "state" | "service" | "risk";

const riskOrder: Record<PortResult["risk"], number> = { Low: 0, Medium: 1, High: 2, Critical: 3 };
const riskBadge: Record<PortResult["risk"], string> = {
  Low: "badge-low",
  Medium: "badge-medium",
  High: "badge-high",
  Critical: "badge-critical"
};
const stateColor: Record<PortResult["state"], string> = {
  open: "text-success",
  closed: "text-slate-500",
  filtered: "text-warning"
};

export function PortTable({ ports }: { ports: PortResult[] }) {
  const [search, setSearch] = useState("");
  const [sortKey, setSortKey] = useState<SortKey>("port");
  const [sortAsc, setSortAsc] = useState(true);
  const [stateFilter, setStateFilter] = useState<"all" | PortResult["state"]>("all");

  const filtered = useMemo(() => {
    let rows = ports;
    if (stateFilter !== "all") rows = rows.filter((p) => p.state === stateFilter);
    if (search.trim()) {
      const q = search.toLowerCase();
      rows = rows.filter(
        (p) =>
          p.service.toLowerCase().includes(q) ||
          p.version.toLowerCase().includes(q) ||
          String(p.port).includes(q)
      );
    }
    const sorted = [...rows].sort((a, b) => {
      let cmp = 0;
      if (sortKey === "port") cmp = a.port - b.port;
      else if (sortKey === "state") cmp = a.state.localeCompare(b.state);
      else if (sortKey === "service") cmp = a.service.localeCompare(b.service);
      else if (sortKey === "risk") cmp = riskOrder[a.risk] - riskOrder[b.risk];
      return sortAsc ? cmp : -cmp;
    });
    return sorted;
  }, [ports, search, sortKey, sortAsc, stateFilter]);

  function toggleSort(key: SortKey) {
    if (sortKey === key) setSortAsc((a) => !a);
    else {
      setSortKey(key);
      setSortAsc(true);
    }
  }

  return (
    <div className="glass-card p-5">
      <div className="mb-4 flex flex-wrap items-center gap-3">
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search port, service, version..."
          className="input-field max-w-xs"
        />
        <select
          value={stateFilter}
          onChange={(e) => setStateFilter(e.target.value as any)}
          className="input-field w-auto"
        >
          <option value="all">All states</option>
          <option value="open">Open</option>
          <option value="closed">Closed</option>
          <option value="filtered">Filtered</option>
        </select>
        <span className="ml-auto text-xs text-slate-500">{filtered.length} ports</span>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-white/10 text-xs uppercase tracking-wide text-slate-500">
              {(["port", "state", "service", "risk"] as SortKey[]).map((key) => (
                <th
                  key={key}
                  onClick={() => toggleSort(key)}
                  className="cursor-pointer select-none px-3 py-2 hover:text-slate-300"
                >
                  {key} {sortKey === key ? (sortAsc ? "↑" : "↓") : ""}
                </th>
              ))}
              <th className="px-3 py-2">Version</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((p) => (
              <tr
                key={`${p.port}-${p.protocol}`}
                className="border-b border-white/5 transition-colors hover:bg-white/5"
              >
                <td className="px-3 py-2.5 font-mono">
                  {p.port}/{p.protocol}
                </td>
                <td className={clsx("px-3 py-2.5 font-medium capitalize", stateColor[p.state])}>
                  {p.state}
                </td>
                <td className="px-3 py-2.5">{p.service}</td>
                <td className="px-3 py-2.5">
                  <span className={riskBadge[p.risk]}>{p.risk}</span>
                </td>
                <td className="px-3 py-2.5 text-slate-400">{p.version}</td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr>
                <td colSpan={5} className="px-3 py-8 text-center text-slate-500">
                  No ports match your filters.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
