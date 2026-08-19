import { useRef, useEffect, useState, useMemo } from 'react';
import { Copy, FileText, CheckCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface NarrativeStreamProps {
  narrative: string;
  isStreaming: boolean;
  onInsertToEditor?: () => void;
}

// ─── Sanitizer to clean up raw escaped tokens or legacy JSON artifacts ─────────

function cleanNarrativeText(raw: string): string {
  if (!raw) return '';
  let text = raw;

  // Handle case where text is wrapped in JSON quotes or contains literal \n
  if (text.startsWith('"') && text.endsWith('"') && text.length > 2) {
    try {
      text = JSON.parse(text);
    } catch {
      text = text.slice(1, -1);
    }
  }

  // If text contains literal escaped newlines "\n", convert them to real newlines
  if (text.includes('\\n')) {
    text = text.replace(/\\n/g, '\n');
  }

  // Remove literal escaped quotes \"
  text = text.replace(/\\"/g, '"');

  // Remove artifact quotes like `"""` or `""`
  text = text.replace(/"""/g, '').replace(/""/g, '');

  return text;
}

// ─── Markdown → APA-Formatted Academic HTML Renderer ──────────────────────────

function renderMarkdown(rawMd: string): string {
  const md = cleanNarrativeText(rawMd);
  const lines = md.split('\n');
  const out: string[] = [];
  let i = 0;

  while (i < lines.length) {
    const line = lines[i].trim();

    // ── Table Title (e.g., Table 4.1: Demographic Characteristics...) ──
    const tableTitleMatch = line.match(/^(Table\s+\d+\.\d+[:.]?\s*)(.*)/i);
    if (tableTitleMatch && lines[i + 1]?.trim().startsWith('|')) {
      out.push(
        `<div class="table-caption">
          <span class="table-number">${inlineFormat(tableTitleMatch[1].trim())}</span>
          <span class="table-title-text">${inlineFormat(tableTitleMatch[2].trim())}</span>
        </div>`
      );
      i++;
      continue;
    }

    // ── Markdown Table Detection ──
    if (line.startsWith('|') && (lines[i + 1]?.trim().startsWith('|') || lines[i + 2]?.trim().startsWith('|'))) {
      const tableLines: string[] = [];
      while (i < lines.length && lines[i].trim().startsWith('|')) {
        tableLines.push(lines[i].trim());
        i++;
      }
      out.push(renderTable(tableLines));
      continue;
    }

    // ── Headings ──
    const h4 = line.match(/^####\s+(.*)/);
    const h3 = line.match(/^###\s+(.*)/);
    const h2 = line.match(/^##\s+(.*)/);
    const h1 = line.match(/^#\s+(.*)/);
    const chapterHead = line.match(/^(CHAPTER\s+(ONE|TWO|THREE|FOUR|FIVE|SIX|\d+).*)$/i);
    const numbered = line.match(/^(\d+\.\d+(?:\.\d+)?)\s+(.+)/);

    if (chapterHead) {
      out.push(`<h1 class="chapter-heading">${inlineFormat(line)}</h1>`);
    } else if (h1) {
      out.push(`<h1 class="chapter-heading">${inlineFormat(h1[1])}</h1>`);
    } else if (h2) {
      out.push(`<h2 class="section-heading">${inlineFormat(h2[1])}</h2>`);
    } else if (h3) {
      out.push(`<h3 class="subsection-heading">${inlineFormat(h3[1])}</h3>`);
    } else if (h4) {
      out.push(`<h4 class="subsubsection-heading">${inlineFormat(h4[1])}</h4>`);
    } else if (numbered && !line.startsWith('|')) {
      const level = (numbered[1].match(/\./g) || []).length;
      const tag = level === 1 ? 'h2' : 'h3';
      const cls = level === 1 ? 'section-heading' : 'subsection-heading';
      out.push(`<${tag} class="${cls}">${inlineFormat(line)}</${tag}>`);
    } else if (line.match(/^[-*]\s+(.*)/)) {
      // Bullet list item
      const content = line.replace(/^[-*]\s+/, '');
      out.push(`<li class="academic-list-item">${inlineFormat(content)}</li>`);
    } else if (line.match(/^\d+\.\s+(.*)/)) {
      // Numbered list item
      const numMatch = line.match(/^(\d+\.)\s+(.*)/);
      if (numMatch) {
        out.push(`<li class="academic-ordered-item"><strong>${numMatch[1]}</strong> ${inlineFormat(numMatch[2])}</li>`);
      } else {
        out.push(`<p class="para">${inlineFormat(line)}</p>`);
      }
    } else if (line === '') {
      out.push('<div class="para-gap"></div>');
    } else {
      out.push(`<p class="para">${inlineFormat(line)}</p>`);
    }

    i++;
  }

  return out.join('\n');
}

function renderTable(lines: string[]): string {
  if (lines.length < 2) return lines.join('\n');

  const parseRow = (line: string) =>
    line
      .split('|')
      .map(c => c.trim())
      .filter((_, idx, arr) => idx !== 0 && idx !== arr.length - 1);

  // Separate header, separator, and data rows
  const headers = parseRow(lines[0]);
  const dataLines = lines.filter((l, idx) => idx !== 0 && !/^\|[\s\-:]+\|$/.test(l.replace(/\s+/g, '')));
  const rows = dataLines.map(parseRow);

  const headerHtml = headers.map(h => `<th>${inlineFormat(h)}</th>`).join('');
  const rowsHtml = rows
    .map(
      row =>
        `<tr>${row
          .map((cell, cIdx) => `<td class="${cIdx === 0 ? 'first-col' : ''}">${inlineFormat(cell)}</td>`)
          .join('')}</tr>`
    )
    .join('\n');

  return `
<div class="table-wrap">
  <table class="apa-table">
    <thead><tr>${headerHtml}</tr></thead>
    <tbody>${rowsHtml}</tbody>
  </table>
</div>`;
}

function inlineFormat(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.+?)\*/g, '<em>$1</em>')
    .replace(/_(.+?)_/g, '<em>$1</em>')
    .replace(/`([^`]+)`/g, '<code class="font-mono text-xs bg-zinc-100 dark:bg-zinc-800 px-1 py-0.5">$1</code>');
}

// ─── Component ────────────────────────────────────────────────────────────────

export function NarrativeStream({ narrative, isStreaming, onInsertToEditor }: NarrativeStreamProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [copied, setCopied] = useState(false);
  const [copiedRich, setCopiedRich] = useState(false);
  const [viewRaw, setViewRaw] = useState(false);

  const cleanedNarrative = useMemo(() => cleanNarrativeText(narrative), [narrative]);
  const wordCount = useMemo(() => cleanedNarrative.trim().split(/\s+/).filter(Boolean).length, [cleanedNarrative]);
  const renderedHtml = useMemo(() => (cleanedNarrative ? renderMarkdown(cleanedNarrative) : ''), [cleanedNarrative]);

  useEffect(() => {
    if (isStreaming && containerRef.current) {
      containerRef.current.scrollTop = containerRef.current.scrollHeight;
    }
  }, [narrative, isStreaming]);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(cleanedNarrative);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleCopyRich = async () => {
    try {
      const html = `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <style>
            body { font-family: 'Times New Roman', Times, serif; font-size: 12pt; line-height: 2.0; color: #000; }
            h1 { font-size: 14pt; text-align: center; text-transform: uppercase; font-weight: bold; margin-top: 24pt; margin-bottom: 12pt; }
            h2 { font-size: 12pt; font-weight: bold; margin-top: 18pt; margin-bottom: 6pt; text-align: left; }
            h3 { font-size: 12pt; font-weight: bold; font-style: italic; margin-top: 14pt; margin-bottom: 4pt; text-align: left; }
            p  { text-align: justify; text-indent: 0.5in; margin: 0 0 12pt; }
            .table-caption { margin-top: 16pt; margin-bottom: 4pt; font-family: 'Times New Roman', serif; font-size: 11pt; }
            .table-number { font-weight: bold; display: block; }
            .table-title-text { font-style: italic; display: block; margin-top: 2pt; margin-bottom: 4pt; }
            table { border-collapse: collapse; width: 100%; margin: 8pt 0 16pt; font-size: 10pt; font-family: 'Times New Roman', serif; }
            th { border-top: 2pt solid #000; border-bottom: 1pt solid #000; padding: 5pt 8pt; text-align: left; font-weight: bold; }
            td { padding: 4pt 8pt; border-bottom: 0.5pt solid #d1d5db; text-align: left; }
            tr:last-child td { border-bottom: 2pt solid #000; }
          </style>
        </head>
        <body>
        ${renderedHtml}
        </body>
        </html>`;

      if (typeof ClipboardItem !== 'undefined') {
        await navigator.clipboard.write([
          new ClipboardItem({ 'text/html': new Blob([html], { type: 'text/html' }) }),
        ]);
      } else {
        const el = document.createElement('div');
        el.innerHTML = html;
        el.style.position = 'fixed';
        el.style.opacity = '0';
        document.body.appendChild(el);
        const range = document.createRange();
        range.selectNode(el);
        window.getSelection()?.removeAllRanges();
        window.getSelection()?.addRange(range);
        document.execCommand('copy');
        document.body.removeChild(el);
      }
      setCopiedRich(true);
      setTimeout(() => setCopiedRich(false), 2500);
    } catch {
      handleCopy();
    }
  };

  return (
    <div className="flex flex-col h-full min-h-[400px] font-sans">
      {/* Toolbar */}
      <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
        <div className="flex items-center gap-2">
          <span className="text-xs font-mono font-bold uppercase tracking-wider text-black dark:text-white">AI Narrative Stream</span>
          {isStreaming && (
            <span className="mono-badge">
              <span className="w-1.5 h-1.5 bg-black dark:bg-white rounded-full animate-pulse" />
              GENERATING...
            </span>
          )}
          {!isStreaming && cleanedNarrative && (
            <span className="text-xs font-mono text-zinc-500">{wordCount.toLocaleString()} WORDS</span>
          )}
        </div>
        <div className="flex gap-2 flex-wrap font-mono">
          {cleanedNarrative && (
            <>
              <button
                onClick={() => setViewRaw(v => !v)}
                className="text-xs px-2.5 py-1 rounded-none border border-black dark:border-zinc-800 text-black dark:text-white uppercase tracking-wider hover:bg-zinc-100 dark:hover:bg-zinc-900 transition-colors"
              >
                {viewRaw ? 'Rendered View' : 'Raw Markdown'}
              </button>
              <Button variant="outline" size="sm" onClick={handleCopy} className="gap-1.5 text-xs h-8 rounded-none border-black dark:border-zinc-800 font-mono uppercase tracking-wider">
                {copied ? <CheckCheck className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                {copied ? 'Copied!' : 'Copy Plain Text'}
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleCopyRich}
                className="gap-1.5 text-xs h-8 rounded-none border-black dark:border-zinc-800 font-mono uppercase tracking-wider"
                title="Copies with real table formatting — paste directly into Microsoft Word or Google Docs"
              >
                {copiedRich ? <CheckCheck className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                {copiedRich ? 'Copied for Word! ✓' : 'Copy for Word / Docs'}
              </Button>
              {onInsertToEditor && (
                <Button size="sm" onClick={onInsertToEditor} className="gap-1.5 text-xs h-8 bg-black text-white hover:bg-zinc-800 dark:bg-white dark:text-black dark:hover:bg-zinc-200 rounded-none border border-black dark:border-white font-mono uppercase tracking-wider">
                  <FileText className="w-3.5 h-3.5" />
                  Insert into Document
                </Button>
              )}
            </>
          )}
        </div>
      </div>

      {/* Content Canvas */}
      <div
        ref={containerRef}
        className={cn(
          'flex-1 overflow-y-auto rounded-none border border-black dark:border-zinc-800 p-8 sm:p-12 bg-white dark:bg-zinc-950',
          'min-h-[450px] max-h-[800px]',
          !cleanedNarrative && 'flex items-center justify-center'
        )}
      >
        {!cleanedNarrative ? (
          <p className="text-zinc-500 text-center text-xs font-mono uppercase tracking-wider">
            Chapter 4 &amp; 5 narrative will appear here as it streams...
          </p>
        ) : viewRaw ? (
          <pre className="text-xs text-black dark:text-white whitespace-pre-wrap font-mono leading-relaxed">
            {cleanedNarrative}
            {isStreaming && <span className="inline-block w-0.5 h-4 bg-black dark:bg-white ml-0.5 animate-pulse align-middle" />}
          </pre>
        ) : (
          <div className="max-w-4xl mx-auto font-serif">
            <style>{`
              .chapter-heading {
                font-size: 1.25rem;
                font-weight: 800;
                text-transform: uppercase;
                letter-spacing: 0.03em;
                text-align: center;
                margin: 2.5rem 0 1.5rem;
                color: #000;
                font-family: 'Times New Roman', Times, serif;
                line-height: 1.4;
              }
              .dark .chapter-heading { color: #fff; }

              .section-heading {
                font-size: 1.05rem;
                font-weight: 700;
                margin: 2rem 0 0.75rem;
                color: #000;
                font-family: 'Times New Roman', Times, serif;
                border-bottom: 1px solid #e4e4e7;
                padding-bottom: 0.35rem;
              }
              .dark .section-heading { color: #fff; border-color: #27272a; }

              .subsection-heading {
                font-size: 0.95rem;
                font-weight: 700;
                font-style: italic;
                margin: 1.5rem 0 0.5rem;
                color: #18181b;
                font-family: 'Times New Roman', Times, serif;
              }
              .dark .subsection-heading { color: #e4e4e7; }

              .subsubsection-heading {
                font-size: 0.9rem;
                font-weight: 600;
                font-style: italic;
                margin: 1.2rem 0 0.4rem;
                color: #52525b;
                font-family: 'Times New Roman', Times, serif;
              }
              .dark .subsubsection-heading { color: #a1a1aa; }

              .table-caption {
                margin: 2rem 0 0.5rem;
                font-family: 'Times New Roman', Times, serif;
                line-height: 1.4;
              }
              .table-number {
                font-weight: 700;
                font-size: 0.95rem;
                display: block;
                color: #000;
              }
              .dark .table-number { color: #fff; }
              .table-title-text {
                font-style: italic;
                font-size: 0.9rem;
                display: block;
                margin-top: 0.15rem;
                color: #27272a;
              }
              .dark .table-title-text { color: #d4d4d8; }

              .para {
                font-size: 0.95rem;
                line-height: 1.9;
                color: #18181b;
                margin-bottom: 1rem;
                font-family: 'Times New Roman', Times, Georgia, serif;
                text-align: justify;
                text-justify: inter-word;
              }
              .dark .para { color: #e4e4e7; }

              .academic-list-item {
                font-size: 0.95rem;
                line-height: 1.8;
                color: #18181b;
                margin-left: 1.5rem;
                margin-bottom: 0.4rem;
                font-family: 'Times New Roman', Times, serif;
                list-style-type: disc;
              }
              .dark .academic-list-item { color: #e4e4e7; }

              .academic-ordered-item {
                font-size: 0.95rem;
                line-height: 1.8;
                color: #18181b;
                margin-left: 1.5rem;
                margin-bottom: 0.5rem;
                font-family: 'Times New Roman', Times, serif;
              }
              .dark .academic-ordered-item { color: #e4e4e7; }

              .para-gap { height: 0.75rem; }

              .table-wrap {
                margin: 0.5rem 0 2rem;
                overflow-x: auto;
              }
              .apa-table {
                width: 100%;
                border-collapse: collapse;
                font-size: 0.85rem;
                font-family: 'Times New Roman', Times, serif;
                background-color: transparent;
              }
              .apa-table thead tr {
                border-top: 2px solid #000;
                border-bottom: 1px solid #000;
              }
              .dark .apa-table thead tr {
                border-top-color: #fff;
                border-bottom-color: #fff;
              }
              .apa-table th {
                padding: 0.6rem 0.85rem;
                text-align: left;
                font-weight: 700;
                color: #000;
                background: #f8fafc;
                white-space: nowrap;
              }
              .dark .apa-table th { color: #fff; background: #18181b; }
              .apa-table td {
                padding: 0.5rem 0.85rem;
                color: #18181b;
                border-bottom: 1px solid #f1f5f9;
              }
              .dark .apa-table td { color: #e4e4e7; border-color: #27272a; }
              .apa-table td.first-col {
                font-weight: 500;
              }
              .apa-table tbody tr:last-child {
                border-bottom: 2px solid #000;
              }
              .dark .apa-table tbody tr:last-child { border-bottom-color: #fff; }
              .apa-table tbody tr:hover td { background: #f8fafc; }
              .dark .apa-table tbody tr:hover td { background: #18181b; }
            `}</style>
            <div dangerouslySetInnerHTML={{ __html: renderedHtml }} />
            {isStreaming && <span className="inline-block w-0.5 h-4 bg-black dark:bg-white ml-0.5 animate-pulse align-middle" />}
          </div>
        )}
      </div>
    </div>
  );
}
