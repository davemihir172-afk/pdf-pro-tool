const { parentPort, workerData } = require('worker_threads');
const { processPdfTool } = require('@propdfmate/pdf-engine');
const { convertDocument } = require('@propdfmate/pdf-engine/src/conversion');

(async () => {
  const { type, payload } = workerData;

  if (type === 'convert-pdf') {
    const out = await convertDocument(payload.tool, payload.fileName, Buffer.from(payload.file, 'base64'));
    return parentPort.postMessage({ ok: true, ...out, buffer: out.buffer });
  }

  if (['merge-pdf', 'split-pdf', 'compress-pdf'].includes(type)) {
    const buffer = processPdfTool(payload.tool, payload.files, payload.fields || {});
    return parentPort.postMessage({ ok: true, buffer, fileName: `${payload.tool}-output.pdf`, mimeType: 'application/pdf' });
  }

  if (type === 'ocr-pdf') {
    return parentPort.postMessage({ ok: true, buffer: Buffer.from(payload.files?.[0] || '', 'base64'), fileName: 'ocr-output.pdf', mimeType: 'application/pdf' });
  }

  throw new Error(`Unsupported job type: ${type}`);
})().catch((error) => {
  parentPort.postMessage({ ok: false, error: error.message });
});
