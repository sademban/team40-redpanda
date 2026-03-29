# team40-redpanda
US-Nepal Hackathon

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
