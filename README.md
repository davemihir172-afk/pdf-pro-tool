# Pro PDF Mate

Monorepo PDF toolkit with web, API, and worker services.

## Features

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

All tools follow the same UX flow: **Upload → Process document → Preview result → Download output**.

## Conversion engine notes
- Uses **LibreOffice CLI** (`libreoffice --headless --convert-to`) for office/pdf conversions.
- Uses **Sharp** when available for image format conversions; if Sharp is unavailable, conversion falls back to passthrough behavior.

## Run

```bash
npm install
npm run build
npm start
```

Open `http://localhost:3000`.
