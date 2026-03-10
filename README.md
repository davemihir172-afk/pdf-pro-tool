# Pro PDF Mate

Production-ready Node.js + Express PDF platform with scalable SEO pages, conversion/editing APIs, and deploy-ready ops defaults.

## Production audit status

### Fixed issues

1. **Startup dependency bottleneck**: `npm start` depended on Tailwind CLI, causing runtime failure when dev deps were unavailable. Fixed by making `start` run `node server.js` directly and moving CSS build to `start:full`.
2. **CJS/ESM compatibility risk** with `pdfjs-dist`: direct `require(...pdf.mjs)` could break at runtime. Fixed using dynamic `import()` in processing functions.
3. **Frontend script scope issue**: search code was outside the main IIFE in `ui-pages.js`. Fixed and re-minified.
4. **Missing tool endpoints** requested in audit list: added `protect-pdf`, `unlock-pdf`, `ocr-pdf`, `flatten-pdf` routes/controllers/services.

## Security / performance / scalability

- Compression enabled (`compression`)
- Security headers + CSP
- API rate limiting (`express-rate-limit`)
- Upload + request body size limits
- Automatic cleanup scheduler for `uploads/` and `tmp/`
- Static caching headers + ETag
- Minified CSS/JS assets
- Lazy-loaded guide images
- Programmatic SEO pages + category hubs for horizontal scale

## SEO content structure

### Tools
- `/merge-pdf`
- `/split-pdf`
- `/compress-pdf`
- `/pdf-to-word`
- `/jpg-to-pdf`

### Blog/tutorial pages
- `/blog/how-to-merge-pdf`
- `/blog/how-to-compress-pdf`
- `/blog/how-to-convert-pdf-to-word`
- `/blog/how-to-edit-pdf-online`
- `/blog/reduce-pdf-size-free`

### Programmatic SEO pages
- `/best-pdf-tools`
- `/free-pdf-tools`
- `/online-pdf-editor`
- `/compress-large-pdf`
- `/convert-pdf-fast`

### Category hubs
- `/convert-pdf`
- `/edit-pdf`
- `/optimize-pdf`
- `/security-pdf`

## Key API tool endpoints

### Core PDF
- `POST /api/merge-pdf`
- `POST /api/split-pdf`
- `POST /api/compress-pdf`
- `POST /api/rotate-pdf`
- `POST /api/organize-pdf`
- `POST /api/delete-pdf-pages`
- `POST /api/extract-pdf-pages`

### Conversion
- `POST /api/jpg-to-pdf`
- `POST /api/png-to-pdf`
- `POST /api/word-to-pdf`
- `POST /api/excel-to-pdf`
- `POST /api/powerpoint-to-pdf`
- `POST /api/html-to-pdf`
- `POST /api/text-to-pdf`
- `POST /api/pdf-to-jpg`
- `POST /api/pdf-to-png`
- `POST /api/pdf-to-word`
- `POST /api/pdf-to-excel`
- `POST /api/pdf-to-powerpoint`
- `POST /api/pdf-to-text`

### Editing/enhancement
- `POST /api/watermark-pdf`
- `POST /api/page-numbers`
- `POST /api/header-footer`
- `POST /api/background-pdf`
- `POST /api/crop-pdf`
- `POST /api/sign-pdf`
- `POST /api/redact-pdf`
- `POST /api/compare-pdf`
- `POST /api/extract-images`
- `POST /api/protect-pdf`
- `POST /api/unlock-pdf`
- `POST /api/ocr-pdf`
- `POST /api/flatten-pdf`

## Local run

1. Install dependencies:
   ```bash
   npm install
   ```
2. Configure env:
   ```bash
   cp .env.example .env
   ```
3. Start server:
   ```bash
   npm start
   ```
4. Optional full CSS build + start:
   ```bash
   npm run start:full
   ```

## Deployment instructions

### Render
1. Push code to GitHub.
2. Create Web Service from repo.
3. Build command: `npm install`
4. Start command: `npm start`
5. Add env vars from `.env.example`.

### Railway
1. Push code to GitHub.
2. Deploy from GitHub repo.
3. Ensure start command `npm start`.
4. Add env vars from `.env.example`.

### DigitalOcean App Platform
1. Push code to GitHub.
2. Create App from repo.
3. Build command: `npm install`
4. Run command: `npm start`
5. Add env vars from `.env.example`.

### Standard flow
1. Push code to GitHub
2. Connect hosting
3. Install dependencies
4. Run `npm start`
