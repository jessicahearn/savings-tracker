# Savings Tracker

A self-hosted app to track household savings, attributed to different savings pots (accounts) and family members.

## Tech Stack

- **Frontend:** React 18 + TypeScript, Vite, Apollo Client (GraphQL), Bootstrap
- **Backend:** Node + Express, Apollo Server 4 (GraphQL), node-postgres
- **Database:** PostgreSQL 16
- **Deployment:** Docker Compose (single mini-PC)

## Local Development

### Prerequisites

- Node 20 LTS (installed via nvm)
- Docker & Docker Compose
- PostgreSQL client tools (psql)

### Setup

1. Install dependencies:
   ```bash
   npm install
   ```

2. Create a `.env` file in the root (copy from `.env.example`):
   ```bash
   cp .env.example .env
   ```

3. Start PostgreSQL:
   ```bash
   docker compose up -d postgres
   ```

4. Run database migrations:
   ```bash
   npm run migrate up -w server
   ```

5. Start the dev server (both client and server):
   ```bash
   npm run dev
   ```

### Query Database

```
docker compose exec postgres psql -U savings_tracker -d savings_tracker_dev
```

```
\dt
```

```
\d transactions
```

```
SELECT * FROM transactions;
```

The server runs at http://localhost:4000 and the client at http://localhost:5173 (Vite dev server).

## Project Structure

```
savings-tracker/
├── client/                  # React frontend
├── server/                  # Express + Apollo GraphQL API
├── package.json             # Root workspace configuration
└── docker-compose.yml       # Development database
```

## Testing

Run all tests:
```bash
npm run test
```

## Building

Build for production:
```bash
npm run build
```

## Configuration

All server configuration comes from a `.env` file in the repository root, which is
gitignored. `.env.example` holds placeholders only — **this repository is public, so no
real credentials, connection strings or host names belong in tracked files.**

`SESSION_SECRET` is the one variable with teeth. In development it falls back to a known
placeholder; when `NODE_ENV=production` the server refuses to start without a real value,
because the fallback is published here and would let anyone forge a signed session.
Generate one with:

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

## Deployment

Runs on a Windows mini-PC under Docker Desktop, reachable from phones on the home wifi.
Three containers: **Caddy** (HTTPS front door), **api** (this app, serving both the
GraphQL endpoint and the built UI), and **Postgres**. Only Caddy has published ports.

GitHub Actions builds and publishes the image on every push to `main`, gated on the test
suite. The mini-PC pulls that finished image — it never builds and holds no source code.

### Files the mini-PC needs

Four, in one folder:

| File | Source |
| --- | --- |
| `docker-compose.prod.yml` | this repo |
| `Caddyfile` | this repo |
| `deploy.ps1` | this repo |
| `.env.prod` | copied from `.env.prod.example`, filled in by hand |

`.env.prod` is gitignored and holds the only secrets: the hostname, the database
password and `SESSION_SECRET`. Generate the secret with:

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### One-time setup

1. **Docker Desktop** with the WSL2 backend. Enable *Start Docker Desktop when you log in*,
   or the stack will not come back after a reboot.
2. **A fixed LAN address** for the mini-PC — a DHCP reservation on the router is easiest.
3. **Windows Firewall**: allow inbound TCP 80 and 443.
4. **Router**: forward external port **80 only** to the mini-PC. Leave 443 closed — port 80
   exists purely so Let's Encrypt can verify the hostname, and leaving 443 shut means the
   app itself is reachable only from the home network.
5. **Local DNS override** mapping the no-ip hostname to the mini-PC's LAN address.
   Without it, phones on the wifi resolve the hostname to the public IP and many routers
   will not route that back inward. Set it on the router if it supports local DNS entries,
   otherwise run Pi-hole or AdGuard Home.
6. **No registry login needed.** The published image inherited this repository's public
   visibility, so the mini-PC pulls it anonymously (verified against ghcr.io). If that
   ever changes, run `docker login ghcr.io` there with a token holding `read:packages`.
7. Copy the four files over, then start it:

   ```powershell
   docker compose -f docker-compose.prod.yml --env-file .env.prod up -d
   docker compose -f docker-compose.prod.yml --env-file .env.prod `
     run --rm -w /app/server api npx node-pg-migrate up
   ```

8. Open the app and sign up. There is no seeded account, and the first signup is not
   special — anyone who can reach the app can register, which is why 443 stays closed.

### Deploying a change

Push to `main`, wait for CI to publish, then on the mini-PC:

```powershell
.\deploy.ps1
```

That pulls the new image, runs any new migrations, and only swaps the running container
if the migrations succeeded. If a migration fails the script stops and the previous
version keeps serving.

### Rolling back

Every build is also tagged with its commit SHA. Pin the `api` image in
`docker-compose.prod.yml` to a known-good one and bring the stack up:

```yaml
image: ghcr.io/jessicahearn/savings-tracker:<sha>
```

Rolling back code does **not** roll back a migration that already ran.

### After a reboot or power cut

Nothing to do. All three containers restart themselves, the database lives in a Docker
volume that survives, and Caddy keeps its certificate in another volume rather than
re-requesting one on every boot.

### Not yet done

**There are no backups.** The database is a single Docker volume on a single machine.
A nightly `pg_dump` into a folder that already gets backed up is the next thing worth
adding.

### Running the production build locally

```bash
npm run build
NODE_ENV=production SESSION_SECRET=anything-for-local node server/dist/index.js
```

The whole app, UI included, is then served from http://localhost:4000.
