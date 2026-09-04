/**
 * api/research-synthesise.ts
 * POST /api/research/synthesise
 *
 * Multi-provider AI literature synthesis.
 * Supports: Gemini (free default), Claude, OpenAI, DeepSeek, Grok
 *
 * Uses the same provider/apiKey/model pattern as /api/generate-narrative.ts
 * so the user's already-configured AI key is reused — no new keys needed.
 *
 * Body: {
 *   topic: string,
 *   papers: PaperInput[],
 *   style?: 'annotated' | 'empirical' | 'narrative',
 *   provider?: 'Gemini' | 'Claude' | 'OpenAI' | 'DeepSeek' | 'Grok',
 *   apiKey?: string,
 *   model?: string,
 * }
 */

import type { Request, Response } from 'express';

// ─── Provider defaults ─────────────────────────────────────────────────────────

const PROVIDER_DEFAULTS: Record<string, { baseUrl?: string; model: string }> = {
  Gemini:   { model: 'gemini-2.5-flash' },
  Claude:   { model: 'claude-3-5-sonnet-20241022' },
  OpenAI:   { baseUrl: 'https://api.openai.com/v1', model: 'gpt-4o-mini' },
  DeepSeek: { baseUrl: 'https://api.deepseek.com/v1', model: 'deepseek-chat' },
  Grok:     { baseUrl: 'https://api.x.ai/v1', model: 'grok-2-latest' },
};

// ─── Types ─────────────────────────────────────────────────────────────────────

interface PaperInput {
  title: string;
  authors: string[];
  year: string;
  journal: string;
  doi?: string;
  abstract?: string;
  fullText?: string;
  citationCount: number;
  fullTextStatus: 'open-access' | 'paywalled' | 'unknown';
}

interface StudyEntry {
  authorYear: string;
  title: string;
  journal: string;
  doi?: string;
  problemStatement: string;
  sampleSize: string;
  methodology: string;
  keyFindings: string;
  researchGap: string;
  confidence: 'verified' | 'ai-summarised' | 'ai-synthesised';
}

interface SynthesisResult {
  studies: StudyEntry[];
  annotatedBibliography: string;
  empiricalMatrix: string;
  thematicNarrative: string;
  researchGapSummary: string;
  coverageNote: string;
  providerUsed: string;
  modelUsed: string;
}

// ─── Main handler ──────────────────────────────────────────────────────────────

