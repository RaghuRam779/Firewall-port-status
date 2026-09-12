# --- Build stage ---
FROM node:20-bookworm-slim AS build
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

# --- Runtime stage ---
FROM node:20-bookworm-slim
WORKDIR /app

# Nmap is required at runtime - the API shells out to it via child_process.execFile.
RUN apt-get update \
  && apt-get install -y --no-install-recommends nmap \
  && rm -rf /var/lib/apt/lists/*

# Run as a non-root user. Note: some Nmap scan types (SYN scan, OS detection)
# need raw-socket capabilities; grant only what's required instead of running as root.
RUN groupadd -r scanner && useradd -r -g scanner scanner
RUN setcap cap_net_raw,cap_net_admin,cap_net_bind_service+eip /usr/bin/nmap || true

COPY package*.json ./
RUN npm install --omit=dev
COPY --from=build /app/dist ./dist

USER scanner

EXPOSE 5000
CMD ["node", "dist/index.js"]
