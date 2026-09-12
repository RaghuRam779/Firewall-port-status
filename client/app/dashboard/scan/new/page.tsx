"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useMutation } from "@tanstack/react-query";
import clsx from "clsx";
import { LegalNotice } from "@/components/LegalNotice";
import { ScanProgress } from "@/components/ScanProgress";
import { startScan, NewScanPayload } from "@/services/scan";

const scanTypeOptions: { value: string; label: string }[] = [
  { value: "tcp_connect", label: "TCP Connect Scan" },
  { value: "syn", label: "SYN Scan" },
  { value: "udp", label: "UDP Scan" },
  { value: "service_version", label: "Service Version Detection" },
  { value: "os_detection", label: "OS Detection" },
  { value: "aggressive", label: "Aggressive Scan" },
  { value: "firewall_detection", label: "Firewall Detection" }
];

export default function NewScanPage() {
  const router = useRouter();
  const [target, setTarget] = useState("");
  const [portPreset, setPortPreset] = useState<NewScanPayload["portPreset"]>("top100");
  const [customPortRange, setCustomPortRange] = useState("1-1024");
  const [scanTypes, setScanTypes] = useState<string[]>(["tcp_connect", "service_version"]);
  const [timingTemplate, setTimingTemplate] = useState("T3");
  const [usePn, setUsePn] = useState(false);
  const [authorized, setAuthorized] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const mutation = useMutation({
    mutationFn: startScan,
    onSuccess: (scan) => {
      router.push(`/dashboard/scan/${scan._id}`);
    }
  });

  function toggleScanType(value: string) {
    setScanTypes((prev) =>
      prev.includes(value) ? prev.filter((v) => v !== value) : [...prev, value]
    );
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setFormError(null);

    if (!target.trim()) {
      setFormError("Please enter a target IP address, hostname, or CIDR range.");
      return;
    }
    if (scanTypes.length === 0) {
      setFormError("Select at least one scan type.");
      return;
    }
    if (!authorized) {
      setFormError("You must confirm authorization before starting a scan.");
      return;
    }

    mutation.mutate({
      target: target.trim(),
      portPreset,
      customPortRange: portPreset === "custom" ? customPortRange : undefined,
      scanTypes,
      timingTemplate,
      usePn,
      authorizationConfirmed: authorized
    });
  }

  if (mutation.isPending) {
    return (
      <div className="mx-auto max-w-2xl space-y-4">
        <h1 className="text-xl font-bold text-white">Scanning {target}</h1>
        <ScanProgress command={`nmap ${scanTypes.join(" ")} ${target}`} />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div>
        <h1 className="text-xl font-bold text-white">New Scan</h1>
        <p className="text-sm text-slate-400">Configure and launch an Nmap-powered port scan.</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="glass-card space-y-4 p-6">
          <div>
            <label className="label">Target</label>
            <input
              className="input-field"
              placeholder="e.g. scanme.nmap.org, 192.168.1.10, or 10.0.0.0/24"
              value={target}
              onChange={(e) => setTarget(e.target.value)}
            />
          </div>

          <div>
            <label className="label">Port Options</label>
            <div className="flex flex-wrap gap-2">
              {(
                [
                  ["top100", "Top 100"],
                  ["top1000", "Top 1000"],
                  ["all", "All Ports"],
                  ["custom", "Custom Range"]
                ] as const
              ).map(([value, label]) => (
                <button
                  type="button"
                  key={value}
                  onClick={() => setPortPreset(value)}
                  className={clsx(
                    "rounded-lg border px-3 py-2 text-xs font-medium transition-colors",
                    portPreset === value
                      ? "border-accent bg-accent/15 text-accent"
                      : "border-white/10 bg-white/5 text-slate-400 hover:text-slate-200"
                  )}
                >
                  {label}
                </button>
              ))}
            </div>
            {portPreset === "custom" && (
              <input
                className="input-field mt-2"
                placeholder="e.g. 1-1024,3306,8080"
                value={customPortRange}
                onChange={(e) => setCustomPortRange(e.target.value)}
              />
            )}
          </div>

          <div>
            <label className="label">Scan Types</label>
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
              {scanTypeOptions.map((opt) => (
                <label
                  key={opt.value}
                  className={clsx(
                    "flex cursor-pointer items-center gap-2 rounded-lg border px-3 py-2 text-xs transition-colors",
                    scanTypes.includes(opt.value)
                      ? "border-accent/50 bg-accent/10 text-slate-100"
                      : "border-white/10 bg-white/5 text-slate-400"
                  )}
                >
                  <input
                    type="checkbox"
                    className="accent-accent"
                    checked={scanTypes.includes(opt.value)}
                    onChange={() => toggleScanType(opt.value)}
                  />
                  {opt.label}
                </label>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">Timing Template</label>
              <select
                className="input-field"
                value={timingTemplate}
                onChange={(e) => setTimingTemplate(e.target.value)}
              >
                {["T0", "T1", "T2", "T3", "T4", "T5"].map((t) => (
                  <option key={t} value={t}>
                    {t} {t === "T3" ? "(Normal)" : t === "T4" ? "(Aggressive)" : ""}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex items-end">
              <label className="flex cursor-pointer items-center gap-2 text-xs text-slate-300">
                <input
                  type="checkbox"
                  className="accent-accent"
                  checked={usePn}
                  onChange={(e) => setUsePn(e.target.checked)}
                />
                Skip host discovery (-Pn)
              </label>
            </div>
          </div>
        </div>

        <LegalNotice checked={authorized} onChange={setAuthorized} />

        {(formError || mutation.isError) && (
          <div className="rounded-lg border border-danger/30 bg-danger/10 px-4 py-3 text-sm text-danger">
            {formError ?? (mutation.error as any)?.response?.data?.message ?? "Failed to start scan."}
          </div>
        )}

        <button type="submit" className="btn-primary w-full py-3">
          Start Scan
        </button>
      </form>
    </div>
  );
}
