// Vercel serverless function — analyzes food photo with Claude vision
// Required env var: ANTHROPIC_API_KEY

module.exports = async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();

  const { image, mimeType, context } = req.body;
  if (!image) return res.status(400).json({ error: 'No image provided' });

  const prompt = [
    'Analyze this food or drink photo and estimate the nutritional content.',
    context ? `Additional context: ${context}` : '',
    'Return ONLY valid JSON (no markdown, no explanation) in this exact format:',
    '{"description":"brief food description","calories":0,"protein_g":0,"carbs_g":0,"fat_g":0,"confidence":"high|medium|low","notes":"any caveats about the estimate"}',
    'Estimate for what is visible in the image. If multiple items, sum the totals.',
    'If it is a drink, include all ingredients you can identify.',
  ].filter(Boolean).join(' ');

  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'x-api-key':         process.env.ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01',
        'content-type':      'application/json',
      },
      body: JSON.stringify({
        model:      'claude-haiku-4-5-20251001',
        max_tokens: 512,
        messages: [{
          role: 'user',
          content: [
            { type: 'image', source: { type: 'base64', media_type: mimeType || 'image/jpeg', data: image } },
            { type: 'text',  text: prompt },
          ],
        }],
      }),
    });

    if (!response.ok) {
      const err = await response.text();
      console.error('Anthropic API error:', err);
      return res.status(502).json({ error: 'AI analysis failed' });
    }

    const data  = await response.json();
    const text  = data.content?.[0]?.text || '';
    const match = text.match(/\{[\s\S]*\}/);
    if (!match) return res.status(500).json({ error: 'Could not parse AI response' });

    res.json(JSON.parse(match[0]));
  } catch (e) {
    console.error('analyze-food error:', e);
    res.status(500).json({ error: 'Server error' });
  }
};
