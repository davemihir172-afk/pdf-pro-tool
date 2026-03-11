const fs = require('fs/promises');
const path = require('path');

const OUTPUT_DIR = path.resolve(__dirname, '../../../tmp/output');

async function ensureOutputDir() {
  await fs.mkdir(OUTPUT_DIR, { recursive: true });
}

async function writeOutputBuffer(fileName, buffer) {
  await ensureOutputDir();
  const fullPath = path.join(OUTPUT_DIR, fileName);
  await fs.writeFile(fullPath, buffer);
  return fullPath;
}

async function readOutputBuffer(filePath) {
  return fs.readFile(filePath);
}

function getOutputPath(fileName) {
  return path.join(OUTPUT_DIR, fileName);
}

async function cleanupOldOutputs(maxAgeMs = 30 * 60 * 1000) {
  await ensureOutputDir();
  const files = await fs.readdir(OUTPUT_DIR);
  const now = Date.now();
  await Promise.all(files.map(async (file) => {
    const full = path.join(OUTPUT_DIR, file);
    const stat = await fs.stat(full);
    if (now - stat.mtimeMs > maxAgeMs) await fs.rm(full, { force: true });
  }));
}

module.exports = {
  writeOutputBuffer,
  readOutputBuffer,
  getOutputPath,
  cleanupOldOutputs
};
