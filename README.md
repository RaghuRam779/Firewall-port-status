# Firewall Port Status Checker

A full-stack, Nmap-powered web application for scanning ports, detecting firewall behavior,
and generating security reports through a dark, professional dashboard.

> **Legal & ethical use.** This tool executes real Nmap scans against real network targets.
> Only scan systems you own or have explicit written authorization to test. Unauthorized
> scanning may violate the Computer Fraud and Abuse Act (US) or equivalent laws elsewhere,
> as well as your ISP's or cloud provider's terms of service. Every scan request requires an
> explicit authorization confirmation, both in the UI and enforced server-side — this cannot
> be bypassed from the client. The application intentionally does not include any features
> designed to evade detection or bypass authorization.

---

## Project Structure

```
/client                 Next.js 15 (App Router) + TypeScript frontend
  /app                   Pages (landing, auth, dashboard/*)
  /components             Reusable UI components (charts, tables, gauges)
  /services                Axios API layer (auth, scan, report, analytics, settings)
  /context                 React auth context
  Dockerfile

/server                 Express + TypeScript backend
  /src
    /config               Env loading, MongoDB connection
    /controllers            Route handlers
    /middleware              Auth (JWT), rate limiting, validation, error handling
    /models                   Mongoose schemas (User, Scan, Report, Settings)
    /routes                     Express routers
    /services                    nmapService.ts (safe Nmap execution), reportService.ts (PDF/CSV/JSON export)
    /utils                        Logger, validators, async handler
  Dockerfile

/nginx                  Reverse proxy config
docker-compose.yml       Orchestrates mongo, server, client, nginx
```

---

## Tech Stack

**Frontend:** React 19, Next.js 15, TypeScript, Tailwind CSS, Framer Motion, TanStack Query, Axios, React Hook Form, Zod, Recharts, Hero Icons

**Backend:** Node.js, Express, TypeScript, MongoDB + Mongoose, JWT, bcrypt, Helmet, CORS, express-rate-limit, express-validator, Morgan, PDFKit

**Scanning:** Nmap, invoked via `child_process.execFile()` (never a shell), with a fixed argv array built from whitelisted, validated inputs only.

---

## How Nmap Execution Is Secured

This is the most security-sensitive part of the app, so it's worth being explicit:

1. **No shell involved.** `execFile()` is used instead of `exec()`, so there is no shell to inject into — arguments are passed as an array, not a concatenated string.
2. **Targets are validated** against strict IPv4 / hostname / CIDR regexes (`server/src/utils/validators.ts`) before ever reaching the command line.
3. **Only whitelisted flags** can be added to the command — scan type, port preset, and timing template are all mapped from a fixed enum to a fixed flag, never passed through from raw user text.
4. **Custom port ranges** are validated against a strict `\d+(-\d+)?` pattern.
5. **Every scan requires `authorizationConfirmed: true`**, checked both client-side (checkbox) and server-side (rejected with 400 otherwise).
6. **Optional target allowlist** (`SCAN_TARGET_ALLOWLIST`) lets an operator restrict a deployment to a fixed set of targets.
7. **Execution timeout** (`MAX_SCAN_DURATION_MS`) prevents runaway scans.
8. **Audit logging** records every scan start, completion, and deletion with user ID and target.

No `--script` arguments or arbitrary flags are ever accepted from the client — the scan type list in `utils/validators.ts` is the complete set of what's possible.

---

## Installation (local, without Docker)

### Prerequisites
- Node.js 20+
- MongoDB running locally or a connection string to a hosted instance
- **Nmap installed** and on your `PATH` (`nmap -version` should work). On most scan types other than `-sT`, Nmap needs elevated privileges (raw sockets) — see below.

### Backend

```bash
cd server
cp .env.example .env    # edit JWT_SECRET and MONGO_URI
npm install
npm run dev              # http://localhost:5000
```

### Frontend

```bash
cd client
cp .env.local.example .env.local
npm install
npm run dev               # http://localhost:3000
```

### Nmap privileges

SYN scans (`-sS`), OS detection (`-O`), and some ACK-based firewall detection require raw socket
access. Options, from least to most permissive:

- Run the Node process with `sudo` (development only — not recommended for production).
- Grant the `nmap` binary the specific capabilities it needs:
  ```bash
  sudo setcap cap_net_raw,cap_net_admin,cap_net_bind_service+eip $(which nmap)
  ```
- In Docker, the `server` container is granted `NET_RAW` and `NET_ADMIN` capabilities in `docker-compose.yml` instead of running privileged.

If Nmap can't get raw sockets, scan types that need them will fail or silently fall back —
prefer TCP Connect Scan (`-sT`) if you don't want to grant elevated privileges.

---

## Installation (Docker)

```bash
cp .env.example .env    # set JWT_SECRET, optionally SCAN_TARGET_ALLOWLIST
docker compose up --build
```

