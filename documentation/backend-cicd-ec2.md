# Backend CI/CD (Monorepo) - GitHub Actions to EC2

## Behavior

- Backend deploy workflow runs only when `server/**` changes.
- Client-only changes do not trigger backend deployment.
- Amplify can continue handling `client/**` independently.

## Workflows

- `.github/workflows/deploy-backend-staging.yml`
  - Trigger: push to `staging` with changes under `server/**`
- `.github/workflows/deploy-backend-production.yml`
  - Trigger: push to `main` with changes under `server/**`

Both workflows also support manual `workflow_dispatch`.

## Required GitHub Secrets

### Staging

- `STAGING_EC2_HOST` (for example `54.145.13.181`)
- `STAGING_EC2_SSH_USER` (usually `ubuntu`)
- `STAGING_EC2_SSH_KEY` (private key content for EC2 keypair)
- `STAGING_EC2_SSH_PORT` (optional, default `22`)

### Production

- `PRODUCTION_EC2_HOST`
- `PRODUCTION_EC2_SSH_USER`
- `PRODUCTION_EC2_SSH_KEY`
- `PRODUCTION_EC2_SSH_PORT` (optional, default `22`)

## One-time EC2 Setup

On each EC2 host, create backend env file before first deploy:

```bash
sudo mkdir -p /opt/echo/server
sudo tee /opt/echo/server/.env > /dev/null <<'EOF'
DATABASE_URL=postgresql://echo:echo@db:5432/echo
JWT_SECRET=replace-with-strong-random-secret
OPENROUTER_API_KEY=replace-with-real-key
PORT=3001
EOF
sudo chown -R ubuntu:ubuntu /opt/echo
```

## Notes

- Workflow deploy command is `docker compose up -d --build --remove-orphans` in `/opt/echo/server`.
- Health check is verified via `http://127.0.0.1:3001/health` on the EC2 host.

