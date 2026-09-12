"use client";

import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { ArrowDownTrayIcon, DocumentChartBarIcon } from "@heroicons/react/24/outline";
import { getAllScans } from "@/services/scan";
import { downloadReport } from "@/services/report";

export default function ReportsPage() {
  const { data, isLoading } = useQuery({
    queryKey: ["scans", "reports"],
    queryFn: () => getAllScans(1, 50)
  });

  const completed = data?.scans.filter((s) => s.status === "completed") ?? [];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-white">Reports</h1>
        <p className="text-sm text-slate-400">
          Executive summaries and exportable reports for every completed scan.
        </p>
      </div>

      {isLoading ? (
        <div className="py-12 text-center text-sm text-slate-500">Loading...</div>
      ) : completed.length === 0 ? (
        <div className="glass-card py-12 text-center text-sm text-slate-500">
          No completed scans yet.
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {completed.map((s) => (
            <div key={s._id} className="glass-card glass-card-hover p-5">
              <div className="mb-3 flex items-center gap-2">
                <DocumentChartBarIcon className="h-5 w-5 text-accent" />
                <Link href={`/dashboard/scan/${s._id}`} className="font-semibold text-white hover:text-accent">
                  {s.target}
                </Link>
              </div>
              <div className="mb-4 space-y-1 text-xs text-slate-400">
                <div>Risk score: <span className="font-semibold text-slate-200">{s.riskScore}</span></div>
                <div>Open ports: {s.ports.filter((p) => p.state === "open").length}</div>
                <div>{new Date(s.createdAt).toLocaleString()}</div>
              </div>
              <div className="flex gap-2">
                <button onClick={() => downloadReport(s._id, "pdf")} className="btn-secondary flex-1 text-xs">
                  <ArrowDownTrayIcon className="h-3.5 w-3.5" /> PDF
                </button>
                <button onClick={() => downloadReport(s._id, "csv")} className="btn-secondary flex-1 text-xs">
                  <ArrowDownTrayIcon className="h-3.5 w-3.5" /> CSV
                </button>
                <button onClick={() => downloadReport(s._id, "json")} className="btn-secondary flex-1 text-xs">
                  <ArrowDownTrayIcon className="h-3.5 w-3.5" /> JSON
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
