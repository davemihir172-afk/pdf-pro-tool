const express = require('express');
const multer = require('multer');
const path = require('path');
const {
  mergePdf,
  splitPdf,
  compressPdf,
  rotatePdf,
  organizePdf,
  deletePagesPdf,
  extractPagesPdf
} = require('../controllers/pdfToolsController');

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
    files: 20
  }
});

router.post('/merge-pdf', upload.array('files', 20), mergePdf);
router.post('/split-pdf', upload.single('file'), splitPdf);
router.post('/compress-pdf', upload.single('file'), compressPdf);
router.post('/rotate-pdf', upload.single('file'), rotatePdf);
router.post('/organize-pdf', upload.single('file'), organizePdf);
router.post('/delete-pdf-pages', upload.single('file'), deletePagesPdf);
router.post('/extract-pdf-pages', upload.single('file'), extractPagesPdf);

module.exports = router;
