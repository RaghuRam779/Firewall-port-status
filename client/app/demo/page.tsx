import Link from "next/link";
import {
  BoltIcon,
  ChartBarIcon,
  ShieldCheckIcon,
  ShieldExclamationIcon
} from "@heroicons/react/24/outline";

const recentScans = [
  { target: "192.168.1.10", status: "completed", risk: 18, date: "Today, 10:42" },
  { target: "scanme.nmap.org", status: "completed", risk: 42, date: "Yesterday" },
  { target: "10.0.0.24", status: "completed", risk: 67, date: "Sep 10, 2026" }
];

export default function DemoPage() {
  return (
    <main className="min-h-screen bg-primary text-slate-100">
      <header className="flex items-center justify-between border-b border-white/10 bg-secondary/30 px-5 py-4 sm:px-8">
        <div className="flex items-center gap-3">
          <ShieldCheckIcon className="h-7 w-7 text-accent" />
          <div>
            <div className="font-bold text-white">Firewall Port Status Checker</div>
            <div className="text-xs text-slate-500">Live dashboard preview</div>
          </div>
        </div>
        <Link href="/login" className="btn-secondary text-sm">Open Account</Link>
      </header>

      <div className="mx-auto max-w-7xl space-y-6 px-5 py-8 sm:px-8">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <div className="mb-2 inline-flex items-center gap-2 rounded-full border border-accent/20 bg-accent/10 px-3 py-1 text-xs text-accent">
              <span className="h-1.5 w-1.5 rounded-full bg-accent" /> Demo data
            </div>
            <h1 className="text-2xl font-bold text-white">Security dashboard</h1>
            <p className="mt-1 text-sm text-slate-400">Monitor exposure, scan history, and network risk from one place.</p>
          </div>
          <Link href="/register" className="btn-primary text-sm">Create account</Link>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Metric icon={BoltIcon} label="Total scans" value="24" />
          <Metric icon={ShieldCheckIcon} label="Open ports found" value="38" accent="text-success" />
          <Metric icon={ShieldExclamationIcon} label="Average risk score" value="34" accent="text-warning" />
          <Metric icon={ChartBarIcon} label="Average scan time" value="5.4s" />
        </div>

        <section className="glass-card overflow-hidden">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/10 px-5 py-4">
            <div>
              <h2 className="font-semibold text-white">Recent scans</h2>
              <p className="mt-1 text-xs text-slate-500">Example results from the monitoring workflow.</p>
            </div>
            <Link href="/login" className="text-xs text-accent hover:underline">View full history</Link>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[620px] text-left text-sm">
              <thead className="text-xs uppercase tracking-wide text-slate-500">
                <tr className="border-b border-white/10">
                  <th className="px-5 py-3">Target</th><th className="px-5 py-3">Status</th>
                  <th className="px-5 py-3">Risk</th><th className="px-5 py-3">Date</th>
                </tr>
              </thead>
              <tbody>
                {recentScans.map((scan) => (
                  <tr key={scan.target} className="border-b border-white/5">
                    <td className="px-5 py-4 font-mono text-accent">{scan.target}</td>
                    <td className="px-5 py-4 capitalize text-success">{scan.status}</td>
                    <td className={`px-5 py-4 font-semibold ${scan.risk >= 50 ? "text-danger" : scan.risk >= 25 ? "text-warning" : "text-success"}`}>{scan.risk}</td>
                    <td className="px-5 py-4 text-slate-400">{scan.date}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <section className="glass-card p-5">
            <div className="mb-5 flex items-center justify-between"><h2 className="font-semibold text-white">Risk trend</h2><span className="text-xs text-slate-500">Last 30 days</span></div>
            <div className="flex h-40 items-end gap-2 border-b border-l border-white/10 px-4 pb-0">
              {[35, 52, 42, 68, 48, 40, 28, 34, 22, 30, 18, 24].map((height, index) => <div key={index} className="flex-1 rounded-t bg-accent/70" style={{ height: `${height}%` }} />)}
            </div>
          </section>
          <section className="glass-card p-5">
            <h2 className="mb-4 font-semibold text-white">Common open ports</h2>
            <div className="space-y-4">
              {[['443 / HTTPS', 82], ['22 / SSH', 56], ['80 / HTTP', 41], ['3306 / MySQL', 18]].map(([label, width]) => <div key={label}><div className="mb-1 flex justify-between text-xs text-slate-400"><span>{label}</span><span>{width}%</span></div><div className="h-2 rounded-full bg-white/10"><div className="h-2 rounded-full bg-accent" style={{ width: `${width}%` }} /></div></div>)}
            </div>
          </section>
        </div>

        <div className="rounded-lg border border-warning/30 bg-warning/10 px-4 py-3 text-xs text-warning">For authorized security testing only. Scan systems you own or are explicitly authorized to test.</div>
      </div>
    </main>
  );
}

function Metric({ icon: Icon, label, value, accent }: { icon: React.ComponentType<{ className?: string }>; label: string; value: string; accent?: string }) {
  return <div className="glass-card p-5"><Icon className="mb-4 h-6 w-6 text-accent" /><div className={`text-2xl font-bold text-white ${accent ?? ""}`}>{value}</div><div className="mt-1 text-xs text-slate-400">{label}</div></div>;
}