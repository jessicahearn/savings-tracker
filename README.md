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

Not yet in the repository. The production build is ready — `npm run build` produces
`server/dist` and `client/dist`, and in production the API serves the built client
itself, so the browser talks to a single origin — but the `Dockerfile`,
`docker-compose.prod.yml` and reverse-proxy config for the mini-PC are still to come.

To run a production build locally in the meantime:

```bash
npm run build
NODE_ENV=production SESSION_SECRET=anything-for-local node server/dist/index.js
```

The whole app, UI included, is then served from http://localhost:4000.
