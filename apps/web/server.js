const http = require('http');
const fs = require('fs');
const path = require('path');

const port = Number(process.env.WEB_PORT || 3000);
const staticDir = path.join(__dirname, 'static');

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
  '/ai-extract-tables': 'tools/ai-extract-tables.html',
};

function serveFile(res, filePath, contentType = 'text/html') {
  const html = fs.readFileSync(filePath, 'utf8');
  res.writeHead(200, { 'Content-Type': contentType });
  res.end(html);
}

const server = http.createServer((req, res) => {
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

server.listen(port, () => {
  console.log(`Web running on http://localhost:${port}`);
});
