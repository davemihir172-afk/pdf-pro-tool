const path = require('path');
const { Worker } = require('worker_threads');
const { claimNextJob, updateJob, completeClaim } = require('@propdfmate/queue');
const { writeOutputBuffer } = require('@propdfmate/storage');

const CONCURRENCY = Number(process.env.WORKER_CONCURRENCY || 2);

function runThread(type, payload) {
  return new Promise((resolve, reject) => {
    const worker = new Worker(path.join(__dirname, 'process-thread.js'), { workerData: { type, payload } });
    worker.once('message', (msg) => (msg.ok ? resolve(msg) : reject(new Error(msg.error))));
    worker.once('error', reject);
  });
}

async function processLoop(workerIndex) {
  while (true) {
    const claim = await claimNextJob();
    if (!claim) {
      await new Promise((r) => setTimeout(r, 500));
      continue;
    }

    const { marker, job } = claim;

    try {
      await updateJob(job.id, { progress: 40 });
      const result = await runThread(job.type, job.payload);
      await updateJob(job.id, { progress: 90 });

      const outputFileName = `${job.id}-${result.fileName || 'output.bin'}`;
      const outputPath = await writeOutputBuffer(outputFileName, Buffer.from(result.buffer));

      await updateJob(job.id, {
        status: 'completed',
        progress: 100,
        result: {
          outputPath,
          fileName: result.fileName || 'output.bin',
          mimeType: result.mimeType || 'application/octet-stream',
          downloadUrl: `/api/job/${job.id}/download`
        }
      });
    } catch (error) {
      await updateJob(job.id, { status: 'failed', progress: 100, error: error.message });
    } finally {
      await completeClaim(marker);
    }
  }
}

for (let i = 0; i < CONCURRENCY; i += 1) {
  processLoop(i).catch((error) => {
    console.error(`Worker loop ${i} crashed`, error);
  });
}

console.log(`Queue worker running with concurrency=${CONCURRENCY}`);
