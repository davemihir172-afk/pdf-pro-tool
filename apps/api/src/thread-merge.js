const { parentPort, workerData } = require('worker_threads');
const { processPdfTool } = require('@propdfmate/pdf-engine');

(async () => {
  const output = processPdfTool(workerData.tool, workerData.files, workerData.fields || {});
  parentPort.postMessage({ ok: true, buffer: output });
})().catch((error) => {
  parentPort.postMessage({ ok: false, error: error.message });
});
