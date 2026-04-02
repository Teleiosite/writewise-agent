import { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  try {
    const { headers, sample, provider, apiKey, model } = req.body;
    if (!headers?.length) return res.status(400).json({ error: 'headers are required' });

    const prompt = `You are a research data analyst. Here are the column headers and first few rows of a dataset:

HEADERS: ${headers.join(', ')}

SAMPLE DATA:
${JSON.stringify(sample || [], null, 2)}

For each column return a JSON array. Each object MUST have exactly these fields:
- "column": exact column name as given
- "label": human-readable label (e.g. "Gender of Respondent", "Age Group")
- "type": one of "nominal" | "ordinal" | "scale"
  * nominal = categories with no order (gender, department)
  * ordinal = ranked/Likert items (satisfaction ratings, agree-disagree)
  * scale = continuous numbers (age in years, income, scores)
- "values": object mapping codes to labels if categorical (e.g. {"1":"Male","2":"Female"}), null if continuous
- "missing_code": the most likely missing value code (e.g. 99, 999, 0), null if none obvious
- "role": one of "IV" | "DV" | "Mediator" | "Moderator" | "None"
  * IV = independent variable (predictor)
  * DV = dependent variable (outcome)  
  * None = demographic or control variable
- "section_label": group name if multiple columns share a theme prefix (e.g. "Social Media Utilisation"), null otherwise

Return ONLY a valid JSON array. No explanation. No markdown code fences.`;

    let content = '';

    if (provider === 'Gemini') {
      const m = model || 'gemini-1.5-flash';
      const url = `https://generativelanguage.googleapis.com/v1beta/models/${m}:generateContent?key=${apiKey}`;
      const gemRes = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ contents: [{ role: 'user', parts: [{ text: prompt }] }], generationConfig: { maxOutputTokens: 3000, temperature: 0.1 } }),
      });
      const gemData = await gemRes.json() as any;
      content = gemData.candidates?.[0]?.content?.parts?.[0]?.text || '[]';
    } else if (provider === 'Claude') {
      const clRes = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-api-key': apiKey, 'anthropic-version': '2023-06-01' },
        body: JSON.stringify({ model: model || 'claude-3-haiku-20240307', max_tokens: 3000, messages: [{ role: 'user', content: prompt }] }),
      });
      const clData = await clRes.json() as any;
      content = clData.content?.[0]?.text || '[]';
    } else {
      // OpenAI-compatible (OpenAI, DeepSeek, Grok)
      const baseUrls: Record<string, string> = {
        'OpenAI': 'https://api.openai.com/v1',
        'DeepSeek': 'https://api.deepseek.com/v1',
        'Grok': 'https://api.x.ai/v1',
      };
      const defaultModels: Record<string, string> = {
        'OpenAI': 'gpt-4o-mini', 'DeepSeek': 'deepseek-chat', 'Grok': 'grok-beta',
      };
      const base = baseUrls[provider] || 'https://api.openai.com/v1';
      const mdl = model || defaultModels[provider] || 'gpt-4o-mini';
      const oRes = await fetch(`${base}/chat/completions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${apiKey}` },
        body: JSON.stringify({ model: mdl, max_tokens: 3000, temperature: 0.1, messages: [{ role: 'user', content: prompt }] }),
      });
      const oData = await oRes.json() as any;
      content = oData.choices?.[0]?.message?.content || '[]';
    }

    // Parse and validate the JSON response
    const cleaned = content.replace(/```json\n?|\n?```/g, '').trim();
    const codebook = JSON.parse(cleaned);
    return res.status(200).json(codebook);
  } catch (error: any) {
    console.error('Codebook detection error:', error);
    return res.status(500).json({ error: error.message || 'Failed to detect codebook' });
  }
}
