# team40-redpanda
US-Nepal Hackathon

## Local setup

### Prerequisites

- Node.js 22+
- npm
- Docker Desktop (or Docker Engine + Compose)

### 1. Install dependencies

```bash
cd server && npm install
cd ../client && npm install
```

### 2. Configure environment files

Backend:

```bash
cd server
cp .env.example .env
```

For local development, keep:

- `DATABASE_URL=postgresql://echo:echo@localhost:5433/echo`
- `CORS_ORIGIN=http://localhost:5173`

Frontend:

```bash
cd client
cp .env.example .env
```

For local development set:

- `VITE_API_BASE_URL=http://localhost:3001`

### 3. Start local database

```bash
cd server
docker compose up -d db
```

### 4. Run migrations and start backend

```bash
cd server
npx prisma migrate deploy
npm run dev
```

### 5. Start frontend

```bash
cd client
npm run dev
```

App URLs:

- Frontend: `http://localhost:5173`
- Backend health: `http://localhost:3001/health`

## Database seeding

The backend seed script creates:

- 40 persistent users
- 40 stories (1 per user)
- a credentials CSV file for login testing

Important: seeding is destructive for app data. It clears `Message`, `Conversation`, `ChatRequest`, `Story`, and `User` tables before inserting fresh seed data.

### Seed on EC2 (staging/prod container)

```bash
cd /opt/echo/server
sudo docker compose -f docker-compose.deploy.yml exec -T api node dist/prisma/seed.js
```

Copy generated credentials to host:

```bash
API_CID=$(sudo docker compose -f docker-compose.deploy.yml ps -q api)
sudo docker cp "$API_CID:/app/prisma/seed-users-credentials.csv" /opt/echo/server/seed-users-credentials.csv
```

### Seed locally

```bash
cd server
npm run build
node dist/prisma/seed.js
```

### Seeded credentials

- CSV path: `server/prisma/seed-users-credentials.csv` (inside backend app path/container)
- Default password: `EchoSeed!2026`
- Email pattern: `seed.user01@echo.local` to `seed.user40@echo.local`
- Handle pattern: `echo-seed-01` to `echo-seed-40`

To override the default seed password:

```bash
SEED_USER_PASSWORD='YourStrongSeedPassword123!' node dist/prisma/seed.js
```
