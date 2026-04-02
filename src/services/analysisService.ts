import { ComputedStats, CodebookVariable, ResearchContext, AnalysisConfig, DataAnalysis } from '../types/analysis.types';
import { supabase } from '../integrations/supabase/client';

const STATS_API = import.meta.env.VITE_STATS_API_URL || '';

// ─── Compute Statistics (Python Microservice) ─────────────────────────────────

export async function computeStatistics(
  data: Record<string, unknown>[],
  codebook: CodebookVariable[],
  context: ResearchContext,
  config: AnalysisConfig
): Promise<ComputedStats> {
  if (!STATS_API) throw new Error('VITE_STATS_API_URL is not configured. Add it to your .env file.');

  const res = await fetch(`${STATS_API}/analyse`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      data,
      codebook,
      context,
      selected_tests: config.mode === 'manual' ? config.selected_tests : [],
    }),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error((err as any).detail || `Statistics engine error: ${res.status}`);
  }

  return res.json();
}

// ─── Parse SPSS .sav File ─────────────────────────────────────────────────────

export async function parseSavFile(file: File): Promise<{
  data: Record<string, unknown>[];
  headers: string[];
  codebook: CodebookVariable[];
  n_rows: number;
  n_cols: number;
}> {
  if (!STATS_API) throw new Error('VITE_STATS_API_URL is not configured.');

  const formData = new FormData();
  formData.append('file', file);

  const res = await fetch(`${STATS_API}/parse-sav`, {
    method: 'POST',
    body: formData,
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error((err as any).detail || 'Failed to parse .sav file');
  }

  return res.json();
}

// ─── Detect Codebook via AI ───────────────────────────────────────────────────

export async function detectCodebook(
  headers: string[],
  sample: Record<string, unknown>[]
): Promise<CodebookVariable[]> {
  const provider = localStorage.getItem('apiProvider')?.trim() ?? 'Gemini';
  const apiKey = localStorage.getItem('apiKey')?.trim() ?? '';
  const model = localStorage.getItem('apiModel')?.trim() ?? '';

  const res = await fetch('/api/detect-codebook', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ headers, sample: sample.slice(0, 5), provider, apiKey, model }),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error((err as any).error || 'Codebook detection failed');
  }

  return res.json();
}

// ─── Generate Narrative (SSE Streaming) ──────────────────────────────────────

export async function generateNarrative(
  stats: ComputedStats,
  codebook: CodebookVariable[],
  context: ResearchContext,
  onChunk: (text: string) => void,
  onDone?: () => void
): Promise<void> {
  const provider = localStorage.getItem('apiProvider')?.trim() ?? 'Gemini';
  const apiKey = localStorage.getItem('apiKey')?.trim() ?? '';
  const model = localStorage.getItem('apiModel')?.trim() ?? '';

  if (!apiKey) throw new Error('No API key configured. Go to Settings to add your API key.');

  const res = await fetch('/api/generate-narrative', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ stats_json: stats, codebook, context, provider, apiKey, model }),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error((err as any).error || `Narrative generation failed: ${res.status}`);
  }

  const reader = res.body?.getReader();
  const decoder = new TextDecoder();
  if (!reader) return;

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    const chunk = decoder.decode(value);
    const lines = chunk.split('\n');
    for (const line of lines) {
      if (line.startsWith('data: ')) {
        try {
          const text = JSON.parse(line.slice(6));
          if (text) onChunk(text);
        } catch {
          // skip malformed
        }
      }
    }
  }

  onDone?.();
}

// ─── Generate SPSS Syntax ─────────────────────────────────────────────────────

export async function generateSyntax(
  codebook: CodebookVariable[],
  stats: ComputedStats
): Promise<string> {
  const res = await fetch('/api/generate-syntax', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ codebook, stats, tests_run: stats.tests_run }),
  });

  if (!res.ok) throw new Error('Syntax generation failed');
  const data = await res.json() as { syntax: string };
  return data.syntax;
}

// ─── Supabase: Save Analysis ──────────────────────────────────────────────────

export async function saveAnalysis(analysis: Partial<DataAnalysis>): Promise<string> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  const { data, error } = await supabase
    .from('data_analyses')
    .insert({
      user_id: user.id,
      project_id: analysis.project_id || null,
      title: analysis.title || 'Untitled Analysis',
      status: analysis.status || 'complete',
      raw_filename: analysis.raw_filename || '',
      codebook: analysis.codebook || [],
      research_context: analysis.research_context || {},
      analysis_config: analysis.analysis_config || {},
      computed_stats: analysis.computed_stats || {},
      generated_narrative: analysis.generated_narrative || '',
      generated_syntax: analysis.generated_syntax || '',
      ai_model_used: localStorage.getItem('apiModel') || localStorage.getItem('apiProvider') || 'Unknown',
      n_respondents: analysis.n_respondents || 0,
      n_variables: analysis.n_variables || 0,
      tests_run: analysis.computed_stats?.tests_run || [],
    })
    .select('id')
    .single();

  if (error) throw new Error(error.message);
  return data.id;
}

// ─── Supabase: Load Past Analyses ─────────────────────────────────────────────

export async function loadAnalyses(): Promise<DataAnalysis[]> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return [];

  const { data, error } = await supabase
    .from('data_analyses')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })
    .limit(20);

  if (error) throw new Error(error.message);
  return (data || []) as DataAnalysis[];
}

// ─── Client-side Excel/CSV Parsing ───────────────────────────────────────────

export async function parseExcelFile(file: File): Promise<{
  data: Record<string, unknown>[];
  headers: string[];
}> {
  const XLSX = await import('xlsx');
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const content = new Uint8Array(e.target?.result as ArrayBuffer);
        const workbook = XLSX.read(content, { type: 'array' });
        const sheet = workbook.Sheets[workbook.SheetNames[0]];
        const json = XLSX.utils.sheet_to_json<Record<string, unknown>>(sheet);
        const headers = Object.keys(json[0] || {});
        resolve({ data: json, headers });
      } catch (err) {
        reject(new Error('Failed to parse Excel file'));
      }
    };
    reader.onerror = () => reject(new Error('Failed to read file'));
    reader.readAsArrayBuffer(file);
  });
}

// ─── Export DOCX ─────────────────────────────────────────────────────────────

export async function exportToDocx(
  title: string,
  narrative: string,
  syntax: string
): Promise<void> {
  const { Document, Paragraph, TextRun, HeadingLevel, Packer } = await import('docx');

  const narLines = narrative.split('\n').filter(Boolean);
  const children = narLines.map(line => {
    if (line.startsWith('#')) {
      const level = line.match(/^#+/)?.[0].length || 1;
      return new Paragraph({
        text: line.replace(/^#+\s*/, ''),
        heading: level === 1 ? HeadingLevel.HEADING_1 : level === 2 ? HeadingLevel.HEADING_2 : HeadingLevel.HEADING_3,
      });
    }
    return new Paragraph({ children: [new TextRun(line)] });
  });

  if (syntax) {
    children.push(new Paragraph({ text: 'APPENDIX: SPSS Syntax', heading: HeadingLevel.HEADING_1 }));
    syntax.split('\n').forEach(line => {
      children.push(new Paragraph({ children: [new TextRun({ text: line, font: 'Courier New', size: 18 })] }));
    });
  }

  const doc = new Document({
    sections: [{ properties: {}, children }],
  });

  const blob = await Packer.toBlob(doc);
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${title.replace(/[^a-z0-9]/gi, '_')}_analysis.docx`;
  a.click();
  URL.revokeObjectURL(url);
}
