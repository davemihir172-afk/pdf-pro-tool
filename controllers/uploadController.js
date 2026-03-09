const handleUpload = (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No file uploaded.' });
  }

  return res.status(200).json({
    message: 'File uploaded successfully.',
    file: {
      originalName: req.file.originalname,
      mimeType: req.file.mimetype,
      size: req.file.size,
      storedName: req.file.filename,
      path: `/uploads/${req.file.filename}`
    }
  });
};

module.exports = {
  handleUpload
};
