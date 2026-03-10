const {
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
} = require('../tools/pdfEditingService');

const onError = (res, error) => res.status(400).json({ error: error.message || 'PDF edit failed.' });

const requireFile = (req, res) => {
  if (!req.file) {
    res.status(400).json({ error: 'Upload a PDF file.' });
    return false;
  }
  return true;
};

const watermarkPdf = async (req, res) => {
  try {
    if (!requireFile(req, res)) return null;
    const result = await addWatermark(req.file, req.body.text);
    return res.status(200).json({ message: 'Watermark added.', download: result.downloadPath });
  } catch (error) {
    return onError(res, error);
  }
};

const pageNumbersPdf = async (req, res) => {
  try {
    if (!requireFile(req, res)) return null;
    const result = await addPageNumbers(req.file);
    return res.status(200).json({ message: 'Page numbers added.', download: result.downloadPath });
  } catch (error) {
    return onError(res, error);
  }
};

const headerFooterPdf = async (req, res) => {
  try {
    if (!requireFile(req, res)) return null;
    const result = await addHeaderFooter(req.file, req.body.header, req.body.footer);
    return res.status(200).json({ message: 'Header/footer added.', download: result.downloadPath });
  } catch (error) {
    return onError(res, error);
  }
};

const backgroundPdf = async (req, res) => {
  try {
    if (!requireFile(req, res)) return null;
    const result = await addBackground(req.file, req.body.color);
    return res.status(200).json({ message: 'Background added.', download: result.downloadPath });
  } catch (error) {
    return onError(res, error);
  }
};

const cropPdfTool = async (req, res) => {
  try {
    if (!requireFile(req, res)) return null;
    const result = await cropPdf(req.file, req.body);
    return res.status(200).json({ message: 'PDF cropped.', download: result.downloadPath });
  } catch (error) {
    return onError(res, error);
  }
};

const signPdfTool = async (req, res) => {
  try {
    if (!requireFile(req, res)) return null;
    const result = await signPdf(req.file, req.body.signature, req.body.pageIndex);
    return res.status(200).json({ message: 'PDF signed.', download: result.downloadPath });
  } catch (error) {
    return onError(res, error);
  }
};

const redactPdfTool = async (req, res) => {
  try {
    if (!requireFile(req, res)) return null;
    let regions = [];
    if (req.body.regions) {
      regions = typeof req.body.regions === 'string' ? JSON.parse(req.body.regions) : req.body.regions;
    }
    const result = await redactPdf(req.file, regions);
    return res.status(200).json({ message: 'PDF redacted.', download: result.downloadPath });
  } catch (error) {
    return onError(res, error);
  }
};

const comparePdfTool = async (req, res) => {
  try {
    if (!req.files || req.files.length < 2) {
      return res.status(400).json({ error: 'Upload 2 PDF files (files field).' });
    }
    const [left, right] = req.files;
    const result = await comparePdf(left, right);
    return res.status(200).json({ message: 'PDF compared.', result });
  } catch (error) {
    return onError(res, error);
  }
};

const extractImagesTool = async (req, res) => {
  try {
    if (!requireFile(req, res)) return null;
    const downloads = await extractImages(req.file);
    return res.status(200).json({ message: 'Images extracted.', downloads });
  } catch (error) {
    return onError(res, error);
  }
};

const protectPdfTool = async (req, res) => {
  try {
    if (!requireFile(req, res)) return null;
    const result = await protectPdf(req.file, req.body.password);
    return res.status(200).json({ message: 'PDF protected copy generated.', download: result.downloadPath });
  } catch (error) {
    return onError(res, error);
  }
};

const unlockPdfTool = async (req, res) => {
  try {
    if (!requireFile(req, res)) return null;
    const result = await unlockPdf(req.file);
    return res.status(200).json({ message: 'PDF unlocked copy generated.', download: result.downloadPath });
  } catch (error) {
    return onError(res, error);
  }
};

const ocrPdfTool = async (req, res) => {
  try {
    if (!requireFile(req, res)) return null;
    const result = await ocrPdf(req.file);
    return res.status(200).json({ message: 'OCR extraction completed.', download: result.downloadPath });
  } catch (error) {
    return onError(res, error);
  }
};

const flattenPdfTool = async (req, res) => {
  try {
    if (!requireFile(req, res)) return null;
    const result = await flattenPdf(req.file);
    return res.status(200).json({ message: 'PDF flattened.', download: result.downloadPath });
  } catch (error) {
    return onError(res, error);
  }
};

module.exports = {
  watermarkPdf,
  pageNumbersPdf,
  headerFooterPdf,
  backgroundPdf,
  cropPdfTool,
  signPdfTool,
  redactPdfTool,
  comparePdfTool,
  extractImagesTool,
  protectPdfTool,
  unlockPdfTool,
  ocrPdfTool,
  flattenPdfTool
};
