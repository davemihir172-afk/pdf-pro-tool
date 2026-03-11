# Pro PDF Mate

Production-ready monorepo PDF toolkit with API, web, worker, queue, AI tools, and deployment configs.

## Local run

```bash
npm install
npm run build
npm start
```

- Web: `http://localhost:3000`
- API: `http://localhost:4000`

## Security hardening included

- Request rate limiting (in-memory sliding window)
- Upload size limits (`MAX_UPLOAD_BYTES`)
- File type validation for PDF endpoints
- Upload filename sanitization
- Temporary upload storage with automatic cleanup after processing
- Output cleanup scheduler in worker

## Environment variables

Copy `.env.example` to `.env` and set values:

- `PORT`
- `UPLOAD_DIR`
- `REDIS_URL`
- `OPENAI_API_KEY`
- plus optional limits/concurrency controls

## Docker deployment

### Single image

```bash
docker build -t propdfmate .
docker run --rm -p 3000:3000 -p 4000:4000 --env-file .env propdfmate
```

### Multi-service with Docker Compose

```bash
docker compose up --build
```

Services:
- `web`
- `api`
- `worker`
- `redis`

## Railway deployment

- `railway.json` is included for Docker-based deployment.
- Set env vars from `.env.example` in Railway project settings.

## Render deployment

- `render.yaml` is included with web/api/worker services.
- Set environment variables (including `OPENAI_API_KEY`) in Render dashboard.

## Notes

- Queue is file-backed for local reliability and background processing.
- AI endpoints require `OPENAI_API_KEY`.
