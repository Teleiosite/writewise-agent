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

// ─── Export DOCX (with real Word tables) ─────────────────────────────────────

export async function exportToDocx(
  title: string,
  narrative: string,
  syntax: string
): Promise<void> {
  const {
    Document, Paragraph, TextRun, HeadingLevel, Packer,
    Table, TableRow, TableCell, WidthType, BorderStyle,
    AlignmentType, ShadingType,
  } = await import('docx');

  // ── Parse markdown into docx children ──────────────────────────────────────
  function parseBold(text: string): TextRun[] {
    const parts = text.split(/(\*\*[^*]+\*\*)/g);
    return parts.map(p => {
      if (p.startsWith('**') && p.endsWith('**')) {
        return new TextRun({ text: p.slice(2, -2), bold: true, font: 'Times New Roman', size: 24 });
      }
      return new TextRun({ text: p.replace(/\*/g, ''), font: 'Times New Roman', size: 24 });
    });
  }

  function isTableRow(line: string) {
    return line.trim().startsWith('|');
  }
  function isSeparatorRow(line: string) {
    return /^\|[\s\-:|]+\|/.test(line.trim());
  }
  function parseTableLine(line: string): string[] {
    return line.split('|').map(c => c.trim()).filter((_, i, a) => i !== 0 && i !== a.length - 1);
  }

  function buildWordTable(lines: string[]): Table {
    const nonSep = lines.filter(l => !isSeparatorRow(l));
    const headers = parseTableLine(nonSep[0]);
    const rows = nonSep.slice(1).map(parseTableLine);
    const colCount = headers.length;
    const colWidth = Math.floor(9000 / colCount);

    const apaBorder = { style: BorderStyle.SINGLE, size: 6, color: '1e40af' };
    const noBorder  = { style: BorderStyle.NONE, size: 0, color: 'FFFFFF' };

    const headerRow = new TableRow({
      tableHeader: true,
      children: headers.map(h => new TableCell({
        width: { size: colWidth, type: WidthType.DXA },
        shading: { type: ShadingType.SOLID, color: 'EFF6FF' },
        borders: { top: apaBorder, bottom: apaBorder, left: noBorder, right: noBorder },
        children: [new Paragraph({
          children: [new TextRun({ text: h, bold: true, font: 'Times New Roman', size: 22 })],
          alignment: AlignmentType.LEFT,
        })],
      })),
    });

    const dataRows = rows.map((cells, ri) => new TableRow({
      children: cells.map(cell => new TableCell({
        width: { size: colWidth, type: WidthType.DXA },
        borders: {
          top: noBorder,
          bottom: ri === rows.length - 1 ? apaBorder : { style: BorderStyle.SINGLE, size: 2, color: 'e2e8f0' },
          left: noBorder,
          right: noBorder,
        },
        children: [new Paragraph({
          children: [new TextRun({ text: cell, font: 'Times New Roman', size: 22 })],
        })],
      })),
    }));

    return new Table({
      width: { size: 9000, type: WidthType.DXA },
      rows: [headerRow, ...dataRows],
    });
  }

  const children: (Paragraph | Table)[] = [];
  const lines = narrative.split('\n');
  let i = 0;

  // Title
  children.push(new Paragraph({
    text: title,
    heading: HeadingLevel.TITLE,
    alignment: AlignmentType.CENTER,
  }));

  while (i < lines.length) {
    const line = lines[i];

    // Collect markdown table block
    if (isTableRow(line) && lines[i + 1] && isSeparatorRow(lines[i + 1])) {
      const tableLines: string[] = [];
      while (i < lines.length && isTableRow(lines[i])) {
        tableLines.push(lines[i]);
        i++;
      }
      children.push(buildWordTable(tableLines));
      // Small gap after table
      children.push(new Paragraph({ text: '' }));
      continue;
    }

    // CHAPTER headings (all-caps)
    if (/^CHAPTER\s+(FOUR|FIVE)/i.test(line.trim())) {
      children.push(new Paragraph({
        children: [new TextRun({ text: line.trim(), bold: true, font: 'Times New Roman', size: 28, allCaps: true })],
        heading: HeadingLevel.HEADING_1,
        alignment: AlignmentType.CENTER,
        spacing: { before: 400, after: 200 },
      }));
    } else if (line.startsWith('# ')) {
      children.push(new Paragraph({
        text: line.slice(2),
        heading: HeadingLevel.HEADING_1,
        alignment: AlignmentType.CENTER,
      }));
    } else if (line.startsWith('## ') || /^\d+\.\d+\s+\S/.test(line)) {
      children.push(new Paragraph({
        text: line.replace(/^##\s*/, ''),
        heading: HeadingLevel.HEADING_2,
        spacing: { before: 300, after: 120 },
      }));
    } else if (line.startsWith('### ') || /^\d+\.\d+\.\d+\s+\S/.test(line)) {
      children.push(new Paragraph({
        text: line.replace(/^###\s*/, ''),
        heading: HeadingLevel.HEADING_3,
        spacing: { before: 200, after: 100 },
      }));
    } else if (line.trim() === '') {
      children.push(new Paragraph({ text: '', spacing: { after: 120 } }));
    } else {
      children.push(new Paragraph({
        children: parseBold(line),
        alignment: AlignmentType.BOTH,
        spacing: { after: 160, line: 360 }, // double-spaced
      }));
    }
    i++;
  }

  // SPSS Syntax appendix
  if (syntax) {
    children.push(new Paragraph({ text: '', spacing: { before: 400 } }));
    children.push(new Paragraph({
      text: 'APPENDIX: SPSS SYNTAX',
      heading: HeadingLevel.HEADING_1,
      alignment: AlignmentType.CENTER,
    }));
    syntax.split('\n').forEach(line => {
      children.push(new Paragraph({
        children: [new TextRun({ text: line, font: 'Courier New', size: 18 })],
      }));
    });
  }

  const doc = new Document({
    styles: {
      default: {
        document: { run: { font: 'Times New Roman', size: 24 } },
      },
    },
    sections: [{
      properties: {
        page: {
          margin: { top: 1440, bottom: 1440, left: 1800, right: 1440 }, // 1-inch margins
        },
      },
      children,
    }],
  });

  const blob = await Packer.toBlob(doc);
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${title.replace(/[^a-z0-9]/gi, '_')}_chapter4_5.docx`;
  a.click();
  URL.revokeObjectURL(url);
}

