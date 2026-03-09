const express = require('express');
const multer = require('multer');
const path = require('path');
const {
  getConversionJob,
  jpgToPdf,
  pngToPdf,
  wordToPdf,
  excelToPdf,
  powerpointToPdf,
  htmlToPdf,
  textToPdf,
  pdfToJpg,
  pdfToPng,
  pdfToWord,
  pdfToExcel,
  pdfToPowerPoint,
  pdfToText
} = require('../controllers/conversionController');

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
  limits: {
    fileSize: Number(process.env.MAX_UPLOAD_SIZE_BYTES || 20 * 1024 * 1024)
  }
});

router.get('/conversion-jobs/:jobId', getConversionJob);

router.post('/jpg-to-pdf', upload.single('file'), jpgToPdf);
router.post('/png-to-pdf', upload.single('file'), pngToPdf);
router.post('/word-to-pdf', upload.single('file'), wordToPdf);
router.post('/excel-to-pdf', upload.single('file'), excelToPdf);
router.post('/powerpoint-to-pdf', upload.single('file'), powerpointToPdf);
router.post('/html-to-pdf', upload.single('file'), htmlToPdf);
router.post('/text-to-pdf', upload.single('file'), textToPdf);

router.post('/pdf-to-jpg', upload.single('file'), pdfToJpg);
router.post('/pdf-to-png', upload.single('file'), pdfToPng);
router.post('/pdf-to-word', upload.single('file'), pdfToWord);
router.post('/pdf-to-excel', upload.single('file'), pdfToExcel);
router.post('/pdf-to-powerpoint', upload.single('file'), pdfToPowerPoint);
router.post('/pdf-to-text', upload.single('file'), pdfToText);

module.exports = router;
