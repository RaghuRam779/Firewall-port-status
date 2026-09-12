"use client";

import { useState } from "react";
import Link from "next/link";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { TrashIcon, ArrowDownTrayIcon } from "@heroicons/react/24/outline";
import { getAllScans, deleteScanById } from "@/services/scan";
import { downloadReport } from "@/services/report";

export default function ScanHistoryPage() {
  const [page, setPage] = useState(1);
  const queryClient = useQueryClient();

  const { data, isLoading, isError } = useQuery({
    queryKey: ["scans", page],
    queryFn: () => getAllScans(page, 20)
  });

  async function handleDelete(id: string) {
    if (!confirm("Delete this scan permanently?")) return;
    await deleteScanById(id);
    queryClient.invalidateQueries({ queryKey: ["scans"] });
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-white">Scan History</h1>
        <p className="text-sm text-slate-400">All scans you&apos;ve run, newest first.</p>
      </div>

      <div className="glass-card overflow-hidden">
        {isLoading ? (
          <div className="py-12 text-center text-sm text-slate-500">Loading...</div>
        ) : isError ? (
          <div className="py-12 text-center text-sm text-danger">Could not load scan history.</div>
        ) : data?.scans.length === 0 ? (
          <div className="py-12 text-center text-sm text-slate-500">No scans found.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-white/10 text-xs uppercase tracking-wide text-slate-500">
                <th className="px-4 py-3">Target</th>
                <th className="px-4 py-3">Date</th>
                <th className="px-4 py-3">Duration</th>
                <th className="px-4 py-3">Risk Score</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {data?.scans.map((s) => (
                <tr key={s._id} className="border-b border-white/5 hover:bg-white/5">
                  <td className="px-4 py-3">
                    <Link href={`/dashboard/scan/${s._id}`} className="text-accent hover:underline">
                      {s.target}
                    </Link>
                  </td>
                  <td className="px-4 py-3 text-slate-400">
                    {new Date(s.createdAt).toLocaleString()}
                  </td>
                  <td className="px-4 py-3 text-slate-400">{(s.durationMs / 1000).toFixed(1)}s</td>
                  <td className="px-4 py-3 font-semibold text-white">{s.riskScore}</td>
                  <td className="px-4 py-3 capitalize text-slate-400">{s.status}</td>
                  <td className="px-4 py-3">
                    <div className="flex justify-end gap-2">
                      <button
                        onClick={() => downloadReport(s._id, "pdf")}
                        className="rounded-lg p-1.5 text-slate-400 hover:bg-white/10 hover:text-accent"
                        title="Export PDF"
                      >
                        <ArrowDownTrayIcon className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(s._id)}
                        className="rounded-lg p-1.5 text-slate-400 hover:bg-danger/10 hover:text-danger"
                        title="Delete"
                      >
                        <TrashIcon className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
            </table>
          </div>
        )}
      </div>

      {data && data.total > 20 && (
        <div className="flex justify-center gap-2">
          <button
            disabled={page === 1}
            onClick={() => setPage((p) => p - 1)}
            className="btn-secondary text-xs disabled:opacity-40"
          >
            Previous
          </button>
          <span className="px-3 py-2 text-xs text-slate-400">Page {page}</span>
          <button
            disabled={page * 20 >= data.total}
            onClick={() => setPage((p) => p + 1)}
            className="btn-secondary text-xs disabled:opacity-40"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
}
