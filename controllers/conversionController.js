const { createJob, updateJob, getJob } = require('../tools/conversionJobStore');
const { convertByType, cleanupInput } = require('../tools/fileConversionService');

const startConversion = async (req, res, tool) => {
  const job = createJob(tool);
  const uploadedFile = req.file;

  if (!uploadedFile && !['html-to-pdf', 'text-to-pdf'].includes(tool)) {
    updateJob(job.id, { status: 'failed', progress: 100, stage: 'Failed', error: 'No file uploaded.' });
    return res.status(400).json({ error: 'No file uploaded.' });
  }

  res.status(202).json({
    message: 'Conversion started.',
    jobId: job.id,
    progressUrl: `/api/conversion-jobs/${job.id}`
  });

  try {
    updateJob(job.id, { status: 'processing', progress: 5, stage: 'Processing started' });

    const result = await convertByType({
      tool,
      filePath: uploadedFile?.path,
      originalName: uploadedFile?.originalname,
      textValue: req.body.text,
      htmlValue: req.body.html,
      updateProgress: (progress, stage) => updateJob(job.id, { progress, stage, status: 'processing' })
    });

    await cleanupInput(uploadedFile?.path);

    updateJob(job.id, {
      status: 'completed',
      progress: 100,
      stage: 'Completed',
      result
    });
  } catch (error) {
    await cleanupInput(uploadedFile?.path);
    updateJob(job.id, {
      status: 'failed',
      progress: 100,
      stage: 'Failed',
      error: error.message || 'Conversion failed.'
    });
  }

  return null;
};

const getConversionJob = (req, res) => {
  const job = getJob(req.params.jobId);
  if (!job) {
    return res.status(404).json({ error: 'Job not found.' });
  }
  return res.status(200).json(job);
};

const jpgToPdf = (req, res) => startConversion(req, res, 'jpg-to-pdf');
const pngToPdf = (req, res) => startConversion(req, res, 'png-to-pdf');
const wordToPdf = (req, res) => startConversion(req, res, 'word-to-pdf');
const excelToPdf = (req, res) => startConversion(req, res, 'excel-to-pdf');
const powerpointToPdf = (req, res) => startConversion(req, res, 'powerpoint-to-pdf');
const htmlToPdf = (req, res) => startConversion(req, res, 'html-to-pdf');
const textToPdf = (req, res) => startConversion(req, res, 'text-to-pdf');

const pdfToJpg = (req, res) => startConversion(req, res, 'pdf-to-jpg');
const pdfToPng = (req, res) => startConversion(req, res, 'pdf-to-png');
const pdfToWord = (req, res) => startConversion(req, res, 'pdf-to-word');
const pdfToExcel = (req, res) => startConversion(req, res, 'pdf-to-excel');
const pdfToPowerPoint = (req, res) => startConversion(req, res, 'pdf-to-powerpoint');
const pdfToText = (req, res) => startConversion(req, res, 'pdf-to-text');

module.exports = {
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
};
