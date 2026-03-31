import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Allow OPTIONS request for CORS preflight
  if (req.method === 'OPTIONS') {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    return res.status(200).end();
  }

  // Set explicit CORS headers on the response
  res.setHeader('Access-Control-Allow-Origin', '*');
  
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  try {
    const { provider, apiKey, messages } = req.body;

    if (!provider || !apiKey || !messages) {
      return res.status(400).json({ error: 'Missing provider, apiKey, or messages' });
    }

    if (provider === 'Gemini') {
      const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${apiKey}`;
      const geminiMessages = messages.filter((m: any) => m.role !== 'system');
      const systemInstruction = messages.find((m: any) => m.role === 'system')?.content;

      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...(systemInstruction && { systemInstruction: { parts: [{ text: systemInstruction }] } }),
          contents: geminiMessages.map((m: any) => ({
            role: m.role === 'user' ? 'user' : 'model',
            parts: [{ text: m.content }]
          }))
        })
      });

      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        throw new Error(errData.error?.message || `Gemini API error: ${response.status}`);
      }
      
      const data = await response.json();
      return res.status(200).json(data);
    }

    // OpenAI and OpenAI-compatible providers
    const API_URLS: Record<string, string> = {
      OpenAI: 'https://api.openai.com/v1/chat/completions',
      DeepSeek: 'https://api.deepseek.com/v1/chat/completions',
      Grok: 'https://api.x.ai/v1/chat/completions',
    };

    const MODELS: Record<string, string> = {
      OpenAI: 'gpt-3.5-turbo',
      DeepSeek: 'deepseek-chat',
      Grok: 'grok-beta',
    };

    const apiUrl = API_URLS[provider];
    if (!apiUrl) {
      return res.status(400).json({ error: `Unknown provider: ${provider}` });
    }

    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: MODELS[provider],
        messages
      })
    });

    if (!response.ok) {
      const errData = await response.json().catch(() => ({}));
      throw new Error(errData.error?.message || `API error: ${response.status}`);
    }

    const data = await response.json();
    return res.status(200).json(data);

  } catch (error: any) {
    console.error('Proxy error:', error);
    return res.status(500).json({ error: error.message || 'Internal Server Error' });
  }
}
