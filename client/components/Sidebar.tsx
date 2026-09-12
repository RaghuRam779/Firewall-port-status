"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import clsx from "clsx";
import {
  Squares2X2Icon,
  MagnifyingGlassCircleIcon,
  ClockIcon,
  DocumentChartBarIcon,
  ChartBarSquareIcon,
  Cog6ToothIcon,
  UserCircleIcon,
  ShieldCheckIcon
} from "@heroicons/react/24/outline";

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: Squares2X2Icon },
  { href: "/dashboard/scan/new", label: "New Scan", icon: MagnifyingGlassCircleIcon },
  { href: "/dashboard/history", label: "Scan History", icon: ClockIcon },
  { href: "/dashboard/reports", label: "Reports", icon: DocumentChartBarIcon },
  { href: "/dashboard/analytics", label: "Analytics", icon: ChartBarSquareIcon },
  { href: "/dashboard/settings", label: "Settings", icon: Cog6ToothIcon },
  { href: "/dashboard/profile", label: "Profile", icon: UserCircleIcon }
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="hidden w-64 shrink-0 flex-col border-r border-white/10 bg-secondary/40 p-4 lg:flex">
      <Link href="/dashboard" className="mb-8 flex items-center gap-2 px-2">
        <ShieldCheckIcon className="h-7 w-7 text-accent" />
        <span className="text-sm font-bold leading-tight text-white">
          Firewall Port
          <br />
          Status Checker
        </span>
      </Link>

      <nav className="flex flex-1 flex-col gap-1">
        {navItems.map((item) => {
          const active = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={clsx(
                "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                active
                  ? "bg-accent/15 text-accent"
                  : "text-slate-400 hover:bg-white/5 hover:text-slate-100"
              )}
            >
              <item.icon className="h-5 w-5" />
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="rounded-lg border border-warning/20 bg-warning/5 p-3 text-[11px] leading-snug text-warning/90">
        Only scan systems you own or are explicitly authorized to test.
      </div>
    </aside>
  );
}
