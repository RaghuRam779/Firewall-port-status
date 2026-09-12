"use client";

import { useState } from "react";
import Link from "next/link";
import { BellIcon, MagnifyingGlassIcon, MoonIcon, SunIcon } from "@heroicons/react/24/outline";
import { useAuth } from "@/context/AuthContext";

const mobileNavItems = [
  ["/dashboard", "Dashboard"],
  ["/dashboard/scan/new", "New Scan"],
  ["/dashboard/history", "Scan History"],
  ["/dashboard/reports", "Reports"],
  ["/dashboard/analytics", "Analytics"],
  ["/dashboard/settings", "Settings"],
  ["/dashboard/profile", "Profile"]
] as const;

export function Navbar() {
  const { user, logout } = useAuth();
  const [dark, setDark] = useState(true);
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header className="relative flex h-16 items-center justify-between border-b border-white/10 bg-secondary/30 px-4 sm:px-6">
      <button
        onClick={() => setMenuOpen((o) => !o)}
        className="rounded-lg p-2 text-slate-400 hover:bg-white/5 hover:text-slate-100 lg:hidden"
        aria-label="Open navigation"
        aria-expanded={menuOpen}
      >
        <span className="block h-0.5 w-5 bg-current" />
        <span className="mt-1 block h-0.5 w-5 bg-current" />
        <span className="mt-1 block h-0.5 w-5 bg-current" />
      </button>
      <div className="hidden max-w-sm flex-1 items-center gap-2 rounded-lg border border-white/10 bg-white/5 px-3 py-2 md:flex">
        <MagnifyingGlassIcon className="h-4 w-4 text-slate-500" />
        <input
          placeholder="Search targets, scans, reports..."
          className="w-full bg-transparent text-sm text-slate-200 placeholder-slate-500 outline-none"
        />
      </div>

      <div className="ml-auto flex items-center gap-4">
        <button
          onClick={() => setDark((d) => !d)}
          className="rounded-lg p-2 text-slate-400 transition-colors hover:bg-white/5 hover:text-slate-100"
          aria-label="Toggle dark mode"
        >
          {dark ? <MoonIcon className="h-5 w-5" /> : <SunIcon className="h-5 w-5" />}
        </button>

        <button
          className="relative rounded-lg p-2 text-slate-400 transition-colors hover:bg-white/5 hover:text-slate-100"
          aria-label="Notifications"
        >
          <BellIcon className="h-5 w-5" />
          <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-danger" />
        </button>

        <div className="relative">
          <button
            onClick={() => setMenuOpen((o) => !o)}
            className="flex items-center gap-2 rounded-lg px-2 py-1.5 hover:bg-white/5"
          >
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-accent/20 text-sm font-semibold text-accent">
              {user?.name?.charAt(0).toUpperCase() ?? "U"}
            </div>
            <span className="hidden text-sm text-slate-200 sm:block">{user?.name}</span>
          </button>

          {menuOpen && (
            <div className="absolute right-0 top-12 w-44 rounded-lg border border-white/10 bg-secondary p-1 shadow-lg">
              <div className="px-3 py-2 text-xs text-slate-500">{user?.role}</div>
              <button
                onClick={logout}
                className="w-full rounded-md px-3 py-2 text-left text-sm text-danger hover:bg-danger/10"
              >
                Log out
              </button>
            </div>
          )}
        </div>
      </div>

      {menuOpen && (
        <nav className="absolute left-4 right-4 top-16 z-20 rounded-lg border border-white/10 bg-secondary p-2 shadow-lg lg:hidden">
          {mobileNavItems.map(([href, label]) => (
            <Link key={href} href={href} onClick={() => setMenuOpen(false)} className="block rounded-md px-3 py-2 text-sm text-slate-300 hover:bg-white/5 hover:text-white">
              {label}
            </Link>
          ))}
        </nav>
      )}
    </header>
  );
}
