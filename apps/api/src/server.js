const http = require('http');
const path = require('path');
const { enqueueJob, getJob } = require('@propdfmate/queue');
const { readOutputBuffer } = require('@propdfmate/storage');

const port = Number(process.env.API_PORT || 4000);
const TOOL_ROUTES = new Set(['merge', 'split', 'compress', 'rotate', 'delete-pages', 'extract-pages']);
const CONVERSION_ROUTES = new Set([
  'pdf-to-word', 'pdf-to-excel', 'pdf-to-powerpoint', 'pdf-to-jpg', 'pdf-to-png', 'pdf-to-txt',
  'jpg-to-pdf', 'png-to-pdf', 'word-to-pdf', 'excel-to-pdf', 'powerpoint-to-pdf', 'html-to-pdf'
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

    if (headers.includes('filename=')) files.push({ content, fileName: fileNameMatch?.[1] || 'upload.bin' });
    else fields[fieldName] = content.toString('utf8').trim();
  }

  return { files, fields };
}

function mapPdfToolToJob(tool) {
  if (tool === 'merge') return 'merge-pdf';
  if (tool === 'split') return 'split-pdf';
  if (tool === 'compress') return 'compress-pdf';
  return 'ocr-pdf';
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

  if (req.url === '/health' && req.method === 'GET') return sendJson(res, 200, { status: 'ok' });

  const pdfMatch = req.url.match(/^\/api\/pdf\/([a-z-]+)$/);
  if (req.method === 'POST' && pdfMatch && TOOL_ROUTES.has(pdfMatch[1])) {
    const tool = pdfMatch[1];
    const chunks = []; for await (const chunk of req) chunks.push(chunk);
    const boundaryMatch = (req.headers['content-type'] || '').match(/boundary=(.+)$/);
    if (!boundaryMatch) return sendJson(res, 400, { error: 'Invalid multipart payload.' });

    const { files, fields } = parseMultipart(Buffer.concat(chunks), boundaryMatch[1]);
    if (tool === 'merge' && files.length < 2) return sendJson(res, 400, { error: 'At least two PDFs are required.' });
    if (tool !== 'merge' && files.length < 1) return sendJson(res, 400, { error: 'A PDF file is required.' });

    const job = await enqueueJob(mapPdfToolToJob(tool), {
      tool,
      files: files.map((file) => file.content.toString('base64')),
      fields
    });

    return sendJson(res, 202, { jobId: job.id, status: job.status, progress: job.progress });
  }

  const convertMatch = req.url.match(/^\/api\/convert\/([a-z-]+)$/);
  if (req.method === 'POST' && convertMatch && CONVERSION_ROUTES.has(convertMatch[1])) {
    const tool = convertMatch[1];
    const chunks = []; for await (const chunk of req) chunks.push(chunk);
    const boundaryMatch = (req.headers['content-type'] || '').match(/boundary=(.+)$/);
    if (!boundaryMatch) return sendJson(res, 400, { error: 'Invalid multipart payload.' });

    const { files } = parseMultipart(Buffer.concat(chunks), boundaryMatch[1]);
    if (files.length < 1) return sendJson(res, 400, { error: 'A file is required.' });

    const job = await enqueueJob('convert-pdf', {
      tool,
      fileName: files[0].fileName,
      file: files[0].content.toString('base64')
    });

    return sendJson(res, 202, { jobId: job.id, status: job.status, progress: job.progress });
  }

  const jobMatch = req.url.match(/^\/api\/job\/([0-9a-f-]+)$/i);
  if (req.method === 'GET' && jobMatch) {
    const job = await getJob(jobMatch[1]);
    if (!job) return sendJson(res, 404, { error: 'Job not found.' });

    return sendJson(res, 200, {
      id: job.id,
      status: job.status,
      progress: job.progress,
      downloadUrl: job.result?.downloadUrl || null,
      error: job.error || null
    });
  }

  const downloadMatch = req.url.match(/^\/api\/job\/([0-9a-f-]+)\/download$/i);
  if (req.method === 'GET' && downloadMatch) {
    const job = await getJob(downloadMatch[1]);
    if (!job || job.status !== 'completed' || !job.result?.outputPath) return sendJson(res, 404, { error: 'Output not available.' });

    const buffer = await readOutputBuffer(path.resolve(job.result.outputPath));
    res.writeHead(200, {
      'Access-Control-Allow-Origin': '*',
      'Content-Type': job.result.mimeType || 'application/octet-stream',
      'Content-Disposition': `attachment; filename="${job.result.fileName || 'output.bin'}"`
    });
    return res.end(buffer);
  }

  return sendJson(res, 404, { error: 'Not found' });
}).listen(port, () => {
  console.log(`API running on http://localhost:${port}`);
});
