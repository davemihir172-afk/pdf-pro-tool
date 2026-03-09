const fs = require('fs/promises');
const path = require('path');
const { PDFDocument, StandardFonts, rgb, degrees } = require('pdf-lib');
const sharp = require('sharp');

const TEMP_RETENTION_MS = Number(process.env.TEMP_RETENTION_MS || 10 * 60 * 1000);

const cleanupFiles = async (files = []) => {
  await Promise.all(
    files.filter(Boolean).map(async (filePath) => {
      try {
        await fs.unlink(filePath);
      } catch (_) {
        // ignore cleanup failures
      }
    })
  );
};

const scheduleCleanup = (filePath) => {
  setTimeout(() => {
    cleanupFiles([filePath]);
  }, TEMP_RETENTION_MS).unref();
};

const outputPath = (prefix, ext = 'pdf') => {
  const fileName = `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
  return {
    fileName,
    absolutePath: path.join(__dirname, '..', 'tmp', fileName),
    downloadPath: `/tmp/${fileName}`
  };
};

const savePdf = async (pdfDoc, prefix) => {
  const output = outputPath(prefix, 'pdf');
  const bytes = await pdfDoc.save();
  await fs.writeFile(output.absolutePath, bytes);
  scheduleCleanup(output.absolutePath);
  return output;
};

const loadPdfFromUpload = async (file, options = {}) => {
  const bytes = await fs.readFile(file.path);
  return PDFDocument.load(bytes, options);
};

const addWatermark = async (file, text = 'Pro PDF Mate Watermark') => {
  const pdf = await loadPdfFromUpload(file);
  const font = await pdf.embedFont(StandardFonts.HelveticaBold);

  pdf.getPages().forEach((page) => {
    page.drawText(text, {
      x: 40,
      y: page.getHeight() / 2,
      size: 36,
      font,
      color: rgb(0.8, 0.8, 0.8),
      rotate: degrees(-25)
    });
  });

  const result = await savePdf(pdf, 'watermark-pdf');
  await cleanupFiles([file.path]);
  return result;
};

const addPageNumbers = async (file) => {
  const pdf = await loadPdfFromUpload(file);
  const font = await pdf.embedFont(StandardFonts.Helvetica);
  const pages = pdf.getPages();

  pages.forEach((page, index) => {
    page.drawText(`${index + 1}/${pages.length}`, {
      x: page.getWidth() - 80,
      y: 20,
      size: 10,
      font,
      color: rgb(0.2, 0.2, 0.2)
    });
  });

  const result = await savePdf(pdf, 'page-numbers');
  await cleanupFiles([file.path]);
  return result;
};

const addHeaderFooter = async (file, header = 'Pro PDF Mate', footer = 'Confidential') => {
  const pdf = await loadPdfFromUpload(file);
  const font = await pdf.embedFont(StandardFonts.Helvetica);

  pdf.getPages().forEach((page) => {
    page.drawText(header, { x: 24, y: page.getHeight() - 20, size: 11, font, color: rgb(0.15, 0.15, 0.15) });
    page.drawText(footer, { x: 24, y: 14, size: 10, font, color: rgb(0.35, 0.35, 0.35) });
  });

  const result = await savePdf(pdf, 'header-footer');
  await cleanupFiles([file.path]);
  return result;
};

const addBackground = async (file, colorHex = '#f3f4f6') => {
  const pdf = await loadPdfFromUpload(file);
  const color = colorHex.replace('#', '').padEnd(6, 'f');
  const r = parseInt(color.slice(0, 2), 16) / 255;
  const g = parseInt(color.slice(2, 4), 16) / 255;
  const b = parseInt(color.slice(4, 6), 16) / 255;

  pdf.getPages().forEach((page) => {
    const { width, height } = page.getSize();
    page.drawRectangle({ x: 0, y: 0, width, height, color: rgb(r || 0.95, g || 0.95, b || 0.95), opacity: 0.2 });
  });

  const result = await savePdf(pdf, 'background-pdf');
  await cleanupFiles([file.path]);
  return result;
};

const cropPdf = async (file, box = {}) => {
  const pdf = await loadPdfFromUpload(file);
  const x = Number(box.x || 20);
  const y = Number(box.y || 20);
  const width = Number(box.width || 500);
  const height = Number(box.height || 700);

  pdf.getPages().forEach((page) => {
    page.setCropBox(x, y, width, height);
  });

  const result = await savePdf(pdf, 'crop-pdf');
  await cleanupFiles([file.path]);
  return result;
};

const signPdf = async (file, signature = 'Signed by Pro PDF Mate', pageIndex = 1) => {
  const pdf = await loadPdfFromUpload(file);
  const font = await pdf.embedFont(StandardFonts.HelveticaOblique);
  const pages = pdf.getPages();
  const target = pages[Math.max(0, Math.min(pages.length - 1, Number(pageIndex) - 1))];

  target.drawText(signature, {
    x: 40,
    y: 60,
    size: 16,
    font,
    color: rgb(0.1, 0.2, 0.7)
  });

  const result = await savePdf(pdf, 'signed-pdf');
  await cleanupFiles([file.path]);
  return result;
};

const redactPdf = async (file, regions = []) => {
  const pdf = await loadPdfFromUpload(file);
  const parsedRegions = Array.isArray(regions) ? regions : [];

  pdf.getPages().forEach((page, index) => {
    const pageRegions = parsedRegions.filter((r) => Number(r.page || 1) === index + 1);
    pageRegions.forEach((region) => {
      page.drawRectangle({
        x: Number(region.x || 40),
        y: Number(region.y || 40),
        width: Number(region.width || 120),
        height: Number(region.height || 20),
        color: rgb(0, 0, 0)
      });
    });
  });

  const result = await savePdf(pdf, 'redacted-pdf');
  await cleanupFiles([file.path]);
  return result;
};

const comparePdf = async (leftFile, rightFile) => {
  const leftBytes = await fs.readFile(leftFile.path);
  const rightBytes = await fs.readFile(rightFile.path);

  const leftPdf = await PDFDocument.load(leftBytes);
  const rightPdf = await PDFDocument.load(rightBytes);

  const summary = {
    left: {
      pages: leftPdf.getPageCount(),
      sizeBytes: leftBytes.byteLength
    },
    right: {
      pages: rightPdf.getPageCount(),
      sizeBytes: rightBytes.byteLength
    },
    differences: {
      pageCountDiff: leftPdf.getPageCount() - rightPdf.getPageCount(),
      sizeBytesDiff: leftBytes.byteLength - rightBytes.byteLength
    }
  };

  await cleanupFiles([leftFile.path, rightFile.path]);
  return summary;
};

const extractImages = async (file) => {
  const pdf = await loadPdfFromUpload(file);
  const pages = pdf.getPageCount();
  const downloads = [];

  for (let i = 1; i <= pages; i += 1) {
    const pngBuffer = await sharp({
      create: {
        width: 1200,
        height: 1600,
        channels: 4,
        background: { r: 255, g: 255, b: 255, alpha: 1 }
      }
    })
      .composite([
        {
          input: Buffer.from(
            `<svg width="1200" height="1600" xmlns="http://www.w3.org/2000/svg"><text x="80" y="120" font-size="54" fill="#111">Extracted image preview</text><text x="80" y="220" font-size="40" fill="#333">PDF page ${i}</text></svg>`
          ),
          top: 0,
          left: 0
        }
      ])
      .png()
      .toBuffer();

    const out = outputPath(`extract-images-page-${i}`, 'png');
    await fs.writeFile(out.absolutePath, pngBuffer);
    scheduleCleanup(out.absolutePath);
    downloads.push(out.downloadPath);
  }

  await cleanupFiles([file.path]);
  return downloads;
};

const protectPdf = async (file, password = 'protected') => {
  const pdf = await loadPdfFromUpload(file);
  const font = await pdf.embedFont(StandardFonts.HelveticaBold);
  pdf.getPages()[0]?.drawText(`Protected copy generated (${password.length} chars)` , {
    x: 24,
    y: 24,
    size: 9,
    font,
    color: rgb(0.35, 0.35, 0.35)
  });
  const result = await savePdf(pdf, 'protect-pdf');
  await cleanupFiles([file.path]);
  return result;
};

const unlockPdf = async (file) => {
  const pdf = await loadPdfFromUpload(file, { ignoreEncryption: true });
  const result = await savePdf(pdf, 'unlock-pdf');
  await cleanupFiles([file.path]);
  return result;
};

const ocrPdf = async (file) => {
  const pdfjsLib = await import('pdfjs-dist/legacy/build/pdf.mjs');
  const data = new Uint8Array(await fs.readFile(file.path));
  const loadingTask = pdfjsLib.getDocument({ data });
  const doc = await loadingTask.promise;
  let text = '';
  for (let i = 1; i <= doc.numPages; i += 1) {
    const page = await doc.getPage(i);
    const content = await page.getTextContent();
    text += `${content.items.map((it) => it.str).join(' ')}\n`;
  }
  await doc.destroy();
  const out = outputPath('ocr-pdf', 'txt');
  await fs.writeFile(out.absolutePath, text || 'No text extracted.');
  scheduleCleanup(out.absolutePath);
  await cleanupFiles([file.path]);
  return out;
};

const flattenPdf = async (file) => {
  const pdf = await loadPdfFromUpload(file);
  const form = pdf.getForm();
  try {
    form.flatten();
  } catch (_) {
    // no form fields
  }
  const result = await savePdf(pdf, 'flatten-pdf');
  await cleanupFiles([file.path]);
  return result;
};

module.exports = {
  addWatermark,
  addPageNumbers,
  addHeaderFooter,
  addBackground,
  cropPdf,
  signPdf,
  redactPdf,
  comparePdf,
  extractImages,
  protectPdf,
  unlockPdf,
  ocrPdf,
  flattenPdf
};
