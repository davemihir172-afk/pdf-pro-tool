module.exports = function handler(req, res) {
  res.status(200).json({
    status: 'ok',
    version: '1.0.0',
    ai: !!process.env.ANTHROPIC_API_KEY,
    timestamp: new Date().toISOString(),
  });
};
