import { ComputedStats, CodebookVariable, ResearchContext, AnalysisConfig, DataAnalysis } from '../types/analysis.types';
import { supabase } from '../integrations/supabase/client';

const STATS_API = import.meta.env.VITE_STATS_API_URL || '';

// Rate Limiter / Budget Guard (Max 30 generations per hour per local session)
const MAX_HOURLY_GENERATIONS = 30;

function checkRateLimit(): boolean {
  const now = Date.now();
  const historyKey = 'narrative_gen_history';
  const history: number[] = JSON.parse(localStorage.getItem(historyKey) || '[]');
  const oneHourAgo = now - 60 * 60 * 1000;
  const recentCalls = history.filter(t => t > oneHourAgo);

  if (recentCalls.length >= MAX_HOURLY_GENERATIONS) {
    return false;
  }

  recentCalls.push(now);
  localStorage.setItem(historyKey, JSON.stringify(recentCalls));
  return true;
}

// ─── Compute Statistics (Python Microservice with Circuit Breaker) ──────────

export async function computeStatistics(
  data: Record<string, unknown>[],
  codebook: CodebookVariable[],
  context: ResearchContext,
  config: AnalysisConfig
): Promise<ComputedStats> {
  if (!STATS_API) throw new Error('VITE_STATS_API_URL is not configured. Add it to your .env file.');

  const payload = {
    data,
    codebook,
    context,
    selected_tests: config.mode === 'manual' ? config.selected_tests : [],
  };

  // Circuit Breaker with Retries for Python Cold Starts (3 attempts)
  let lastError: Error = new Error('Unknown error');
  for (let attempt = 1; attempt <= 3; attempt++) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 15000); // 15s per attempt

      const res = await fetch(`${STATS_API}/analyse`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error((err as any).detail || `Statistics engine error: ${res.status}`);
      }

      return await res.json();
    } catch (err: any) {
      lastError = err;
      if (attempt < 3) {
        await new Promise(r => setTimeout(r, attempt * 1000));
      }
    }
  }

  throw new Error(`Python Statistics Engine is unavailable or warming up: ${lastError.message}`);
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

// ─── Parse Excel / CSV Client-side ─────────────────────────────────────────────

export async function parseExcelFile(file: File): Promise<{
  data: Record<string, unknown>[];
  headers: string[];
  n_rows: number;
  n_cols: number;
}> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = async (e) => {
      try {
        const XLSX = await import('xlsx');
        const buffer = e.target?.result;
        const workbook = XLSX.read(buffer, { type: 'binary' });
        const sheetName = workbook.SheetNames[0];
        const sheet = workbook.Sheets[sheetName];
        const jsonData = XLSX.utils.sheet_to_json<Record<string, unknown>>(sheet);

        if (jsonData.length === 0) {
          throw new Error('Spreadsheet appears to be empty.');
        }

        const headers = Object.keys(jsonData[0]);
        resolve({
          data: jsonData,
          headers,
          n_rows: jsonData.length,
          n_cols: headers.length,
        });
      } catch (err: any) {
        reject(err);
      }
    };
    reader.onerror = () => reject(new Error('Failed to read file.'));
    reader.readAsBinaryString(file);
  });
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

// ─── Generate Narrative (SSE Streaming with Rate Limit Check) ─────────────────

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

  if (!checkRateLimit()) {
    throw new Error(`Rate limit exceeded (${MAX_HOURLY_GENERATIONS} generations/hour limit). Please wait a few minutes before starting a new narrative generation.`);
  }

  const res = await fetch('/api/generate-narrative', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ stats, codebook, context, provider, apiKey, model }),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error((err as any).error || 'Narrative generation failed');
  }

  const reader = res.body?.getReader();
  if (!reader) throw new Error('Response body stream unreadable');

  const decoder = new TextDecoder();
  let done = false;

  while (!done) {
    const { value, done: streamDone } = await reader.read();
    done = streamDone;
    if (value) {
      const chunk = decoder.decode(value, { stream: true });
      const lines = chunk.split('\n\n');
      for (const line of lines) {
        if (line.startsWith('data: ')) {
          const text = line.replace(/^data: /, '');
          if (text === '[DONE]') {
            onDone?.();
            return;
          }
          onChunk(text);
        }
      }
    }
  }

  onDone?.();
}

// ─── Export to Real DOCX ──────────────────────────────────────────────────────

