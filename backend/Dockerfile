# syntax = docker/dockerfile:1
# -----------------------------------------------------------------------------
# MAA Backend production image — multi-stage build for a small final layer.
# Used by Fly.io (see fly.toml) and any other container host.
# -----------------------------------------------------------------------------

# ---------- Stage 1: install + compile TypeScript ----------
FROM node:22.11.0-bookworm-slim AS builder
WORKDIR /app

# Copy manifests first for better Docker layer caching — only re-installs
# when package*.json changes, not on every source edit.
COPY package.json package-lock.json* ./

# `npm ci` is faster and reproducible compared to `npm install`. Includes
# devDeps so we have the TypeScript compiler available for the build step.
RUN npm ci --no-audit --no-fund

COPY tsconfig.json ./
COPY src ./src

RUN npm run build

# ---------- Stage 2: runtime — only production deps + compiled JS ----------
FROM node:22.11.0-bookworm-slim AS runtime
WORKDIR /app
ENV NODE_ENV=production

# Reuse the lockfile so the runtime image gets the exact same dep versions.
COPY package.json package-lock.json* ./
RUN npm ci --omit=dev --no-audit --no-fund && npm cache clean --force

# Copy compiled output. Source maps + raw .ts not shipped — keeps the image
# slim and avoids leaking comments/internal docs in production.
COPY --from=builder /app/dist ./dist

# Run as the non-root user that Node images ship with for defense-in-depth.
USER node

EXPOSE 3000

# Hard fail fast if the process can't start — Fly's restart loop will retry.
CMD ["node", "dist/server.js"]
