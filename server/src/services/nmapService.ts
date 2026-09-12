import { execFile } from "child_process";
import { env } from "../config/env";
import { logger } from "../utils/logger";
import {
  isValidPortRange,
  isValidTarget,
  ScanType
} from "../utils/validators";
import { PortResult, ScanRequestOptions } from "../types";

/**
 * Maps our whitelisted, high-level scan options to a fixed argv array.
 * We NEVER interpolate raw user strings into a shell command - execFile()
 * receives an argv array directly, so there is no shell to inject into.
 * The only free-form user input that reaches the command line is the
 * validated target and, for "custom" port ranges, a validated port list -
 * both are checked against strict regexes before this function is called.
 */
export function buildNmapArgs(opts: ScanRequestOptions): string[] {
  const args: string[] = [];

  if (!isValidTarget(opts.target)) {
    throw new Error("Invalid scan target");
  }

  const scanTypeFlags: Partial<Record<ScanType, string>> = {
    tcp_connect: "-sT",
    syn: "-sS",
    udp: "-sU",
    service_version: "-sV",
    os_detection: "-O",
    aggressive: "-A",
    firewall_detection: "-sA" // ACK scan, commonly used to map firewall rulesets
  };

  const seenFlags = new Set<string>();
  for (const type of opts.scanTypes) {
    const flag = scanTypeFlags[type as ScanType];
    if (flag && !seenFlags.has(flag)) {
      args.push(flag);
      seenFlags.add(flag);
    }
  }

  // Default to a safe TCP connect scan if nothing (valid) was selected.
  if (args.length === 0) {
    args.push("-sT");
  }

  // Port selection
  switch (opts.portPreset) {
    case "top100":
      args.push("--top-ports", "100");
      break;
    case "top1000":
      // This is nmap's default port set, but we're explicit for clarity.
      args.push("--top-ports", "1000");
      break;
    case "all":
      args.push("-p-");
      break;
    case "custom":
      if (!opts.customPortRange || !isValidPortRange(opts.customPortRange)) {
        throw new Error("Invalid custom port range");
      }
      args.push("-p", opts.customPortRange);
      break;
    default:
      throw new Error("Invalid port preset");
  }

  if (opts.timingTemplate) {
    args.push(`-${opts.timingTemplate}`);
  }

  if (opts.usePn) {
    args.push("-Pn");
  }

  // Machine-readable-ish plain text to stdout; we parse this below.
  args.push("-oN", "-");

  // Target must be the final argument.
  args.push(opts.target);

  return args;
}

export interface NmapRunResult {
  rawOutput: string;
  durationMs: number;
}

export function runNmap(args: string[]): Promise<NmapRunResult> {
  const start = Date.now();
  return new Promise((resolve, reject) => {
    execFile(
      env.nmapPath,
      args,
      { timeout: env.maxScanDurationMs, maxBuffer: 10 * 1024 * 1024 },
      (error, stdout, stderr) => {
        const durationMs = Date.now() - start;
        if (error) {
          logger.error("Nmap execution failed", { error: error.message, stderr, args });
          if ((error as NodeJS.ErrnoException).code === "ENOENT") {
            reject(new Error("Nmap is not installed or NMAP_PATH is not configured on the server."));
            return;
          }
          reject(new Error(stderr || error.message || "Nmap execution failed"));
          return;
        }
        resolve({ rawOutput: stdout, durationMs });
      }
    );
  });
}

const HIGH_RISK_SERVICES = ["telnet", "ftp", "smb", "rpcbind", "netbios-ssn", "vnc"];
const MEDIUM_RISK_SERVICES = ["http", "smtp", "pop3", "imap", "mysql", "ms-sql-s", "rdp"];

function classifyPortRisk(port: number, service: string): PortResult["risk"] {
  const svc = service.toLowerCase();
  if (HIGH_RISK_SERVICES.some((s) => svc.includes(s)) || port === 445 || port === 23) {
    return "Critical";
  }
  if (MEDIUM_RISK_SERVICES.some((s) => svc.includes(s))) {
    return "Medium";
  }
  return "Low";
}

/** Parses nmap's normal (-oN) output format into structured port results. */
export function parseNmapOutput(raw: string): {
  ports: PortResult[];
  hostUp: boolean;
  osGuess?: string;
  latencyMs?: number;
} {
  const ports: PortResult[] = [];
  const hostUp = /Host is up/i.test(raw) || /\(1 host up\)/i.test(raw);
  let osGuess: string | undefined;
  let latencyMs: number | undefined;

  const lines = raw.split("\n");
  const portLineRegex = /^(\d+)\/(tcp|udp)\s+(open|closed|filtered)\s+(\S+)\s*(.*)$/;

  for (const line of lines) {
    const trimmed = line.trim();
    const match = trimmed.match(portLineRegex);
    if (match) {
      const [, portStr, protocol, state, service, version] = match;
      const port = parseInt(portStr, 10);
      ports.push({
        port,
        protocol: protocol as "tcp" | "udp",
        state: state as PortResult["state"],
        service,
        version: version.trim() || "unknown",
        risk: classifyPortRisk(port, service)
      });
      continue;
    }

    const osMatch = trimmed.match(/^OS details:\s*(.+)$/) || trimmed.match(/^Running:\s*(.+)$/);
    if (osMatch) {
      osGuess = osMatch[1];
    }

    const latencyMatch = trimmed.match(/Host is up \(([\d.]+)s latency\)/);
    if (latencyMatch) {
      latencyMs = Math.round(parseFloat(latencyMatch[1]) * 1000);
    }
  }

  return { ports, hostUp, osGuess, latencyMs };
}

export function computeRiskScore(ports: PortResult[], firewallDetected: boolean): number {
  if (ports.length === 0) return 0;
  const weights: Record<PortResult["risk"], number> = {
    Low: 2,
    Medium: 8,
    High: 15,
    Critical: 20
  };
  const openPorts = ports.filter((p) => p.state === "open");
  let score = openPorts.reduce((sum, p) => sum + weights[p.risk], 0);
  if (!firewallDetected) score += 10;
  return Math.min(100, score);
}

export function generateRecommendations(ports: PortResult[], firewallDetected: boolean): string[] {
  const recs: string[] = [];
  const open = ports.filter((p) => p.state === "open");
  const services = open.map((p) => p.service.toLowerCase());

  if (services.includes("telnet")) recs.push("Disable Telnet and replace it with SSH.");
  if (services.some((s) => s.includes("smb"))) recs.push("Restrict SMB access to trusted internal hosts only.");
  if (services.some((s) => s.includes("ftp"))) recs.push("Disable anonymous FTP access or migrate to SFTP/FTPS.");
  if (services.includes("http") && !services.includes("https")) {
    recs.push("Enable HTTPS and redirect HTTP traffic to it.");
  }
  if (open.length > 10) recs.push("Review and close unnecessary open ports to reduce attack surface.");
  if (!firewallDetected) recs.push("Enable and properly configure host or network firewall rules.");
  if (open.some((p) => p.version === "unknown")) {
    recs.push("Run service version detection and patch any outdated software found.");
  }
  if (recs.length === 0) recs.push("No immediate issues detected. Continue routine monitoring.");

  return recs;
}