export async function exportToDocx(title: string, content: string, syntax?: string): Promise<void> {
  const {
    Document, Packer, Paragraph, TextRun, HeadingLevel, AlignmentType,
    Table, TableRow, TableCell, WidthType, BorderStyle,
  } = await import('docx');

  const children: (Paragraph | Table)[] = [];

  // ── Title page header ─────────────────────────────────────────────────
  children.push(
    new Paragraph({
      text: title || 'Statistical Analysis Report',
      heading: HeadingLevel.TITLE,
      alignment: AlignmentType.CENTER,
      spacing: { after: 400 },
    })
  );

  children.push(
    new Paragraph({
      children: [new TextRun({ text: `Generated by WriteWise · ${new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}`, size: 20, color: '666666' })],
      alignment: AlignmentType.CENTER,
      spacing: { after: 800 },
    })
  );

  // ── Parse narrative markdown → DOCX elements ─────────────────────────
  const lines = content.split('\n');
  let inTable = false;
  let tableRows: string[][] = [];

  const flushTable = () => {
    if (tableRows.length < 2) { tableRows = []; inTable = false; return; }

    // Row 0 = headers, row 1 = separator (skip), rest = data
    const headers = tableRows[0];
    const dataRows = tableRows.slice(2); // skip separator row

    const docxTable = new Table({
      width: { size: 100, type: WidthType.PERCENTAGE },
      rows: [
        // Header row
        new TableRow({
          tableHeader: true,
          children: headers.map(cell =>
            new TableCell({
              children: [new Paragraph({
                children: [new TextRun({ text: cell.trim(), bold: true, size: 20 })],
                alignment: AlignmentType.LEFT,
              })],
              shading: { fill: 'F2F2F2' },
            })
          ),
        }),
        // Data rows
        ...dataRows.map(row =>
          new TableRow({
            children: row.map(cell =>
              new TableCell({
                children: [new Paragraph({
                  children: [new TextRun({ text: cell.trim(), size: 20 })],
                })],
              })
            ),
          })
        ),
      ],
    });

    children.push(docxTable);
    children.push(new Paragraph({ text: '', spacing: { after: 200 } }));
    tableRows = [];
    inTable = false;
  };

  for (const raw of lines) {
    const line = raw.trimEnd();

    // Detect markdown table rows
    if (line.startsWith('|')) {
      inTable = true;
      const cells = line.split('|').slice(1, -1); // strip leading/trailing |
      tableRows.push(cells);
      continue;
    }

    // End of table block
    if (inTable) {
      flushTable();
    }

    // CHAPTER heading (e.g. "CHAPTER FOUR: ...")
    if (/^CHAPTER (ONE|TWO|THREE|FOUR|FIVE|SIX)/i.test(line)) {
      children.push(new Paragraph({
        children: [new TextRun({ text: line, bold: true, allCaps: true, size: 28, font: 'Times New Roman' })],
        heading: HeadingLevel.HEADING_1,
        alignment: AlignmentType.CENTER,
        spacing: { before: 600, after: 200 },
      }));
      continue;
    }

    // Numbered section heading (e.g. "4.1 Introduction")
    if (/^\d+\.\d+\s/.test(line) && line.length < 100) {
      children.push(new Paragraph({
        children: [new TextRun({ text: line, bold: true, size: 24, font: 'Times New Roman' })],
        heading: HeadingLevel.HEADING_2,
        spacing: { before: 400, after: 120 },
      }));
      continue;
    }

    // Sub-section heading (e.g. "4.1.1 Sub-section")
    if (/^\d+\.\d+\.\d+\s/.test(line) && line.length < 100) {
      children.push(new Paragraph({
        children: [new TextRun({ text: line, bold: true, size: 22, font: 'Times New Roman' })],
        heading: HeadingLevel.HEADING_3,
        spacing: { before: 300, after: 100 },
      }));
      continue;
    }

    // Markdown heading fallback (## or ###)
    if (line.startsWith('## ')) {
      children.push(new Paragraph({
        children: [new TextRun({ text: line.slice(3), bold: true, size: 24, font: 'Times New Roman' })],
        heading: HeadingLevel.HEADING_2,
        spacing: { before: 400, after: 120 },
      }));
      continue;
    }

    if (line.startsWith('# ')) {
      children.push(new Paragraph({
        children: [new TextRun({ text: line.slice(2), bold: true, allCaps: true, size: 26, font: 'Times New Roman' })],
        heading: HeadingLevel.HEADING_1,
        spacing: { before: 500, after: 200 },
      }));
      continue;
    }

    // Empty line → paragraph break
    if (line.trim() === '') {
      children.push(new Paragraph({ text: '', spacing: { after: 120 } }));
      continue;
    }

    // Normal paragraph — handle **bold** inline
    const parts = line.split(/(\*\*[^*]+\*\*)/g);
    const runs = parts.map(part => {
      if (part.startsWith('**') && part.endsWith('**')) {
        return new TextRun({ text: part.slice(2, -2), bold: true, size: 24, font: 'Times New Roman' });
      }
      return new TextRun({ text: part, size: 24, font: 'Times New Roman' });
    });

    children.push(new Paragraph({
      children: runs,
      alignment: AlignmentType.JUSTIFIED,
      spacing: { after: 120 },
      indent: { firstLine: 720 }, // 0.5 inch first-line indent (dissertation standard)
    }));
  }

  // Flush any trailing table
  if (inTable) flushTable();

  // ── Appendix: SPSS Syntax ─────────────────────────────────────────────
  if (syntax && syntax.trim()) {
    children.push(new Paragraph({
      children: [new TextRun({ text: 'APPENDIX: SPSS REPRODUCIBILITY SYNTAX', bold: true, allCaps: true, size: 24, font: 'Times New Roman' })],
      heading: HeadingLevel.HEADING_1,
      alignment: AlignmentType.CENTER,
      spacing: { before: 1000, after: 300 },
    }));

    children.push(new Paragraph({
      children: [new TextRun({
        text: 'The following SPSS syntax was generated to reproduce the statistical analyses above. Copy and paste into SPSS Syntax Editor and click Run > All.',
        size: 20,
        italics: true,
        font: 'Times New Roman',
      })],
      spacing: { after: 200 },
    }));

    for (const syntaxLine of syntax.split('\n')) {
      children.push(new Paragraph({
        children: [new TextRun({ text: syntaxLine || ' ', font: 'Courier New', size: 18 })],
        spacing: { after: 0 },
      }));
    }
  }

  // ── Build and download ────────────────────────────────────────────────
  const doc = new Document({
    creator: 'WriteWise Research Platform',
    title: title,
    description: `Chapter 4 & 5 generated by WriteWise on ${new Date().toISOString()}`,
    styles: {
      default: {
        document: {
          run: { font: 'Times New Roman', size: 24 },
        },
      },
    },
    sections: [{ children }],
  });

  const buffer = await Packer.toBlob(doc);
  const url = URL.createObjectURL(buffer);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${(title || 'analysis').toLowerCase().replace(/\s+/g, '_')}_chapters_4_5.docx`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

// ─── Generate SPSS Syntax ──────────────────────────────────────────────────────

export async function generateSpssSyntax(
  codebook: CodebookVariable[],
  config: AnalysisConfig
): Promise<string> {
  const provider = localStorage.getItem('apiProvider')?.trim() ?? 'Gemini';
  const apiKey = localStorage.getItem('apiKey')?.trim() ?? '';
  const model = localStorage.getItem('apiModel')?.trim() ?? '';

  if (!apiKey) throw new Error('No API key configured.');

  const res = await fetch('/api/generate-syntax', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ codebook, config, provider, apiKey, model }),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error((err as any).error || 'Syntax generation failed');
  }

  const data = await res.json();
  return data.syntax;
}

export const generateSyntax = generateSpssSyntax;

// ─── Save Data Analysis to Supabase ────────────────────────────────────────────

export async function saveDataAnalysis(analysis: Partial<DataAnalysis>): Promise<DataAnalysis> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Must be logged in to save analysis');

  const { data, error } = await supabase
    .from('data_analyses')
    .insert([{ ...analysis, user_id: user.id }])
    .select()
    .single();

  if (error) throw new Error(error.message);
  return data as DataAnalysis;
}

export const saveAnalysis = saveDataAnalysis;

// ─── Load Data Analysis by ID ──────────────────────────────────────────────────

export async function getDataAnalysis(id: string): Promise<DataAnalysis> {
  const { data, error } = await supabase
    .from('data_analyses')
    .select('*')
    .eq('id', id)
    .single();

  if (error) throw new Error(error.message);
  return data as DataAnalysis;
}
