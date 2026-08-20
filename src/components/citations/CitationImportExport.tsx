import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { 
  Upload, Download, FileText, CheckCircle2, Copy, Check, 
  FolderArchive, ArrowRight, Sparkles 
} from "lucide-react";
import { toast } from "sonner";
import { 
  AcademicCitation, 
  exportToBibTeX, 
  parseBibTeX, 
  exportToRIS, 
  parseRIS, 
  CitationStyle, 
  generateCompleteBibliography 
} from "@/services/citationEngine";

interface CitationImportExportProps {
  citations: AcademicCitation[];
  onImportCitations: (newCitations: AcademicCitation[]) => void;
  currentStyle: CitationStyle;
}

export function CitationImportExport({ citations, onImportCitations, currentStyle }: CitationImportExportProps) {
  const [pasteText, setPasteText] = useState("");
  const [copiedFormat, setCopiedFormat] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // File Upload Handler
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      if (!content) return;

      const isBib = file.name.endsWith('.bib') || content.includes('@article') || content.includes('@book') || content.includes('@misc');
      let parsed: AcademicCitation[] = [];

      if (isBib) {
        parsed = parseBibTeX(content);
      } else {
        parsed = parseRIS(content);
      }

      if (parsed.length > 0) {
        onImportCitations(parsed);
        toast.success(`Successfully imported ${parsed.length} references from ${file.name}`);
      } else {
        toast.error("Could not parse file. Ensure it is a valid .bib (BibTeX) or .ris (Zotero/Mendeley) file.");
      }
    };

    reader.readAsText(file);
  };

  // Text Paste Parser
  const handleParsePastedText = () => {
    const text = pasteText.trim();
    if (!text) return;

    let parsed: AcademicCitation[] = [];
    if (text.includes('@') && text.includes('{')) {
      parsed = parseBibTeX(text);
    } else if (text.includes('TY  -') || text.includes('ER  -')) {
      parsed = parseRIS(text);
    } else {
      // Try BibTeX first, then RIS
      parsed = parseBibTeX(text);
      if (parsed.length === 0) parsed = parseRIS(text);
    }

    if (parsed.length > 0) {
      onImportCitations(parsed);
      setPasteText("");
      toast.success(`Imported ${parsed.length} references!`);
    } else {
      toast.error("Could not identify valid BibTeX or RIS format in pasted text.");
    }
  };

  // Download File Utility
  const downloadFile = (content: string, filename: string, type: string) => {
    const blob = new Blob([content], { type });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // Export BibTeX
  const handleExportBibTeX = () => {
    if (citations.length === 0) {
      toast.error("Your library is empty.");
      return;
    }
    const bib = exportToBibTeX(citations);
    downloadFile(bib, `writewise_references_${new Date().toISOString().substring(0, 10)}.bib`, 'text/plain');
    toast.success("Downloaded BibTeX (.bib) file for LaTeX / Overleaf");
  };

  // Export RIS
  const handleExportRIS = () => {
    if (citations.length === 0) {
      toast.error("Your library is empty.");
      return;
    }
    const ris = exportToRIS(citations);
    downloadFile(ris, `writewise_references_${new Date().toISOString().substring(0, 10)}.ris`, 'application/x-research-info-systems');
    toast.success("Downloaded RIS (.ris) file for Zotero / Mendeley / EndNote");
  };

  // Copy Full Formatted Bibliography
  const handleCopyFormatted = () => {
    if (citations.length === 0) {
      toast.error("Your library is empty.");
      return;
    }
    const formatted = generateCompleteBibliography(citations, currentStyle);
    navigator.clipboard.writeText(formatted);
    setCopiedFormat(currentStyle);
    toast.success(`Copied ${citations.length} references in ${currentStyle} format`);
    setTimeout(() => setCopiedFormat(null), 2500);
  };

  return (
    <div className="space-y-6 font-sans">
      {/* Export Options */}
      <div className="p-4 border border-black dark:border-zinc-800 bg-white dark:bg-black space-y-3">
        <div className="flex items-center justify-between">
          <h4 className="text-xs font-mono font-bold uppercase tracking-wider text-black dark:text-white flex items-center gap-1.5">
            <Download className="w-3.5 h-3.5" />
            Export Library ({citations.length} items)
          </h4>
          <span className="mono-badge text-[10px]">Overleaf · Zotero · Mendeley</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-1 font-mono text-xs">
          <Button
            variant="outline"
            onClick={handleExportBibTeX}
            disabled={citations.length === 0}
            className="rounded-none border-black dark:border-zinc-700 h-9 text-[11px] uppercase tracking-wider gap-1.5"
          >
            <FileText className="w-3.5 h-3.5" />
            BibTeX (.bib)
          </Button>

          <Button
            variant="outline"
            onClick={handleExportRIS}
            disabled={citations.length === 0}
            className="rounded-none border-black dark:border-zinc-700 h-9 text-[11px] uppercase tracking-wider gap-1.5"
          >
            <FolderArchive className="w-3.5 h-3.5" />
            Zotero / RIS (.ris)
          </Button>

          <Button
            variant="outline"
            onClick={handleCopyFormatted}
            disabled={citations.length === 0}
            className="rounded-none border-black dark:border-zinc-700 h-9 text-[11px] uppercase tracking-wider gap-1.5"
          >
            {copiedFormat ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
            Copy {currentStyle} List
          </Button>
        </div>
      </div>

      {/* Import via File or Paste */}
      <div className="p-4 border border-black dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 space-y-4">
        <div className="flex items-center justify-between">
          <h4 className="text-xs font-mono font-bold uppercase tracking-wider text-black dark:text-white flex items-center gap-1.5">
            <Upload className="w-3.5 h-3.5" />
            Import Reference File or Text
          </h4>
        </div>

        {/* File Dropzone */}
        <input 
          type="file" 
          ref={fileInputRef} 
          accept=".bib,.ris,.txt" 
          onChange={handleFileUpload} 
          className="hidden" 
        />
        
        <div 
          onClick={() => fileInputRef.current?.click()}
          className="border border-dashed border-zinc-400 dark:border-zinc-700 p-6 text-center cursor-pointer hover:border-black dark:hover:border-white bg-white dark:bg-black transition-colors"
        >
          <Upload className="w-6 h-6 mx-auto mb-2 text-zinc-500" />
          <p className="text-xs font-mono font-bold uppercase text-black dark:text-white">
            Click to upload .bib (BibTeX) or .ris (Zotero / Mendeley) file
          </p>
          <p className="text-[11px] text-zinc-500 font-mono mt-1">
            Instant batch import of your existing reference database
          </p>
        </div>

        {/* Direct Text Paste */}
        <div className="space-y-2">
          <label className="text-[11px] font-mono uppercase font-bold text-zinc-600 dark:text-zinc-400">
            or Paste raw BibTeX (@article...) or RIS (TY  - ...) records:
          </label>
          <Textarea
            placeholder={`@article{smith2024,\n  title={Deep Learning for Academic Research},\n  author={Smith, John and Doe, Jane},\n  journal={Journal of AI Research},\n  year={2024}\n}`}
            value={pasteText}
            onChange={(e) => setPasteText(e.target.value)}
            rows={4}
            className="rounded-none border-black dark:border-zinc-800 font-mono text-xs bg-white dark:bg-black"
          />
          <div className="flex justify-end">
            <Button
              size="sm"
              onClick={handleParsePastedText}
              disabled={!pasteText.trim()}
              className="rounded-none bg-black text-white hover:bg-zinc-800 dark:bg-white dark:text-black dark:hover:bg-zinc-200 font-mono text-xs uppercase tracking-wider"
            >
              Parse &amp; Import Records
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
