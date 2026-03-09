const path = require('path');
const fs = require('fs');
const express = require('express');
const cors = require('cors');
const compression = require('compression');
const rateLimit = require('express-rate-limit');
const dotenv = require('dotenv');

dotenv.config();

const pagesRouter = require('./routes/pages');
const uploadRouter = require('./routes/upload');
const pdfToolsRouter = require('./routes/pdfTools');
const conversionRouter = require('./routes/conversion');
const editingToolsRouter = require('./routes/editingTools');

const app = express();
const PORT = Number(process.env.PORT || 3000);
const MAX_BODY_SIZE = process.env.MAX_BODY_SIZE || '10mb';
const TEMP_RETENTION_MS = Number(process.env.TEMP_RETENTION_MS || 10 * 60 * 1000);
const CLEANUP_INTERVAL_MS = Number(process.env.CLEANUP_INTERVAL_MS || 15 * 60 * 1000);
const STATIC_MAX_AGE = process.env.STATIC_CACHE_MAX_AGE || '7d';

const absoluteUploads = path.join(__dirname, 'uploads');
const absoluteTmp = path.join(__dirname, 'tmp');

[absoluteUploads, absoluteTmp].forEach((absolutePath) => {
  if (!fs.existsSync(absolutePath)) {
    fs.mkdirSync(absolutePath, { recursive: true });
  }
});

const setSecurityHeaders = (req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'SAMEORIGIN');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  res.setHeader('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');
  res.setHeader('Cross-Origin-Resource-Policy', 'same-site');
  res.setHeader('Cross-Origin-Opener-Policy', 'same-origin');
  res.setHeader('Content-Security-Policy', "default-src 'self'; script-src 'self' https://pagead2.googlesyndication.com; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; connect-src 'self'; frame-src https://googleads.g.doubleclick.net https://tpc.googlesyndication.com;");
  next();
};

const cleanupExpiredFiles = (dirPath) => {
  const now = Date.now();
  const retention = TEMP_RETENTION_MS;

  fs.readdir(dirPath, (readErr, files) => {
    if (readErr) return;

    files.forEach((fileName) => {
      const target = path.join(dirPath, fileName);
      fs.stat(target, (statErr, stats) => {
        if (statErr || !stats.isFile()) return;
        if (now - stats.mtimeMs > retention) {
          fs.unlink(target, () => {});
        }
      });
    });
  });
};

setInterval(() => {
  cleanupExpiredFiles(absoluteUploads);
  cleanupExpiredFiles(absoluteTmp);
}, CLEANUP_INTERVAL_MS).unref();

app.disable('x-powered-by');
app.use(setSecurityHeaders);
app.use(
  compression({
    threshold: 1024,
    level: 6
  })
);
app.use(cors({ origin: process.env.CORS_ORIGIN || '*' }));
app.use(express.json({ limit: MAX_BODY_SIZE }));
app.use(express.urlencoded({ extended: true, limit: MAX_BODY_SIZE }));

const apiLimiter = rateLimit({
  windowMs: Number(process.env.RATE_LIMIT_WINDOW_MS || 15 * 60 * 1000),
  max: Number(process.env.RATE_LIMIT_MAX || 100),
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    error: 'Too many requests. Please try again later.'
  }
});

app.set('view engine', 'html');
app.engine('html', (filePath, options, callback) => {
  fs.readFile(filePath, 'utf8', callback);
});
app.set('views', path.join(__dirname, 'views'));

app.use(
  express.static(path.join(__dirname, 'public'), {
    maxAge: STATIC_MAX_AGE,
    etag: true,
    lastModified: true
  })
);
app.use('/uploads', express.static(absoluteUploads, { maxAge: '1h', etag: true }));
app.use('/tmp', express.static(absoluteTmp, { maxAge: '30m', etag: true }));
app.use('/ads', express.static(path.join(__dirname, 'ads'), { maxAge: STATIC_MAX_AGE, etag: true }));

app.use('/', pagesRouter);
app.use('/api', apiLimiter, uploadRouter);
app.use('/api', apiLimiter, pdfToolsRouter);
app.use('/api', apiLimiter, conversionRouter);
app.use('/api', apiLimiter, editingToolsRouter);

app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

app.listen(PORT, () => {
  console.log(`Pro PDF Mate server is running on http://localhost:${PORT}`);
});
