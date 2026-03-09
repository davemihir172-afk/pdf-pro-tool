const express = require('express');
const multer = require('multer');
const path = require('path');
const {
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
} = require('../controllers/editingToolsController');

const router = express.Router();

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, path.join(__dirname, '..', 'uploads')),
  filename: (req, file, cb) => {
    const safeName = file.originalname.replace(/\s+/g, '-').toLowerCase();
    cb(null, `${Date.now()}-${Math.random().toString(36).slice(2, 7)}-${safeName}`);
  }
});

const upload = multer({
  storage,
  fileFilter: (req, file, cb) => {
    if (file.mimetype !== 'application/pdf') {
      return cb(new Error('Only PDF files are allowed.'));
    }
    return cb(null, true);
  },
  limits: {
    fileSize: Number(process.env.MAX_UPLOAD_SIZE_BYTES || 20 * 1024 * 1024),
    files: 5
  }
});

router.post('/watermark-pdf', upload.single('file'), watermarkPdf);
router.post('/page-numbers', upload.single('file'), pageNumbersPdf);
router.post('/header-footer', upload.single('file'), headerFooterPdf);
router.post('/background-pdf', upload.single('file'), backgroundPdf);
router.post('/crop-pdf', upload.single('file'), cropPdfTool);
router.post('/sign-pdf', upload.single('file'), signPdfTool);
router.post('/redact-pdf', upload.single('file'), redactPdfTool);
router.post('/compare-pdf', upload.array('files', 2), comparePdfTool);
router.post('/extract-images', upload.single('file'), extractImagesTool);
router.post('/protect-pdf', upload.single('file'), protectPdfTool);
router.post('/unlock-pdf', upload.single('file'), unlockPdfTool);
router.post('/ocr-pdf', upload.single('file'), ocrPdfTool);
router.post('/flatten-pdf', upload.single('file'), flattenPdfTool);

module.exports = router;
