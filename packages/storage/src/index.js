const fs = require('fs/promises');
const path = require('path');

const OUTPUT_DIR = path.join(process.cwd(), 'tmp', 'output');

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

module.exports = {
  writeOutputBuffer,
  readOutputBuffer
};
