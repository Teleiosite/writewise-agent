import { VercelRequest, VercelResponse } from '@vercel/node';

/**
 * SSE streaming narrative generator.
 * Routes to the user's selected AI model using the same provider pattern as /api/chat.ts
 * Uses user's API key passed from the browser (not stored server-side).
 */
export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  try {
    const { stats_json, context, codebook, provider, apiKey, model } = req.body;

    if (!stats_json) return res.status(400).json({ error: 'stats_json is required' });
    if (!provider || !apiKey) return res.status(400).json({ error: 'provider and apiKey are required' });

    const systemPrompt = buildSystemPrompt(context, codebook);
    const userPrompt = buildUserPrompt(stats_json);

    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    res.setHeader('Access-Control-Allow-Origin', '*');

    if (provider === 'Gemini') {
      await streamGemini(apiKey, model || 'gemini-1.5-pro', systemPrompt, userPrompt, res);
    } else if (provider === 'OpenAI') {
      await streamOpenAICompatible('https://api.openai.com/v1', apiKey, model || 'gpt-4o', systemPrompt, userPrompt, res);
    } else if (provider === 'Claude') {
      await streamClaude(apiKey, model || 'claude-3-5-sonnet-20241022', systemPrompt, userPrompt, res);
    } else if (provider === 'DeepSeek') {
      await streamOpenAICompatible('https://api.deepseek.com/v1', apiKey, model || 'deepseek-chat', systemPrompt, userPrompt, res);
    } else if (provider === 'Grok') {
      await streamOpenAICompatible('https://api.x.ai/v1', apiKey, model || 'grok-2-latest', systemPrompt, userPrompt, res);
    } else {
      return res.status(400).json({ error: `Unsupported provider: ${provider}` });
    }
  } catch (error: any) {
    console.error('Narrative generation error:', error);
    if (!res.headersSent) {
      res.status(500).json({ error: error.message || 'Internal error' });
    } else {
      res.write(`data: [ERROR] ${error.message}\n\n`);
      res.end();
    }
  }
}

async function streamGemini(apiKey: string, model: string, system: string, user: string, res: VercelResponse) {
  const tryVersion = async (version: string) => {
    const url = `https://generativelanguage.googleapis.com/${version}/models/${model}:streamGenerateContent?key=${apiKey}&alt=sse`;
    return fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        systemInstruction: { parts: [{ text: system }] },
        contents: [{ role: 'user', parts: [{ text: user }] }],
        generationConfig: { maxOutputTokens: 8192, temperature: 0.4 },
      }),
    });
  };

  let response = await tryVersion('v1');
  if (!response.ok) response = await tryVersion('v1beta');
  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error((err as any).error?.message || `Gemini error ${response.status}`);
  }

  const reader = response.body!.getReader();
  const decoder = new TextDecoder();
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    const chunk = decoder.decode(value);
    const lines = chunk.split('\n');
    for (const line of lines) {
      if (line.startsWith('data: ')) {
        try {
          const parsed = JSON.parse(line.slice(6));
          const text = parsed.candidates?.[0]?.content?.parts?.[0]?.text;
          if (text) res.write(`data: ${JSON.stringify(text)}\n\n`);
        } catch { /* skip malformed chunks */ }
      }
    }
  }
  res.end();
}

async function streamOpenAICompatible(baseUrl: string, apiKey: string, model: string, system: string, user: string, res: VercelResponse) {
  const response = await fetch(`${baseUrl}/chat/completions`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${apiKey}` },
    body: JSON.stringify({
      model,
      stream: true,
      max_tokens: 8000,
      temperature: 0.4,
      messages: [{ role: 'system', content: system }, { role: 'user', content: user }],
    }),
  });

  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error((err as any).error?.message || `API error ${response.status}`);
  }

  const reader = response.body!.getReader();
  const decoder = new TextDecoder();
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    const chunk = decoder.decode(value);
    const lines = chunk.split('\n');
    for (const line of lines) {
      if (line.startsWith('data: ') && line !== 'data: [DONE]') {
        try {
          const parsed = JSON.parse(line.slice(6));
          const text = parsed.choices?.[0]?.delta?.content;
          if (text) res.write(`data: ${JSON.stringify(text)}\n\n`);
        } catch { /* skip */ }
      }
    }
  }
  res.end();
}

async function streamClaude(apiKey: string, model: string, system: string, user: string, res: VercelResponse) {
  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({
      model,
      max_tokens: 8000,
      stream: true,
      system,
      messages: [{ role: 'user', content: user }],
    }),
  });

  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error((err as any).error?.message || `Claude error ${response.status}`);
  }

  const reader = response.body!.getReader();
  const decoder = new TextDecoder();
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    const chunk = decoder.decode(value);
    const lines = chunk.split('\n');
    for (const line of lines) {
      if (line.startsWith('data: ')) {
        try {
          const parsed = JSON.parse(line.slice(6));
          if (parsed.type === 'content_block_delta') {
            const text = parsed.delta?.text;
            if (text) res.write(`data: ${JSON.stringify(text)}\n\n`);
          }
        } catch { /* skip */ }
      }
    }
  }
  res.end();
}

// ─── Prompt Builders ──────────────────────────────────────────────────────────

function buildSystemPrompt(context: any, codebook: any[]): string {
  const cb = (codebook || []).map((v: any) => `${v.column}: ${v.label} (${v.type}, role: ${v.role})`).join('\n');
  return `You are an expert academic research writer specialising in quantitative social science research.

Your task is to write a complete Chapter 4 (Data Presentation, Analysis and Discussion of Findings) and Chapter 5 (Summary of Findings, Conclusion and Recommendations) for a research project.

WRITING RULES:
- Write in formal academic prose. Use flowing paragraphs. No bullet points in narrative sections.
- Every statistical result mentioned must come ONLY from the stats JSON provided. Never invent or estimate numbers.
- Reference tables by number (Table 4.1, Table 4.2, etc.)
- For each finding: state the result, interpret it, discuss implications
- Cite theoretical framework and empirical literature where relevant
- Chapter 5 must: restate each objective → summarise findings → draw conclusions → give numbered recommendations
- Mean score decision rule: ≥ 3.50 = Agreed/High; 2.50–3.49 = Undecided/Moderate; < 2.50 = Disagreed/Low (for 5-point Likert)
- Statistical significance: p < 0.05 = significant; p < 0.01 = highly significant; p < 0.001 = very highly significant

RESEARCH CONTEXT:
Title: ${context?.title || 'Not provided'}
Institution: ${context?.institution || 'Not provided'}
Objectives: ${context?.objectives?.join('; ') || 'Not provided'}
Research Questions: ${context?.research_questions?.join('; ') || 'Not provided'}
Hypothesis: ${context?.hypothesis || 'Not provided'}
Theoretical Framework: ${context?.theoretical_framework || 'Not provided'}

CODEBOOK:
${cb || 'Not provided'}`;
}

function buildUserPrompt(stats: any): string {
  return `Here are the fully computed statistics from the dataset. Use ONLY these numbers. Do not calculate or estimate any values yourself.

STATISTICS JSON:
${JSON.stringify(stats, null, 2)}

Now write the complete Chapter 4 and Chapter 5 following all academic writing rules in your system instructions.
Format tables using markdown (| col | col |). Write all narrative in flowing academic prose.
Begin with: "CHAPTER FOUR: DATA PRESENTATION, ANALYSIS AND DISCUSSION OF FINDINGS"`;
}
