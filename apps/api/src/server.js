const http = require('http');
const { Worker } = require('worker_threads');
const path = require('path');

const port = Number(process.env.API_PORT || 4000);

function sendJson(res, status, payload) {
  res.writeHead(status, {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET,POST,OPTIONS'
  });
  res.end(JSON.stringify(payload));
}

function parseMultipart(body, boundary) {
  const delimiter = Buffer.from(`--${boundary}`);
  const parts = [];
  let start = body.indexOf(delimiter) + delimiter.length + 2;

  while (start > delimiter.length) {
    const end = body.indexOf(delimiter, start);
    if (end === -1) break;
    const part = body.slice(start, end - 2);
    if (part.length) parts.push(part);
    start = end + delimiter.length + 2;
  }

  return parts
    .map((part) => {
      const headerEnd = part.indexOf(Buffer.from('\r\n\r\n'));
      if (headerEnd === -1) return null;
      const headers = part.slice(0, headerEnd).toString('utf8');
      const content = part.slice(headerEnd + 4);
      if (!headers.includes('filename=')) return null;
      return content;
    })
    .filter(Boolean);
}

function runMergeThread(files) {
  return new Promise((resolve, reject) => {
    const worker = new Worker(path.join(__dirname, 'thread-merge.js'), {
      workerData: { files }
    });
    worker.once('message', (msg) => (msg.ok ? resolve(Buffer.from(msg.buffer)) : reject(new Error(msg.error))));
    worker.once('error', reject);
  });
}

http.createServer(async (req, res) => {
  if (req.method === 'OPTIONS') {
    res.writeHead(204, {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET,POST,OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type'
    });
    return res.end();
  }

  if (req.url === '/health' && req.method === 'GET') {
    return sendJson(res, 200, { status: 'ok' });
  }

  if (req.url === '/api/pdf/merge' && req.method === 'POST') {
    const chunks = [];
    for await (const chunk of req) chunks.push(chunk);
    const body = Buffer.concat(chunks);
    const contentType = req.headers['content-type'] || '';
    const match = contentType.match(/boundary=(.+)$/);
    if (!match) return sendJson(res, 400, { error: 'Invalid multipart payload.' });

    const files = parseMultipart(body, match[1]);
    if (files.length < 2) return sendJson(res, 400, { error: 'At least two PDFs are required.' });

    const merged = await runMergeThread(files.map((b) => b.toString('base64')));
    res.writeHead(200, {
      'Content-Type': 'application/pdf',
      'Content-Disposition': 'attachment; filename="merged.pdf"',
      'Access-Control-Allow-Origin': '*'
    });
    return res.end(merged);
  }

  sendJson(res, 404, { error: 'Not found' });
}).listen(port, () => {
  console.log(`API running on http://localhost:${port}`);
});
