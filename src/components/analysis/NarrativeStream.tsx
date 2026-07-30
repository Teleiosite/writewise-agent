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

function renderMarkdown(md: string): string {
  const lines = md.split('\n');
  const out: string[] = [];
  let i = 0;

  while (i < lines.length) {
    const line = lines[i];

    // ── Markdown table detection ──
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
    const chapterHead = line.match(/^(CHAPTER\s+(FOUR|FIVE|FOUR:|FIVE:).*)$/i);
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

  const [copiedRich, setCopiedRich] = useState(false);
  const handleCopyRich = async () => {
    try {
      const html = `
        <html><body style="font-family: Times New Roman, serif; font-size: 12pt; line-height: 2;">
        <style>
          h1 { font-size: 14pt; text-align: center; text-transform: uppercase; }
          h2 { font-size: 12pt; font-weight: bold; }
          h3 { font-size: 12pt; font-weight: bold; font-style: italic; }
          p  { text-align: justify; margin: 0 0 8pt; }
          table { border-collapse: collapse; width: 100%; margin: 12pt 0; font-size: 11pt; }
          th { border-top: 2px solid #000; border-bottom: 1px solid #000;
               background: #f4f4f5; padding: 4pt 8pt; text-align: left; font-weight: bold; }
          td { padding: 3pt 8pt; border-bottom: 1px solid #e4e4e7; }
          tr:last-child td { border-bottom: 2px solid #000; }
        </style>
        ${renderedHtml}
        </body></html>`;

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

  const wordCount = narrative.trim().split(/\s+/).filter(Boolean).length;
  const renderedHtml = narrative ? renderMarkdown(narrative) : '';

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
          {!isStreaming && narrative && (
            <span className="text-xs font-mono text-zinc-500">{wordCount.toLocaleString()} WORDS</span>
          )}
        </div>
        <div className="flex gap-2 flex-wrap font-mono">
          {narrative && (
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

      {/* Content */}
      <div
        ref={containerRef}
        className={cn(
          'flex-1 overflow-y-auto rounded-none border border-black dark:border-zinc-800 p-6 bg-white dark:bg-black',
          'min-h-[350px] max-h-[700px]',
          !narrative && 'flex items-center justify-center'
        )}
      >
        {!narrative ? (
          <p className="text-zinc-500 text-center text-xs font-mono uppercase tracking-wider">
            Chapter 4 &amp; 5 narrative will appear here as it streams...
          </p>
        ) : viewRaw ? (
          <pre className="text-xs text-black dark:text-white whitespace-pre-wrap font-mono leading-relaxed">
            {narrative}
            {isStreaming && <span className="inline-block w-0.5 h-4 bg-black dark:bg-white ml-0.5 animate-pulse align-middle" />}
          </pre>
        ) : (
          <>
            <style>{`
              .chapter-heading {
                font-size: 1.15rem;
                font-weight: 800;
                text-transform: uppercase;
                letter-spacing: 0.02em;
                text-align: center;
                margin: 2rem 0 1rem;
                color: #000;
              }
              .dark .chapter-heading { color: #fff; }

              .section-heading {
                font-size: 1rem;
                font-weight: 700;
                margin: 1.6rem 0 0.5rem;
                color: #000;
                border-bottom: 1px solid #000;
                padding-bottom: 0.25rem;
              }
              .dark .section-heading { color: #fff; border-color: #27272a; }

              .subsection-heading {
                font-size: 0.9rem;
                font-weight: 700;
                margin: 1.2rem 0 0.4rem;
                color: #18181b;
              }
              .dark .subsection-heading { color: #e4e4e7; }

              .subsubsection-heading {
                font-size: 0.85rem;
                font-weight: 600;
                font-style: italic;
                margin: 1rem 0 0.3rem;
                color: #71717a;
              }

              .para {
                font-size: 0.88rem;
                line-height: 1.85;
                color: #18181b;
                margin-bottom: 0.6rem;
                font-family: 'Georgia', serif;
                text-align: justify;
              }
              .dark .para { color: #e4e4e7; }

              .para-gap { height: 0.4rem; }

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
                border-top: 2px solid #000;
                border-bottom: 1px solid #000;
              }
              .dark .apa-table thead tr {
                border-top-color: #fff;
                border-bottom-color: #fff;
              }
              .apa-table th {
                padding: 0.5rem 0.75rem;
                text-align: left;
                font-weight: 700;
                color: #000;
                background: #f4f4f5;
              }
              .dark .apa-table th { color: #fff; background: #18181b; }
              .apa-table td {
                padding: 0.4rem 0.75rem;
                color: #18181b;
                border-bottom: 1px solid #e4e4e7;
              }
              .dark .apa-table td { color: #e4e4e7; border-color: #27272a; }
              .apa-table tbody tr:last-child {
                border-bottom: 2px solid #000;
              }
              .dark .apa-table tbody tr:last-child { border-bottom-color: #fff; }
              .apa-table tbody tr:hover td { background: #f4f4f5; }
              .dark .apa-table tbody tr:hover td { background: #18181b; }
            `}</style>
            <div
              dangerouslySetInnerHTML={{ __html: renderedHtml }}
            />
            {isStreaming && <span className="inline-block w-0.5 h-4 bg-black dark:bg-white ml-0.5 animate-pulse align-middle" />}
          </>
        )}
      </div>
    </div>
  );
}
