# Pro PDF Mate

Pro PDF Mate is a monorepo full-stack PDF toolkit with a Next.js frontend, Express API, BullMQ queue, Redis, and worker-thread based processing.

## Monorepo layout

- `apps/web` – Next.js 14 frontend (homepage + Merge PDF tool)
- `apps/api` – Express API with Multer uploads
- `apps/worker` – BullMQ worker + worker threads
- `packages/pdf-engine` – PDF-LIB merge engine
- `packages/queue` – shared queue/Redis config
- `packages/storage` – output storage helpers
- `packages/ui` – shared UI components
- `prisma` – sample schema
- `infra` – Dockerfiles and docker-compose

## Run locally

1. Start Redis (Docker recommended):
   ```bash
   docker run --rm -p 6379:6379 redis:7-alpine
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Build all apps:
   ```bash
   npm run build
   ```
4. Start web + api + worker:
   ```bash
   npm start
   ```

- Web: `http://localhost:3000`
- API: `http://localhost:4000`

## Docker Compose

```bash
docker compose -f infra/docker-compose.yml up --build
```
