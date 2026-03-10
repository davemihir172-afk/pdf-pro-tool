# Pro PDF Mate

Monorepo PDF toolkit with web, API, worker, queue, and AI tools.

## Queue + worker architecture

- API uploads files and creates background jobs.
- Jobs are pushed through `packages/queue`.
- `apps/worker` processes jobs concurrently with worker threads.
- API exposes `GET /api/job/:id` for status/progress and `GET /api/job/:id/download` for output.

Queue job types:
- `merge-pdf`
- `split-pdf`
- `compress-pdf`
- `convert-pdf`
- `ocr-pdf`

## AI tools

- AI Summarize PDF (`/api/ai/summarize`)
- AI Translate PDF (`/api/ai/translate`)
- AI Extract Tables from PDF (`/api/ai/extract-tables`)

AI flow:
1. Upload PDF
2. Extract text
3. Send to OpenAI
4. Return processed result
5. Copy/download result

Set `OPENAI_API_KEY` in your environment before using AI endpoints.

## Run

```bash
npm install
npm run build
npm start
```

Open `http://localhost:3000`.
