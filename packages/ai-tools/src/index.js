function extractPdfText(buffer) {
  return buffer
    .toString('utf8')
    .replace(/[^\x09\x0A\x0D\x20-\x7E]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, 20000);
}

async function callOpenAI({ task, text, language }) {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) throw new Error('OPENAI_API_KEY is not configured on the server.');

  const prompts = {
    summarize: `Summarize this PDF text in concise bullet points:\n\n${text}`,
    translate: `Translate this PDF text to ${language || 'Spanish'}. Keep meaning accurate and preserve structure:\n\n${text}`,
    'extract-tables': `Extract all table-like data from this PDF text. Return markdown tables when possible. If no tables, explain briefly:\n\n${text}`
  };

  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`
    },
    body: JSON.stringify({
      model: process.env.OPENAI_MODEL || 'gpt-4o-mini',
      temperature: 0.2,
      messages: [
        { role: 'system', content: 'You are an assistant for PDF post-processing tasks.' },
        { role: 'user', content: prompts[task] }
      ]
    })
  });

  if (!response.ok) {
    const errBody = await response.text();
    throw new Error(`OpenAI request failed: ${response.status} ${errBody}`);
  }

  const json = await response.json();
  return json.choices?.[0]?.message?.content?.trim() || 'No AI result returned.';
}

module.exports = { extractPdfText, callOpenAI };
