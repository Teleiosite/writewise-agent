
import { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { provider: rawProvider, apiKey: rawKey, messages, model: requestedModel } = req.body;

    const provider = (rawProvider ?? '').trim();
    const apiKey   = (rawKey ?? '').trim();
    
    if (!provider || !apiKey) {
      return res.status(400).json({ error: 'Missing provider or API key' });
    }

    if (provider === 'Gemini') {
      const model = requestedModel || 'gemini-2.0-flash';
      
      const callGemini = async (version: 'v1' | 'v1beta'): Promise<Response> => {
        const url = `https://generativelanguage.googleapis.com/${version}/models/${model}:generateContent?key=${apiKey}`;
        const systemMsg = messages.find((m: any) => m.role === 'system')?.content;
        const chatMessages = messages.filter((m: any) => m.role !== 'system');

        return await fetch(url, {
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
      };

      let response = await callGemini('v1');

      // Fallback for preview models
      if (!response.ok && response.status === 404 && model.includes('2.0')) {
        response = await callGemini('v1beta');
      }

      if (!response.ok) {
        const err = await response.json().catch(() => ({}));
        return res.status(response.status).json({ error: err.error?.message || `Gemini API error: ${response.status}` });
      }

      const data = await response.json();
      const content = data.candidates?.[0]?.content?.parts?.[0]?.text?.trim() ?? "";

      return res.status(200).json({
        choices: [{ message: { content } }]
      });
    }

    if (provider === 'OpenAI') {
      const model = requestedModel || 'gpt-4o-mini';
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`,
        },
        body: JSON.stringify({ model, messages }),
      });

      if (!response.ok) {
        const err = await response.json().catch(() => ({}));
        return res.status(response.status).json({ error: err.error?.message || `OpenAI error: ${response.status}` });
      }

      const data = await response.json();
      return res.status(200).json(data);
    }

    if (provider === 'Claude') {
      const model = requestedModel || 'claude-3-5-haiku-20241022';
      const response = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': apiKey,
          'anthropic-version': '2023-06-01',
        },
        body: JSON.stringify({
          model,
          max_tokens: 1024,
          messages: messages.map((m: any) => ({
            role: m.role === 'system' ? 'user' : m.role, // Anthropic handles system differently, but this is simple fallback
            content: m.content
          })),
        }),
      });

      if (!response.ok) {
        const err = await response.json().catch(() => ({}));
        return res.status(response.status).json({ error: err.error?.message || `Claude error: ${response.status}` });
      }

      const data = await response.json();
      return res.status(200).json({
        choices: [{ message: { content: data.content[0].text } }]
      });
    }

    // Default for other OpenAI-compatible APIs (DeepSeek, Grok)
    const baseUrl = provider === 'DeepSeek' 
      ? 'https://api.deepseek.com/v1' 
      : provider === 'Grok' 
        ? 'https://api.x.ai/v1'
        : null;

    if (baseUrl) {
      const model = requestedModel || (provider === 'DeepSeek' ? 'deepseek-chat' : 'grok-beta');
      const response = await fetch(`${baseUrl}/chat/completions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`,
        },
        body: JSON.stringify({ model, messages }),
      });

      if (!response.ok) {
        const err = await response.json().catch(() => ({}));
        return res.status(response.status).json({ error: err.error?.message || `${provider} error: ${response.status}` });
      }

      const data = await response.json();
      return res.status(200).json(data);
    }

    return res.status(400).json({ error: `Unsupported provider: ${provider}` });
  } catch (error: any) {
    console.error('Proxy error:', error);
    return res.status(500).json({ error: error.message || 'Internal proxy error' });
  }
}
