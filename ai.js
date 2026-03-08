/**
 * PDFMate Pro — Vercel Serverless Function
 * Route: POST /api/ai
 * Secure AI proxy — API key stays on server, never in browser.
 *
 * Set key in: Vercel Dashboard → Project → Settings → Environment Variables
 * Variable name: ANTHROPIC_API_KEY
 */

module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(204).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const apiKey = process.env.ANTHROPIC_API_KEY;

  if (!apiKey) {
    return res.status(503).json({
      error: 'AI not configured',
      message: 'Add ANTHROPIC_API_KEY in Vercel → Project Settings → Environment Variables, then redeploy.'
    });
  }

  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type':      'application/json',
        'x-api-key':         apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify(req.body),
    });

    const data = await response.json();
    return res.status(response.status).json(data);

  } catch (err) {
    console.error('[AI Proxy Error]', err.message);
    return res.status(500).json({ error: 'AI request failed: ' + err.message });
  }
};
