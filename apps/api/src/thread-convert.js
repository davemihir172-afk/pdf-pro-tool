const { parentPort, workerData } = require('worker_threads');
const { convertDocument } = require('@propdfmate/pdf-engine/src/conversion');

(async () => {
  const output = await convertDocument(workerData.tool, workerData.fileName, Buffer.from(workerData.file, 'base64'));
  parentPort.postMessage({ ok: true, ...output, buffer: output.buffer });
})().catch((error) => {
  parentPort.postMessage({ ok: false, error: error.message });
});
