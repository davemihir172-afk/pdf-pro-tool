# Pro PDF Mate

Monorepo PDF toolkit with web, API, and worker services.

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

## Tools

### PDF tools
- Merge PDF
- Split PDF
- Compress PDF
- Rotate PDF
- Delete Pages
- Extract Pages

### Conversion tools
- PDF to Word / Excel / PowerPoint / JPG / PNG / TXT
- JPG/PNG to PDF
- Word/Excel/PowerPoint/HTML to PDF

All tools follow: **Upload → Process document → Preview result → Download output**.

## Run

```bash
npm install
npm run build
npm start
```

Open `http://localhost:3000`.