export default async function handler(req: Request, res: Response) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const {
    topic,
    papers = [],
    style = 'annotated',
    provider: reqProvider,
    apiKey: reqApiKey,
    model: reqModel,
  } = req.body as {
    topic?: string;
    papers?: PaperInput[];
    style?: 'annotated' | 'empirical' | 'narrative';
    provider?: string;
    apiKey?: string;
    model?: string;
  };

  if (!topic || !topic.trim()) {
    return res.status(400).json({ error: 'topic is required' });
  }
  if (!papers.length) {
    return res.status(400).json({ error: 'At least one paper is required' });
  }

  // ── Resolve provider + key ─────────────────────────────────────────────────
  let provider = reqProvider || 'Gemini';
  let apiKey = reqApiKey?.trim() || '';
  let model = reqModel?.trim() || '';

  // Fallback chain: user key → server env vars
  if (!apiKey) {
    const defaultGemini = process.env.DEFAULT_GEMINI_KEY || process.env.GEMINI_API_KEY;
    const defaultClaude  = process.env.ANTHROPIC_API_KEY;
    const defaultOpenAI  = process.env.OPENAI_API_KEY;
    const defaultDeepSeek = process.env.DEEPSEEK_API_KEY;
    const defaultGrok    = process.env.GROK_API_KEY || process.env.XAI_API_KEY;

    // Prefer whatever provider the user requested if we have a key for it
    if (provider === 'Gemini'   && defaultGemini)  { apiKey = defaultGemini; }
    else if (provider === 'Claude'   && defaultClaude)  { apiKey = defaultClaude; }
    else if (provider === 'OpenAI'   && defaultOpenAI)  { apiKey = defaultOpenAI; }
    else if (provider === 'DeepSeek' && defaultDeepSeek){ apiKey = defaultDeepSeek; }
    else if (provider === 'Grok'     && defaultGrok)    { apiKey = defaultGrok; }
    // Final fallback: use whatever server key is available
    else if (defaultGemini)  { provider = 'Gemini';  apiKey = defaultGemini; }
    else if (defaultClaude)  { provider = 'Claude';  apiKey = defaultClaude; }
    else if (defaultOpenAI)  { provider = 'OpenAI';  apiKey = defaultOpenAI; }
    else if (defaultDeepSeek){ provider = 'DeepSeek'; apiKey = defaultDeepSeek; }
    else if (defaultGrok)    { provider = 'Grok';    apiKey = defaultGrok; }
    else {
      return res.status(400).json({
        error: 'No AI API key provided. Configure your key in Settings, or ask your admin to set DEFAULT_GEMINI_KEY / ANTHROPIC_API_KEY.',
      });
    }
  }

  if (!model) {
    model = PROVIDER_DEFAULTS[provider]?.model || 'gemini-2.5-flash';
  }

  // ── Build prompt ───────────────────────────────────────────────────────────
  const { systemPrompt, userPrompt } = buildPrompts(topic.trim(), papers);

  // ── Call the selected provider ─────────────────────────────────────────────
  let rawText = '';
  try {
    if (provider === 'Gemini') {
      rawText = await callGemini(apiKey, model, systemPrompt, userPrompt);
    } else if (provider === 'Claude') {
      rawText = await callClaude(apiKey, model, systemPrompt, userPrompt);
    } else if (provider === 'OpenAI' || provider === 'DeepSeek' || provider === 'Grok') {
      const baseUrl = PROVIDER_DEFAULTS[provider]?.baseUrl!;
      rawText = await callOpenAICompatible(baseUrl, apiKey, model, systemPrompt, userPrompt);
    } else {
      return res.status(400).json({ error: `Unsupported provider: ${provider}` });
    }
  } catch (err) {
    console.error(`[research-synthesise] ${provider} error:`, err);
    return res.status(502).json({ error: `${provider} request failed`, detail: (err as Error).message });
  }

  // ── Parse JSON response ────────────────────────────────────────────────────
  let parsed: { studies?: StudyEntry[]; thematicNarrative?: string; researchGapSummary?: string };
  try {
    const cleanJson = rawText.replace(/```json|```/g, '').trim();
    parsed = JSON.parse(cleanJson);
  } catch {
    // Try extracting the first JSON object from the response
    const match = rawText.match(/\{[\s\S]*\}/);
    if (!match) {
      return res.status(500).json({ error: 'AI returned non-JSON output', raw: rawText.substring(0, 500) });
    }
    try {
      parsed = JSON.parse(match[0]);
    } catch {
      return res.status(500).json({ error: 'Failed to parse AI output as JSON', raw: rawText.substring(0, 500) });
    }
  }

  if (!Array.isArray(parsed.studies) || parsed.studies.length === 0) {
    return res.status(500).json({ error: 'AI returned empty synthesis', raw: rawText.substring(0, 500) });
  }

  // ── Format tables ──────────────────────────────────────────────────────────
  const papersWithFullText = papers.filter(p => p.fullText && p.fullText.length > 200).length;
  const papersWithAbstract = papers.filter(p => !p.fullText && p.abstract && p.abstract.length > 80).length;

  const result: SynthesisResult = {
    studies: parsed.studies,
    annotatedBibliography: formatAnnotatedBib(topic.trim(), parsed.studies),
    empiricalMatrix: formatEmpiricalMatrix(topic.trim(), parsed.studies),
    thematicNarrative: parsed.thematicNarrative || '',
    researchGapSummary: parsed.researchGapSummary || '',
    coverageNote: `Literature review based on ${papers.length} papers: ${papersWithFullText} with full text (high accuracy), ${papersWithAbstract} abstract-only (medium accuracy), ${papers.length - papersWithFullText - papersWithAbstract} title-only (inferred). Upload PDFs from the Library Queue to improve accuracy.`,
    providerUsed: provider,
    modelUsed: model,
  };

  return res.json(result);
}

// ─── Prompt builder ────────────────────────────────────────────────────────────

function buildPrompts(topic: string, papers: PaperInput[]): { systemPrompt: string; userPrompt: string } {
  const MAX_CHARS_PER_PAPER = 3000;

  const papersContext = papers.map((p, idx) => {
    const authorStr = p.authors.length > 2 ? `${p.authors[0]} et al.` : p.authors.join(' & ');
    const source = p.fullText ? 'FULL TEXT' : p.abstract ? 'ABSTRACT ONLY' : 'TITLE ONLY';
    const content = p.fullText
      ? `Full text excerpt:\n"""\n${p.fullText.substring(0, MAX_CHARS_PER_PAPER)}\n"""`
      : p.abstract
      ? `Abstract:\n"""\n${p.abstract}\n"""`
      : `[No text available — infer carefully from title and journal]`;

    return `[PAPER ${idx + 1} — ${source}]
Citation: ${authorStr} (${p.year})
Title: ${p.title}
Journal: ${p.journal}
DOI: ${p.doi || 'N/A'}
Citations: ${p.citationCount}
${content}`;
  }).join('\n\n---\n\n');

  const systemPrompt = `You are a world-class academic research librarian and dissertation writing expert specialising in all research fields.

ACCURACY RULES — strictly follow these:
1. FULL TEXT papers: extract findings verbatim or near-verbatim. Quote actual statistics.
2. ABSTRACT papers: summarise from the abstract only — do not invent data.
3. TITLE ONLY papers: brief inference — mark findings as "[Inferred from title]".
4. NEVER fabricate DOIs, statistics, p-values, sample sizes, or author names.
5. Each study entry must be UNIQUE — no repeated text between entries.
6. Research gaps must be specific to that study's limitation, not generic.

Return ONLY a valid JSON object (no markdown code fences, no backticks). Schema:
{
  "studies": [
    {
      "authorYear": "Surname, F.N. & Surname, F.N. (YEAR)",
      "title": "Exact paper title",
      "journal": "Journal name",
      "doi": "DOI string or null",
      "problemStatement": "To [verb] [what] among [population] in [context].",
      "sampleSize": "N = [number] [population description] or 'Not reported' or '[X] studies (meta-analysis)'",
      "methodology": "Research design; Analysis method/tool",
      "keyFindings": "Specific findings. Include statistics where available in full-text papers.",
      "researchGap": "Specific limitation of this study. Future research should [specific direction].",
      "confidence": "verified | ai-summarised | ai-synthesised"
    }
  ],
  "thematicNarrative": "4–6 paragraph academic narrative: (1) scope and sources of literature reviewed, (2) dominant methodological approaches, (3) key consensus themes and robust findings, (4) contradictions and debates in the literature, (5) research gaps collectively identified, (6) how the current research addresses the gap. Written in formal academic third-person prose.",
  "researchGapSummary": "2–3 paragraph structured gap analysis suitable for Chapter 1 of a dissertation. Synthesises the specific gaps across all reviewed studies, explains why the current study is necessary, and positions the research contribution clearly."
}`;

  const userPrompt = `Research topic: "${topic}"

Papers to synthesise (${papers.length} total):

${papersContext}

Generate the complete literature review synthesis as specified in the system instructions.`;

  return { systemPrompt, userPrompt };
}

