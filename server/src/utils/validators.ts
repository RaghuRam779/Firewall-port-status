/**
 * Strict validation for anything that ends up on the Nmap command line.
 * Nothing here is ever passed through a shell - see services/nmapService.ts,
 * which uses execFile() with an argv array, so these checks exist purely to
 * reject nonsensical / out-of-scope targets and options, not to prevent
 * shell metacharacter injection (execFile already prevents that class of bug).
 */

const IPV4_REGEX =
  /^(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}$/;

// Conservative hostname pattern: labels of letters/digits/hyphens, dot-separated.
const HOSTNAME_REGEX =
  /^(?=.{1,253}$)(?!-)[A-Za-z0-9-]{1,63}(?<!-)(\.(?!-)[A-Za-z0-9-]{1,63}(?<!-))*$/;

// Single IPv4 CIDR, e.g. 192.168.1.0/24 - allowed only when it appears in the allowlist.
const IPV4_CIDR_REGEX = /^(\d{1,3}\.){3}\d{1,3}\/(\d|[12]\d|3[0-2])$/;

export function isValidIPv4(value: string): boolean {
  return IPV4_REGEX.test(value);
}

export function isValidHostname(value: string): boolean {
  return HOSTNAME_REGEX.test(value);
}

export function isValidCIDR(value: string): boolean {
  if (!IPV4_CIDR_REGEX.test(value)) return false;
  const [address] = value.split("/");
  return isValidIPv4(address);
}

export function isValidTarget(value: string): boolean {
  return isValidIPv4(value) || isValidHostname(value) || isValidCIDR(value);
}

/** Matches "80", "1-1024" style ranges used in the custom port field. */
export function isValidPortRange(value: string): boolean {
  const PORT_RANGE_REGEX = /^\d{1,5}(-\d{1,5})?(,\d{1,5}(-\d{1,5})?)*$/;
  if (!PORT_RANGE_REGEX.test(value)) return false;
  return value
    .split(",")
    .flatMap((part) => part.split("-"))
    .every((n) => {
      const num = parseInt(n, 10);
      return num >= 1 && num <= 65535;
    });
}

export const ALLOWED_SCAN_TYPES = [
  "tcp_connect",
  "syn",
  "udp",
  "service_version",
  "os_detection",
  "aggressive",
  "firewall_detection"
] as const;

export type ScanType = (typeof ALLOWED_SCAN_TYPES)[number];

export const ALLOWED_PORT_PRESETS = ["top100", "top1000", "all", "custom"] as const;
export type PortPreset = (typeof ALLOWED_PORT_PRESETS)[number];

export const ALLOWED_TIMING_TEMPLATES = ["T0", "T1", "T2", "T3", "T4", "T5"] as const;
export type TimingTemplate = (typeof ALLOWED_TIMING_TEMPLATES)[number];

export function isValidScanType(value: string): value is ScanType {
  return (ALLOWED_SCAN_TYPES as readonly string[]).includes(value);
}

export function isValidPortPreset(value: string): value is PortPreset {
  return (ALLOWED_PORT_PRESETS as readonly string[]).includes(value);
}

export function isValidTimingTemplate(value: string): value is TimingTemplate {
  return (ALLOWED_TIMING_TEMPLATES as readonly string[]).includes(value);
}
