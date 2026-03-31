import type { VercelRequest, VercelResponse } from '@vercel/node';

// Default model for each provider when the client doesn't specify one
const DEFAULT_MODELS: Record<string, string> = {
  OpenAI:   'gpt-4o-mini',
  DeepSeek: 'deepseek-chat',
  Grok:     'grok-2-latest',
  Gemini:   'gemini-2.0-flash',
  Claude:   'claude-3-5-haiku-20241022',
};

// OpenAI-compatible base URLs
const OPENAI_COMPATIBLE_URLS: Record<string, string> = {
  OpenAI:   'https://api.openai.com/v1/chat/completions',
  DeepSeek: 'https://api.deepseek.com/v1/chat/completions',
  Grok:     'https://api.x.ai/v1/chat/completions',
};

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Handle CORS preflight
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method Not Allowed' });

  try {
    const { provider, apiKey, messages, model: requestedModel } = req.body;

    if (!provider || !apiKey || !messages) {
      return res.status(400).json({ error: 'Missing provider, apiKey, or messages' });
    }

    const model = requestedModel || DEFAULT_MODELS[provider] || 'gpt-4o-mini';

    // ─── Gemini ────────────────────────────────────────────────────────────────
    if (provider === 'Gemini') {
      const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
      const systemMsg = messages.find((m: any) => m.role === 'system')?.content;
      const chatMessages = messages.filter((m: any) => m.role !== 'system');

      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...(systemMsg && { systemInstruction: { parts: [{ text: systemMsg }] } }),
          contents: chatMessages.map((m: any) => ({
            role: m.role === 'user' ? 'user' : 'model',
            parts: [{ text: m.content }],
          })),
        }),
      });

      if (!response.ok) {
        const err = await response.json().catch(() => ({}));
        throw new Error(err.error?.message || `Gemini API error: ${response.status}`);
      }

      const data = await response.json();
      // Normalise to OpenAI choices[] format
      const content = data.candidates?.[0]?.content?.parts?.[0]?.text?.trim() ?? '';
      return res.status(200).json({ choices: [{ message: { content } }] });
    }

    // ─── Claude (Anthropic) ────────────────────────────────────────────────────
    if (provider === 'Claude') {
      const systemMsg = messages.find((m: any) => m.role === 'system')?.content;
      const chatMessages = messages
        .filter((m: any) => m.role !== 'system')
        .map((m: any) => ({ role: m.role === 'assistant' ? 'assistant' : 'user', content: m.content }));

      const response = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': apiKey,
          'anthropic-version': '2023-06-01',
        },
        body: JSON.stringify({
          model,
          max_tokens: 2048,
          ...(systemMsg && { system: systemMsg }),
          messages: chatMessages,
        }),
      });

      if (!response.ok) {
        const err = await response.json().catch(() => ({}));
        throw new Error(err.error?.message || `Claude API error: ${response.status}`);
      }

      const data = await response.json();
      // Normalise to OpenAI choices[] format
      const content = data.content?.[0]?.text?.trim() ?? '';
      return res.status(200).json({ choices: [{ message: { content } }] });
    }

    // ─── OpenAI-compatible (OpenAI, DeepSeek, Grok) ───────────────────────────
    const apiUrl = OPENAI_COMPATIBLE_URLS[provider];
    if (!apiUrl) {
      return res.status(400).json({ error: `Unknown provider: ${provider}` });
    }

    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({ model, messages }),
    });

    if (!response.ok) {
      const err = await response.json().catch(() => ({}));
      throw new Error(err.error?.message || `API error: ${response.status}`);
    }

    const data = await response.json();
    return res.status(200).json(data);

  } catch (error: any) {
    console.error('Proxy error:', error);
    return res.status(500).json({ error: error.message || 'Internal Server Error' });
  }
}
