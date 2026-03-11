const http = require('http');
const path = require('path');
const fs = require('fs/promises');
const os = require('os');
const { enqueueJob, getJob } = require('@propdfmate/queue');
const { readOutputBuffer } = require('@propdfmate/storage');
const { extractPdfText, callOpenAI } = require('@propdfmate/ai-tools');

const port = Number(process.env.API_PORT || process.env.PORT || 4000);
const MAX_UPLOAD_BYTES = Number(process.env.MAX_UPLOAD_BYTES || 15 * 1024 * 1024);
const RATE_LIMIT_WINDOW_MS = Number(process.env.RATE_LIMIT_WINDOW_MS || 60 * 1000);
const RATE_LIMIT_MAX = Number(process.env.RATE_LIMIT_MAX || 80);

const TOOL_ROUTES = new Set(['merge', 'split', 'compress', 'rotate', 'delete-pages', 'extract-pages']);
const CONVERSION_ROUTES = new Set([
  'pdf-to-word', 'pdf-to-excel', 'pdf-to-powerpoint', 'pdf-to-jpg', 'pdf-to-png', 'pdf-to-txt',
  'jpg-to-pdf', 'png-to-pdf', 'word-to-pdf', 'excel-to-pdf', 'powerpoint-to-pdf', 'html-to-pdf'
]);

const rateStore = new Map();

function sendJson(res, status, payload) {
  res.writeHead(status, {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET,POST,OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type'
  });
  res.end(JSON.stringify(payload));
}

function sanitizeFilename(name = 'upload.bin') {
  return path.basename(name).replace(/[^a-zA-Z0-9._-]/g, '_');
}

function checkRateLimit(ip) {
  const now = Date.now();
  const current = rateStore.get(ip) || { count: 0, resetAt: now + RATE_LIMIT_WINDOW_MS };
  if (now > current.resetAt) {
    current.count = 0;
    current.resetAt = now + RATE_LIMIT_WINDOW_MS;
  }
  current.count += 1;
  rateStore.set(ip, current);
  return current.count <= RATE_LIMIT_MAX;
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
    const contentTypeMatch = headers.match(/Content-Type:\s*([^\r\n]+)/i);
    const fieldName = nameMatch?.[1];
    if (!fieldName) continue;

    if (headers.includes('filename=')) {
      files.push({
        content,
        fileName: sanitizeFilename(fileNameMatch?.[1] || 'upload.bin'),
        contentType: (contentTypeMatch?.[1] || '').trim().toLowerCase()
      });
    } else {
      fields[fieldName] = content.toString('utf8').trim().slice(0, 200);
    }
  }

  return { files, fields };
}

function mapPdfToolToJob(tool) {
  if (tool === 'merge') return 'merge-pdf';
  if (tool === 'split') return 'split-pdf';
  if (tool === 'compress') return 'compress-pdf';
  return 'ocr-pdf';
}

function validateFiles(files, mode) {
  if (!files.length) return 'A file is required.';
  const overLimit = files.some((file) => file.content.length > MAX_UPLOAD_BYTES);
  if (overLimit) return `File exceeds max upload size of ${MAX_UPLOAD_BYTES} bytes.`;

  if (mode === 'pdf') {
    const bad = files.some((file) => !file.fileName.toLowerCase().endsWith('.pdf') && file.contentType !== 'application/pdf');
    if (bad) return 'Only PDF files are allowed for this endpoint.';
  }

  if (mode === 'ai') {
    const bad = files.some((file) => !file.fileName.toLowerCase().endsWith('.pdf'));
    if (bad) return 'AI endpoints require PDF files.';
  }

  return null;
}


async function persistTempFiles(files) {
  const root = process.env.UPLOAD_DIR || path.join(os.tmpdir(), 'propdfmate-uploads');
  await fs.mkdir(root, { recursive: true });
  const runDir = await fs.mkdtemp(path.join(root, 'run-'));
  const written = [];
  for (const file of files) {
    const full = path.join(runDir, file.fileName);
    await fs.writeFile(full, file.content);
    written.push(full);
  }
  return async () => {
    await Promise.all(written.map((file) => fs.rm(file, { force: true })));
    await fs.rm(runDir, { recursive: true, force: true });
  };
}

