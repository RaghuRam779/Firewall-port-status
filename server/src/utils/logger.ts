/* Minimal structured logger. Swap for pino/winston in a larger deployment. */

type Level = "info" | "warn" | "error" | "audit";

function write(level: Level, message: string, meta?: Record<string, unknown>) {
  const entry = {
    level,
    time: new Date().toISOString(),
    message,
    ...meta
  };
  const line = JSON.stringify(entry);
  if (level === "error") {
    console.error(line);
  } else {
    console.log(line);
  }
}

export const logger = {
  info: (message: string, meta?: Record<string, unknown>) => write("info", message, meta),
  warn: (message: string, meta?: Record<string, unknown>) => write("warn", message, meta),
  error: (message: string, meta?: Record<string, unknown>) => write("error", message, meta),
  /** Security-relevant events: logins, scans initiated, deletions, etc. */
  audit: (message: string, meta?: Record<string, unknown>) => write("audit", message, meta)
};
