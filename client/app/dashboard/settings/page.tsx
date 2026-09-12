"use client";

import { useEffect, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { getSettings, updateSettings, UserSettings } from "@/services/settings";

const scanTypes = ["tcp_connect", "syn", "udp", "service_version", "os_detection", "aggressive", "firewall_detection"];
const portPresets = ["top100", "top1000", "all", "custom"];

export default function SettingsPage() {
  const queryClient = useQueryClient();
  const { data, isLoading } = useQuery({ queryKey: ["settings"], queryFn: getSettings });
  const [form, setForm] = useState<UserSettings | null>(null);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (data) setForm(data);
  }, [data]);

  const mutation = useMutation({
    mutationFn: updateSettings,
    onSuccess: (settings) => {
      queryClient.setQueryData(["settings"], settings);
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    }
  });

  if (isLoading || !form) {
    return <div className="py-12 text-center text-sm text-slate-500">Loading settings...</div>;
  }

  function handleSave(e: React.FormEvent) {
    e.preventDefault();
    if (form) mutation.mutate(form);
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <h1 className="text-xl font-bold text-white">Settings</h1>
        <p className="text-sm text-slate-400">Configure default scan behavior and preferences.</p>
      </div>

      <form onSubmit={handleSave} className="glass-card space-y-5 p-6">
        <div>
          <label className="label">Default Scan Type</label>
          <select
            className="input-field"
            value={form.defaultScanType}
            onChange={(e) => setForm({ ...form, defaultScanType: e.target.value })}
          >
            {scanTypes.map((t) => (
              <option key={t} value={t}>
                {t.replace(/_/g, " ")}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="label">Default Port Preset</label>
          <select
            className="input-field"
            value={form.defaultPortPreset}
            onChange={(e) => setForm({ ...form, defaultPortPreset: e.target.value })}
          >
            {portPresets.map((p) => (
              <option key={p} value={p}>
                {p}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="label">Theme</label>
          <select
            className="input-field"
            value={form.theme}
            onChange={(e) => setForm({ ...form, theme: e.target.value as "dark" | "light" })}
          >
            <option value="dark">Dark</option>
            <option value="light">Light</option>
          </select>
        </div>

        <div>
          <label className="label">Maximum Scan Duration (seconds)</label>
          <input
            type="number"
            min={10}
            max={600}
            className="input-field"
            value={Math.round(form.scanTimeoutMs / 1000)}
            onChange={(e) => setForm({ ...form, scanTimeoutMs: Number(e.target.value) * 1000 })}
          />
        </div>

        <label className="flex cursor-pointer items-center gap-2 text-sm text-slate-300">
          <input
            type="checkbox"
            className="accent-accent"
            checked={form.notificationsEnabled}
            onChange={(e) => setForm({ ...form, notificationsEnabled: e.target.checked })}
          />
          Enable notifications
        </label>

        <div className="flex items-center gap-3">
          <button type="submit" disabled={mutation.isPending} className="btn-primary">
            {mutation.isPending ? "Saving..." : "Save Settings"}
          </button>
          {saved && <span className="text-xs text-success">Saved</span>}
        </div>
      </form>
    </div>
  );
}
