const http = require('http');
const { Worker } = require('worker_threads');
const path = require('path');

const port = Number(process.env.API_PORT || 4000);
const TOOL_ROUTES = new Set(['merge', 'split', 'compress', 'rotate', 'delete-pages', 'extract-pages']);
const CONVERSION_ROUTES = new Set([
  'pdf-to-word',
  'pdf-to-excel',
  'pdf-to-powerpoint',
  'pdf-to-jpg',
  'pdf-to-png',
  'pdf-to-txt',
  'jpg-to-pdf',
  'png-to-pdf',
  'word-to-pdf',
  'excel-to-pdf',
  'powerpoint-to-pdf',
  'html-to-pdf'
]);

function sendJson(res, status, payload) {
  res.writeHead(status, {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET,POST,OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type'
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

  const files = [];
  const fields = {};

  for (const part of parts) {
    const headerEnd = part.indexOf(Buffer.from('\r\n\r\n'));
    if (headerEnd === -1) continue;
    const headers = part.slice(0, headerEnd).toString('utf8');
    const content = part.slice(headerEnd + 4);

    const nameMatch = headers.match(/name="([^"]+)"/);
    const fileNameMatch = headers.match(/filename="([^"]+)"/);
    const fieldName = nameMatch?.[1];
    if (!fieldName) continue;

    if (headers.includes('filename=')) {
      files.push({ content, fileName: fileNameMatch?.[1] || 'upload.bin' });
    } else {
      fields[fieldName] = content.toString('utf8').trim();
    }
  }

  return { files, fields };
}

function runWorker(scriptName, payload) {
  return new Promise((resolve, reject) => {
    const worker = new Worker(path.join(__dirname, scriptName), { workerData: payload });
    worker.once('message', (msg) => (msg.ok ? resolve(msg) : reject(new Error(msg.error))));
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

  const pdfMatch = req.url.match(/^\/api\/pdf\/([a-z-]+)$/);
  const convertMatch = req.url.match(/^\/api\/convert\/([a-z-]+)$/);

  if (req.method === 'POST' && pdfMatch && TOOL_ROUTES.has(pdfMatch[1])) {
    const tool = pdfMatch[1];
    const chunks = [];
    for await (const chunk of req) chunks.push(chunk);
    const body = Buffer.concat(chunks);
    const boundaryMatch = (req.headers['content-type'] || '').match(/boundary=(.+)$/);
    if (!boundaryMatch) return sendJson(res, 400, { error: 'Invalid multipart payload.' });

    const { files, fields } = parseMultipart(body, boundaryMatch[1]);
    if (tool === 'merge' && files.length < 2) return sendJson(res, 400, { error: 'At least two PDFs are required.' });
    if (tool !== 'merge' && files.length < 1) return sendJson(res, 400, { error: 'A PDF file is required.' });

    let output;
    try {
      output = await runWorker('thread-merge.js', {
        tool,
        files: files.map((file) => file.content.toString('base64')),
        fields
      });
    } catch (error) {
      return sendJson(res, 500, { error: error.message });
    }

    res.writeHead(200, {
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename="${tool}-output.pdf"`,
      'Access-Control-Allow-Origin': '*'
    });
    return res.end(Buffer.from(output.buffer));
  }

  if (req.method === 'POST' && convertMatch && CONVERSION_ROUTES.has(convertMatch[1])) {
    const tool = convertMatch[1];
    const chunks = [];
    for await (const chunk of req) chunks.push(chunk);
    const body = Buffer.concat(chunks);
    const boundaryMatch = (req.headers['content-type'] || '').match(/boundary=(.+)$/);
    if (!boundaryMatch) return sendJson(res, 400, { error: 'Invalid multipart payload.' });

    const { files } = parseMultipart(body, boundaryMatch[1]);
    if (files.length < 1) return sendJson(res, 400, { error: 'A file is required.' });

    let output;
    try {
      output = await runWorker('thread-convert.js', {
        tool,
        fileName: files[0].fileName,
        file: files[0].content.toString('base64')
      });
    } catch (error) {
      return sendJson(res, 500, { error: error.message });
    }

    res.writeHead(200, {
      'Content-Type': output.mimeType,
      'Content-Disposition': `attachment; filename="${output.fileName}"`,
      'Access-Control-Allow-Origin': '*'
    });
    return res.end(Buffer.from(output.buffer));
  }

  sendJson(res, 404, { error: 'Not found' });
}).listen(port, () => {
  console.log(`API running on http://localhost:${port}`);
});
