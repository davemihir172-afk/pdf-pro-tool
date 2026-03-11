const fs = require('fs/promises');
const path = require('path');
const crypto = require('crypto');
const net = require('net');

const QUEUE_ROOT = path.resolve(__dirname, '../../../tmp/queue');
const PENDING_DIR = path.join(QUEUE_ROOT, 'pending');
const PROCESSING_DIR = path.join(QUEUE_ROOT, 'processing');
const JOBS_DIR = path.join(QUEUE_ROOT, 'jobs');

async function ensureDirs() {
  await fs.mkdir(PENDING_DIR, { recursive: true });
  await fs.mkdir(PROCESSING_DIR, { recursive: true });
  await fs.mkdir(JOBS_DIR, { recursive: true });
}

function jobPath(jobId) {
  return path.join(JOBS_DIR, `${jobId}.json`);
}

async function writeJob(job) {
  await ensureDirs();
  await fs.writeFile(jobPath(job.id), JSON.stringify(job, null, 2));
}

async function readJob(jobId) {
  const raw = await fs.readFile(jobPath(jobId), 'utf8');
  return JSON.parse(raw);
}

async function enqueueJob(type, payload) {
  await ensureDirs();
  const id = crypto.randomUUID();
  const now = Date.now();
  const job = { id, type, payload, status: 'queued', progress: 5, createdAt: now, updatedAt: now };
  await writeJob(job);
  await fs.writeFile(path.join(PENDING_DIR, `${now}-${id}.job`), id);
  return job;
}

async function claimNextJob() {
  await ensureDirs();
  const files = (await fs.readdir(PENDING_DIR)).sort();
  for (const file of files) {
    const src = path.join(PENDING_DIR, file);
    const dst = path.join(PROCESSING_DIR, file);
    try {
      await fs.rename(src, dst);
      const id = (await fs.readFile(dst, 'utf8')).trim();
      await updateJob(id, { status: 'processing', progress: 20 });
      return { marker: dst, job: await readJob(id) };
    } catch (_err) {
      continue;
    }
  }
  return null;
}

async function updateJob(jobId, patch) {
  const job = await readJob(jobId);
  const next = { ...job, ...patch, updatedAt: Date.now() };
  await writeJob(next);
  return next;
}

async function completeClaim(markerPath) {
  await fs.rm(markerPath, { force: true });
}

async function getJob(jobId) {
  try {
    return await readJob(jobId);
  } catch (_err) {
    return null;
  }
}

function redisConnectionFromEnv() {
  const redisUrl = process.env.REDIS_URL || 'redis://127.0.0.1:6379';
  const parsed = new URL(redisUrl);
  return { host: parsed.hostname, port: Number(parsed.port || 6379) };
}

function pingRedis({ host, port }, timeoutMs = 1500) {
  return new Promise((resolve) => {
    const socket = net.createConnection({ host, port });
    let done = false;

    const finish = (ok) => {
      if (done) return;
      done = true;
      socket.destroy();
      resolve(ok);
    };

    socket.setTimeout(timeoutMs);
    socket.once('connect', () => finish(true));
    socket.once('error', () => finish(false));
    socket.once('timeout', () => finish(false));
  });
}

async function waitForRedis(maxRetries = 10, delayMs = 1000) {
  const conn = redisConnectionFromEnv();
  for (let i = 1; i <= maxRetries; i += 1) {
    const ok = await pingRedis(conn);
    if (ok) return true;
    await new Promise((r) => setTimeout(r, delayMs));
  }
  return false;
}

module.exports = {
  enqueueJob,
  claimNextJob,
  updateJob,
  completeClaim,
  getJob,
  redisConnectionFromEnv,
  waitForRedis
};
