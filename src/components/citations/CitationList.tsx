import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Trash2, Copy, Check, ExternalLink, Download, BookOpen, 
  Search, Plus, Quote, ArrowRight 
} from "lucide-react";
import { toast } from "sonner";
import { 
  AcademicCitation, 
  CitationStyle, 
  formatInTextCitation, 
  formatReference, 
  getAuthorDisplayList 
} from "@/services/citationEngine";

interface CitationListProps {
  citations: AcademicCitation[];
  selectedStyle: CitationStyle;
  onSelectCitation: (formatted: string) => void;
  onDeleteCitation: (id: string) => void;
}

export function CitationList({ 
  citations, 
  selectedStyle, 
  onSelectCitation, 
  onDeleteCitation 
}: CitationListProps) {
  const [filterQuery, setFilterQuery] = useState("");
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const filtered = citations.filter(c => {
    const q = filterQuery.toLowerCase();
    const titleMatch = (c.title || '').toLowerCase().includes(q);
    const authorMatch = (c.authors || []).some(a => (a.name || a.family || '').toLowerCase().includes(q));
    const sourceMatch = (c.source || '').toLowerCase().includes(q);
    return titleMatch || authorMatch || sourceMatch;
  });

  const handleCopyCitation = (citation: AcademicCitation) => {
    const formatted = formatReference(citation, selectedStyle);
    navigator.clipboard.writeText(formatted);
    setCopiedId(citation.id);
    toast.success(`Copied ${selectedStyle} formatted reference`);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleInsertInText = (citation: AcademicCitation, mode: 'parenthetical' | 'narrative') => {
    const formatted = formatInTextCitation(citation, selectedStyle, mode);
    onSelectCitation(formatted);
    toast.success(`Inserted ${mode} citation: ${formatted}`);
  };

  const handleInsertFull = (citation: AcademicCitation) => {
    const formatted = formatReference(citation, selectedStyle);
    onSelectCitation(formatted);
    toast.success(`Inserted full reference into editor`);
  };

  if (citations.length === 0) {
    return (
      <div className="p-8 text-center border border-dashed border-zinc-300 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 font-sans space-y-2">
        <BookOpen className="w-8 h-8 mx-auto text-zinc-400" />
        <h4 className="font-mono text-xs font-bold uppercase text-black dark:text-white">
          Citation Library is Empty
        </h4>
        <p className="text-[11px] text-zinc-500 font-sans max-w-sm mx-auto">
          Search over 350M+ papers across Crossref &amp; OpenAlex, import your Zotero .bib file, or add citations manually.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3 font-sans">
      {/* Filter search bar */}
      {citations.length > 3 && (
        <div className="relative">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-zinc-400" />
          <Input
            placeholder={`Filter ${citations.length} saved references...`}
            value={filterQuery}
            onChange={(e) => setFilterQuery(e.target.value)}
            className="pl-8 h-8 text-[11px] font-mono rounded-none border-zinc-300 dark:border-zinc-800 bg-white dark:bg-black"
          />
        </div>
      )}

      <div className="space-y-2.5 max-h-[440px] overflow-y-auto pr-1">
        {filtered.map((citation) => {
          const authors = getAuthorDisplayList(citation.authors).slice(0, 2).join(', ') + (citation.authors.length > 2 ? ' et al.' : '');
          const parenthetical = formatInTextCitation(citation, selectedStyle, 'parenthetical');
          const narrative = formatInTextCitation(citation, selectedStyle, 'narrative');
          const formattedRef = formatReference(citation, selectedStyle);

          return (
            <div 
              key={citation.id} 
              className="p-3.5 border border-black dark:border-zinc-800 bg-white dark:bg-black space-y-2.5 hover:border-zinc-500 transition-colors"
            >
              {/* Header */}
              <div className="flex items-start justify-between gap-2">
                <div>
                  <span className="mono-badge text-[9px] uppercase tracking-wider mb-1 inline-block">
                    {citation.type} · {citation.year}
                  </span>
                  <h5 className="font-bold text-xs text-black dark:text-white leading-snug">
                    {citation.title}
                  </h5>
                </div>

                <div className="flex items-center gap-1 shrink-0">
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => handleCopyCitation(citation)}
                    className="h-7 w-7 p-0 rounded-none text-zinc-500 hover:text-black dark:hover:text-white"
                    title="Copy Formatted Reference"
                  >
                    {copiedId === citation.id ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => onDeleteCitation(citation.id)}
                    className="h-7 w-7 p-0 rounded-none text-zinc-400 hover:text-red-600"
                    title="Delete Citation"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </Button>
                </div>
              </div>

              {/* Author & Source */}
              <div className="text-[11px] text-zinc-600 dark:text-zinc-400 font-mono">
                <span>{authors}</span>
                {citation.source && <span className="italic"> · {citation.source}</span>}
              </div>

              {/* Formatted Reference Preview */}
              <div className="p-2 border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 font-serif text-[11px] text-zinc-800 dark:text-zinc-200 leading-relaxed">
                {formattedRef}
              </div>

              {/* Insertion Actions Toolbar */}
              <div className="flex flex-wrap items-center justify-between gap-1.5 pt-1 border-t border-zinc-100 dark:border-zinc-900 font-mono text-[10px]">
                <div className="flex items-center gap-1">
                  <span className="text-zinc-400 uppercase text-[9px] mr-1">Insert:</span>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleInsertInText(citation, 'parenthetical')}
                    className="h-6 px-2 text-[10px] rounded-none border-black dark:border-zinc-700 hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black"
                  >
                    {parenthetical}
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleInsertInText(citation, 'narrative')}
                    className="h-6 px-2 text-[10px] rounded-none border-black dark:border-zinc-700 hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black"
                  >
                    {narrative}
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleInsertFull(citation)}
                    className="h-6 px-2 text-[10px] rounded-none border-black dark:border-zinc-700"
                  >
                    Full Entry
                  </Button>
                </div>

                {citation.doi && (
                  <a
                    href={`https://doi.org/${citation.doi}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-zinc-500 hover:text-black dark:hover:text-white flex items-center gap-0.5"
                  >
                    DOI <ExternalLink className="w-2.5 h-2.5" />
                  </a>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
