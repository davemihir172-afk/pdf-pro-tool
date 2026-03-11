const http = require('http');
const fs = require('fs');
const path = require('path');

const port = Number(process.env.WEB_PORT || process.env.PORT || 3000);
const staticDir = path.join(__dirname, 'static');
const apiTarget = new URL(process.env.API_INTERNAL_URL || 'http://127.0.0.1:4000');

const routes = {
  '/': 'index.html',
  '/merge-pdf': 'tools/merge-pdf.html',
  '/split-pdf': 'tools/split-pdf.html',
  '/compress-pdf': 'tools/compress-pdf.html',
  '/rotate-pdf': 'tools/rotate-pdf.html',
  '/delete-pages': 'tools/delete-pages.html',
  '/extract-pages': 'tools/extract-pages.html',
  '/pdf-to-word': 'tools/pdf-to-word.html',
  '/pdf-to-excel': 'tools/pdf-to-excel.html',
  '/pdf-to-powerpoint': 'tools/pdf-to-powerpoint.html',
  '/pdf-to-jpg': 'tools/pdf-to-jpg.html',
  '/pdf-to-png': 'tools/pdf-to-png.html',
  '/pdf-to-txt': 'tools/pdf-to-txt.html',
  '/jpg-to-pdf': 'tools/jpg-to-pdf.html',
  '/png-to-pdf': 'tools/png-to-pdf.html',
  '/word-to-pdf': 'tools/word-to-pdf.html',
  '/excel-to-pdf': 'tools/excel-to-pdf.html',
  '/powerpoint-to-pdf': 'tools/powerpoint-to-pdf.html',
  '/html-to-pdf': 'tools/html-to-pdf.html',
  '/ai-summarize-pdf': 'tools/ai-summarize-pdf.html',
  '/ai-translate-pdf': 'tools/ai-translate-pdf.html',
  '/ai-extract-tables': 'tools/ai-extract-tables.html'
};

function serveFile(res, filePath, contentType = 'text/html') {
  const body = fs.readFileSync(filePath, 'utf8');
  res.writeHead(200, { 'Content-Type': contentType });
  res.end(body);
}

function proxyApi(req, res) {
  const options = {
    hostname: apiTarget.hostname,
    port: Number(apiTarget.port || 80),
    path: req.url,
    method: req.method,
    headers: req.headers
  };

  const proxyReq = http.request(options, (proxyRes) => {
    res.writeHead(proxyRes.statusCode || 502, proxyRes.headers);
    proxyRes.pipe(res, { end: true });
  });

  proxyReq.on('error', () => {
    res.writeHead(502, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: 'API upstream unavailable' }));
  });

  req.pipe(proxyReq, { end: true });
}

const server = http.createServer((req, res) => {
  if (req.url.startsWith('/api/')) return proxyApi(req, res);

  if (req.url === '/app.js') {
    return serveFile(res, path.join(staticDir, 'app.js'), 'application/javascript');
  }

  const route = routes[req.url];
  if (!route) {
    res.writeHead(404, { 'Content-Type': 'text/plain' });
    return res.end('Not found');
  }

  return serveFile(res, path.join(staticDir, route));
});

server.listen(port, '0.0.0.0', () => {
  console.log(`Web running on port ${port}`);
});
