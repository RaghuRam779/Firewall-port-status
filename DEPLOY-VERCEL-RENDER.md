# Deploy with real Nmap

## Architecture
- **client/** -> deploy to Vercel
- **server/** -> deploy to Render as a Docker Web Service (so Nmap is available in the container)
- **MongoDB Atlas** -> cloud database

## 1) Frontend on Vercel
Import the repo on Vercel and set **Root Directory** to `client`.

Add this environment variable in Vercel:
- `NEXT_PUBLIC_API_URL=https://YOUR-RENDER-SERVICE.onrender.com/api`

## 2) Backend on Render
Create a **Web Service** from the same GitHub repo.

Use:
- **Root Directory:** `server`
- **Runtime:** Docker
- **Dockerfile Path:** `server/Dockerfile`

Environment variables for Render:
- `PORT=5000`
- `NODE_ENV=production`
- `MONGO_URI=<your MongoDB Atlas URI>`
- `JWT_SECRET=<long random secret>`
- `JWT_EXPIRES_IN=7d`
- `CLIENT_ORIGIN=https://YOUR-VERCEL-APP.vercel.app`
- `SCAN_TARGET_ALLOWLIST=`
- `MAX_SCAN_DURATION_MS=180000`
- `NMAP_PATH=nmap`
- `RATE_LIMIT_WINDOW_MS=900000`
- `RATE_LIMIT_MAX=100`
- `SCAN_RATE_LIMIT_MAX=10`

## 3) MongoDB Atlas
Create a cluster and put its connection string in `MONGO_URI`.

## Notes
- Real scans run from the Render backend container, not from Vercel.
- If you redeploy the frontend, update `CLIENT_ORIGIN` on Render if your Vercel domain changes.
