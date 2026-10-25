# syntax=docker/dockerfile:1

# ---------- build stage ----------
FROM node:20-alpine AS builder
WORKDIR /app

# Manifests before sources, so the dependency layer stays cached across code
# changes. Both workspace manifests are needed for `npm ci` to resolve the
# workspace tree.
COPY package.json package-lock.json ./
COPY client/package.json ./client/
COPY server/package.json ./server/
RUN npm ci

COPY . .

# Builds the server (tsc + the schema.graphql copy) and then the client bundle.
RUN npm run build

# ---------- runtime stage ----------
FROM node:20-alpine AS runtime
WORKDIR /app

ENV NODE_ENV=production

COPY package.json package-lock.json ./
COPY client/package.json ./client/
COPY server/package.json ./server/

# NODE_ENV=production already drops devDependencies; --omit=dev states the
# intent so it survives anyone changing that env var.
RUN npm ci --omit=dev && npm cache clean --force

# server/src/index.ts derives the project root three directories up from itself,
# which from /app/server/dist/index.js is /app — so client/dist must sit here,
# at /app/client/dist, for the static handler to find it.
COPY --from=builder --chown=node:node /app/server/dist       ./server/dist
COPY --from=builder --chown=node:node /app/server/migrations ./server/migrations
COPY --from=builder --chown=node:node /app/client/dist       ./client/dist

USER node
EXPOSE 4000

CMD ["node", "server/dist/index.js"]
