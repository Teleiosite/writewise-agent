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

  const hasWritingSample = context?.writing_sample && context.writing_sample.trim().length > 0;

  const styleSection = hasWritingSample
    ? `
═══════════════════════════════════════════════════════
CRITICAL: USER'S WRITING STYLE SAMPLE — MATCH EXACTLY
═══════════════════════════════════════════════════════
The user has provided a sample of their exact writing style. You MUST replicate:
  • The exact heading numbering pattern (e.g. 4.1, 4.1.1, CHAPTER FOUR:...)
  • The exact table format and column layout shown
  • The exact prose style — sentence length, formality, citation format (e.g. Author, Year)
  • The exact way results are introduced and interpreted after each table
  • The exact transitional phrases and paragraph structure

Here is the user's writing style sample:
---
${context.writing_sample}
---
Study this sample carefully. Every section you write must feel like a direct continuation of this sample.
`
    : `
WRITING STYLE: Standard Nigerian university academic English, formal, third-person, flowing paragraphs.
Heading format: CHAPTER FOUR: ... / 4.1 Section Title / 4.1.1 Sub-section
`;

  return `You are an expert academic research writer specialising in quantitative social science research.

Your task is to write a complete Chapter 4 (Data Presentation, Analysis and Discussion of Findings) and Chapter 5 (Summary of Findings, Conclusion and Recommendations).
${styleSection}

═══════════════════════════════════════════════════════
MANDATORY TABLE RULES — NEVER SKIP THESE
═══════════════════════════════════════════════════════
1. EVERY statistical result MUST be presented in a real markdown table with actual data.
   Do NOT describe a table without showing it. Do NOT say "as shown in Table 4.x" without then showing that table.

2. All tables must use the EXACT markdown table format:
   | Column 1    | Column 2    | Column 3    |
   |-------------|-------------|-------------|
   | value       | value       | value       |

3. Specific table requirements:
   - Demographic tables: Variable | Category | Frequency | Percentage (%)
   - Likert/Descriptive tables: S/N | Item | Mean | Std Dev | Decision
   - Reliability table: Variable/Scale | No. of Items | Cronbach's α | Interpretation
   - Correlation table: Variable | Variable 1 | Variable 2 | Variable 3 | ... (matrix)
   - Regression table: Variable | B | Std Error | Beta (β) | t | p-value
   - ANOVA table: Source | Sum of Squares | df | Mean Square | F | p-value
   - Hypothesis table: Hypothesis | Test Used | Statistic | p-value | Decision

4. Every table must be:
   - Numbered sequentially: Table 4.1, Table 4.2, etc.
   - Given a descriptive title: "Table 4.1: Demographic Characteristics of Respondents (n=196)"
   - Populated with REAL numbers from the statistics JSON — never leave cells empty or use "X" placeholders
   - Followed immediately by at least 2–3 paragraphs of academic interpretation

5. Decision column for Likert tables MUST use the decision rule:
   Mean ≥ 3.50 → "Agreed" / Mean 2.50–3.49 → "Undecided" / Mean < 2.50 → "Disagreed"

═══════════════════════════════════════════════════════
ACADEMIC WRITING RULES
═══════════════════════════════════════════════════════
- Write in formal academic prose. Use flowing paragraphs. NO bullet points in narrative sections.
- Every statistical result mentioned must come ONLY from the stats JSON. Never invent or estimate numbers.
- For each finding: state the result → show the table → interpret it → discuss implications
- Use APA-style in-text citations where relevant: (Author, Year)
- Chapter 5 must: restate each objective → summarise findings → draw conclusions → give numbered recommendations
- Significance: p < 0.05 = significant; p < 0.01 = highly significant; p < 0.001 = very highly significant

RESEARCH CONTEXT:
Title: ${context?.title || 'Not provided'}
Institution: ${context?.institution || 'Not provided'}
Objectives: ${context?.objectives?.join('; ') || 'Not provided'}
Research Questions: ${context?.research_questions?.join('; ') || 'Not provided'}
Hypothesis: ${context?.hypothesis || 'Not provided'}
Theoretical Framework: ${context?.theoretical_framework || 'Not provided'}

VARIABLE CODEBOOK:
${cb || 'Not provided'}`;
}

function buildUserPrompt(stats: any): string {
  return `Below are the fully computed statistics. Use ONLY these exact numbers. Do NOT calculate, estimate, or fabricate any value.

STATISTICS JSON:
${JSON.stringify(stats, null, 2)}

═══════════════════════════════════════════════════════
YOUR TASK
═══════════════════════════════════════════════════════
Write the COMPLETE Chapter 4 and Chapter 5.

BEFORE writing any section, check the stats JSON for the actual numbers to go into each table.
Every table you reference in prose MUST be physically rendered in markdown table format with real data.

Structure to follow:
CHAPTER FOUR: DATA PRESENTATION, ANALYSIS AND DISCUSSION OF FINDINGS
4.1 Introduction
4.2 Demographic Characteristics of Respondents → [Table with real demographic data]
4.3 Descriptive Statistics / Sections → [Likert tables with Mean, SD, Decision for every section]
4.4 Normality Test → [Table with Shapiro-Wilk/K-S results per variable]
4.5 Reliability Analysis → [Table with Cronbach Alpha per scale]
4.6 Correlation Analysis → [Full correlation matrix table]
4.7 Hypothesis Testing / Regression Analysis → [Regression or test tables]
4.8 Discussion of Findings

CHAPTER FIVE: SUMMARY, CONCLUSION AND RECOMMENDATIONS
5.1 Introduction
5.2 Summary of Findings (one paragraph per research objective)
5.3 Conclusion
5.4 Recommendations (numbered list)
5.5 Limitations of the Study
5.6 Suggestions for Further Research

Begin now with: "CHAPTER FOUR: DATA PRESENTATION, ANALYSIS AND DISCUSSION OF FINDINGS"`;
}
