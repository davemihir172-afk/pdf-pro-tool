const http = require('http');
const fs = require('fs');
const path = require('path');

const port = Number(process.env.WEB_PORT || 3000);

const server = http.createServer((req, res) => {
  const route = req.url === '/merge-pdf' ? 'merge.html' : 'index.html';
  const filePath = path.join(__dirname, 'static', route);
  const html = fs.readFileSync(filePath, 'utf8');
  res.setHeader('Content-Type', 'text/html');
  res.end(html);
});

server.listen(port, () => {
  console.log(`Web running on http://localhost:${port}`);
});