async function readBody(req) {
  const chunks = [];
  let total = 0;
  for await (const chunk of req) {
    total += chunk.length;
    if (total > MAX_UPLOAD_BYTES * 4) throw new Error('Request body too large.');
    chunks.push(chunk);
  }
  return Buffer.concat(chunks);
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

  const ip = req.socket.remoteAddress || 'unknown';
  if (!checkRateLimit(ip)) return sendJson(res, 429, { error: 'Too many requests. Please try again later.' });

  if (req.url === '/health' && req.method === 'GET') return sendJson(res, 200, { status: 'ok' });

  try {
    const pdfMatch = req.url.match(/^\/api\/pdf\/([a-z-]+)$/);
    if (req.method === 'POST' && pdfMatch && TOOL_ROUTES.has(pdfMatch[1])) {
      const tool = pdfMatch[1];
      const boundaryMatch = (req.headers['content-type'] || '').match(/boundary=(.+)$/);
      if (!boundaryMatch) return sendJson(res, 400, { error: 'Invalid multipart payload.' });

      const { files, fields } = parseMultipart(await readBody(req), boundaryMatch[1]);
      const fileError = validateFiles(files, 'pdf');
      if (fileError) return sendJson(res, 400, { error: fileError });
      if (tool === 'merge' && files.length < 2) return sendJson(res, 400, { error: 'At least two PDFs are required.' });

      const cleanupTemp = await persistTempFiles(files);
      try {
        const job = await enqueueJob(mapPdfToolToJob(tool), {
          tool,
          files: files.map((file) => file.content.toString('base64')),
          fields
        });

        return sendJson(res, 202, { jobId: job.id, status: job.status, progress: job.progress });
      } finally {
        await cleanupTemp();
      }
    }

    const convertMatch = req.url.match(/^\/api\/convert\/([a-z-]+)$/);
    if (req.method === 'POST' && convertMatch && CONVERSION_ROUTES.has(convertMatch[1])) {
      const tool = convertMatch[1];
      const boundaryMatch = (req.headers['content-type'] || '').match(/boundary=(.+)$/);
      if (!boundaryMatch) return sendJson(res, 400, { error: 'Invalid multipart payload.' });

      const { files } = parseMultipart(await readBody(req), boundaryMatch[1]);
      const fileError = validateFiles(files, 'convert');
      if (fileError) return sendJson(res, 400, { error: fileError });

      const cleanupTemp = await persistTempFiles(files);
      try {
        const job = await enqueueJob('convert-pdf', {
          tool,
          fileName: files[0].fileName,
          file: files[0].content.toString('base64')
        });

        return sendJson(res, 202, { jobId: job.id, status: job.status, progress: job.progress });
      } finally {
        await cleanupTemp();
      }
    }

    const aiMatch = req.url.match(/^\/api\/ai\/(summarize|translate|extract-tables)$/);
    if (req.method === 'POST' && aiMatch) {
      const aiTask = aiMatch[1];
      const boundaryMatch = (req.headers['content-type'] || '').match(/boundary=(.+)$/);
      if (!boundaryMatch) return sendJson(res, 400, { error: 'Invalid multipart payload.' });

      const { files, fields } = parseMultipart(await readBody(req), boundaryMatch[1]);
      const fileError = validateFiles(files, 'ai');
      if (fileError) return sendJson(res, 400, { error: fileError });

      const cleanupTemp = await persistTempFiles(files);
      try {
        const extractedText = extractPdfText(files[0].content);
        if (!extractedText) return sendJson(res, 400, { error: 'No extractable text found in PDF.' });
        const result = await callOpenAI({ task: aiTask, text: extractedText, language: fields.language });
        return sendJson(res, 200, { result });
      } finally {
        await cleanupTemp();
      }
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
  } catch (error) {
    return sendJson(res, 500, { error: error.message || 'Unexpected server error.' });
  }
}).listen(process.env.PORT || 3000, '0.0.0.0', () => {
  console.log(`Server running on port ${process.env.PORT}`);
});