This starts:
- `mongo` — MongoDB 7
- `server` — API on port 5000 (internal), with `nmap` installed in the image
- `client` — Next.js app on port 3000 (internal)
- `nginx` — reverse proxy exposed on port 80, routing `/` to the frontend and `/api/` to the backend

Visit `http://localhost` once all containers are healthy.

---

## Environment Variables

### `server/.env`
| Variable | Description |
|---|---|
| `PORT` | API port (default 5000) |
| `MONGO_URI` | MongoDB connection string |
| `JWT_SECRET` | Secret used to sign JWTs — must be long and random in production |
| `JWT_EXPIRES_IN` | Token lifetime, e.g. `7d` |
| `CLIENT_ORIGIN` | Allowed CORS origin |
| `SCAN_TARGET_ALLOWLIST` | Optional comma-separated list restricting valid scan targets |
| `MAX_SCAN_DURATION_MS` | Hard timeout for a single Nmap execution |
| `NMAP_PATH` | Path to the nmap binary (default `nmap`) |
| `RATE_LIMIT_*` | General and scan-specific rate limiting |

### `client/.env.local`
| Variable | Description |
|---|---|
| `NEXT_PUBLIC_API_URL` | Base URL of the backend API |

---

## API Reference

All endpoints except `/api/health`, `/api/auth/register`, `/api/auth/login`,
`/api/auth/forgot-password`, and `/api/auth/reset-password` require
`Authorization: Bearer <token>`.

### Auth
| Method | Path | Description |
|---|---|---|
| POST | `/api/auth/register` | Create an account |
| POST | `/api/auth/login` | Log in, returns JWT |
| POST | `/api/auth/logout` | Client-side token discard |
| GET | `/api/auth/me` | Get current user |
| PUT | `/api/auth/profile` | Update name |
| POST | `/api/auth/forgot-password` | Request password reset |
| POST | `/api/auth/reset-password` | Complete password reset |

### Scans
| Method | Path | Description |
|---|---|---|
| POST | `/api/scan` | Start a new scan (see body below) |
| GET | `/api/scan` | List scans (paginated) |
| GET | `/api/scan/:id` | Get a single scan |
| DELETE | `/api/scan/:id` | Delete a scan |

`POST /api/scan` body:
```json
{
  "target": "scanme.nmap.org",
  "portPreset": "top100",
  "customPortRange": "1-1024",
  "scanTypes": ["tcp_connect", "service_version"],
  "timingTemplate": "T3",
  "usePn": false,
  "authorizationConfirmed": true
}
```

### Reports
| Method | Path | Description |
|---|---|---|
| GET | `/api/report/:id` | JSON summary |
| GET | `/api/report/export/pdf/:id` | Download PDF |
| GET | `/api/report/export/csv/:id` | Download CSV |
| GET | `/api/report/export/json/:id` | Download JSON |

### Analytics & Settings
| Method | Path | Description |
|---|---|---|
| GET | `/api/analytics` | Aggregate stats across the user's scans |
| GET | `/api/settings` | Get scan preferences |
| PUT | `/api/settings` | Update scan preferences |

---

## Security Notes

- Passwords are hashed with bcrypt (cost factor 12).
- JWTs are signed with `JWT_SECRET` and verified on every protected route.
- `helmet()` sets secure HTTP headers; CORS is restricted to `CLIENT_ORIGIN`.
- `express-rate-limit` throttles general traffic, auth attempts, and — more strictly — scan creation.
- All request bodies are validated with `express-validator` before reaching controllers.
- Nmap execution uses `execFile()` with a fixed argv array — see "How Nmap Execution Is Secured" above.
- Structured audit logs record logins, scan lifecycle events, and deletions.
- Docker containers run as non-root where possible; the server container is granted only the specific Linux capabilities (`NET_RAW`, `NET_ADMIN`) Nmap needs, instead of running privileged.

---

## Testing Guide

No test suite is bundled by default. Suggested approach:
- **Backend:** Jest + Supertest against a `mongodb-memory-server` instance; mock `child_process.execFile` in unit tests for `nmapService`, and run a small number of integration tests against `scanme.nmap.org` (a host Nmap's maintainers provide specifically for testing) if network access is available in CI.
- **Frontend:** React Testing Library for components, Playwright/Cypress for the login → scan → results flow.

---

## Deployment Notes

- Put the app behind HTTPS in production (terminate TLS at nginx or a load balancer in front of it).
- Set a strong, unique `JWT_SECRET`.
- Consider setting `SCAN_TARGET_ALLOWLIST` for any deployment where you want to hard-restrict what can be scanned.
- Wire a real transactional email provider and update `forgotPassword` in `authController.ts` to send the reset link instead of returning it in the response (it's only returned in non-production environments today).