// ─── Provider callers (non-streaming — synthesise needs full JSON response) ────

async function callGemini(apiKey: string, model: string, system: string, user: string): Promise<string> {
  const tryVersion = async (version: string) => {
    const url = `https://generativelanguage.googleapis.com/${version}/models/${model}:generateContent?key=${apiKey}`;
    return fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        systemInstruction: { parts: [{ text: system }] },
        contents: [{ role: 'user', parts: [{ text: user }] }],
        generationConfig: { maxOutputTokens: 8192, temperature: 0.3, responseMimeType: 'application/json' },
      }),
      signal: AbortSignal.timeout(120_000),
    });
  };

  let res = await tryVersion('v1');
  if (!res.ok) res = await tryVersion('v1beta');
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error((err as any).error?.message || `Gemini error ${res.status}`);
  }

  const data = await res.json();
  return data.candidates?.[0]?.content?.parts?.[0]?.text || '';
}

async function callClaude(apiKey: string, model: string, system: string, user: string): Promise<string> {
  const res = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
      'content-type': 'application/json',
    },
    body: JSON.stringify({
      model,
      max_tokens: 8000,
      system,
      messages: [{ role: 'user', content: user }],
    }),
    signal: AbortSignal.timeout(120_000),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error((err as any).error?.message || `Claude error ${res.status}`);
  }

  const data = await res.json();
  return data.content?.[0]?.text || '';
}

async function callOpenAICompatible(
  baseUrl: string,
  apiKey: string,
  model: string,
  system: string,
  user: string
): Promise<string> {
  const res = await fetch(`${baseUrl}/chat/completions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model,
      max_tokens: 8000,
      temperature: 0.3,
      response_format: { type: 'json_object' },
      messages: [
        { role: 'system', content: system },
        { role: 'user', content: user },
      ],
    }),
    signal: AbortSignal.timeout(120_000),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error((err as any).error?.message || `API error ${res.status}`);
  }

  const data = await res.json();
  return data.choices?.[0]?.message?.content || '';
}

// ─── Markdown table formatters ─────────────────────────────────────────────────

function c(s: string): string {
  return (s || '').replace(/\|/g, '–').replace(/\n/g, ' ');
}

function formatAnnotatedBib(topic: string, studies: StudyEntry[]): string {
  let md = `### Annotated Bibliography on "${topic}"\n\n`;
  md += `| S/N | Author(s) & Year | Article Title | Problem Statement | Methodology | Findings | Research Gaps |\n`;
  md += `| :---: | :--- | :--- | :--- | :--- | :--- | :--- |\n`;
  studies.forEach((s, i) => {
    md += `| ${i + 1} | **${c(s.authorYear)}** | ${c(s.title)} | ${c(s.problemStatement)} | ${c(s.methodology)} | ${c(s.keyFindings)} | ${c(s.researchGap)} |\n`;
  });
  return md;
}

function formatEmpiricalMatrix(topic: string, studies: StudyEntry[]): string {
  let md = `### Empirical Literature Review Matrix: "${topic}"\n\n`;
  md += `| Author(s) & Year | Sample Size & Population | Methodology & Model | Key Empirical Findings | Research Gap / Limitation |\n`;
  md += `| :--- | :--- | :--- | :--- | :--- |\n`;
  studies.forEach(s => {
    md += `| **${c(s.authorYear)}** *${c(s.title)}* | ${c(s.sampleSize)} | ${c(s.methodology)} | ${c(s.keyFindings)} | ${c(s.researchGap)} |\n`;
  });
  return md;
}
