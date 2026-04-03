import { VercelRequest, VercelResponse } from '@vercel/node';

// Attempt to repair a truncated JSON array by closing open strings/objects
function repairJson(raw: string): string {
  let s = raw.trim();
  // Remove markdown fences if present
  s = s.replace(/```json\n?|\n?```/g, '').trim();

  // If it's already valid, return as-is
  try { JSON.parse(s); return s; } catch {}

  // Try to close the array by trimming to the last complete object
  // Find the last complete '}'
  const lastClose = s.lastIndexOf('}');
  if (lastClose !== -1) {
    s = s.slice(0, lastClose + 1);
    // Remove trailing comma if any
    s = s.replace(/,\s*$/, '');
    // Wrap in array brackets if needed
    if (!s.startsWith('[')) s = '[' + s;
    if (!s.endsWith(']')) s = s + ']';
    try { JSON.parse(s); return s; } catch {}
  }

  // Last resort — return empty array
  return '[]';
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  try {
    const { headers, sample, provider, apiKey, model } = req.body;
    if (!headers?.length) return res.status(400).json({ error: 'headers are required' });

    // Limit sample to 3 rows and 50 columns max to keep prompt small
    const trimmedHeaders = headers.slice(0, 60);
    const trimmedSample = (sample || []).slice(0, 3).map((row: any) => {
      const out: any = {};
      trimmedHeaders.forEach((h: string) => { out[h] = row[h]; });
      return out;
    });

    const prompt = `You are a research data analyst. Here are the column headers and sample rows from a dataset:

HEADERS: ${trimmedHeaders.join(', ')}

SAMPLE DATA (first 3 rows):
${JSON.stringify(trimmedSample, null, 2)}

For EVERY column, return a JSON array. Each object MUST have:
- "column": exact column name
- "label": human-readable label (e.g. "Gender", "Age", "Q1 - Social Media Usage")
- "type": one of "nominal" | "ordinal" | "scale"
  * nominal = categories (gender, department, yes/no)
  * ordinal = Likert/ranked (1-5 agreement, satisfaction)
  * scale = continuous (age, income, total score)
- "values": {"1":"Male","2":"Female"} for nominal/ordinal, null for scale
- "missing_code": likely missing value code (99, 999) or null
- "role": one of "IV" | "DV" | "None"
  * IV = independent/predictor
  * DV = dependent/outcome
  * None = demographic or general
- "section_label": group name if columns share a theme, null otherwise

Return ONLY a valid JSON array. No markdown. No explanation.`;

    let content = '';
    const HIGH_TOKENS = 8192;

    if (provider === 'Gemini') {
      const m = model || 'gemini-1.5-flash';
      const url = `https://generativelanguage.googleapis.com/v1beta/models/${m}:generateContent?key=${apiKey}`;
      const gemRes = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ role: 'user', parts: [{ text: prompt }] }],
          generationConfig: { maxOutputTokens: HIGH_TOKENS, temperature: 0.1 }
        }),
      });
      const gemData = await gemRes.json() as any;
      content = gemData.candidates?.[0]?.content?.parts?.[0]?.text || '[]';
    } else if (provider === 'Claude') {
      const clRes = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-api-key': apiKey, 'anthropic-version': '2023-06-01' },
        body: JSON.stringify({
          model: model || 'claude-3-haiku-20240307',
          max_tokens: HIGH_TOKENS,
          messages: [{ role: 'user', content: prompt }]
        }),
      });
      const clData = await clRes.json() as any;
      content = clData.content?.[0]?.text || '[]';
    } else {
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
        body: JSON.stringify({
          model: mdl, max_tokens: HIGH_TOKENS, temperature: 0.1,
          messages: [{ role: 'user', content: prompt }]
        }),
      });
      const oData = await oRes.json() as any;
      content = oData.choices?.[0]?.message?.content || '[]';
    }

    // Robust parse with auto-repair for truncated responses
    const repaired = repairJson(content);
    const codebook = JSON.parse(repaired);

    if (!Array.isArray(codebook)) {
      return res.status(200).json([]);
    }

    return res.status(200).json(codebook);

  } catch (error: any) {
    console.error('Codebook detection error:', error);
    return res.status(500).json({ error: error.message || 'Failed to detect codebook' });
  }
}
