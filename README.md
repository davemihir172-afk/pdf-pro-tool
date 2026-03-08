# PDFMate Pro 📄

**35+ PDF tools with AI, digital signatures, cloud storage and a full PDF editor.**  
All PDF processing runs entirely in the browser — no files are ever uploaded to a server.

---

## ✅ What's Included

### Core PDF Tools (all free, no setup)
| Tool | Works |
|---|---|
| Merge PDF | ✅ |
| Split PDF | ✅ |
| Compress PDF | ✅ |
| Rotate PDF | ✅ |
| PDF → Word (HTML) | ✅ |
| PDF → JPG/PNG | ✅ |
| JPG/PNG → PDF | ✅ |
| Word → PDF | ✅ |
| Excel → PDF | ✅ |
| PowerPoint → PDF | ✅ |
| PDF → Excel (CSV) | ✅ |
| PDF → PowerPoint (slides) | ✅ |
| HTML → PDF | ✅ |
| Add Watermark | ✅ |
| Protect PDF (password) | ✅ |
| Unlock PDF | ✅ |
| Add Page Numbers | ✅ |
| Crop PDF | ✅ |
| Repair PDF | ✅ |
| OCR PDF (text extraction) | ✅ |
| Organize PDF (drag-reorder) | ✅ |
| Delete Pages | ✅ |
| Extract Pages | ✅ |
| Scan to PDF | ✅ |
| **Full PDF Editor** (annotate) | ✅ |
| **Digital Signature** (draw/type/upload) | ✅ |

### AI Tools (requires Anthropic API key)
| Tool | Notes |
|---|---|
| AI Summarize PDF | Uses Claude AI — free tier available |
| AI Extract Text | Structured data extraction |
| Translate PDF | 50+ languages |

### Cloud Storage (UI flow — real OAuth needs setup)
| Integration | Status |
|---|---|
| Google Drive | UI ready — real OAuth needs Google Cloud credentials |
| Dropbox | UI ready — real OAuth needs Dropbox App credentials |

---

## 🗂️ Project Structure

```
pdfmate-pro/
├── public/                  ← Static files served to browser
│   ├── index.html           ← Main HTML shell
│   ├── _headers             ← Cloudflare Pages headers
│   ├── _redirects           ← Cloudflare Pages SPA routing
│   └── src/
│       ├── css/
│       │   └── styles.css   ← All styles (39KB)
│       └── js/
│           ├── tools.js     ← Tool registry (32 tools)
│           ├── ui.js        ← Rendering, navigation, AI calls
│           ├── processing.js← PDF runners (PDF-lib + PDF.js)
│           └── app.js       ← Init, helpers, utilities
│
├── api/                     ← Vercel Serverless Functions
│   ├── ai.js                ← Secure AI proxy (POST /api/ai)
│   └── health.js            ← Health check (GET /api/health)
│
├── functions/               ← Cloudflare Pages Functions
│   └── api/
│       └── ai.js            ← Cloudflare AI proxy
│
├── server.js                ← Express server (Node.js / Railway)
├── package.json
├── vercel.json              ← Vercel config
├── .env.example             ← Environment variable template
├── .gitignore
└── README.md
```

---

## 🚀 Deployment Options

### Option A — Vercel (Recommended, Free)

**Step 1 — Install Vercel CLI**
```bash
npm install -g vercel
```

**Step 2 — Deploy**
```bash
cd pdfmate-pro
npm install
vercel
```

Follow the prompts:
- Set up and deploy → `Y`
- Which scope? → your account
- Link to existing project? → `N`
- Project name → `pdfmate-pro`
- Directory? → `./`
- Override settings? → `N`

**Step 3 — Add AI key (optional)**
```bash
vercel env add ANTHROPIC_API_KEY
# Paste your key: sk-ant-...
# Select: Production, Preview, Development
vercel --prod  # Redeploy with key
```

**Step 4 — Custom domain (optional)**
```bash
vercel domains add yourdomain.com
```
Then add a CNAME record at your registrar:
```
www → cname.vercel-dns.com
```

---

### Option B — Cloudflare Pages (Free, Fastest)

