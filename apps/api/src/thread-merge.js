const { parentPort, workerData } = require('worker_threads');
const { mergePdfBuffers } = require('@propdfmate/pdf-engine');

(async () => {
  const mergedBuffer = await mergePdfBuffers(workerData.files);
  parentPort.postMessage({ ok: true, buffer: mergedBuffer });
})().catch((error) => {
  parentPort.postMessage({ ok: false, error: error.message });
});
