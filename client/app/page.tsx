"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import {
  ShieldCheckIcon,
  BoltIcon,
  ChartBarIcon,
  DocumentTextIcon
} from "@heroicons/react/24/outline";

const features = [
  {
    icon: BoltIcon,
    title: "Real Nmap Scanning",
    desc: "TCP, SYN, UDP, service and OS detection powered by the industry-standard Nmap engine."
  },
  {
    icon: ShieldCheckIcon,
    title: "Firewall Detection",
    desc: "Identify filtered ports and firewall behavior with ACK-based probing and risk scoring."
  },
  {
    icon: ChartBarIcon,
    title: "Actionable Analytics",
    desc: "Track exposure trends, top open ports, and risk over time across every scan you run."
  },
  {
    icon: DocumentTextIcon,
    title: "Exportable Reports",
    desc: "Generate PDF, CSV, and JSON reports with recommendations ready to share with your team."
  }
];

export default function LandingPage() {
  return (
    <main className="relative min-h-screen overflow-hidden bg-primary">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(0,229,255,0.12),transparent_40%),radial-gradient(circle_at_80%_60%,rgba(16,185,129,0.10),transparent_40%)]" />

      <nav className="relative z-10 mx-auto flex max-w-7xl items-center justify-between px-6 py-6">
        <div className="flex items-center gap-2">
          <ShieldCheckIcon className="h-7 w-7 text-accent" />
          <span className="text-lg font-bold tracking-tight text-white">
            Firewall Port Status Checker
          </span>
        </div>
        <div className="flex items-center gap-3">
          <Link href="/login" className="btn-secondary text-sm">
            Log In
          </Link>
          <Link href="/register" className="btn-primary text-sm">
            Get Started
          </Link>
        </div>
      </nav>

      <section className="relative z-10 mx-auto flex max-w-5xl flex-col items-center px-6 pt-24 text-center">
        <motion.span
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6 rounded-full border border-accent/30 bg-accent/10 px-4 py-1.5 text-xs font-medium text-accent"
        >
          Nmap-powered network intelligence
        </motion.span>

        <motion.h1
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="text-4xl font-extrabold tracking-tight text-white sm:text-6xl"
        >
          Firewall Port Status Checker
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mt-6 max-w-2xl text-lg text-slate-400"
        >
          Analyze firewall exposure and network services using Nmap in real time.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mt-10 flex flex-wrap items-center justify-center gap-4"
        >
          <Link href="/register" className="btn-primary px-6 py-3 text-base">
            Start Scan
          </Link>
          <Link href="#docs" className="btn-secondary px-6 py-3 text-base">
            Documentation
          </Link>
          <Link href="/login" className="btn-secondary px-6 py-3 text-base">
            View Reports
          </Link>
        </motion.div>

        <div className="mt-6 max-w-xl rounded-lg border border-warning/30 bg-warning/10 px-4 py-3 text-xs text-warning">
          For authorized security testing only. Only scan systems you own or have explicit
          written permission to test.
        </div>
      </section>

      <section className="relative z-10 mx-auto mt-24 grid max-w-6xl grid-cols-1 gap-6 px-6 pb-24 sm:grid-cols-2 lg:grid-cols-4">
        {features.map((f, i) => (
          <motion.div
            key={f.title}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.08 }}
            className="glass-card glass-card-hover p-6"
          >
            <f.icon className="mb-4 h-8 w-8 text-accent" />
            <h3 className="mb-2 text-base font-semibold text-white">{f.title}</h3>
            <p className="text-sm text-slate-400">{f.desc}</p>
          </motion.div>
        ))}
      </section>
    </main>
  );
}
