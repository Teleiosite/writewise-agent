import { useRef, useEffect, useState } from 'react';
import { Copy, FileText, CheckCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface NarrativeStreamProps {
  narrative: string;
  isStreaming: boolean;
  onInsertToEditor?: () => void;
}

// ─── Lightweight Markdown → HTML renderer ─────────────────────────────────────
// Handles: headings, bold, italic, markdown tables, paragraph breaks — no deps.

function renderMarkdown(md: string): string {
  const lines = md.split('\n');
  const out: string[] = [];
  let i = 0;

  while (i < lines.length) {
    const line = lines[i];

    // ── Markdown table detection ──
    // A table block starts with a | line, followed by a |---| separator line
    if (line.trim().startsWith('|') && lines[i + 1]?.trim().startsWith('|') && /\|[\s\-:]+\|/.test(lines[i + 1])) {
      const tableLines: string[] = [];
      while (i < lines.length && lines[i].trim().startsWith('|')) {
        tableLines.push(lines[i]);
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
    // "CHAPTER FOUR:" style all-caps section headers
    const chapterHead = line.match(/^(CHAPTER\s+(FOUR|FIVE|FOUR:|FIVE:).*)$/i);
    // Numbered section "4.1 Title" or "5.2 Title"
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
      const level = (numbered[1].match(/\./g) || []).length; // 1 dot = 4.x, 2 dots = 4.x.x
      const tag = level === 1 ? 'h2' : 'h3';
      const cls = level === 1 ? 'section-heading' : 'subsection-heading';
      out.push(`<${tag} class="${cls}">${inlineFormat(line)}</${tag}>`);
    } else if (line.trim() === '') {
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
    line.split('|').map(c => c.trim()).filter((_, i, arr) => i !== 0 && i !== arr.length - 1);

  const headers = parseRow(lines[0]);
  // lines[1] is the separator — skip it
  const rows = lines.slice(2).map(parseRow);

  const headerHtml = headers.map(h => `<th>${inlineFormat(h)}</th>`).join('');
  const rowsHtml = rows
    .map(row => `<tr>${row.map(cell => `<td>${inlineFormat(cell)}</td>`).join('')}</tr>`)
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
    .replace(/_(.+?)_/g, '<em>$1</em>');
}

// ─── Component ────────────────────────────────────────────────────────────────

export function NarrativeStream({ narrative, isStreaming, onInsertToEditor }: NarrativeStreamProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [copied, setCopied] = useState(false);
  const [viewRaw, setViewRaw] = useState(false);

  // Auto-scroll during streaming
  useEffect(() => {
    if (isStreaming && containerRef.current) {
      containerRef.current.scrollTop = containerRef.current.scrollHeight;
    }
  }, [narrative, isStreaming]);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(narrative);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const wordCount = narrative.trim().split(/\s+/).filter(Boolean).length;
  const renderedHtml = narrative ? renderMarkdown(narrative) : '';

  return (
    <div className="flex flex-col h-full min-h-[400px]">
      {/* Toolbar */}
      <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
        <div className="flex items-center gap-2">
          <span className="text-sm font-semibold text-gray-700 dark:text-gray-200">AI Narrative</span>
          {isStreaming && (
            <span className="flex items-center gap-1.5 text-xs text-blue-600 bg-blue-50 dark:bg-blue-900/20 px-2 py-0.5 rounded-full border border-blue-100">
              <span className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-pulse" />
              Generating...
            </span>
          )}
          {!isStreaming && narrative && (
            <span className="text-xs text-gray-400">{wordCount.toLocaleString()} words</span>
          )}
        </div>
        <div className="flex gap-2 flex-wrap">
          {narrative && (
            <>
              <button
                onClick={() => setViewRaw(v => !v)}
                className="text-xs px-2.5 py-1 rounded-lg border border-gray-200 dark:border-gray-700 text-gray-500 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
              >
                {viewRaw ? 'Rendered View' : 'Raw Markdown'}
              </button>
              <Button variant="outline" size="sm" onClick={handleCopy} className="gap-1.5 text-xs h-8">
                {copied ? <CheckCheck className="w-3.5 h-3.5 text-green-500" /> : <Copy className="w-3.5 h-3.5" />}
                {copied ? 'Copied!' : 'Copy All'}
              </Button>
              {onInsertToEditor && (
                <Button size="sm" onClick={onInsertToEditor} className="gap-1.5 text-xs h-8 bg-blue-600 hover:bg-blue-700 text-white">
                  <FileText className="w-3.5 h-3.5" />
                  Insert into Document
                </Button>
              )}
            </>
          )}
        </div>
      </div>

      {/* Content */}
      <div
        ref={containerRef}
        className={cn(
          'flex-1 overflow-y-auto rounded-xl border border-gray-200 dark:border-gray-700 p-6 bg-white dark:bg-gray-900',
          'min-h-[350px] max-h-[700px]',
          !narrative && 'flex items-center justify-center'
        )}
      >
        {!narrative ? (
          <p className="text-gray-300 dark:text-gray-600 text-center text-sm">
            Chapter 4 &amp; 5 narrative will appear here as it streams...
          </p>
        ) : viewRaw ? (
          // Raw markdown view
          <pre className="text-xs text-gray-600 dark:text-gray-300 whitespace-pre-wrap font-mono leading-relaxed">
            {narrative}
            {isStreaming && <span className="inline-block w-0.5 h-4 bg-blue-500 ml-0.5 animate-pulse align-middle" />}
          </pre>
        ) : (
          // Rendered view
          <>
            <style>{`
              .chapter-heading {
                font-size: 1.15rem;
                font-weight: 800;
                text-transform: uppercase;
                letter-spacing: 0.02em;
                text-align: center;
                margin: 2rem 0 1rem;
                color: #1e293b;
              }
              .dark .chapter-heading { color: #f1f5f9; }

              .section-heading {
                font-size: 1rem;
                font-weight: 700;
                margin: 1.6rem 0 0.5rem;
                color: #1e40af;
                border-bottom: 1px solid #e2e8f0;
                padding-bottom: 0.25rem;
              }
              .dark .section-heading { color: #93c5fd; border-color: #334155; }

              .subsection-heading {
                font-size: 0.9rem;
                font-weight: 700;
                margin: 1.2rem 0 0.4rem;
                color: #374151;
              }
              .dark .subsection-heading { color: #d1d5db; }

              .subsubsection-heading {
                font-size: 0.85rem;
                font-weight: 600;
                font-style: italic;
                margin: 1rem 0 0.3rem;
                color: #6b7280;
              }

              .para {
                font-size: 0.88rem;
                line-height: 1.85;
                color: #374151;
                margin-bottom: 0.6rem;
                font-family: 'Georgia', serif;
                text-align: justify;
              }
              .dark .para { color: #d1d5db; }

              .para-gap { height: 0.4rem; }

              /* APA-style tables */
              .table-wrap {
                margin: 1.2rem 0 1.5rem;
                overflow-x: auto;
              }
              .apa-table {
                width: 100%;
                border-collapse: collapse;
                font-size: 0.8rem;
                font-family: 'Georgia', serif;
              }
              .apa-table thead tr {
                border-top: 2px solid #1e40af;
                border-bottom: 1px solid #1e40af;
              }
              .dark .apa-table thead tr {
                border-top-color: #3b82f6;
                border-bottom-color: #3b82f6;
              }
              .apa-table th {
                padding: 0.5rem 0.75rem;
                text-align: left;
                font-weight: 700;
                color: #1e293b;
                background: #f8fafc;
              }
              .dark .apa-table th { color: #f1f5f9; background: #1e293b; }
              .apa-table td {
                padding: 0.4rem 0.75rem;
                color: #374151;
                border-bottom: 1px solid #f1f5f9;
              }
              .dark .apa-table td { color: #d1d5db; border-color: #1e293b; }
              .apa-table tbody tr:last-child {
                border-bottom: 2px solid #1e40af;
              }
              .dark .apa-table tbody tr:last-child { border-bottom-color: #3b82f6; }
              .apa-table tbody tr:hover td { background: #f0f9ff; }
              .dark .apa-table tbody tr:hover td { background: #0f172a; }
            `}</style>
            <div
              dangerouslySetInnerHTML={{ __html: renderedHtml }}
            />
            {isStreaming && <span className="inline-block w-0.5 h-4 bg-blue-500 ml-0.5 animate-pulse align-middle" />}
          </>
        )}
      </div>
    </div>
  );
}
