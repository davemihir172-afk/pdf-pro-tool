const {
  mergePdfFiles,
  splitPdfFile,
  compressPdfFile,
  rotatePdfFile,
  reorderPdfPages,
  deletePdfPages,
  extractPdfPages
} = require('../tools/pdfToolsService');

const handleError = (res, error) => {
  return res.status(400).json({ error: error.message || 'PDF processing failed.' });
};

const mergePdf = async (req, res) => {
  try {
    if (!req.files || req.files.length < 2) {
      return res.status(400).json({ error: 'Upload at least 2 PDF files.' });
    }

    const result = await mergePdfFiles(req.files);
    return res.status(200).json({ message: 'Merge successful.', download: result.downloadPath });
  } catch (error) {
    return handleError(res, error);
  }
};

const splitPdf = async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'Upload a PDF file.' });

    const files = await splitPdfFile(req.file);
    return res.status(200).json({
      message: 'Split successful.',
      downloads: files.map((file) => file.downloadPath)
    });
  } catch (error) {
    return handleError(res, error);
  }
};

const compressPdf = async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'Upload a PDF file.' });

    const result = await compressPdfFile(req.file);
    return res.status(200).json({ message: 'Compression successful.', download: result.downloadPath });
  } catch (error) {
    return handleError(res, error);
  }
};

const rotatePdf = async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'Upload a PDF file.' });

    const result = await rotatePdfFile(req.file, req.body.angle);
    return res.status(200).json({ message: 'Rotation successful.', download: result.downloadPath });
  } catch (error) {
    return handleError(res, error);
  }
};

const organizePdf = async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'Upload a PDF file.' });

    const result = await reorderPdfPages(req.file, req.body.order);
    return res.status(200).json({ message: 'Organize successful.', download: result.downloadPath });
  } catch (error) {
    return handleError(res, error);
  }
};

const deletePagesPdf = async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'Upload a PDF file.' });

    const result = await deletePdfPages(req.file, req.body.pages);
    return res.status(200).json({ message: 'Delete pages successful.', download: result.downloadPath });
  } catch (error) {
    return handleError(res, error);
  }
};

const extractPagesPdf = async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'Upload a PDF file.' });

    const result = await extractPdfPages(req.file, req.body.pages);
    return res.status(200).json({ message: 'Extract pages successful.', download: result.downloadPath });
  } catch (error) {
    return handleError(res, error);
  }
};

module.exports = {
  mergePdf,
  splitPdf,
  compressPdf,
  rotatePdf,
  organizePdf,
  deletePagesPdf,
  extractPagesPdf
};
