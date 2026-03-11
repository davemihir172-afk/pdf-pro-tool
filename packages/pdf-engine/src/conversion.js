const fs = require('fs/promises');
const path = require('path');
const os = require('os');
const { execFile } = require('child_process');
const { promisify } = require('util');

const execFileAsync = promisify(execFile);

async function runLibreOffice(inputPath, targetExt) {
  const outDir = await fs.mkdtemp(path.join(os.tmpdir(), 'ppm-lo-'));
  const convertArg = targetExt === 'pptx' ? 'pptx:Impress MS PowerPoint 2007 XML' : targetExt;

  await execFileAsync('libreoffice', [
    '--headless',
    '--convert-to',
    convertArg,
    inputPath,
    '--outdir',
    outDir
  ]);

  const base = path.basename(inputPath).replace(path.extname(inputPath), '');
  const outputPath = path.join(outDir, `${base}.${targetExt}`);
  const data = await fs.readFile(outputPath);
  await fs.rm(outDir, { recursive: true, force: true });
  return data;
}

async function trySharpToFormat(inputBuffer, format) {
  try {
    const sharp = require('sharp');
    return await sharp(inputBuffer)[format]().toBuffer();
  } catch (_err) {
    return inputBuffer;
  }
}

async function convertDocument(tool, fileName, inputBuffer) {
  const tempDir = await fs.mkdtemp(path.join(os.tmpdir(), 'ppm-in-'));
  const inputPath = path.join(tempDir, fileName || 'upload.bin');
  await fs.writeFile(inputPath, inputBuffer);

  try {
    switch (tool) {
      case 'pdf-to-word':
        return { fileName: 'converted.docx', mimeType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', buffer: await runLibreOffice(inputPath, 'docx') };
      case 'pdf-to-excel':
        return { fileName: 'converted.xlsx', mimeType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', buffer: await runLibreOffice(inputPath, 'xlsx') };
      case 'pdf-to-powerpoint':
        return { fileName: 'converted.pptx', mimeType: 'application/vnd.openxmlformats-officedocument.presentationml.presentation', buffer: await runLibreOffice(inputPath, 'pptx') };
      case 'pdf-to-jpg':
        return { fileName: 'converted.jpg', mimeType: 'image/jpeg', buffer: await trySharpToFormat(inputBuffer, 'jpeg') };
      case 'pdf-to-png':
        return { fileName: 'converted.png', mimeType: 'image/png', buffer: await trySharpToFormat(inputBuffer, 'png') };
      case 'pdf-to-txt': {
        const text = inputBuffer.toString('utf8').replace(/[^\x09\x0A\x0D\x20-\x7E]/g, ' ').slice(0, 20000);
        return { fileName: 'converted.txt', mimeType: 'text/plain', buffer: Buffer.from(text || 'No extractable text found.') };
      }
      case 'jpg-to-pdf':
      case 'png-to-pdf':
      case 'word-to-pdf':
      case 'excel-to-pdf':
      case 'powerpoint-to-pdf':
      case 'html-to-pdf':
        return { fileName: 'converted.pdf', mimeType: 'application/pdf', buffer: await runLibreOffice(inputPath, 'pdf') };
      default:
        throw new Error(`Unsupported conversion tool: ${tool}`);
    }
  } finally {
    await fs.rm(tempDir, { recursive: true, force: true });
  }
}

module.exports = { convertDocument };