**Step 1 — Push to GitHub**
```bash
git init
git add .
git commit -m "Initial commit"
git remote add origin https://github.com/YOUR_USERNAME/pdfmate-pro.git
git push -u origin main
```

**Step 2 — Connect to Cloudflare Pages**
1. Go to [pages.cloudflare.com](https://pages.cloudflare.com)
2. Click **Create a project** → **Connect to Git**
3. Select your `pdfmate-pro` repo
4. Configure build:
   - **Framework preset**: None
   - **Build command**: *(leave empty)*
   - **Build output directory**: `public`
5. Click **Save and Deploy**

**Step 3 — Add AI environment variable**
1. In Cloudflare Pages → your project → **Settings → Environment Variables**
2. Add: `ANTHROPIC_API_KEY` = `sk-ant-your-key-here`
3. Redeploy

**Custom domain**: Settings → Custom domains → Add domain

---

### Option C — Railway (Node.js backend, Free tier)

Best if you want the full Express server running:

```bash
# Install Railway CLI
npm install -g @railway/cli

# Login and deploy
railway login
railway init
railway up
```

Set environment variable:
```bash
railway variables set ANTHROPIC_API_KEY=sk-ant-your-key-here
```

---

### Option D — Local Development

```bash
# Clone / download the project
cd pdfmate-pro

# Install dependencies
npm install

# Copy env template and add your key
cp .env.example .env
# Edit .env — add your ANTHROPIC_API_KEY

# Start development server
npm run dev   # or: npm start

# Open browser
open http://localhost:3000
```

---

## 🔑 Getting Your Anthropic API Key

AI tools (Summarize, Extract, Translate) use Claude AI:

1. Go to [console.anthropic.com](https://console.anthropic.com)
2. Sign up (free — no credit card required)
3. Go to **API Keys** → **Create Key**
4. Copy the key (starts with `sk-ant-`)
5. Add to your deployment's environment variables as `ANTHROPIC_API_KEY`

**Free tier includes** enough usage for hundreds of PDF summaries per month.

---

## 🎨 Customisation

### Change brand colors
Edit `public/src/css/styles.css`, find the `:root` block:
```css
:root {
  --red: #e8354a;    /* Primary brand color */
  --red-h: #d42d40;  /* Hover state */
  --red-l: #fff0f2;  /* Light tint */
  /* Change to any color: */
  /* --red: #2563eb;  Blue */
  /* --red: #059669;  Green */
  /* --red: #7c3aed;  Purple */
}
```

### Change site name
In `public/index.html`, replace all `PDFMate` with your brand name.

### Deep-link to tools
Any tool can be linked directly:
```
https://yoursite.com/#merge
https://yoursite.com/#compress
https://yoursite.com/#ai-summarize
https://yoursite.com/#sign-pdf
```

### Add Google Analytics
Paste before `</head>` in `public/index.html`:
```html
<script async src="https://www.googletagmanager.com/gtag/js?id=G-XXXXXXXX"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());
  gtag('config', 'G-XXXXXXXX');
</script>
```

---

## 🛡️ Security Notes

- **API keys** are handled server-side by the `/api/ai` proxy — never exposed in browser code
- **PDF processing** happens entirely in the browser — no file uploads
- **HTTPS** is provided automatically by Vercel, Cloudflare, and Railway
- The `.env` file is in `.gitignore` — never commit it

---

## 📦 Tech Stack

| Layer | Technology |
|---|---|
| Frontend | Vanilla HTML/CSS/JS (no framework) |
| PDF Processing | [pdf-lib 1.17.1](https://pdf-lib.js.org/) |
| PDF Rendering | [PDF.js 3.11](https://mozilla.github.io/pdf.js/) |
| ZIP packaging | [JSZip 3.10](https://stuk.github.io/jszip/) |
| AI | [Anthropic Claude](https://anthropic.com) via secure proxy |
| Font | [Plus Jakarta Sans](https://fonts.google.com/specimen/Plus+Jakarta+Sans) |
| Backend | Node.js + Express (optional) |
| Deploy | Vercel / Cloudflare Pages / Railway |

---

## 📄 License

MIT — free to use, modify, and deploy commercially.

---

*PDFMate Pro v1.0.0*
