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

## Deployment

See `docker-compose.prod.yml` and `Dockerfile` for production deployment on the mini-PC.
